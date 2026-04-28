import { BarChart3, Brain, FileText, Target } from 'lucide-react'
import Card from '../common/Card'

const capabilities = [
  {
    Icon: FileText,
    title: 'AI Test Strategy & Planning',
    description: 'Generate detailed test strategies and plans using semantic analysis of requirements',
  },
  {
    Icon: Brain,
    title: 'Intelligent Knowledge Base',
    description: 'Build searchable knowledge bases with vector embeddings for contextual QA insights',
  },
  {
    Icon: BarChart3,
    title: 'Automated Risk Analysis',
    description: 'Identify and prioritize risks automatically across all project artifacts',
  },
  {
    Icon: Target,
    title: 'JIRA-Ready Artifacts',
    description: 'Create production-ready epics, user stories, and test cases ready for development',
  },
]

export default function Capabilities() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-3xl font-semibold text-on-surface">Core Capabilities</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Purpose-built features that integrate into QA workflows and accelerate delivery.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ Icon, title, description }) => (
            <Card key={title} className="transition hover:border-primary/40">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-on-surface">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
