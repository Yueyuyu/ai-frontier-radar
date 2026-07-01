import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { AlertTriangle, BookOpenText, Cloud, FileSearch, KeyRound, LoaderCircle, Search, ShieldCheck, Trophy, X } from 'lucide-react'
import type { ConfidenceLevel, FrontierIntelDataset, FrontierSignal, RankingItem, SourceRun } from '../types'
import { formatRelativeAge } from './frontierHelpers'
import { StatusBadge } from './StatusBadge'

const buttonRows = ['主要按钮', '次要按钮', '文本按钮', '危险按钮', '禁用按钮']
const buttonStates = ['默认', '悬停', '点击', '禁用']
const badges = [
  ['官方', 'official'],
  ['文档', 'docs'],
  ['平台', 'platform'],
  ['榜单', 'benchmark'],
  ['社区', 'social'],
  ['传闻', 'rumor'],
  ['进行中', 'active'],
  ['已完成', 'done'],
  ['待配置', 'skipped'],
  ['失败', 'error'],
  ['低可信', 'stale'],
]
const tokens = [
  ['品牌青', '#17c9c0'],
  ['主色蓝', '#3d8cff'],
  ['警示红', '#ff7c4d'],
  ['紫色', '#9b6df5'],
  ['成功绿', '#3bc073'],
  ['警告黄', '#f6b644'],
  ['正文', '#0b1d35'],
  ['次要文本', '#52657b'],
  ['边框', '#d7e5f0'],
  ['背景', '#f6fbff'],
  ['卡片', '#ffffff'],
  ['分割线', '#eaf3f8'],
]

type ComponentStateBoardProps = {
  dataset?: FrontierIntelDataset
}

type SignalCardItem = {
  confidence: number
  id: string
  lastUpdate: string
  level: ConfidenceLevel
  searchText: string
  sourceCount: number
  summary: string
  title: string
}

type RankingTableRow = {
  category: string
  change: number | null
  id: string
  name: string
  rank: number
  score: number | null
  searchText: string
  source: string
}

type SourceRunTableRow = {
  access: string
  checkedAt: string
  id: string
  itemCount: number | null
  message: string
  name: string
  searchText: string
  status: string
}

const confidenceLabels: Record<ConfidenceLevel, string> = {
  benchmark: '榜单',
  docs: '文档',
  official: '官方',
  platform: '平台',
  rumor: '传闻',
  social: '社区',
}

const accessLabels: Record<string, string> = {
  'api-key': 'API Key',
  database: '数据库',
  'html-page': 'HTML',
  'official-page': '官方页',
  'public-api': '公开 API',
}

const sourceStatusLabels: Record<string, string> = {
  error: '失败',
  ok: '成功',
  planned: '计划',
  skipped: '待配置',
}

const fallbackSignalCards: SignalCardItem[] = [
  {
    confidence: 95,
    id: 'sample-gpt-price-default',
    lastUpdate: '30 分钟前',
    level: 'official',
    searchText: 'GPT-5.2 API 调价 官方 输入降价 输出降价',
    sourceCount: 6,
    summary: '输入降价 20%，输出降价 10%',
    title: 'GPT-5.2 API 调价',
  },
  {
    confidence: 95,
    id: 'sample-gpt-price-selected',
    lastUpdate: '30 分钟前',
    level: 'official',
    searchText: 'GPT-5.2 API 调价 官方 selected 输入降价 输出降价',
    sourceCount: 6,
    summary: '输入降价 20%，输出降价 10%',
    title: 'GPT-5.2 API 调价',
  },
  {
    confidence: 35,
    id: 'sample-qwen-low',
    lastUpdate: '2 小时前',
    level: 'rumor',
    searchText: 'Qwen2.5 新模型 传闻 低可信 下周发布',
    sourceCount: 1,
    summary: '疑似下周发布，尚未官方确认',
    title: 'Qwen2.5 新模型',
  },
]

const fallbackRankingRows: RankingTableRow[] = ['GPT-5.2', 'Claude 3.5', 'Gemini 2.0 Flash', 'Llama 3 70B', 'Qwen2.5 72B'].map((name, index) => ({
  category: '模型',
  change: index % 2 ? null : index + 1,
  id: `sample-ranking-${name}`,
  name,
  rank: index + 1,
  score: Number((96.5 - index * 3.6).toFixed(1)),
  searchText: `${name} 模型 ${index < 3 ? '官方' : '社区'}`,
  source: index < 3 ? '官方' : '社区',
}))

const fallbackSourceRows: SourceRunTableRow[] = ['OpenAI API', 'OpenRouter API', 'X Recent Search', 'Product Hunt', 'Semantic Scholar'].map((name, index) => ({
  access: index < 2 ? '公开 API' : '-',
  checkedAt: index < 2 ? `${index + 1} 分钟前` : '-',
  id: `sample-source-${name}`,
  itemCount: index < 2 ? 1256 - index * 364 : 0,
  message: index < 2 ? '运行正常' : index < 4 ? '缺少凭据或暂缓接入' : '计划接入',
  name,
  searchText: `${name} ${index < 2 ? 'ok 成功 公开 API' : index < 4 ? 'skipped 待配置' : 'planned 计划'}`,
  status: index < 2 ? 'ok' : index < 4 ? 'skipped' : 'planned',
}))

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function matchesQuery(searchText: string, query: string) {
  return !query || searchText.toLowerCase().includes(query)
}

function labelForConfidence(level: ConfidenceLevel) {
  return confidenceLabels[level] ?? level
}

function signalToCard(signal: FrontierSignal): SignalCardItem {
  const sourceNames = signal.sources.map((source) => `${source.name} ${source.detail} ${source.type}`).join(' ')
  return {
    confidence: signal.confidence,
    id: signal.id,
    lastUpdate: signal.lastUpdate || signal.firstSeen,
    level: signal.level,
    searchText: `${signal.provider} ${signal.name} ${signal.category} ${signal.level} ${signal.title} ${signal.summary} ${sourceNames}`,
    sourceCount: signal.sourceCount ?? signal.sources.length,
    summary: signal.summary,
    title: signal.title || signal.name,
  }
}

function rankingToRow(item: RankingItem): RankingTableRow {
  const source = item.source ?? item.provider
  return {
    category: item.category,
    change: item.change,
    id: `ranking-${item.rank}-${item.name}`,
    name: item.name,
    rank: item.rank,
    score: item.score,
    searchText: `${item.name} ${item.provider} ${item.category} ${item.source ?? ''} ${item.scoringExplanation ?? ''}`,
    source,
  }
}

function sourceRunToRow(run: SourceRun): SourceRunTableRow {
  const access = accessLabels[run.access] ?? run.access
  const checkedAt = run.checkedAt ? formatRelativeAge(run.checkedAt) : '未刷新'
  return {
    access,
    checkedAt,
    id: run.id,
    itemCount: run.itemCount,
    message: run.message,
    name: run.name,
    searchText: `${run.name} ${run.column} ${run.status} ${run.access} ${run.message} ${checkedAt}`,
    status: run.status,
  }
}

function formatTrend(change: number | null) {
  if (change === null || change === 0) return '—'
  return change > 0 ? `↑ ${change}` : `↓ ${Math.abs(change)}`
}

function activeChipStyle(active: boolean): CSSProperties | undefined {
  if (!active) return undefined
  return {
    boxShadow: '0 8px 18px rgba(23, 201, 192, 0.18)',
    outline: '2px solid rgba(23, 201, 192, 0.55)',
    transform: 'translateY(-1px)',
  }
}

function Section({ children, className = '', title }: { children: ReactNode; className?: string; title: string }) {
  return (
    <section className={`fi-state-section ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ButtonMatrix() {
  const [pressedButton, setPressedButton] = useState<string | null>(null)

  return (
    <div className="fi-state-button-matrix">
      <span />
      {buttonStates.map((state) => <strong key={state}>{state}</strong>)}
      {buttonRows.map((row, rowIndex) => (
        <div className="fi-state-button-row" key={row}>
          <em key={`${row}-label`}>{row}</em>
          {buttonStates.map((state, stateIndex) => {
            const key = `${row}-${state}`
            const disabled = stateIndex === 3 || rowIndex === 4
            return (
              <button
                aria-pressed={pressedButton === key}
                className={`fi-state-button is-${rowIndex} ${stateIndex === 1 ? 'is-hover' : ''} ${stateIndex === 2 || pressedButton === key ? 'is-pressed' : ''}`}
                disabled={disabled}
                key={key}
                onClick={() => setPressedButton(key)}
                type="button"
              >
                按钮
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Segments() {
  const singleOptions = ['全部', '模型', 'Agent', 'Skill', '工具']
  const multiOptions = ['全部', '模型', 'Agent', 'Skill', '官方', '社区']
  const chipOptions = ['全部 120', '高置信 36', '官方 82', '社区 58', '待配置 12', '失败 3']
  const [activeSegment, setActiveSegment] = useState(singleOptions[0])
  const [checkedSegments, setCheckedSegments] = useState(() => new Set(multiOptions.slice(0, 2)))
  const [activeChip, setActiveChip] = useState(0)

  const toggleCheckedSegment = (item: string) => {
    setCheckedSegments((current) => {
      const next = new Set(current)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  return (
    <div className="fi-state-stack">
      <div>
        <h3>分段控制（单选）</h3>
        <div className="fi-state-segment">
          {singleOptions.map((item) => <button aria-pressed={activeSegment === item} className={activeSegment === item ? 'is-active' : ''} key={item} onClick={() => setActiveSegment(item)} type="button">{item}</button>)}
        </div>
      </div>
      <div>
        <h3>分段控制（多选）</h3>
        <div className="fi-state-check-row">
          {multiOptions.map((item) => <label key={item}><input checked={checkedSegments.has(item)} onChange={() => toggleCheckedSegment(item)} type="checkbox" />{item}</label>)}
        </div>
      </div>
      <div>
        <h3>筛选芯片</h3>
        <div className="fi-state-chip-row">
          {chipOptions.map((item, index) => (
            <span
              aria-pressed={activeChip === index}
              className={`is-${index}`}
              key={item}
              onClick={() => setActiveChip(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setActiveChip(index)
              }}
              role="button"
              style={activeChipStyle(activeChip === index)}
              tabIndex={0}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function BadgeBoard() {
  return (
    <div className="fi-state-badge-grid">
      {badges.map(([label, status]) => <StatusBadge key={label} status={status}>{label}</StatusBadge>)}
    </div>
  )
}

function InputBoard({ onQueryChange, query }: { onQueryChange: (value: string) => void; query: string }) {
  const [sourceType, setSourceType] = useState('')
  const [primarySwitchChecked, setPrimarySwitchChecked] = useState(true)
  const [secondarySwitchChecked, setSecondarySwitchChecked] = useState(false)

  return (
    <div className="fi-state-input-grid">
      <label>
        <span>搜索框</span>
        <div><Search size={16} /><input onChange={(event) => onQueryChange(event.currentTarget.value)} placeholder="搜索模型、公司、Agent..." value={query} /></div>
      </label>
      <label>
        <span>选择器</span>
        <select onChange={(event) => setSourceType(event.currentTarget.value)} value={sourceType}>
          <option value="" disabled>请选择来源类型</option>
          <option value="官方">官方</option>
          <option value="平台">平台</option>
        </select>
      </label>
      <div>
        <span>开关</span>
        <button aria-pressed={primarySwitchChecked} className={`fi-state-switch ${primarySwitchChecked ? 'is-on' : ''}`} onClick={() => setPrimarySwitchChecked((checked) => !checked)} type="button"><i />{primarySwitchChecked ? '开启' : '关闭'}</button>
        <button aria-pressed={secondarySwitchChecked} className={`fi-state-switch ${secondarySwitchChecked ? 'is-on' : ''}`} onClick={() => setSecondarySwitchChecked((checked) => !checked)} type="button"><i />{secondarySwitchChecked ? '开启' : '关闭'}</button>
      </div>
      <div>
        <span>进度条</span>
        <div className="fi-state-progress"><i /></div>
      </div>
      <div>
        <span>加载</span>
        <span className="fi-state-loading"><LoaderCircle size={22} />加载中...</span>
      </div>
    </div>
  )
}

function SignalPreviewCards({ signals }: { signals: SignalCardItem[] }) {
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null)
  const activeSignalId = signals.some((signal) => signal.id === selectedSignalId) ? selectedSignalId : signals[1]?.id ?? signals[0]?.id ?? null

  if (!signals.length) {
    return (
      <div className="fi-state-card-grid">
        <article>
          <span className="is-orange"><FileSearch size={21} /></span>
          <strong>暂无匹配信号</strong>
          <StatusBadge status="skipped">空态</StatusBadge>
          <small>根据当前搜索过滤</small>
          <p>调整关键词后会重新映射信号卡片样例。</p>
          <div><em>证据 0</em><em>可信度 <b>--</b></em></div>
          <label>Empty</label>
        </article>
      </div>
    )
  }

  return (
    <div className="fi-state-card-grid">
      {signals.map((signal) => {
        const selected = signal.id === activeSignalId
        const lowConfidence = signal.confidence < 55 || signal.level === 'rumor'
        return (
        <article
          aria-pressed={selected}
          className={selected ? 'is-selected' : lowConfidence ? 'is-low' : ''}
          key={signal.id}
          onClick={() => setSelectedSignalId(signal.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') setSelectedSignalId(signal.id)
          }}
          role="button"
          tabIndex={0}
        >
          <span className={lowConfidence ? 'is-orange' : 'is-teal'}>{lowConfidence ? <AlertTriangle size={21} /> : <ShieldCheck size={21} />}</span>
          <strong>{signal.title}</strong>
          <StatusBadge status={signal.level}>{labelForConfidence(signal.level)}</StatusBadge>
          <small>{signal.lastUpdate}</small>
          <p>{signal.summary}</p>
          <div><em>证据 {signal.sourceCount}</em><em>可信度 <b>{signal.confidence}%</b></em></div>
          <label>{selected ? 'Selected' : lowConfidence ? 'Low Confidence' : 'Default'}</label>
        </article>
        )
      })}
    </div>
  )
}

function EvidenceCards() {
  return (
    <div className="fi-state-evidence-grid">
      {[
        [BookOpenText, 'OpenAI API Changelog', '官方', '2024-05-15 10:12', '更新 API 定价：GPT-5.2 输入价降价 20%。'],
        [Trophy, 'Arena (LMArena)', '榜单', '2024-05-15 09:30', 'GPT-5.2 在文本和代码任务中排名第 1。'],
        [Search, 'X Recent Search', '热度', '2024-05-15 10:30', '开发者社区讨论稳定升高。'],
      ].map(([Icon, title, badge, time, copy], index) => {
        const TileIcon = Icon as typeof Search
        return (
          <article key={title as string}>
            <span><TileIcon size={18} /></span>
            <strong>{title as string}</strong>
            <StatusBadge status={index === 0 ? 'official' : index === 1 ? 'benchmark' : 'social'}>{badge as string}</StatusBadge>
            <small>{time as string}</small>
            <p>{copy as string}</p>
            <em>{index === 0 ? '高相关' : index === 1 ? '中相关' : '低相关'}</em>
          </article>
        )
      })}
    </div>
  )
}

function TableSamples({ rankingRows, sourceRows }: { rankingRows: RankingTableRow[]; sourceRows: SourceRunTableRow[] }) {
  return (
    <div className="fi-state-table-grid">
      <table>
        <caption>榜单表格（紧凑）</caption>
        <thead><tr><th>排名</th><th>名称</th><th>类别</th><th>综合评分</th><th>趋势</th><th>来源</th></tr></thead>
        <tbody>
          {rankingRows.length ? rankingRows.map((row) => (
            <tr key={row.id}>
              <td>{row.rank}</td>
              <td>{row.name}</td>
              <td>{row.category}</td>
              <td>{typeof row.score === 'number' ? <StatusBadge confidence={row.score}>{row.score.toFixed(1)}</StatusBadge> : <StatusBadge status="planned">观察</StatusBadge>}</td>
              <td>{formatTrend(row.change)}</td>
              <td>{row.source}</td>
            </tr>
          )) : <tr><td colSpan={6}>暂无匹配榜单条目</td></tr>}
        </tbody>
      </table>
      <table>
        <caption>来源运行表格</caption>
        <thead><tr><th>来源</th><th>状态</th><th>条目</th><th>接入</th><th>最近检查</th><th>操作</th></tr></thead>
        <tbody>
          {sourceRows.length ? sourceRows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td><StatusBadge status={row.status}>{sourceStatusLabels[row.status] ?? row.status}</StatusBadge></td>
              <td>{row.itemCount ?? '-'}</td>
              <td>{row.access}</td>
              <td>{row.checkedAt}</td>
              <td><a href="#source-runs" title={row.message}>详情</a></td>
            </tr>
          )) : <tr><td colSpan={6}>暂无匹配来源运行记录</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function StateExamples() {
  return (
    <div className="fi-state-examples">
      <article className="is-skeleton"><SkeletonLines /></article>
      <article><FileSearch size={58} /><strong>暂无相关结果</strong><span>尝试调用更精确条件或关键词</span><button type="button">清空筛选</button></article>
      <article><Cloud size={58} /><strong>无法连接到数据源</strong><span>请检查网络或稍后重试</span><button type="button">重试连接</button></article>
      <article><KeyRound size={58} /><strong>缺少必要的 API Key</strong><span>请在设置中配置后继续使用</span><button type="button">去配置</button></article>
      <article className="is-drawer">
        <div><strong>信号详情</strong><X size={16} /></div>
        <p><b>GPT-5.2 API 调价</b> <StatusBadge status="official">官方</StatusBadge></p>
        <span>输入降价 20%，输出降价 10%</span>
        <button type="button">查看来源</button>
      </article>
      <article className="is-degraded">
        <div><AlertTriangle size={15} /><strong>部分数据不可用</strong><X size={15} /></div>
        <SkeletonLines />
      </article>
    </div>
  )
}

function SkeletonLines() {
  return (
    <>
      <i /><i /><i /><i /><i />
    </>
  )
}

function TokenBoard() {
  return (
    <div className="fi-state-token-grid">
      {tokens.map(([name, color]) => (
        <article key={name}>
          <span style={{ background: color }} />
          <strong>{name}</strong>
          <small>{color}</small>
        </article>
      ))}
    </div>
  )
}

function TypographyBoard() {
  return (
    <div className="fi-state-type">
      <strong>Aa</strong>
      <p>中文字体：思源黑体 / Source Han Sans<br />英文字体：Inter</p>
      <table>
        <tbody>
          {[
            ['H1', '24px', '32px', '600'],
            ['H2', '20px', '28px', '600'],
            ['H3', '16px', '24px', '600'],
            ['Body', '14px', '22px', '400'],
            ['Small', '12px', '18px', '400'],
          ].map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

export function ComponentStateBoard({ dataset }: ComponentStateBoardProps) {
  const [query, setQuery] = useState('')
  const normalizedQuery = normalizeQuery(query)
  const signalCards = useMemo(() => {
    const rows = dataset ? dataset.signals.map(signalToCard) : fallbackSignalCards
    return rows.filter((row) => matchesQuery(row.searchText, normalizedQuery)).slice(0, 3)
  }, [dataset, normalizedQuery])
  const rankingRows = useMemo(() => {
    const rows = dataset ? dataset.rankingItems.map(rankingToRow) : fallbackRankingRows
    return rows.filter((row) => matchesQuery(row.searchText, normalizedQuery)).slice(0, 5)
  }, [dataset, normalizedQuery])
  const sourceRows = useMemo(() => {
    const rows = dataset ? dataset.sourceRuns.map(sourceRunToRow) : fallbackSourceRows
    return rows.filter((row) => matchesQuery(row.searchText, normalizedQuery)).slice(0, 5)
  }, [dataset, normalizedQuery])
  const updatedLabel = dataset ? dataset.stats.updatedLabel || formatRelativeAge(dataset.generatedAt || dataset.stats.generatedAt) : '2024-05-15'

  return (
    <main className="fi-component-board">
      <header>
        <div>
          <h1><span>12</span> 组件与状态 / Components & State Board</h1>
          <p>AI 前沿情报站 · 设计系统组件库</p>
        </div>
        <aside><span>版本：v1.0.0</span><span>更新：{updatedLabel}</span></aside>
      </header>
      <div className="fi-component-grid">
        <Section className="area-buttons" title="一、按钮 / Button States"><ButtonMatrix /></Section>
        <Section className="area-segments" title="二、分段控制 & 筛选芯片 / Segments & Filter Chips"><Segments /></Section>
        <Section className="area-badges" title="三、徽章 / Badges & Status"><BadgeBoard /></Section>
        <Section className="area-inputs" title="四、输入 / Input"><InputBoard onQueryChange={setQuery} query={query} /></Section>
        <Section className="area-cards" title="五、卡片 / Card"><SignalPreviewCards signals={signalCards} /><h3>来源证据卡片 SourceEvidenceCard</h3><EvidenceCards /></Section>
        <Section className="area-tables" title="六、表格 / Table"><TableSamples rankingRows={rankingRows} sourceRows={sourceRows} /></Section>
        <Section className="area-states" title="七、状态 / States"><StateExamples /><p className="fi-state-note"><AlertTriangle size={15} />说明：X / HN / GitHub 等为热度与传播来源，不作为独立官方确认依据。</p></Section>
        <Section className="area-colors" title="八、颜色令牌（浅色主题） Color Tokens"><TokenBoard /></Section>
        <Section className="area-type" title="九、字体 / Typography"><TypographyBoard /></Section>
      </div>
    </main>
  )
}
