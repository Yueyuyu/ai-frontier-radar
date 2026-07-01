# 数据来源与信号体系

更新时间：2026-06-30

## 核心判断

当前系统不是“卡片站”，而是多源信号系统。

- 官网、文档、API：负责确认事实，例如模型是否发布、API 是否可用、参数和价格是否变化。
- 榜单、评测：负责能力排序，例如模型能力、Agent benchmark、代码能力。
- GitHub、Product Hunt、HN、Hugging Face：负责热度和生态变化。
- X / Twitter：必须接入，但只作为早期传播和热度信号，不能单独把传闻判定为已发布。
- 数据源状态本身也要展示：成功、失败、待配置、最近抓取时间、错误原因。

## 功能模块与数据来源

| 分栏 | 展示内容 | 主数据来源 | 辅助来源 | 更新频率 |
| --- | --- | --- | --- | --- |
| 情报总览 | 最新模型、Agent、工具、插件信号 | OpenAI、Anthropic、Google、Mistral、DeepSeek、Kimi、Qwen、ZAI 官网 / 文档 / 变更日志 | X、HN、GitHub、Product Hunt | 30 分钟到 1 小时 |
| 前沿信号流 | 按时间排序的发布、传闻、榜单变化 | 官网新闻、API changelog、OpenRouter、RSS / API | X Recent Search / Filtered Stream、HN Algolia | 15 到 30 分钟 |
| 模型地图 | 模型族、供应商、可用 API、价格、上下文、模态 | OpenRouter Models API、Artificial Analysis API、各厂商模型文档 / API | Hugging Face Hub、LMArena、SWE-bench | 1 到 6 小时 |
| 模型排行 | 综合模型排名、涨跌、能力维度 | Artificial Analysis、Arena / LMArena、SWE-bench、OpenRouter | Vals AI、Hugging Face、官方 benchmark 博客 | 每日，榜单源可 6 小时 |
| Agent 市场 | 浏览器 Agent、代码 Agent、电脑使用 Agent、研究 Agent | Steel.dev Agent Leaderboards、Agent Arena、HAL Princeton、SkillsBench | OSWorld、WebArena、SWE-bench、GitHub | 每日 |
| Skill / 插件 | MCP Server、Agent Skill、连接器、插件生态 | GitHub、OSSInsight、Smithery、MCP 官方 / 社区仓库 | X、HN、Product Hunt | 1 到 6 小时 |
| 数据洞察 | 增长最快、热度异常、可信度变化 | 汇总后的内部 normalized 数据 | X / HN / GitHub 趋势 | 每小时 |
| 榜单 | 模型榜、Agent 榜、工具榜、插件榜 | 上游各类排行榜源 | 内部评分模型 | 每日 |
| 发布日历 | 模型发布时间、API 上线、弃用、预览期 | OpenAI API changelog、Anthropic release notes、Gemini API changelog、Mistral changelog、DeepSeek / Kimi / Qwen / ZAI 文档 | X 官方账号、RSS | 1 到 6 小时 |
| 可信来源 | 每个来源的健康度、更新时间、权重 | 内部抓取日志 | API 状态、HTTP 状态、失败率 | 每次抓取后 |

## 重点来源清单

### 官方确认源

| 来源 | 用途 | 当前状态 |
| --- | --- | --- |
| OpenAI News | 官方发布、产品公告 | 已接入页面健康检查 |
| OpenAI API Changelog | API、模型、工具变更 | 已接入页面健康检查 |
| Anthropic Newsroom | 官方发布 | 建议补齐 |
| Claude Release Notes | Claude 产品更新 | 已接入页面健康检查 |
| Claude Code Changelog | Claude Code 变更 | 建议补齐 |
| Gemini API Changelog | Gemini API 变更 | 已接入页面健康检查 |
| Gemini Blog | Google 官方发布 | 建议补齐 |
| Mistral Docs Changelog | Mistral 文档变更 | 已接入页面健康检查 |
| DeepSeek Models / Pricing | 模型与价格确认 | 建议补齐结构化抓取 |
| DeepSeek List Models | API 可用性确认 | 建议补齐 |
| Kimi API Docs | Kimi / Moonshot 文档 | 已接入页面健康检查 |
| Qwen Blog / Qwen GitHub / ModelScope | Qwen 发布与开源模型 | 建议补齐 |
| ZAI Docs / BigModel | ZAI 模型与 API | 建议补齐 |

### 模型与能力源

| 来源 | 用途 | 当前状态 |
| --- | --- | --- |
| Artificial Analysis Data API | 模型质量、价格、速度、延迟 | 已预留，需要 `ARTIFICIAL_ANALYSIS_API_KEY` 和 `ARTIFICIAL_ANALYSIS_API_URL` |
| Arena / LMArena | 人类偏好榜 | 建议补齐 |
| OpenRouter Models API | 模型可用性、上下文、价格、模态 | 已接入 |
| SWE-bench | 代码修复能力榜 | 建议补齐结构化接入 |
| Hugging Face Hub API | 模型、Spaces、下载量、likes、更新 | 已接入 |
| Vals AI | 评测与任务表现 | 建议补齐 |

### Agent 源

| 来源 | 用途 | 当前状态 |
| --- | --- | --- |
| Steel.dev Agent Leaderboards | WebVoyager、BrowserComp、DRACO、WebArena、OSWorld 等 | 已接入页面健康检查 |
| Agent Arena | 工具可靠性、任务完成、steerability、session 规模 | 已接入页面健康检查 |
| HAL Princeton | 成本感知、多 benchmark Agent 榜 | 已接入页面健康检查 |
| SkillsBench | Codex、Claude Code、Gemini CLI、OpenHands 等 Skill / 不带 Skill 表现 | 已接入页面健康检查 |
| OSWorld | 电脑使用 Agent benchmark | 已接入页面健康检查 |
| WebArena | 网页使用 Agent benchmark | 已接入页面健康检查 |

### 工具与产品热度源

| 来源 | 用途 | 当前状态 |
| --- | --- | --- |
| Product Hunt API | 新品、votes、topics，适合 AI 工具热度 | 已预留，需要 `PRODUCT_HUNT_TOKEN` |
| GitHub REST API | stars、forks、release、contributors、activity | 已接入仓库搜索 |
| OSSInsight AI Trending | AI Agent、MCP、Coding Agent、LLM tools、RAG 等 GitHub 趋势 | 建议补齐 |
| Hacker News Algolia API | HN 热帖、points、comments | 已接入 |
| Futurepedia / There is An AI For That | AI 工具目录和新品发现 | 建议补齐，优先做轻量抓取或人工校验 |
| arXiv API | 论文和研究趋势 | 已接入 |
| Semantic Scholar API | 论文影响力和引用趋势 | 建议补齐 |

### X / Twitter 源

| 来源 | 用途 | 当前状态 |
| --- | --- | --- |
| X Recent Search | 最近 7 天关键词、官方账号、链接传播 | 已预留，需要 `X_BEARER_TOKEN` |
| X Filtered Stream | 实时追踪关键词和官方账号 | 建议补齐 |

建议关键词：

`GPT-5.6`、`Claude Code`、`Codex`、`agent benchmark`、`computer use agent`、`MCP server`、`Hammers`、`Hammer`、`Hermes`、`browser agent`、`OpenHands`、`Manus`、`Devin`、`Qwen Code`

## 核心数据表字段

| 表 | 关键字段 | 用途 |
| --- | --- | --- |
| `sources` | `id`、`name`、`url`、`source_type`、`access_method`、`auth_required`、`weight`、`freshness_sla`、`license_note` | 记录来源元信息、权重、授权和刷新 SLA |
| `entities` | `id`、`name`、`aliases`、`provider`、`category`、`homepage`、`github_repo`、`hf_repo`、`product_url`、`first_seen_at` | 统一模型、Agent、工具、插件实体 |
| `raw_events` | `source_id`、`entity_id`、`title`、`url`、`published_at`、`fetched_at`、`raw_score`、`raw_payload_hash` | 记录原始事件和来源抓取结果 |
| `rankings` | `entity_id`、`ranking_type`、`source_id`、`rank`、`score`、`metric_name`、`benchmark_name`、`measured_at` | 存储榜单与评测结果 |
| `signals` | `entity_id`、`title`、`summary`、`category`、`confidence`、`heat_score`、`release_window`、`source_count`、`evidence_urls` | 面向前端展示的归一化信号 |
| `source_runs` | `source_id`、`started_at`、`finished_at`、`status`、`item_count`、`error_message`、`latency_ms` | 记录抓取运行状态和失败原因 |

当前仓库已经有 MySQL schema 的一部分，文件在 `scripts/database/mysql-schema.sql`。后续落库时建议向上面的完整表结构靠拢。

## 评分规则

### 模型综合分

- 35%：能力榜，例如 Artificial Analysis、Arena / LMArena、SWE-bench。
- 20%：API 可用性，例如 OpenRouter、厂商 List Models、调用状态。
- 15%：价格、上下文、速度、延迟等可用性成本。
- 15%：官方确认，例如 changelog、release notes、模型文档。
- 15%：热度增长，例如 GitHub、HN、X、Hugging Face。

### Agent 综合分

- 40%：benchmark 成功率，例如 Steel、Agent Arena、HAL、SkillsBench、OSWorld、WebArena。
- 20%：真实 session / 任务复杂度 / 电脑使用能力。
- 15%：GitHub 或产品增长。
- 15%：X / HN 热度。
- 10%：官方发布与可用性确认。

### 工具综合分

- 30%：GitHub 28 天增长。
- 25%：Product Hunt / HN 热度。
- 20%：X 传播。
- 15%：文档、版本更新、release 活跃度。
- 10%：目录站收录和生态依赖度。

### 可信度规则

- 官网 / 官方文档 / API 可用性是高可信事实来源。
- 第三方榜单是中高可信能力来源，但不能单独证明“已发布”。
- X / HN / GitHub 只作为早期热度和传播信号，不单独确认事实。
- 低可信传闻必须显示来源类型，并在 UI 上降权。

## 落地步骤

1. 先做数据骨架：`public/data/signals.json`、`model-rankings.json`、`agent-rankings.json`、`tool-rankings.json`、`sources.json`。前端从 JSON 读取，保留 `src/data.ts` 作为 fallback。
2. 接官方来源和 OpenRouter：先接 OpenAI、Anthropic、Google、Mistral、DeepSeek、Kimi、Qwen、ZAI、OpenRouter。
3. 接模型榜单：Artificial Analysis、Arena / LMArena、SWE-bench、Hugging Face。
4. 接 Agent 榜单：Steel.dev、Agent Arena、HAL、SkillsBench、OSWorld、WebArena。
5. 接热度来源：GitHub、OSSInsight、HN、Product Hunt、Hugging Face、X。
6. 做标准化：只存 URL、作者、时间、public metrics、摘要和 hash，不把 X 当最终事实。
7. 增加候选实体归一化：例如 Hammers / Hammer / Hermes 先进入候选池，必须命中官网、GitHub、Hugging Face、Product Hunt 或榜单中的两个来源才进入正式榜。
8. 做定时更新：GitHub Actions 或服务器 cron，每 30 分钟抓取一次高频源，每 6 小时抓取一次榜单，每天做全量校准。
9. UI 更新：把情报总览展示为信号矩阵、来源状态、失败原因、重试次数和是否过期。

## 建议第一期先接入 10 个源

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

这 10 个源优先覆盖模型榜、Agent 榜、工具热度、发布日历、可信来源五个核心栏目。X 和 Product Hunt 建议放在第二期接入更稳。
