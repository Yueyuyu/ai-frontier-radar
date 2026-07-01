import type { ReactNode } from 'react'
import { AlertTriangle, BookOpenText, Cloud, FileSearch, KeyRound, LoaderCircle, Search, ShieldCheck, Trophy, X } from 'lucide-react'
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

function Section({ children, className = '', title }: { children: ReactNode; className?: string; title: string }) {
  return (
    <section className={`fi-state-section ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ButtonMatrix() {
  return (
    <div className="fi-state-button-matrix">
      <span />
      {buttonStates.map((state) => <strong key={state}>{state}</strong>)}
      {buttonRows.map((row, rowIndex) => (
        <div className="fi-state-button-row" key={row}>
          <em key={`${row}-label`}>{row}</em>
          {buttonStates.map((state, stateIndex) => (
            <button
              className={`fi-state-button is-${rowIndex} ${stateIndex === 1 ? 'is-hover' : ''} ${stateIndex === 2 ? 'is-pressed' : ''}`}
              disabled={stateIndex === 3 || rowIndex === 4}
              key={`${row}-${state}`}
              type="button"
            >
              按钮
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function Segments() {
  return (
    <div className="fi-state-stack">
      <div>
        <h3>分段控制（单选）</h3>
        <div className="fi-state-segment">
          {['全部', '模型', 'Agent', 'Skill', '工具'].map((item, index) => <button className={index === 0 ? 'is-active' : ''} key={item} type="button">{item}</button>)}
        </div>
      </div>
      <div>
        <h3>分段控制（多选）</h3>
        <div className="fi-state-check-row">
          {['全部', '模型', 'Agent', 'Skill', '官方', '社区'].map((item, index) => <label key={item}><input defaultChecked={index < 2} type="checkbox" />{item}</label>)}
        </div>
      </div>
      <div>
        <h3>筛选芯片</h3>
        <div className="fi-state-chip-row">
          {['全部 120', '高置信 36', '官方 82', '社区 58', '待配置 12', '失败 3'].map((item, index) => <span className={`is-${index}`} key={item}>{item}</span>)}
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

function InputBoard() {
  return (
    <div className="fi-state-input-grid">
      <label>
        <span>搜索框</span>
        <div><Search size={16} /><input placeholder="搜索模型、公司、Agent..." /></div>
      </label>
      <label>
        <span>选择器</span>
        <select defaultValue="">
          <option value="" disabled>请选择来源类型</option>
          <option>官方</option>
          <option>平台</option>
        </select>
      </label>
      <div>
        <span>开关</span>
        <button className="fi-state-switch is-on" type="button"><i />开启</button>
        <button className="fi-state-switch" type="button"><i />关闭</button>
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

function SignalPreviewCards() {
  return (
    <div className="fi-state-card-grid">
      {[
        ['GPT-5.2 API 调价', '官方', '95%', 'Default'],
        ['GPT-5.2 API 调价', '官方', '95%', 'Selected'],
        ['Qwen2.5 新模型', '传闻', '35%', 'Low Confidence'],
      ].map((card, index) => (
        <article className={index === 1 ? 'is-selected' : index === 2 ? 'is-low' : ''} key={`${card[0]}-${index}`}>
          <span className={index === 2 ? 'is-orange' : 'is-teal'}>{index === 2 ? <AlertTriangle size={21} /> : <ShieldCheck size={21} />}</span>
          <strong>{card[0]}</strong>
          <StatusBadge status={index === 2 ? 'rumor' : 'official'}>{card[1]}</StatusBadge>
          <small>{index === 2 ? '2 小时前' : '30 分钟前'}</small>
          <p>{index === 2 ? '疑似下周发布，尚未官方确认' : '输入降价 20%，输出降价 10%'}</p>
          <div><em>证据 {index === 2 ? 1 : 6}</em><em>可信度 <b>{card[2]}</b></em></div>
          <label>{card[3]}</label>
        </article>
      ))}
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

function TableSamples() {
  const rankingRows = ['GPT-5.2', 'Claude 3.5', 'Gemini 2.0 Flash', 'Llama 3 70B', 'Qwen2.5 72B']
  const sourceRows = ['OpenAI API', 'OpenRouter API', 'X Recent Search', 'Product Hunt', 'Semantic Scholar']
  return (
    <div className="fi-state-table-grid">
      <table>
        <caption>榜单表格（紧凑）</caption>
        <thead><tr><th>排名</th><th>名称</th><th>类别</th><th>综合评分</th><th>趋势</th><th>来源</th></tr></thead>
        <tbody>{rankingRows.map((name, index) => <tr key={name}><td>{index + 1}</td><td>{name}</td><td>模型</td><td><StatusBadge confidence={96 - index * 4}>{(96.5 - index * 3.6).toFixed(1)}</StatusBadge></td><td>{index % 2 ? '—' : `↑ ${index + 1}`}</td><td>{index < 3 ? '官方' : '社区'}</td></tr>)}</tbody>
      </table>
      <table>
        <caption>来源运行表格</caption>
        <thead><tr><th>来源</th><th>状态</th><th>条目</th><th>耗时</th><th>最近检查</th><th>操作</th></tr></thead>
        <tbody>{sourceRows.map((name, index) => <tr key={name}><td>{name}</td><td><StatusBadge status={index < 2 ? 'ok' : index < 4 ? 'skipped' : 'planned'}>{index < 2 ? 'ok' : index < 4 ? 'skipped' : 'planned'}</StatusBadge></td><td>{index < 2 ? 1256 - index * 364 : 0}</td><td>{index < 2 ? `${index + 2} 分钟` : '-'}</td><td>{index < 2 ? `${index + 1} 分钟前` : '-'}</td><td><a href="#source-runs">详情</a></td></tr>)}</tbody>
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

export function ComponentStateBoard() {
  return (
    <main className="fi-component-board">
      <header>
        <div>
          <h1><span>12</span> 组件与状态 / Components & State Board</h1>
          <p>AI 前沿情报站 · 设计系统组件库</p>
        </div>
        <aside><span>版本：v1.0.0</span><span>更新：2024-05-15</span></aside>
      </header>
      <div className="fi-component-grid">
        <Section className="area-buttons" title="一、按钮 / Button States"><ButtonMatrix /></Section>
        <Section className="area-segments" title="二、分段控制 & 筛选芯片 / Segments & Filter Chips"><Segments /></Section>
        <Section className="area-badges" title="三、徽章 / Badges & Status"><BadgeBoard /></Section>
        <Section className="area-inputs" title="四、输入 / Input"><InputBoard /></Section>
        <Section className="area-cards" title="五、卡片 / Card"><SignalPreviewCards /><h3>来源证据卡片 SourceEvidenceCard</h3><EvidenceCards /></Section>
        <Section className="area-tables" title="六、表格 / Table"><TableSamples /></Section>
        <Section className="area-states" title="七、状态 / States"><StateExamples /><p className="fi-state-note"><AlertTriangle size={15} />说明：X / HN / GitHub 等为热度与传播来源，不作为独立官方确认依据。</p></Section>
        <Section className="area-colors" title="八、颜色令牌（浅色主题） Color Tokens"><TokenBoard /></Section>
        <Section className="area-type" title="九、字体 / Typography"><TypographyBoard /></Section>
      </div>
    </main>
  )
}
