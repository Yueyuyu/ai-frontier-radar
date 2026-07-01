import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  CalendarDays,
  Database,
  GitFork,
  Layers3,
  Search,
  ShieldCheck,
  Bell,
  Bookmark,
  CircleHelp,
  Filter,
  LogOut,
  Settings,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import { EmptyState } from './components/EmptyState'
import { assessFreshness, datasetFreshness } from './components/frontierHelpers'
import { MobileSignalDetailDrawer } from './components/MobileSignalDetailDrawer'
import { StatusBadge } from './components/StatusBadge'
import { CoverageMapPage } from './components/CoverageMapPage'
import { ComponentStateBoard } from './components/ComponentStateBoard'
import { StrictOverview } from './components/StrictOverview'
import { StrictCalendarPage, StrictDataPage, StrictDomainPage, StrictRankingsPage, StrictRoadmapPage, StrictSignalsPage, StrictSourcesPage } from './components/StrictPages'
import { useFrontierIntelDataState, type FrontierIntelDataState } from './dataRuntime'
import type { FrontierIntelDataset, FrontierSignal, RankingItem, SourceDefinition } from './types'

type ViewKey = 'coverage' | 'overview' | 'signals' | 'models' | 'agents' | 'skills' | 'data' | 'rankings' | 'calendar' | 'sources' | 'roadmap' | 'components'
type SourceFilter = 'all' | 'official' | 'ranking'

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  view: ViewKey
}

const routeByHash: Record<string, ViewKey> = {
  '#coverage-map': 'coverage',
  '#overview': 'overview',
  '#radar': 'overview',
  '#mobile-empty': 'overview',
  '#mobile-loading': 'overview',
  '#signals': 'signals',
  '#model-rankings': 'models',
  '#agent-rankings': 'agents',
  '#tool-rankings': 'skills',
  '#source-runs': 'data',
  '#rankings': 'rankings',
  '#calendar': 'calendar',
  '#sources': 'sources',
  '#roadmap': 'roadmap',
  '#components-states': 'components',
}

const viewMeta: Record<ViewKey, { title: string; subtitle: string; icon: LucideIcon }> = {
  coverage: { title: '覆盖地图', subtitle: '归档所有设计源图、React 入口、状态与验收证据', icon: Layers3 },
  overview: { title: '情报总览', subtitle: '把握 AI 前沿动态与变化，识别机会与风险', icon: Activity },
  signals: { title: '前沿信号流', subtitle: '按可信度、类别和来源追踪最新变化。', icon: BarChart3 },
  models: { title: '模型地图', subtitle: '综合官方文档、OpenRouter、榜单和模型生态信号。', icon: Layers3 },
  agents: { title: 'Agent 市场', subtitle: '观察 Agent benchmark、真实任务能力和产品热度。', icon: Sparkles },
  skills: { title: 'Skill / 插件', subtitle: '追踪 MCP、Skill、连接器、插件和 AI 工具生态。', icon: GitFork },
  data: { title: '数据洞察', subtitle: '查看刷新任务、数据库状态、缺失密钥和数据文件。', icon: Database },
  rankings: { title: '榜单', subtitle: '模型、Agent、工具与信号热度的综合排序。', icon: TrendingUp },
  calendar: { title: '发布日历', subtitle: '按窗口和可信度整理预览、文档更新和公开发布。', icon: CalendarDays },
  sources: { title: '可信来源', subtitle: '检查每个来源的状态、权重、授权方式和刷新 SLA。', icon: ShieldCheck },
  roadmap: { title: '路线图', subtitle: '跟踪数据接入、页面迁移和自动化更新计划。', icon: Layers3 },
  components: { title: '组件状态', subtitle: '统一按钮、徽标、卡片、表格和状态样式。', icon: Layers3 },
}

const mobileNav: ViewKey[] = ['overview', 'signals', 'rankings', 'sources']

const viewNumbers: Record<ViewKey, string> = {
  coverage: '00',
  overview: '01',
  signals: '02',
  models: '03',
  agents: '04',
  skills: '05',
  data: '06',
  rankings: '07',
  calendar: '08',
  sources: '09',
  roadmap: '10',
  components: '12',
}

function viewFromHash(hash: string): ViewKey {
  return routeByHash[hash] ?? 'overview'
}

function hrefForView(view: ViewKey) {
  return Object.entries(routeByHash).find(([hash, key]) => key === view && hash !== '#radar')?.[0] ?? '#overview'
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase()
}

function signalMatchesSearch(signal: FrontierSignal, query: string) {
  const normalized = normalizeSearch(query)
  if (!normalized) return true
  const text = [
    signal.provider,
    signal.name,
    signal.category,
    signal.level,
    signal.releaseWindow,
    signal.title,
    signal.summary,
    ...signal.sources.flatMap((source) => [source.name, source.type, source.detail]),
  ]
    .join(' ')
    .toLowerCase()
  return text.includes(normalized)
}

function signalMatchesSourceFilter(signal: FrontierSignal, filter: SourceFilter) {
  if (filter === 'all') return true
  if (filter === 'official') {
    return signal.level === 'official' || signal.sources.some((source) => source.type === 'official')
  }
  return signal.level === 'benchmark' || signal.sources.some((source) => source.type === 'benchmark') || signal.title.includes('榜单') || signal.name.toLowerCase().includes('ranking')
}

function rankingItemMatchesSourceFilter(item: RankingItem, filter: SourceFilter) {
  if (filter === 'all') return true
  const text = `${item.source ?? ''} ${item.provider} ${item.scoringExplanation ?? ''}`.toLowerCase()
  if (filter === 'official') {
    return text.includes('官方') || text.includes('docs') || text.includes('api') || text.includes('openai') || text.includes('anthropic') || text.includes('google')
  }
  return text.includes('榜') || text.includes('benchmark') || text.includes('arena') || text.includes('analysis') || text.includes('ranking')
}

function sourceDefinitionMatchesSourceFilter(source: SourceDefinition, filter: SourceFilter) {
  if (filter === 'all') return true
  const text = `${source.name} ${source.sourceType} ${source.accessMethod} ${source.message ?? ''}`.toLowerCase()
  if (filter === 'official') {
    return source.sourceType === 'official-confirmation' || text.includes('official') || text.includes('api') || text.includes('docs') || text.includes('官方')
  }
  return source.sourceType.includes('capability') || source.sourceType.includes('benchmark') || text.includes('benchmark') || text.includes('arena') || text.includes('榜')
}

function dataSourceLabel(source: FrontierIntelDataState['source']) {
  if (source === 'api') return 'API'
  if (source === 'frontier-intel-json') return '静态 JSON'
  if (source === 'radar-json') return '兼容 JSON'
  return '内置数据'
}

function dataSyncLabel(dataState: FrontierIntelDataState) {
  if (dataState.loading) return '刷新中'
  if (dataState.isFallback) return '降级数据'
  return '已同步'
}

function domainSourceTypes(kind: 'model' | 'agent' | 'tool') {
  if (kind === 'model') return ['official-confirmation', 'model-capability']
  if (kind === 'agent') return ['agent-capability', 'early-propagation']
  return ['tool-ecosystem-heat', 'early-propagation', 'official-confirmation']
}

function domainAbilityTags(kind: 'model' | 'agent' | 'tool') {
  if (kind === 'model') return ['API 可用性', '价格 / 上下文', '官方确认', '能力榜单', '生态热度']
  if (kind === 'agent') return ['Benchmark', '真实任务复杂度', '电脑使用', 'GitHub / 产品增长', '官方可用性']
  return ['GitHub 28 天增长', 'Product Hunt / HN', 'X 传播热度', '发布活跃', '生态依赖']
}

function sourceMatchesDomain(source: SourceDefinition, kind: 'model' | 'agent' | 'tool') {
  return domainSourceTypes(kind).includes(source.sourceType)
}

function signalRankingItems(signals: FrontierSignal[]): RankingItem[] {
  return signals
    .slice()
    .sort((a, b) => b.confidence - a.confidence)
    .map((signal, index) => ({
      rank: index + 1,
      name: signal.name,
      provider: signal.provider,
      category: signal.category,
      score: signal.confidence,
      change: null,
      trend: [],
      accent: signal.accent,
      source: signal.sources.map((source) => source.name).join(' / '),
      kind: 'signal',
      scoringExplanation: `${signal.sourceCount ?? signal.sources.length} 个来源 · ${signal.releaseWindow} · ${signal.level}`,
    }))
}

function useActiveView() {
  const [activeView, setActiveView] = useState<ViewKey>(() => (typeof window === 'undefined' ? 'overview' : viewFromHash(window.location.hash)))

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#radar') {
      window.history.replaceState(null, '', '#overview')
    }
    const onHashChange = () => {
      const view = viewFromHash(window.location.hash)
      setActiveView(view)
      if (window.location.hash === '#radar') {
        window.history.replaceState(null, '', '#overview')
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (view: ViewKey) => {
    setActiveView(view)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', hrefForView(view))
    }
  }

  return { activeView, navigate }
}

function buildNav(dataset: FrontierIntelDataset): NavItem[] {
  const iconByView = Object.fromEntries(Object.entries(viewMeta).map(([key, meta]) => [key, meta.icon])) as Record<ViewKey, LucideIcon>
  const navItems = dataset.workspaceNav.map((item) => {
    const view = routeByHash[item.href] ?? routeByHash[item.legacyHref ?? ''] ?? 'overview'
    return {
      href: view === 'overview' ? '#overview' : item.href,
      icon: iconByView[view],
      label: item.label,
      view,
    }
  })
  return [...navItems, { href: '#components-states', icon: iconByView.components, label: '组件状态', view: 'components' }]
}

function AppShell({
  activeView,
  children,
  dataState,
  dataset,
  navItems,
  onNavigate,
  onSearchChange,
  onSourceFilterChange,
  searchQuery,
  sourceFilter,
}: {
  activeView: ViewKey
  children: ReactNode
  dataState: FrontierIntelDataState
  dataset: FrontierIntelDataset
  navItems: NavItem[]
  onNavigate: (view: ViewKey) => void
  onSearchChange: (value: string) => void
  onSourceFilterChange: (value: SourceFilter) => void
  searchQuery: string
  sourceFilter: SourceFilter
}) {
  return (
    <main className="fi-app">
      <div className="fi-shell">
        <SidebarNav activeView={activeView} dataset={dataset} items={navItems} onNavigate={onNavigate} />
        <section className="fi-main">
          <MobileTopBar dataState={dataState} dataset={dataset} />
          <CommandBar activeView={activeView} dataState={dataState} dataset={dataset} onSearchChange={onSearchChange} onSourceFilterChange={onSourceFilterChange} searchQuery={searchQuery} sourceFilter={sourceFilter} />
          {children}
        </section>
      </div>
      <MobileBottomNav activeView={activeView} onNavigate={onNavigate} />
      <DesktopUtilityBar />
    </main>
  )
}

function SidebarNav({ activeView, dataset, items, onNavigate }: { activeView: ViewKey; dataset: FrontierIntelDataset; items: NavItem[]; onNavigate: (view: ViewKey) => void }) {
  const freshness = datasetFreshness(dataset)
  return (
    <aside className="fi-sidebar" aria-label="工作区导航">
      <button className="fi-brand" onClick={() => onNavigate('overview')} type="button">
        <span className="fi-brand-mark">
          A
        </span>
        <span>
          <strong>AI 前沿情报站</strong>
          <small>Frontier Intel</small>
        </span>
      </button>
      <nav className="fi-nav">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <a
              className={activeView === item.view ? 'is-active' : ''}
              href={item.href}
              key={`${item.href}-${item.label}`}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.view)
              }}
            >
              <Icon size={16} />
              <span>{viewMeta[item.view].title || item.label}</span>
            </a>
          )
        })}
      </nav>
      <nav className="fi-nav fi-nav-secondary" aria-label="辅助导航">
        {[
          ['收藏夹', Bookmark],
          ['自定义视图', SlidersHorizontal],
          ['订阅管理', Database],
          ['设置', Settings],
          ['帮助与文档', CircleHelp],
        ].map(([label, Icon]) => {
          const NavIcon = Icon as LucideIcon
          return (
            <button key={label as string} type="button">
              <NavIcon size={15} />
              <span>{label as string}</span>
            </button>
          )
        })}
      </nav>
      <div className="fi-sidebar-status">
        <UserRound size={24} />
        <div>
          <strong>智能小明</strong>
          <span>Enterprise</span>
        </div>
        <StatusBadge status={freshness.status}>{freshness.generated.label}</StatusBadge>
      </div>
    </aside>
  )
}

function MobileTopBar({ dataState, dataset }: { dataState: FrontierIntelDataState; dataset: FrontierIntelDataset }) {
  const freshness = datasetFreshness(dataset)
  return (
    <header className="fi-mobile-top">
      <strong>AI 前沿情报站</strong>
      <span>{dataState.loading ? '刷新中' : `${dataSourceLabel(dataState.source)} · ${freshness.generated.label}`}</span>
    </header>
  )
}

function CommandBar({
  activeView,
  dataState,
  dataset,
  onSearchChange,
  onSourceFilterChange,
  searchQuery,
  sourceFilter,
}: {
  activeView: ViewKey
  dataState: FrontierIntelDataState
  dataset: FrontierIntelDataset
  onSearchChange: (value: string) => void
  onSourceFilterChange: (value: SourceFilter) => void
  searchQuery: string
  sourceFilter: SourceFilter
}) {
  const copy = viewMeta[activeView]
  const inputRef = useRef<HTMLInputElement>(null)
  const freshness = datasetFreshness(dataset)
  const sourceLabel = dataSourceLabel(dataState.source)
  const sourceFilters: Array<{ label: string; value: SourceFilter }> = [
    { label: '全部', value: 'all' },
    { label: '官方', value: 'official' },
    { label: '榜单', value: 'ranking' },
  ]

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="fi-command">
      <div>
        <div className="fi-title-row">
          <span>{viewNumbers[activeView]}</span>
          <h1>{copy.title}</h1>
        </div>
        <p>{copy.subtitle}</p>
      </div>
      <label className="fi-search" htmlFor="frontier-search">
        <Search size={16} />
        <input id="frontier-search" onChange={(event) => onSearchChange(event.target.value)} ref={inputRef} type="search" placeholder="搜索信号、模型、Agent、来源、主题..." value={searchQuery} />
        <kbd>/</kbd>
      </label>
      <div className="fi-command-filters" aria-label="总览筛选">
        <button aria-label="重置筛选" onClick={() => onSourceFilterChange('all')} type="button"><Filter size={15} /></button>
        {sourceFilters.map((filter) => (
          <button aria-pressed={sourceFilter === filter.value} className={sourceFilter === filter.value ? 'is-active' : ''} key={filter.value} onClick={() => onSourceFilterChange(filter.value)} type="button">
            {filter.label}
          </button>
        ))}
      </div>
      <div className="fi-refresh-inline" title={dataState.error ?? undefined}>
        <span />
        <strong>{dataSyncLabel(dataState)}</strong>
        <em>· {sourceLabel} · {freshness.generated.ageLabel}</em>
      </div>
      <div className="fi-actions">
        <button className="fi-icon-action" type="button" aria-label="通知"><Bell size={17} /><span>12</span></button>
        <button className="fi-icon-action" type="button" aria-label="帮助"><CircleHelp size={17} /></button>
        <a className="fi-icon-action" href="https://github.com/Yueyuyu/ai-frontier-radar" target="_blank" rel="noreferrer" aria-label="GitHub">
          <GitFork size={17} />
        </a>
        <button className="fi-icon-action" type="button" aria-label="退出"><LogOut size={17} /></button>
      </div>
    </header>
  )
}

function DesktopUtilityBar() {
  return (
    <footer className="fi-utility-bar">
      <div>
        <button type="button">订阅设置</button>
        <button type="button">通知设置</button>
        <button type="button">数据导出</button>
        <span>所有时间均为北京时间（UTC+8）</span>
      </div>
      <div>
        <button type="button">反馈建议</button>
        <button type="button">加入交流群</button>
        <button type="button">帮助文档</button>
      </div>
    </footer>
  )
}

function MobileBottomNav({ activeView, onNavigate }: { activeView: ViewKey; onNavigate: (view: ViewKey) => void }) {
  return (
    <nav className="fi-mobile-bottom" aria-label="移动端主导航">
      {mobileNav.map((view) => {
        const Icon = viewMeta[view].icon
        return (
          <a
            className={activeView === view ? 'is-active' : ''}
            href={hrefForView(view)}
            key={view}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(view)
            }}
          >
            <Icon size={18} />
            <span>{viewMeta[view].title}</span>
          </a>
        )
      })}
    </nav>
  )
}

function OverviewPage({ dataset, onClearSearch, onSelect, searchQuery, selectedSignal, sourceFilter }: { dataset: FrontierIntelDataset; onClearSearch: () => void; onSelect: (id: string) => void; searchQuery: string; selectedSignal: FrontierSignal; sourceFilter: SourceFilter }) {
  const signals = dataset.signals
    .filter((signal) => signalMatchesSearch(signal, searchQuery))
    .filter((signal) => signalMatchesSourceFilter(signal, sourceFilter))

  useEffect(() => {
    if (signals.length && !signals.some((signal) => signal.id === selectedSignal.id)) {
      onSelect(signals[0].id)
    }
  }, [onSelect, selectedSignal.id, signals])

  return <StrictOverview dataset={dataset} onClearSearch={onClearSearch} onSelect={onSelect} selectedSignal={selectedSignal} signals={signals} />
}

function SignalsPage({
  dataset,
  onClearSearch,
  onSelect,
  searchQuery,
  selectedSignal,
}: {
  dataset: FrontierIntelDataset
  onClearSearch: () => void
  onSelect: (id: string) => void
  searchQuery: string
  selectedSignal: FrontierSignal
}) {
  const signals = dataset.signals.filter((signal) => signalMatchesSearch(signal, searchQuery))
  return <StrictSignalsPage onClearSearch={onClearSearch} onSelect={onSelect} selectedSignal={selectedSignal} signals={signals} />
}

function DomainPage({ dataset, kind, searchQuery, sourceFilter }: { dataset: FrontierIntelDataset; kind: 'model' | 'agent' | 'tool'; searchQuery: string; sourceFilter: SourceFilter }) {
  const query = normalizeSearch(searchQuery)
  const items = dataset.rankingItems.filter((item) => item.kind === kind && rankingItemMatchesSourceFilter(item, sourceFilter) && (!query || `${item.name} ${item.provider} ${item.category} ${item.source ?? ''} ${item.scoringExplanation ?? ''}`.toLowerCase().includes(query)))
  const relatedSignals = dataset.signals.filter((signal) => (kind === 'model' ? signal.category === '模型' : kind === 'agent' ? signal.category === 'Agent' : signal.category === 'AI 编程' || signal.category === 'Skill / 插件') && signalMatchesSearch(signal, searchQuery) && signalMatchesSourceFilter(signal, sourceFilter))
  const sources = sourceDefinitions(dataset).filter((source) => sourceMatchesDomain(source, kind) && sourceDefinitionMatchesSourceFilter(source, sourceFilter) && (!query || `${source.name} ${source.sourceType} ${source.accessMethod} ${source.status} ${source.message ?? ''}`.toLowerCase().includes(query)))
  return <StrictDomainPage abilityTags={domainAbilityTags(kind)} dataset={dataset} items={items} kind={kind} relatedSignals={relatedSignals} sources={sources} />
}

function RankingsPage({ dataset, searchQuery, sourceFilter }: { dataset: FrontierIntelDataset; searchQuery: string; sourceFilter: SourceFilter }) {
  const query = normalizeSearch(searchQuery)
  const baseItems = [...dataset.rankingItems, ...signalRankingItems(dataset.signals)]
  const items = baseItems.filter((item) => rankingItemMatchesSourceFilter(item, sourceFilter) && (!query || `${item.name} ${item.provider} ${item.category} ${item.source ?? ''} ${item.scoringExplanation ?? ''}`.toLowerCase().includes(query)))
  return <StrictRankingsPage generatedAt={dataset.generatedAt} items={items} />
}

function DataPage({ dataset, searchQuery }: { dataset: FrontierIntelDataset; searchQuery: string }) {
  const sources = sourceDefinitions(dataset)
  const skippedSources = sources.filter((source) => source.status === 'skipped')
  const freshnessById = Object.fromEntries(sources.map((source) => [source.id, assessFreshness(source.lastCheckedAt, source.freshnessSla, source.status)]))
  return <StrictDataPage dataset={dataset} freshnessById={freshnessById} searchQuery={searchQuery} skippedSources={skippedSources} sources={sources} />
}

function CalendarPage({ dataset }: { dataset: FrontierIntelDataset }) {
  return <StrictCalendarPage dataset={dataset} />
}

function sourceDefinitions(dataset: FrontierIntelDataset): SourceDefinition[] {
  if (dataset.sources?.length) return dataset.sources
  return dataset.sourceHealth.map((source, index) => ({
    id: `fallback-${index}`,
    name: source.name,
    url: source.url ?? '',
    sourceType: source.detail,
    accessMethod: source.accessMethod ?? 'public-api',
    authRequired: source.authRequired ?? false,
    weight: source.weight ?? source.influence / 100,
    freshnessSla: source.freshnessSla ?? 'on-refresh',
    status: source.status ?? 'ok',
    lastCheckedAt: source.lastCheckedAt,
    message: source.detail,
  }))
}

function implementationPhases() {
  return [
    { title: '文档和命名基线', status: 'done', pages: 'README / docs / 蓝图' },
    { title: '数据骨架调整', status: 'done', pages: 'frontier-intel-data / signals / sources' },
    { title: '来源接入第一期', status: 'active', pages: '官方源 / OpenRouter / Agent 榜 / GitHub / HN' },
    { title: '情报总览 UI 重构', status: 'active', pages: '情报总览 / 信号矩阵' },
    { title: '来源健康与证据链', status: 'active', pages: '可信来源 / 信号详情 / 数据洞察' },
    { title: '评分与榜单', status: 'active', pages: '榜单 / 模型地图 / Agent 市场 / Skill 插件' },
    { title: '持久化与自动化', status: 'planned', pages: 'MySQL / cron / 过期状态' },
  ]
}

function SourcesPage({ dataset, searchQuery }: { dataset: FrontierIntelDataset; searchQuery: string }) {
  const query = normalizeSearch(searchQuery)
  const allSources = sourceDefinitions(dataset)
  const sources = allSources.filter((source) => {
    const searchMatched = !query || `${source.name} ${source.sourceType} ${source.accessMethod} ${source.status} ${source.requiredEnv?.join(' ') ?? ''}`.toLowerCase().includes(query)
    return searchMatched
  })
  return <StrictSourcesPage dataset={dataset} sources={sources} />
}

function RoadmapPage({ dataset }: { dataset: FrontierIntelDataset }) {
  return <StrictRoadmapPage implementationPhases={implementationPhases()} items={dataset.roadmapItems} />
}

function ViewSwitch({
  activeView,
  dataset,
  onClearSearch,
  onSelect,
  searchQuery,
  selectedSignal,
  sourceFilter,
}: {
  activeView: ViewKey
  dataset: FrontierIntelDataset
  onClearSearch: () => void
  onSelect: (id: string) => void
  searchQuery: string
  selectedSignal: FrontierSignal
  sourceFilter: SourceFilter
}) {
  if (activeView === 'coverage') return <CoverageMapPage />
  if (activeView === 'signals') return <SignalsPage dataset={dataset} onClearSearch={onClearSearch} onSelect={onSelect} searchQuery={searchQuery} selectedSignal={selectedSignal} />
  if (activeView === 'models') return <DomainPage dataset={dataset} kind="model" searchQuery={searchQuery} sourceFilter={sourceFilter} />
  if (activeView === 'agents') return <DomainPage dataset={dataset} kind="agent" searchQuery={searchQuery} sourceFilter={sourceFilter} />
  if (activeView === 'skills') return <DomainPage dataset={dataset} kind="tool" searchQuery={searchQuery} sourceFilter={sourceFilter} />
  if (activeView === 'data') return <DataPage dataset={dataset} searchQuery={searchQuery} />
  if (activeView === 'rankings') return <RankingsPage dataset={dataset} searchQuery={searchQuery} sourceFilter={sourceFilter} />
  if (activeView === 'calendar') return <CalendarPage dataset={dataset} />
  if (activeView === 'sources') return <SourcesPage dataset={dataset} searchQuery={searchQuery} />
  if (activeView === 'roadmap') return <RoadmapPage dataset={dataset} />
  return <OverviewPage dataset={dataset} onClearSearch={onClearSearch} onSelect={onSelect} searchQuery={searchQuery} selectedSignal={selectedSignal} sourceFilter={sourceFilter} />
}

export default function FrontierIntelApp() {
  const dataState = useFrontierIntelDataState()
  const dataset = dataState.dataset
  const { activeView, navigate } = useActiveView()
  const navItems = useMemo(() => buildNav(dataset), [dataset])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [selectedId, setSelectedId] = useState(dataset.signals[0]?.id ?? '')

  useEffect(() => {
    if ((!selectedId || !dataset.signals.some((signal) => signal.id === selectedId)) && dataset.signals[0]?.id) {
      setSelectedId(dataset.signals[0].id)
    }
  }, [dataset.signals, selectedId])

  const selectedSignal = dataset.signals.find((signal) => signal.id === selectedId) ?? dataset.signals[0]

  const selectSignal = (id: string) => {
    setSelectedId(id)
    if (isMobileViewport()) setDrawerOpen(true)
  }

  if (activeView === 'coverage') {
    return <CoverageMapPage />
  }

  if (activeView === 'components') {
    return <ComponentStateBoard dataset={dataset} />
  }

  return (
    <AppShell activeView={activeView} dataState={dataState} dataset={dataset} navItems={navItems} onNavigate={navigate} onSearchChange={setSearchQuery} onSourceFilterChange={setSourceFilter} searchQuery={searchQuery} sourceFilter={sourceFilter}>
      {selectedSignal ? (
        <>
          <ViewSwitch activeView={activeView} dataset={dataset} onClearSearch={() => setSearchQuery('')} onSelect={selectSignal} searchQuery={searchQuery} selectedSignal={selectedSignal} sourceFilter={sourceFilter} />
          <MobileSignalDetailDrawer onClose={() => setDrawerOpen(false)} open={drawerOpen} signal={selectedSignal} />
        </>
      ) : (
        <EmptyState type="degraded" />
      )}
    </AppShell>
  )
}
