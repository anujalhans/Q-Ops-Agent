import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import FileDropField from '../components/FileDropField'

type ToastType = 'success' | 'error' | 'info'

type Props = {
    onLogout: () => void
    addToast: (toast: { title: string; message: string; type: ToastType }) => void
}

type UploadResponse = { jobId: string; status?: string }

const DashboardPage = ({ onLogout, addToast }: Props) => {
    const [activeTab, setActiveTab] = useState<'knowledge' | 'documents'>('knowledge')
    const [projectName, setProjectName] = useState('')
    const [brd, setBrd] = useState<any>(null)
    const [frd, setFrd] = useState<any>(null)
    const [hld, setHld] = useState<any>(null)
    const [lld, setLld] = useState<any>(null)
    const [transcript, setTranscript] = useState<any>(null)
    const [images, setImages] = useState<any[]>([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [generationProject, setGenerationProject] = useState('')
    const [selectedArtifact, setSelectedArtifact] = useState<string>('')
    const [docLoading, setDocLoading] = useState(false)
    const [docError, setDocError] = useState('')
    const [docResponse, setDocResponse] = useState<any>(null)
    const [docStatus, setDocStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle')
    const [docOutput, setDocOutput] = useState<any>(null)
    const [docRetryCount, setDocRetryCount] = useState(0)

    const [response, setResponse] = useState<UploadResponse | null>(null)
    const [currentStatus, setCurrentStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle')
    const [retryCount, setRetryCount] = useState(0)

    const kbPollingIntervalRef = useRef<number | null>(null)
    const kbDelayTimeoutRef = useRef<number | null>(null)
    const docPollingIntervalRef = useRef<number | null>(null)
    const docDelayTimeoutRef = useRef<number | null>(null)

    const greeting = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }, [])

    const clearPollingTimers = () => {
        if (kbPollingIntervalRef.current) {
            clearInterval(kbPollingIntervalRef.current)
            kbPollingIntervalRef.current = null
        }
        if (kbDelayTimeoutRef.current) {
            clearTimeout(kbDelayTimeoutRef.current)
            kbDelayTimeoutRef.current = null
        }
    }

    const clearDocPollingTimers = () => {
        if (docPollingIntervalRef.current) {
            clearInterval(docPollingIntervalRef.current)
            docPollingIntervalRef.current = null
        }
        if (docDelayTimeoutRef.current) {
            clearTimeout(docDelayTimeoutRef.current)
            docDelayTimeoutRef.current = null
        }
    }

    const clearAllPollingTimers = () => {
        clearPollingTimers()
        clearDocPollingTimers()
    }

    const handleFileChange = (setter: any) => (value: any) => setter(value)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const formData = new FormData()

            formData.append('projectName', projectName)

            if (brd) formData.append('brd', brd)
            if (frd) formData.append('frd', frd)
            if (hld) formData.append('hld', hld)
            if (lld) formData.append('lld', lld)
            if (transcript) formData.append('transcript', transcript)

            // multiple images
            images.forEach((img) => {
                formData.append('image', img)
            })

            const job = await fetch('http://localhost:5678/webhook/upload-test-artifacts', {
                method: 'POST',
                body: formData
            })

            const data = await job.json()

            if (!data?.jobId) {
                throw new Error('Invalid response from backend')
            }

            // ✅ IMPORTANT: immediately reflect backend response
            setResponse({ jobId: data.jobId })
            setCurrentStatus(data.status || 'queued')   // <-- FIX
            setRetryCount(0)

            clearPollingTimers()

            // call once immediately to update status without waiting for the first interval
            pollJobStatus(data.jobId)

            // start polling AFTER delay
            const timeoutId = window.setTimeout(() => {
                const interval = window.setInterval(() => {
                    pollJobStatus(data.jobId)
                }, 30000)

                kbPollingIntervalRef.current = interval
            }, 5000)

            kbDelayTimeoutRef.current = timeoutId

            addToast({
                title: 'Ingestion started',
                message: 'Knowledge base ingestion queued.',
                type: 'info'
            })

        } catch (err: any) {
            setError(err.message || 'Something went wrong')
            setError(msg)
            addToast({
                title: 'Upload failed',
                message: msg,
                type: 'error'
            })

        } finally {
            setLoading(false)
        }
    }

    const mapArtifactToDocumentType = (artifact: string) => {
        switch (artifact) {
            case 'strategy': return 'test_strategy'
            case 'plan': return 'test_plan'
            case 'risk': return 'risk_matrix'
            case 'testCases': return 'test_cases'
            case 'epicsAndStories': return 'user_stories'
            case 'traceability_matrix': return 'traceability_matrix'
            default: return artifact
        }
    }


    const handleGenerateSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!generationProject || !selectedArtifact) {
            setDocError('Please select project and artifact type')
            setDocLoading(false)
            return
        }
        setDocLoading(true)
        setDocError('')

        try {
            const documentType = mapArtifactToDocumentType(selectedArtifact)

            const res = await fetch('http://localhost:5678/webhook/generate-qa-doc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: generationProject,
                    documentType,
                    productOwner: 'PO' // ✅ required
                })
            })

            const data = await res.json()

            if (!data?.jobId) {
                throw new Error('Invalid response from backend')
            }

            // ✅ reflect backend response immediately
            setDocResponse({ jobId: data.jobId })
            setDocStatus(data.status || 'queued')
            setDocRetryCount(0)
            setDocOutput(null) // ✅ reset previous output

            clearDocPollingTimers()

            // ✅ immediate poll (no 30s blind wait)
            pollDocStatus(data.jobId)

            // ✅ start polling loop (30s)
            const timeoutId = window.setTimeout(() => {
                const interval = window.setInterval(() => {
                    pollDocStatus(data.jobId)
                }, 30000)

                docPollingIntervalRef.current = interval
            }, 30000)

            docDelayTimeoutRef.current = timeoutId

            addToast({
                title: 'Generation started',
                message: 'Document generation queued.',
                type: 'info'
            })

        } catch (err: any) {
            const msg = err.message || 'Something went wrong'
            setDocError(msg)
            addToast({
                title: 'Generation failed',
                message: msg,
                type: 'error'
            })
        } finally {
            setDocLoading(false)
        }
    }

    const handleReset = () => {
        setProjectName('')
        setBrd(null)
        setFrd(null)
        setHld(null)
        setLld(null)
        setTranscript(null)
        setImages([])
        clearPollingTimers()
        setRetryCount(0)
        addToast({ title: 'Form reset', message: 'All files and data have been cleared.', type: 'info' })
    }

    const handleDocReset = () => {
        setGenerationProject('')
        setSelectedArtifact('')
        setDocResponse(null)
        setDocStatus('idle')
        setDocError('')
        setDocOutput(null)
        clearDocPollingTimers()
        setDocRetryCount(0)
        addToast({ title: 'Form reset', message: 'Document generation form has been cleared.', type: 'info' })
    }

    const pollJobStatus = async (jobId: string) => {
        if (!jobId) return

        try {
            const res = await fetch(`http://localhost:5678/webhook/job-status?jobId=${jobId}`)
            if (!res.ok) throw new Error('Failed to fetch job status')
            const raw = await res.json()
            const data = Array.isArray(raw) ? raw[0] : raw
            if (!data) return

            if (data.status && typeof data.status === 'string' && data.status.includes('{{')) {
                setError('Backend response format error: Template variables not substituted.')
                addToast({ title: 'Backend error', message: 'Webhook is not properly configured.', type: 'error' })
                clearPollingTimers()
                return
            }

            setCurrentStatus(data.status)

            if (data.status === 'completed') {
                addToast({ title: 'Job completed', message: 'Knowledge base creation completed successfully.', type: 'success' })
                clearPollingTimers()
            } else if (data.status === 'failed') {
                setError('Job failed. Please try again.')
                addToast({ title: 'Job failed', message: 'Knowledge base creation failed.', type: 'error' })
                clearPollingTimers()
            } else if (data.status === 'processing') {
                setCurrentStatus('processing')
                if (retryCount === 0) {
                    addToast({
                        title: 'Processing started',
                        message: 'Your knowledge base is being created.',
                        type: 'info'
                    })
                }
                if (kbPollingIntervalRef.current) clearInterval(kbPollingIntervalRef.current)
                const interval = window.setInterval(() => pollJobStatus(jobId), 45000)
                kbPollingIntervalRef.current = interval
            } else if (data.status === 'not_found') {
                setRetryCount(prev => {
                    const newCount = prev + 1
                    if (newCount >= 3) {
                        setCurrentStatus('failed')
                        setError('Job not found after retries.')
                        addToast({ title: 'Job not found', message: 'Unable to track job after multiple retries.', type: 'error' })
                        clearPollingTimers()
                    }
                    return newCount
                })
            }
        } catch (err) {
            setRetryCount(prev => {
                const newCount = prev + 1
                if (newCount >= 3) {
                    setCurrentStatus('failed')
                    setError('Failed to check job status.')
                    clearPollingTimers()
                }
                return newCount
            })
        }
    }

    const pollDocStatus = async (jobId: string) => {
        if (!jobId) return

        try {
            const res = await fetch(`http://localhost:5678/webhook/job-status-retrieve?jobId=${jobId}`)
            if (!res.ok) throw new Error('Failed to fetch doc job status')
            const raw = await res.json()
            const data = Array.isArray(raw) ? raw[0] : raw
            if (!data) return

            if (data.status && typeof data.status === 'string' && data.status.includes('{{')) {
                setDocError('Backend response format error: Template variables not substituted.')
                addToast({ title: 'Backend error', message: 'Webhook is not properly configured.', type: 'error' })
                clearDocPollingTimers()
                return
            }

            setDocStatus(data.status)

            if (data.status === 'completed') {
                setDocOutput(data.output || data)
                addToast({ title: 'Document generation completed', message: 'Your QA document is ready.', type: 'success' })
                clearDocPollingTimers()
            } else if (data.status === 'failed') {
                setDocError('Document generation failed. Please try again.')
                addToast({ title: 'Document generation failed', message: 'Unable to generate document.', type: 'error' })
                clearDocPollingTimers()
            } else if (data.status === 'processing') {
                if (docRetryCount === 0) {
                    addToast({
                        title: 'Generation in progress',
                        message: 'Your document is being generated.',
                        type: 'info'
                    })
                }
                if (docPollingIntervalRef.current) {
                    clearInterval(docPollingIntervalRef.current)
                }

                const interval = window.setInterval(() => {
                    pollDocStatus(jobId)
                }, 45000)

                docPollingIntervalRef.current = interval
            } else if (data.status === 'not_found') {
                setDocRetryCount(prev => {
                    const newCount = prev + 1
                    if (newCount >= 3) {
                        setDocStatus('failed')
                        setDocError('Document job not found after retries.')
                        addToast({ title: 'Job not found', message: 'Unable to track document generation after retries.', type: 'error' })
                        clearDocPollingTimers()
                    }
                    return newCount
                })
            }
        } catch (err) {
            setDocRetryCount(prev => {
                const newCount = prev + 1
                if (newCount >= 3) {
                    setDocStatus('failed')
                    setDocError('Failed to check document generation status.')
                    clearDocPollingTimers()
                }
                return newCount
            })
        }
    }

    useEffect(() => {
        return () => {
            clearAllPollingTimers()
        }
    }, [])

    return (
        <main className="min-h-screen overflow-hidden flex flex-col bg-surface px-6 py-10 sm:px-10">
            <header className="sticky top-6 z-30 mb-6 rounded-2xl border border-slate-700 bg-black/80 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-brand/20 p-3 text-2xl font-bold">Q</div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Q-Ops Agent</h1>
                            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">A Purpose-Built AI System for QA Engineering</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-slate-700 px-4 py-2 text-sm text-slate-200">
                            <p className="text-[0.65rem] uppercase tracking-wider text-slate-400">{greeting}</p>
                            <p className="text-sm font-semibold text-white">Admin</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-0 sm:pr-2">
                <div className="mb-6">
                    <div className="rounded-2xl border border-slate-700 bg-surface2 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('knowledge')}
                                aria-pressed={activeTab === 'knowledge'}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'knowledge' ? 'bg-brand text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                <span className="font-mono text-xs">1.</span> Knowledge Base
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('documents')}
                                aria-pressed={activeTab === 'documents'}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'documents' ? 'bg-brand text-slate-950 shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                <span className="font-mono text-xs">2.</span> Generate Documents
                            </button>
                        </div>
                        <div className="text-sm text-slate-400">Workspace</div>
                    </div>
                </div>

                <main className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    {/* LEFT: Workspace / Forms */}
                    <section className="rounded-2xl border border-slate-700 bg-surface2 p-6 space-y-6">
                        {/* top info */}
                        <div className="text-sm font-semibold text-slate-300">{activeTab === 'knowledge' ? 'Upload your project artifacts to build a knowledgebase.' : 'Choose outputs and generate QA deliverables from your knowledge base.'}</div>

                        {activeTab === 'knowledge' ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Section 1: Project Info */}
                                <div className="space-y-2">
                                    <label htmlFor="projectName" className="block text-sm font-medium text-slate-200">Project name</label>
                                    <input
                                        id="projectName"
                                        value={projectName}
                                        onChange={(event) => setProjectName(event.target.value)}
                                        placeholder="Enter knowledge project name"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
                                    />
                                    <p className="text-xs text-slate-400">Give a clear, descriptive project name for traceability.</p>
                                </div>

                                {/* Section 2: Upload Documents grouped */}
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div className="rounded-xl border border-slate-700 p-4 space-y-3">
                                        <p className="text-sm font-semibold text-slate-200">Business Documents</p>
                                        <FileDropField label="BRD document" accept=".pdf,.doc,.docx" value={brd} onChange={handleFileChange(setBrd)} icon="📋" />
                                        <FileDropField label="FRD document" accept=".pdf,.doc,.docx" value={frd} onChange={handleFileChange(setFrd)} icon="📄" />
                                    </div>

                                    <div className="rounded-xl border border-slate-700 p-4 space-y-3">
                                        <p className="text-sm font-semibold text-slate-200">Technical Documents</p>
                                        <FileDropField label="HLD document" accept=".pdf,.doc,.docx" value={hld} onChange={handleFileChange(setHld)} icon="🏗️" />
                                        <FileDropField label="LLD document" accept=".pdf,.doc,.docx" value={lld} onChange={handleFileChange(setLld)} icon="🔧" />
                                    </div>

                                    <div className="rounded-xl border border-slate-700 p-4 space-y-3">
                                        <p className="text-sm font-semibold text-slate-200">Supporting Assets</p>
                                        <FileDropField label="Transcript file" accept=".txt" value={transcript} onChange={handleFileChange(setTranscript)} icon="🎙️" />
                                        <FileDropField
                                            label="UI designs"
                                            accept=".jpg,.png"
                                            multiple
                                            value={images}
                                            onChange={(value: any) => setImages(Array.isArray(value) ? value : value ? [value] : [])}
                                            helper="Upload one or more design images for your UI assets."
                                            icon="🎨"
                                        />
                                    </div>
                                </div>

                                {error ? <p className="text-sm text-rose-400">{error}</p> : null}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-md disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                                                Creating knowledge base...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">🚀</span> Create Knowledge Base
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600"
                                    >
                                        <span className="mr-2">🔄</span> Reset
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleGenerateSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="generationProject" className="block text-sm font-medium text-slate-200">Project name</label>
                                    <input
                                        id="generationProject"
                                        value={generationProject}
                                        onChange={(event) => setGenerationProject(event.target.value)}
                                        placeholder="Enter existing knowledge project name"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand"
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-700 p-4 space-y-3">
                                    <p className="text-sm font-semibold text-slate-200">Select artifacts</p>
                                    <label className="mb-1 block text-sm text-slate-400">What would you like to generate?</label>
                                    <div className="grid gap-4 lg:grid-cols-3">
                                        {([
                                            { key: 'strategy', label: 'Test Strategy' },
                                            { key: 'plan', label: 'Test Plan' },
                                            { key: 'risk', label: 'Risk Matrix' },
                                            { key: 'testCases', label: 'Test Cases' },
                                            { key: 'epicsAndStories', label: 'Epics & User Stories' },
                                            { key: 'traceability_matrix', label: 'Traceability Matrix' },
                                        ] as const).map((item) => (
                                            <div
                                                key={item.key}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedArtifact(item.key)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedArtifact(item.key) }}
                                                className={`cursor-pointer rounded-xl border p-4 transition flex flex-col justify-between space-y-3 ${selectedArtifact === item.key ? 'border-brand bg-brand/10 shadow-sm' : 'border-slate-700 bg-slate-700 text-slate-300 hover:border-slate-600 hover:scale-[1.02]'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="artifact"
                                                    checked={selectedArtifact === item.key}
                                                    onChange={() => setSelectedArtifact(item.key)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-md bg-slate-800 flex items-center justify-center text-lg">📄</div>
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-semibold text-slate-200">{item.label}</div>
                                                        <div className="text-xs text-slate-400">Generate {item.label} from your knowledge base.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {docError ? <p className="text-sm text-rose-400">{docError}</p> : null}

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={docLoading}
                                        className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-slate-950 transition hover:shadow-md disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand"
                                    >
                                        {docLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950 mr-2"></div>
                                                Generating documents...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">🚀</span> Generate Documents
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDocReset}
                                        className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-600"
                                    >
                                        <span className="mr-2">🔄</span> Reset
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* RIGHT: Status + Output */}
                    <aside className="rounded-2xl border border-slate-700 bg-surface2 p-6 space-y-6">
                        <h3 className="text-sm font-semibold text-slate-200">Job Status</h3>

                        {activeTab === 'knowledge' && currentStatus !== 'idle' ? (
                            <div className={`rounded-xl border p-4 ${currentStatus === 'completed' ? 'border-green-400 bg-green-900/10' :
                                currentStatus === 'failed' ? 'border-red-400 bg-red-900/10' :
                                    'border-slate-700 bg-slate-800/40'
                                }`}>
                                <p className="text-xs uppercase tracking-wider text-slate-400">{currentStatus === 'queued' ? 'Queued' : currentStatus === 'processing' ? 'Processing' : currentStatus === 'completed' ? 'Completed' : currentStatus === 'failed' ? 'Failed' : 'Status'}</p>
                                {response && (
                                    <div className="mt-3">
                                        <p className="text-sm font-semibold text-slate-200">Job ID: {response.jobId}</p>
                                        <p className="text-xs text-slate-400">Status: {currentStatus}</p>

                                        <div className="mt-3">
                                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full bg-brand ${currentStatus === 'processing' ? 'animate-pulse w-1/2' : currentStatus === 'queued' ? 'w-1/4' : currentStatus === 'completed' ? 'w-full' : 'w-1/4'}`} />
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400">
                                                {currentStatus === 'processing' ? 'Processing continues. Polling every 45 seconds until completion.' : currentStatus === 'queued' ? 'Queued for ingestion. Polling starts in 30 seconds.' : currentStatus === 'completed' ? 'Knowledge base created successfully.' : currentStatus === 'failed' ? 'Knowledge base creation failed.' : 'Processing.'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'documents' && docStatus !== 'idle' ? (
                            <div className={`rounded-xl border p-4 ${docStatus === 'completed' ? 'border-green-400 bg-green-900/10' :
                                docStatus === 'failed' ? 'border-red-400 bg-red-900/10' :
                                    'border-slate-700 bg-slate-800/40'
                                }`}>
                                <p className="text-xs uppercase tracking-wider text-slate-400">{docStatus === 'queued' ? 'Queued' : docStatus === 'processing' ? 'Processing' : docStatus === 'completed' ? 'Completed' : docStatus === 'failed' ? 'Failed' : 'Status'}</p>
                                {docResponse && (
                                    <div className="mt-3">
                                        <p className="text-sm font-semibold text-slate-200">Job ID: {docResponse.jobId}</p>
                                        <p className="text-xs text-slate-400">Status: {docStatus}</p>

                                        <div className="mt-3">
                                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full bg-brand ${docStatus === 'processing' ? 'animate-pulse w-1/2' : docStatus === 'queued' ? 'w-1/4' : docStatus === 'completed' ? 'w-full' : 'w-1/4'}`} />
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400">
                                                {docStatus === 'processing' ? 'Generating document. Polling every 45 seconds until completion.' : docStatus === 'queued' ? 'Generation queued. Polling starts in 30 seconds.' : docStatus === 'completed' ? 'Document generated successfully.' : docStatus === 'failed' ? 'Document generation failed.' : 'Processing.'}
                                            </div>
                                        </div>

                                        {docStatus === 'completed' && docOutput && (
                                            <div className="mt-4 border-t border-slate-700 pt-4">
                                                {docOutput.epics && docOutput.stories ? (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-200 mb-2">Epics</p>
                                                            <ul className="space-y-1">
                                                                {docOutput.epics.map((epic: any) => (
                                                                    <li key={epic.epicID}>
                                                                        <a href={epic.epicLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-brand hover:underline">
                                                                            {epic.epicKey}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-200 mb-2">User Stories</p>
                                                            <ul className="space-y-1">
                                                                {docOutput.stories.map((story: any) => (
                                                                    <li key={story.storyID}>
                                                                        <a href={story.storyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-brand hover:underline">
                                                                            {story.storyKey}
                                                                        </a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ) : docOutput.url ? (
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-200 mb-2">Document Link</p>
                                                        <a href={docOutput.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm text-brand hover:underline">Open Document</a>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <div className="rounded-xl border border-slate-700 bg-surface3/40 p-4">
                            <p className="text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">💡 Quick tips</p>
                            <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                                {activeTab === 'knowledge' ? (
                                    <>
                                        <li className="flex items-start gap-2"><span>📝</span> Use clear knowledge project names for traceable AI assets.</li>
                                        <li className="flex items-start gap-2"><span>📁</span> Upload required source documents to build the knowledge base.</li>
                                        <li className="flex items-start gap-2"><span>🔧</span> Verify the API at localhost:5678 if requests fail.</li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-start gap-2"><span>📊</span> Select a document type to generate QA artifacts.</li>
                                        <li className="flex items-start gap-2"><span>📁</span> Reference an existing knowledge base project.</li>
                                        <li className="flex items-start gap-2"><span>🔗</span> Generated documents will appear as Jira or Confluence links.</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </aside>
                </main>
            </div>
        </main>
    )
}

export default DashboardPage
