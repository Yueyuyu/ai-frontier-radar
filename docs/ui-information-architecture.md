# AI 前沿情报站信息架构与 UI 蓝图

更新时间：2026-06-30

## 参考资产

- 视觉蓝图参考：`design-concepts/ui-blueprint-workspace-intel.png`
- 当前实现截图：`design-concepts/implementation-home-1440x1024.png`
- 前端蓝图 JSON：`docs/ui-blueprint.json`
- 系统总览：`docs/system-overview.md`
- 数据来源：`docs/data-sources.md`
- 实施路线：`docs/implementation-roadmap.md`

说明：视觉蓝图图中的文字只作为布局和密度参考，最终文案、字段和交互以本文档和 `docs/ui-blueprint.json` 为准。

## 产品定位

AI 前沿情报站不是单纯展示首页，而是一个持续刷新的 AI 情报工作台。它把模型发布、AI 编程工具、Agent、MCP / Skill 插件、榜单变化、来源健康和发布窗口放在同一个可验证界面中，帮助用户快速判断“什么是真的、什么值得跟踪、证据来自哪里”。

核心原则：

- 先显示高置信信号，再允许下钻证据。
- 把官方、文档、平台、榜单、社区和传闻分层展示，避免混在一起。
- 所有卡片、榜单和详情都来自现有数据集契约或其派生视图模型，不做静态截图式 UI。
- 使用当前系统的浅色主题：浅蓝白页面、白色半透明面板、青绿主色，蓝、珊瑚、紫作为类别强调。界面要从“视觉首页”升级为“可长期使用的情报工作台”。
- 不使用圆形扫描、靶心或中心放射类视觉隐喻；中心区域改为信号矩阵、情报流、时间线和证据面板。

## 用户与任务

| 用户 | 主要问题 | UI 入口 |
| --- | --- | --- |
| 每日观察者 | 今天 AI 圈有什么可信变化？ | 情报总览、今日信号、发布日历 |
| 深度验证者 | 这个信号的证据链是什么？可信度多少？ | 信号详情、可信来源、数据洞察 |
| 产品/投资研究者 | 哪些模型、Agent、插件正在升温？ | 模型地图、Agent 市场、Skill / 插件、榜单 |
| 系统维护者 | 数据源是否正常？哪些来源需要密钥？ | 数据洞察、可信来源、路线图 |

## 信息架构

一级导航保留现有 `workspaceNav`，但将每个入口的职责固定下来。

| 导航 | 路由 | 主目标 | 关键模块 |
| --- | --- | --- | --- |
| 情报总览 | `#overview` | 一屏判断当前前沿态势 | 总览 KPI、信号矩阵、情报详情、今日信号、榜单、来源健康 |
| 前沿信号流 | `#signals` | 按类别、可信度、时间查看全部信号 | 筛选栏、信号列表、详情抽屉、证据链 |
| 模型地图 | `#model-rankings` | 聚合模型发布和模型榜单 | 模型榜单、模型信号、来源覆盖、趋势 |
| Agent 市场 | `#agent-rankings` | 观察 Agent 产品和运行时生态 | Agent 榜单、Agent 信号、评测来源 |
| Skill / 插件 | `#tool-rankings` | 追踪 MCP、Skill、开发工具和插件生态 | 插件热度、生态图、工具来源 |
| 数据洞察 | `#source-runs` | 监控抓取任务、数据库和数据分栏 | 数据源运行、刷新状态、数据库状态、失败原因 |
| 榜单 | `#rankings` | 集中比较模型、Agent、工具和信号热度 | 分组榜单、趋势、变化值、来源链接 |
| 发布日历 | `#calendar` | 按时间窗口查看发布和预览 | 时间轴、发布窗口、确认程度 |
| 可信来源 | `#sources` | 审核信号背后的来源质量 | 来源目录、覆盖率、状态、最近检查 |
| 路线图 | `#roadmap` | 展示系统产品化和数据接入计划 | 版本阶段、状态、下一步能力 |

## 核心对象模型

现有 `src/types.ts` 已覆盖主要数据对象，UI 蓝图不强制改类型。前端实现时优先从这些对象派生视图模型。

| 对象 | 当前类型 | UI 用途 |
| --- | --- | --- |
| 信号 | `FrontierSignal` | 信号行、信号卡、详情页、发布日历关联 |
| 信号来源 | `SignalSource` | 详情证据链、来源可信度、外链 |
| 发布窗口 | `ReleaseFrame` | 发布时间线、发布日历 |
| 榜单项 | `RankingItem` | 榜单中心、领域页、首页摘要 |
| 来源健康 | `SourceHealth` | 可信来源页、来源健康面板 |
| 来源运行 | `SourceRun` | 数据洞察、刷新任务状态 |
| 数据面板 | `DataPanel` | 模型、Agent、工具三个数据分栏 |
| 路线图 | `RoadmapItem` | 路线图页面 |

建议新增的派生字段只在前端计算，不立刻修改后端数据结构：

| 派生字段 | 来源 | 用途 |
| --- | --- | --- |
| `signal.trustBand` | `level + confidence` | 高可信、待确认、观察中 |
| `signal.sourceCount` | `sources.length` | 详情摘要和列表排序 |
| `ranking.deltaLabel` | `change` | 榜单涨跌显示 |
| `source.healthBand` | `status + coverage` | 健康、降级、失败、待配置 |
| `release.relativeWindow` | `window + lastUpdate` | 发布日历分组 |

## 数据来源架构

详细数据来源、评分规则和落地步骤见 `docs/data-sources.md`。

当前系统按多源信号体系组织数据：

- 官网、文档、API 用于确认事实。
- 榜单、benchmark 用于能力排序。
- GitHub、Product Hunt、HN、Hugging Face 用于生态热度。
- X / Twitter 用于早期传播信号，不能单独确认发布事实。
- 来源健康本身也要展示，包括成功、失败、待配置、最近抓取时间和错误原因。

核心来源分组：

| 分组 | 主要来源 | UI 用途 |
| --- | --- | --- |
| 官方确认 | OpenAI、Anthropic、Google Gemini、Mistral、DeepSeek、Kimi、Qwen、ZAI 的官网、文档、changelog | 发布日历、信号可信度、事实确认 |
| 模型能力 | Artificial Analysis、Arena / LMArena、SWE-bench、OpenRouter、Hugging Face | 模型地图、模型排行、趋势 |
| Agent 能力 | Steel.dev、Agent Arena、HAL Princeton、SkillsBench、OSWorld、WebArena | Agent 市场、Agent 榜单 |
| 工具热度 | GitHub、OSSInsight、Product Hunt、HN Algolia、Futurepedia、There is An AI For That | Skill / 插件、工具榜、生态热度 |
| 研究趋势 | arXiv、Semantic Scholar | 前沿信号流、研究型信号 |
| 早期传播 | X Recent Search、X Filtered Stream | 热度变化、早期传闻，必须降权展示 |

## 应用壳

### 桌面布局

桌面端以 1440px 宽为主设计基准：

- 左侧固定导航，宽度 232px。
- 右侧工作区使用 12 栏弹性网格。
- 顶部为命令栏：当前视图标题、全局搜索、类型筛选、GitHub / 语言入口。
- 主内容区根据路由切换，不跳出应用壳。
- 右下浮动操作保留为数据源状态或刷新入口，但需要提供明确 tooltip。

### 移动布局

移动端以 390px 宽为主设计基准：

- 顶部显示品牌、搜索入口和菜单按钮。
- 一级导航收敛为底部 4 个主入口：情报、信号、榜单、来源。
- 次级页面通过顶部分段控件或抽屉访问。
- 信号详情默认用底部抽屉，避免长页面反复跳转。

## 页面蓝图

### 情报总览

目标：让用户在 30 秒内判断今日最重要的 AI 前沿变化。

布局：

- 顶部：标题、更新时间、对象数、来源数、已验证来源数。
- 中央：信号矩阵，按类别分组展示名称、提供方、置信度、趋势、发布窗口、证据和来源数。
- 右侧：当前选中信号详情，展示置信度、发布窗口、来源证据。
- 下方：今日信号卡、榜单变化、来源健康、刷新运行摘要。

核心交互：

- 点击信号行或信号卡，同步更新右侧详情。
- 类别筛选影响信号矩阵和信号卡。
- 点击来源卡打开外链。
- 点击“查看全部”进入对应页面。

### 前沿信号流

目标：把所有信号作为可筛选、可验证、可排序的工作列表。

布局：

- 顶部筛选：类别、可信度、来源类型、时间窗口。
- 左侧主列表：信号名称、提供方、类别、置信度、发布窗口、更新时间。
- 右侧详情：摘要、证据链、来源强度、相关榜单、外链。

状态：

- 无筛选结果：显示“没有匹配信号”，提供重置筛选。
- 数据刷新失败：保留上一版快照，显示降级提示。
- 来源缺密钥：在证据链里标记“待配置”，不隐藏。

### 模型地图

目标：按模型和提供方聚合信号、榜单和来源。

布局：

- 顶部 KPI：模型数量、榜单条目、最高置信信号、刷新周期。
- 主区：模型榜单表，支持按分数、变化、提供方排序。
- 侧区：关联模型信号、官方来源覆盖、最新发布窗口。

### Agent 市场

目标：观察 Agent 产品、运行时、评测榜单和工具权限变化。

布局：

- Agent 榜单表。
- Agent 信号列表。
- 评测来源健康：Steel.dev、Agent Arena、HAL、SkillsBench、OSWorld、WebArena。
- 能力标签：浏览器、代码、桌面、研究、工具调用、沙箱。

### Skill / 插件

目标：跟踪 MCP Server、Skill、开发者插件和工具工作流生态。

布局：

- 生态热度榜。
- MCP / Skill 相关信号。
- 来源分布：GitHub、Product Hunt、HN、X、官方文档。
- 插件能力标签：连接器、代码工具、浏览器、数据、内容生成、自动化。

### 数据洞察

目标：系统维护者能快速看到数据接入是否健康。

布局：

- 数据库状态。
- 刷新任务列表：来源、状态、条目数、检查时间、消息。
- 数据分栏：模型榜单、Agent 榜单、工具榜单。
- 缺失配置：X、Product Hunt、Artificial Analysis 等密钥状态。

### 榜单

目标：集中比较模型、Agent、工具和综合信号热度。

布局：

- 顶部分段控件：综合、模型、Agent、工具、信号。
- 表格字段：排名、名称、提供方、类别、分数、变化、来源。
- 趋势迷你图：使用 `trend` 数组渲染，不依赖图片。

### 发布日历

目标：按时间窗口组织发布、预览、文档更新和传闻观察。

布局：

- 时间分组：今天、7 天内、2-5 周、3-8 周、持续更新。
- 每个事件显示名称、提供方、类别、置信度、窗口。
- 低可信传闻必须视觉降级，不和官方发布同权重。

### 可信来源

目标：让用户判断每个来源是否值得信任。

布局：

- 来源目录。
- 覆盖率、影响力、状态、最近检查时间。
- 来源类型颜色：official、docs、platform、benchmark、social、rumor。
- 失败来源不隐藏，显示错误或跳过原因。

### 路线图

目标：展示系统即将补齐的数据接入和产品能力。

布局：

- 版本列表。
- 状态：已完成、进行中、规划中。
- 每项能力关联到受影响页面。

## 组件系统

| 组件 | 用途 | 主要输入 |
| --- | --- | --- |
| `AppShell` | 应用框架 | `workspaceNav`、当前路由 |
| `CommandBar` | 顶部标题、搜索、筛选、外链 | 当前视图、搜索状态、筛选状态 |
| `CategoryRail` | 类别筛选 | `categories`、`categoryMeta` |
| `SignalMatrix` | 分组信号表、置信度、趋势和证据摘要 | `signals`、选中 ID |
| `SignalCard` | 信号摘要卡 | `FrontierSignal` |
| `SignalInspector` | 信号详情 | `FrontierSignal` |
| `SourceEvidenceCard` | 单条证据 | `SignalSource` |
| `RankingTable` | 榜单表格 | `RankingItem[]` |
| `TrendSparkline` | 迷你趋势线 | `trend: number[]` |
| `SourceHealthList` | 来源健康 | `SourceHealth[]` |
| `SourceRunList` | 抓取任务 | `SourceRun[]` |
| `ReleaseCalendar` | 发布日历 | `ReleaseFrame[]` |
| `RoadmapList` | 路线图 | `RoadmapItem[]` |
| `EmptyState` | 空结果 | 标题、说明、操作 |
| `StatusBadge` | 状态标签 | 状态、语义级别 |

组件边界要求：

- `AppShell` 只负责导航和布局，不直接处理业务排序。
- `SignalMatrix` 只负责信号行展示和选择，不负责详情渲染。
- `SignalInspector` 只接收一个信号和来源，不发起数据请求。
- 所有表格、列表、卡片都接受已过滤后的数组。
- 样式通过 design tokens 管理，避免每个组件重复定义颜色和间距。

## 交互规则

| 交互 | 结果 |
| --- | --- |
| 切换一级导航 | 更新 hash 和当前视图，不刷新页面 |
| 点击信号 | 更新 `selectedSignalId`，同步详情面板 |
| 切换类别 | 过滤信号矩阵和信号卡 |
| 搜索 | 过滤信号、榜单项、来源，空状态可重置 |
| 点击来源 | 新窗口打开来源 URL |
| 点击榜单项 | 若有来源 URL 则打开，否则选中关联信号 |
| 数据 JSON 更新 | 当前数据集 Hook 轮询后合并快照并重绘 |
| 移动端查看详情 | 打开底部抽屉，不跳离当前列表 |

## 设计系统

### 色彩

整体必须使用当前系统的浅色主题。暗色不作为页面背景、不作为主应用壳背景，只允许在迷你图、局部图表或高对比文本中少量使用。

| Token | 值 | 用途 |
| --- | --- | --- |
| `page` | `#f6fbff` | 页面底色 |
| `page.gradient` | `linear-gradient(115deg, rgba(255,255,255,.96), rgba(241,250,255,.94) 44%, rgba(233,249,255,.9))` | 当前系统背景渐变 |
| `surface` | `rgba(255,255,255,.78)` | 主面板、导航、卡片 |
| `surface.solid` | `#ffffff` | 表格、弹层、详情面板 |
| `text.strong` | `#0b1d35` | 主标题 |
| `text.body` | `#52657b` | 正文 |
| `text.muted` | `#8798ab` | 辅助文字 |
| `line` | `rgba(122,153,180,.24)` | 分割线、面板边框 |
| `accent.teal` | `#17c9c0` | 主信号、官方确认 |
| `accent.blue` | `#3d8cff` | AI 编程、工具 |
| `accent.coral` | `#ff7c4d` | Agent、风险提示 |
| `accent.purple` | `#9b6df5` | Skill / 插件 |
| `accent.green` | `#3fcf73` | 健康、上涨 |
| `semantic.warning` | `#f6b64a` | 降级、待配置 |
| `semantic.danger` | `#ef5b5b` | 失败、低可信 |
| `neutral.ink` | `#0b1d35` | 仅用于文字、图标或局部图表，不作为大面积背景 |

### 排版

- 中文和 UI 文本：`Inter, "Microsoft YaHei", system-ui, sans-serif`。
- 英文品牌和数字：`Outfit, Inter, system-ui, sans-serif`。
- 代码和命令：`SFMono-Regular, Consolas, monospace`。
- 页面标题：32-48px，移动端 28-34px。
- 工作台标题：20-24px。
- 卡片标题：15-18px。
- 表格和控件：12-14px，不能依赖浏览器默认字号。
- 字距保持 `0`。

### 布局与形状

- 卡片圆角：8px。
- 控件圆角：8px。
- 侧边栏宽度：232px。
- 桌面内容最大宽：不强制居中，使用工作台全宽。
- 网格间距：16px、20px、24px。
- 面板边框：1px 半透明线，不使用重阴影。
- 不使用装饰性渐变球、光斑或无意义大面积发光。

## 状态设计

| 状态 | 显示方式 |
| --- | --- |
| 加载中 | 保留布局骨架，显示短 shimmer 或静态骨架 |
| 空数据 | 明确说明哪个筛选条件无结果，提供重置 |
| 数据源失败 | 不清空旧数据，显示来源失败状态 |
| 缺少密钥 | 标记“待配置”，显示对应环境变量名但不显示值 |
| 低可信传闻 | 降低视觉权重，必须显示来源类型 |
| 外链缺失 | 保留卡片，但隐藏外链图标 |
| 移动端溢出风险 | 长标题截断，详情页展示完整标题 |

## 前端落地顺序

1. 新增 `docs/ui-blueprint.json` 作为前端实现契约。
2. 收敛设计 tokens 到 CSS 变量，替换零散颜色。
3. 拆出 `AppShell`、`CommandBar`、`StatusBadge`、`TrendSparkline`、`SignalCard`、`SourceEvidenceCard`。
4. 先重构情报总览，确保当前体验不倒退。
5. 再实现信号流、榜单、来源、数据洞察四个高价值页面。
6. 最后补发布日历、路线图和移动端详情抽屉。

## 验收标准

- `npm run lint` 通过。
- `npm run build` 通过。
- 桌面 1440px 无核心内容重叠。
- 移动 390px 无横向滚动。
- 点击信号行、信号卡、导航、筛选、来源外链均有明确反馈。
- 所有页面都能在没有远程 JSON 时使用内置快照正常显示。
- 低可信、待配置、失败来源不会被误显示为官方确认。
- 实现截图需要与 `design-concepts/ui-blueprint-workspace-intel.png` 的浅色情报工作台结构一致，但精确文案以本文件为准。
