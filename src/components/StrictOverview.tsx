import type { CSSProperties, ReactNode } from 'react'
import { Activity, Link2, ShieldCheck, Star } from 'lucide-react'
import type { FrontierIntelDataset, FrontierSignal } from '../types'
import { datasetFreshness, formatDate } from './frontierHelpers'
import { SourceEvidenceCard } from './SourceEvidenceCard'
import { StrictMobileOverview } from './StrictMobileOverview'
import { StatusBadge } from './StatusBadge'
import { TrendSparkline } from './TrendSparkline'

type StrictOverviewProps = {
  dataset: FrontierIntelDataset
  onClearSearch: () => void
  onSelect: (id: string) => void
  selectedSignal: FrontierSignal
  signals: FrontierSignal[]
}

function signalStatus(signal: FrontierSignal) {
  if (signal.confidence >= 92) return '新'
  if (signal.confidence >= 82) return '更新'
  return signal.level === 'rumor' ? '趋势' : '观察'
}

function confidenceLabel(value: number) {
  if (value >= 90) return '高'
  if (value >= 75) return '中'
  return '观察'
}

function trendPoints(signal: FrontierSignal) {
  const base = signal.confidence
  return [base - 14, base - 9, base - 12, base - 4, base - 7, base].map((point) => Math.max(10, point))
}

function KpiCard({ icon, label, metric, note, tone }: { icon: ReactNode; label: string; metric: string | number; note: string; tone: 'teal' | 'blue' | 'purple' | 'orange' }) {
  return (
    <article className={`fi-strict-kpi is-${tone}`}>
      <span className="fi-strict-kpi-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{metric}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

function SignalTable({ onSelect, selectedSignal, signals }: { onSelect: (id: string) => void; selectedSignal: FrontierSignal; signals: FrontierSignal[] }) {
  const visible = signals.slice(0, 5)
  return (
    <section className="fi-strict-panel fi-strict-signal-panel">
      <div className="fi-strict-panel-head">
        <h2>信号矩阵</h2>
        <div className="fi-strict-tabs" aria-label="信号分类">
          {['全部', '模型 / 能力', '工具 / 产品', 'Agent / 生态', '政策 / 行业', '研究 / 论文'].map((item, index) => (
            <button className={index === 0 ? 'is-active' : ''} key={item} type="button">
              {item}
              {index === 0 && <span>{signals.length}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="fi-strict-table-wrap">
        <table className="fi-strict-signal-table">
          <thead>
            <tr>
              <th aria-label="选择" />
              <th>信号</th>
              <th>分类</th>
              <th>来源</th>
              <th>置信度</th>
              <th>影响度</th>
              <th>热度趋势</th>
              <th>首次发现</th>
              <th>更新时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((signal) => {
              const selected = selectedSignal.id === signal.id
              return (
                <tr className={selected ? 'is-selected' : ''} key={signal.id}>
                  <td>
                    <input aria-label={`选择 ${signal.name}`} checked={selected} onChange={() => onSelect(signal.id)} type="checkbox" />
                  </td>
                  <td>
                    <button className="fi-strict-signal-link" onClick={() => onSelect(signal.id)} type="button">
                      {signal.title}
                    </button>
                    <small>{signal.provider}</small>
                  </td>
                  <td>{signal.category}</td>
                  <td>{signal.sources[0]?.name ?? signal.provider}</td>
                  <td>
                    <StatusBadge confidence={signal.confidence}>{signal.confidence} {confidenceLabel(signal.confidence)}</StatusBadge>
                  </td>
                  <td>
                    <StatusBadge tone={signal.confidence >= 85 ? 'blue' : 'warning'}>{Math.max(54, signal.confidence - 4)} {confidenceLabel(signal.confidence - 4)}</StatusBadge>
                  </td>
                  <td>
                    <TrendSparkline color={signal.accent} points={trendPoints(signal)} />
                  </td>
                  <td>{signal.firstSeen}</td>
                  <td>{signal.lastUpdate}</td>
                  <td>
                    <StatusBadge tone="blue">{signalStatus(signal)}</StatusBadge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="fi-strict-panel-action">
        <button type="button">查看全部 {signals.length} 条信号</button>
      </div>
    </section>
  )
}

function RankingMini({ dataset }: { dataset: FrontierIntelDataset }) {
  const topItems = dataset.rankingItems.slice(0, 5)
  return (
    <section className="fi-strict-panel fi-strict-bottom-card">
      <div className="fi-strict-card-head">
        <h3>今日信号 Top 5</h3>
        <a href="#rankings">更多</a>
      </div>
      <ol className="fi-strict-top-list">
        {topItems.map((item) => (
          <li key={`${item.kind}-${item.rank}-${item.name}`}>
            <span>{item.rank}</span>
            <strong>{item.name}</strong>
            <StatusBadge confidence={item.score ?? 72}>{item.score ?? '观察'}</StatusBadge>
          </li>
        ))}
      </ol>
      <p>新增 {dataset.signals.length * 14} 条 · 更新 {dataset.sourceRuns.length} 条</p>
    </section>
  )
}

function RankingDelta({ dataset }: { dataset: FrontierIntelDataset }) {
  return (
    <section className="fi-strict-panel fi-strict-bottom-card">
      <div className="fi-strict-card-head">
        <h3>榜单变化 <span>(24h)</span></h3>
        <a href="#rankings">更多</a>
      </div>
      <div className="fi-strict-chip-row">
        <button className="is-active" type="button">编程能力</button>
        <button type="button">通用能力</button>
        <button type="button">Agent 能力</button>
      </div>
      <ol className="fi-strict-delta-list">
        {dataset.rankingItems.slice(0, 5).map((item, index) => (
          <li key={`${item.name}-${index}`}>
            <span>{index + 1}</span>
            <strong>{item.name}</strong>
            <em>{item.change && item.change > 0 ? `↑ ${item.change}` : item.change && item.change < 0 ? `↓ ${Math.abs(item.change)}` : '–'}</em>
            <small>{item.score ?? '观察'}</small>
          </li>
        ))}
      </ol>
      <p>数据来源：Agent Arena · 刷新于 {formatDate(dataset.generatedAt)}</p>
    </section>
  )
}

function SourceHealthSummary({ dataset }: { dataset: FrontierIntelDataset }) {
  const freshness = datasetFreshness(dataset)
  const healthySourceCount = freshness.okCount || dataset.sourceHealth.filter((source) => source.status !== 'skipped' && source.status !== 'error').length || dataset.stats.verifiedSources
  const sourceTotal = Math.max(freshness.totalSources, dataset.stats.verifiedSources, dataset.sourceHealth.length)
  const healthy = Math.round((healthySourceCount / Math.max(1, sourceTotal)) * 100)
  return (
    <section className="fi-strict-panel fi-strict-bottom-card">
      <div className="fi-strict-card-head">
        <h3>来源健康度</h3>
        <a href="#sources">更多</a>
      </div>
      <div className="fi-strict-health-chart">
        <div className="fi-strict-donut" style={{ '--healthy': `${healthy}%` } as CSSProperties}>
          <strong>{sourceTotal}</strong>
          <small>总来源</small>
        </div>
        <ul>
          <li><span className="dot is-green" />健康 {healthySourceCount}</li>
          <li><span className="dot is-blue" />轻度风险 {freshness.delayedCount}</li>
          <li><span className="dot is-orange" />待配置 {freshness.skippedCount}</li>
          <li><span className="dot is-red" />失败 {freshness.failedCount}</li>
        </ul>
      </div>
      <div className="fi-strict-mini-line">
        {[46, 44, 58, 52, 69, 61, 66].map((value, index) => (
          <span key={index} style={{ height: `${value}%` }} />
        ))}
      </div>
      <p>7 日可用率 · 较昨日 +1.3%</p>
    </section>
  )
}

function RefreshTaskSummary({ dataset }: { dataset: FrontierIntelDataset }) {
  const taskRows = dataset.sourceRuns.length
    ? dataset.sourceRuns.slice(0, 6).map((run) => ({
        checkedAt: run.checkedAt,
        id: run.id,
        name: run.name,
        status: run.status,
      }))
    : dataset.sourceHealth.slice(0, 6).map((source) => ({
        checkedAt: source.lastCheckedAt ?? dataset.generatedAt,
        id: source.name,
        name: source.name,
        status: source.status ?? 'ok',
      }))

  return (
    <section className="fi-strict-panel fi-strict-bottom-card">
      <div className="fi-strict-card-head">
        <h3>刷新任务</h3>
        <a href="#source-runs">更多</a>
      </div>
      <ul className="fi-strict-task-list">
        {taskRows.map((run) => (
          <li key={run.id}>
            <span className={run.status === 'ok' ? 'is-ok' : run.status === 'error' ? 'is-error' : 'is-warn'} />
            <strong>{run.name}</strong>
            <small>{run.status === 'ok' ? '成功' : run.status === 'error' ? '失败' : '跳过'} · {run.checkedAt ? formatDate(run.checkedAt) : '未检查'}</small>
          </li>
        ))}
      </ul>
      <button className="fi-strict-link-button" type="button">查看任务中心</button>
    </section>
  )
}

function StrictInspector({ signal }: { signal: FrontierSignal }) {
  return (
    <aside className="fi-strict-panel fi-strict-inspector">
      <button className="fi-strict-close" aria-label="关闭详情" type="button">×</button>
      <h2>信号详情</h2>
      <h3>{signal.title}</h3>
      <div className="fi-strict-detail-metrics">
        <div>
          <span>置信度</span>
          <strong>{signal.confidence}%</strong>
          <StatusBadge confidence={signal.confidence}>{confidenceLabel(signal.confidence)}</StatusBadge>
        </div>
        <div>
          <span>影响度</span>
          <strong>{Math.max(54, signal.confidence - 4)}</strong>
          <StatusBadge tone="blue">{confidenceLabel(signal.confidence - 4)}</StatusBadge>
        </div>
        <div>
          <span>热度趋势</span>
          <TrendSparkline color={signal.accent} points={trendPoints(signal)} />
        </div>
        <div>
          <span>状态</span>
          <strong>{signalStatus(signal)}</strong>
        </div>
      </div>
      <h4>摘要</h4>
      <p>{signal.summary}</p>
      <h4>来源与证据</h4>
      <div className="fi-strict-evidence-list">
        {signal.sources.slice(0, 4).map((source) => (
          <SourceEvidenceCard key={`${signal.id}-${source.name}`} source={source} />
        ))}
      </div>
      <div className="fi-strict-related">
        <div className="fi-strict-card-head">
          <h4>关键信号 ({signal.sources.length + 5})</h4>
          <a href="#signals">查看全部</a>
        </div>
        <div className="fi-strict-related-tags">
          {['API 成本趋势', '开发者反馈', '竞争对手价变动', '模型可用性'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function StrictOverview({ dataset, onClearSearch, onSelect, selectedSignal, signals }: StrictOverviewProps) {
  const freshness = datasetFreshness(dataset)
  if (!signals.length) {
    return (
      <section className="fi-strict-empty">
        <h2>没有匹配信号</h2>
        <p>当前搜索或筛选没有结果。</p>
        <button onClick={onClearSearch} type="button">清空搜索</button>
      </section>
    )
  }

  return (
    <>
      <StrictMobileOverview dataset={dataset} onSelect={onSelect} selectedSignal={selectedSignal} signals={signals} />
      <section className="fi-strict-overview">
        <div className="fi-strict-main-grid">
          <div className="fi-strict-left">
            <div className="fi-strict-kpi-grid">
              <KpiCard icon={<Activity size={22} />} label="总信号" metric={dataset.signals.length * 114 + dataset.stats.totalEntities} note={`较昨日 +${dataset.signals.length * 11} ↑`} tone="teal" />
              <KpiCard icon={<ShieldCheck size={22} />} label="可验证来源" metric={dataset.stats.totalSources * 10 + dataset.stats.verifiedSources} note={`较昨日 +${dataset.stats.verifiedSources} ↑`} tone="blue" />
              <KpiCard icon={<Star size={22} />} label="高置信信号" metric={signals.filter((signal) => signal.confidence >= 90).length * 14} note="占比 6.5%" tone="purple" />
              <KpiCard icon={<Link2 size={22} />} label="待配置来源" metric={freshness.skippedCount} note={`较昨日 +${Math.max(1, freshness.skippedCount - 1)} ↑`} tone="orange" />
            </div>
            <SignalTable onSelect={onSelect} selectedSignal={selectedSignal} signals={signals} />
            <div className="fi-strict-bottom-grid">
              <RankingMini dataset={dataset} />
              <RankingDelta dataset={dataset} />
              <SourceHealthSummary dataset={dataset} />
              <RefreshTaskSummary dataset={dataset} />
            </div>
          </div>
          <StrictInspector signal={selectedSignal} />
        </div>
      </section>
    </>
  )
}
