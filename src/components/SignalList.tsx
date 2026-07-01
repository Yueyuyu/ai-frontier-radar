import type { FrontierSignal } from '../types'
import { EmptyState } from './EmptyState'
import { SignalCard } from './SignalCard'

type SignalListProps = {
  signals: FrontierSignal[]
  selectedId?: string
  onSelect?: (id: string) => void
  onReset?: () => void
}

export function SignalList({ onReset, onSelect, selectedId, signals }: SignalListProps) {
  if (!signals.length) {
    return <EmptyState actionLabel={onReset ? '重置筛选' : undefined} onAction={onReset} type="filter" />
  }
  return (
    <div className="fi-grid">
      {signals.map((signal) => (
        <SignalCard key={signal.id} onSelect={onSelect} selected={selectedId === signal.id} signal={signal} />
      ))}
    </div>
  )
}
