import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchDocStatus, fetchKbStatus, isTemplateError } from '../lib/api'
import type { JobStatus, StatusResponse, UploadResponse } from '../lib/api'

type ToastType = 'success' | 'error' | 'info'
type AddToast = (t: { title: string; message: string; type: ToastType }) => void
type Kind = 'kb' | 'doc'

type Labels = {
  processingTitle: string
  processingMessage: string
  completedTitle: string
  completedMessage: string
  failedTitle: string
  failedMessage: string
  notFoundTitle: string
  notFoundMessage: string
  backendErrorTitle: string
  backendErrorMessage: string
}

const LABELS: Record<Kind, Labels> = {
  kb: {
    processingTitle: 'Processing started',
    processingMessage: 'Your knowledge base is being created.',
    completedTitle: 'Job completed',
    completedMessage: 'Knowledge base creation completed successfully.',
    failedTitle: 'Job failed',
    failedMessage: 'Knowledge base creation failed.',
    notFoundTitle: 'Job not found',
    notFoundMessage: 'Unable to track job after multiple retries.',
    backendErrorTitle: 'Backend error',
    backendErrorMessage: 'Webhook is not properly configured.',
  },
  doc: {
    processingTitle: 'Generation in progress',
    processingMessage: 'Your document is being generated.',
    completedTitle: 'Document generation completed',
    completedMessage: 'Your QA document is ready.',
    failedTitle: 'Document generation failed',
    failedMessage: 'Unable to generate document.',
    notFoundTitle: 'Job not found',
    notFoundMessage: 'Unable to track document generation after retries.',
    backendErrorTitle: 'Backend error',
    backendErrorMessage: 'Webhook is not properly configured.',
  },
}

export type JobState = {
  status: JobStatus
  jobId: string | null
  output: any
  error: string
}

export function useJobPolling(kind: Kind, addToast: AddToast) {
  const [state, setState] = useState<JobState>({ status: 'idle', jobId: null, output: null, error: '' })
  const intervalRef = useRef<number | null>(null)
  const initialDelayRef = useRef<number | null>(null)
  const retriesRef = useRef(0)
  const seenProcessingToastRef = useRef(false)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (initialDelayRef.current) {
      clearTimeout(initialDelayRef.current)
      initialDelayRef.current = null
    }
  }, [])

  const poll = useCallback(
    async (jobId: string) => {
      const labels = LABELS[kind]
      const fetcher = kind === 'kb' ? fetchKbStatus : fetchDocStatus

      let data: StatusResponse | null
      try {
        data = await fetcher(jobId)
      } catch {
        retriesRef.current += 1
        if (retriesRef.current >= 3) {
          setState((current) => ({
            ...current,
            status: 'failed',
            error: kind === 'kb' ? 'Failed to check job status.' : 'Failed to check document generation status.',
          }))
          stop()
        }
        return
      }

      if (!data) return
      if (isTemplateError(data.status)) {
        setState((current) => ({
          ...current,
          status: 'failed',
          error: 'Backend response format error: Template variables not substituted.',
        }))
        addToast({ title: labels.backendErrorTitle, message: labels.backendErrorMessage, type: 'error' })
        stop()
        return
      }

      const status = data.status as JobStatus
      if (status === 'completed') {
        setState((current) => ({ ...current, status: 'completed', output: data.output ?? data }))
        addToast({ title: labels.completedTitle, message: labels.completedMessage, type: 'success' })
        stop()
      } else if (status === 'failed') {
        setState((current) => ({
          ...current,
          status: 'failed',
          error: kind === 'kb' ? 'Job failed. Please try again.' : 'Document generation failed. Please try again.',
        }))
        addToast({ title: labels.failedTitle, message: labels.failedMessage, type: 'error' })
        stop()
      } else if (status === 'processing') {
        setState((current) => ({ ...current, status: 'processing' }))
        if (!seenProcessingToastRef.current) {
          seenProcessingToastRef.current = true
          addToast({ title: labels.processingTitle, message: labels.processingMessage, type: 'info' })
        }
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
          void poll(jobId)
        }, 45000)
      } else if (status === 'not_found') {
        retriesRef.current += 1
        if (retriesRef.current >= 3) {
          setState((current) => ({
            ...current,
            status: 'failed',
            error: kind === 'kb' ? 'Job not found after retries.' : 'Document job not found after retries.',
          }))
          addToast({ title: labels.notFoundTitle, message: labels.notFoundMessage, type: 'error' })
          stop()
        } else {
          setState((current) => ({ ...current, status: 'not_found' }))
        }
      } else {
        setState((current) => ({ ...current, status }))
      }
    },
    [addToast, kind, stop],
  )

  const start = useCallback(
    (response: UploadResponse) => {
      stop()
      retriesRef.current = 0
      seenProcessingToastRef.current = false
      setState({ status: (response.status as JobStatus) ?? 'queued', jobId: response.jobId, output: null, error: '' })
      void poll(response.jobId)
      const delay = kind === 'kb' ? 5000 : 30000
      initialDelayRef.current = window.setTimeout(() => {
        intervalRef.current = window.setInterval(() => {
          void poll(response.jobId)
        }, 30000)
      }, delay)
    },
    [kind, poll, stop],
  )

  const reset = useCallback(() => {
    stop()
    retriesRef.current = 0
    seenProcessingToastRef.current = false
    setState({ status: 'idle', jobId: null, output: null, error: '' })
  }, [stop])

  useEffect(() => () => stop(), [stop])

  return { state, start, reset }
}
