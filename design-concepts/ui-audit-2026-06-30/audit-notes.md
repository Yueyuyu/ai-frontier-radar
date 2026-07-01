# UI 落地全面审计

## 范围

- 产品：AI 前沿情报站 / Frontier Intel
- 审计对象：当前 React 本地实现 `http://127.0.0.1:5173/`
- 对照源：`design-concepts/complete-ui/pages/*.png`
- 截图目录：`design-concepts/ui-audit-2026-06-30/`
- 桌面视口：1536 x 1024
- 移动视口：390 x 844

## 截图步骤与健康度

| 步骤 | 页面 | 当前健康度 | 证据 |
| --- | --- | --- | --- |
| 01 | 情报总览 | 可用，但数据和下方卡片密度偏离设计源 | `01-overview-comparison.png` |
| 02 | 前沿信号流 | 主结构可用，底部状态区和证据链细节缺失 | `02-signal-feed-comparison.png` |
| 03 | 模型地图 | 基本落地，表格/来源覆盖可继续贴近 | `03-model-map-comparison.png` |
| 04 | Agent 市场 | 结构落地，图标资产和底部表格可见性不足 | `04-agent-market-comparison.png` |
| 05 | Skill / 插件 | 基本落地，真实图标和底部卡片完整度不足 | `05-skill-plugin-comparison.png` |
| 06 | 数据洞察 | 部分偏离，图表类型、右侧说明和表格密度不足 | `06-data-operations-comparison.png` |
| 07 | 榜单 | 基本落地，Logo、来源标签、排序交互不足 | `07-rankings-comparison.png` |
| 08 | 发布日历 | 月历形态落地，但日期和事件映射不符合真实月历 | `08-release-calendar-comparison.png` |
| 09 | 可信来源 | 主结构落地，来源数量、Logo、底部状态密度不足 | `09-trusted-sources-comparison.png` |
| 10 | 路线图 | 主结构较完整，细节信息仍比设计源少 | `10-roadmap-comparison.png` |
| 11 | 移动端 | 未按移动端设计落地，仍是桌面表格压缩版 | `11-mobile-current-390.png` |
| 12 | 组件状态 | 未在 React 中形成可验收页面或状态库 | `complete-ui/pages/12-components-states.png` |

## P0 问题

1. 移动端 390px 未落地为设计源中的移动体验。
   - 证据：`11-mobile-current-390.png` 对比 `complete-ui/pages/11-mobile-390.png`。
   - 当前是桌面概览的 KPI + 横向表格压缩，缺少“今日高置信信号”汇总卡、卡片式信号列表、底部详情抽屉、空状态和骨架屏。
   - 建议：新增 `StrictMobileOverview` / `MobileSignalCards` / `MobileSignalDrawer`，在 `max-width: 760px` 下切换组件，而不是只改 CSS。

2. 组件状态页未落地。
   - 证据：设计源有 `12-components-states.png`，当前 React 没有对应路由或组件状态验收页。
   - 缺少按钮、筛选、徽标、表格行、空状态、加载骨架、错误态、抽屉等统一状态样式。
   - 建议：新增 `#components-states` 内部页面或 Storybook 式本地组件画布，作为后续还原和回归标准。

3. 大量按钮是视觉控件，不是真交互。
   - 证据：`StrictPages.tsx` 中多数分页、下拉、导出、刷新、关闭、查看、切换按钮只有 `type="button"`，没有状态或事件；只有少量 tab/search clear 有 `onClick`。
   - 风险：前端看起来完整，但目标模式下无法完成筛选、排序、分页、下拉、详情切换、导出等核心工作流。
   - 建议：先实现统一 `StrictSelect`、`StrictPagination`、`StrictSegmentedControl`、`StrictActionButton`，至少做到状态变化和当前页局部筛选。

## P1 问题

1. 图标和 Logo 资产不足。
   - 当前 Agent 卡使用首字母头像，信号热度和评分使用 `🔥`、`⭐`，榜单/来源/模型缺少 OpenAI、Anthropic、Google、GitHub、Product Hunt、X 等真实或统一图标。
   - 设计源中各页大量使用品牌 logo、能力图标、来源图标；当前视觉可信度和识别速度下降。
   - 建议：建立 `ProviderIcon` / `SourceIcon` 映射，优先使用已有 logo 资产或 lucide 图标；移除 emoji，用图标组件替代。

2. 06 数据洞察偏离明显。
   - 设计源是双折线趋势 + 彩色 donut + 缺失配置三行 + 数据库状态 + 说明面板；当前趋势用柱状图，donut legend 文案溢出，右侧说明面板缺失，source run 行数偏少。
   - 建议：补 SVG 折线图、压缩 legend 数值格式、补 `DataOpsNotePanel` 和 5 行 source run。

3. 08 发布日历不是严格的真实月历。
   - 当前显示 1-42 连续日期，设计源是 2026 年 6 月真实月历，含上月/下月弱化日期和事件分类图例。
   - 建议：用日期库或原生 Date 生成真实月历 cell，支持上/下月日期弱化；事件 chip 绑定 release window/date。

4. 02 信号流缺设计源底部状态区。
   - 设计源左下有空结果状态和降级数据提示；当前首屏左侧表格下方直接结束，右侧证据链也少了底部操作区。
   - 建议：补 `SignalFeedBottomStates`，右侧补“加入追踪/标记已读/在新标签打开”等动作栏。

5. 04 Agent 市场底部表格在 1024 高度下被固定底栏遮挡。
   - 证据：`04-agent-market-comparison.png`，底部表格只露出前两行。
   - 建议：增加页面底部 padding 或让左侧表格独立滚动，确保固定 footer 不遮挡核心内容。

6. 09 可信来源数据密度低于设计源。
   - 设计源约 10 行来源和更完整的失败/缺配置来源；当前主表行数和底部状态信息减少，来源 Logo 缺失。
   - 建议：补 10 行展示密度、来源图标列、底部失败来源三行和外链/详情图标。

## P2 问题

1. 多处数值和更新时间是展示兜底，缺少统一数据口径。
   - 如 01/03/06 的总量、榜单条目、刷新时间与设计源不一致。
   - 建议：在 `dataRuntime` 或 view model 层统一计算展示指标，标注 mock/fallback 来源。

2. 选择器外观像下拉，但没有菜单。
   - `SelectLike` 只是按钮，用户无法真正选择可信度、来源类型、时间窗口、排序等。
   - 建议：短期实现 popover 菜单；长期接入 URL query 或全局筛选状态。

3. 可访问性标签不完整。
   - 设计截图无法证明完整 WCAG；代码中部分 icon-only close button 有 `aria-label`，但 Agent 详情里的关闭按钮和大量工具按钮没有明确 label。
   - 建议：所有 icon-only/button-only 控件补 `aria-label`，分段控件用 `aria-pressed` 或 `role="tablist"`，表格 checkbox 保留行级标签。

4. tooltip 缺失。
   - 顶部图标、来源权重、可信度、状态 badge、图表指标缺少 hover/focus 解释。
   - 建议：补轻量 `Tooltip` 组件，优先覆盖顶部命令区、评分公式、来源权重、状态 badge。

5. 桌面细节仍有轻微错位。
   - 01 下方四卡、03 来源覆盖、05 底部信号卡、10 甘特左侧版本卡与设计源仍有间距/高度差异。
   - 建议：下一轮按页面逐个做 5-10px 级别 spacing 和 row height 微调。

## 可访问性风险

- 从截图无法验证键盘焦点、读屏顺序、弹出菜单、抽屉焦点陷阱和 ESC 关闭。
- 当前多数视觉按钮没有真实交互，也就无法验证焦点移动和状态公告。
- 表格密集，移动端未卡片化，390px 下可读性和触控目标明显不足。
- 部分浅色徽标和小字可能存在低对比风险，需要用浏览器计算样式或 axe/手工 contrast 检查补验。

## 建议修复顺序

1. P0-1：实现移动端专属首页和信号详情抽屉。
2. P0-2：建立组件状态页，锁定按钮、筛选、badge、表格、空态、骨架、抽屉标准。
3. P0-3：补全关键交互控件：tab、select、pagination、detail close、export/refresh。
4. P1-1：补 Provider/Source/Icon 资产系统，移除 emoji 和首字母头像。
5. P1-2：按 06、08、02、09、04 的顺序补视觉缺口。
6. P2：做 spacing、tooltip、aria、数据口径统一。

## 证据限制

- 本轮审计基于截图、代码扫描和本地页面加载，不等同完整可访问性测试。
- 未使用 Figma 标注；所有证据保存在本地目录。
- 未执行交互自动化点击流，只从代码和静态截图判断控件可用性。
