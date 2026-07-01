# AI 前沿情报站 / Frontier Intel

AI 前沿情报站是一个多源 AI 情报工作台，用于持续追踪模型、AI 编程工具、Agent、MCP / Skill 插件、榜单变化、来源健康与发布信号。

当前代码里仍保留少量历史兼容名称，例如 `RadarDataset`、`public/data/radar-data.json`、`#radar`。这些只作为旧数据和旧链接兼容层；产品与 UI 已统一为 **AI 前沿情报站 / Frontier Intel**，核心界面不再使用圆形扫描、靶心或中心放射类视觉隐喻，而是使用信号矩阵、情报流、时间线和证据面板。

## 文档入口

| 文档 | 内容 |
| --- | --- |
| [系统总览](docs/system-overview.md) | 当前实现、数据流、文件结构、已实现功能和目标差距 |
| [数据来源与信号体系](docs/data-sources.md) | 来源分组、接入状态、评分规则、表结构和第一期来源优先级 |
| [信息架构与 UI 蓝图](docs/ui-information-architecture.md) | 产品定位、页面结构、组件系统、交互规则和设计系统 |
| [前端蓝图 JSON](docs/ui-blueprint.json) | 面向实现的结构化页面、组件、数据源、评分和验收契约 |

视觉参考图：

- `design-concepts/ui-blueprint-workspace-intel.png`

## 当前能力

- React + Vite 前端工作台。
- 本地 JSON 数据快照读取和 60 秒轮询刷新。
- 没有远程 JSON 时回退到 `src/data.ts` 内置快照。
- 信号、榜单、来源健康、抓取运行、数据面板、发布日历、路线图等数据结构。
- 公开来源刷新脚本：`scripts/refresh-data.mjs`。
- MySQL schema 草案：`scripts/database/mysql-schema.sql`。
- 可选接入 X、Product Hunt、Artificial Analysis 等需要密钥的来源。

## 数据接入

前端当前默认读取：

```text
public/data/frontier-intel-data.json
```

并保留兼容读取：

```text
public/data/radar-data.json
```

`radar-data.json` 只作为旧部署和旧链接的 fallback。

刷新数据：

```bash
npm run refresh:data
```

刷新脚本会生成：

- `public/data/radar-data.json`
- `public/data/frontier-intel-data.json`
- `public/data/model-rankings.json`
- `public/data/agent-rankings.json`
- `public/data/tool-rankings.json`
- `public/data/source-runs.json`
- `public/data/raw-snapshots.index.json`

## 数据来源分组

| 分组 | 作用 |
| --- | --- |
| 官方确认 | 通过官网、文档、API、changelog 确认发布和事实 |
| 模型能力 | 通过 OpenRouter、Artificial Analysis、Arena、SWE-bench、Hugging Face 等衡量模型能力 |
| Agent 能力 | 通过 Steel.dev、Agent Arena、HAL、SkillsBench、OSWorld、WebArena 等观察 Agent 表现 |
| 工具与生态热度 | 通过 GitHub、OSSInsight、Product Hunt、HN 等判断工具和插件生态变化 |
| 研究趋势 | 通过 arXiv、Semantic Scholar 等捕捉研究方向 |
| 早期传播 | 通过 X / Twitter 等观察传播热度，但不能单独确认发布事实 |

完整来源清单见 [docs/data-sources.md](docs/data-sources.md)。

## 环境变量

公开来源不需要密钥。下列来源需要配置后才会刷新；未配置时会在来源状态里显示“待配置”。

| 变量 | 用途 |
| --- | --- |
| `GITHUB_TOKEN` | 提升 GitHub Search API 限额，可选 |
| `X_BEARER_TOKEN` 或 `TWITTER_BEARER_TOKEN` | X Recent Search |
| `PRODUCT_HUNT_TOKEN` | Product Hunt API |
| `ARTIFICIAL_ANALYSIS_API_KEY` | Artificial Analysis Data API |
| `ARTIFICIAL_ANALYSIS_API_URL` | Artificial Analysis Data API 地址 |

## 数据库

脚本会优先读取：

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`

也兼容：

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`

没有数据库配置时，刷新脚本仍会正常生成 JSON。MySQL schema 在 `scripts/database/mysql-schema.sql`。

如果要启用 Node 侧 MySQL 同步，需要安装驱动：

```bash
npm install mysql2
```

## 自动化刷新

仓库提供 GitHub Actions 工作流：`.github/workflows/refresh-frontier-intel.yml`。

- 每 30 分钟运行一次高频刷新。
- 每 6 小时运行一次榜单和来源校准。
- 每日运行一次全量校验。
- 未配置商业来源密钥时，脚本会把对应来源标记为 `skipped`，不会阻断 JSON 输出。
- 数据变化时会自动提交 `public/data/` 下的刷新结果。

## 本地开发

```bash
npm install
npm run refresh:data
npm run dev
```

## 验证

```bash
npm run lint
npm run build
```

## 当前重点改造方向

1. 继续扩展可持续自动化刷新和持久化同步。
2. 强化数据来源、评分规则、来源健康和证据链展示。
3. 保留旧 JSON 和类型名的兼容层，后续在确认无旧链接依赖后再移除。

## 开源协议

MIT
