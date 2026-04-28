import Card from '../common/Card'

const groups = [
  {
    name: 'Orchestration Layer',
    items: [['n8n', 'Manages workflow automation and agent execution']],
  },
  {
    name: 'Data & Knowledge Layer',
    items: [
      ['Supabase', 'Stores artifacts, outputs, and system data'],
      ['Chroma (Vector DB)', 'Handles embeddings and semantic search'],
    ],
  },
  {
    name: 'Intelligence Layer',
    items: [
      ['OpenAI LLMs', 'Generates QA artifacts: strategies, plans, stories'],
      ['OpenAI Embeddings', 'Converts docs into vectors for contextual understanding'],
      ['OpenAI Vision', 'Extracts structured insights from UI and visual inputs'],
    ],
  },
  {
    name: 'Delivery & Collaboration Layer',
    items: [
      ['Jira', 'Creates epics, stories, and tracks QA execution'],
      ['Confluence', 'Houses strategies, plans, and QA documentation'],
    ],
  },
]

export default function ArchitectureDiagram() {
  return (
    <section className="bg-surface-container-low py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">Powered by a Scalable AI Architecture</p>
        <h2 className="mx-auto mt-2 max-w-4xl text-center font-display text-3xl font-semibold text-on-surface">
          Q-Ops Agent combines orchestration, intelligence, and storage layers to deliver end-to-end QA automation
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {groups.map((group, index) => (
            <Card key={group.name} className="h-full">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-on-primary">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-base font-semibold text-on-surface">{group.name}</h3>
              <div className="mt-4 space-y-3">
                {group.items.map(([name, description]) => (
                  <div key={name} className="rounded-md border border-outline-variant bg-surface-container-low p-3">
                    <p className="text-sm font-semibold text-on-surface">{name}</p>
                    <p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
