import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { animate, stagger } from 'animejs'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  GitFork,
  Globe2,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import './App.css'
import { companies, rankingMoves, signals, sourceTypes, timeline } from './data'
import type { ConfidenceLevel, ModelSignal, WatchCompany } from './types'

const levelLabels: Record<ConfidenceLevel, string> = {
  official: '官方确认',
  platform: '第三方接入',
  document: '文档信号',
  community: '社区传闻',
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState('全部')

  const filteredSignals = useMemo(() => {
    if (selectedCompany === '全部') {
      return signals
    }

    return signals.filter((signal) => signal.company === selectedCompany)
  }, [selectedCompany])

  const selectedCompanyData = companies.find((company) => company.name === selectedCompany)

  useEffect(() => {
    animate('.signal-card', {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(55),
      duration: 460,
      easing: 'outQuad',
    })
  }, [selectedCompany])

  useEffect(() => {
    animate('.radar-point', {
      scale: [0.88, 1.18, 0.96],
      opacity: [0.72, 1, 0.82],
      delay: stagger(120),
      duration: 2200,
      loop: true,
      easing: 'inOutSine',
    })

    animate('.sweep-line', {
      rotate: '360deg',
      duration: 6800,
      loop: true,
      easing: 'linear',
    })
  }, [])

  return (
    <main className="app-shell">
      <Header />

      <section className="command-strip" aria-label="模型观察过滤器">
        <div className="title-block">
          <p>AI 模型发布雷达</p>
          <h1>追踪头部模型发布、榜单变化与发布前信号</h1>
        </div>
        <CompanyFilters selected={selectedCompany} onSelect={setSelectedCompany} />
      </section>

      <section className="dashboard-grid">
        <SignalFeed signals={filteredSignals} />
        <RadarPanel selectedCompany={selectedCompanyData} />
        <RankingPanel />
      </section>

      <section className="lower-grid">
        <LifecyclePanel />
        <WatchPoolPanel />
        <SourcePanel />
      </section>
    </main>
  )
}

function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="AI Model Radar 首页">
        <span className="brand-mark">
          <Radar size={18} />
        </span>
        <span>
          <strong>AI Model Radar</strong>
          <small>模型雷达</small>
        </span>
      </a>
      <nav className="nav-links" aria-label="主导航">
        {['雷达', '发布', '榜单', '模型库', '信号源'].map((item) => (
          <a href={`#${item}`} key={item}>
            {item}
          </a>
        ))}
      </nav>
      <label className="search-box" htmlFor="model-search">
        <Search size={16} />
        <input id="model-search" type="search" placeholder="搜索模型、公司或信号" />
      </label>
      <a
        className="github-button"
        href="https://github.com/Yueyuyu/ai-model-radar"
        target="_blank"
        rel="noreferrer"
      >
        <GitFork size={16} />
        GitHub
      </a>
    </header>
  )
}

function CompanyFilters({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (company: string) => void
}) {
  return (
    <div className="company-filters">
      {['全部', ...companies.map((company) => company.name)].map((company) => (
        <button
          key={company}
          className={selected === company ? 'active' : ''}
          type="button"
          onClick={() => onSelect(company)}
        >
          {company}
        </button>
      ))}
    </div>
  )
}

function SignalFeed({ signals: visibleSignals }: { signals: ModelSignal[] }) {
  return (
    <article className="panel signal-feed" id="发布">
      <PanelHeader
        icon={<Bell size={18} />}
        title="最新信号流"
        action={`${visibleSignals.length} 条`}
      />
      <div className="signal-list">
        {visibleSignals.map((signal) => (
          <button className="signal-card" type="button" key={signal.id}>
            <div className="signal-card-top">
              <span className={`level ${signal.level}`}>{levelLabels[signal.level]}</span>
              <span>{signal.time}</span>
            </div>
            <h2>{signal.model}</h2>
            <p>{signal.title}</p>
            <div className="signal-meta">
              <span>{signal.source}</span>
              <strong>{signal.confidence}%</strong>
            </div>
            <small>{signal.impact}</small>
          </button>
        ))}
      </div>
    </article>
  )
}

function RadarPanel({ selectedCompany }: { selectedCompany?: WatchCompany }) {
  return (
    <article className="panel radar-panel" id="雷达">
      <PanelHeader
        icon={<Activity size={18} />}
        title={selectedCompany ? `${selectedCompany.name} 观察窗口` : 'P0 模型雷达'}
        action="Live"
      />
      <div className="radar-stage">
        <div className="radar-core">
          <div className="radar-ring ring-one" />
          <div className="radar-ring ring-two" />
          <div className="radar-ring ring-three" />
          <div className="sweep-line" />
          {companies.map((company, index) => (
            <RadarPoint company={company} index={index} key={company.name} />
          ))}
          <div className="core-orb">
            <Sparkles size={18} />
            <strong>Radar</strong>
            <span>可信度扫描</span>
          </div>
        </div>
      </div>
      <div className="radar-summary">
        <div>
          <span>活跃公司</span>
          <strong>{companies.length}</strong>
        </div>
        <div>
          <span>今日信号</span>
          <strong>{signals.length}</strong>
        </div>
        <div>
          <span>平均可信度</span>
          <strong>76%</strong>
        </div>
      </div>
    </article>
  )
}

function RadarPoint({ company, index }: { company: WatchCompany; index: number }) {
  const positions = [
    ['55%', '17%'],
    ['75%', '31%'],
    ['70%', '65%'],
    ['44%', '78%'],
    ['24%', '60%'],
    ['20%', '33%'],
    ['47%', '45%'],
    ['61%', '55%'],
  ]
  const [left, top] = positions[index] ?? ['50%', '50%']

  return (
    <span
      className="radar-point"
      style={{ left, top, '--point-color': company.accent } as CSSProperties}
    >
      <b>{company.name}</b>
      <small>{company.activeSignals}</small>
    </span>
  )
}

function RankingPanel() {
  return (
    <article className="panel ranking-panel" id="榜单">
      <PanelHeader icon={<Zap size={18} />} title="榜单变化" action="聚合口径" />
      <div className="ranking-list">
        {rankingMoves.map((item) => (
          <div className="ranking-row" key={item.model}>
            <div>
              <strong>{item.model}</strong>
              <span>
                {item.company} / {item.board}
              </span>
            </div>
            <div className={item.change >= 0 ? 'move up' : 'move down'}>
              {item.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {item.change >= 0 ? `+${item.change}` : item.change}
            </div>
            <span className="score">{item.score}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function LifecyclePanel() {
  return (
    <article className="panel lifecycle-panel">
      <PanelHeader icon={<Globe2 size={18} />} title="模型生命周期" action="从传闻到上榜" />
      <div className="timeline">
        {timeline.map((step) => (
          <div className={`timeline-step ${step.status}`} key={step.label}>
            <span />
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

function WatchPoolPanel() {
  return (
    <article className="panel watch-pool-panel" id="模型库">
      <PanelHeader icon={<ShieldCheck size={18} />} title="P0 观察池" action="Notion AI 种子" />
      <div className="watch-grid">
        {companies.map((company) => (
          <div className="watch-card" key={company.name}>
            <span style={{ background: company.accent }} />
            <strong>{company.name}</strong>
            <small>{company.family}</small>
            <p>{company.focus}</p>
            <div>
              <b>{company.score}</b>
              <em>{company.status}</em>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function SourcePanel() {
  return (
    <article className="panel source-panel" id="信号源">
      <PanelHeader icon={<Radar size={18} />} title="可信度系统" action="证据链" />
      <div className="source-bars">
        {sourceTypes.map((source) => (
          <div className="source-row" key={source.label}>
            <div>
              <span className={`level ${source.level}`}>{source.label}</span>
              <strong>{source.value}%</strong>
            </div>
            <progress value={source.value} max="100" />
          </div>
        ))}
      </div>
    </article>
  )
}

function PanelHeader({
  icon,
  title,
  action,
}: {
  icon: ReactNode
  title: string
  action: string
}) {
  return (
    <div className="panel-header">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <span>{action}</span>
    </div>
  )
}

export default App
