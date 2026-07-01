import type { SourceHealth } from '../types'
import { assessFreshness, formatDate } from './frontierHelpers'
import { StatusBadge } from './StatusBadge'

type SourceHealthPanelProps = {
  sources: SourceHealth[]
}

export function SourceHealthPanel({ sources }: SourceHealthPanelProps) {
  return (
    <div className="fi-grid three">
      {sources.map((source) => {
        const freshness = assessFreshness(source.lastCheckedAt, source.freshnessSla, source.status)
        return (
          <article className="fi-card" key={`${source.name}-${source.url}`}>
            <div className="fi-tag-row">
              <StatusBadge status={source.status ?? 'ok'}>{source.status ?? 'ok'}</StatusBadge>
              <StatusBadge status={source.accessMethod ?? source.type}>{source.accessMethod ?? source.type}</StatusBadge>
              <StatusBadge status={freshness.status}>{freshness.label}</StatusBadge>
            </div>
            <h3>{source.name}</h3>
            <p>{source.detail}</p>
            <div className="fi-progress">
              <span style={{ width: `${source.coverage}%` }} />
            </div>
            <div className="fi-card-footer">
              <span>覆盖 {source.coverage}%</span>
              <span>SLA {freshness.slaLabel}</span>
              <span>检查 {source.lastCheckedAt ? formatDate(source.lastCheckedAt) : '未刷新'}</span>
            </div>
          </article>
        )
      })}
    </div>
  )
}
