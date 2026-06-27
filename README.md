# AI Model Radar / 模型雷达

中文友好的开源 AI 模型情报站，聚合头部模型发布、发布前信号、榜单变化、价格能力信息和证据可信度。

## 项目定位

AI Model Radar 不是传统 AI 新闻站，而是一个面向开发者、产品经理和 AI 研究关注者的模型发布雷达：

- 追踪 OpenAI、Anthropic、Google、xAI、DeepSeek、Kimi、GLM、Qwen 等核心模型线。
- 区分官方确认、第三方接入、文档信号和社区传闻。
- 用证据链、可信度和时间线解释每条模型动态。
- 聚合榜单变化，但不把任何单一榜单当成唯一真理。

## 首版功能

- P0 观察池：围绕 Notion AI 等产品侧已经接入的头部模型建立默认关注名单。
- 最新信号流：展示模型发布、文档变化、第三方接入和社区传闻。
- 雷达视图：用未来化仪表盘展示公司活跃度和信号分布。
- 榜单变化：展示模型在不同能力口径下的排名移动。
- 生命周期：从首次信号、证据聚合、可信度评级到正式发布和上榜。
- 可信度系统：每条信息保留来源类型、可信度和更新时间。

## 技术栈

- React + TypeScript + Vite
- animejs
- lucide-react
- 原生 CSS 设计系统

## 本地开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm run lint
npm run build
```

## 开源协议

MIT
