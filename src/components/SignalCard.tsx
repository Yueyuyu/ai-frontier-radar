import type { FrontierSignal } from '../types'
import { StatusBadge } from './StatusBadge'

type SignalCardProps = {
  signal: FrontierSignal
  selected?: boolean
  onSelect?: (id: string) => void
}

export function SignalCard({ onSelect, selected, signal }: SignalCardProps) {
  return (
    <article className="fi-card" style={{ borderColor: selected ? signal.accent : undefined }}>
      <div className="fi-tag-row">
        <StatusBadge category={signal.category}>{signal.category}</StatusBadge>
        <StatusBadge confidence={signal.confidence}>{signal.confidence}%</StatusBadge>
      </div>
      <h3>{signal.title}</h3>
      <p>{signal.summary}</p>
      <div className="fi-card-footer">
        <span>{signal.provider}</span>
        <span>{signal.sourceCount ?? signal.sources.length} 个来源</span>
        <span>{signal.releaseWindow}</span>
        {onSelect && (
          <button className="fi-action" onClick={() => onSelect(signal.id)} type="button">
            查看
          </button>
        )}
      </div>
    </article>
  )
}
