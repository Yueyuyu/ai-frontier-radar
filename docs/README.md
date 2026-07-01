# 文档目录

更新时间：2026-06-30

本目录记录 AI 前沿情报站 / Frontier Intel 的产品设计、数据来源、系统结构和实施路线。

## 阅读顺序

1. [系统总览](system-overview.md)
   了解当前仓库实现、数据流、文件结构、已有功能和目标差距。

2. [数据来源与信号体系](data-sources.md)
   了解来源分组、接入状态、评分规则、表结构和第一期数据源优先级。

3. [信息架构与 UI 蓝图](ui-information-architecture.md)
   了解目标产品结构、页面设计、组件系统、交互规则和设计 tokens。

4. [完整 UI 设计交付](complete-ui-design.md)
   了解 Figma 可编辑画板、imagegen 总览图、每个页面和组件状态板的交付清单。

5. [UI 还原实施规则](ui-implementation-rules.md)
   了解后续前端还原必须遵守的执行顺序、禁止项和截图验收规则。

6. [UI 还原实施包](ui-implementation-package/README.md)
   了解 design tokens、固定 fixture、每页 screen spec 和静态 reference UI。

7. [实施路线图](implementation-roadmap.md)
   了解从当前实现迁移到 Frontier Intel 的分阶段计划。

8. [前后端功能实施计划](fullstack-implementation-plan.md)
   后续执行模式可直接使用的全栈落地计划，覆盖数据契约、刷新脚本、前端页面、状态、响应式和验收命令。

9. [前后端实施验收记录](implementation-verification.md)
   查看当前落地范围、截图证据、验证命令和兼容边界。

10. [前端蓝图 JSON](ui-blueprint.json)
   面向实现的结构化契约，可供前端拆组件、建状态和对齐来源分组时参考。

## 当前命名约定

用户可见名称：

- `AI 前沿情报站`
- `Frontier Intel`
- `情报总览`
- `信号矩阵`

历史兼容名称：

- `AI Frontier Radar`
- `RadarDataset`
- `radar-data.json`
- `#radar`

历史兼容名称只保留在类型 alias、旧 JSON fallback 和旧 hash 映射里，避免破坏旧部署或旧链接。后续迁移按照 [实施路线图](implementation-roadmap.md) 分阶段处理。

## 设计约束

- 不使用圆形扫描、靶心或中心放射类视觉隐喻。
- 使用现有浅色系统主题：浅蓝白页面、白色半透明面板、青绿主色，蓝、珊瑚、紫作为分类强调。
- 数据来源、证据链和来源健康是一等功能，不是附属信息。
- X / Twitter 只能作为早期传播信号，不能单独确认发布事实。
