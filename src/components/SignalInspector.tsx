import type { FrontierSignal } from '../types'
import { SourceEvidenceCard } from './SourceEvidenceCard'
import { StatusBadge } from './StatusBadge'

type SignalInspectorProps = {
  signal: FrontierSignal
}

export function SignalInspector({ signal }: SignalInspectorProps) {
  return (
    <aside className="fi-panel fi-inspector">
      <span className="fi-kicker">信号详情</span>
      <h2>{signal.name}</h2>
      <p>{signal.summary}</p>
      <div className="fi-confidence">
        <strong>{signal.confidence}%</strong>
        <span>{signal.level} · {signal.releaseWindow}</span>
      </div>
      <div className="fi-tag-row">
        <StatusBadge status={signal.level}>{signal.level}</StatusBadge>
        <StatusBadge category={signal.category}>{signal.category}</StatusBadge>
      </div>
      <h3>证据链</h3>
      <div className="fi-source-list">
        {signal.sources.map((source) => (
          <SourceEvidenceCard key={`${signal.id}-${source.name}`} source={source} />
        ))}
      </div>
    </aside>
  )
}
