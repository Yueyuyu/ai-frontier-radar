import type { SourceRun } from '../types'
import type { FreshnessAssessment } from './frontierHelpers'
import { formatDate } from './frontierHelpers'
import { StatusBadge } from './StatusBadge'

type SourceRunListProps = {
  runs: SourceRun[]
  freshnessById?: Record<string, FreshnessAssessment>
}

function latencyLabel(value?: number) {
  if (typeof value !== 'number') return '未记录'
  if (value < 1000) return `${value}ms`
  return `${(value / 1000).toFixed(1)}s`
}

function rateLabel(value?: number) {
  if (typeof value !== 'number') return '0%'
  return `${Math.round(value * 100)}%`
}

export function SourceRunList({ freshnessById = {}, runs }: SourceRunListProps) {
  return (
    <div className="fi-table-wrap">
      <table className="fi-table">
        <thead>
          <tr>
            <th>来源</th>
            <th>分组</th>
            <th>方式</th>
            <th>状态</th>
            <th>新鲜度</th>
            <th>数量</th>
            <th>重试 / 失败率</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const freshness = freshnessById[run.id]
            return (
              <tr key={`${run.id}-${run.checkedAt}`}>
                <td>
                  <strong>{run.name}</strong>
                  <br />
                  <span>{formatDate(run.checkedAt)}</span>
                </td>
                <td>{run.column}</td>
                <td>{run.access}</td>
                <td>
                  <StatusBadge status={run.status}>{run.status}</StatusBadge>
                </td>
                <td>
                  {freshness ? (
                    <>
                      <StatusBadge status={freshness.status}>{freshness.label}</StatusBadge>
                      <br />
                      <span>{freshness.ageLabel} · SLA {freshness.slaLabel}</span>
                    </>
                  ) : (
                    <span>检查 {formatDate(run.checkedAt)}</span>
                  )}
                </td>
                <td>{run.itemCount}</td>
                <td>{run.retryCount ?? 0} / {rateLabel(run.failureRate)}<br /><span>{latencyLabel(run.latencyMs)}</span></td>
                <td>{run.message}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
