import { CheckCircle2, ExternalLink, FileImage, MonitorCheck, Smartphone, TriangleAlert } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

const coverageRows = [
  ['00-coverage-map', '覆盖地图', '#coverage-map', 'desktop', '当前页'],
  ['01-overview', '情报总览', '#overview', 'desktop', '已接入'],
  ['02-signal-feed', '前沿信号流', '#signals', 'desktop', '待补状态'],
  ['03-model-map', '模型地图', '#model-rankings', 'desktop', '专属页'],
  ['04-agent-market', 'Agent 市场', '#agent-rankings', 'desktop', '专属页'],
  ['05-skill-plugin', 'Skill / 插件', '#tool-rankings', 'desktop', '专属页'],
  ['06-data-operations', '数据洞察', '#source-runs', 'desktop', '待补状态'],
  ['07-rankings', '榜单', '#rankings', 'desktop', '专属页'],
  ['08-release-calendar', '发布日历', '#calendar', 'desktop', '专属页'],
  ['09-trusted-sources', '可信来源', '#sources', 'desktop', '待补状态'],
  ['10-roadmap', '路线图', '#roadmap', 'desktop', '专属页'],
  ['11-mobile-390', '移动端', '#overview / #mobile-empty / #mobile-loading', 'mobile', '三态接入'],
  ['12-components-states', '组件与状态板', '#components-states', 'desktop', '基准页'],
]

const stateGroups = [
  ['基础页面', 12, '全部源图已有 React 对应入口'],
  ['移动状态', 3, '正常、空状态、加载骨架'],
  ['组件状态', 9, '按钮、徽章、输入、卡片、表格、状态、颜色、字体'],
  ['运维状态', 6, '缺密钥、降级、失败、计划中、健康度、刷新任务'],
]

export function CoverageMapPage() {
  return (
    <section className="fi-coverage-page">
      <div className="fi-coverage-hero">
        <div>
          <span>00</span>
          <h2>UI 覆盖地图 / Coverage Map</h2>
          <p>把设计源图、React 路由、状态入口和验收证据统一归档，避免后续还原时遗漏页面或状态。</p>
        </div>
        <div className="fi-coverage-score">
          <strong>13</strong>
          <span>设计页面</span>
          <StatusBadge status="active">持续验收</StatusBadge>
        </div>
      </div>

      <div className="fi-coverage-metrics">
        {stateGroups.map(([label, count, note]) => (
          <article key={label}>
            <MonitorCheck size={20} />
            <strong>{count}</strong>
            <span>{label}</span>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="fi-coverage-board-layout">
        <section className="fi-coverage-card-grid" aria-label="页面覆盖缩略图">
          {coverageRows.slice(1).map(([id, title, route, viewport, status], index) => (
            <article key={id}>
              <div>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{title}</strong>
                {viewport === 'mobile' ? <Smartphone size={15} /> : <MonitorCheck size={15} />}
              </div>
              <img src={`/design-concepts/complete-ui/pages/${id}.png`} alt={`${title} 源图缩略图`} />
              <p><CheckCircle2 size={13} />{status}</p>
              <code>{route}</code>
            </article>
          ))}
        </section>
        <aside className="fi-coverage-layer-stack">
          {[
            ['L1 官方确认', 'OpenAI、Anthropic、Gemini、Mistral、DeepSeek、Kimi、Qwen、ZAI'],
            ['L2 模型能力', 'OpenRouter、Artificial Analysis、Arena、SWE-bench、Hugging Face'],
            ['L3 Agent 能力', 'Steel.dev、Agent Arena、HAL、SkillsBench、OSWorld、WebArena'],
            ['L4 工具热度', 'GitHub、Product Hunt、HN、OSSInsight、Fourtune'],
            ['L5 研究趋势', 'arXiv、Semantic Scholar'],
            ['L6 早期传播', 'X Recent Search、Filtered Stream、HN、Reddit'],
          ].map(([title, copy], index) => (
            <article key={title}>
              <span>L{index + 1}</span>
              <strong>{title}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </aside>
      </div>

      <section className="fi-strict-panel fi-coverage-table-card">
        <div className="fi-strict-card-head">
          <h3>页面与状态覆盖清单</h3>
          <a href="design-concepts/complete-ui/pages/00-coverage-map.png" target="_blank" rel="noreferrer">查看源图 <ExternalLink size={13} /></a>
        </div>
        <table className="fi-coverage-table">
          <thead>
            <tr>
              <th>页面</th>
              <th>名称</th>
              <th>React 入口</th>
              <th>视口</th>
              <th>设计源图</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {coverageRows.map(([id, title, route, viewport, status]) => (
              <tr key={id}>
                <td><strong>{id}</strong></td>
                <td>{title}</td>
                <td><code>{route}</code></td>
                <td>{viewport === 'mobile' ? <><Smartphone size={14} />390</> : <><MonitorCheck size={14} />1536</>}</td>
                <td><FileImage size={14} />`design-concepts/complete-ui/pages/{id}.png`</td>
                <td><StatusBadge status={status.includes('待补') ? 'skipped' : 'ok'}>{status}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="fi-coverage-bottom">
        <section className="fi-strict-panel">
          <h3><CheckCircle2 size={17} />验收入口</h3>
          <p>桌面页统一用 1536 x 1024 截图；移动端使用 390 x 844，并单独截取 `#mobile-empty` 与 `#mobile-loading`。</p>
        </section>
        <section className="fi-strict-panel is-warning">
          <h3><TriangleAlert size={17} />不可替代规则</h3>
          <p>`design-concepts/complete-ui/pages/*.png` 是唯一视觉源；React 页面、静态 HTML 和 QA 截图都要反向对照这批源图。</p>
        </section>
      </div>
    </section>
  )
}
