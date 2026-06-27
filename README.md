# AI Frontier Radar / AI 前沿雷达

开源 AI 前沿情报雷达，追踪模型、AI 编程工具、Agent、Skill/插件、榜单变化与发布信号。

当前首版界面先以中文呈现；项目定位不局限于中文市场，后续会预留多语言扩展。

## 项目定位

AI Frontier Radar 不是传统 AI 新闻站，也不只是模型榜单。它面向开发者、产品经理、研究者和 AI 工具使用者，用信号流方式追踪 AI 前沿生态：

- 模型：GPT、Claude、Gemini、DeepSeek、Kimi、GLM、Qwen 等。
- AI 编程：Codex、Claude Code、Zed Code / Zcode、Cursor、Windsurf 等。
- Agent：能执行任务、调用工具、读写项目上下文的产品和框架。
- Skill / 插件：MCP、连接器、工具调用、自动化 Skill 和插件市场。
- 平台与榜单：OpenRouter、Hugging Face、LMArena、OpenCompass、SuperCLUE 等。

## 首版功能

- 前沿信号流：按时间轨道展示模型、AI 编程工具、Agent 和插件生态的变化。
- 证据检查器：展示选中信号的来源、可信度、发现时间和发布窗口。
- 发布胶片：以横向时间胶片展示最新与即将变化的 AI 前沿对象。
- 分类筛选：按模型、AI 编程、Agent、Skill / 插件、平台过滤。
- 动效体验：使用 animejs 与 CSS 动效营造视频感信号流界面。

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
