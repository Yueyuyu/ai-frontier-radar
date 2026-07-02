# 前后端实施验收记录

更新时间：2026-07-02

本文件记录 `docs/fullstack-implementation-plan.md` 的当前执行证据。验收以当前工作区文件、命令输出、截图和生成数据为准。

## 已落地范围

| 阶段 | 当前证据 |
| --- | --- |
| 阶段 0：基线确认 | `design-concepts/baseline/` 已保存桌面和移动基线截图 |
| 阶段 0.5：UI 还原实施包 | `docs/ui-implementation-package/`、`reference-ui/`、`design-concepts/complete-ui/pages/` 已建立 |
| 阶段 0.6：UI 还原门禁 | `docs/ui-implementation-rules.md`、screen spec、fixture、reference UI 已形成执行顺序 |
| 阶段 1：数据契约 | `FrontierIntelDataset`、`FrontierStats`、`SourceDefinition` 已建立，旧 `RadarDataset` 保留 alias |
| 阶段 2：刷新脚本 | `scripts/refresh-data.mjs` 输出主数据、兼容数据、分栏榜单、来源、运行记录和原始快照索引 |
| 阶段 3：应用壳 | `src/FrontierIntelApp.tsx`、`src/styles/tokens.css`、`src/styles/frontier.css` 已成为默认工作台 |
| 阶段 4：核心组件 | `src/components/` 已包含信号、榜单、来源、发布日历、路线图、空态、移动抽屉等组件 |
| 阶段 5：页面实现 | 10 个页面通过 hash 导航访问：总览、信号、模型、Agent、Skill、数据、榜单、日历、来源、路线图 |
| 阶段 6：搜索筛选状态 | 全局搜索、分段筛选、可信度/来源筛选、排序、移动端详情抽屉已接入 |
| 阶段 7：响应式和可访问性 | 桌面与 390px 移动端截图已覆盖，状态徽标包含文字，不只靠颜色表达 |
| 阶段 8：持久化和自动化 | MySQL schema 已存在；GitHub Actions 定时刷新工作流已新增 |
| 阶段 9：旧命名清理 | 用户可见元信息已改为 `AI 前沿情报站 / Frontier Intel`，旧 `RadarApp`、`radar.css`、未引用旧样式已删除 |

## 截图证据

| 目录 | 说明 |
| --- | --- |
| `design-concepts/stage3/` | 新应用壳桌面和移动截图 |
| `design-concepts/stage4/` | 核心组件和移动信号页截图 |
| `design-concepts/stage5/` | 模型、信号、来源、路线图、发布日历页面截图 |
| `design-concepts/stage6/` | 刷新状态、数据洞察、可信来源、移动端详情抽屉截图 |
| `design-concepts/final/` | 10 个桌面页面最终截图、3 个移动页面截图、浏览器 smoke test 结果和最终移动端抽屉截图 |

关键截图：

- `design-concepts/stage6/stage6-overview-desktop-1440.png`
- `design-concepts/stage6/stage6-data-desktop-1440.png`
- `design-concepts/stage6/stage6-sources-desktop-1440.png`
- `design-concepts/stage6/stage6-signals-mobile-drawer-390.png`
- `design-concepts/final/final-mobile-drawer-390.png`
- `design-concepts/final/page-smoke.json`
- `design-concepts/final/final-overview-desktop-1440.png`
- `design-concepts/final/final-signal-feed-desktop-1440.png`
- `design-concepts/final/final-model-map-desktop-1440.png`
- `design-concepts/final/final-agent-market-desktop-1440.png`
- `design-concepts/final/final-skill-plugin-desktop-1440.png`
- `design-concepts/final/final-data-operations-desktop-1440.png`
- `design-concepts/final/final-rankings-desktop-1440.png`
- `design-concepts/final/final-release-calendar-desktop-1440.png`
- `design-concepts/final/final-trusted-sources-desktop-1440.png`
- `design-concepts/final/final-roadmap-desktop-1440.png`

## 最近验证命令

```powershell
& 'C:\Users\Yueyu\.workbuddy\binaries\node\versions\22.22.2\npm.cmd' ci
& 'C:\Users\Yueyu\.workbuddy\binaries\node\versions\22.22.2\npm.cmd' run refresh:data
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('public/data/frontier-intel-data.json','utf8')); const files=['frontier-intel-data.json','radar-data.json','signals.json','sources.json','source-runs.json','model-rankings.json','agent-rankings.json','tool-rankings.json','raw-snapshots.index.json']; for (const f of files) JSON.parse(fs.readFileSync('public/data/'+f,'utf8')); console.log(JSON.stringify({signals:d.signals.length, rankings:d.rankingItems.length, sourceRuns:d.sourceRuns.length, generatedAt:d.generatedAt}, null, 2))"
node -e "const fs=require('fs'); const specs=fs.readdirSync('docs/ui-implementation-package/screen-specs').filter(f=>f.endsWith('.json')); const refs=fs.readdirSync('reference-ui').filter(f=>f.endsWith('.html')); if (specs.length<13 || refs.length<13) throw new Error('missing ui implementation files'); for (const f of specs) JSON.parse(fs.readFileSync('docs/ui-implementation-package/screen-specs/'+f,'utf8')); console.log('ui restoration package ok', specs.length, refs.length)"
& 'C:\Users\Yueyu\.workbuddy\binaries\node\versions\22.22.2\npm.cmd' run lint
& 'C:\Users\Yueyu\.workbuddy\binaries\node\versions\22.22.2\npm.cmd' run build
```

最近数据检查结果：

```text
signals=11
rankings=23
sourceRuns=31
sourceHealth=31
sources=31
sourceRuns.status: ok=27, skipped=4, error=0
OpenAI News: ok, fallback=https://openai.com/news/rss.xml, retryCount=3, failureRate=0.75
```

## 线上自动化检查

检查时间：2026-07-02。

- GitHub Actions 工作流 `Refresh Frontier Intel Data` 已按 schedule 触发。
- 最近 5 次线上运行均失败，最新失败 run 为 `28564446117`，来源分支为 `main`，提交为 `4faacc0`。
- 失败点不是刷新脚本：`Refresh data` 和 `Validate generated JSON` 均成功。
- 失败点是 `Build`：线上 main 缺少构建依赖，日志显示 `motion/react`、`clsx`、`tailwind-merge`、`@tailwindcss/vite` 模块找不到。
- 当前本地分支使用 `npm ci` 后 `npm run build` 已通过；需要把当前依赖和锁文件修复合入并推送到 `main` 后，再观察下一次 scheduled run 是否完成 artifact 上传和数据自动提交。

最近浏览器 smoke test：

```text
page smoke ok: 13 checks, drawer=true
```

覆盖范围：

- 桌面 1440x960：10 个 hash 页面。
- 移动 390x844：情报总览、信号矩阵、可信来源。
- 移动端信号详情抽屉可打开。
- 页面正文未渲染旧“雷达”文案。
- 页面级无横向滚动。

## 兼容边界

仍保留的历史兼容项：

- `RadarDataset` / `RadarStats` 类型 alias。
- `public/data/radar-data.json` 兼容输出。
- `#radar` hash 自动映射到 `#overview`。
- `ai-frontier-radar` 包名和 GitHub 仓库 URL 保持不变，避免破坏现有仓库地址。

已清理的旧入口：

- `src/RadarApp.tsx`
- `src/radar.css`
- `src/App.css`

## 后续可选增强

- 给语言按钮接入真实语言状态。
- 推送当前依赖和数据可信度修复后，复查下一次 GitHub Actions scheduled run 是否成功上传 artifact 和提交 `public/data/`。
- 配置可选密钥：`X_BEARER_TOKEN`、`PRODUCT_HUNT_TOKEN`、`ARTIFICIAL_ANALYSIS_API_KEY`、`ARTIFICIAL_ANALYSIS_API_URL`、`DATABASE_URL` 或 `DB_HOST/DB_NAME`。
