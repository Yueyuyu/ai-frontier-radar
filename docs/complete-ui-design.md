# 完整 UI 设计交付

更新时间：2026-06-30

本文件记录 `AI 前沿情报站 / Frontier Intel` 的完整 UI 设计交付物。设计目标是把当前系统从单一展示页整理为可持续使用的 AI 前沿情报工作台：每个页面都能说明自己的功能、数据来源、状态和前端还原方式。

## 交付物

| 类型 | 路径或链接 | 用途 |
| --- | --- | --- |
| Figma 可编辑文件 | https://www.figma.com/design/BrCkDbTQn8W3LB6nm7p1KQ | 13 个可编辑 frame：目录、10 个桌面页面、移动端、组件状态板 |
| Figma 目录截图 | `design-concepts/complete-ui/figma-coverage-map.png` | 快速确认页面覆盖、数据来源分层和前端还原依据 |
| imagegen 总览图 | `design-concepts/complete-ui/imagegen-complete-ui-board.png` | 完整 UI 视觉总览，适合做沟通参考 |
| imagegen 页面详情图 | `design-concepts/complete-ui/pages/` | 每个页面、移动端和组件状态板的独立展开图 |
| 结构化前端契约 | `docs/ui-blueprint.json` | 实现时的字段、页面、组件、交互和状态来源 |
| 信息架构文档 | `docs/ui-information-architecture.md` | 页面职责、组件边界、响应式规则和设计 token |
| UI 还原实施规则 | `docs/ui-implementation-rules.md` | 后续前端还原必须遵守的读取顺序、禁止项和截图验收规则 |
| UI 还原实施包 | `docs/ui-implementation-package/` | 设计 tokens、固定 fixture、13 个页面 screen spec |
| 静态参考 UI | `reference-ui/` | 13 个可直接打开的 HTML 页面，用于 React 实现前对齐布局和组件密度 |

说明：imagegen 图里的局部文字只作为视觉密度和布局参考，精确文案、字段、状态和数据来源以 `docs/ui-blueprint.json` 与本文档为准。
后续前端实现不能只引用图片，必须同时引用 `docs/ui-implementation-rules.md`、对应 `screen-specs/*.json` 和 `reference-ui/*.html`。

## imagegen 页面详情图清单

| 页面 | 文件 |
| --- | --- |
| 设计覆盖说明 | `design-concepts/complete-ui/pages/00-coverage-map.png` |
| 情报总览 | `design-concepts/complete-ui/pages/01-overview.png` |
| 前沿信号流 | `design-concepts/complete-ui/pages/02-signal-feed.png` |
| 模型地图 | `design-concepts/complete-ui/pages/03-model-map.png` |
| Agent 市场 | `design-concepts/complete-ui/pages/04-agent-market.png` |
| Skill / 插件 | `design-concepts/complete-ui/pages/05-skill-plugin.png` |
| 数据洞察 | `design-concepts/complete-ui/pages/06-data-operations.png` |
| 榜单 | `design-concepts/complete-ui/pages/07-rankings.png` |
| 发布日历 | `design-concepts/complete-ui/pages/08-release-calendar.png` |
| 可信来源 | `design-concepts/complete-ui/pages/09-trusted-sources.png` |
| 路线图 | `design-concepts/complete-ui/pages/10-roadmap.png` |
| 移动端 390px | `design-concepts/complete-ui/pages/11-mobile-390.png` |
| 组件与状态板 | `design-concepts/complete-ui/pages/12-components-states.png` |

## 设计原则

- 使用现有浅色系统主题：`#f6fbff` 页面底色、白色面板、浅蓝灰描边、青绿主色，蓝、珊瑚、紫、绿作为分类强调。
- 不使用雷达、靶心、扫描、圆心放射或中心节点扩散视觉。
- 所有页面都要把数据来源和可信度放在显性位置，不能把来源健康藏在后台。
- X / Twitter 只作为早期传播和热度参考，不能单独确认发布事实。
- 画板面向前端落地，优先使用表格、矩阵、列表、侧栏、时间线、状态徽标和抽屉，而不是营销页式大图。

## Figma frame 清单

| Frame | 页面 | 主要功能 | 前端路由 |
| --- | --- | --- | --- |
| `00 设计目录 / Coverage Map` | 设计目录 | 页面覆盖、来源分层、前端还原依据 | 不上线 |
| `01 情报总览 / Overview` | 情报总览 | KPI、信号矩阵、详情 Inspector、今日信号、榜单变化、来源健康、刷新任务 | `#overview` |
| `02 前沿信号流 / Signal Feed` | 前沿信号流 | 筛选栏、信号列表、详情证据链、空结果、降级数据、移动抽屉模式 | `#signals` |
| `03 模型地图 / Model Map` | 模型地图 | 模型 KPI、模型排行榜、模型能力、官方和榜单来源覆盖 | `#model-rankings` |
| `04 Agent 市场 / Agent Market` | Agent 市场 | Agent 能力榜、能力标签、评测来源健康 | `#agent-rankings` |
| `05 Skill 插件 / Skill Plugin` | Skill / 插件 | 生态热度榜、插件信号、来源分布、能力分类 | `#tool-rankings` |
| `06 数据洞察 / Data Operations` | 数据洞察 | 数据库状态、缺失密钥、数据分栏、刷新任务表、错误原因 | `#source-runs` |
| `07 榜单 / Rankings` | 榜单 | 分段控制、综合榜表、趋势线、排序评分说明 | `#rankings` |
| `08 发布日历 / Release Calendar` | 发布日历 | 时间窗口、发布/文档/榜单事件、低可信降权提示 | `#calendar` |
| `09 可信来源 / Trusted Sources` | 可信来源 | 来源目录、来源分组、覆盖率、健康状态、最近检查时间 | `#sources` |
| `10 路线图 / Roadmap` | 路线图 | 阶段计划、状态、影响页面、进度 | `#roadmap` |
| `11 移动端 / Mobile 390` | 移动端 | 顶部栏、信号卡、详情底部抽屉、底部导航 | 响应式 |
| `12 组件与状态 / Components States` | 组件状态板 | 按钮、筛选、徽标、信号卡、证据卡、Loading、空结果、失败、缺密钥、降级数据 | 组件库参考 |

## 页面功能与数据来源

| 页面 | 主数据 | 关键来源 |
| --- | --- | --- |
| 情报总览 | `signals`、`rankingItems`、`sourceHealth`、`sourceRuns`、`stats` | 官方确认、模型能力、Agent 能力、工具热度、研究趋势、早期传播 |
| 前沿信号流 | `filteredSignals`、`selectedSignal.sources` | OpenAI、Anthropic、Google、Mistral、DeepSeek、Kimi、Qwen、ZAI、X、HN、GitHub |
| 模型地图 | `rankingItems.kind=model`、模型类信号、模型数据面板 | OpenRouter、Artificial Analysis、LMArena、SWE-bench、Hugging Face、官方 changelog |
| Agent 市场 | `rankingItems.kind=agent`、Agent 类信号、评测来源健康 | Steel.dev、Agent Arena、HAL Princeton、SkillsBench、OSWorld、WebArena |
| Skill / 插件 | `rankingItems.kind=tool`、工具和 Skill 信号 | GitHub REST API、OSSInsight、Product Hunt、HN Algolia、Futurepedia、There is An AI For That |
| 数据洞察 | `sourceRuns`、`sourceHealth`、`dataPanels`、`stats.databaseStatus` | 所有抓取器、环境变量状态、远程 JSON、内置 fallback 数据 |
| 榜单 | `rankingItems`、`trend`、评分规则 | 模型榜单、Agent benchmark、GitHub/Product Hunt/HN/X 热度、官方来源 |
| 发布日历 | `releaseFrames`、按窗口聚合的 `signals` | 官方 changelog、release notes、文档、RSS、API、低权重传播信号 |
| 可信来源 | `sourceHealth` | 所有 sources：状态、覆盖率、影响力、最近检查时间、错误原因 |
| 路线图 | `roadmapItems` | 产品计划、数据源接入计划、前端迁移计划 |

## 组件还原映射

| Figma 区域 | 前端组件 |
| --- | --- |
| 侧边导航、顶部命令栏 | `AppShell`、`CommandBar` |
| 类别 chip、筛选栏 | `CategoryRail`、`SignalFilterBar`、`StatusBadge` |
| 信号矩阵、信号行、信号卡 | `SignalMatrix`、`SignalCard`、`SignalList` |
| 详情侧栏、证据卡 | `SignalInspector`、`SourceEvidenceCard` |
| 排行表、趋势线 | `RankingTable`、`TrendSparkline` |
| 来源健康、刷新任务 | `SourceHealthPanel`、`SourceRunList` |
| 发布窗口 | `ReleaseCalendar` |
| 路线图卡 | `RoadmapList` |
| 空结果、失败、缺密钥、降级数据 | `EmptyState`、`ErrorState`、`DegradedDataBanner` |
| 移动底部抽屉 | `MobileSignalDetailDrawer` |

## 验证记录

- Figma 文件创建成功：`AI 前沿情报站 - Complete UI Design`。
- Figma 写入成功：13 个顶层 frame，1485 个可编辑节点。
- Figma 元数据检查成功：`完整 UI 蓝图` 页面存在，frame 命名覆盖目录、10 个桌面页面、移动端和组件状态板。
- Figma 目录截图保存成功：`design-concepts/complete-ui/figma-coverage-map.png`。
- imagegen 总览图保存成功：`design-concepts/complete-ui/imagegen-complete-ui-board.png`。
- imagegen 页面详情图保存成功：`design-concepts/complete-ui/pages/00-coverage-map.png` 到 `design-concepts/complete-ui/pages/12-components-states.png`。
- 受 Figma Starter 计划 MCP 调用限额影响，第二张 Figma 截图没有生成；已保留成功的目录截图和元数据检查结果。
