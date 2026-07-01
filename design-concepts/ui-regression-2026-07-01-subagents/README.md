# UI 回归截图归档：2026-07-01 subagents

本目录是严格 UI 还原后的项目内回归截图归档，用于和 `design-concepts/complete-ui/pages/*.png` 进行人工对照，也用于后续前端改动的视觉基线。

## 生成命令

```bash
pnpm run verify:ui -- --out design-concepts/ui-regression-2026-07-01-subagents
```

## 验证结果

- 基准页面截图：15 张
- 交互状态截图：32 张
- 浏览器 console error：0
- page error：0
- 桌面视口：1536 x 1024
- 移动视口：390 x 844

详细数据见 `manifest.json`。

## 覆盖范围

- `00-coverage-map` 至 `10-roadmap`
- `11-mobile-390`
- `11-mobile-empty`
- `11-mobile-loading`
- `12-components-states`

交互截图覆盖搜索、来源筛选、分类筛选、行选中、详情收起/展开、数据页 tab、日历视图切换、可信来源风险 tab、路线图甘特视图、移动端抽屉和组件状态板输入/开关/卡片状态。
