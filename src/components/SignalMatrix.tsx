import type { FrontierSignal } from '../types'
import { SignalCard } from './SignalCard'

type SignalMatrixProps = {
  signals: FrontierSignal[]
  selectedId?: string
  onSelect?: (id: string) => void
}

export function SignalMatrix({ onSelect, selectedId, signals }: SignalMatrixProps) {
  return (
    <div className="fi-grid three">
      {signals.map((signal) => (
        <SignalCard key={signal.id} onSelect={onSelect} selected={selectedId === signal.id} signal={signal} />
      ))}
    </div>
  )
}
