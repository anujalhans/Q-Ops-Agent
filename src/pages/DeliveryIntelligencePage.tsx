import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  CircleDot,
  Clock,
  Database,
  GitBranch,
  Layers3,
  Lightbulb,
  Loader2,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import {
  createDeliveryIntelligenceJob,
  fetchDeliveryIntelligenceCatalog,
  fetchDeliveryIntelligenceInsights,
  fetchDeliveryIntelligenceJob,
  searchDeliveryIntelligence,
  submitDeliveryIntelligenceSolutionReview,
  updateDeliveryRecommendationFeedback,
} from '../lib/api'
import type {
  CurrentUser,
  DeliveryIntelligenceCatalogResponse,
  DeliveryIntelligenceInsightsResponse,
  DeliveryIntelligenceJobResponse,
  DeliveryIntelligenceSearchResponse,
  DeliveryIntelligenceSearchResult,
  DeliveryIntelligenceSolutionReviewPayload,
  DeliveryRecommendationFeedbackAction,
} from '../lib/api'

export type DeliveryIntelligenceView =
  | 'di-overview'
  | 'di-profile'
  | 'di-onboarding'
  | 'di-discovery'
  | 'di-solutions'
  | 'di-governance'
  | 'di-similarity'
  | 'di-technologies'
  | 'di-recommendations'
  | 'di-learnings'
  | 'di-relationships'

type ProjectOption = {
  id: string
  name: string
  status?: string
  owner?: string
  tags?: string[]
}

type Props = {
  activeView: DeliveryIntelligenceView
  projects: ProjectOption[]
  currentUser: CurrentUser | null
  addToast: (toast: { title: string; message: string; type: 'success' | 'error' | 'info' }) => void
  onNavigate: (view: DeliveryIntelligenceView) => void
}

type NormalizedDIResult = {
  id: string
  type: string
  title: string
  summary: string
  status: string
  visibility: string
  confidence: number | null
  projectName: string
  category: string
  recommendationType: string
  technologies: string[]
  evidence: any[]
  raw: DeliveryIntelligenceSearchResult
}

const terminalStatuses = new Set(['completed', 'completed_with_warnings', 'failed', 'cancelled'])

const viewMeta: Record<DeliveryIntelligenceView, { label: string; description: string }> = {
  'di-overview': {
    label: 'Delivery Intelligence',
    description: 'Project-scoped SDLC intelligence, reusable assets, recommendations, and learnings.',
  },
  'di-profile': {
    label: 'Project Profile',
    description: 'A synthesized delivery profile built from internal project, QA, and Delivery Intelligence records already present in Q-Ops.',
  },
  'di-onboarding': {
    label: 'Onboarding Guide',
    description: 'A ready-to-use onboarding brief for the selected project with first steps, key evidence, technologies, and solution context.',
  },
  'di-discovery': {
    label: 'Cross-Project Discovery',
    description: 'Search reusable solutions, technologies, recommendations, and learnings across governed project data.',
  },
  'di-solutions': {
    label: 'Solution Marketplace',
    description: 'Discover reusable engineering and QA patterns generated from project intelligence.',
  },
  'di-governance': {
    label: 'Solution Governance',
    description: 'Review, publish, and archive reusable solution candidates without changing the QA Intelligence layer.',
  },
  'di-similarity': {
    label: 'Similarity Explorer',
    description: 'Compare the selected project against other internal projects using technologies, reusable solutions, and learning signals.',
  },
  'di-technologies': {
    label: 'Technology Intelligence',
    description: 'Review detected technologies, confidence, categories, and related reusable patterns.',
  },
  'di-recommendations': {
    label: 'AI Recommendations',
    description: 'Act on reuse, delivery, quality, and technology recommendations with audited feedback.',
  },
  'di-learnings': {
    label: 'Organizational Learnings',
    description: 'Preserve delivery, QA, operational, and architecture lessons found in project context.',
  },
  'di-relationships': {
    label: 'Relationship Explorer',
    description: 'Browse links between projects, technologies, solutions, recommendations, and learnings.',
  },
}

const navItems: Array<{ view: DeliveryIntelligenceView; icon: typeof Network }> = [
  { view: 'di-overview', icon: Brain },
  { view: 'di-profile', icon: Target },
  { view: 'di-onboarding', icon: Bot },
  { view: 'di-discovery', icon: Search },
  { view: 'di-solutions', icon: Layers3 },
  { view: 'di-governance', icon: ShieldCheck },
  { view: 'di-similarity', icon: Users },
  { view: 'di-technologies', icon: Database },
  { view: 'di-recommendations', icon: Sparkles },
  { view: 'di-learnings', icon: Lightbulb },
  { view: 'di-relationships', icon: GitBranch },
]

export default function DeliveryIntelligencePage({ activeView, projects, currentUser, addToast, onNavigate }: Props) {
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [entityFilter, setEntityFilter] = useState('all')
  const [catalogData, setCatalogData] = useState<DeliveryIntelligenceCatalogResponse | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [insightsData, setInsightsData] = useState<DeliveryIntelligenceInsightsResponse | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState('')
  const [searchData, setSearchData] = useState<DeliveryIntelligenceSearchResponse | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [lastJob, setLastJob] = useState<DeliveryIntelligenceJobResponse | null>(null)
  const [pollingJobId, setPollingJobId] = useState('')
  const [queueing, setQueueing] = useState(false)
  const [feedbackBusyId, setFeedbackBusyId] = useState('')
  const [reviewBusyId, setReviewBusyId] = useState('')
  const [selectedResult, setSelectedResult] = useState<NormalizedDIResult | null>(null)

  useEffect(() => {
    if (!selectedProjectId && projects.length) setSelectedProjectId(projects[0].id)
  }, [projects, selectedProjectId])

  const activeProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || projects[0] || null,
    [projects, selectedProjectId],
  )
  const canGovernanceReview = useMemo(() => {
    if (!currentUser || !activeProject) return false
    if (currentUser.role === 'admin') return true
    return (currentUser.projectRoles || []).some((role) => role.projectId === activeProject.id && ['owner', 'editor'].includes(role.role))
  }, [activeProject, currentUser])

  const catalogResults = useMemo(() => normalizeCatalogResults(catalogData), [catalogData])
  const searchResults = useMemo(() => normalizeResults(searchData), [searchData])
  const results = useMemo(() => {
    if (activeView === 'di-discovery' && searchData) return searchResults
    return catalogResults.length ? catalogResults : searchResults
  }, [activeView, catalogResults, searchData, searchResults])
  const filteredResults = useMemo(
    () => results.filter((item) => entityFilter === 'all' || item.type === entityFilter),
    [entityFilter, results],
  )

  const grouped = useMemo(() => ({
    jobs: results.filter((item) => item.type === 'job'),
    solutions: results.filter((item) => item.type === 'solution'),
    technologies: results.filter((item) => item.type === 'technology'),
    recommendations: results.filter((item) => item.type === 'recommendation'),
    learnings: results.filter((item) => item.type === 'learning'),
    relationships: results.filter((item) => item.type === 'relationship'),
  }), [results])

  const insightProfile = insightsData?.profile || null
  const onboardingGuide = insightsData?.onboardingGuide || null
  const similarityMatches = insightsData?.similarityMatches || []
  const governanceSolutions = insightsData?.governance?.solutions || []
  const governanceSummary = insightsData?.governance?.summary || {}
  const recentJobs = useMemo(() => {
    const insightJobs = Array.isArray(insightsData?.jobs)
      ? insightsData.jobs.map((job, index) =>
          normalizeCatalogItem(
            {
              ...job,
              type: 'job',
              title: job.jobId || job.job_id || job.jobType || job.job_type || `DI job ${index + 1}`,
              projectName: activeProject?.name || '',
            },
            index,
          ),
        )
      : []
    return insightJobs.length ? insightJobs : grouped.jobs
  }, [activeProject?.name, grouped.jobs, insightsData?.jobs])

  const metrics = useMemo(() => {
    const output = lastJob?.output || {}
    const profileCounts = insightProfile?.sourceCounts || {}
    const counts = catalogData?.counts || catalogData?.data?.overview || searchData?.counts || {}
    return {
      solutions: readCount(profileCounts, output, ['solutions', 'solution', 'reusableSolutions']) || readCount(counts, output, ['solutions', 'solution', 'reusableSolutions']) || grouped.solutions.length,
      technologies: readCount(profileCounts, output, ['technologies', 'technology', 'projectTechnology', 'projectTechnologies']) || readCount(counts, output, ['technologies', 'technology', 'projectTechnology', 'projectTechnologies']) || grouped.technologies.length,
      recommendations: readCount(profileCounts, output, ['recommendations', 'recommendation']) || readCount(counts, output, ['recommendations', 'recommendation']) || grouped.recommendations.length,
      learnings: readCount(profileCounts, output, ['learnings', 'learning', 'organizationalLearnings']) || readCount(counts, output, ['learnings', 'learning', 'organizationalLearnings']) || grouped.learnings.length,
      relationships: readCount(counts, output, ['relationships', 'relationship']) || grouped.relationships.length,
    }
  }, [catalogData?.counts, catalogData?.data?.overview, grouped, insightProfile?.sourceCounts, lastJob?.output, searchData?.counts])

  const loadCatalog = useCallback(async () => {
    if (!activeProject) return
    setCatalogLoading(true)
    setCatalogError('')
    const data = await fetchDeliveryIntelligenceCatalog({
      entity: 'overview',
      projectId: activeProject.id,
      limit: 200,
    })
    setCatalogLoading(false)
    if (!data?.ok) {
      const message = typeof data?.error === 'string' ? data.error : data?.error?.message
      setCatalogError(message || 'Full Delivery Intelligence catalog API is unavailable. Search fallback is still available.')
      return
    }
    setCatalogData(data)
    if (!lastJob && data.data?.overview?.latestJob) setLastJob(data.data.overview.latestJob as DeliveryIntelligenceJobResponse)
  }, [activeProject, lastJob])

  const loadInsights = useCallback(async () => {
    if (!activeProject) return
    setInsightsLoading(true)
    setInsightsError('')
    const data = await fetchDeliveryIntelligenceInsights({
      projectId: activeProject.id,
      limit: 25,
    })
    setInsightsLoading(false)
    if (!data?.ok) {
      const message = typeof data?.error === 'string' ? data.error : data?.error?.message
      setInsightsError(message || 'Delivery Intelligence insights are not available yet for this project.')
      return
    }
    setInsightsData(data)
  }, [activeProject])

  const runSearch = useCallback(async (queryOverride?: string) => {
    const query = (queryOverride ?? searchQuery).trim()
    if (!query) {
      setSearchError('Enter a search term to discover reusable delivery intelligence.')
      return
    }
    setSearchLoading(true)
    setSearchError('')
    const data = await searchDeliveryIntelligence({
      q: query,
      projectId: activeProject?.id,
      limit: 50,
    })
    setSearchLoading(false)
    if (!data) {
      setSearchError('Delivery Intelligence search is unavailable or returned no usable response.')
      return
    }
    setSearchData(data)
  }, [activeProject?.id, searchQuery])

  useEffect(() => {
    if (!activeProject) return
    const initialQuery = activeProject.name || 'delivery intelligence'
    setSearchQuery((current) => current || initialQuery)
    void loadCatalog()
    void loadInsights()
    void runSearch(initialQuery)
  }, [activeProject?.id, loadCatalog, loadInsights, runSearch])

  useEffect(() => {
    if (!pollingJobId) return
    let cancelled = false
    const poll = async () => {
      const data = await fetchDeliveryIntelligenceJob(pollingJobId)
      if (cancelled || !data) return
      setLastJob(data)
      if (terminalStatuses.has(String(data.status).toLowerCase())) {
        setPollingJobId('')
        const status = String(data.status).toLowerCase()
        if (status === 'completed' || status === 'completed_with_warnings') {
          addToast({
            title: status === 'completed' ? 'Delivery Intelligence completed' : 'Delivery Intelligence completed with warnings',
            message: activeProject ? `Intelligence has been refreshed for ${activeProject.name}.` : 'Intelligence extraction has finished.',
            type: status === 'completed' ? 'success' : 'info',
          })
          const refreshQuery = searchQuery.trim() || activeProject?.name || 'delivery intelligence'
          void loadCatalog()
          void loadInsights()
          void runSearch(refreshQuery)
        } else if (status === 'failed') {
          addToast({ title: 'Delivery Intelligence failed', message: data.error || 'The extraction job failed.', type: 'error' })
        }
      }
    }
    void poll()
    const timer = window.setInterval(poll, 5000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [activeProject, addToast, loadCatalog, loadInsights, pollingJobId, runSearch, searchQuery])

  const startExtraction = async () => {
    if (!activeProject) {
      addToast({ title: 'Select a project', message: 'Delivery Intelligence extraction needs an assigned project.', type: 'error' })
      return
    }
    setQueueing(true)
    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const response = await createDeliveryIntelligenceJob({
        jobType: 'project_intelligence_extract',
        projectId: activeProject.id,
        idempotencyKey: `${activeProject.id}-project_intelligence_extract-${today}`,
        sourceTypes: ['qa_outputs'],
        technologies: [],
        solutions: [],
        learnings: [],
        recommendations: [],
      })
      setLastJob(response)
      setPollingJobId(getJobId(response))
      addToast({
        title: response.existing ? 'Existing extraction found' : 'Delivery Intelligence queued',
        message: `${activeProject.name} is being analyzed by the DI worker.`,
        type: 'info',
      })
    } catch (error) {
      addToast({
        title: 'Could not queue Delivery Intelligence',
        message: error instanceof Error ? error.message : 'The DI queue workflow did not accept the request.',
        type: 'error',
      })
    } finally {
      setQueueing(false)
    }
  }

  const applyFeedback = async (item: NormalizedDIResult, action: DeliveryRecommendationFeedbackAction) => {
    setFeedbackBusyId(item.id)
    const result = await updateDeliveryRecommendationFeedback({
      recommendationId: item.id,
      action,
      feedback: {
        source: 'qops_delivery_intelligence_ui',
        projectId: activeProject?.id,
        actorUserId: currentUser?.id,
      },
    })
    setFeedbackBusyId('')
    if (!result) {
      addToast({ title: 'Feedback was not saved', message: 'The recommendation feedback workflow did not return a success response.', type: 'error' })
      return
    }
    setSearchData((current) => patchRecommendationStatus(current, item.id, action))
    addToast({ title: 'Recommendation updated', message: `Marked as ${action}.`, type: 'success' })
  }

  const applySolutionReview = async (
    solution: { id: string; title: string },
    decision: DeliveryIntelligenceSolutionReviewPayload['decision'],
  ) => {
    if (!activeProject) return
    setReviewBusyId(solution.id)
    const result = await submitDeliveryIntelligenceSolutionReview({
      solutionId: solution.id,
      projectId: activeProject.id,
      decision,
    })
    setReviewBusyId('')
    if (!result?.ok) {
      addToast({
        title: 'Solution governance update failed',
        message: result?.error?.message || 'The Delivery Intelligence solution review workflow is unavailable or not configured yet.',
        type: 'error',
      })
      return
    }
    addToast({
      title: 'Solution governance updated',
      message: `${solution.title} was moved to ${decision.replace(/_/g, ' ')}.`,
      type: 'success',
    })
    void loadCatalog()
    void loadInsights()
  }

  const openGovernanceSolution = (solution: Record<string, any>) => {
    setSelectedResult(normalizeCatalogItem({
      ...solution,
      type: 'solution',
      projectName: activeProject?.name || '',
      visibility: solution.visibility,
      latestReview: solution.latestReview || null,
    }, 0))
  }

  const content = (() => {
    if (!projects.length) {
      return (
        <EmptyPanel
          icon={<ShieldCheck className="h-10 w-10 text-primary" />}
          title="No assigned projects available"
          text="Delivery Intelligence follows the same project access model as the existing QA workspace. Ask an admin to assign a project before running extraction."
        />
      )
    }
    if (activeView === 'di-overview') {
      return (
        <OverviewPanel
          activeProject={activeProject}
          lastJob={lastJob}
          metrics={metrics}
          recommendations={grouped.recommendations}
          solutions={grouped.solutions}
          jobs={recentJobs}
          profile={insightProfile}
          onboardingGuide={onboardingGuide}
          similarityCount={similarityMatches.length}
          governanceSummary={governanceSummary}
          queueing={queueing}
          polling={Boolean(pollingJobId)}
          onExtract={startExtraction}
          onNavigate={onNavigate}
          onOpen={setSelectedResult}
          catalogLoading={catalogLoading}
          catalogError={catalogError}
          insightsLoading={insightsLoading}
          insightsError={insightsError}
          onRefreshCatalog={loadCatalog}
          onRefreshInsights={loadInsights}
        />
      )
    }
    if (activeView === 'di-profile') {
      return (
        <ProjectProfilePanel
          activeProject={activeProject}
          profile={insightProfile}
          loading={insightsLoading}
          error={insightsError}
          onOpen={setSelectedResult}
        />
      )
    }
    if (activeView === 'di-onboarding') {
      return (
        <OnboardingGuidePanel
          guide={onboardingGuide}
          loading={insightsLoading}
          error={insightsError}
        />
      )
    }
    if (activeView === 'di-discovery') {
      return (
        <DiscoveryPanel
          query={searchQuery}
          setQuery={setSearchQuery}
          filter={entityFilter}
          setFilter={setEntityFilter}
          loading={searchLoading}
          error={searchError}
          results={filteredResults}
          onSearch={() => void runSearch()}
          onOpen={setSelectedResult}
        />
      )
    }
    if (activeView === 'di-solutions') {
      return <EntityTable title="Reusable solutions" emptyTitle="No reusable solutions found" items={grouped.solutions} onOpen={setSelectedResult} loading={catalogLoading} />
    }
    if (activeView === 'di-governance') {
      return (
        <GovernancePanel
          summary={governanceSummary}
          solutions={governanceSolutions}
          loading={insightsLoading}
          error={insightsError}
          busyId={reviewBusyId}
          canReview={canGovernanceReview}
          onReview={applySolutionReview}
          onOpen={openGovernanceSolution}
        />
      )
    }
    if (activeView === 'di-similarity') {
      return <SimilarityPanel matches={similarityMatches} loading={insightsLoading} error={insightsError} />
    }
    if (activeView === 'di-technologies') {
      return <EntityTable title="Technology intelligence" emptyTitle="No technologies detected yet" items={grouped.technologies} onOpen={setSelectedResult} loading={catalogLoading} />
    }
    if (activeView === 'di-recommendations') {
      return (
        <RecommendationsPanel
          recommendations={grouped.recommendations}
          busyId={feedbackBusyId}
          onFeedback={applyFeedback}
          onOpen={setSelectedResult}
        />
      )
    }
    if (activeView === 'di-learnings') {
      return <LearningPanel learnings={grouped.learnings} onOpen={setSelectedResult} loading={catalogLoading} />
    }
    return <RelationshipPanel relationships={grouped.relationships} results={results} onOpen={setSelectedResult} loading={catalogLoading} />
  })()

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Delivery Intelligence</p>
          <h3 className="mt-1 text-2xl font-bold text-on-surface">{viewMeta[activeView].label}</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">{viewMeta[activeView].description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="min-w-0 sm:min-w-64">
            <span className="sr-only">Delivery Intelligence project</span>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface outline-none focus:border-primary"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </label>
          <button
            onClick={startExtraction}
            disabled={queueing || Boolean(pollingJobId)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {queueing || pollingJobId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Extract Intelligence
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeView === item.view
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-on-surface'
              }`}
            >
              <Icon className="h-4 w-4" />
              {viewMeta[item.view].label.replace('Delivery Intelligence', 'Overview')}
            </button>
          )
        })}
      </div>

      {content}

      {selectedResult ? <ResultDrawer result={selectedResult} onClose={() => setSelectedResult(null)} /> : null}
    </section>
  )
}

function OverviewPanel({
  activeProject,
  lastJob,
  metrics,
  recommendations,
  solutions,
  jobs,
  profile,
  onboardingGuide,
  similarityCount,
  governanceSummary,
  queueing,
  polling,
  onExtract,
  onNavigate,
  onOpen,
  catalogLoading,
  catalogError,
  insightsLoading,
  insightsError,
  onRefreshCatalog,
  onRefreshInsights,
}: {
  activeProject: ProjectOption | null
  lastJob: DeliveryIntelligenceJobResponse | null
  metrics: Record<string, number>
  recommendations: NormalizedDIResult[]
  solutions: NormalizedDIResult[]
  jobs: NormalizedDIResult[]
  profile: Record<string, any> | null
  onboardingGuide: Record<string, any> | null
  similarityCount: number
  governanceSummary: Record<string, number>
  queueing: boolean
  polling: boolean
  onExtract: () => void
  onNavigate: (view: DeliveryIntelligenceView) => void
  onOpen: (item: NormalizedDIResult) => void
  catalogLoading: boolean
  catalogError: string
  insightsLoading: boolean
  insightsError: string
  onRefreshCatalog: () => void
  onRefreshInsights: () => void
}) {
  const cards = [
    { label: 'Reusable Solutions', value: metrics.solutions, icon: Layers3, view: 'di-solutions' as DeliveryIntelligenceView },
    { label: 'Technologies Detected', value: metrics.technologies, icon: Database, view: 'di-technologies' as DeliveryIntelligenceView },
    { label: 'Active Recommendations', value: metrics.recommendations, icon: Sparkles, view: 'di-recommendations' as DeliveryIntelligenceView },
    { label: 'Learnings Captured', value: metrics.learnings, icon: Lightbulb, view: 'di-learnings' as DeliveryIntelligenceView },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <button key={card.label} onClick={() => onNavigate(card.view)} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-left transition hover:border-primary">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-on-surface-variant" />
              </div>
              <p className="mt-5 text-4xl font-bold text-on-surface">{card.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{card.label}</p>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Intelligence Job</p>
              <h4 className="mt-2 text-xl font-bold text-on-surface">{activeProject?.name || 'Project intelligence'}</h4>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">Run an additive extraction over existing QA outputs to populate the DI tables without changing the QA document workflows.</p>
            </div>
            <JobStatusBadge status={String(lastJob?.status || 'not queued')} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoTile label="Job ID" value={getJobId(lastJob) || 'Not queued'} />
            <InfoTile label="Status" value={String(lastJob?.status || 'Ready')} />
            <InfoTile label="Relationships" value={metrics.relationships} />
          </div>
          {lastJob?.error ? <p className="mt-4 rounded-lg bg-error-container p-3 text-sm font-semibold text-on-error-container">{lastJob.error}</p> : null}
          {catalogError ? <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm font-semibold text-primary">{catalogError}</p> : null}
          {insightsError ? <p className="mt-4 rounded-lg bg-primary/10 p-3 text-sm font-semibold text-primary">{insightsError}</p> : null}
          <button
            onClick={onExtract}
            disabled={queueing || polling}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {queueing || polling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {polling ? 'Extraction running' : 'Refresh Intelligence'}
          </button>
          <button
            onClick={onRefreshCatalog}
            disabled={catalogLoading}
            className="ml-3 mt-5 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container disabled:opacity-60"
          >
            {catalogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reload catalog
          </button>
          <button
            onClick={onRefreshInsights}
            disabled={insightsLoading}
            className="ml-3 mt-5 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container disabled:opacity-60"
          >
            {insightsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reload insights
          </button>
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-on-surface">Top Recommendations</h4>
            <button onClick={() => onNavigate('di-recommendations')} className="text-sm font-bold text-primary">View all</button>
          </div>
          <div className="mt-4 space-y-3">
            {recommendations.slice(0, 3).map((item) => (
              <button key={item.id} onClick={() => onOpen(item)} className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-4 text-left hover:border-primary">
                <p className="font-bold text-on-surface">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{item.summary}</p>
              </button>
            ))}
            {!recommendations.length ? (
              <EmptyPanel icon={<Sparkles className="h-10 w-10 text-primary" />} title="No recommendations yet" text="Run extraction or search project intelligence to populate AI recommendations." compact />
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoTile label="Profile readiness" value={profile ? 'Available' : 'Pending'} />
        <InfoTile label="Onboarding guide" value={onboardingGuide?.title || 'Not generated yet'} />
        <InfoTile label="Similar projects" value={similarityCount} />
      </div>

      {profile ? (
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Project Snapshot</p>
              <h4 className="mt-2 text-lg font-bold text-on-surface">{profile.projectName}</h4>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onNavigate('di-profile')} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container">Open profile</button>
              <button onClick={() => onNavigate('di-onboarding')} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container">Open onboarding</button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Delivery</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{profile.deliverySummary || profile.executiveSummary || 'Delivery summary will appear after intelligence extraction.'}</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Reuse</p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{profile.reuseSummary || profile.recommendationSummary || 'Reuse guidance will appear here once solution candidates are captured.'}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <InfoTile label="Tech footprint" value={Array.isArray(profile.technologies) ? profile.technologies.length : 0} />
            <InfoTile label="Solution candidates" value={Array.isArray(profile.solutionHighlights) ? profile.solutionHighlights.length : 0} />
            <InfoTile label="Learnings" value={Array.isArray(profile.learningHighlights) ? profile.learningHighlights.length : 0} />
            <InfoTile label="Recommendations" value={Array.isArray(profile.recommendationHighlights) ? profile.recommendationHighlights.length : 0} />
          </div>
        </section>
      ) : null}

      <EntityTable title="Recently discovered solutions" emptyTitle="No solution candidates found yet" items={solutions.slice(0, 5)} onOpen={onOpen} compact />
      <EntityTable title="Recent DI jobs" emptyTitle="No Delivery Intelligence jobs found yet" items={jobs.slice(0, 5)} onOpen={onOpen} compact />
    </div>
  )
}

function ProjectProfilePanel({
  activeProject,
  profile,
  loading,
  error,
  onOpen,
}: {
  activeProject: ProjectOption | null
  profile: Record<string, any> | null
  loading: boolean
  error: string
  onOpen: (item: NormalizedDIResult) => void
}) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading project profile" text="Reading the synthesized Delivery Intelligence profile for this project." />
  }
  if (error) {
    return <EmptyPanel icon={<Target className="h-10 w-10 text-primary" />} title="Project profile unavailable" text={error} />
  }
  if (!profile) {
    return <EmptyPanel icon={<Target className="h-10 w-10 text-primary" />} title="Project profile not generated yet" text="Run Delivery Intelligence extraction to generate a project profile from internal delivery and QA signals." />
  }
  const technologies = Array.isArray(profile.technologies) ? profile.technologies : []
  const solutions = Array.isArray(profile.solutionHighlights) ? profile.solutionHighlights : []
  const learnings = Array.isArray(profile.learningHighlights) ? profile.learningHighlights : []
  const recommendations = Array.isArray(profile.recommendationHighlights) ? profile.recommendationHighlights : []
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Project Profile</p>
        <h4 className="mt-2 text-xl font-bold text-on-surface">{profile.projectName || activeProject?.name || 'Selected project'}</h4>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">{profile.executiveSummary || profile.deliverySummary || 'Delivery profile summary is not available yet.'}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="Project status" value={profile.projectStatus || activeProject?.status || 'Unknown'} />
          <InfoTile label="Generation jobs" value={profile.signals?.generationJobsCompleted ?? 0} />
          <InfoTile label="Ingestion jobs" value={profile.signals?.ingestionJobsCompleted ?? 0} />
          <InfoTile label="Last DI job" value={profile.lastIntelligenceJobId || 'Not recorded'} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <SummaryBlock title="Technology Summary" text={profile.technologySummary || 'No technology summary available yet.'} />
        <SummaryBlock title="Recommendation Summary" text={profile.recommendationSummary || 'No recommendation summary available yet.'} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <HighlightList title="Technology Footprint" items={technologies.map((item: any) => ({ title: item.name || item.title || 'Technology', summary: item.category || item.sourceType || 'Detected by DI' }))} />
        <HighlightList title="Reusable Solution Highlights" items={solutions.map((item: any) => ({ title: item.title || 'Solution candidate', summary: item.summary || item.complexity || 'Reusable delivery pattern' }))} onOpen={(item) => onOpen(normalizeCatalogItem({ ...item, type: 'solution', projectName: profile.projectName }, 0))} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <HighlightList title="Learning Highlights" items={learnings.map((item: any) => ({ title: item.title || 'Learning', summary: item.summary || item.reuseRecommendation || 'Organizational learning' }))} />
        <HighlightList title="Recommendation Highlights" items={recommendations.map((item: any) => ({ title: item.title || 'Recommendation', summary: item.summary || item.rationale || 'Suggested next step' }))} />
      </div>
    </div>
  )
}

function OnboardingGuidePanel({
  guide,
  loading,
  error,
}: {
  guide: Record<string, any> | null
  loading: boolean
  error: string
}) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading onboarding guide" text="Preparing the internal-first onboarding view for this project." />
  }
  if (error) {
    return <EmptyPanel icon={<Bot className="h-10 w-10 text-primary" />} title="Onboarding guide unavailable" text={error} />
  }
  if (!guide) {
    return <EmptyPanel icon={<Bot className="h-10 w-10 text-primary" />} title="Onboarding guide not generated yet" text="Run Delivery Intelligence extraction to synthesize an onboarding guide from current internal project knowledge." />
  }
  const firstSteps = Array.isArray(guide.firstSteps) ? guide.firstSteps : []
  const keyAssets = Array.isArray(guide.keyAssets) ? guide.keyAssets : []
  const keyTechnologies = Array.isArray(guide.keyTechnologies) ? guide.keyTechnologies : []
  const solutionShortlist = Array.isArray(guide.solutionShortlist) ? guide.solutionShortlist : []
  const recommendationShortlist = Array.isArray(guide.recommendationShortlist) ? guide.recommendationShortlist : []
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Onboarding Guide</p>
        <h4 className="mt-2 text-xl font-bold text-on-surface">{guide.title}</h4>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">{guide.overview || 'Overview will appear once the onboarding guide is generated.'}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <StringListPanel title="First Steps" items={firstSteps} emptyText="No onboarding first steps were generated yet." />
        <HighlightList title="Key Assets" items={keyAssets.map((item: any) => ({ title: item.documentType || item.title || item.jobId || 'Project evidence', summary: item.status || item.createdAt || 'Internal QA artifact' }))} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <HighlightList title="Key Technologies" items={keyTechnologies.map((item: any) => ({ title: item.name || item.title || 'Technology', summary: item.category || item.sourceType || 'Detected by DI' }))} />
        <HighlightList title="Solution Shortlist" items={solutionShortlist.map((item: any) => ({ title: item.title || 'Solution', summary: item.summary || item.complexity || 'Reusable delivery pattern' }))} />
      </div>

      <HighlightList title="Recommendation Shortlist" items={recommendationShortlist.map((item: any) => ({ title: item.title || 'Recommendation', summary: item.summary || item.rationale || 'Suggested next action' }))} />
    </div>
  )
}

function SimilarityPanel({
  matches,
  loading,
  error,
}: {
  matches: Record<string, any>[]
  loading: boolean
  error: string
}) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading similarity matches" text="Comparing the selected project against other internal projects." />
  }
  if (error) {
    return <EmptyPanel icon={<Users className="h-10 w-10 text-primary" />} title="Similarity data unavailable" text={error} />
  }
  if (!matches.length) {
    return <EmptyPanel icon={<Users className="h-10 w-10 text-primary" />} title="No similar projects detected yet" text="As more internal Delivery Intelligence records accumulate, similar project matches will appear here." />
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {matches.map((match) => (
        <article key={match.id || `${match.projectId}-${match.relatedProjectId}`} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Similar Project</p>
              <h4 className="mt-2 text-lg font-bold text-on-surface">{match.relatedProjectName || match.relatedProjectId}</h4>
            </div>
            <ConfidenceBadge value={normalizeConfidence(match.confidenceScore)} />
          </div>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">{match.rationale || 'This project shares useful internal delivery patterns with the selected project.'}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <InfoTile label="Tech overlaps" value={Array.isArray(match.overlappingTechnologies) ? match.overlappingTechnologies.length : 0} />
            <InfoTile label="Solution overlaps" value={Array.isArray(match.overlappingSolutions) ? match.overlappingSolutions.length : 0} />
            <InfoTile label="Learning overlaps" value={Array.isArray(match.overlappingLearningCategories) ? match.overlappingLearningCategories.length : 0} />
          </div>
        </article>
      ))}
    </div>
  )
}

function GovernancePanel({
  summary,
  solutions,
  loading,
  error,
  busyId,
  canReview,
  onReview,
  onOpen,
}: {
  summary: Record<string, number>
  solutions: Record<string, any>[]
  loading: boolean
  error: string
  busyId: string
  canReview: boolean
  onReview: (solution: { id: string; title: string }, decision: DeliveryIntelligenceSolutionReviewPayload['decision']) => void
  onOpen: (solution: Record<string, any>) => void
}) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading governance workspace" text="Reading reusable solution candidates and their review state." />
  }
  if (error) {
    return <EmptyPanel icon={<ShieldCheck className="h-10 w-10 text-primary" />} title="Governance workspace unavailable" text={error} />
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <InfoTile label="Total solutions" value={summary.totalSolutions ?? 0} />
        <InfoTile label="Drafts" value={summary.drafts ?? 0} />
        <InfoTile label="In review" value={summary.inReview ?? 0} />
        <InfoTile label="Published" value={summary.published ?? 0} />
      </div>
      {!solutions.length ? (
        <EmptyPanel icon={<ShieldCheck className="h-10 w-10 text-primary" />} title="No solution candidates available" text="Run Delivery Intelligence extraction to populate reusable solution candidates for governance." />
      ) : (
        <div className="space-y-3">
          {solutions.map((solution) => (
            <article key={solution.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-bold text-on-surface">{solution.title}</h4>
                    <StatusPill label={solution.status || 'draft'} />
                    <VisibilityPill value={solution.visibility || 'project'} />
                  </div>
                  <p className="text-sm leading-6 text-on-surface-variant">{solution.summary || 'Reusable delivery pattern candidate.'}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-on-surface-variant">
                    <span>Complexity: {solution.implementationComplexity || 'Not scored'}</span>
                    <span>Reviews: {solution.reviewCount || 0}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onOpen(solution)} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container">View</button>
                  {canReview ? (
                    <>
                      <button onClick={() => onReview({ id: solution.id, title: solution.title }, 'review')} disabled={busyId === solution.id} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
                        {busyId === solution.id ? 'Saving' : 'Send to review'}
                      </button>
                      <button onClick={() => onReview({ id: solution.id, title: solution.title }, 'published')} disabled={busyId === solution.id} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container disabled:opacity-60">
                        Publish
                      </button>
                      <button onClick={() => onReview({ id: solution.id, title: solution.title }, 'archived')} disabled={busyId === solution.id} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold text-on-surface hover:bg-surface-container disabled:opacity-60">
                        Archive
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{title}</p>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{text}</p>
    </section>
  )
}

function HighlightList({
  title,
  items,
  onOpen,
}: {
  title: string
  items: Array<{ title: string; summary: string }>
  onOpen?: (item: { title: string; summary: string }) => void
}) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <h4 className="text-lg font-bold text-on-surface">{title}</h4>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item, index) => (
          <button key={`${item.title}-${index}`} onClick={() => onOpen?.(item)} className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-4 text-left hover:border-primary">
            <p className="font-bold text-on-surface">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{item.summary}</p>
          </button>
        )) : (
          <p className="text-sm text-on-surface-variant">No items available yet.</p>
        )}
      </div>
    </section>
  )
}

function StringListPanel({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <h4 className="text-lg font-bold text-on-surface">{title}</h4>
      {items.length ? (
        <ol className="mt-4 space-y-3 text-sm leading-6 text-on-surface-variant">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <span className="font-bold text-on-surface">{index + 1}. </span>
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-on-surface-variant">{emptyText}</p>
      )}
    </section>
  )
}

function DiscoveryPanel({
  query,
  setQuery,
  filter,
  setFilter,
  loading,
  error,
  results,
  onSearch,
  onOpen,
}: {
  query: string
  setQuery: (value: string) => void
  filter: string
  setFilter: (value: string) => void
  loading: boolean
  error: string
  results: NormalizedDIResult[]
  onSearch: () => void
  onOpen: (item: NormalizedDIResult) => void
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-on-surface-variant" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSearch()
            }}
            placeholder="Find solutions, technologies, or learnings..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-12 py-3 text-sm outline-none focus:border-primary"
          />
          <button onClick={onSearch} disabled={loading} className="absolute right-2 top-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {['all', 'solution', 'technology', 'recommendation', 'learning', 'relationship'].map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${filter === item ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>
              {item === 'all' ? 'All Types' : item}
            </button>
          ))}
        </div>
        {error ? <p className="mt-4 rounded-lg bg-error-container p-3 text-sm font-semibold text-on-error-container">{error}</p> : null}
      </section>
      <EntityTable title="Discovery results" emptyTitle="No matching intelligence found" items={results} onOpen={onOpen} />
    </div>
  )
}

function RecommendationsPanel({
  recommendations,
  busyId,
  onFeedback,
  onOpen,
}: {
  recommendations: NormalizedDIResult[]
  busyId: string
  onFeedback: (item: NormalizedDIResult, action: DeliveryRecommendationFeedbackAction) => void
  onOpen: (item: NormalizedDIResult) => void
}) {
  if (!recommendations.length) {
    return <EmptyPanel icon={<Sparkles className="h-10 w-10 text-primary" />} title="No active recommendations" text="Recommendations appear after a Delivery Intelligence extraction or governed search returns recommendation records." />
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {recommendations.map((item) => (
        <article key={item.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.recommendationType || 'Recommendation'}</p>
              <h4 className="mt-2 text-lg font-bold text-on-surface">{item.title}</h4>
            </div>
            <ConfidenceBadge value={item.confidence} />
          </div>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">{item.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill label={item.status || 'new'} />
            <VisibilityPill value={item.visibility} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => onOpen(item)} className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-bold hover:bg-surface-container">View Evidence</button>
            {(['accepted', 'dismissed', 'converted'] as DeliveryRecommendationFeedbackAction[]).map((action) => (
              <button key={action} onClick={() => onFeedback(item, action)} disabled={busyId === item.id} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold capitalize text-on-primary disabled:opacity-60">
                {busyId === item.id ? 'Saving' : action}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

function LearningPanel({ learnings, onOpen, loading = false }: { learnings: NormalizedDIResult[]; onOpen: (item: NormalizedDIResult) => void; loading?: boolean }) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading learnings" text="Reading organizational learnings from the Delivery Intelligence catalog." />
  }
  if (!learnings.length) {
    return <EmptyPanel icon={<Lightbulb className="h-10 w-10 text-primary" />} title="No learnings captured yet" text="Run extraction against project QA outputs to preserve organizational learnings." />
  }
  return (
    <div className="space-y-3">
      {learnings.map((item) => (
        <button key={item.id} onClick={() => onOpen(item)} className="grid w-full gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-left hover:border-primary md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{item.category || 'Learning'}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{item.projectName || 'Organization'}</p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface">{item.title}</h4>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{item.summary}</p>
          </div>
          <StatusPill label={item.status || item.visibility} />
        </button>
      ))}
    </div>
  )
}

function RelationshipPanel({ relationships, results, onOpen, loading = false }: { relationships: NormalizedDIResult[]; results: NormalizedDIResult[]; onOpen: (item: NormalizedDIResult) => void; loading?: boolean }) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading relationships" text="Reading relationship records from the Delivery Intelligence catalog." />
  }
  const items = relationships.length ? relationships : results.slice(0, 8)
  if (!items.length) {
    return <EmptyPanel icon={<GitBranch className="h-10 w-10 text-primary" />} title="No relationships discovered yet" text="Relationship records will appear after extraction builds links between projects, solutions, technologies, learnings, and recommendations." />
  }
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant p-5">
        <h4 className="text-lg font-bold text-on-surface">Relationship browser</h4>
        <p className="mt-1 text-sm text-on-surface-variant">Table-first explorer for governed DI entity links.</p>
      </div>
      <div className="divide-y divide-outline-variant">
        {items.map((item) => (
          <button key={`${item.type}-${item.id}`} onClick={() => onOpen(item)} className="grid w-full gap-3 p-4 text-left hover:bg-surface-container-low md:grid-cols-3">
            <StatusPill label={item.type} />
            <div>
              <p className="font-bold text-on-surface">{item.title}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{item.summary}</p>
            </div>
            <ConfidenceBadge value={item.confidence} />
          </button>
        ))}
      </div>
    </section>
  )
}

function EntityTable({ title, emptyTitle, items, onOpen, compact = false, loading = false }: { title: string; emptyTitle: string; items: NormalizedDIResult[]; onOpen: (item: NormalizedDIResult) => void; compact?: boolean; loading?: boolean }) {
  if (loading) {
    return <EmptyPanel icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title={`Loading ${title.toLowerCase()}`} text="Reading records from the Delivery Intelligence catalog API." />
  }
  if (!items.length) {
    return <EmptyPanel icon={<Database className="h-10 w-10 text-primary" />} title={emptyTitle} text="Use Cross-Project Discovery or run project extraction to populate this view." />
  }
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant p-5">
        <h4 className="text-lg font-bold text-on-surface">{title}</h4>
        <span className="text-sm font-semibold text-on-surface-variant">{items.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase tracking-widest text-on-surface-variant">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Project</th>
              <th className="p-4">Visibility</th>
              <th className="p-4">Confidence</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((item) => (
              <tr key={`${item.type}-${item.id}`} className="hover:bg-surface-container-low">
                <td className="p-4">
                  <button onClick={() => onOpen(item)} className="text-left">
                    <p className="font-bold text-on-surface">{item.title}</p>
                    {!compact ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{item.summary}</p> : null}
                  </button>
                </td>
                <td className="p-4"><StatusPill label={item.category || item.type} /></td>
                <td className="p-4 text-on-surface-variant">{item.projectName || 'Organization'}</td>
                <td className="p-4"><VisibilityPill value={item.visibility} /></td>
                <td className="p-4"><ConfidenceBadge value={item.confidence} /></td>
                <td className="p-4"><StatusPill label={item.status || 'active'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ResultDrawer({ result, onClose }: { result: NormalizedDIResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/45 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto h-full w-full max-w-xl overflow-auto border-l border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{result.type}</p>
            <h3 className="mt-2 text-2xl font-bold text-on-surface">{result.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5">
          <p className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm leading-6 text-on-surface-variant">{result.summary || 'No summary was returned by the Delivery Intelligence workflow.'}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Project" value={result.projectName || 'Organization'} />
            <InfoTile label="Status" value={result.status || 'Active'} />
            <InfoTile label="Visibility" value={result.visibility || 'Project'} />
            <InfoTile label="Confidence" value={result.confidence === null ? 'Not scored' : `${Math.round(result.confidence * 100)}%`} />
          </div>
          <EntitySpecificDetails result={result} />
          {result.technologies.length ? (
            <section>
              <h4 className="font-bold text-on-surface">Technologies</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.technologies.map((item) => <StatusPill key={item} label={item} />)}
              </div>
            </section>
          ) : null}
          {result.evidence.length ? (
            <section>
              <h4 className="font-bold text-on-surface">Evidence</h4>
              <div className="mt-3 space-y-2">
                {result.evidence.map((item, index) => (
                  <div key={index} className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface-variant">
                    {typeof item === 'string' ? item : item.title || item.description || item.source || JSON.stringify(item)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <details className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <summary className="cursor-pointer text-sm font-bold text-on-surface">Developer details</summary>
            <pre className="mt-3 max-h-80 overflow-auto text-xs leading-5 text-on-surface-variant">{JSON.stringify(result.raw, null, 2)}</pre>
          </details>
        </div>
      </aside>
    </div>
  )
}

function EntitySpecificDetails({ result }: { result: NormalizedDIResult }) {
  const raw = result.raw as Record<string, any>
  const details: Array<{ label: string; value: ReactNode }> = []
  if (result.type === 'solution') {
    details.push(
      { label: 'Complexity', value: raw.implementationComplexity || raw.implementation_complexity || 'Not specified' },
      { label: 'Assets', value: Array.isArray(raw.assets) ? raw.assets.length : 0 },
      { label: 'Implementation approach', value: raw.implementationApproach || raw.implementation_approach || 'Not captured yet' },
      { label: 'QA approach', value: raw.qaApproach || raw.qa_approach || 'Not captured yet' },
    )
  } else if (result.type === 'technology') {
    details.push(
      { label: 'Category', value: result.category || 'Not categorized' },
      { label: 'Usage count', value: raw.usageCount ?? 0 },
      { label: 'Related solutions', value: Array.isArray(raw.relatedSolutions) ? raw.relatedSolutions.length : 0 },
    )
  } else if (result.type === 'recommendation') {
    details.push(
      { label: 'Recommendation type', value: raw.recommendationType || raw.recommendation_type || result.recommendationType || 'Recommendation' },
      { label: 'Rationale', value: raw.rationale || 'No rationale captured yet' },
      { label: 'Related item', value: raw.relatedTitle || raw.relatedEntityId || raw.related_entity_id || 'None' },
    )
  } else if (result.type === 'learning') {
    details.push(
      { label: 'Impact', value: raw.impactLevel || raw.impact_level || result.status || 'Not scored' },
      { label: 'Category', value: result.category || 'Learning' },
      { label: 'Reuse recommendation', value: raw.reusableRecommendation || raw.reusable_recommendation || 'Not captured yet' },
    )
  } else if (result.type === 'relationship') {
    details.push(
      { label: 'Relationship', value: raw.relationshipType || raw.relationship_type || 'Linked' },
      { label: 'Source', value: raw.sourceTitle || raw.source_entity_id || 'Source entity' },
      { label: 'Target', value: raw.targetTitle || raw.target_entity_id || 'Target entity' },
    )
  } else if (result.type === 'job') {
    details.push(
      { label: 'Job type', value: raw.jobType || raw.job_type || 'Delivery Intelligence job' },
      { label: 'Created', value: raw.createdAt ? formatDisplayDate(raw.createdAt) : 'Unknown' },
      { label: 'Updated', value: raw.updatedAt ? formatDisplayDate(raw.updatedAt) : 'Unknown' },
    )
  }
  if (!details.length) return null
  return (
    <section>
      <h4 className="font-bold text-on-surface">Details</h4>
      <div className="mt-3 grid gap-3">
        {details.map((detail) => (
          <InfoTile key={detail.label} label={detail.label} value={detail.value} />
        ))}
      </div>
    </section>
  )
}

function EmptyPanel({ icon, title, text, compact = false }: { icon: ReactNode; title: string; text: string; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest text-center ${compact ? 'p-5' : 'p-10'}`}>
      {icon}
      <h4 className="mt-4 text-lg font-bold text-on-surface">{title}</h4>
      <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">{text}</p>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-on-surface">{value}</p>
    </div>
  )
}

function StatusPill({ label }: { label: string }) {
  return <span className="inline-flex rounded-full bg-surface-container px-2.5 py-1 text-xs font-bold capitalize text-on-surface-variant">{label.replace(/_/g, ' ')}</span>
}

function VisibilityPill({ value }: { value: string }) {
  return <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold capitalize text-primary">{(value || 'project').replace(/_/g, ' ')}</span>
}

function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs font-bold text-on-surface-variant">Not scored</span>
  const percent = Math.round(value * 100)
  return <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">{percent}%</span>
}

function JobStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const icon = normalized === 'completed'
    ? <CheckCircle2 className="h-4 w-4" />
    : normalized === 'failed'
      ? <XCircle className="h-4 w-4" />
      : normalized === 'running' || normalized === 'pending' || normalized === 'queued'
        ? <Clock className="h-4 w-4" />
        : <CircleDot className="h-4 w-4" />
  const cls = normalized === 'completed'
    ? 'bg-success/10 text-success'
    : normalized === 'failed'
      ? 'bg-error-container text-on-error-container'
      : 'bg-primary/10 text-primary'
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize ${cls}`}>{icon}{status.replace(/_/g, ' ')}</span>
}

function normalizeResults(data: DeliveryIntelligenceSearchResponse | null): NormalizedDIResult[] {
  if (!data) return []
  const raw = data.results || (Array.isArray(data.data) ? data.data : data.data?.results) || []
  return raw.map(normalizeCatalogItem)
}

function normalizeCatalogResults(data: DeliveryIntelligenceCatalogResponse | null): NormalizedDIResult[] {
  if (!data?.data) return []
  const raw = [
    ...(data.data.solutions || []),
    ...(data.data.technologies || []),
    ...(data.data.learnings || []),
    ...(data.data.recommendations || []),
    ...(data.data.relationships || []),
    ...(data.data.jobs || []),
  ]
  return raw.map(normalizeCatalogItem)
}

function normalizeCatalogItem(item: Record<string, any>, index: number): NormalizedDIResult {
  const type = normalizeType(item.type || item.entityType || item.entity_type || 'record')
  const title = item.title || item.name || item.displayName || item.normalizedName || item.normalized_name || item.jobId || item.job_id || `${type} ${index + 1}`
  const summary = item.summary || item.description || item.rationale || item.learningSummary || item.learning_summary || item.aiSummary || item.ai_summary || item.relationshipType || item.relationship_type || ''
  const technologies = Array.isArray(item.technologies)
    ? item.technologies.map((tech: any) => typeof tech === 'string' ? tech : tech.name || tech.title || tech.id).filter(Boolean).map(String)
    : Array.isArray(item.tags)
      ? item.tags.map(String)
      : []
  const evidence = [
    ...(Array.isArray(item.evidence) ? item.evidence : []),
    ...(Array.isArray(item.assets) ? item.assets : []),
  ]
  return {
    id: String(item.id || item.jobId || item.job_id || item.relatedEntityId || item.related_entity_id || `${type}-${index}`),
    type,
    title: String(title),
    summary: String(summary),
    status: String(item.status || item.impactLevel || item.impact_level || ''),
    visibility: String(item.visibility || item.visibilityLevel || item.visibility_level || 'project'),
    confidence: normalizeConfidence(item.confidence ?? item.confidenceScore ?? item.confidence_score),
    projectName: String(item.projectName || item.project_name || item.sourceProject || item.source_project || ''),
    category: String(item.category || item.recommendationType || item.recommendation_type || item.relationshipType || item.relationship_type || ''),
    recommendationType: String(item.recommendationType || item.recommendation_type || ''),
    technologies,
    evidence,
    raw: item as DeliveryIntelligenceSearchResult,
  }
}

function normalizeType(value: string) {
  const lower = String(value).toLowerCase().replace(/_/g, '-')
  if (lower.includes('solution')) return 'solution'
  if (lower.includes('technology') || lower.includes('tech')) return 'technology'
  if (lower.includes('recommendation')) return 'recommendation'
  if (lower.includes('learning')) return 'learning'
  if (lower.includes('relationship')) return 'relationship'
  return lower || 'record'
}

function normalizeConfidence(value: unknown): number | null {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  if (numeric > 1) return Math.min(1, numeric / 100)
  return Math.max(0, Math.min(1, numeric))
}

function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

function readCount(counts: Record<string, number>, output: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const fromCounts = Number(counts[key])
    if (Number.isFinite(fromCounts) && fromCounts > 0) return fromCounts
    const direct = Number(output[key])
    if (Number.isFinite(direct) && direct > 0) return direct
    const nested = Number(output.counts?.[key] ?? output.persisted?.[key] ?? output.created?.[key])
    if (Number.isFinite(nested) && nested > 0) return nested
  }
  return 0
}

function getJobId(job: DeliveryIntelligenceJobResponse | null) {
  return job?.jobId || job?.job_id || ''
}

function patchRecommendationStatus(data: DeliveryIntelligenceSearchResponse | null, id: string, status: string): DeliveryIntelligenceSearchResponse | null {
  if (!data) return data
  const patch = (item: DeliveryIntelligenceSearchResult) => String(item.id) === id ? { ...item, status } : item
  if (data.results) return { ...data, results: data.results.map(patch) }
  if (Array.isArray(data.data)) return { ...data, data: data.data.map(patch) }
  if (data.data?.results) return { ...data, data: { ...data.data, results: data.data.results.map(patch) } }
  return data
}
