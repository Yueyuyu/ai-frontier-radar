import { type MouseEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  GitFork,
  Home,
  Link2,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { assessFreshness, datasetFreshness, formatDate, formatRelativeAge } from './components/frontierHelpers'
import { ProviderLogo } from './components/ProviderLogo'
import { StatusBadge } from './components/StatusBadge'
import { useFrontierIntelDataState } from './dataRuntime'
import { applySeo } from './seo'
import type { FrontierIntelDataset, FrontierSignal, SignalSource, SourceDefinition } from './types'
import { canonicalUrl, currentPublicPath, publicHref, signalHref, workspaceHref } from './publicRoutes'

type PublicRoute = { kind: 'home' } | { kind: 'signal'; signalId: string }

type SourceStatusRow = {
  detail: string
  failureRate?: number
  name: string
  retryCount?: number
  status: 'ok' | 'skipped' | 'error'
  url?: string
}

function routeFromPath(path = currentPublicPath()): PublicRoute {
  const match = path.match(/^\/signals\/([^/]+)\/?$/)
  if (match?.[1]) {
    return { kind: 'signal', signalId: decodeURIComponent(match[1]) }
  }
  return { kind: 'home' }
}

function handleNavigate(event: MouseEvent<HTMLAnchorElement>, path: string, onNavigate: (path: string) => void) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  onNavigate(path)
}

function confidenceLabel(value: number) {
  if (value >= 90) return '高可信'
  if (value >= 75) return '可追踪'
  if (value >= 55) return '观察中'
  return '低可信'
}

function sourceStatusLabel(status: string) {
  if (status === 'ok') return '正常'
  if (status === 'skipped') return '待配置'
  if (status === 'error') return '失败'
  return status
}

function sourceTypeLabel(type: SignalSource['type']) {
  const labels: Record<SignalSource['type'], string> = {
    benchmark: '榜单',
    docs: '文档',
    official: '官方',
    platform: '平台',
    rumor: '传闻',
    social: '传播',
  }
  return labels[type]
}

function formatPercent(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0%'
  return `${Math.round(value * 100)}%`
}

function normalizeHost(value?: string) {
  if (!value) return ''
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function sourceDefinitions(dataset: FrontierIntelDataset): SourceDefinition[] {
  if (dataset.sources?.length) return dataset.sources
  return dataset.sourceHealth.map((source, index) => ({
    accessMethod: source.accessMethod ?? 'public-api',
    authRequired: source.authRequired ?? false,
    failedAttempts: source.failedAttempts,
    failedRuns: source.failedRuns,
    failureRate: source.failureRate,
    freshnessSla: source.freshnessSla ?? 'on-refresh',
    id: `fallback-${index}`,
    lastCheckedAt: source.lastCheckedAt,
    message: source.detail,
    name: source.name,
    retryCount: source.retryCount,
    runCount: source.runCount,
    sourceType: source.detail,
    status: source.status ?? 'ok',
    url: source.url ?? '',
    weight: source.weight ?? source.influence / 100,
  }))
}

function sourceStatusRows(dataset: FrontierIntelDataset, signal: FrontierSignal): SourceStatusRow[] {
  const sourceRows = sourceDefinitions(dataset)
  const runRows = dataset.sourceRuns
  const rows = signal.sources.flatMap((evidence) => {
    const evidenceHost = normalizeHost(evidence.url)
    const source = sourceRows.find((item) => {
      const sourceHost = normalizeHost(item.url)
      return item.name === evidence.name
        || item.name.toLowerCase().includes(evidence.name.toLowerCase().split(' ')[0] ?? '')
        || (!!evidenceHost && sourceHost === evidenceHost)
        || (!!evidenceHost && sourceHost.endsWith(evidenceHost))
    })
    const run = runRows.find((item) => {
      const runHost = normalizeHost(item.url)
      return item.name === source?.name
        || item.id === source?.id
        || item.name === evidence.name
        || (!!evidenceHost && runHost === evidenceHost)
        || (!!evidenceHost && runHost.endsWith(evidenceHost))
    })
    const matched = source ?? run
    if (!matched) return []
    return [{
      detail: 'sourceType' in matched ? matched.message ?? matched.sourceType : matched.message,
      failureRate: matched.failureRate,
      name: matched.name,
      retryCount: matched.retryCount,
      status: matched.status,
      url: matched.url,
    }]
  })

  const uniqueRows = new Map<string, SourceStatusRow>()
  for (const row of rows) {
    uniqueRows.set(`${row.name}-${row.url ?? ''}`, row)
  }
  return [...uniqueRows.values()].slice(0, 4)
}

function selectTodaySignals(dataset: FrontierIntelDataset) {
  return dataset.signals
    .slice()
    .sort((a, b) => {
      const aScore = a.confidence * 2 + (a.impactScore ?? 0) + (a.heatScore ?? 0) + (a.sourceCount ?? a.sources.length) * 4
      const bScore = b.confidence * 2 + (b.impactScore ?? 0) + (b.heatScore ?? 0) + (b.sourceCount ?? b.sources.length) * 4
      return bScore - aScore
    })
    .slice(0, 5)
}

function shareTitle(signal: FrontierSignal) {
  return `${signal.title} | AI 前沿情报站`
}

function PublicTopBar({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <header className="fi-public-topbar">
      <a className="fi-public-brand" href={publicHref('/')} onClick={(event) => handleNavigate(event, '/', onNavigate)}>
        <span className="fi-brand-mark">A</span>
        <span>
          <strong>AI 前沿情报站</strong>
          <small>Frontier Intel</small>
        </span>
      </a>
      <nav aria-label="公开页导航">
        <a href={publicHref('/')} onClick={(event) => handleNavigate(event, '/', onNavigate)}><Home size={16} />今日</a>
        <a href={workspaceHref('#overview')}>工作台</a>
        <a href={workspaceHref('#sources')}>来源状态</a>
        <a href="https://github.com/Yueyuyu/ai-frontier-radar" target="_blank" rel="noreferrer" aria-label="GitHub"><GitFork size={16} /></a>
      </nav>
    </header>
  )
}

function PublicFooter({ dataset }: { dataset: FrontierIntelDataset }) {
  const freshness = datasetFreshness(dataset)
  return (
    <footer className="fi-public-footer">
      <span>数据生成：{formatDate(dataset.generatedAt || dataset.stats.generatedAt)}</span>
      <span>来源：{freshness.okCount}/{freshness.totalSources} 正常 · {freshness.skippedCount} 待配置 · {freshness.failedCount} 失败</span>
      <a href={workspaceHref('#data')}>查看数据洞察</a>
    </footer>
  )
}

function TodaySignalCard({ onNavigate, signal }: { onNavigate: (path: string) => void; signal: FrontierSignal }) {
  const href = signalHref(signal.id)
  return (
    <article className="fi-today-card">
      <div className="fi-today-card-head">
        <ProviderLogo provider={signal.provider} showName />
        <StatusBadge confidence={signal.confidence}>{confidenceLabel(signal.confidence)}</StatusBadge>
      </div>
      <a className="fi-today-title" href={href} onClick={(event) => handleNavigate(event, `/signals/${signal.id}`, onNavigate)}>
        <span>{signal.title}</span>
        <ArrowRight size={18} />
      </a>
      <p>{signal.summary}</p>
      <div className="fi-today-meta">
        <span><ShieldCheck size={15} />{signal.sourceCount ?? signal.sources.length} 个证据</span>
        <span><TrendingUp size={15} />影响 {signal.impactScore ?? signal.confidence}</span>
        <span><Clock3 size={15} />{signal.lastUpdate}</span>
      </div>
    </article>
  )
}

function SourceHealthStrip({ dataset }: { dataset: FrontierIntelDataset }) {
  const freshness = datasetFreshness(dataset)
  const items = [
    { icon: CheckCircle2, label: '正常来源', value: freshness.okCount, tone: 'green' },
    { icon: RefreshCw, label: '待配置', value: freshness.skippedCount, tone: 'warning' },
    { icon: AlertTriangle, label: '失败来源', value: freshness.failedCount, tone: 'danger' },
  ]
  return (
    <div className="fi-public-health-strip" aria-label="来源健康">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <span className={`is-${item.tone}`} key={item.label}>
            <Icon size={16} />
            <strong>{item.value}</strong>
            {item.label}
          </span>
        )
      })}
    </div>
  )
}

function HomePage({ dataset, loading, onNavigate }: { dataset: FrontierIntelDataset; loading: boolean; onNavigate: (path: string) => void }) {
  const todaySignals = useMemo(() => selectTodaySignals(dataset), [dataset])
  const freshness = datasetFreshness(dataset)

  useEffect(() => {
    applySeo({
      description: '30 秒读懂今天最重要的 AI 模型、Agent、工具和来源变化，带可信度、证据数量和可追踪详情页。',
      path: '/',
      title: '今日 AI 前沿 | AI 前沿情报站',
    })
  }, [])

  return (
    <main className="fi-public">
      <PublicTopBar onNavigate={onNavigate} />
      <section className="fi-public-hero">
        <div>
          <span className="fi-public-kicker"><Sparkles size={16} />今日 AI 前沿</span>
          <h1>今天最值得关注的 AI 变化</h1>
          <p>从官方公告、榜单、GitHub、HN、X 和产品发布里筛出 3 到 5 条高价值信号，保留结论和证据入口，适合移动端快速转发。</p>
        </div>
        <aside className="fi-public-sync">
          <span>{loading ? '刷新中' : '已同步'}</span>
          <strong>{formatRelativeAge(dataset.generatedAt || dataset.stats.generatedAt)}</strong>
          <small>{freshness.generated.label} · {dataset.stats.totalSources} 个来源</small>
        </aside>
      </section>
      <SourceHealthStrip dataset={dataset} />
      <section className="fi-today-feed" aria-labelledby="today-feed-title">
        <div className="fi-public-section-head">
          <div>
            <span>Today's Signals</span>
            <h2 id="today-feed-title">重点信号</h2>
          </div>
          <a href={workspaceHref('#signals')}>进入深度工作台 <ArrowRight size={16} /></a>
        </div>
        <div className="fi-today-list">
          {todaySignals.map((signal) => <TodaySignalCard key={signal.id} onNavigate={onNavigate} signal={signal} />)}
        </div>
      </section>
      <PublicFooter dataset={dataset} />
    </main>
  )
}

function NotFoundPage({ dataset, onNavigate, signalId }: { dataset: FrontierIntelDataset; onNavigate: (path: string) => void; signalId: string }) {
  useEffect(() => {
    applySeo({
      description: '该 AI 前沿信号暂未收录，可返回今日 AI 前沿查看当前高价值信号。',
      path: `/signals/${signalId}`,
      title: '信号未收录 | AI 前沿情报站',
    })
  }, [signalId])

  return (
    <main className="fi-public">
      <PublicTopBar onNavigate={onNavigate} />
      <section className="fi-public-empty">
        <BarChart3 size={30} />
        <h1>信号暂未收录</h1>
        <p>当前数据集中没有 `{signalId}`。可以回到今日 AI 前沿，或进入工作台按来源和类别筛选。</p>
        <div>
          <a href={publicHref('/')} onClick={(event) => handleNavigate(event, '/', onNavigate)}>返回今日</a>
          <a href={workspaceHref('#signals')}>打开工作台</a>
        </div>
      </section>
      <section className="fi-today-feed">
        <div className="fi-today-list">
          {selectTodaySignals(dataset).slice(0, 3).map((signal) => <TodaySignalCard key={signal.id} onNavigate={onNavigate} signal={signal} />)}
        </div>
      </section>
    </main>
  )
}

function EvidenceChain({ signal }: { signal: FrontierSignal }) {
  return (
    <section className="fi-detail-section">
      <div className="fi-public-section-head">
        <div>
          <span>Evidence Chain</span>
          <h2>证据链</h2>
        </div>
      </div>
      <div className="fi-evidence-chain">
        {signal.sources.map((source, index) => (
          <a href={source.url} key={`${source.name}-${index}`} target="_blank" rel="noreferrer">
            <span>{index + 1}</span>
            <div>
              <strong>{source.name}</strong>
              <small>{sourceTypeLabel(source.type)} · 强度 {source.strength}</small>
              <p>{source.detail}</p>
            </div>
            <ExternalLink size={15} />
          </a>
        ))}
      </div>
    </section>
  )
}

function SourceStatusPanel({ dataset, signal }: { dataset: FrontierIntelDataset; signal: FrontierSignal }) {
  const rows = sourceStatusRows(dataset, signal)
  const fallbackRows: SourceStatusRow[] = sourceDefinitions(dataset).slice(0, 3).map((source) => ({
    detail: source.message ?? source.sourceType,
    failureRate: source.failureRate,
    name: source.name,
    retryCount: source.retryCount,
    status: source.status,
    url: source.url,
  }))

  return (
    <section className="fi-detail-section">
      <div className="fi-public-section-head">
        <div>
          <span>Source Status</span>
          <h2>来源状态</h2>
        </div>
        <a href={workspaceHref('#sources')}>全部来源 <ArrowRight size={16} /></a>
      </div>
      <div className="fi-source-status-list">
        {(rows.length ? rows : fallbackRows).map((row) => (
          <a href={row.url} key={`${row.name}-${row.url ?? ''}`} target="_blank" rel="noreferrer">
            <StatusBadge status={row.status}>{sourceStatusLabel(row.status)}</StatusBadge>
            <div>
              <strong>{row.name}</strong>
              <span>{row.detail || '已纳入来源健康追踪'}</span>
            </div>
            <small>失败率 {formatPercent(row.failureRate)} · 重试 {row.retryCount ?? 0}</small>
          </a>
        ))}
      </div>
    </section>
  )
}

function RelatedSignals({ dataset, onNavigate, signal }: { dataset: FrontierIntelDataset; onNavigate: (path: string) => void; signal: FrontierSignal }) {
  const related = signal.relatedSignalIds
    ?.map((id) => dataset.signals.find((item) => item.id === id))
    .filter((item): item is FrontierSignal => Boolean(item))
    .slice(0, 3) ?? []

  if (!related.length) return null

  return (
    <section className="fi-detail-section">
      <div className="fi-public-section-head">
        <div>
          <span>Related</span>
          <h2>相关信号</h2>
        </div>
      </div>
      <div className="fi-related-public-list">
        {related.map((item) => (
          <a href={signalHref(item.id)} key={item.id} onClick={(event) => handleNavigate(event, `/signals/${item.id}`, onNavigate)}>
            <ProviderLogo provider={item.provider} />
            <span>{item.title}</span>
            <StatusBadge confidence={item.confidence}>{confidenceLabel(item.confidence)}</StatusBadge>
          </a>
        ))}
      </div>
    </section>
  )
}

function SignalDetailPage({ dataset, onNavigate, signal }: { dataset: FrontierIntelDataset; onNavigate: (path: string) => void; signal: FrontierSignal }) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const pagePath = `/signals/${signal.id}`
  const pageUrl = canonicalUrl(pagePath)
  const generatedAt = dataset.generatedAt || dataset.stats.generatedAt
  const sourceRows = sourceStatusRows(dataset, signal)
  const freshestSource = sourceRows
    .map((row) => sourceDefinitions(dataset).find((source) => source.name === row.name))
    .filter((source): source is SourceDefinition => Boolean(source?.lastCheckedAt))
    .map((source) => assessFreshness(source.lastCheckedAt, source.freshnessSla, source.status))
    .sort((a, b) => (a.minutesOld ?? Number.POSITIVE_INFINITY) - (b.minutesOld ?? Number.POSITIVE_INFINITY))[0]

  useEffect(() => {
    applySeo({
      description: `${signal.summary} 可信度 ${signal.confidence}%，证据 ${signal.sourceCount ?? signal.sources.length} 个。`,
      path: pagePath,
      title: shareTitle(signal),
      type: 'article',
    })
  }, [pagePath, signal])

  const share = async () => {
    const data = {
      text: signal.summary,
      title: shareTitle(signal),
      url: pageUrl,
    }
    try {
      if ('share' in navigator && typeof navigator.share === 'function') {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(pageUrl)
      }
      setShareState('copied')
    } catch {
      setShareState('failed')
    }
  }

  return (
    <main className="fi-public fi-public-detail">
      <PublicTopBar onNavigate={onNavigate} />
      <a className="fi-detail-back" href={publicHref('/')} onClick={(event) => handleNavigate(event, '/', onNavigate)}>
        <ArrowLeft size={16} />返回今日 AI 前沿
      </a>
      <section className="fi-detail-hero">
        <div className="fi-detail-title">
          <ProviderLogo provider={signal.provider} showName size="lg" />
          <h1>{signal.title}</h1>
          <p>{signal.summary}</p>
          <div className="fi-detail-actions">
            <button onClick={share} type="button"><Share2 size={16} />分享</button>
            <a href={pageUrl}><Link2 size={16} />稳定链接</a>
            <a href={workspaceHref('#signals')}>工作台查看 <ArrowRight size={16} /></a>
          </div>
          {shareState === 'copied' ? <span className="fi-share-state"><Copy size={14} />链接已复制</span> : null}
          {shareState === 'failed' ? <span className="fi-share-state is-failed">分享失败，请手动复制链接</span> : null}
        </div>
        <div className="fi-detail-score">
          <span>可信度</span>
          <strong>{signal.confidence}</strong>
          <StatusBadge confidence={signal.confidence}>{confidenceLabel(signal.confidence)}</StatusBadge>
          <div className="fi-detail-progress"><span style={{ width: `${signal.confidence}%` }} /></div>
        </div>
      </section>
      <section className="fi-detail-metrics-public" aria-label="信号指标">
        <article>
          <ShieldCheck size={18} />
          <span>证据数量</span>
          <strong>{signal.sourceCount ?? signal.sources.length}</strong>
        </article>
        <article>
          <TrendingUp size={18} />
          <span>影响</span>
          <strong>{signal.impactScore ?? signal.confidence}</strong>
        </article>
        <article>
          <BarChart3 size={18} />
          <span>热度</span>
          <strong>{signal.heatScore ?? signal.confidence}</strong>
        </article>
        <article>
          <Clock3 size={18} />
          <span>更新时间</span>
          <strong>{signal.lastUpdate || formatRelativeAge(generatedAt)}</strong>
        </article>
      </section>
      <section className="fi-detail-section">
        <div className="fi-public-section-head">
          <div>
            <span>Conclusion</span>
            <h2>结论</h2>
          </div>
        </div>
        <div className="fi-detail-copy-grid">
          <article>
            <strong>判断</strong>
            <p>{signal.summary}</p>
          </article>
          <article>
            <strong>影响</strong>
            <p>{signal.provider} 的 {signal.name} 属于 {signal.category} 信号，当前发布窗口为 {signal.releaseWindow}；优先关注 API 可用性、价格、能力评测和生态采用速度。</p>
          </article>
          <article>
            <strong>可信度</strong>
            <p>{confidenceLabel(signal.confidence)}，由 {signal.sourceCount ?? signal.sources.length} 条证据支撑；来源最新状态为 {freshestSource?.label ?? '已记录'}。</p>
          </article>
        </div>
      </section>
      <EvidenceChain signal={signal} />
      <SourceStatusPanel dataset={dataset} signal={signal} />
      <section className="fi-detail-section">
        <div className="fi-public-section-head">
          <div>
            <span>Updated</span>
            <h2>更新时间</h2>
          </div>
        </div>
        <div className="fi-updated-panel">
          <span><Clock3 size={16} />数据生成：{formatDate(generatedAt)}</span>
          <span><RefreshCw size={16} />信号更新：{signal.lastUpdate}</span>
          <span><ShieldCheck size={16} />证据状态：{sourceRows.length ? `${sourceRows.filter((row) => row.status === 'ok').length}/${sourceRows.length} 正常` : '等待来源匹配'}</span>
        </div>
      </section>
      <RelatedSignals dataset={dataset} onNavigate={onNavigate} signal={signal} />
      <PublicFooter dataset={dataset} />
    </main>
  )
}

export function PublicWebApp() {
  const dataState = useFrontierIntelDataState()
  const dataset = dataState.dataset
  const [route, setRoute] = useState<PublicRoute>(() => routeFromPath())

  useEffect(() => {
    const onPopState = () => setRoute(routeFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState(null, '', publicHref(path))
    setRoute(routeFromPath(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (route.kind === 'signal') {
    const signal = dataset.signals.find((item) => item.id === route.signalId)
    if (!signal) return <NotFoundPage dataset={dataset} onNavigate={navigate} signalId={route.signalId} />
    return <SignalDetailPage dataset={dataset} onNavigate={navigate} signal={signal} />
  }

  return <HomePage dataset={dataset} loading={dataState.loading} onNavigate={navigate} />
}
