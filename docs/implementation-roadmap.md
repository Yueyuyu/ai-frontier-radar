# 实施路线图

更新时间：2026-06-30

## 原则

- 先稳定现有数据流，再改 UI。
- 先保留兼容入口，再做命名迁移。
- 官网 / 文档 / API 优先于社交传闻。
- X、HN、GitHub 只作为热度和早期传播，不能单独确认发布事实。
- 每一期都要能 `npm run lint` 和 `npm run build` 通过。

## 第一阶段：文档和命名基线

目标：让项目所有设计和实现依据统一到“AI 前沿情报站 / Frontier Intel”。

任务：

- README 改为新产品定位。
- 文档明确旧内部命名与新产品命名的兼容关系。
- 保留 `radar-data.json` 作为当前兼容入口。
- 蓝图和设计文档不再使用圆形扫描、靶心或中心放射类视觉隐喻。

验收：

- 文档能解释当前实现与目标设计差异。
- 新贡献者能从 README 找到系统总览、来源体系、UI 蓝图和路线图。

## 第二阶段：数据骨架调整

目标：把数据输出从单一大 JSON 逐步拆成更清晰的领域文件。

任务：

- 保留 `public/data/radar-data.json`。
- 新增目标兼容文件：`public/data/frontier-intel-data.json`。
- 新增或稳定：
  - `signals.json`
  - `sources.json`
  - `model-rankings.json`
  - `agent-rankings.json`
  - `tool-rankings.json`
  - `source-runs.json`
- 前端优先读新文件，失败时回退旧文件和 `src/data.ts`。

验收：

- 旧页面不破。
- 新旧数据文件能表达同一批核心信号。
- 缺少新文件时仍能正常展示。

## 第三阶段：来源接入第一期

目标：先接入能覆盖五个核心栏目的一批稳定来源。

优先来源：

1. OpenAI
2. Anthropic
3. Google Gemini
4. OpenRouter
5. Artificial Analysis
6. Steel.dev
7. Agent Arena
8. GitHub
9. OSSInsight
10. HN Algolia

任务：

- 官方来源用于发布日历和事实确认。
- OpenRouter 和 Artificial Analysis 用于模型地图和模型榜。
- Steel.dev、Agent Arena 用于 Agent 市场。
- GitHub、OSSInsight、HN 用于工具热度和生态变化。
- 每个来源都必须写入 `source_runs` 状态。

验收：

- 每个来源有 `ok`、`skipped` 或 `error` 状态。
- UI 能看到失败原因和待配置原因。
- X 和 Product Hunt 暂不作为第一期硬依赖。

## 第四阶段：情报总览 UI 重构

目标：替换旧中心可视化，建立信号矩阵工作台。

任务：

- 新增 `SignalMatrix`。
- 信号按类别分组：模型、AI 编程、Agent、Skill / 插件、平台。
- 每行展示：名称、提供方、类别、置信度、趋势、发布窗口、证据、来源数。
- 点击行更新 `SignalInspector`。
- 下方保留榜单、来源健康、数据更新和发布日历摘要。

验收：

- 不出现圆形扫描、靶心或中心放射类视觉。
- 桌面 1440px 无重叠。
- 移动 390px 无横向滚动。
- 点击信号行和信号卡都能同步详情。

## 第五阶段：来源健康与证据链

目标：把可信来源变成系统核心能力，而不是附属列表。

任务：

- 来源目录展示：来源类型、访问方式、是否需要密钥、权重、刷新 SLA、最近状态。
- 信号详情展示证据链：官方、文档、平台、榜单、社区、传闻分层。
- 低可信传闻降权显示。
- X / HN / GitHub 不能单独把信号标为确认发布。

验收：

- 每个信号可以看到来源数量和证据 URL。
- 来源失败不隐藏。
- 待配置来源显示环境变量名但不泄露任何密钥值。

## 第六阶段：评分与榜单

目标：把模型、Agent、工具三类评分规则分开。

任务：

- 模型综合分按能力榜、API 可用性、价格上下文速度、官方确认、热度增长计算。
- Agent 综合分按 benchmark 成功率、真实任务复杂度、增长、热度、官方确认计算。
- 工具综合分按 GitHub 增长、Product Hunt / HN、X、发布活跃、生态依赖计算。
- 榜单项记录来源和评分解释。

验收：

- 榜单不只显示排名，还能解释分数来源。
- 传闻和热度不会覆盖官方事实。

## 第七阶段：持久化与自动化

目标：让系统从本地刷新升级为可持续运行。

任务：

- 完善 MySQL 表结构。
- 记录 `sources`、`entities`、`raw_events`、`rankings`、`signals`、`source_runs`。
- 加入 GitHub Actions 或服务器 cron。
- 高频源 30 分钟刷新，榜单源 6 小时刷新，每日全量校准。

验收：

- 每次刷新有可追踪运行记录。
- 前端能显示数据是否过期。
- 数据库不可用时 JSON 仍能生成。
