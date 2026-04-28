import { AlertCircle, CheckCircle2, Clock, ExternalLink, Loader2 } from 'lucide-react'
import Card from '../common/Card'
import type { JobState } from '../../hooks/useJobPolling'

type Props = {
  kind: 'kb' | 'doc'
  state: JobState
}

const labels: Record<string, string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  not_found: 'Not found',
  idle: 'Idle',
}

function progressWidth(status: JobState['status']) {
  if (status === 'completed') return 'w-full'
  if (status === 'processing') return 'w-1/2 animate-pulse'
  if (status === 'queued') return 'w-1/4'
  return 'w-0'
}

function statusIcon(status: JobState['status']) {
  if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-success" />
  if (status === 'failed') return <AlertCircle className="h-4 w-4 text-error" />
  if (status === 'processing') return <Loader2 className="h-4 w-4 animate-spin text-primary" />
  return <Clock className="h-4 w-4 text-on-surface-variant" />
}

export default function JobStatusCard({ kind, state }: Props) {
  if (state.status === 'idle') {
    return (
      <Card>
        <p className="mb-1 text-sm font-semibold text-on-surface">Job Status</p>
        <p className="text-xs text-on-surface-variant">No job is running yet.</p>
      </Card>
    )
  }

  const messages = {
    kb: {
      queued: 'Queued for ingestion. Polling starts shortly.',
      processing: 'Processing continues. Polling every 45 seconds until completion.',
      completed: 'Knowledge base created successfully.',
      failed: 'Knowledge base creation failed.',
      not_found: 'Waiting for the backend to report this job.',
    },
    doc: {
      queued: 'Generation queued. Polling starts in 30 seconds.',
      processing: 'Generating document. Polling every 45 seconds until completion.',
      completed: 'Document generated successfully.',
      failed: 'Document generation failed.',
      not_found: 'Waiting for the backend to report this job.',
    },
  }[kind] as Record<string, string>

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-on-surface">Job Status</p>
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-on-surface-variant">
          {statusIcon(state.status)}
          {labels[state.status] ?? state.status}
        </div>
      </div>
      {state.jobId ? (
        <p className="mb-2 break-all text-xs text-on-surface-variant">
          Job ID: <span className="font-mono">{state.jobId}</span>
        </p>
      ) : null}
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-surface-container-high">
        <div className={`h-full bg-primary ${progressWidth(state.status)}`} />
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">{messages[state.status] ?? ''}</p>

      {state.status === 'completed' && state.output ? (
        <div className="mt-4 border-t border-outline-variant pt-4">
          {state.output.epics && state.output.stories ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-on-surface">Epics</p>
                <ul className="space-y-1">
                  {state.output.epics.map((epic: any) => (
                    <li key={epic.epicID ?? epic.epicKey}>
                      <a href={epic.epicLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> {epic.epicKey}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-on-surface">User Stories</p>
                <ul className="space-y-1">
                  {state.output.stories.map((story: any) => (
                    <li key={story.storyID ?? story.storyKey}>
                      <a href={story.storyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> {story.storyKey}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : state.output.url ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-on-surface">Document Link</p>
              <a href={state.output.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> Open Document
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {state.error ? <p className="mt-3 text-xs text-error">{state.error}</p> : null}
    </Card>
  )
}
