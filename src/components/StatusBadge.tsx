import type { ReactNode } from 'react'
import { confidenceTone, toneForCategory, toneForStatus } from './frontierHelpers'

type StatusBadgeProps = {
  children?: ReactNode
  label?: ReactNode
  status?: string
  category?: string
  confidence?: number
  tone?: string
}

export function StatusBadge({ category, children, confidence, label, status, tone }: StatusBadgeProps) {
  const resolvedTone = tone ?? (typeof confidence === 'number' ? confidenceTone(confidence) : category ? toneForCategory(category) : toneForStatus(status))
  const content = children ?? label ?? status ?? category ?? (typeof confidence === 'number' ? `${confidence}%` : '')
  return <span className={`fi-badge ${resolvedTone}`}>{content}</span>
}
