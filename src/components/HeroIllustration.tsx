import React from 'react'

const HeroIllustration: React.FC = () => {
  return (
    <div className="w-[380px] h-[240px] rounded-2xl border border-border bg-transparent p-0 shadow-xl flex items-center justify-center overflow-hidden">
      <img
        src="/assets/ai-qa-intelligence.png"
        alt="AI QA Intelligence"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default HeroIllustration
