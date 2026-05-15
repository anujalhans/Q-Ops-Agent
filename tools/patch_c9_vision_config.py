from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from textwrap import dedent


DB_PATH = Path(r"C:\Users\anujalhans01\.n8n\database.sqlite")
WORKFLOW_ID = "C9oZfZxpGFakzlB3"
BACKUP_PATH = Path("docs/test_data/extract_images_v2_smoke/workflow_C9oZfZxpGFakzlB3_before_vision_config_patch.json")


EXTRACT_TEXT_AND_IMAGE_URL = "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.documentProcessorV2Url || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.documentProcessorV2Url || $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.documentProcessorUrl || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.documentProcessorUrl || 'http://127.0.0.1:8001/process-document-v2' }}"

SPLIT_IMAGES_CODE = dedent(
    """
    return $input.all().flatMap(item => {
      const data = item.json;
      const images = Array.isArray(data.images) ? data.images : [];

      if (!images.length) {
        return [];
      }

      return images.map((img, index) => ({
        json: {
          projectName: data.projectName,
          status: data.status,
          jobId: data.jobId,
          projectId: data.projectId || null,
          requestedBy: data.requestedBy || null,
          settingsVersion: data.settingsVersion || null,
          configSnapshot: data.configSnapshot || $('When Executed by Another Workflow').first().json.configSnapshot || $('When Executed by Another Workflow').first().json.config_snapshot || {},
          parentFileName: data.fileName,
          imageFileName: img.fileName,
          imageId: img.imageId || `${data.fileName}_${index}`,
          imageIndex: index,
          base64: img.base64,
          pageNumber: img.pageNumber ?? null,
          imageSource: img.imageSource || 'unknown',
          visualReason: Array.isArray(img.visualReason) ? img.visualReason : [],
          priorityScore: Number(img.priorityScore) || 0,
          priorityClass: img.priorityClass || 'medium',
          visualLocator: img.visualLocator || null,
          totalImagesInDocument: images.length
        }
      }));
    });
    """
).strip()

GUARD_CODE = dedent(
    """
    const items = $input.all();

    if (!items.length) {
      return [];
    }

    const clamp = (value, fallback, minimum, maximum) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
    };

    const runtimeConfig = items[0].json.configSnapshot?.microservices?.vision || {};
    const maxImages = clamp(runtimeConfig.maxImagesPerJob, 80, 1, 500);
    const batchSize = clamp(runtimeConfig.batchSize, 5, 1, 50);
    const deferOverflowVisuals = runtimeConfig.deferOverflowVisuals !== false;

    const prioritized = items.slice().sort((left, right) => {
      const scoreDelta = (Number(right.json.priorityScore) || 0) - (Number(left.json.priorityScore) || 0);
      if (scoreDelta !== 0) return scoreDelta;

      const pageDelta = (Number(left.json.pageNumber) || 0) - (Number(right.json.pageNumber) || 0);
      if (pageDelta !== 0) return pageDelta;

      return (Number(left.json.imageIndex) || 0) - (Number(right.json.imageIndex) || 0);
    });

    const retained = prioritized.slice(0, maxImages);
    const deferredCount = Math.max(0, prioritized.length - retained.length);

    if (deferredCount > 0) {
      console.log(`Vision candidate count (${prioritized.length}) exceeds configured limit ${maxImages}. Retaining ${retained.length} candidates and deferring ${deferredCount}.`);
    }

    return retained.map((item, index) => ({
      json: {
        ...item.json,
        totalImagesInDocument: prioritized.length,
        imageLimitApplied: deferredCount > 0,
        processedImagesInJob: retained.length,
        deferredImagesInJob: deferredCount,
        visionMaxImagesPerJob: maxImages,
        visionBatchSize: batchSize,
        deferOverflowVisuals,
        visionProcessingRank: index + 1
      }
    }));
    """
).strip()

REBUILD_CODE = dedent(
    """
    const originalDocs = $items("Extract Text + Image");
    const visionResults = $input.all();

    const visionMap = {};
    let processedImagesInJob = 0;
    let deferredImagesInJob = 0;
    let visionMaxImagesPerJob = 0;
    let visionBatchSize = 5;
    let totalVisionCandidatesInJob = 0;

    for (const item of visionResults) {
      const data = item.json || {};
      if (!data.imageId) {
        continue;
      }

      visionMap[data.imageId] = data;
      processedImagesInJob = Math.max(processedImagesInJob, Number(data.processedImagesInJob) || 0);
      deferredImagesInJob = Math.max(deferredImagesInJob, Number(data.deferredImagesInJob) || 0);
      visionMaxImagesPerJob = Math.max(visionMaxImagesPerJob, Number(data.visionMaxImagesPerJob) || 0);
      visionBatchSize = Math.max(visionBatchSize, Number(data.visionBatchSize) || 0);
      totalVisionCandidatesInJob = Math.max(totalVisionCandidatesInJob, Number(data.totalImagesInDocument) || 0);
    }

    const VISION_INPUT_PER_TOKEN = 0.15 / 1_000_000;
    const VISION_OUTPUT_PER_TOKEN = 0.60 / 1_000_000;

    if (!totalVisionCandidatesInJob) {
      totalVisionCandidatesInJob = originalDocs.reduce((sum, doc) => sum + ((Array.isArray(doc.json.images) ? doc.json.images.length : 0)), 0);
    }

    return originalDocs.map(doc => {
      const data = doc.json;
      const images = Array.isArray(data.images) ? data.images : [];

      if (!images.length) {
        return {
          json: {
            ...data,
            visionTokensInput: 0,
            visionTokensOutput: 0,
            visionTokensTotal: 0,
            visionCostUsd: 0,
            visionUsageEstimated: false,
            totalVisionCandidatesInJob,
            processedImagesInJob: processedImagesInJob || 0,
            deferredImagesInJob: deferredImagesInJob || 0,
            documentProcessedImageCount: 0,
            documentDeferredImageCount: 0,
            visionMaxImagesPerJob: visionMaxImagesPerJob || null,
            visionBatchSize: visionBatchSize || null,
          }
        };
      }

      let visionTokensInput = 0;
      let visionTokensOutput = 0;
      let visionUsageEstimated = false;
      let documentProcessedImageCount = 0;

      const updatedImages = images.map((img, index) => {
        const result = visionMap[img.imageId] || {};
        const imageDescription = result.imageDescription || null;
        const inputTokens = Number(result.visionTokensInput) || 0;
        const outputTokens = Number(result.visionTokensOutput) || 0;
        const totalTokens = Number(result.visionTokensTotal) || 0;
        const estimated = Boolean(result.visionUsageEstimated);

        visionTokensInput += inputTokens;
        visionTokensOutput += outputTokens;
        visionUsageEstimated = visionUsageEstimated || estimated;

        if (imageDescription) {
          documentProcessedImageCount += 1;
        }

        return {
          ...img,
          imageFileName: img.fileName || img.imageFileName || `${data.fileName}_${index}`,
          pageNumber: img.pageNumber ?? result.pageNumber ?? null,
          imageSource: img.imageSource || result.imageSource || 'unknown',
          visualReason: Array.isArray(img.visualReason) ? img.visualReason : (Array.isArray(result.visualReason) ? result.visualReason : []),
          priorityScore: Number(img.priorityScore) || Number(result.priorityScore) || 0,
          priorityClass: img.priorityClass || result.priorityClass || 'medium',
          visualLocator: img.visualLocator || result.visualLocator || null,
          imageDescription,
          visionTokensInput: inputTokens,
          visionTokensOutput: outputTokens,
          visionTokensTotal: totalTokens,
          visionUsageEstimated: estimated,
          visionProcessingRank: Number(result.visionProcessingRank) || null,
          visionProcessed: Boolean(imageDescription)
        };
      });

      const visionCostUsd =
        (visionTokensInput * VISION_INPUT_PER_TOKEN) +
        (visionTokensOutput * VISION_OUTPUT_PER_TOKEN);

      const documentDeferredImageCount = Math.max(0, updatedImages.length - documentProcessedImageCount);

      return {
        json: {
          ...data,
          images: updatedImages,
          visionTokensInput,
          visionTokensOutput,
          visionTokensTotal: visionTokensInput + visionTokensOutput,
          visionCostUsd: Number(visionCostUsd.toFixed(6)),
          visionUsageEstimated,
          totalVisionCandidatesInJob,
          processedImagesInJob: processedImagesInJob || documentProcessedImageCount,
          deferredImagesInJob: deferredImagesInJob || Math.max(0, totalVisionCandidatesInJob - (processedImagesInJob || documentProcessedImageCount)),
          documentProcessedImageCount,
          documentDeferredImageCount,
          visionMaxImagesPerJob: visionMaxImagesPerJob || null,
          visionBatchSize: visionBatchSize || null
        }
      };
    });
    """
).strip()

BUILD_SEMANTIC_CONTENT_CODE = dedent(
    """
    return $input.all().map(item => {
      const d = item.json;

      const safeText = value => String(value ?? '').trim();
      const asArray = value => Array.isArray(value) ? value : [];

      const tables = asArray(d.tables).filter(table => safeText(table.markdown || table.text));
      const images = asArray(d.images);
      const annotations = asArray(d.annotations).filter(annotation =>
        safeText(annotation.content || annotation.title || annotation.subject)
      );
      const links = asArray(d.links).filter(link => safeText(link.uri) || safeText(link.targetPage));
      const warnings = asArray(d.warnings).filter(warning => safeText(warning));
      const extractionStats = d.extractionStats || {};

      const visualCandidatesDetected = Number(d.visualCandidatesDetected ?? extractionStats.visualCandidatesDetected ?? images.length) || 0;
      const processedVisualCandidates = Number(d.processedImagesInJob ?? d.documentProcessedImageCount ?? images.filter(img => img.imageDescription).length) || 0;
      const deferredVisualCandidates = Number(d.deferredImagesInJob ?? d.documentDeferredImageCount ?? Math.max(0, visualCandidatesDetected - processedVisualCandidates)) || 0;

      let combined = '';

      combined += `Project Name: ${d.projectName}\\n`;
      combined += `Document Name: ${d.fileName}\\n`;
      combined += `Document Type: ${d.fileType}\\n\\n`;

      if (d.rawText && d.rawText.trim().length > 0) {
        combined += '===== DOCUMENT TEXT =====\\n';
        combined += d.rawText.trim() + '\\n\\n';
      }

      if (visualCandidatesDetected > 0) {
        combined += '===== VISUAL PROCESSING SUMMARY =====\\n\\n';
        combined += `Detected Visual Candidates: ${visualCandidatesDetected}\\n`;
        combined += `Processed Through Vision: ${processedVisualCandidates}\\n`;
        combined += `Deferred Visual Candidates: ${deferredVisualCandidates}\\n`;
        combined += `Vision Max Images Per Job: ${safeText(d.visionMaxImagesPerJob) || 'n/a'}\\n`;
        combined += `Vision Batch Size: ${safeText(d.visionBatchSize) || 'n/a'}\\n`;
        combined += `Render DPI: ${safeText(d.visionConfigApplied?.renderDpi || extractionStats.renderDpi) || 'n/a'}\\n\\n`;
      }

      if (tables.length > 0) {
        combined += '===== STRUCTURED TABLES =====\\n\\n';

        for (const table of tables) {
          combined += `--- TABLE CONTEXT START ---\\n`;
          combined += `Table ID: ${safeText(table.tableId) || 'unknown'}\\n`;
          combined += `Page Number: ${safeText(table.pageNumber) || 'unknown'}\\n`;
          combined += `Row Count: ${safeText(table.rowCount) || 'unknown'}\\n`;
          combined += `Column Count: ${safeText(table.columnCount) || 'unknown'}\\n`;
          combined += `Source: ${safeText(table.source) || 'table'}\\n\\n`;

          if (safeText(table.markdown)) {
            combined += 'Table Content (Markdown):\\n';
            combined += safeText(table.markdown) + '\\n\\n';
          }

          if (safeText(table.text)) {
            combined += 'Table Content (Plain Text):\\n';
            combined += safeText(table.text) + '\\n\\n';
          }

          combined += `--- TABLE CONTEXT END ---\\n\\n`;
        }
      }

      if (images.length > 0) {
        const validImages = images.filter(img => img.imageDescription);

        if (validImages.length > 0) {
          combined += '===== IMAGE-DERIVED INSIGHTS =====\\n\\n';

          for (const img of validImages) {
            const visualReason = asArray(img.visualReason).filter(Boolean).join(', ');
            combined += `--- IMAGE CONTEXT START ---\\n`;
            combined += `Image Name: ${img.imageFileName || img.fileName}\\n`;
            combined += `Image ID: ${img.imageId}\\n`;
            combined += `Page Number: ${safeText(img.pageNumber) || 'unknown'}\\n`;
            combined += `Image Source: ${safeText(img.imageSource) || 'unknown'}\\n`;
            combined += `Visual Reason: ${visualReason || 'n/a'}\\n`;
            combined += `Visual Locator: ${safeText(img.visualLocator) || 'n/a'}\\n`;
            combined += `Priority Score: ${safeText(img.priorityScore) || '0'}\\n`;
            combined += `Priority Class: ${safeText(img.priorityClass) || 'n/a'}\\n\\n`;
            combined += `Extracted Insights:\\n`;
            combined += img.imageDescription + '\\n\\n';
            combined += `--- IMAGE CONTEXT END ---\\n\\n`;
          }
        }
      }

      if (annotations.length > 0) {
        combined += '===== ANNOTATIONS AND COMMENTS =====\\n\\n';

        for (const annotation of annotations) {
          combined += `--- ANNOTATION CONTEXT START ---\\n`;
          combined += `Annotation ID: ${safeText(annotation.annotationId) || 'unknown'}\\n`;
          combined += `Type: ${safeText(annotation.type) || 'annotation'}\\n`;
          combined += `Page Number: ${safeText(annotation.pageNumber) || 'unknown'}\\n`;
          combined += `Title: ${safeText(annotation.title) || 'n/a'}\\n`;
          combined += `Subject: ${safeText(annotation.subject) || 'n/a'}\\n`;
          combined += `Source: ${safeText(annotation.source) || 'annotation'}\\n\\n`;
          combined += 'Annotation Content:\\n';
          combined += safeText(annotation.content) + '\\n\\n';
          combined += `--- ANNOTATION CONTEXT END ---\\n\\n`;
        }
      }

      if (links.length > 0) {
        combined += '===== LINKS AND CROSS REFERENCES =====\\n\\n';

        for (const link of links) {
          combined += `--- LINK CONTEXT START ---\\n`;
          combined += `Link ID: ${safeText(link.linkId) || 'unknown'}\\n`;
          combined += `Page Number: ${safeText(link.pageNumber) || 'unknown'}\\n`;
          combined += `URI: ${safeText(link.uri) || 'n/a'}\\n`;
          combined += `Target Page: ${safeText(link.targetPage) || 'n/a'}\\n`;
          combined += `Kind: ${safeText(link.kind) || 'n/a'}\\n`;
          combined += `Source: ${safeText(link.source) || 'link'}\\n`;
          combined += `--- LINK CONTEXT END ---\\n\\n`;
        }
      }

      if (warnings.length > 0) {
        combined += '===== EXTRACTION WARNINGS =====\\n\\n';
        for (const warning of warnings) {
          combined += `Warning: ${warning}\\n`;
        }
        combined += '\\n';
      }

      return {
        json: {
          projectName: d.projectName,
          status: d.status,
          jobId: d.jobId,
          fileName: d.fileName,
          fileType: d.fileType,
          pageCount: d.pageCount,
          docType: d.docType,
          documentId: d.documentId,
          contentMode: d.contentMode,
          containsText: d.containsText,
          containsImages: d.containsImages,
          semanticContent: combined.trim(),
          visionTokensInput: Number(d.visionTokensInput) || 0,
          visionTokensOutput: Number(d.visionTokensOutput) || 0,
          visionTokensTotal: Number(d.visionTokensTotal) || 0,
          visionCostUsd: Number(d.visionCostUsd) || 0,
          visionUsageEstimated: Boolean(d.visionUsageEstimated),
          tables,
          annotations,
          links,
          images,
          warnings,
          extractionStats,
          visionConfigApplied: d.visionConfigApplied || {},
          tableCount: tables.length,
          annotationCount: annotations.length,
          linkCount: links.length,
          warningCount: warnings.length,
          renderedPageCount: images.filter(img => safeText(img.imageSource) === 'rendered-page').length,
          embeddedImageCount: images.filter(img => safeText(img.imageSource) === 'embedded-image').length,
          standaloneImageCount: images.filter(img => safeText(img.imageSource) === 'standalone-image').length,
          visualCandidatesDetected,
          processedImagesInJob: processedVisualCandidates,
          deferredImagesInJob: deferredVisualCandidates,
          documentProcessedImageCount: Number(d.documentProcessedImageCount) || images.filter(img => img.imageDescription).length,
          documentDeferredImageCount: Number(d.documentDeferredImageCount) || Math.max(0, images.length - images.filter(img => img.imageDescription).length),
          visionMaxImagesPerJob: Number(d.visionMaxImagesPerJob) || null,
          visionBatchSize: Number(d.visionBatchSize) || null,
          projectId: d.projectId || $('When Executed by Another Workflow').first().json.projectId || $('When Executed by Another Workflow').first().json.project_id || null,
          requestedBy: d.requestedBy || $('When Executed by Another Workflow').first().json.requestedBy || $('When Executed by Another Workflow').first().json.requested_by || null,
          settingsVersion: d.settingsVersion || $('When Executed by Another Workflow').first().json.settingsVersion || $('When Executed by Another Workflow').first().json.settings_version || null,
          configSnapshot: d.configSnapshot || $('When Executed by Another Workflow').first().json.configSnapshot || $('When Executed by Another Workflow').first().json.config_snapshot || {},
          environmentKey: (d.configSnapshot || $('When Executed by Another Workflow').first().json.configSnapshot || $('When Executed by Another Workflow').first().json.config_snapshot || {}).environment?.key || d.environment || 'local'
        }
      };
    });
    """
).strip()

CHUNKING_CODE = dedent(
    """
    return $input.all().flatMap(item => {
      const data = item.json;
      const chunks = [];

      if (!data.semanticContent || typeof data.semanticContent !== "string") return [];

      const text = data.semanticContent
        .replace(/Project Name:.*\\n/, "")
        .replace(/Document Name:.*\\n/, "")
        .replace(/Document Type:.*\\n/, "")
        .replace(/Source Format:.*\\n/, "");

      const lines = text.split(/\\n/g).map(l => l.trim()).filter(l => l);

      let currentSection = [];
      let sectionIndex = 0;
      let sectionTitle = "";

      const chunkSize = 10000;
      const overlap = 2000;
      const minChunkSize = 200;

      const headingRegex = /^(\\d+(\\.\\d+)*\\s+.*|[A-Z]{1,3}-\\d+\\s+.*|[A-Z][A-Za-z\\s]{3,50}:?)$/;

      const safeString = value => String(value ?? '').trim();
      const metadataText = value => safeString(value).replace(/\\s+/g, ' ').slice(0, 500);
      const metadataNumber = value => {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
      };
      const normalizeDocType = value => {
        const text = safeString(value).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        return text || 'UNKNOWN';
      };

      function extractLabelValues(label, input) {
        const values = [];
        const regex = new RegExp(`${label}:\\\\s*(.+)`, 'ig');
        let match;
        while ((match = regex.exec(input)) !== null) {
          const value = safeString(match[1]);
          if (value && value.toLowerCase() !== 'n/a' && !values.includes(value)) {
            values.push(value);
          }
        }
        return values;
      }

      function extractImageId(chunkText) {
        return extractLabelValues('Image ID', chunkText)[0] || null;
      }

      function detectStructuralType(sectionText) {
        if (/TABLE CONTEXT START/i.test(sectionText)) return 'table_context';
        if (/ANNOTATION CONTEXT START/i.test(sectionText)) return 'annotation_context';
        if (/LINK CONTEXT START/i.test(sectionText)) return 'link_context';
        if (/IMAGE CONTEXT START/i.test(sectionText)) return 'image_context';
        return 'logical_section';
      }

      function detectContentSource(sectionText, imageId) {
        const structuralType = detectStructuralType(sectionText);
        const mode = safeString(data.contentMode).toLowerCase();
        if (structuralType === 'table_context') return 'table';
        if (structuralType === 'annotation_context') return 'annotation';
        if (structuralType === 'link_context') return 'link';
        if (structuralType === 'image_context') return 'image';
        if (mode === 'image-only') return 'image';
        if (mode === 'hybrid' && imageId) return 'image';
        return 'text';
      }

      function buildMetadata(sectionText, chunkText, chunkIndex) {
        const imageId = extractImageId(chunkText);
        const contentSource = detectContentSource(chunkText, imageId);
        const structuralType = detectStructuralType(chunkText);
        const docType = normalizeDocType(data.docType || 'UNKNOWN');
        const project = data.projectName || 'unknown';
        const fileName = data.fileName || data.filename || 'unknown';
        const sourceFormat = data.sourceFormat || data.fileType || 'unknown';
        const compositeKey = `${project}|${docType}|${contentSource}`;
        const chunkId = [
          data.documentId || fileName,
          sectionIndex,
          chunkIndex,
          contentSource,
        ].map(value => safeString(value).replace(/[^A-Za-z0-9_-]+/g, '-')).join('|');

        const pageReferences = [
          ...extractLabelValues('Page Number', chunkText),
          ...extractLabelValues('Target Page', chunkText),
        ].filter((value, index, array) => value && array.indexOf(value) === index);
        const tableIds = extractLabelValues('Table ID', chunkText);
        const annotationIds = extractLabelValues('Annotation ID', chunkText);
        const linkIds = extractLabelValues('Link ID', chunkText);
        const linkUris = extractLabelValues('URI', chunkText);
        const imageSources = extractLabelValues('Image Source', chunkText);
        const visualReasons = extractLabelValues('Visual Reason', chunkText);
        const visualLocators = extractLabelValues('Visual Locator', chunkText);

        return {
          project,
          projectId: data.projectId || null,
          requestedBy: data.requestedBy || null,
          settingsVersion: data.settingsVersion || null,
          environment: data.environmentKey || 'local',
          chromaCollection: data.configSnapshot?.chroma?.collection || 'qa-chunks-batches',

          jobId: data.jobId || null,
          status: data.status || null,
          documentId: data.documentId || 'unknown',
          docType,
          documentTypeOriginal: metadataText(data.documentTypeOriginal || ''),
          documentCategory: data.documentCategory || 'unclassified',
          artifactType: data.artifactType || 'unclassified_document',
          metadataConfidence: metadataNumber(data.metadataConfidence),
          metadataSource: data.metadataSource || 'fallback_unknown',

          fileName,
          filename: fileName,
          fileType: data.fileType || 'unknown',
          sourceFormat,
          pageCount: metadataNumber(data.pageCount),

          contentMode: data.contentMode || 'unknown',
          containsImages: Boolean(data.containsImages),
          containsText: Boolean(data.containsText),
          hasVisionContent: /IMAGE-DERIVED INSIGHTS|IMAGE CONTEXT START|Extracted Insights:/i.test(sectionText),

          sectionTitle: sectionTitle || `Section ${sectionIndex}`,
          sectionIndex,
          structuralType,
          chunkIndex,
          chunkId,

          imageId: imageId || null,
          contentSource,
          compositeKey,
          sectionPageReferences: metadataText(pageReferences.join(', ')),
          tableIds: metadataText(tableIds.join(', ')),
          annotationIds: metadataText(annotationIds.join(', ')),
          linkIds: metadataText(linkIds.join(', ')),
          linkUris: metadataText(linkUris.join(', ')),
          imageSources: metadataText(imageSources.join(', ')),
          visualReasons: metadataText(visualReasons.join(', ')),
          visualLocators: metadataText(visualLocators.join(', ')),
          tableCount: metadataNumber(data.tableCount ?? data.tables?.length),
          annotationCount: metadataNumber(data.annotationCount ?? data.annotations?.length),
          linkCount: metadataNumber(data.linkCount ?? data.links?.length),
          warningCount: metadataNumber(data.warningCount ?? data.warnings?.length),
          renderedPageCount: metadataNumber(data.renderedPageCount),
          embeddedImageCount: metadataNumber(data.embeddedImageCount),
          standaloneImageCount: metadataNumber(data.standaloneImageCount),
          visualCandidateCount: metadataNumber(data.visualCandidatesDetected ?? data.extractionStats?.visualCandidatesDetected),
          visionProcessedCount: metadataNumber(data.processedImagesInJob),
          visionDeferredCount: metadataNumber(data.deferredImagesInJob),
          visionMaxImagesPerJob: metadataNumber(data.visionMaxImagesPerJob),
          visionBatchSize: metadataNumber(data.visionBatchSize),
          renderDpi: metadataNumber(data.visionConfigApplied?.renderDpi ?? data.extractionStats?.renderDpi),
        };
      }

      function buildChunks(sectionText) {
        const result = [];

        if (sectionText.length <= chunkSize) {
          if (sectionText.trim().length >= minChunkSize) {
            result.push({
              json: {
                pageContent: sectionText,
                metadata: buildMetadata(sectionText, sectionText, 0),
              },
            });
          }
          return result;
        }

        for (let i = 0; i < sectionText.length; i += (chunkSize - overlap)) {
          const chunkText = sectionText.slice(i, i + chunkSize);
          if (chunkText.trim().length < minChunkSize) break;

          const chunkIndex = Math.floor(i / (chunkSize - overlap));
          result.push({
            json: {
              pageContent: chunkText,
              metadata: buildMetadata(sectionText, chunkText, chunkIndex),
            },
          });
        }

        return result;
      }

      lines.forEach(line => {
        if (headingRegex.test(line)) {
          if (currentSection.length) {
            const sectionText = currentSection.join('\\n').trim();
            if (sectionText) chunks.push(...buildChunks(sectionText));
          }
          sectionIndex++;
          sectionTitle = line;
          currentSection = [line];
        } else {
          currentSection.push(line);
        }
      });

      if (currentSection.length) {
        const sectionText = currentSection.join('\\n').trim();
        if (sectionText) chunks.push(...buildChunks(sectionText));
      }

      return chunks;
    });
    """
).strip()


def ensure_body_parameter(parameters: list[dict], name: str, value: str) -> None:
    for parameter in parameters:
        if parameter.get("name") == name:
            parameter["value"] = value
            return
    parameters.append({"name": name, "value": value})


def main() -> None:
    BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "select nodes, versionId, versionCounter from workflow_entity where id = ?",
        (WORKFLOW_ID,),
    )
    row = cur.fetchone()
    if not row:
        raise RuntimeError(f"Workflow {WORKFLOW_ID} not found")

    nodes_json, version_id, version_counter = row
    BACKUP_PATH.write_text(nodes_json, encoding="utf-8")
    nodes = json.loads(nodes_json)

    for node in nodes:
        name = node.get("name")
        parameters = node.setdefault("parameters", {})

        if name == "Extract Text + Image":
            parameters["url"] = EXTRACT_TEXT_AND_IMAGE_URL
            body_parameters = parameters.setdefault("bodyParameters", {}).setdefault("parameters", [])
            ensure_body_parameter(
                body_parameters,
                "maxImagesPerJob",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxImagesPerJob || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxImagesPerJob || null }}",
            )
            ensure_body_parameter(
                body_parameters,
                "visionBatchSize",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.batchSize || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.batchSize || null }}",
            )
            ensure_body_parameter(
                body_parameters,
                "maxRenderedPagesPerDocument",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxRenderedPagesPerDocument || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxRenderedPagesPerDocument || null }}",
            )
            ensure_body_parameter(
                body_parameters,
                "maxEmbeddedImagesPerDocument",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxEmbeddedImagesPerDocument || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxEmbeddedImagesPerDocument || null }}",
            )
            ensure_body_parameter(
                body_parameters,
                "maxStandaloneImagesPerDocument",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.maxStandaloneImagesPerDocument || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.maxStandaloneImagesPerDocument || null }}",
            )
            ensure_body_parameter(
                body_parameters,
                "visionRenderDpi",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.renderDpi || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.renderDpi || null }}",
            )
            ensure_body_parameter(
                body_parameters,
                "deferOverflowVisuals",
                "={{ $('When Executed by Another Workflow').first().json.configSnapshot?.microservices?.vision?.deferOverflowVisuals || $('When Executed by Another Workflow').first().json.config_snapshot?.microservices?.vision?.deferOverflowVisuals || null }}",
            )
        elif name == "Split images for Vision Extraction":
            parameters["jsCode"] = SPLIT_IMAGES_CODE
        elif name == "Guard: Max Image Limit":
            parameters["jsCode"] = GUARD_CODE
        elif name == "Batch Images for Vision":
            parameters["batchSize"] = "={{ $json.visionBatchSize || $json.configSnapshot?.microservices?.vision?.batchSize || 5 }}"
        elif name == "Rebuild Document With Vision Extracted Text":
            parameters["jsCode"] = REBUILD_CODE
        elif name == "Build Semantic Content":
            parameters["jsCode"] = BUILD_SEMANTIC_CONTENT_CODE
        elif name == "Chunking Raw Data":
            parameters["jsCode"] = CHUNKING_CODE

    updated_nodes = json.dumps(nodes, ensure_ascii=False)
    timestamp = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

    cur.execute(
        "update workflow_entity set nodes = ?, updatedAt = ?, versionCounter = ? where id = ?",
        (updated_nodes, timestamp, int(version_counter or 0) + 1, WORKFLOW_ID),
    )
    cur.execute(
        "update workflow_history set nodes = ?, updatedAt = ? where workflowId = ? and versionId = ?",
        (updated_nodes, timestamp, WORKFLOW_ID, version_id),
    )

    conn.commit()
    conn.close()
    print(f'Patched workflow {WORKFLOW_ID} and wrote backup to {BACKUP_PATH}')


if __name__ == "__main__":
    main()
