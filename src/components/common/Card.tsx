import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padded?: boolean
}

export default function Card({ children, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={`rounded-lg border border-outline-variant bg-surface-container-lowest ${
        padded ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
