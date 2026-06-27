import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { animate, stagger } from 'animejs'
import { Activity, ArrowUpRight, GitFork, Radar, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import './App.css'
import { categories, releaseFrames, signals } from './data'
import type { ConfidenceLevel, FrontierSignal } from './types'

const ALL_CATEGORIES = '全部'

const levelLabels: Record<ConfidenceLevel, string> = {
  official: '官方确认',
  platform: '平台接入',
  docs: '文档信号',
  rumor: '社区传闻',
}

const navItems = [
  { label: '信号', href: '#signals' },
  { label: '生态', href: '#frontier' },
  { label: '榜单', href: '#rankings' },
  { label: '信号源', href: '#sources' },
]

function App() {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)
  const [selectedSignalId, setSelectedSignalId] = useState(signals[0].id)

  const visibleSignals = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) {
      return signals
    }

    return signals.filter((signal) => signal.category === selectedCategory)
  }, [selectedCategory])

  const selectedSignal = signals.find((signal) => signal.id === selectedSignalId) ?? signals[0]

  useEffect(() => {
    animate('.hero-copy > *', {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(80),
      duration: 680,
      easing: 'outCubic',
    })

    animate('.signal-node', {
      opacity: [0, 1],
      translateX: [-18, 0],
      delay: stagger(90),
      duration: 620,
      easing: 'outCubic',
    })

    animate('.release-card', {
      translateY: [12, 0],
      opacity: [0, 1],
      delay: stagger(60),
      duration: 520,
      easing: 'outCubic',
    })
  }, [])

  useEffect(() => {
    animate('.inspector-shell', {
      opacity: [0.75, 1],
      translateX: [10, 0],
      duration: 360,
      easing: 'outQuad',
    })
  }, [selectedSignalId])

  return (
    <main className="app-shell">
      <AmbientField />
      <Header />

      <section className="experience-grid">
        <div className="hero-copy">
          <h1>AI 前沿雷达</h1>
          <p>追踪模型、工具、Agent 与 AI 编程生态的发布信号</p>
          <div className="live-row">
            <span className="live-dot" />
            <strong>实时</strong>
            <span>追踪 128 个前沿对象</span>
            <span>36 个信号源</span>
            <span>28 秒前更新</span>
          </div>
        </div>

        <div className="filter-row" aria-label="前沿类别筛选">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => {
                setSelectedCategory(category)
                const first = category === ALL_CATEGORIES ? signals[0] : signals.find((signal) => signal.category === category)
                if (first) {
                  setSelectedSignalId(first.id)
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <SignalCinema
          selectedSignalId={selectedSignalId}
          signals={visibleSignals}
          onSelect={setSelectedSignalId}
        />
        <SignalInspector signal={selectedSignal} />
      </section>

      <ReleaseStrip selectedSignalId={selectedSignalId} onSelect={setSelectedSignalId} />
    </main>
  )
}

function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="AI 前沿雷达首页">
        <span className="brand-mark">
          <Radar size={21} />
        </span>
        <span>
          <strong>AI 前沿雷达</strong>
          <small>AI Frontier Radar</small>
        </span>
      </a>

      <nav className="nav-links" aria-label="主导航">
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <label className="search-box" htmlFor="search">
        <Search size={16} />
        <input id="search" type="search" placeholder="搜索模型、工具、Agent、公司或信号..." />
      </label>

      <a
        className="github-button"
        href="https://github.com/Yueyuyu/ai-frontier-radar"
        target="_blank"
        rel="noreferrer"
      >
        <GitFork size={16} />
        GitHub
      </a>
    </header>
  )
}

function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <span className="scan-band" />
      <span className="signal-thread thread-a" />
      <span className="signal-thread thread-b" />
      <span className="signal-thread thread-c" />
    </div>
  )
}

function SignalCinema({
  selectedSignalId,
  signals: visibleSignals,
  onSelect,
}: {
  selectedSignalId: string
  signals: FrontierSignal[]
  onSelect: (id: string) => void
}) {
  return (
    <section className="cinema-stage" id="signals" aria-label="AI 前沿信号播放器">
      <div className="stage-toolbar">
        <div>
          <Activity size={18} />
          <span>前沿信号流</span>
        </div>
        <div className="stage-controls">
          <button type="button">1x</button>
          <button type="button">当前</button>
        </div>
      </div>

      <div className="time-ruler">
        <span>09:00</span>
        <span>09:15</span>
        <span>09:37</span>
        <span>09:45</span>
        <span>10:00</span>
        <span>10:15</span>
        <span>10:30</span>
      </div>

      <div className="signal-lanes">
        {visibleSignals.map((signal) => (
          <button
            type="button"
            key={signal.id}
            className={selectedSignalId === signal.id ? 'signal-node active' : 'signal-node'}
            style={
              {
                '--lane': signal.lane,
                '--offset': `${signal.offset}%`,
                '--accent': signal.accent,
              } as CSSProperties
            }
            onClick={() => onSelect(signal.id)}
          >
            <span className={`tag ${signal.level}`}>{levelLabels[signal.level]}</span>
            <strong>{signal.name}</strong>
            <small>
              {signal.provider} / {signal.category}
            </small>
            <b>{signal.confidence}%</b>
          </button>
        ))}
      </div>
    </section>
  )
}

function SignalInspector({ signal }: { signal: FrontierSignal }) {
  return (
    <aside className="inspector-shell" aria-label="选中信号详情">
      <div className="inspector-top">
        <span>选中信号</span>
        <Sparkles size={16} />
      </div>

      <div className="selected-model">
        <div className="model-glyph" style={{ '--accent': signal.accent } as CSSProperties}>
          {signal.provider.slice(0, 1)}
        </div>
        <div>
          <h2>{signal.name}</h2>
          <p>
            {signal.provider} / {signal.category}
          </p>
        </div>
        <div className="confidence">
          <strong>{signal.confidence}%</strong>
          <span>可信度</span>
        </div>
      </div>

      <p className="summary">{signal.summary}</p>

      <div className="meta-grid">
        <div>
          <span>首次发现</span>
          <strong>{signal.firstSeen}</strong>
        </div>
        <div>
          <span>最近更新</span>
          <strong>{signal.lastUpdate}</strong>
        </div>
        <div>
          <span>发布窗口</span>
          <strong>{signal.releaseWindow}</strong>
        </div>
      </div>

      <div className="source-list">
        {signal.sources.map((source) => (
          <div className="source-item" key={`${signal.id}-${source.name}`}>
            <div>
              <ShieldCheck size={16} />
              <strong>{source.name}</strong>
              <span className={`tag ${source.type}`}>{levelLabels[source.type]}</span>
            </div>
            <p>{source.detail}</p>
            <progress value={source.strength} max="100" />
          </div>
        ))}
      </div>

      <button className="report-button" type="button">
        查看完整报告
        <ArrowUpRight size={16} />
      </button>
    </aside>
  )
}

function ReleaseStrip({
  selectedSignalId,
  onSelect,
}: {
  selectedSignalId: string
  onSelect: (id: string) => void
}) {
  return (
    <section className="release-strip" id="frontier" aria-label="AI 前沿发布胶片">
      <div className="strip-label">
        <Zap size={16} />
        <span>最新与即将变化</span>
      </div>
      <div className="release-track">
        {releaseFrames.map((frame) => {
          const signal = signals.find((item) => item.name === frame.name)
          const isActive = signal?.id === selectedSignalId
          return (
            <button
              className={isActive ? 'release-card active' : 'release-card'}
              type="button"
              key={frame.name}
              style={{ '--accent': frame.accent } as CSSProperties}
              onClick={() => signal && onSelect(signal.id)}
            >
              <span>{frame.window}</span>
              <strong>{frame.name}</strong>
              <small>
                {frame.provider} / {frame.category}
              </small>
              <b>{frame.confidence ? `${frame.confidence}%` : '观察中'}</b>
            </button>
          )
        })}
      </div>
      <div className="scroll-hint">继续向下探索更多 AI 前沿情报</div>
    </section>
  )
}

export default App
