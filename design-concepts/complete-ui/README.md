# 完整 UI 设计资产

更新时间：2026-06-30

本目录存放 `AI 前沿情报站 / Frontier Intel` 的完整 UI 设计预览资产。

## 文件

| 文件 | 来源 | 说明 |
| --- | --- | --- |
| `figma-coverage-map.png` | Figma 截图 | Figma 设计目录页截图，确认 10 个桌面页面、移动端、组件状态板和数据来源分层 |
| `imagegen-complete-ui-board.png` | imagegen | 完整 UI 视觉总览图，适合快速沟通页面布局和视觉风格 |
| `pages/*.png` | imagegen | 每个页面的独立详情图，用于前端还原页面级布局和状态 |

## imagegen 页面详情图

| 页面 | 文件 |
| --- | --- |
| 设计覆盖说明 | `pages/00-coverage-map.png` |
| 情报总览 | `pages/01-overview.png` |
| 前沿信号流 | `pages/02-signal-feed.png` |
| 模型地图 | `pages/03-model-map.png` |
| Agent 市场 | `pages/04-agent-market.png` |
| Skill / 插件 | `pages/05-skill-plugin.png` |
| 数据洞察 | `pages/06-data-operations.png` |
| 榜单 | `pages/07-rankings.png` |
| 发布日历 | `pages/08-release-calendar.png` |
| 可信来源 | `pages/09-trusted-sources.png` |
| 路线图 | `pages/10-roadmap.png` |
| 移动端 390px | `pages/11-mobile-390.png` |
| 组件与状态板 | `pages/12-components-states.png` |

## Figma

可编辑文件：

https://www.figma.com/design/BrCkDbTQn8W3LB6nm7p1KQ

Figma 文件中包含 13 个顶层 frame：

- `00 设计目录 / Coverage Map`
- `01 情报总览 / Overview`
- `02 前沿信号流 / Signal Feed`
- `03 模型地图 / Model Map`
- `04 Agent 市场 / Agent Market`
- `05 Skill 插件 / Skill Plugin`
- `06 数据洞察 / Data Operations`
- `07 榜单 / Rankings`
- `08 发布日历 / Release Calendar`
- `09 可信来源 / Trusted Sources`
- `10 路线图 / Roadmap`
- `11 移动端 / Mobile 390`
- `12 组件与状态 / Components States`

## 使用方式

- 前端实现以 `docs/ui-blueprint.json` 和 `docs/complete-ui-design.md` 为准。
- `imagegen-complete-ui-board.png` 只作为视觉参考，局部自动生成文字不作为实现依据。
- `pages/*.png` 是页面级视觉参考，布局密度和模块关系可参考，精确字段和数据规则仍以文档和 JSON 契约为准。
- 不要引入雷达、靶心、扫描、中心放射图形；保持浅色系统主题。
