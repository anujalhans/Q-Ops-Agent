import React from 'react'
import { FileText, ClipboardList, Shield, Zap } from 'lucide-react'

const cards = [
  { icon: FileText, title: 'Test Strategy Generation', desc: 'AI drafts high-level strategies aligned with requirements.' },
  { icon: ClipboardList, title: 'Test Plan Creation', desc: 'Build execution-ready test plans with scope and cycles.' },
  { icon: Shield, title: 'Risk Assessment', desc: 'Automatically identify and prioritize risk areas.' },
  { icon: Zap, title: 'Traceability Matrix', desc: 'Link requirements to tests and ensure coverage.' },
]

const CapabilityCards: React.FC = () => {
  // Intentionally removed capability cards per user request.
  return null
}

export default CapabilityCards
