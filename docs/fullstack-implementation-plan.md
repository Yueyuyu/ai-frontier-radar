# 前后端功能实施计划

更新时间：2026-06-30

本计划用于后续执行模式直接落地 `AI 前沿情报站 / Frontier Intel`。执行时以这些文件为准：

- `docs/complete-ui-design.md`
- `docs/ui-blueprint.json`
- `docs/ui-information-architecture.md`
- `docs/data-sources.md`
- Figma：<https://www.figma.com/design/BrCkDbTQn8W3LB6nm7p1KQ>

## 目标

把当前项目从旧的 `AI Frontier Radar` 工作台迁移为可长期运行的 AI 前沿情报系统，完成：

- 前端：10 个桌面页面、移动端布局、组件状态、筛选、搜索、详情、来源健康、发布日历和路线图。
- UI 还原：把 imagegen 页面图转成可执行还原契约，避免只靠图片猜布局。
- 数据层：目标 JSON 契约、新旧数据兼容、分栏数据文件、刷新任务状态、缺失密钥状态。
- 后端/脚本：多源抓取、评分、来源健康、数据库同步、快照输出。
- 验证：`npm run lint`、`npm run build`、`npm run refresh:data`、静态参考页和桌面/移动截图检查。

## 执行原则

- 不一次性删除旧入口，先让新入口可用，再逐步清理兼容命名。
- 用户可见 UI 不再出现雷达、靶心、扫描、中心放射视觉。
- 保留 `public/data/radar-data.json` 作为兼容 fallback，同时新增 `frontier-intel-data.json`。
- 官方、文档、平台、榜单、社区、传闻分层展示；X / Twitter 只做早期传播和热度参考。
- 缺失 API Key、来源失败、数据库不可用都要在 UI 显示，不能静默吞掉。
- imagegen 图只作为视觉参考和验收对照，不能作为唯一实现规格；执行前必须先落成 token、页面规格、fixture 和静态参考页。
- React 页面还原时优先对齐可执行规格和静态 HTML，再用图片做视觉验收。
- 每个阶段完成后都运行最小验证，不把多个风险阶段堆到最后。

## 阶段 0：基线确认

目标：确认当前仓库状态、构建状态和页面现状，避免覆盖已有未提交改动。

动作：

1. 执行 `git status --short`，记录已有改动，不回滚无关文件。
2. 执行 `npm run lint` 和 `npm run build`，记录基线是否已通过。
3. 执行 `npm run refresh:data`，确认当前数据脚本能否生成现有文件。
4. 截取当前桌面 1440px 和移动 390px 页面，作为改造前对照。

验收：

- 明确当前失败项属于基线问题还是本次改造问题。
- 后续每个阶段的验证结果可与基线区分。

## 阶段 0.5：UI 还原实施包

目标：解决“Codex 看图还原不到位”的风险。先把 imagegen 页面图转换为可执行、可检查的 UI 契约，再进入前端实现。

输入：

- `design-concepts/complete-ui/imagegen-complete-ui-board.png`
- `design-concepts/complete-ui/pages/00-coverage-map.png`
- `design-concepts/complete-ui/pages/01-overview.png`
- `design-concepts/complete-ui/pages/02-signal-feed.png`
- `design-concepts/complete-ui/pages/03-model-map.png`
- `design-concepts/complete-ui/pages/04-agent-market.png`
- `design-concepts/complete-ui/pages/05-skill-plugin.png`
- `design-concepts/complete-ui/pages/06-data-operations.png`
- `design-concepts/complete-ui/pages/07-rankings.png`
- `design-concepts/complete-ui/pages/08-release-calendar.png`
- `design-concepts/complete-ui/pages/09-trusted-sources.png`
- `design-concepts/complete-ui/pages/10-roadmap.png`
- `design-concepts/complete-ui/pages/11-mobile-390.png`
- `design-concepts/complete-ui/pages/12-components-states.png`
- `docs/complete-ui-design.md`
- `docs/ui-blueprint.json`

建议新增文件：

- `docs/ui-implementation-rules.md`
- `docs/ui-implementation-package/README.md`
- `docs/ui-implementation-package/design-tokens.json`
- `docs/ui-implementation-package/fixtures/frontier-intel-fixture.json`
- `docs/ui-implementation-package/screen-specs/00-coverage-map.json`
- `docs/ui-implementation-package/screen-specs/01-overview.json`
- `docs/ui-implementation-package/screen-specs/02-signal-feed.json`
- `docs/ui-implementation-package/screen-specs/03-model-map.json`
- `docs/ui-implementation-package/screen-specs/04-agent-market.json`
- `docs/ui-implementation-package/screen-specs/05-skill-plugin.json`
- `docs/ui-implementation-package/screen-specs/06-data-operations.json`
- `docs/ui-implementation-package/screen-specs/07-rankings.json`
- `docs/ui-implementation-package/screen-specs/08-release-calendar.json`
- `docs/ui-implementation-package/screen-specs/09-trusted-sources.json`
- `docs/ui-implementation-package/screen-specs/10-roadmap.json`
- `docs/ui-implementation-package/screen-specs/11-mobile-390.json`
- `docs/ui-implementation-package/screen-specs/12-components-states.json`
- `reference-ui/00-coverage-map.html`
- `reference-ui/01-overview.html`
- `reference-ui/02-signal-feed.html`
- `reference-ui/03-model-map.html`
- `reference-ui/04-agent-market.html`
- `reference-ui/05-skill-plugin.html`
- `reference-ui/06-data-operations.html`
- `reference-ui/07-rankings.html`
- `reference-ui/08-release-calendar.html`
- `reference-ui/09-trusted-sources.html`
- `reference-ui/10-roadmap.html`
- `reference-ui/11-mobile-390.html`
- `reference-ui/12-components-states.html`

动作：

1. 建立 `design-tokens.json`：
   - 颜色：页面、面板、描边、正文、弱文本、teal、blue、coral、purple、green、warning、danger。
   - 字号：页面标题、面板标题、卡片标题、正文、说明、控件。
   - 间距：4、8、12、16、20、24、32。
   - 圆角：卡片 8px、控件 8px、移动抽屉 20px。
   - 断点：1440、1180、900、640、390。
2. 建立 `fixtures/frontier-intel-fixture.json`：
   - 固定 10-15 条信号。
   - 固定模型、Agent、工具榜单。
   - 固定来源健康和刷新任务。
   - 固定缺失密钥状态。
   - 所有页面先用同一 fixture 还原，避免因数据不同导致视觉漂移。
3. 为每个页面写 `screen-specs/*.json`，每个规格至少包含：
   - `route`
   - `viewport`
   - `layoutGrid`
   - `regions`
   - `components`
   - `dataBindings`
   - `states`
   - `interactions`
   - `acceptanceChecklist`
   - `referenceImage`
4. 建立 `docs/ui-implementation-rules.md`，写明执行硬规则：
   - 不允许暗色主背景。
   - 不允许雷达、靶心、扫描、中心放射、中心 hub 图。
   - 页面不是营销 hero，第一屏必须是可用工作台。
   - 数据来源、证据链、来源健康必须显性展示。
   - X / Twitter 只作为热度，不作为事实确认。
   - 精确字段以 JSON 契约和 screen spec 为准，imagegen 文字不作为事实来源。
5. 为每个页面生成 `reference-ui/*.html` 静态参考页：
   - 使用 `design-tokens.json`。
   - 使用 `fixtures/frontier-intel-fixture.json` 的同一份数据。
   - 只做静态 HTML/CSS，不接入真实 React 状态。
   - 目标是固定布局、密度、区域关系和组件尺寸，作为 React 实现参照。
6. 执行模式实现 React 时，顺序必须是：
   - 先读 `ui-implementation-rules.md`。
   - 再读目标页面 `screen-specs/*.json`。
   - 再看对应 `reference-ui/*.html`。
   - 最后才用 `pages/*.png` 做视觉对照。
7. 建立截图验收脚本或手工命令约定：
   - 桌面：1440x960。
   - 移动：390x844。
   - 每页 React 截图与 `reference-ui` 和 imagegen 图对照。

验收：

- 每张 imagegen 页面图都有对应 `screen-specs/*.json`。
- 每个上线页面都有对应 `reference-ui/*.html`。
- 静态参考页能直接在浏览器打开。
- React 实现任务不能只引用图片，必须引用 screen spec 和 reference UI。
- 后续执行时，任一页面完成都能按 `acceptanceChecklist` 检查，而不是只凭主观“像不像”。

建议验证：

```powershell
Get-ChildItem docs\ui-implementation-package\screen-specs -Filter *.json | Measure-Object
Get-ChildItem reference-ui -Filter *.html | Measure-Object
node -e "const fs=require('fs'); for (const f of fs.readdirSync('docs/ui-implementation-package/screen-specs')) JSON.parse(fs.readFileSync('docs/ui-implementation-package/screen-specs/'+f,'utf8')); console.log('screen specs ok')"
```

## 阶段 0.6：UI 还原一致性执行门禁

目标：解决“有 UI 图，但 Codex 或前端执行时还原不到位”的问题。进入 React 页面开发前，先把每个页面拆成可检查的实现任务，并用同一套 token、fixture、screen spec 和 reference UI 做闭环，避免只凭图片自由发挥。

输入：

- `docs/ui-implementation-rules.md`
- `docs/ui-implementation-package/design-tokens.json`
- `docs/ui-implementation-package/fixtures/frontier-intel-fixture.json`
- `docs/ui-implementation-package/screen-specs/*.json`
- `reference-ui/*.html`
- `design-concepts/complete-ui/pages/*.png`
- `docs/ui-blueprint.json`
- `docs/complete-ui-design.md`

执行顺序：

1. 每次只还原一个页面或一个组件族，不同时铺开多个页面。
2. 开始前读取对应 `screen-specs/*.json`，提取：
   - 页面路由。
   - 页面区域。
   - 栅格列数和断点。
   - 必须出现的组件。
   - 数据字段绑定。
   - 空态、失败态、缺失密钥态、加载态。
   - 页面级 `acceptanceChecklist`。
3. 先在 React 中建立共享结构，再填页面细节：
   - `AppShell`
   - `WorkspaceHeader`
   - `SidebarNav`
   - `SignalCard`
   - `SignalInspector`
   - `SourceEvidenceCard`
   - `RankingTable`
   - `SourceHealthPanel`
   - `ReleaseTimeline`
   - `EmptyState`
   - `MobileBottomNav`
   - `MobileDetailDrawer`
4. 样式只能从 `design-tokens.json` 和 `src/styles/tokens.css` 派生；如果需要新增 token，必须先说明它解决的具体重复问题。
5. 先让 React 页面与 `reference-ui/*.html` 对齐，再与 imagegen 页面图对照。
6. 对照 imagegen 时只检查视觉关系、密度、层级和页面覆盖；精确文案、字段和数据来源以 JSON 契约、screen spec 和真实数据为准。
7. 每页完成后保存截图到 `design-concepts/stage*/`，文件名包含页面和 viewport，例如：
   - `overview-desktop-1440.png`
   - `overview-mobile-390.png`
   - `signal-feed-desktop-1440.png`
8. 任一页面不满足验收清单时，不进入下一页；先修正当前页面的布局、状态或数据绑定。

每页执行模板：

1. 读取目标页面的 `screen-specs/*.json`。
2. 打开对应 `reference-ui/*.html`，确认布局密度、区域顺序和组件尺寸。
3. 确认当前 React 页面需要的数据字段是否已经存在；不存在时先在视图模型中派生，不直接写死展示文本。
4. 实现或复用组件，保持组件粒度与页面区域一致。
5. 接入真实数据和 fallback 数据，覆盖正常、空态、失败态、缺失密钥态。
6. 运行 `npm run lint` 和 `npm run build`。
7. 截取桌面 1440px 和移动 390px。
8. 按 `acceptanceChecklist` 逐项核对。

强制检查项：

- 页面背景保持现有浅色系统主题，不允许暗色整页背景。
- 不允许出现雷达、靶心、扫描、中心 hub、中心放射或节点扩散视觉。
- 首屏必须是可用工作台，不做营销 hero。
- 搜索、筛选、排序、详情抽屉、来源证据和来源健康至少有可交互或可展示实现。
- 所有榜单、信号、来源、路线图和发布日历都必须能追溯到 fixture 或真实数据字段。
- X / Twitter 只显示为热度或传播来源，不提升为事实确认来源。
- 缺失 API Key 时显示来源状态和环境变量名，不显示密钥值。
- 桌面和移动端不能出现主要内容重叠、按钮文字溢出、表格横向挤压或抽屉遮挡关键操作。

建议新增辅助文件：

- `scripts/verify-ui-package.mjs`：检查 screen spec 数量、JSON 可解析、reference UI 数量和必要字段。
- `scripts/capture-ui-screenshots.mjs`：统一截图输出路径和 viewport。
- `docs/ui-restoration-checklist.md`：记录每个页面的完成状态、截图路径和未解决差异。

验收：

- 每个页面都有可追溯的 `screen-specs/*.json`、`reference-ui/*.html`、imagegen 页面图和 React 截图。
- 每个页面的 React 实现都通过 `npm run lint`、`npm run build`。
- 每个页面的主要组件都来自共享组件，不出现大量一次性页面内复制样式。
- 每个页面都明确覆盖正常态、空态、失败态和缺失密钥态中的相关状态。
- 截图差异必须先与 reference UI 对齐，再讨论是否需要调整 imagegen 视觉。

建议验证：

```powershell
node -e "const fs=require('fs'); const specs=fs.readdirSync('docs/ui-implementation-package/screen-specs').filter(f=>f.endsWith('.json')); const refs=fs.readdirSync('reference-ui').filter(f=>f.endsWith('.html')); if (specs.length<13 || refs.length<13) throw new Error('missing ui implementation files'); for (const f of specs) JSON.parse(fs.readFileSync('docs/ui-implementation-package/screen-specs/'+f,'utf8')); console.log('ui restoration package ok')"
npm run lint
npm run build
```

## 阶段 1：数据契约与命名迁移

目标：建立 `Frontier Intel` 目标数据契约，同时兼容旧 `RadarDataset`。

涉及文件：

- `src/types.ts`
- `src/dataRuntime.ts`
- `src/data.ts`
- `public/data/radar-data.json`
- `public/data/frontier-intel-data.json`
- `docs/ui-blueprint.json`

动作：

1. 在 `src/types.ts` 中新增目标命名：
   - `FrontierIntelDataset`
   - `FrontierStats`
   - `WorkspaceNavItem`
   - 保留 `RadarDataset` 作为兼容 alias，避免一次性改崩调用方。
2. 扩展字段但不破坏旧字段：
   - `SourceHealth.accessMethod`
   - `SourceHealth.authRequired`
   - `SourceHealth.freshnessSla`
   - `SourceHealth.weight`
   - `RankingItem.scoringExplanation`
   - `FrontierSignal.trustBand`
   - `FrontierSignal.sourceCount`
3. `src/dataRuntime.ts` 改为优先读取：
   - `/data/frontier-intel-data.json`
   - fallback 到 `/data/radar-data.json`
   - 再 fallback 到 `src/data.ts`
4. 合并策略保留当前安全逻辑：远程空数组不覆盖 fallback。
5. 将 `workspaceNav` 的用户可见文案改为新名称，旧 `#radar` hash 保留兼容，但新增 `#overview`。

验收：

- 没有新数据文件时页面仍能显示。
- 有新数据文件时优先使用新文件。
- 用户可见导航显示 `AI 前沿情报站`、`情报总览`、`信号矩阵`。

验证命令：

```powershell
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('docs/ui-blueprint.json','utf8')); console.log('blueprint ok')"
npm run lint
npm run build
```

## 阶段 2：刷新脚本和数据输出

目标：让 `npm run refresh:data` 输出目标前端需要的完整数据文件。

接口契约补充：

- 前端只对接聚合接口 `GET /api/frontier/dataset`，后端成功响应直接返回 `FrontierIntelDataset`，不包 `{ data }`。
- 后端 MVP 可以优先读取最新 JSON 快照或复用刷新脚本生成逻辑；MySQL 是持久化增强，不作为当前前端契约的唯一真源。
- 前端配置 `VITE_API_BASE_URL` 后优先请求 API；未配置时直接使用静态 JSON。降级顺序为 API（已配置时） -> `/data/frontier-intel-data.json` -> `/data/radar-data.json` -> `src/data.ts` fallback。
- 详细契约见 [backend-dataset-contract.md](backend-dataset-contract.md)。

涉及文件：

- `scripts/refresh-data.mjs`
- `scripts/database/mysql-schema.sql`
- `public/data/frontier-intel-data.json`
- `public/data/signals.json`
- `public/data/sources.json`
- `public/data/model-rankings.json`
- `public/data/agent-rankings.json`
- `public/data/tool-rankings.json`
- `public/data/source-runs.json`
- `public/data/raw-snapshots.index.json`

动作：

1. 保持现有单文件脚本可运行，先做小步改造，不先拆大模块。
2. 新增输出：
   - `frontier-intel-data.json`
   - `signals.json`
   - `sources.json`
3. 继续输出兼容文件：
   - `radar-data.json`
   - `model-rankings.json`
   - `agent-rankings.json`
   - `tool-rankings.json`
   - `source-runs.json`
   - `raw-snapshots.index.json`
4. 修正数据内容中的旧用户可见命名：
   - `雷达总览` 改为 `情报总览`
   - `AI 前沿雷达` 改为 `AI 前沿情报站`
   - `categoryMeta.icon: "radar"` 改为非雷达图标，如 `layout-dashboard` 或 `activity`
5. 把来源定义显式落到 `sources.json`：
   - `id`
   - `name`
   - `url`
   - `sourceType`
   - `accessMethod`
   - `authRequired`
   - `weight`
   - `freshnessSla`
   - `status`
6. 对缺失密钥来源写 `skipped`，并写明环境变量名，不写密钥值。
7. 补充评分解释：
   - 模型：能力榜、API 可用、价格/上下文/速度、官方确认、热度增长。
   - Agent：benchmark、真实任务复杂度、GitHub/Product 增长、X/HN 热度、官方可用性。
   - 工具：GitHub 28 天增长、Product Hunt/HN、X、发布活跃、生态依赖。
8. 数据库 schema 补齐目标表：
   - `frontier_sources`
   - `frontier_entities`
   - `frontier_raw_events`
   - 保留已有 `frontier_source_runs`、`frontier_signals`、`frontier_rankings`、`provider_raw_snapshots`。

验收：

- `npm run refresh:data` 能生成所有目标文件。
- 没有商业 API Key 时脚本成功结束，对应来源为 `skipped`。
- `source-runs.json` 能解释每个来源的成功、失败或跳过原因。
- 数据中不把 X/HN/GitHub 单独升级为官方确认。

验证命令：

```powershell
npm run refresh:data
node -e "const fs=require('fs'); for (const f of ['frontier-intel-data.json','signals.json','sources.json','source-runs.json']) JSON.parse(fs.readFileSync('public/data/'+f,'utf8')); console.log('data ok')"
npm run build
```

## 阶段 3：前端设计 tokens 和应用壳

目标：先搭出 Figma 对应的浅色工作台骨架，替换旧雷达视觉。

涉及文件：

- `src/App.tsx`
- 建议新增 `src/FrontierIntelApp.tsx`
- 建议新增 `src/styles/tokens.css`
- 建议新增 `src/styles/frontier.css`
- `src/components/*`

动作：

1. 新增 `FrontierIntelApp`，用浅色情报工作台替换旧中心视觉。
2. `src/App.tsx` 切换到新应用入口；旧 `RadarApp`、`radar.css` 和未引用旧样式在阶段 9 清理。
3. 建立 CSS token：
   - `--page: #f6fbff`
   - `--surface: #ffffff`
   - `--line: rgba(122,153,180,.24)`
   - `--text-strong: #0b1d35`
   - `--text-body: #52657b`
   - `--accent-teal: #17c9c0`
   - `--accent-blue: #3d8cff`
   - `--accent-coral: #ff7c4d`
   - `--accent-purple: #9b6df5`
4. 实现应用壳组件：
   - `AppShell`
   - `SidebarNav`
   - `CommandBar`
   - `MobileBottomNav`
5. 导航路由使用 hash：
   - `#overview`
   - `#signals`
   - `#model-rankings`
   - `#agent-rankings`
   - `#tool-rankings`
   - `#source-runs`
   - `#rankings`
   - `#calendar`
   - `#sources`
   - `#roadmap`
6. 兼容旧 hash：
   - `#radar` 自动映射到 `overview`。

验收：

- 桌面页面有固定侧栏、顶部命令栏和内容区。
- 移动端有顶部品牌栏和底部 4 项主导航。
- 不再显示圆形扫描、靶心、雷达中心点。

验证命令：

```powershell
npm run lint
npm run build
```

## 阶段 4：核心组件

目标：按 Figma 和 `docs/complete-ui-design.md` 还原核心组件，供 10 个页面复用。

建议新增文件：

- `src/components/StatusBadge.tsx`
- `src/components/TrendSparkline.tsx`
- `src/components/SignalCard.tsx`
- `src/components/SignalMatrix.tsx`
- `src/components/SignalList.tsx`
- `src/components/SignalInspector.tsx`
- `src/components/SourceEvidenceCard.tsx`
- `src/components/RankingTable.tsx`
- `src/components/SourceHealthPanel.tsx`
- `src/components/SourceRunList.tsx`
- `src/components/ReleaseCalendar.tsx`
- `src/components/RoadmapList.tsx`
- `src/components/EmptyState.tsx`
- `src/components/MobileSignalDetailDrawer.tsx`

动作：

1. 先实现纯展示组件，不在组件内部请求数据。
2. 所有组件通过 props 接收已过滤数据。
3. `SignalInspector` 必须展示：
   - 信号摘要
   - 可信度
   - 发布窗口
   - 来源证据链
   - 来源类型
   - 外链
4. `StatusBadge` 统一处理：
   - `official`
   - `docs`
   - `platform`
   - `benchmark`
   - `social`
   - `rumor`
   - `ok`
   - `skipped`
   - `error`
5. `TrendSparkline` 使用 SVG 或 CSS，不依赖图片。
6. `EmptyState` 覆盖：
   - 搜索无结果
   - 筛选无结果
   - 数据源失败
   - 缺少密钥
   - 降级数据

验收：

- 组件无未使用 import。
- 长中文标题不溢出按钮、表格、卡片。
- 状态颜色与 `docs/ui-blueprint.json` 一致。

## 阶段 5：10 个页面实现

目标：按 Figma frame 完成页面级功能。

### 5.1 情报总览

文件建议：`src/views/OverviewPage.tsx`

功能：

- KPI：实体数、来源数、已验证来源、更新时间。
- `SignalMatrix`。
- `SignalInspector`。
- 今日信号、榜单变化、来源健康、刷新任务摘要。

验收：

- 点击信号行更新右侧详情。
- 类别筛选影响矩阵和信号卡。

### 5.2 前沿信号流

文件建议：`src/views/SignalFeedPage.tsx`

功能：

- 分类、可信度、来源类型、时间窗口筛选。
- 搜索。
- 列表排序。
- 详情侧栏。
- 移动端点击信号打开底部抽屉。

验收：

- 空结果显示可重置筛选。
- 数据降级显示旧快照提示。

### 5.3 模型地图

文件建议：`src/views/ModelMapPage.tsx`

功能：

- 模型 KPI。
- 模型排行榜。
- 模型信号。
- 来源覆盖。
- 能力和价格/上下文/可用性摘要。

验收：

- 只展示 `kind=model` 和模型类信号。
- 模型评分解释可见。

### 5.4 Agent 市场

文件建议：`src/views/AgentMarketPage.tsx`

功能：

- Agent 排行榜。
- 能力标签。
- benchmark 来源健康。
- Agent 信号列表。

验收：

- Steel.dev、Agent Arena、HAL、SkillsBench、OSWorld、WebArena 状态可见。

### 5.5 Skill / 插件

文件建议：`src/views/SkillPluginPage.tsx`

功能：

- 工具/插件热度榜。
- MCP / Skill 信号。
- GitHub、Product Hunt、HN、X、官方文档来源分布。
- 能力分类标签。

验收：

- X 只显示为传播热度，不标为事实确认。

### 5.6 数据洞察

文件建议：`src/views/DataOperationsPage.tsx`

功能：

- 数据库状态。
- 缺失密钥。
- 数据分栏。
- 刷新任务表。
- 错误原因。

验收：

- 缺失密钥只显示环境变量名，不显示值。
- 失败来源不隐藏。

### 5.7 榜单

文件建议：`src/views/RankingsPage.tsx`

功能：

- 分段控制：综合、模型、Agent、工具、信号。
- 排名、名称、提供方、类别、分数、变化、趋势、来源。
- 评分说明。

验收：

- 每类榜单使用对应评分规则。

### 5.8 发布日历

文件建议：`src/views/ReleaseCalendarPage.tsx`

功能：

- 按时间窗口分组。
- 展示发布、文档、榜单、观察信号。
- 低可信传闻视觉降权。

验收：

- 低可信传闻不能和官方发布同视觉权重。

### 5.9 可信来源

文件建议：`src/views/TrustedSourcesPage.tsx`

功能：

- 来源目录。
- 分组：官方确认、模型能力、Agent 能力、工具热度、研究趋势、早期传播。
- 覆盖率、影响力、状态、最近检查时间、刷新 SLA。

验收：

- 每个来源都能看到状态和最近检查时间。

### 5.10 路线图

文件建议：`src/views/RoadmapPage.tsx`

功能：

- 版本阶段。
- 状态：已完成、进行中、规划中。
- 受影响页面。
- 下一步能力。

验收：

- 与 `docs/implementation-roadmap.md` 内容一致。

## 阶段 6：搜索、筛选和状态管理

目标：让页面成为可用工作台，而不是静态排版。

动作：

1. 在顶层维护：
   - `activeView`
   - `searchQuery`
   - `selectedCategory`
   - `selectedSignalId`
   - `rankingKind`
   - `confidenceFilter`
   - `sourceTypeFilter`
   - `detailDrawerOpen`
2. 使用 `useMemo` 生成：
   - `filteredSignals`
   - `filteredRankings`
   - `sourceGroups`
   - `releaseGroups`
3. URL hash 切换时更新当前页面。
4. 移动端信号详情使用抽屉，不跳离列表。
5. 外链点击新窗口打开，有 URL 才显示外链按钮。

验收：

- 搜索能同时影响信号、榜单、来源。
- 筛选无结果有清晰反馈。
- 移动端没有横向滚动。

## 阶段 7：样式、响应式和可访问性

目标：对齐 Figma 和 imagegen 视觉，但以可实现、可维护为准。

动作：

1. 桌面断点：
   - 1440px：侧栏 + 顶栏 + 12 栅格内容。
   - 1180px 以下：详情栏可下移。
2. 移动断点：
   - 640px 以下：单列内容。
   - 底部主导航：情报、信号、榜单、来源。
   - 详情使用底部抽屉。
3. 文本处理：
   - 表格长标题截断。
   - 详情页完整展示标题。
   - 按钮文字不溢出。
4. 可访问性：
   - 所有按钮有可理解文本或 `aria-label`。
   - 表格和列表保留语义结构。
   - 状态不能只靠颜色表达。

验收：

- 1440px 无核心内容重叠。
- 390px 无横向滚动。
- 低可信、失败、待配置状态都能被文字识别。

## 阶段 8：后端持久化和自动化

目标：把本地刷新脚本升级为可持续运行的数据管线。

动作：

1. 先保持 Node 脚本输出 JSON，数据库同步作为可选增强。
2. 若配置 MySQL：
   - 执行 `scripts/database/mysql-schema.sql`。
   - 同步来源、信号、榜单、原始快照、运行记录。
3. 增加 GitHub Actions 或服务器 cron：
   - 高频源 30 分钟。
   - 榜单源 6 小时。
   - 每日全量校准。
4. 输出最新 JSON 到 `public/data/` 或部署平台静态资源目录。
5. 前端显示数据过期状态：
   - `generatedAt`
   - `sourceRuns.checkedAt`
   - `freshnessSla`

验收：

- 数据库不可用时 JSON 仍生成。
- 每次刷新都有 `sourceRuns` 记录。
- 前端能显示数据是否过期。

## 阶段 9：清理旧命名和兼容边界

目标：在功能稳定后清理用户可见旧命名。

动作：

1. 搜索用户可见旧文案：
   - `AI 前沿雷达`
   - `AI Frontier Radar`
   - `雷达总览`
   - `Radar`
2. 仅保留必要兼容命名：
   - `RadarDataset` alias 可保留一段时间。
   - `radar-data.json` 可保留一段时间。
   - 旧 `RadarApp.tsx`、`radar.css`、未引用旧样式确认无引用后删除。
3. 清理旧圆形视觉 CSS：
   - `circle`
   - `orbit`
   - `radar`
   - `scan`
   - `hub`
   - `constellation` 中具有扫描/靶心含义的样式。

验收：

- 用户界面不再出现旧品牌。
- 代码保留的旧名都有兼容理由。

## 阶段 10：总体验收

必须执行：

```powershell
npm run refresh:data
npm run lint
npm run build
```

建议执行：

```powershell
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('public/data/frontier-intel-data.json','utf8')); console.log(d.signals.length, d.rankingItems.length, d.sourceRuns.length)"
node -e "const fs=require('fs'); for (const f of fs.readdirSync('docs/ui-implementation-package/screen-specs')) JSON.parse(fs.readFileSync('docs/ui-implementation-package/screen-specs/'+f,'utf8')); console.log('screen specs ok')"
rg "AI 前沿雷达|雷达总览|Radar|radar|scan|target|orbit" src public docs
```

截图验收：

- 桌面 1440px：情报总览、信号流、榜单、可信来源。
- 移动 390px：情报总览、信号列表、详情抽屉。
- 每个 React 页面截图必须同时对照：
  - `reference-ui/*.html` 的静态参考页。
  - `design-concepts/complete-ui/pages/*.png` 的 imagegen 页面图。
  - 对应 `screen-specs/*.json` 的验收清单。

最终验收标准：

- 10 个页面都能通过导航访问。
- 页面和状态覆盖 `docs/complete-ui-design.md` 的 frame 清单。
- 每个页面都有可执行规格、静态参考页和截图验收记录。
- 数据来源和刷新状态在 UI 中可见。
- 缺失密钥和失败来源不被隐藏。
- 没有暗色主背景，没有雷达/靶心/扫描视觉。
- 前端无横向滚动、无主要内容重叠。
- `npm run lint`、`npm run build` 通过。

## 推荐执行顺序

1. 阶段 0：基线确认。
2. 阶段 0.5：UI 还原实施包。
3. 阶段 1：数据契约与读取兼容。
4. 阶段 2：刷新脚本输出目标数据。
5. 阶段 3：应用壳和设计 tokens。
6. 阶段 4：核心组件。
7. 阶段 5.1 和 5.2：先做情报总览与信号流。
8. 阶段 5.7、5.9、5.6：再做榜单、可信来源、数据洞察。
9. 阶段 5.3、5.4、5.5、5.8、5.10：补齐领域页。
10. 阶段 6 和 7：交互、响应式、状态。
11. 阶段 8：持久化和自动化。
12. 阶段 9 和 10：清理旧命名与总体验收。
