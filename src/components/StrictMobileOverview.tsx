import { CheckCircle2, ChevronRight, Clock3, ExternalLink, FileText, Filter, Home, LoaderCircle, Menu, Newspaper, RefreshCw, Search, Shield, ShieldCheck, Trophy, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FrontierIntelDataset, FrontierSignal, SignalSource } from '../types'
import { StatusBadge } from './StatusBadge'

type StrictMobileOverviewProps = {
  dataset: FrontierIntelDataset
  onSelect: (id: string) => void
  selectedSignal: FrontierSignal
  signals: FrontierSignal[]
}

type MobileFilterKey = 'all' | 'high' | 'chinese' | 'following'

function brandTone(name: string) {
  if (name.includes('Claude') || name.includes('Anthropic')) return 'is-warm'
  if (name.includes('Agent') || name.includes('Arena')) return 'is-purple'
  return 'is-teal'
}

function evidenceLabel(source?: SignalSource) {
  if (!source) return '来源'
  if (source.type === 'official') return '官方'
  if (source.type === 'docs') return '文档'
  if (source.type === 'platform') return '平台'
  if (source.type === 'benchmark') return '榜单'
  if (source.type === 'social') return '热度'
  return '传闻'
}

function hasChineseText(value: string) {
  return /[\u4e00-\u9fff]/.test(value)
}

function signalHasChinese(signal: FrontierSignal) {
  return [
    signal.provider,
    signal.name,
    signal.category,
    signal.releaseWindow,
    signal.title,
    signal.summary,
    ...signal.sources.flatMap((source) => [source.name, source.detail]),
  ].some(hasChineseText)
}

function initialFollowedSignalIds(signals: FrontierSignal[]) {
  return new Set(signals.slice(0, Math.min(6, signals.length)).map((signal) => signal.id))
}

function matchesMobileFilter(signal: FrontierSignal, filter: MobileFilterKey, followedIds: Set<string>) {
  if (filter === 'high') return signal.confidence >= 85
  if (filter === 'chinese') return signalHasChinese(signal)
  if (filter === 'following') return followedIds.has(signal.id)
  return true
}

function MobileSignalCard({ onSelect, signal }: { onSelect: (id: string) => void; signal: FrontierSignal }) {
  return (
    <button aria-label={`查看信号详情：${signal.title}`} className="fi-mobile-signal-card" onClick={() => onSelect(signal.id)} type="button">
      <span className={`fi-mobile-provider ${brandTone(signal.title)}`}>{signal.name.slice(0, 1)}</span>
      <span className="fi-mobile-signal-main">
        <span className="fi-mobile-signal-title">
          <strong>{signal.title}</strong>
          <StatusBadge category={signal.category}>{signal.level === 'official' ? '官方' : signal.category === 'AI 编程' ? '文档' : signal.category === 'Agent' ? '榜单' : evidenceLabel(signal.sources[0])}</StatusBadge>
        </span>
        <span>{signal.summary}</span>
        <span className="fi-mobile-card-meta">
          <em>证据 <b>{signal.sources.length}</b></em>
          <em>可信度 <b>{signal.confidence}%</b> <StatusBadge confidence={signal.confidence}>{signal.confidence >= 85 ? '高' : '中'}</StatusBadge></em>
        </span>
      </span>
      <span className="fi-mobile-card-time">{signal.lastUpdate}</span>
      <ChevronRight size={20} />
    </button>
  )
}

function MobileEvidenceTile({ source }: { source: SignalSource }) {
  return (
    <article>
      <strong>{source.name}</strong>
      <StatusBadge status={source.type}>{evidenceLabel(source)}</StatusBadge>
      <span>{source.detail}</span>
    </article>
  )
}

function MobileSignalSheet({ onClose, signal }: { onClose: () => void; signal: FrontierSignal }) {
  return (
    <section className="fi-mobile-signal-sheet" aria-label="信号详情" aria-modal="true" role="dialog">
      <span className="fi-mobile-sheet-handle" />
      <div className="fi-mobile-sheet-head">
        <h2>信号详情</h2>
        <button aria-label="关闭信号详情" onClick={onClose} type="button"><X size={22} /></button>
      </div>
      <div className="fi-mobile-sheet-title">
        <span className={`fi-mobile-provider ${brandTone(signal.title)}`}>{signal.name.slice(0, 1)}</span>
        <h3>{signal.title}</h3>
        <StatusBadge category={signal.category}>{signal.level === 'official' ? '官方' : evidenceLabel(signal.sources[0])}</StatusBadge>
      </div>
      <p>{signal.summary}</p>
      <div className="fi-mobile-sheet-metrics">
        <span><Clock3 size={16} />{signal.lastUpdate}</span>
        <span><FileText size={16} />证据 {signal.sources.length}</span>
        <span><ShieldCheck size={16} />可信度 <b>{signal.confidence}%</b> <StatusBadge confidence={signal.confidence}>{signal.confidence >= 85 ? '高' : '中'}</StatusBadge></span>
      </div>
      <h4>证据来源</h4>
      <div className="fi-mobile-evidence-grid">
        {signal.sources.slice(0, 3).map((source) => <MobileEvidenceTile key={source.name} source={source} />)}
      </div>
      <button className="fi-mobile-primary-action" type="button">查看来源 <ExternalLink size={17} /></button>
      <button className="fi-mobile-secondary-action" onClick={onClose} type="button">关闭</button>
    </section>
  )
}

function mobileStateMode() {
  if (typeof window === 'undefined') return 'live'
  if (window.location.hash === '#mobile-empty') return 'empty'
  if (window.location.hash === '#mobile-loading') return 'loading'
  return 'live'
}

function useMobileStateMode() {
  const [mode, setMode] = useState(mobileStateMode)

  useEffect(() => {
    const updateMode = () => setMode(mobileStateMode())
    window.addEventListener('hashchange', updateMode)
    return () => window.removeEventListener('hashchange', updateMode)
  }, [])

  return mode
}

function MobileAppHead() {
  return (
    <div className="fi-mobile-app-head">
      <span className="fi-mobile-logo">AI</span>
      <strong>AI 前沿情报站</strong>
      <button aria-label="搜索" type="button"><Search size={24} /></button>
      <button aria-label="菜单" type="button"><Menu size={25} /></button>
    </div>
  )
}

function MobileDesignNav() {
  return (
    <nav className="fi-mobile-design-nav" aria-label="移动端快捷导航">
      <a className="is-active" href="#overview"><Home size={23} />情报</a>
      <a href="#signals"><Newspaper size={22} />信号</a>
      <a href="#rankings"><Trophy size={22} />榜单</a>
      <a href="#sources"><Shield size={22} />来源</a>
    </nav>
  )
}

function MobileEmptyState() {
  return (
    <section className="fi-mobile-overview is-state-only">
      <MobileAppHead />
      <div className="fi-mobile-empty-state">
        <div className="fi-mobile-empty-art"><Search size={58} /></div>
        <strong>暂无信号</strong>
        <span>暂未获取到任何前沿信号</span>
        <button type="button">刷新数据</button>
      </div>
      <MobileDesignNav />
    </section>
  )
}

function MobileLoadingState() {
  return (
    <section className="fi-mobile-overview is-state-only">
      <MobileAppHead />
      <div className="fi-mobile-skeleton-summary">
        <span /><span /><span />
        <i />
      </div>
      <div className="fi-mobile-skeleton-list">
        {Array.from({ length: 4 }, (_, index) => (
          <article key={index}>
            <b />
            <div><span /><span /><span /></div>
            <em />
          </article>
        ))}
      </div>
      <div className="fi-mobile-loading-badge"><LoaderCircle size={16} />加载中</div>
      <MobileDesignNav />
    </section>
  )
}

export function StrictMobileOverview({ dataset, onSelect, selectedSignal, signals }: StrictMobileOverviewProps) {
  const mode = useMobileStateMode()
  const [activeFilter, setActiveFilter] = useState<MobileFilterKey>('all')
  const [sheetSignalId, setSheetSignalId] = useState<string | null>(null)
  const followedSignalIds = useMemo(() => initialFollowedSignalIds(signals), [signals])
  const highConfidenceCount = signals.filter((signal) => signal.confidence >= 85).length
  const sourceCount = Math.max(dataset.stats.verifiedSources, dataset.stats.totalSources, dataset.sourceHealth.length, dataset.sources?.length ?? 0)
  const filterOptions = useMemo(() => [
    { key: 'all' as const, label: '全部', count: signals.length },
    { key: 'high' as const, label: '高置信', count: highConfidenceCount },
    { key: 'chinese' as const, label: '中文', count: signals.filter(signalHasChinese).length },
    { key: 'following' as const, label: '我关注', count: signals.filter((signal) => followedSignalIds.has(signal.id)).length },
  ], [followedSignalIds, highConfidenceCount, signals])
  const visibleSignals = useMemo(
    () => signals.filter((signal) => matchesMobileFilter(signal, activeFilter, followedSignalIds)),
    [activeFilter, followedSignalIds, signals],
  )
  const sheetSignal = sheetSignalId
    ? signals.find((signal) => signal.id === sheetSignalId) ?? (selectedSignal.id === sheetSignalId ? selectedSignal : null)
    : null

  useEffect(() => {
    if (sheetSignalId && !signals.some((signal) => signal.id === sheetSignalId)) {
      setSheetSignalId(null)
    }
  }, [sheetSignalId, signals])

  const selectMobileSignal = (id: string) => {
    onSelect(id)
    setSheetSignalId(id)
  }

  if (mode === 'empty') return <MobileEmptyState />
  if (mode === 'loading') return <MobileLoadingState />
  if (!signals.length) return <MobileEmptyState />

  return (
    <section className="fi-mobile-overview">
      <div className="fi-mobile-app-head">
        <span className="fi-mobile-logo">AI</span>
        <strong>AI 前沿情报站</strong>
        <button aria-label="搜索" type="button"><Search size={24} /></button>
        <button aria-label="菜单" type="button"><Menu size={25} /></button>
      </div>
      <section className="fi-mobile-summary-card">
        <div>
          <h2>今日高置信信号</h2>
          <span>60s 刷新 <RefreshCw size={16} /></span>
        </div>
        <div className="fi-mobile-summary-metrics">
          <strong><b>{highConfidenceCount}</b><span>个高置信</span></strong>
          <strong><b>{sourceCount}</b><span>个来源</span></strong>
          <strong><CheckCircle2 size={26} /><span>健康度 <b>92</b>/100</span></strong>
        </div>
        <div className="fi-mobile-summary-progress"><span /></div>
      </section>
      <div className="fi-mobile-filter-row">
        {filterOptions.map((option) => (
          <button
            aria-pressed={activeFilter === option.key}
            className={activeFilter === option.key ? 'is-active' : undefined}
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            type="button"
          >
            {option.label} {option.count}
          </button>
        ))}
        <button aria-label="筛选选项" title="筛选选项" type="button"><Filter size={20} /></button>
      </div>
      <div className="fi-mobile-card-list">
        {visibleSignals.length ? (
          visibleSignals.map((signal) => <MobileSignalCard key={signal.id} onSelect={selectMobileSignal} signal={signal} />)
        ) : (
          <div className="fi-mobile-empty-state" role="status">
            <div className="fi-mobile-empty-art"><Search size={58} /></div>
            <strong>暂无匹配信号</strong>
            <span>当前筛选下没有可展示的前沿信号</span>
          </div>
        )}
      </div>
      {sheetSignal ? <MobileSignalSheet onClose={() => setSheetSignalId(null)} signal={sheetSignal} /> : null}
      <nav className="fi-mobile-design-nav" aria-label="移动端快捷导航">
        <a className="is-active" href="#overview"><Home size={23} />情报</a>
        <a href="#signals"><Newspaper size={22} />信号</a>
        <a href="#rankings"><Trophy size={22} />榜单</a>
        <a href="#sources"><Shield size={22} />来源</a>
      </nav>
    </section>
  )
}
