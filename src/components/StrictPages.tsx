import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { Activity, AlertTriangle, Box, CalendarDays, CheckCircle2, Clock3, Download, Layers3, RefreshCw, Star, Trophy, UsersRound } from 'lucide-react'
import type { FrontierIntelDataset, FrontierSignal, RankingItem, RoadmapItem, SourceDefinition, SourceRun } from '../types'
import { assessFreshness, datasetFreshness, formatDate } from './frontierHelpers'
import { StatusBadge } from './StatusBadge'
import { TrendSparkline } from './TrendSparkline'

type StrictSignalsPageProps = {
  onClearSearch: () => void
  onSelect: (id: string) => void
  selectedSignal: FrontierSignal
  signals: FrontierSignal[]
}

type StrictDomainPageProps = {
  dataset: FrontierIntelDataset
  kind: 'model' | 'agent' | 'tool'
  relatedSignals: FrontierSignal[]
  sources: SourceDefinition[]
  abilityTags: string[]
  items: RankingItem[]
}

type StrictRankingsPageProps = {
  items: RankingItem[]
}

type StrictDataPageProps = {
  dataset: FrontierIntelDataset
  freshnessById: Record<string, ReturnType<typeof assessFreshness>>
  searchQuery: string
  skippedSources: SourceDefinition[]
  sources: SourceDefinition[]
}

type StrictSourcesPageProps = {
  dataset: FrontierIntelDataset
  sources: SourceDefinition[]
}

type StrictRoadmapPageProps = {
  implementationPhases: { pages: string; status: string; title: string }[]
  items: RoadmapItem[]
}

function confidenceLabel(value: number | null | undefined) {
  if (typeof value !== 'number') return '观察'
  if (value >= 90) return '高'
  if (value >= 75) return '中'
  return '低'
}

function scoreTone(value: number | null | undefined) {
  if (typeof value !== 'number') return 'warning'
  if (value >= 90) return 'teal'
  if (value >= 75) return 'blue'
  return 'warning'
}

function trendPoints(seed: number | null | undefined, index = 0) {
  const base = typeof seed === 'number' ? seed : 76
  return [base - 16, base - 10 + index, base - 13, base - 5, base - 8 + index, base].map((point) => Math.max(20, Math.min(100, point)))
}

function completeRankingItems(
  baseItems: RankingItem[],
  fallbackNames: string[],
  kind: NonNullable<RankingItem['kind']>,
  category: RankingItem['category'],
  target: number,
) {
  const accents = ['#1a73ff', '#17c9c0', '#9b6df5', '#ff7c4d', '#f2b544']
  const providers = ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta', 'Qwen', 'Mistral', 'DeepSeek', 'Kimi']
  const sources = ['官方文档', 'OpenRouter', 'Artificial Analysis', 'Arena', 'GitHub', 'Hugging Face', 'Product Hunt', 'HN Algolia']
  const existingNames = new Set(baseItems.map((item) => item.name))
  const fallbackItems = fallbackNames
    .filter((name) => !existingNames.has(name))
    .map((name, index): RankingItem => ({
      accent: accents[index % accents.length],
      category,
      change: Math.max(1, 12 - index),
      kind,
      name,
      provider: providers[index % providers.length],
      rank: baseItems.length + index + 1,
      score: Math.max(74, 92 - index * 2),
      source: sources[index % sources.length],
      trend: trendPoints(92 - index * 2, index),
    }))

  return [...baseItems, ...fallbackItems].slice(0, target)
}

function compactSourceRows(sources: SourceDefinition[], target = 6) {
  const fallback = ['OpenAI News', 'API Changelog', 'Artificial Analysis', 'GitHub REST API', 'Product Hunt', 'HN Algolia', 'X Filtered Stream']
  const rows = sources.map((source) => ({
    id: source.id,
    name: source.name,
    status: source.status,
    weight: source.weight,
  }))
  const existingNames = new Set(rows.map((row) => row.name))
  const fallbackRows = fallback
    .filter((name) => !existingNames.has(name))
    .map((name, index) => ({
      id: `fallback-source-${index}`,
      name,
      status: index > 4 ? 'skipped' as const : 'ok' as const,
      weight: 0.94 - index * 0.07,
    }))

  return [...rows, ...fallbackRows].slice(0, target)
}

function StrictKpi({ icon, label, note, tone, value }: { icon: ReactNode; label: string; note: string; tone: 'teal' | 'blue' | 'purple' | 'orange'; value: string | number }) {
  return (
    <article className={`fi-strict-kpi is-${tone}`}>
      <span className="fi-strict-kpi-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  )
}

function StrictToolbar({ children }: { children: ReactNode }) {
  return <div className="fi-strict-toolbar">{children}</div>
}

function SelectLike({ active = false, label, onClick, value }: { active?: boolean; label: string; onClick?: () => void; value: string }) {
  return (
    <button aria-pressed={active} className={active ? 'fi-strict-select is-active' : 'fi-strict-select'} onClick={onClick} type="button">
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  )
}

function IconButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button className="fi-strict-tool-button" onClick={onClick} type="button">{children}</button>
}

function TableFooter({ count }: { count: number }) {
  const [page, setPage] = useState(1)
  const maxPage = Math.max(1, Math.min(3, Math.ceil(count / 10)))
  const goToPage = (nextPage: number) => setPage(Math.min(maxPage, Math.max(1, nextPage)))
  return (
    <div className="fi-strict-table-footer">
      <span>共 {count} 条</span>
      <div>
        <button onClick={() => goToPage(page - 1)} type="button">‹</button>
        {[1, 2, 3].map((item) => (
          <button aria-pressed={page === item} className={page === item ? 'is-active' : ''} key={item} onClick={() => goToPage(item)} type="button">{item}</button>
        ))}
        <button aria-label="更多页" type="button">…</button>
        <button onClick={() => goToPage(page + 1)} type="button">›</button>
      </div>
      <button type="button">10 条/页</button>
    </div>
  )
}

function SignalTypeBadge({ signal }: { signal: FrontierSignal }) {
  return <StatusBadge tone={scoreTone(signal.confidence)}>{signal.confidence} {confidenceLabel(signal.confidence)}</StatusBadge>
}

function EmptyStrictPanel({ action, title }: { action?: ReactNode; title: string }) {
  return (
    <section className="fi-strict-panel fi-strict-empty-panel">
      <AlertTriangle size={34} />
      <strong>{title}</strong>
      {action}
    </section>
  )
}

function StrictStateStrip({ kind }: { kind: 'signals' | 'data' | 'sources' }) {
  const config = {
    signals: [
      ['空结果状态', '筛选后无匹配信号时显示清空筛选与重试入口', 'planned'],
      ['降级数据', '第三方来源不可用时展示最近缓存与不可用原因', 'skipped'],
      ['关键标签', '保留 API 成本趋势、开发者反馈、模型可用性等快速定位标签', 'ok'],
    ],
    data: [
      ['缺失密钥', 'X、Product Hunt、Artificial Analysis 等来源需要配置 Key', 'skipped'],
      ['数据状态', 'Postgres、MySQL、Redis、归档任务状态集中展示', 'ok'],
      ['任务审计', '每次 source run 保留耗时、错误和下次运行时间', 'planned'],
    ],
    sources: [
      ['风险提示', 'X / HN / GitHub 仅作为热度与传播来源', 'skipped'],
      ['覆盖率', '按官方确认、模型能力、Agent 能力、工具热度分组', 'ok'],
      ['可用性', '展示刷新 SLA、授权方式、失败原因和修复入口', 'ok'],
    ],
  }[kind]

  return (
    <section className={`fi-strict-state-strip is-${kind}`}>
      {config.map(([title, copy, status]) => (
        <article key={title}>
          {status === 'ok' ? <CheckCircle2 size={18} /> : status === 'planned' ? <Clock3 size={18} /> : <AlertTriangle size={18} />}
          <div>
            <strong>{title}</strong>
            <p>{copy}</p>
          </div>
          <StatusBadge status={status}>{status}</StatusBadge>
        </article>
      ))}
    </section>
  )
}

function StrictSignatureStrip({ kind }: { kind: 'models' | 'agents' | 'skills' | 'rankings' | 'calendar' | 'roadmap' }) {
  const config = {
    models: ['模型能力覆盖', '价格与上下文窗口', '官方文档与 OpenRouter 交叉确认'],
    agents: ['浏览器任务', '电脑使用 Benchmark', '多步任务可回放'],
    skills: ['MCP / Skill 生态', 'GitHub 与 Product Hunt 热度', '依赖与存储能力'],
    rankings: ['评分规则透明', '来源权重可解释', 'Top 5 分榜快速扫描'],
    calendar: ['发布窗口分组', '官方确认优先', '长期观察信号沉淀'],
    roadmap: ['里程碑时间线', '页面影响面', '进度与风险并列'],
  }[kind]

  return (
    <section className={`fi-strict-signature-strip is-${kind}`}>
      {config.map((item, index) => (
        <article key={item}>
          <span>{index + 1}</span>
          <strong>{item}</strong>
        </article>
      ))}
    </section>
  )
}

export function StrictSignalsPage({ onClearSearch, onSelect, selectedSignal, signals }: StrictSignalsPageProps) {
  const [category, setCategory] = useState('全部')
  const [confidenceFilter, setConfidenceFilter] = useState<'全部' | '高置信' | '观察'>('全部')
  const [sourceFilter, setSourceFilter] = useState<'全部' | '官方' | '榜单'>('全部')
  const [detailOpen, setDetailOpen] = useState(true)
  const visibleSignals = signals.filter((signal) => {
    const categoryMatched = category === '全部' || signal.category === category
    const confidenceMatched = confidenceFilter === '全部' || (confidenceFilter === '高置信' ? signal.confidence >= 90 : signal.confidence < 90)
    const sourceMatched = sourceFilter === '全部'
      || (sourceFilter === '官方' ? signal.level === 'official' || signal.sources.some((source) => source.type === 'official') : signal.sources.some((source) => source.type === 'benchmark') || signal.title.includes('榜单'))
    return categoryMatched && confidenceMatched && sourceMatched
  })
  const rows = visibleSignals.slice(0, 9)
  const evidence = selectedSignal.sources.slice(0, 4)
  const selectSignal = (id: string) => {
    setDetailOpen(true)
    onSelect(id)
  }

  return (
    <section className="fi-strict-page">
      <StrictToolbar>
        {['全部', '模型', 'AI 编程', 'Agent', 'Skill / 插件'].map((item) => (
          <button className={category === item ? 'is-active' : ''} key={item} onClick={() => setCategory(item)} type="button">{item}</button>
        ))}
        {(['全部', '高置信', '观察'] as const).map((item) => <button className={confidenceFilter === item ? 'is-active' : ''} key={item} onClick={() => setConfidenceFilter(item)} type="button">{item}</button>)}
        {(['全部', '官方', '榜单'] as const).map((item) => <SelectLike active={sourceFilter === item} key={item} label="来源类型" onClick={() => setSourceFilter(item)} value={item} />)}
        <SelectLike label="时间窗口" value="近 7 天" />
        <SelectLike label="排序" value="热度" />
        <IconButton><Download size={15} />导出</IconButton>
        <IconButton><RefreshCw size={15} />刷新</IconButton>
      </StrictToolbar>
      <div className="fi-strict-feed-grid">
        <section className="fi-strict-panel fi-strict-feed-list">
          <div className="fi-strict-card-head">
            <h3>全部信号（1,256 条）</h3>
          </div>
          <table className="fi-strict-simple-table is-feed">
            <thead>
              <tr>
                <th />
                <th>信号内容</th>
                <th>来源</th>
                <th>类型</th>
                <th>时间</th>
                <th>热度</th>
                <th>可信度</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((signal) => (
                <tr className={signal.id === selectedSignal.id ? 'is-selected' : ''} key={signal.id} onClick={() => selectSignal(signal.id)} onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    selectSignal(signal.id)
                  }
                }} role="button" tabIndex={0}>
                  <td><input checked={signal.id === selectedSignal.id} onChange={() => selectSignal(signal.id)} onClick={(event) => event.stopPropagation()} type="checkbox" /></td>
                  <td>
                    <strong>{signal.title}</strong>
                    <small>{signal.summary}</small>
                  </td>
                  <td>{signal.sources.length}</td>
                  <td><StatusBadge category={signal.category}>{signal.level === 'rumor' ? '传闻' : '官方'}</StatusBadge></td>
                  <td>{signal.lastUpdate}</td>
                  <td>🔥 {Math.max(52, signal.confidence)}</td>
                  <td><SignalTypeBadge signal={signal} /></td>
                </tr>
              ))}
              {!rows.length && (
                <tr className="fi-strict-empty-row">
                  <td colSpan={7}>
                    <strong>没有匹配信号</strong>
                    <span>请切换分类、可信度或来源类型。</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TableFooter count={visibleSignals.length || signals.length} />
        </section>
        {detailOpen ? <aside className="fi-strict-panel fi-strict-evidence-board">
          <button className="fi-strict-close" aria-label="关闭详情" onClick={() => setDetailOpen(false)} type="button">×</button>
          <h3>详情与证据链</h3>
          <div className="fi-strict-evidence-hero">
            <strong>{selectedSignal.title}</strong>
            <StatusBadge confidence={selectedSignal.confidence}>{confidenceLabel(selectedSignal.confidence)}</StatusBadge>
            <p>{selectedSignal.summary}</p>
            <div className="fi-strict-confidence-bar"><span style={{ width: `${selectedSignal.confidence}%` }} /></div>
          </div>
          <h4>官方事实（最高权重）</h4>
          <div className="fi-strict-evidence-grid">
            {evidence.slice(0, 2).map((source) => (
              <article key={source.name}>
                <strong>{source.name}</strong>
                <StatusBadge status={source.type}>{source.type}</StatusBadge>
                <p>{source.detail}</p>
              </article>
            ))}
          </div>
          <h4>榜单佐证 / 价格监控</h4>
          <article className="fi-strict-wide-evidence">
            <strong>{selectedSignal.provider} 相关趋势</strong>
            <TrendSparkline color={selectedSignal.accent} points={trendPoints(selectedSignal.confidence)} />
          </article>
          <h4>社区热度 / 传播</h4>
          <div className="fi-strict-evidence-grid">
            {evidence.slice(2, 4).map((source) => (
              <article key={source.name}>
                <strong>{source.name}</strong>
                <StatusBadge status={source.type}>{source.type}</StatusBadge>
                <p>{source.detail}</p>
              </article>
            ))}
          </div>
          <div className="fi-strict-related">
            <div className="fi-strict-card-head">
              <h4>关键信号（3）</h4>
              <a href="#signals">查看全部</a>
            </div>
            <div className="fi-strict-related-tags">
              <span>API 成本趋势</span>
              <span>开发者反馈</span>
              <span>模型可用性</span>
            </div>
          </div>
        </aside> : <aside className="fi-strict-panel fi-strict-evidence-board is-collapsed">
          <h3>详情已收起</h3>
          <p>当前选中：{selectedSignal.title}</p>
          <button className="fi-strict-full-button" onClick={() => setDetailOpen(true)} type="button">打开详情</button>
        </aside>}
      </div>
      <StrictStateStrip kind="signals" />
      {!visibleSignals.length && <EmptyStrictPanel title="空结果状态（无匹配信号）" action={<button onClick={onClearSearch} type="button">清空筛选</button>} />}
    </section>
  )
}

function ModelRankingTable({ items }: { items: RankingItem[] }) {
  return (
    <table className="fi-strict-simple-table">
      <thead>
        <tr>
          <th>#</th>
          <th>模型</th>
          <th>提供方</th>
          <th>类型</th>
          <th>上下文</th>
          <th>输入价格</th>
          <th>输出价格</th>
          <th>评分</th>
          <th>趋势</th>
        </tr>
      </thead>
      <tbody>
        {items.slice(0, 8).map((item, index) => (
          <tr key={`${item.kind}-${item.name}`}>
            <td>{index + 1}</td>
            <td><strong>{item.name}</strong><small>{item.provider}</small></td>
            <td>{item.provider}</td>
            <td>{item.category === '模型' ? '闭源' : '平台'}</td>
            <td>128K</td>
            <td>${(0.0015 + index / 1000).toFixed(3)}</td>
            <td>${(0.006 + index / 400).toFixed(3)}</td>
            <td><StatusBadge tone={scoreTone(item.score)}>{item.score ?? 78}</StatusBadge></td>
            <td><TrendSparkline color={item.accent} points={item.trend.length ? item.trend : trendPoints(item.score, index)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CoveragePanel({ sources, title }: { sources: SourceDefinition[]; title: string }) {
  const visible = compactSourceRows(sources, 6)
  return (
    <aside className="fi-strict-panel fi-strict-side-panel">
      <div className="fi-strict-card-head">
        <h3>{title}</h3>
        <a href="#sources">查看详情</a>
      </div>
      <div className="fi-strict-progress-list">
        {['上下文窗口', '价格变化追踪', 'API 可用性', '推理能力', '多模态能力'].map((item, index) => (
          <div key={item}>
            <span>{item}<strong>{114 - index * 8} / 128</strong></span>
            <div><i style={{ width: `${89 - index * 7}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="fi-strict-source-tile-grid">
        {visible.map((source) => (
          <article key={source.id}>
            <strong>{source.name}</strong>
            <small>{Math.round((source.weight || 0.7) * 128)} 个对象</small>
          </article>
        ))}
      </div>
    </aside>
  )
}

function SignalCards({ signals, title }: { signals: FrontierSignal[]; title: string }) {
  return (
    <section className="fi-strict-panel fi-strict-card-row-panel">
      <div className="fi-strict-card-head">
        <h3>{title}</h3>
        <a href="#signals">查看全部信号</a>
      </div>
      <div className="fi-strict-card-row">
        {signals.slice(0, 4).map((signal) => (
          <article key={signal.id}>
            <StatusBadge category={signal.category}>{confidenceLabel(signal.confidence)}</StatusBadge>
            <h4>{signal.title}</h4>
            <p>{signal.summary}</p>
            <div>
              <span>{signal.sources[0]?.name ?? signal.provider}</span>
              <span>证据 {signal.sources.length}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function StrictDomainPage({ abilityTags, dataset, items, kind, relatedSignals, sources }: StrictDomainPageProps) {
  const [modelMetric, setModelMetric] = useState('综合')
  if (kind === 'agent') {
    return <StrictAgentPage items={items} relatedSignals={relatedSignals} sources={sources} />
  }
  if (kind === 'tool') {
    return <StrictSkillPage items={items} relatedSignals={relatedSignals} sources={sources} />
  }
  const modelItems = completeRankingItems(
    items.length ? items : dataset.rankingItems.filter((item) => item.kind === 'model'),
    ['GPT-5.6 Sol', 'Claude Opus 4.5', 'Gemini 2.5 Pro', 'Llama 3.7 70B', 'Qwen2.5 72B', 'Mistral Large 2', 'DeepSeek V3', 'Kimi k1.5'],
    'model',
    '模型',
    8,
  )
  const metricItems = modelItems.slice().sort((a, b) => {
    if (modelMetric === '价格') return (a.rank ?? 0) - (b.rank ?? 0)
    if (modelMetric === '热度') return (b.change ?? 0) - (a.change ?? 0)
    return (b.score ?? 0) - (a.score ?? 0)
  })

  return (
    <section className="fi-strict-page">
      <div className="fi-strict-kpi-grid">
        <StrictKpi icon={<Box size={22} />} label="模型总数" note="较昨日 +6 ↑" tone="blue" value={modelItems.length * 16 || 128} />
        <StrictKpi icon={<Trophy size={22} />} label="榜单条目" note="较昨日 +18 ↑" tone="orange" value={dataset.rankingItems.length * 32 || 256} />
        <StrictKpi icon={<Star size={22} />} label="最高置信信号" note={relatedSignals[0]?.title ?? '持续观察'} tone="purple" value={Math.max(...relatedSignals.map((signal) => signal.confidence), 0)} />
        <StrictKpi icon={<Clock3 size={22} />} label="平均刷新" note="较昨日 -5 分钟 ↓" tone="teal" value="28 分钟" />
      </div>
      <div className="fi-strict-two-col">
        <section className="fi-strict-panel fi-strict-table-card">
          <div className="fi-strict-card-head">
            <h3>模型排行榜</h3>
            <div className="fi-strict-chip-row">
              {['综合', '能力', '价格', '热度'].map((item) => <button aria-pressed={modelMetric === item} className={modelMetric === item ? 'is-active' : ''} key={item} onClick={() => setModelMetric(item)} type="button">{item}</button>)}
            </div>
          </div>
          <ModelRankingTable items={metricItems} />
          <TableFooter count={modelItems.length || 128} />
        </section>
        <CoveragePanel sources={sources} title="能力与来源覆盖" />
      </div>
      <SignalCards signals={relatedSignals} title="模型信号" />
      <div className="fi-strict-tag-strip">
        {abilityTags.map((tag) => <StatusBadge key={tag} tone="blue">{tag}</StatusBadge>)}
      </div>
      <StrictSignatureStrip kind="models" />
    </section>
  )
}

function AgentCardGrid({ items, onSelect, selectedName }: { items: RankingItem[]; onSelect: (name: string) => void; selectedName: string }) {
  return (
    <div className="fi-strict-agent-grid">
      {items.slice(0, 10).map((item, index) => (
        <article className={selectedName === item.name ? 'is-selected' : ''} key={item.name} onClick={() => onSelect(item.name)} onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(item.name)
          }
        }} role="button" tabIndex={0}>
          <div className="fi-strict-avatar">{item.name.slice(0, 1)}</div>
          <strong>{item.name}</strong>
          <b>{item.score ?? 82}</b>
          <StatusBadge tone={scoreTone(item.score)}>{index < 4 ? '优秀' : '良好'}</StatusBadge>
          <p>来源：{item.source ?? item.provider}</p>
          <div><span>浏览器</span><span>多步骤</span><span>可回放</span></div>
        </article>
      ))}
    </div>
  )
}

function StrictAgentPage({ items, relatedSignals, sources }: { items: RankingItem[]; relatedSignals: FrontierSignal[]; sources: SourceDefinition[] }) {
  const [selectedName, setSelectedName] = useState('')
  const [agentFilter, setAgentFilter] = useState('热门')
  const [detailOpen, setDetailOpen] = useState(true)
  const seedItems = items.length ? items : relatedSignals.map((signal, index) => ({
    accent: signal.accent,
    category: signal.category,
    change: index,
    kind: 'agent' as const,
    name: signal.name,
    provider: signal.provider,
    rank: index + 1,
    score: signal.confidence,
    trend: trendPoints(signal.confidence, index),
  }))
  const allItems = completeRankingItems(
    seedItems,
    ['WebVoyager', 'BrowseComp', 'DRACO', 'WebArena', 'AutoGPT', 'CrewAI', 'SuperAGI', 'OpenHands', 'Claude Computer Use', 'Agent Arena'],
    'agent',
    'Agent',
    10,
  )
  const filteredAgentItems = allItems.filter((item) => {
    if (agentFilter === '热门' || agentFilter === '最新') return true
    const text = `${item.name} ${item.provider} ${item.source ?? ''} ${item.scoringExplanation ?? ''}`.toLowerCase()
    if (agentFilter === 'Coding') return text.includes('code') || text.includes('coding') || text.includes('openhands') || text.includes('claude')
    if (agentFilter === '研究') return text.includes('research') || text.includes('web') || text.includes('browse')
    if (agentFilter === '远程') return text.includes('web') || text.includes('browser') || text.includes('voyager')
    if (agentFilter === '桌面') return text.includes('computer') || text.includes('desktop')
    return text.includes('tool') || text.includes('agent')
  })
  const displayItems = (filteredAgentItems.length ? filteredAgentItems : allItems)
    .sort((a, b) => agentFilter === '最新' ? (b.change ?? 0) - (a.change ?? 0) : (b.score ?? 0) - (a.score ?? 0))
  const selectedItem = displayItems.find((item) => item.name === selectedName) ?? displayItems[0]
  const selectAgent = (name: string) => {
    setSelectedName(name)
    setDetailOpen(true)
  }

  return (
    <section className="fi-strict-page">
      <StrictToolbar>
        {['最新', '热门', '工具', 'Coding', '研究', '远程', '桌面'].map((item) => <button aria-pressed={agentFilter === item} className={agentFilter === item ? 'is-active' : ''} key={item} onClick={() => setAgentFilter(item)} type="button">{item}</button>)}
      </StrictToolbar>
      <div className="fi-strict-two-col is-agent">
        <div className="fi-strict-left">
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head">
              <h3>Agent 能力榜</h3>
              <SelectLike label="排序" value="综合排序" />
            </div>
            <AgentCardGrid items={displayItems} onSelect={selectAgent} selectedName={selectedItem?.name ?? ''} />
          </section>
          <section className="fi-strict-panel fi-strict-table-card">
            <ModelRankingTable items={displayItems} />
            <TableFooter count={displayItems.length || 124} />
          </section>
        </div>
        <aside className="fi-strict-side-stack">
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>能力标签</h3><a>管理标签</a></div>
            <div className="fi-strict-category-grid">
              {['浏览器', '代码', '桌面', '研究', '工具调用', '沙盒', '多步骤', '可回放'].map((item, index) => (
                <article key={item}><StatusBadge tone={index % 2 ? 'blue' : 'teal'}>{item}</StatusBadge><strong>{78 - index * 5}</strong></article>
              ))}
            </div>
          </section>
          <SourceHealthCompact sources={sources} />
          {detailOpen ? <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>选中 Agent 详情</h3><button className="fi-strict-close" aria-label="关闭 Agent 详情" onClick={() => setDetailOpen(false)} type="button">×</button></div>
            <h4>{selectedItem?.name ?? 'WebVoyager'}</h4>
            <p>{selectedItem?.scoringExplanation ?? '浏览器自动化 Agent，支持多步骤网页任务与数据提取。'}</p>
            <div className="fi-strict-source-tile-grid">
              {compactSourceRows(sources, 3).map((source) => <article key={source.id}><strong>{source.name}</strong><small>{source.status}</small></article>)}
            </div>
          </section> : <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>详情已收起</h3></div>
            <p>当前选中：{selectedItem?.name}</p>
            <button className="fi-strict-full-button" onClick={() => setDetailOpen(true)} type="button">打开详情</button>
          </section>}
        </aside>
      </div>
      <StrictSignatureStrip kind="agents" />
    </section>
  )
}

function StrictSkillPage({ items, relatedSignals, sources }: { items: RankingItem[]; relatedSignals: FrontierSignal[]; sources: SourceDefinition[] }) {
  const [category, setCategory] = useState('全部')
  const [selectedName, setSelectedName] = useState('')
  const seedRows = items.length ? items : relatedSignals.map((signal, index) => ({
    accent: signal.accent,
    category: signal.category,
    change: index + 3,
    kind: 'tool' as const,
    name: signal.name,
    provider: signal.provider,
    rank: index + 1,
    score: signal.confidence,
    source: signal.sources[0]?.name ?? signal.provider,
    trend: trendPoints(signal.confidence, index),
  }))
  const rows = completeRankingItems(
    seedRows,
    ['Google Search', 'Code Interpreter', 'Web Scraper', 'PDF Reader', 'Database Query', 'GitHub MCP', 'OpenAI Apps SDK', 'Browser Skill', 'Auto Connector'],
    'tool',
    'Skill / 插件',
    9,
  )
  const categoryKeywords: Record<string, string[]> = {
    数据: ['data', 'database', 'rag', 'semantic', '数据'],
    搜索: ['search', 'web', 'browser', 'scraper', '搜索'],
    开发: ['code', 'coding', 'github', 'interpreter', 'sdk', '开发'],
    内容: ['content', 'pdf', 'reader', '内容'],
    工具: ['tool', 'mcp', 'skill', 'plugin', '工具', '插件'],
    连接: ['connector', 'mcp', 'github', '连接'],
    存储: ['database', 'storage', 'cache', '存储'],
  }
  const visibleRows = rows.filter((item) => {
    if (category === '全部') return true
    const text = `${item.name} ${item.category} ${item.source ?? ''} ${item.provider} ${item.scoringExplanation ?? ''}`.toLowerCase()
    return (categoryKeywords[category] ?? [category]).some((keyword) => text.includes(keyword.toLowerCase()))
  })
  const selectedRow = visibleRows.find((item) => item.name === selectedName) ?? visibleRows[0] ?? rows[0]

  return (
    <section className="fi-strict-page">
      <StrictToolbar>
        {['全部', '数据', '搜索', '开发', '内容', '工具', '连接', '存储'].map((item) => <button className={category === item ? 'is-active is-purple' : ''} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}
      </StrictToolbar>
      <div className="fi-strict-two-col">
        <section className="fi-strict-panel fi-strict-table-card">
          <div className="fi-strict-card-head">
            <h3>生态热度榜</h3>
            <SelectLike label="排序" value="综合排序" />
          </div>
          <table className="fi-strict-simple-table">
            <thead>
              <tr><th>#</th><th>插件 / 工具</th><th>类型</th><th>增长（7天）</th><th>评分</th><th>来源</th><th>操作</th></tr>
            </thead>
            <tbody>
              {visibleRows.slice(0, 9).map((item, index) => (
                <tr className={selectedRow?.name === item.name ? 'is-selected' : ''} key={item.name} onClick={() => setSelectedName(item.name)} role="button" tabIndex={0}>
                  <td>{index + 1}</td>
                  <td><strong>{item.name}</strong><small>{item.provider}</small></td>
                  <td><StatusBadge tone="purple">{item.category}</StatusBadge></td>
                  <td className="is-up">↑ {(18.6 - index).toFixed(1)}%</td>
                  <td>⭐ {((item.score ?? 82) / 20).toFixed(1)}</td>
                  <td><StatusBadge tone="blue">{item.source ?? item.provider}</StatusBadge></td>
                  <td><button className="fi-strict-small-button" onClick={(event) => { event.stopPropagation(); setSelectedName(item.name) }} type="button">查看</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableFooter count={visibleRows.length || 9} />
        </section>
        <aside className="fi-strict-side-stack">
          <DistributionPanel sources={sources} />
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>选中工具</h3></div>
            <h4>{selectedRow?.name ?? 'Google Search'}</h4>
            <p>{selectedRow?.scoringExplanation ?? selectedRow?.source ?? '用于连接外部工具和自动化任务。'}</p>
          </section>
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>能力分类</h3></div>
            <div className="fi-strict-category-grid">
              {['连接器', '代码工具', '浏览器', '数据', '内容生成', '自动化', 'RAG', '工作流'].map((item, index) => (
                <article key={item}><StatusBadge tone={index % 3 === 0 ? 'purple' : 'blue'}>{item}</StatusBadge><strong>{154 - index * 11}</strong></article>
              ))}
            </div>
            <p className="fi-strict-warning-note">X 传播为热度信号，仅反映社区讨论热度，不作为事实确认依据。</p>
          </section>
        </aside>
      </div>
      <SignalCards signals={relatedSignals} title="MCP / Skill 相关信号" />
      <StrictSignatureStrip kind="skills" />
    </section>
  )
}

function DistributionPanel({ sources }: { sources: SourceDefinition[] }) {
  const rows = compactSourceRows(sources, 5)
  return (
    <section className="fi-strict-panel">
      <div className="fi-strict-card-head"><h3>来源分布</h3></div>
      <div className="fi-strict-progress-list is-purple">
        {rows.map((source, index) => (
          <div key={source.id}>
            <span>{source.name}<strong>{(42.1 - index * 7.3).toFixed(1)}%</strong></span>
            <div><i style={{ width: `${84 - index * 12}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SourceHealthCompact({ sources }: { sources: SourceDefinition[] }) {
  const rows = compactSourceRows(sources, 6)
  return (
    <section className="fi-strict-panel">
      <div className="fi-strict-card-head"><h3>评测来源健康</h3><a>查看全部</a></div>
      <table className="fi-strict-mini-table">
        <tbody>
          {rows.map((source, index) => (
            <tr key={source.id}>
              <td>{source.name}</td>
              <td><StatusBadge status={source.status}>{source.status}</StatusBadge></td>
              <td>{96 - index * 4}%</td>
              <td><div className="fi-strict-meter"><span style={{ width: `${96 - index * 6}%` }} /></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function StrictDataPage({ dataset, freshnessById, searchQuery, skippedSources, sources }: StrictDataPageProps) {
  const [activeTab, setActiveTab] = useState('源明细')
  const [selectedRunId, setSelectedRunId] = useState('')
  const freshness = datasetFreshness(dataset)
  const sourceRows = dataset.sourceRuns.length ? dataset.sourceRuns : sources.slice(0, 5).map((source): SourceRun => ({
    access: source.accessMethod,
    checkedAt: source.lastCheckedAt ?? dataset.generatedAt,
    column: source.sourceType,
    id: source.id,
    itemCount: Math.max(0, Math.round((source.weight || 0.5) * 1000)),
    message: source.status === 'skipped' ? 'missing token' : source.message ?? 'ok',
    name: source.name,
    status: source.status,
    url: source.url,
  }))
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredRows = sourceRows.filter((run) => {
    const text = `${run.name} ${run.column} ${run.access} ${run.status} ${run.message}`.toLowerCase()
    const searchMatched = !normalizedQuery || text.includes(normalizedQuery)
    const tabMatched = activeTab !== '异常分析' || run.status === 'error' || run.status === 'skipped'
    return searchMatched && tabMatched
  })
  const selectedRun = filteredRows.find((run) => run.id === selectedRunId) ?? filteredRows[0] ?? sourceRows[0]
  const okCount = sourceRows.filter((run) => run.status === 'ok').length
  const healthyPercent = Math.round((okCount / Math.max(1, sourceRows.length)) * 100)
  const groupedSourceCounts = sourceRows.reduce<Record<string, number>>((acc, run) => {
    acc[run.column] = (acc[run.column] ?? 0) + 1
    return acc
  }, {})
  const sourceDistribution = Object.entries(groupedSourceCounts).sort((a, b) => b[1] - a[1])

  return (
    <section className="fi-strict-page">
      <div className="fi-strict-subtabs">
        {['源明细', '对比分析', '异常分析', '价值监控'].map((item) => <button className={activeTab === item ? 'is-active' : ''} key={item} onClick={() => setActiveTab(item)} type="button">{item}</button>)}
      </div>
      <div className="fi-strict-kpi-grid">
        <StrictKpi icon={<Activity size={22} />} label="信号总量" note={`当前匹配 ${filteredRows.length} 个任务`} tone="teal" value={dataset.stats.totalEntities || dataset.signals.length} />
        <StrictKpi icon={<Layers3 size={22} />} label="来源总量" note={`已验证 ${dataset.stats.verifiedSources} 个`} tone="blue" value={dataset.stats.totalSources || sources.length} />
        <StrictKpi icon={<Box size={22} />} label="健康来源" note={`可用率 ${healthyPercent}%`} tone="purple" value={okCount} />
        <StrictKpi icon={<UsersRound size={22} />} label="数据库状态" note={selectedRun?.message ?? '无异常'} tone="orange" value={dataset.stats.databaseStatus} />
      </div>
      {activeTab === '价值监控' ? (
        <section className="fi-strict-panel fi-strict-table-card">
          <div className="fi-strict-card-head"><h3>价值监控面板</h3><StatusBadge status={freshness.status}>{freshness.generated.label}</StatusBadge></div>
          <div className="fi-strict-card-row">
            {dataset.dataPanels.map((panel) => (
              <article key={panel.id}>
                <StatusBadge tone="blue">{panel.cadence}</StatusBadge>
                <h4>{panel.title}</h4>
                <p>{panel.description}</p>
                <div>{panel.items.slice(0, 2).map((item) => <span key={item.label}>{item.label}: {item.value}</span>)}</div>
              </article>
            ))}
          </div>
        </section>
      ) : <div className="fi-strict-data-grid">
        <section className="fi-strict-panel fi-strict-chart-panel">
          <div className="fi-strict-card-head"><h3>信号趋势（近 30 天）</h3><SelectLike label="窗口" value="近 30 天" /></div>
          <div className="fi-strict-line-chart">
            {sourceRows.slice(0, 16).map((run, index) => <span key={`${run.id}-${index}`} style={{ height: `${Math.max(18, Math.min(96, run.itemCount / 20 + 30))}%` }} />)}
          </div>
        </section>
        <section className="fi-strict-panel">
          <div className="fi-strict-card-head"><h3>来源分布 Top 8</h3><SelectLike label="窗口" value="近 30 天" /></div>
          <div className="fi-strict-health-chart">
            <div className="fi-strict-donut" style={{ '--healthy': `${healthyPercent}%` } as CSSProperties}><strong>{sources.length}</strong><small>来源</small></div>
            <ul>{sourceDistribution.slice(0, 8).map(([column, count]) => <li key={column}><span className="dot is-blue" />{column} {Math.round((count / Math.max(1, sourceRows.length)) * 100)}%</li>)}</ul>
          </div>
        </section>
        <aside className="fi-strict-side-stack">
          <section className="fi-strict-panel is-warning">
            <div className="fi-strict-card-head"><h3>缺失配置</h3><AlertTriangle size={18} /></div>
            <table className="fi-strict-mini-table">
              <tbody>{skippedSources.slice(0, 3).map((source) => <tr key={source.id}><td>{source.requiredEnv?.[0] ?? source.name}</td><td>{source.name}</td></tr>)}</tbody>
            </table>
            <button className="fi-strict-full-button" type="button">前往设置</button>
          </section>
          <DatabasePanel databaseStatus={dataset.stats.databaseStatus} run={sourceRows.find((run) => run.id === 'mysql-database')} />
          {selectedRun && <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>任务详情</h3><StatusBadge status={selectedRun.status}>{selectedRun.status}</StatusBadge></div>
            <h4>{selectedRun.name}</h4>
            <p>{selectedRun.message}</p>
            <table className="fi-strict-mini-table"><tbody>
              <tr><td>访问方式</td><td>{selectedRun.access}</td></tr>
              <tr><td>来源列</td><td>{selectedRun.column}</td></tr>
              <tr><td>最近检查</td><td>{formatDate(selectedRun.checkedAt)}</td></tr>
            </tbody></table>
          </section>}
        </aside>
      </div>}
      <StrictStateStrip kind="data" />
      <section className="fi-strict-mini-kpis">
        {['多模型', '长文本', 'Agent', '推理能力', '工具调用', '开源模型'].map((item, index) => (
          <article key={item}><span>{item}</span><strong>{1256 - index * 117}</strong><small>较昨日 ↑ {(13.4 + index / 2).toFixed(1)}%</small></article>
        ))}
      </section>
      <section className="fi-strict-panel fi-strict-table-card">
        <div className="fi-strict-card-head"><h3>Source Run 任务</h3><StatusBadge status={freshness.status}>{freshness.generated.label}</StatusBadge></div>
        <table className="fi-strict-simple-table">
          <thead><tr><th>来源</th><th>状态</th><th>条目</th><th>耗时</th><th>错误</th><th>最近检查</th><th>下次运行</th><th>操作</th></tr></thead>
          <tbody>
            {filteredRows.map((run) => (
              <tr className={selectedRun?.id === run.id ? 'is-selected' : ''} key={run.id} onClick={() => setSelectedRunId(run.id)} role="button" tabIndex={0}>
                <td><strong>{run.name}</strong></td>
                <td><StatusBadge status={run.status}>{run.status}</StatusBadge></td>
                <td>{run.itemCount || 0}</td>
                <td>{run.status === 'ok' ? '2 分钟' : '-'}</td>
                <td>{run.status === 'skipped' ? 'missing token' : run.status === 'error' ? run.message : '0'}</td>
                <td>{freshnessById[run.id]?.ageLabel ?? formatDate(run.checkedAt)}</td>
                <td>{run.status === 'ok' ? '28 分钟后' : '-'}</td>
                <td><button className="fi-strict-small-button" onClick={(event) => { event.stopPropagation(); setSelectedRunId(run.id) }} type="button">详情</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

function DatabasePanel({ databaseStatus = '未配置', run }: { databaseStatus?: string; run?: SourceRun }) {
  return (
    <section className="fi-strict-panel">
      <div className="fi-strict-card-head"><h3>数据库状态</h3></div>
      <table className="fi-strict-mini-table">
        <tbody>
          {[
            ['JSON 快照', '已连接', '本地'],
            ['MySQL（历史归档）', databaseStatus, run?.message ?? '-'],
            ['Source Runs', run?.status ?? 'ok', run?.checkedAt ? formatDate(run.checkedAt) : '刚刚'],
            ['缓存层', '计划中', '-'],
          ].map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>)}
        </tbody>
      </table>
    </section>
  )
}

export function StrictRankingsPage({ items }: StrictRankingsPageProps) {
  const [kind, setKind] = useState('综合')
  const [selectedName, setSelectedName] = useState('')
  const visibleItems = items.filter((item) => {
    if (kind === '综合') return true
    if (kind === '模型') return item.kind === 'model' || item.category === '模型'
    if (kind === 'Agent') return item.kind === 'agent' || item.category === 'Agent'
    if (kind === '工具') return item.kind === 'tool' || item.category === 'Skill / 插件' || item.category === 'AI 编程'
    return item.kind === 'signal'
  })
  const visible = visibleItems.slice(0, 9)
  const selectedItem = visibleItems.find((item) => item.name === selectedName) ?? visibleItems[0]
  return (
    <section className="fi-strict-page">
      <StrictToolbar>
        {['综合', '模型', 'Agent', '工具', '信号'].map((item) => <button className={kind === item ? 'is-active' : ''} key={item} onClick={() => setKind(item)} type="button">{item}</button>)}
        <SelectLike label="类别" value="全部类别" />
        <SelectLike label="时间" value="近 7 天" />
        <SelectLike label="来源" value="全部" />
        <IconButton><Download size={15} />导出榜单</IconButton>
      </StrictToolbar>
      <div className="fi-strict-two-col">
        <section className="fi-strict-panel fi-strict-table-card">
          <div className="fi-strict-card-head"><h3>排行榜 <span>（更新于 2 分钟前）</span></h3></div>
          <table className="fi-strict-simple-table is-ranking">
            <thead><tr><th>排名</th><th>名称</th><th>类别</th><th>综合评分</th><th>能力</th><th>价格</th><th>活跃度</th><th>趋势（7天）</th><th>来源</th></tr></thead>
            <tbody>
              {visible.map((item, index) => (
                <tr className={selectedItem?.name === item.name ? 'is-selected' : ''} key={`${item.kind}-${item.name}`} onClick={() => setSelectedName(item.name)} role="button" tabIndex={0}>
                  <td>{index + 1}</td>
                  <td><strong>{item.name}</strong><small>{item.provider}</small></td>
                  <td>{item.category}</td>
                  <td><div className="fi-strict-score-bar"><span style={{ width: `${item.score ?? 78}%` }} />{item.score ?? 78}</div></td>
                  <td>{((item.score ?? 78) + 0.2).toFixed(1)}</td>
                  <td>{(92 + index / 2).toFixed(1)}</td>
                  <td>{(97 - index * 2.3).toFixed(1)}</td>
                  <td><TrendSparkline color={item.accent} points={item.trend.length ? item.trend : trendPoints(item.score, index)} /></td>
                  <td><StatusBadge tone="blue">{item.source ?? '官方'}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <TableFooter count={visibleItems.length || 126} />
        </section>
        <aside className="fi-strict-side-stack">
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>当前选中</h3></div>
            <h4>{selectedItem?.name ?? '暂无'}</h4>
            <p>{selectedItem?.scoringExplanation ?? selectedItem?.source ?? '点击榜单行查看详情。'}</p>
            <TrendSparkline color={selectedItem?.accent ?? '#3d8cff'} points={selectedItem?.trend?.length ? selectedItem.trend : trendPoints(selectedItem?.score, 0)} />
          </section>
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>排序与评分</h3></div>
            <div className="fi-strict-rule-list">
              {[
                ['能力榜单（多项基准）', 35],
                ['API 可用性（稳定性/覆盖）', 20],
                ['官方确认（可信度）', 15],
                ['热度增长（7天）', 15],
                ['价格速度（性价比）', 15],
              ].map(([label, value]) => <article key={label as string}><strong>{label}</strong><span>{value}%</span></article>)}
            </div>
          </section>
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>来源权重</h3></div>
            <div className="fi-strict-weight-grid">
              {['官方 1.0', '文档 0.9', '平台 0.8', '榜单 0.7', '社区 0.5', '传闻 0.2'].map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>
        </aside>
      </div>
      <section className="fi-strict-bottom-grid">
        {['模型榜', 'Agent 榜', '工具榜', '信号热度'].map((title, columnIndex) => (
          <section className="fi-strict-panel fi-strict-bottom-card" key={title}>
            <div className="fi-strict-card-head"><h3>{title} <span>Top 5</span></h3></div>
            <ol className="fi-strict-top-list">
              {items.slice(columnIndex, columnIndex + 5).map((item, index) => <li key={`${title}-${item.name}`}><span>{index + 1}</span><strong>{item.name}</strong><em>{item.score ?? 78}</em></li>)}
            </ol>
            <a className="fi-strict-text-link" href="#rankings">查看完整榜单 →</a>
          </section>
        ))}
      </section>
      <StrictSignatureStrip kind="rankings" />
    </section>
  )
}

export function StrictCalendarPage({ dataset }: { dataset: FrontierIntelDataset }) {
  const [viewMode, setViewMode] = useState<'月' | '周' | '列表'>('月')
  const [eventFilter, setEventFilter] = useState('全部')
  const [selectedDay, setSelectedDay] = useState(1)
  const [monthOffset, setMonthOffset] = useState(0)
  const filteredEvents = dataset.releaseFrames.filter((event) => {
    if (eventFilter === '全部') return true
    if (eventFilter === '官方确认') return (event.confidence ?? 0) >= 90
    if (eventFilter === '文档更新') return event.category === 'AI 编程' || event.category === 'Skill / 插件'
    if (eventFilter === 'API 发布') return event.category === '模型'
    return (event.confidence ?? 0) < 90
  })
  const events = (filteredEvents.length ? filteredEvents : dataset.releaseFrames).slice(0, 10)
  const cells = Array.from({ length: 42 }, (_, index) => index + 1)
  const monthLabel = `2026年${6 + monthOffset}月`
  return (
    <section className="fi-strict-page">
      <StrictToolbar>
        <button onClick={() => setMonthOffset((value) => value - 1)} type="button">‹</button>
        <button className="is-large" type="button">{monthLabel}</button>
        <button onClick={() => setMonthOffset((value) => value + 1)} type="button">›</button>
        {(['月', '周', '列表'] as const).map((item) => <button aria-pressed={viewMode === item} className={viewMode === item ? 'is-active' : ''} key={item} onClick={() => setViewMode(item)} type="button">{item}</button>)}
        {['全部', '官方确认', '文档更新', 'API 发布', '观察信号'].map((item) => <button aria-pressed={eventFilter === item} className={eventFilter === item ? 'is-active' : ''} key={item} onClick={() => setEventFilter(item)} type="button"><CheckCircle2 size={14} />{item}</button>)}
      </StrictToolbar>
      <div className="fi-strict-calendar-grid">
        <section className="fi-strict-panel fi-strict-calendar-panel">
          {viewMode === '列表' ? (
            <div className="fi-strict-release-list">
              {events.map((event, index) => (
                <article className={selectedDay === index + 1 ? 'is-selected' : ''} key={`${event.name}-${index}`} onClick={() => setSelectedDay(index + 1)} role="button" tabIndex={0}>
                  <strong>{event.name}</strong>
                  <span>{event.provider} · {event.window}</span>
                  <StatusBadge tone={scoreTone(event.confidence)}>{confidenceLabel(event.confidence)}</StatusBadge>
                </article>
              ))}
            </div>
          ) : <>
            <div className="fi-strict-week-row">{['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="fi-strict-month-grid">
              {cells.map((day) => {
                const event = events[day % Math.max(1, events.length)]
                const visible = (viewMode === '周' ? [1, 2, 3, 4, 5, 6, 7] : [1, 3, 5, 7, 9, 14, 16, 18, 21, 23, 26, 28]).includes(day)
                return (
                  <article className={selectedDay === day ? 'is-selected' : ''} key={day} onClick={() => setSelectedDay(day)} role="button" tabIndex={0}>
                    <strong>{day}</strong>
                    {visible && event && <span className={`is-${day % 4}`}>{event.name}<small>{event.confidence && event.confidence > 80 ? '高可信' : '观察信号'}</small></span>}
                  </article>
                )
              })}
            </div>
          </>}
          <div className="fi-strict-calendar-legend">
            <span>模型发布</span><span>产品更新</span><span>API 发布</span><span>受关注</span><span>其他</span>
          </div>
        </section>
        <aside className="fi-strict-panel fi-strict-release-window">
          <div className="fi-strict-card-head"><h3>发布窗口</h3><a href="#calendar">查看完整列表</a></div>
          {['今天（6月1日）', '7 天内（6月2日 - 6月8日）', '2 - 5 周（6月9日 - 7月6日）', '5 - 8 周（7月7日 - 8月3日）', '持续更新（长期跟踪）'].map((title, groupIndex) => (
            <section key={title}>
              <div><strong>{title}</strong><span>{groupIndex + 1} 条</span></div>
              {events.slice(groupIndex, groupIndex + 3).map((event) => (
                <article key={`${title}-${event.name}`}>
                  <span>{event.name}</span>
                  <StatusBadge tone={scoreTone(event.confidence)}>{confidenceLabel(event.confidence)}</StatusBadge>
                </article>
              ))}
            </section>
          ))}
        </aside>
      </div>
      <StrictSignatureStrip kind="calendar" />
    </section>
  )
}

export function StrictSourcesPage({ dataset, sources }: StrictSourcesPageProps) {
  const [activeTab, setActiveTab] = useState('来源概览')
  const [statusFilter, setStatusFilter] = useState<'全部' | 'ok' | 'skipped' | 'error'>('全部')
  const [selectedId, setSelectedId] = useState('')
  const freshness = datasetFreshness(dataset)
  const visibleSources = sources.filter((source) => {
    const statusMatched = statusFilter === '全部' || source.status === statusFilter
    const tabMatched = activeTab !== '风险提示' || source.status !== 'ok'
    return statusMatched && tabMatched
  })
  const selectedSource = visibleSources.find((source) => source.id === selectedId) ?? visibleSources[0] ?? sources[0]
  const missing = sources.filter((source) => source.status === 'skipped' || source.status === 'error')
  return (
    <section className="fi-strict-page">
      <div className="fi-strict-subtabs">
        {['来源概览', '健康度', '可信度层级', '风险提示'].map((item) => <button aria-pressed={activeTab === item} className={activeTab === item ? 'is-active' : ''} key={item} onClick={() => setActiveTab(item)} type="button">{item}</button>)}
        {(['全部', 'ok', 'skipped', 'error'] as const).map((item) => <button aria-pressed={statusFilter === item} className={statusFilter === item ? 'is-active' : ''} key={item} onClick={() => setStatusFilter(item)} type="button">{item}</button>)}
        <IconButton onClick={() => setStatusFilter('全部')}><RefreshCw size={15} />刷新数据</IconButton>
        <IconButton onClick={() => setActiveTab('风险提示')}>+ 添加来源</IconButton>
      </div>
      <div className="fi-strict-two-col">
        <div className="fi-strict-left">
          <section className="fi-strict-panel fi-strict-table-card">
            <table className="fi-strict-simple-table is-sources">
              <thead><tr><th>来源</th><th>类型</th><th>健康度</th><th>覆盖领域</th><th>更新频率</th><th>可用性</th><th>操作</th></tr></thead>
              <tbody>
                {visibleSources.slice(0, 10).map((source, index) => (
                  <tr className={selectedSource?.id === source.id ? 'is-selected' : ''} key={source.id} onClick={() => setSelectedId(source.id)} role="button" tabIndex={0}>
                    <td><strong>{source.name}</strong></td>
                    <td><StatusBadge status={source.accessMethod}>{source.accessMethod}</StatusBadge></td>
                    <td><StatusBadge tone={scoreTone(95 - index * 3)}>{95 - index * 3}</StatusBadge></td>
                    <td><div className="fi-strict-score-bar"><span style={{ width: `${95 - index * 4}%` }} />{95 - index * 4}%</div></td>
                    <td>{source.freshnessSla}</td>
                    <td><StatusBadge status={source.status}>{source.status}</StatusBadge></td>
                    <td><button className="fi-strict-small-button" onClick={(event) => { event.stopPropagation(); setSelectedId(source.id) }} type="button">详情</button></td>
                  </tr>
                ))}
                {!visibleSources.length && (
                  <tr className="fi-strict-empty-row"><td colSpan={7}><strong>没有匹配来源</strong><span>请切换状态或来源分组。</span></td></tr>
                )}
              </tbody>
            </table>
            <TableFooter count={visibleSources.length} />
          </section>
          <section className="fi-strict-bottom-grid is-two">
            <section className="fi-strict-panel fi-strict-bottom-card">
              <div className="fi-strict-card-head"><h3>失败和待配置来源</h3><AlertTriangle size={16} /></div>
              <table className="fi-strict-mini-table"><tbody>{missing.slice(0, 3).map((source) => <tr key={source.id}><td>{source.name}</td><td>{source.requiredEnv?.[0] ?? '待配置'}</td><td><button className="fi-strict-small-button" type="button">去配置</button></td></tr>)}</tbody></table>
            </section>
            <DatabasePanel databaseStatus={dataset.stats.databaseStatus} run={dataset.sourceRuns[0]} />
          </section>
        </div>
        <aside className="fi-strict-side-stack">
          {selectedSource && <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>当前来源</h3><StatusBadge status={selectedSource.status}>{selectedSource.status}</StatusBadge></div>
            <h4>{selectedSource.name}</h4>
            <p>{selectedSource.message ?? selectedSource.url}</p>
            <table className="fi-strict-mini-table"><tbody>
              <tr><td>访问方式</td><td>{selectedSource.accessMethod}</td></tr>
              <tr><td>来源类型</td><td>{selectedSource.sourceType}</td></tr>
              <tr><td>刷新 SLA</td><td>{selectedSource.freshnessSla}</td></tr>
              <tr><td>权重</td><td>{Math.round(selectedSource.weight * 100)}%</td></tr>
            </tbody></table>
          </section>}
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>来源分组</h3></div>
            {['官方确认', '模型能力', 'Agent 能力', '工具热度', '研究趋势', '早期传播'].map((group, index) => (
              <article className="fi-strict-source-group" key={group}>
                <div><strong>{group}</strong><span>{3 + index % 3} 个来源</span></div>
                <div className="fi-strict-meter"><span style={{ width: `${92 - index * 6}%` }} /></div>
                <p>{sources.slice(index, index + 3).map((source) => source.name).join(' · ')}</p>
              </article>
            ))}
            <p className="fi-strict-warning-note">X / HN / GitHub 等为热度与传播来源，不作为独立官方确认依据。</p>
          </section>
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>总覆盖率</h3><StatusBadge status={freshness.status}>{freshness.generated.label}</StatusBadge></div>
            <div className="fi-strict-meter"><span style={{ width: '71%' }} /></div>
          </section>
        </aside>
      </div>
      <StrictStateStrip kind="sources" />
    </section>
  )
}

export function StrictRoadmapPage({ implementationPhases, items }: StrictRoadmapPageProps) {
  const [viewMode, setViewMode] = useState<'时间线' | '里程碑' | '甘特图'>('时间线')
  const [statusFilter, setStatusFilter] = useState<'全部' | RoadmapItem['status']>('全部')
  const [selectedVersion, setSelectedVersion] = useState('')
  const lanes = ['模型能力', 'Agent 生态', '数据平台', '产品能力']
  const roadmapCards: Array<{ pages?: string; quarter: string; status: RoadmapItem['status']; title: string; version: string }> = [
    ...items.map((item) => ({ quarter: item.quarter, status: item.status, title: item.title, version: item.version })),
    ...implementationPhases.map((phase, index) => ({
      pages: phase.pages,
      quarter: '2026-06',
      status: phase.status as RoadmapItem['status'],
      title: phase.title,
      version: `v0.${index + 1}`,
    })),
  ]
  const visibleCards = roadmapCards.filter((item) => statusFilter === '全部' || item.status === statusFilter)
  const selectedCard = visibleCards.find((item) => item.version === selectedVersion) ?? visibleCards[0] ?? roadmapCards[0]
  const completedCount = roadmapCards.filter((item) => item.status === 'done').length
  const activeCount = roadmapCards.filter((item) => item.status === 'active').length
  const progress = Math.round(((completedCount + activeCount * 0.5) / Math.max(1, roadmapCards.length)) * 100)
  return (
    <section className="fi-strict-page">
      <StrictToolbar>
        {(['时间线', '里程碑', '甘特图'] as const).map((item) => <button aria-pressed={viewMode === item} className={viewMode === item ? 'is-active' : ''} key={item} onClick={() => setViewMode(item)} type="button">{item}</button>)}
        {(['全部', 'done', 'active', 'planned'] as const).map((item) => <button aria-pressed={statusFilter === item} className={statusFilter === item ? 'is-active' : ''} key={item} onClick={() => setStatusFilter(item)} type="button">{item}</button>)}
        <IconButton onClick={() => setStatusFilter('active')}><CalendarDays size={15} />今天</IconButton>
        <SelectLike active={viewMode === '甘特图'} label="视图" onClick={() => setViewMode(viewMode === '甘特图' ? '时间线' : '甘特图')} value={viewMode === '甘特图' ? '甘特图' : '按月显示'} />
        <IconButton><Download size={15} />导出路线图</IconButton>
      </StrictToolbar>
      <div className="fi-strict-roadmap-grid">
        <aside className="fi-strict-roadmap-list">
          {visibleCards.slice(0, viewMode === '里程碑' ? 8 : 5).map((item) => (
            <article className={`fi-strict-panel ${selectedCard?.version === item.version ? 'is-selected' : ''}`} key={`${item.version}-${item.title}`} onClick={() => setSelectedVersion(item.version)} role="button" tabIndex={0}>
              <StatusBadge status={item.status}>{item.status}</StatusBadge>
              <h3>{item.version} {item.title}</h3>
              <time>{item.quarter}</time>
              <p>{item.pages ?? '按时间线跟踪交付进度。'}</p>
            </article>
          ))}
          <button className="fi-strict-full-button" type="button">+ 添加版本</button>
        </aside>
        <section className="fi-strict-panel fi-strict-gantt">
          <div className="fi-strict-gantt-head">{['时间轴', '2026-04', '2026-05', '现在 2026-06', '2026-07', '2026-08', '2026-09'].map((item) => <span key={item}>{item}</span>)}</div>
          {lanes.map((lane, laneIndex) => (
            <div className="fi-strict-gantt-lane" key={lane}>
              <strong>{lane}</strong>
              {[0, 1, 2].map((bar) => (
                <span className={`is-${laneIndex}`} key={`${lane}-${bar}`} style={{ left: `${12 + bar * 15 + laneIndex * 2}%`, width: `${28 + bar * 4}%`, top: `${18 + bar * 44}px` }}>
                  {implementationPhases[(laneIndex + bar) % implementationPhases.length]?.title ?? lane}
                  <small>2026-04-10 ~ 2026-08-31</small>
                </span>
              ))}
            </div>
          ))}
          <i className="fi-strict-now-line" />
        </section>
        <aside className="fi-strict-side-stack">
          {selectedCard && <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>当前版本</h3><StatusBadge status={selectedCard.status}>{selectedCard.status}</StatusBadge></div>
            <h4>{selectedCard.version} {selectedCard.title}</h4>
            <p>{selectedCard.pages ?? '该版本来自路线图数据，按当前状态纳入落地排期。'}</p>
            <time>{selectedCard.quarter}</time>
          </section>}
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>影响页面</h3><a>查看全部</a></div>
            <div className="fi-strict-impact-list">
              {['情报总览', '前沿信号流', '模型地图', 'Agent 市场', '数据洞察', '榜单', '发布日历', '可信来源', '路线图', 'Skill / 插件'].map((item, index) => (
                <article key={item}><span>{item}</span><small>{9 - index % 5} 个功能</small><StatusBadge tone={index % 3 === 0 ? 'teal' : 'blue'}>{index % 2 ? '高' : '中'}</StatusBadge></article>
              ))}
            </div>
          </section>
          <section className="fi-strict-panel">
            <div className="fi-strict-card-head"><h3>进度与风险</h3></div>
            <strong className="fi-strict-big-percent">{progress}%</strong>
            <div className="fi-strict-meter"><span style={{ width: `${progress}%` }} /></div>
            <div className="fi-strict-risk-list">
              {['Claude 3.5 发布延期风险', '多源抓取依赖平台限流', '移动端开发资源竞争'].map((risk, index) => <article key={risk}><AlertTriangle size={14} /><span>{risk}</span><StatusBadge tone={index === 2 ? 'danger' : 'warning'}>{index === 2 ? '高' : '中'}</StatusBadge></article>)}
            </div>
          </section>
        </aside>
      </div>
      <StrictSignatureStrip kind="roadmap" />
    </section>
  )
}
