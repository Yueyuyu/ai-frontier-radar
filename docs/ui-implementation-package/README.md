# UI 还原实施包

更新时间：2026-06-30

这个目录把完整 UI 图转成前端可执行契约，避免后续只凭 imagegen 图片猜布局。

## 文件

- `design-tokens.json`：颜色、字体、间距、圆角、布局断点。
- `fixtures/frontier-intel-fixture.json`：所有页面共用的固定示例数据。
- `screen-specs/*.json`：每个页面的路由、区域、组件、状态、交互和验收清单。
- `../../reference-ui/*.html`：每个页面的静态 HTML 参考实现，可直接打开。
- `../ui-implementation-rules.md`：后续 React 还原的硬性执行规则。

## 执行顺序

1. 选定页面。
2. 读取对应 screen spec。
3. 打开对应 reference UI。
4. 实现 React 页面。
5. 截图对比 reference UI 和 imagegen 页面图。
