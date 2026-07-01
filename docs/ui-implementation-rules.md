# UI 还原实施规则

更新时间：2026-06-30

本文件用于解决“只靠图片还原不稳定”的问题。后续 Codex 或前端实现必须按以下顺序工作：

1. 先读本文件。
2. 再读 `docs/ui-implementation-package/design-tokens.json`。
3. 再读目标页面的 `docs/ui-implementation-package/screen-specs/*.json`。
4. 再打开对应 `reference-ui/*.html`。
5. 最后才看 `design-concepts/complete-ui/pages/*.png` 做视觉对照。

## 硬性规则

- 使用现有浅色系统主题：浅蓝白页面、白色面板、浅蓝灰描边、青绿主色。
- 不允许暗色整页背景。
- 不允许雷达、靶心、扫描、中心放射、中心 hub、中心节点扩散等视觉。
- 首屏必须是可使用工作台，不是营销 hero。
- 数据来源、证据链、来源健康、缺失密钥、降级数据必须显性展示。
- X / Twitter 只作为早期传播和热度，不作为事实确认。
- 图片里的局部文案不作为事实来源，精确字段以 JSON 契约和 screen spec 为准。

## 还原验收

- React 页面截图先与 `reference-ui/*.html` 对齐，再与 imagegen 图对照。
- 每个页面至少检查桌面 1440x960；移动端检查 390x844。
- 文本不能溢出按钮、卡片、表格或抽屉。
- 所有列表、表格、卡片都要能追溯到 fixture 或真实数据字段。
- 缺失 API Key 时展示 `skipped` 和环境变量名，不展示密钥值。
