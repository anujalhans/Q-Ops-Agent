# Test Execution Summary

Generated on 2026-05-09.

## Commands Executed

| Command | Result | Notes |
| --- | --- | --- |
| `npm install --save-dev @playwright/test` | Passed with approval | Added Playwright test runner; follow-up `npm audit --audit-level=moderate` reported 0 vulnerabilities |
| `npx playwright install chromium` | Passed with approval | Installed Chromium, headless shell, FFmpeg, and Winldd |
| `npm run build` | Passed with approval | TypeScript and Vite production build completed |
| `npm run test:e2e -- --project=chromium` | Passed | 8/8 desktop Chromium tests passed |
| `npm run test:e2e -- --project=chromium` after scope expansion | Passed | 16/16 desktop Chromium tests passed |
| `npm run test:e2e` | Failed with product bug | 12/16 passed; all 4 failures were mobile dashboard interactions blocked by responsive layout |

## Results

| Suite | Passed | Failed | Status |
| --- | ---: | ---: | --- |
| Desktop Chromium mocked regression | 16 | 0 | PASS |
| Mobile Chrome public routes | 4 | 0 | PASS |
| Mobile Chrome dashboard routes | 0 | 4 | FAIL |
| Prior full configured run | 12 | 4 | FAIL |

## Failed Tests

| Test | Root Cause | Bug |
| --- | --- | --- |
| Mobile knowledge ingestion | Fixed sidebar intercepts Create Knowledge Base control | BUG-005 |
| Mobile document generation | Fixed sidebar intercepts artifact selection and submit controls | BUG-005 |
| Mobile settings save | Settings content exists but is hidden/covered at mobile width | BUG-005 |
| Mobile registered-user authorization surface | Settings content exists but is hidden/covered at mobile width | BUG-005 |

## Evidence

Playwright generated failure artifacts under `test-results/` and an HTML report under `playwright-report/`.

## Current Quality Gate

Desktop mocked E2E is passing. The project should not be considered mobile-dashboard production ready until BUG-005 is fixed and the full Playwright suite passes.
