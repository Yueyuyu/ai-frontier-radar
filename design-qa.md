# 严格 UI 还原 QA

## 范围

- 唯一视觉源：`B:\Support\Project\ai-frontier-radar\design-concepts\complete-ui\pages\*.png`
- 当前实现：`http://127.0.0.1:5173/`
- 本轮最终证据目录：`B:\Support\Project\ai-frontier-radar\design-concepts\ui-verification-2026-07-01-final`
- 桌面验收视口：`1536 x 1024`
- 移动验收视口：`390 x 844`
- 状态：本地 Vite 服务返回 200。

## 证据

| 页面 | 设计源图 | 当前 React 截图 |
| --- | --- | --- |
| 00 覆盖地图 | `design-concepts\complete-ui\pages\00-coverage-map.png` | `design-concepts\ui-verification-2026-07-01-final\00-coverage-map-react.png` |
| 01 情报总览 | `design-concepts\complete-ui\pages\01-overview.png` | `design-concepts\ui-verification-2026-07-01-final\01-overview-react.png` |
| 02 前沿信号流 | `design-concepts\complete-ui\pages\02-signal-feed.png` | `design-concepts\ui-verification-2026-07-01-final\02-signal-feed-react.png` |
| 03 模型地图 | `design-concepts\complete-ui\pages\03-model-map.png` | `design-concepts\ui-verification-2026-07-01-final\03-model-map-react.png` |
| 04 Agent 市场 | `design-concepts\complete-ui\pages\04-agent-market.png` | `design-concepts\ui-verification-2026-07-01-final\04-agent-market-react.png` |
| 05 Skill / 插件 | `design-concepts\complete-ui\pages\05-skill-plugin.png` | `design-concepts\ui-verification-2026-07-01-final\05-skill-plugin-react.png` |
| 06 数据洞察 | `design-concepts\complete-ui\pages\06-data-operations.png` | `design-concepts\ui-verification-2026-07-01-final\06-data-operations-react.png` |
| 07 榜单 | `design-concepts\complete-ui\pages\07-rankings.png` | `design-concepts\ui-verification-2026-07-01-final\07-rankings-react.png` |
| 08 发布日历 | `design-concepts\complete-ui\pages\08-release-calendar.png` | `design-concepts\ui-verification-2026-07-01-final\08-release-calendar-react.png` |
| 09 可信来源 | `design-concepts\complete-ui\pages\09-trusted-sources.png` | `design-concepts\ui-verification-2026-07-01-final\09-trusted-sources-react.png` |
| 10 路线图 | `design-concepts\complete-ui\pages\10-roadmap.png` | `design-concepts\ui-verification-2026-07-01-final\10-roadmap-react.png` |
| 11 移动端 | `design-concepts\complete-ui\pages\11-mobile-390.png` | `design-concepts\ui-verification-2026-07-01-final\11-mobile-390-react.png` |
| 12 组件与状态 | `design-concepts\complete-ui\pages\12-components-states.png` | `design-concepts\ui-verification-2026-07-01-final\12-components-states-react.png` |

全局对照图：

- `design-concepts\ui-verification-2026-07-01-final\00-contact-sheet-00-12-final.png`
- `design-concepts\ui-verification-2026-07-01-final\00-coverage-map-comparison.png`
- `design-concepts\ui-verification-2026-07-01-final\01-overview-comparison.png` 到 `12-components-states-comparison.png`

重点状态对照：

- `design-concepts\ui-verification-2026-07-01-final\11-mobile-empty-react.png`
- `design-concepts\ui-verification-2026-07-01-final\11-mobile-loading-react.png`
- `design-concepts\ui-verification-2026-07-01-final\11-mobile-states-comparison.png`
- `design-concepts\ui-verification-2026-07-01-final\12-components-states-comparison.png`

## Findings

- 无 P0/P1/P2 阻塞项。

## Completed Fixes

- 12 组件与状态板：取消整体缩放，恢复 1536 视口下的固定设计板密度；保留按钮、徽章、输入、卡片、表格、状态、颜色令牌、字体规范九类组件。
- 11 移动端：新增 `#mobile-empty` 和 `#mobile-loading`，正常态、空状态、加载骨架均可独立截图。
- 02/06/09 状态模块：补齐空结果、降级数据、缺密钥、数据状态、来源风险、覆盖率等状态带，并进入首屏验收范围。
- 03-05、07-10 页面：新增页面签名区，强化模型、Agent、Skill、榜单、日历、路线图各自的专属信息结构。
- 00 覆盖地图：新增 `#coverage-map` 独立归档板，使用真实源图缩略图、右侧数据源分层和底部覆盖清单。

## Fidelity Surfaces

- Fonts and typography：整体层级、标题、表格小字和徽章字重已统一到现有浅色主题；仍有少量 P3 字重/行高差异。
- Spacing and layout rhythm：00、02、06、11、12 的主要状态区已进入对应首屏；12 已从缩放布局改为固定画布布局。
- Colors and visual tokens：主蓝、品牌青、紫、橙红、警告黄、浅色卡片和边框与源图一致方向。
- Image quality and asset fidelity：00 使用真实源图缩略图；其它页面仍主要使用现有 icon/徽章体系，真实品牌 logo 可作为后续 P3 资产补强。
- Copy and content：当前实现保留项目数据快照和可运行路由，个别数值不逐字复刻源图，属于可接受动态数据差异。

## Verification

- `http://127.0.0.1:5173/` 返回 200。
- `pnpm run lint` 通过。
- `pnpm run build` 通过。
- 已重新生成 00-12 当前 React 截图。
- 已生成源图/实现同屏对照图。

## Follow-up Polish

- P3：继续微调 00、12 的卡片间距和标题字号，使其更接近源图像素位置。
- P3：补真实品牌/来源 logo 资源，替换部分字母化或通用图标。
- P3：可为 03-05、07-10 增加更多交互态截图，例如筛选后、详情展开、分页态。

final result: passed
