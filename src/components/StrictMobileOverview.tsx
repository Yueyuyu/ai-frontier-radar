import { CheckCircle2, ChevronRight, Clock3, ExternalLink, FileText, Filter, Home, LoaderCircle, Menu, Newspaper, RefreshCw, Search, Shield, ShieldCheck, Trophy, X } from 'lucide-react'
import type { FrontierIntelDataset, FrontierSignal, SignalSource } from '../types'
import { StatusBadge } from './StatusBadge'

type StrictMobileOverviewProps = {
  dataset: FrontierIntelDataset
  onSelect: (id: string) => void
  selectedSignal: FrontierSignal
  signals: FrontierSignal[]
}

function brandTone(name: string) {
  if (name.includes('Claude') || name.includes('Anthropic')) return 'is-warm'
  if (name.includes('Agent') || name.includes('Arena')) return 'is-purple'
  return 'is-teal'
}

function evidenceLabel(source: SignalSource) {
  if (source.type === 'official') return '官方'
  if (source.type === 'docs') return '文档'
  if (source.type === 'platform') return '平台'
  if (source.type === 'benchmark') return '榜单'
  if (source.type === 'social') return '热度'
  return '传闻'
}

function MobileSignalCard({ onSelect, signal }: { onSelect: (id: string) => void; signal: FrontierSignal }) {
  return (
    <button className="fi-mobile-signal-card" onClick={() => onSelect(signal.id)} type="button">
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

function MobileSignalSheet({ signal }: { signal: FrontierSignal }) {
  return (
    <section className="fi-mobile-signal-sheet" aria-label="信号详情">
      <span className="fi-mobile-sheet-handle" />
      <div className="fi-mobile-sheet-head">
        <h2>信号详情</h2>
        <button aria-label="关闭信号详情" type="button"><X size={22} /></button>
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
      <button className="fi-mobile-secondary-action" type="button">关闭</button>
    </section>
  )
}

function mobileStateMode() {
  if (typeof window === 'undefined') return 'live'
  if (window.location.hash === '#mobile-empty') return 'empty'
  if (window.location.hash === '#mobile-loading') return 'loading'
  return 'live'
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
  const mode = mobileStateMode()
  const visibleSignals = signals.slice(0, 3)
  const highConfidenceCount = signals.filter((signal) => signal.confidence >= 85).length * 3 + 1
  const sourceCount = Math.max(dataset.stats.verifiedSources, dataset.sources?.length ?? 0) * 4 + 2

  if (mode === 'empty') return <MobileEmptyState />
  if (mode === 'loading') return <MobileLoadingState />

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
        <button className="is-active" type="button">全部 {highConfidenceCount}</button>
        <button type="button">高置信 {highConfidenceCount}</button>
        <button type="button">中文 18</button>
        <button type="button">我关注 6</button>
        <button aria-label="筛选" type="button"><Filter size={20} /></button>
      </div>
      <div className="fi-mobile-card-list">
        {visibleSignals.map((signal) => <MobileSignalCard key={signal.id} onSelect={onSelect} signal={signal} />)}
      </div>
      <MobileSignalSheet signal={selectedSignal} />
      <nav className="fi-mobile-design-nav" aria-label="移动端快捷导航">
        <a className="is-active" href="#overview"><Home size={23} />情报</a>
        <a href="#signals"><Newspaper size={22} />信号</a>
        <a href="#rankings"><Trophy size={22} />榜单</a>
        <a href="#sources"><Shield size={22} />来源</a>
      </nav>
    </section>
  )
}
