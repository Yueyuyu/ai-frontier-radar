import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const outputDir = join(repoRoot, 'public', 'data')
const schemaPath = join(repoRoot, 'scripts', 'database', 'mysql-schema.sql')

const generatedAt = new Date().toISOString()
const userAgent = 'ai-frontier-radar/0.3 (+https://github.com/Yueyuyu/ai-frontier-radar)'
const githubToken = process.env.GITHUB_TOKEN || ''
const xBearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN || ''
const productHuntToken = process.env.PRODUCT_HUNT_TOKEN || ''
const artificialAnalysisKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY || ''
const artificialAnalysisUrl = process.env.ARTIFICIAL_ANALYSIS_API_URL || ''

const sourceRuns = []
const rawSnapshots = []

const columns = {
  official: '官网 / 文档',
  model: '模型排行榜',
  agent: 'Agent 排行榜',
  tool: '工具 / 插件热度',
  social: '社区 / X',
  research: '论文 / 研究',
}

const officialSources = [
  {
    id: 'openai-news',
    name: 'OpenAI News',
    column: columns.official,
    url: 'https://openai.com/news/',
    access: 'official-page',
    patterns: ['GPT-5.6', 'Codex', 'model', 'API'],
  },
  {
    id: 'openai-api-changelog',
    name: 'OpenAI API Changelog',
    column: columns.official,
    url: 'https://developers.openai.com/api/docs/changelog',
    access: 'official-page',
    patterns: ['model', 'API', 'agent', 'Codex'],
  },
  {
    id: 'anthropic-release-notes',
    name: 'Claude Release Notes',
    column: columns.official,
    url: 'https://support.claude.com/en/articles/12138966-release-notes',
    access: 'official-page',
    patterns: ['Claude Code', 'model', 'release'],
  },
  {
    id: 'gemini-changelog',
    name: 'Gemini API Changelog',
    column: columns.official,
    url: 'https://ai.google.dev/gemini-api/docs/changelog',
    access: 'official-page',
    patterns: ['Gemini', 'model', 'API'],
  },
  {
    id: 'mistral-changelog',
    name: 'Mistral Changelog',
    column: columns.official,
    url: 'https://docs.mistral.ai/resources/changelogs',
    access: 'official-page',
    patterns: ['model', 'API', 'release'],
  },
  {
    id: 'deepseek-docs',
    name: 'DeepSeek API Docs',
    column: columns.official,
    url: 'https://api-docs.deepseek.com/',
    access: 'official-page',
    patterns: ['models', 'pricing', 'chat'],
  },
  {
    id: 'kimi-docs',
    name: 'Kimi API Docs',
    column: columns.official,
    url: 'https://platform.kimi.ai/docs/overview',
    access: 'official-page',
    patterns: ['model', 'API', 'Kimi'],
  },
]

const agentLeaderboardPages = [
  { id: 'steel-leaderboard', name: 'Steel.dev Agent Leaderboard', url: 'https://leaderboard.steel.dev/' },
  { id: 'agent-arena', name: 'Agent Arena', url: 'https://arena.ai/leaderboard/agent' },
  { id: 'hal-princeton', name: 'HAL Princeton', url: 'https://hal.cs.princeton.edu/' },
  { id: 'skillsbench', name: 'SkillsBench', url: 'https://www.skillsbench.ai/leaderboard' },
  { id: 'osworld', name: 'OSWorld', url: 'https://os-world.github.io/' },
  { id: 'webarena', name: 'WebArena', url: 'https://webarena.dev/' },
]

const seedSignals = [
  {
    id: 'gpt-56-sol',
    provider: 'OpenAI',
    name: 'GPT-5.6 Sol',
    category: '模型',
    level: 'official',
    baseScore: 99,
    firstSeen: '2026-06-26',
    releaseWindow: '有限预览',
    title: 'GPT-5.6 Sol 进入有限预览',
    summary: 'OpenAI 官方资料确认 GPT-5.6 Sol 进入有限预览，当前作为最高可信度发布信号追踪。',
    lane: 0,
    offset: 6,
    accent: '#63f7d4',
    sources: [
      { name: 'OpenAI 公告', type: 'official', detail: '官网发布 GPT-5.6 Sol 预览说明', strength: 98, url: 'https://openai.com/news/' },
      { name: 'OpenAI Help', type: 'docs', detail: 'Help 文档说明 Sol / Terra / Luna 的有限预览', strength: 96, url: 'https://help.openai.com/' },
      { name: 'OpenAI X', type: 'social', detail: '官方社媒用于发布时间线交叉校验', strength: 88, url: 'https://x.com/OpenAI' },
    ],
  },
  {
    id: 'gpt-56-terra',
    provider: 'OpenAI',
    name: 'GPT-5.6 Terra',
    category: '模型',
    level: 'official',
    baseScore: 97,
    firstSeen: '2026-06-26',
    releaseWindow: '有限预览',
    title: 'GPT-5.6 Terra 限量开放',
    summary: 'Terra 属于 GPT-5.6 系列预览模型，需要持续追踪 API 命名、账号层级和速率限制。',
    lane: 0,
    offset: 10,
    accent: '#ff8f5f',
    sources: [
      { name: 'OpenAI Help', type: 'docs', detail: '有限预览说明中列出 Terra', strength: 96, url: 'https://help.openai.com/' },
      { name: 'OpenAI API', type: 'platform', detail: '监控模型 ID、价格和可用区域', strength: 88, url: 'https://platform.openai.com/docs/models' },
    ],
  },
  {
    id: 'gpt-56-luna',
    provider: 'OpenAI',
    name: 'GPT-5.6 Luna',
    category: '模型',
    level: 'official',
    baseScore: 96,
    firstSeen: '2026-06-26',
    releaseWindow: '有限预览',
    title: 'GPT-5.6 Luna 随 GPT-5.6 系列发布',
    summary: 'Luna 与 Sol、Terra 同批进入有限范围发布，当前重点追踪 API 暴露、价格、评测和扩量窗口。',
    lane: 0,
    offset: 14,
    accent: '#8eb9ff',
    sources: [
      { name: 'OpenAI Help', type: 'docs', detail: '有限预览说明中包含 Luna', strength: 95, url: 'https://help.openai.com/' },
      { name: 'OpenAI API', type: 'platform', detail: '后续以模型列表和计费页为准', strength: 86, url: 'https://platform.openai.com/docs/models' },
    ],
  },
  {
    id: 'codex',
    provider: 'OpenAI',
    name: 'Codex',
    category: 'AI 编程',
    level: 'platform',
    baseScore: 94,
    firstSeen: '32 分钟前',
    releaseWindow: '持续更新',
    title: 'Codex 编程代理生态需要独立追踪',
    summary: 'Codex 不只是模型入口，而是 AI 编程工作流本身；需要持续追踪 CLI、IDE、任务线程、工具调用和 Skill 能力变化。',
    lane: 1,
    offset: 20,
    accent: '#8eb9ff',
    sources: [
      { name: 'OpenAI 开发者文档', type: 'docs', detail: '追踪 Codex、工具调用和开发者工作流变化', strength: 86, url: 'https://developers.openai.com/' },
      { name: 'GitHub 热度', type: 'platform', detail: '相关仓库增长观察生态扩散', strength: 74, url: 'https://github.com/search?q=codex+agent&type=repositories' },
    ],
  },
  {
    id: 'claude-code',
    provider: 'Anthropic',
    name: 'Claude Code',
    category: 'AI 编程',
    level: 'docs',
    baseScore: 92,
    firstSeen: '1 小时前',
    releaseWindow: '持续更新',
    title: 'Claude Code 成为 Anthropic 工具线重点',
    summary: 'Claude Code 代表模型能力向真实开发环境迁移，版本、权限、上下文和终端集成都值得长期追踪。',
    lane: 2,
    offset: 34,
    accent: '#ffb86b',
    sources: [
      { name: 'Claude Code 文档', type: 'docs', detail: '命令行、权限和项目上下文说明持续变化', strength: 84, url: 'https://code.claude.com/docs/' },
      { name: 'SkillsBench', type: 'benchmark', detail: '评估带 Skill 工作流的真实开发能力', strength: 74, url: 'https://www.skillsbench.ai/leaderboard' },
    ],
  },
  {
    id: 'mcp-skills',
    provider: 'MCP Ecosystem',
    name: 'MCP / Skills',
    category: 'Skill / 插件',
    level: 'docs',
    baseScore: 88,
    firstSeen: '3 小时前',
    releaseWindow: '持续更新',
    title: 'Skill 与 MCP 生态正在成为关键层',
    summary: '工具调用、连接器、Skill、MCP Server 会决定 AI 能否真正处理复杂任务。',
    lane: 4,
    offset: 25,
    accent: '#b79cff',
    sources: [
      { name: '协议文档', type: 'docs', detail: 'MCP、工具规范和权限模型需要跟踪', strength: 83, url: 'https://modelcontextprotocol.io/' },
      { name: 'GitHub 仓库', type: 'platform', detail: '社区 MCP Server 增长可作生态热度', strength: 74, url: 'https://github.com/search?q=mcp+server&type=repositories' },
    ],
  },
  {
    id: 'agent-runtime',
    provider: 'OpenAI / Anthropic / LangChain',
    name: 'Agent Runtime',
    category: 'Agent',
    level: 'docs',
    baseScore: 84,
    firstSeen: '4 小时前',
    releaseWindow: '持续更新',
    title: 'Agent 运行时与工具权限成为前沿层',
    summary: 'Agent 需要持续追踪任务执行、浏览器/终端能力、工具权限、记忆、沙箱和可观测性。',
    lane: 4,
    offset: 62,
    accent: '#f7d774',
    sources: [
      { name: 'Agent SDK 文档', type: 'docs', detail: 'Agent SDK、工具调用、沙箱和权限模型的变更', strength: 82, url: 'https://platform.openai.com/docs/agents' },
      { name: 'Agent 榜单', type: 'benchmark', detail: 'Steel、Agent Arena、HAL 等榜单提供外部评估', strength: 78, url: 'https://leaderboard.steel.dev/' },
    ],
  },
  {
    id: 'openrouter-rankings',
    provider: 'OpenRouter / LMArena',
    name: 'Rankings Signal',
    category: '平台',
    level: 'platform',
    baseScore: 86,
    firstSeen: '5 小时前',
    releaseWindow: '每日更新',
    title: '榜单变化需要和发布信号分开看',
    summary: '模型排名可以接入 OpenRouter、LMArena、Artificial Analysis、SWE-bench 等平台，但不能替代官方发布和文档变更。',
    lane: 5,
    offset: 12,
    accent: '#ff6fd8',
    sources: [
      { name: 'OpenRouter Models', type: 'platform', detail: '模型可用性、价格、上下文和模态', strength: 83, url: 'https://openrouter.ai/api/v1/models' },
      { name: 'LMArena', type: 'benchmark', detail: '社区偏好榜可作能力趋势参考', strength: 76, url: 'https://arena.ai/leaderboard' },
    ],
  },
  {
    id: 'gemini-31-pro',
    provider: 'Google',
    name: 'Gemini 3.1 Pro',
    category: '模型',
    level: 'platform',
    baseScore: 91,
    firstSeen: '46 分钟前',
    releaseWindow: '约 2-5 周',
    title: 'Gemini Pro 系列需要持续追踪产品接入信号',
    summary: 'Gemini 相关信号需要同时关注 Google 官方发布、AI Studio / Vertex AI 接入、第三方模型网关和开发者社区反馈。',
    lane: 2,
    offset: 41,
    accent: '#4b8cff',
    sources: [
      { name: 'Gemini API Changelog', type: 'docs', detail: '官方变更日志是最高权重来源', strength: 88, url: 'https://ai.google.dev/gemini-api/docs/changelog' },
      { name: 'AI Studio / Vertex AI', type: 'platform', detail: '产品接入和 API 可用性需要持续监测', strength: 86, url: 'https://ai.google.dev/' },
    ],
  },
  {
    id: 'deepseek-v4-pro',
    provider: 'DeepSeek',
    name: 'DeepSeek V4 Pro',
    category: '模型',
    level: 'rumor',
    baseScore: 76,
    firstSeen: '7 小时前',
    releaseWindow: '约 4-8 周',
    title: 'DeepSeek Pro 信号进入观察模式',
    summary: '需要把社区传闻、开源仓库、API 接入和官方公告拆开处理，避免把传闻当事实。',
    lane: 5,
    offset: 58,
    accent: '#58d68d',
    sources: [
      { name: 'DeepSeek API', type: 'docs', detail: '模型列表和价格页是确认信号', strength: 78, url: 'https://api-docs.deepseek.com/' },
      { name: '社区观察', type: 'social', detail: '讨论热度高，但需要证据链校准', strength: 52, url: 'https://x.com/search?q=DeepSeek%20model' },
    ],
  },
  {
    id: 'kimi-k26',
    provider: 'Moonshot',
    name: 'Kimi K2.6',
    category: '模型',
    level: 'platform',
    baseScore: 80,
    firstSeen: '8 小时前',
    releaseWindow: '约 3-6 周',
    title: 'Kimi 系列模型信号进入观察池',
    summary: 'Kimi 动态需要关注 Moonshot 官方渠道、产品侧模型选择器、API 文档和中文社区讨论。',
    lane: 5,
    offset: 72,
    accent: '#111827',
    sources: [
      { name: 'Kimi API 文档', type: 'docs', detail: '模型列表、价格和调用限制作为确认信号', strength: 75, url: 'https://platform.kimi.ai/docs/overview' },
      { name: '中文社区观察', type: 'social', detail: '讨论热度上升，但需要证据链校准', strength: 50, url: 'https://x.com/search?q=Kimi%20model' },
    ],
  },
]

function lastUpdateText() {
  return '刚刚'
}

function hashPayload(payload) {
  return createHash('sha256').update(payload).digest('hex')
}

function clampScore(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

function addRun(run) {
  sourceRuns.push({ checkedAt: generatedAt, ...run })
}

function addSnapshot(provider, syncType, requestUrl, status, payload, message = '') {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
  rawSnapshots.push({
    id: hashPayload(`${provider}|${syncType}|${requestUrl}|${body}`).slice(0, 32),
    provider,
    syncType,
    requestUrl,
    responseSha256: hashPayload(body),
    responseBody: body.slice(0, 500_000),
    capturedAt: generatedAt,
    status,
    message: normalizeText(message).slice(0, 500),
  })
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20_000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        Accept: options.accept ?? 'application/json, text/plain, */*',
        ...(options.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchJsonSource({ id, name, column, url, access = 'public-api', headers = {}, method = 'GET', body }) {
  try {
    const response = await fetchWithTimeout(url, { method, body, headers })
    const text = await response.text()
    if (!response.ok) {
      addRun({ id, name, column, url, access, status: 'error', itemCount: 0, message: `HTTP ${response.status}` })
      addSnapshot(name, id, url, 'error', text, `HTTP ${response.status}`)
      return null
    }
    const json = JSON.parse(text)
    const itemCount = Array.isArray(json) ? json.length : Array.isArray(json.data) ? json.data.length : Array.isArray(json.items) ? json.items.length : 1
    addRun({ id, name, column, url, access, status: 'ok', itemCount, message: '刷新成功' })
    addSnapshot(name, id, url, 'ok', json)
    return json
  } catch (error) {
    addRun({ id, name, column, url, access, status: 'error', itemCount: 0, message: error.message })
    addSnapshot(name, id, url, 'error', String(error), error.message)
    return null
  }
}

async function fetchTextSource({ id, name, column, url, access = 'html-page', patterns = [] }) {
  try {
    const response = await fetchWithTimeout(url, { accept: 'text/html, text/plain, */*' })
    const text = await response.text()
    if (!response.ok) {
      addRun({ id, name, column, url, access, status: 'error', itemCount: 0, message: `HTTP ${response.status}` })
      addSnapshot(name, id, url, 'error', text, `HTTP ${response.status}`)
      return { text: '', matches: 0 }
    }
    const lower = text.toLowerCase()
    const matches = patterns.filter((pattern) => lower.includes(pattern.toLowerCase())).length
    addRun({ id, name, column, url, access, status: 'ok', itemCount: matches, message: patterns.length ? `命中 ${matches}/${patterns.length} 个关键词` : '页面可访问' })
    addSnapshot(name, id, url, 'ok', text.slice(0, 120_000))
    return { text, matches }
  } catch (error) {
    addRun({ id, name, column, url, access, status: 'error', itemCount: 0, message: error.message })
    addSnapshot(name, id, url, 'error', String(error), error.message)
    return { text: '', matches: 0 }
  }
}

async function collectOfficialSources() {
  const pages = await Promise.all(officialSources.map(fetchTextSource))
  return pages.reduce((sum, page) => sum + page.matches, 0)
}

async function collectOpenRouterModels() {
  const json = await fetchJsonSource({
    id: 'openrouter-models',
    name: 'OpenRouter Models',
    column: columns.model,
    url: 'https://openrouter.ai/api/v1/models',
  })
  const models = Array.isArray(json?.data) ? json.data : []
  return models
    .filter((model) => /gpt|claude|gemini|deepseek|qwen|kimi|mistral|llama/i.test(`${model.id} ${model.name}`))
    .slice(0, 24)
    .map((model) => {
      const contextLength = Number(model.context_length ?? 0)
      const promptPrice = Number(model.pricing?.prompt ?? 0)
      const score = clampScore(55 + Math.log10(Math.max(contextLength, 1)) * 8 - Math.min(promptPrice * 100_000, 16))
      return {
        label: model.name || model.id,
        value: contextLength ? `${Math.round(contextLength / 1000)}k ctx` : '可用',
        note: model.id,
        score,
        url: `https://openrouter.ai/${model.id}`,
      }
    })
}

async function collectGitHubSignals() {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10)
  const queries = [
    { id: 'github-agent', label: 'AI Agent', q: `ai agent pushed:>=${since} stars:>50`, column: columns.agent },
    { id: 'github-mcp', label: 'MCP Server', q: `mcp server pushed:>=${since} stars:>20`, column: columns.tool },
    { id: 'github-coding-agent', label: 'Coding Agent', q: `coding agent pushed:>=${since} stars:>20`, column: columns.tool },
  ]
  const headers = githubToken ? { Authorization: `Bearer ${githubToken}` } : {}
  const results = []
  for (const query of queries) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query.q)}&sort=stars&order=desc&per_page=10`
    const json = await fetchJsonSource({
      id: query.id,
      name: `GitHub Search - ${query.label}`,
      column: query.column,
      url,
      headers,
    })
    const items = Array.isArray(json?.items) ? json.items : []
    for (const repo of items) {
      results.push({
        label: repo.full_name,
        value: `${repo.stargazers_count ?? 0} stars`,
        note: normalizeText(repo.description || query.label).slice(0, 120),
        score: clampScore(55 + Math.log10(Math.max(repo.stargazers_count ?? 0, 1)) * 11 + Math.log10(Math.max(repo.forks_count ?? 0, 1)) * 5),
        url: repo.html_url,
        query: query.label,
      })
    }
  }
  return results
}

async function collectHackerNewsSignals() {
  const queries = ['GPT-5.6', 'AI agent', 'Claude Code', 'MCP server', 'Hammers AI agent']
  const results = []
  for (const query of queries) {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`
    const json = await fetchJsonSource({
      id: `hn-${query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: `Hacker News - ${query}`,
      column: columns.social,
      url,
    })
    const hits = Array.isArray(json?.hits) ? json.hits : []
    for (const hit of hits) {
      results.push({
        label: hit.title || query,
        value: `${hit.points ?? 0} pts`,
        note: `${query} / ${hit.num_comments ?? 0} comments`,
        score: clampScore(45 + Math.log10(Math.max(hit.points ?? 0, 1)) * 14 + Math.log10(Math.max(hit.num_comments ?? 0, 1)) * 8),
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        query,
      })
    }
  }
  return results
}

async function collectHuggingFaceSignals() {
  const queries = ['agent', 'mcp', 'coding agent', 'reasoning model']
  const results = []
  for (const query of queries) {
    const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&sort=downloads&direction=-1&limit=10`
    const json = await fetchJsonSource({
      id: `hf-${query.replace(/[^a-z0-9]+/gi, '-')}`,
      name: `Hugging Face - ${query}`,
      column: columns.model,
      url,
    })
    const models = Array.isArray(json) ? json : []
    for (const model of models) {
      results.push({
        label: model.modelId || model.id,
        value: `${model.downloads ?? 0} dl`,
        note: `${query} / likes ${model.likes ?? 0}`,
        score: clampScore(45 + Math.log10(Math.max(model.downloads ?? 0, 1)) * 9 + Math.log10(Math.max(model.likes ?? 0, 1)) * 8),
        url: `https://huggingface.co/${model.modelId || model.id}`,
        query,
      })
    }
  }
  return results
}

async function collectArxivSignals() {
  const url = 'https://export.arxiv.org/api/query?search_query=all:%22AI%20agent%22%20OR%20all:%22large%20language%20model%22&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending'
  const page = await fetchTextSource({
    id: 'arxiv-agent-llm',
    name: 'arXiv API',
    column: columns.research,
    url,
    access: 'public-api',
    patterns: ['<entry>'],
  })
  const entries = Array.from(page.text.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).slice(0, 10)
  return entries.map((entry) => {
    const block = entry[1]
    const title = normalizeText(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? 'arXiv paper')
    const link = block.match(/<id>([\s\S]*?)<\/id>/)?.[1] ?? 'https://arxiv.org/'
    return {
      label: title.slice(0, 80),
      value: '论文',
      note: 'arXiv 最新提交',
      score: 62,
      url: link,
    }
  })
}

async function collectAgentLeaderboardHealth() {
  const results = []
  for (const source of agentLeaderboardPages) {
    const page = await fetchTextSource({
      id: source.id,
      name: source.name,
      column: columns.agent,
      url: source.url,
      access: 'html-page',
      patterns: ['leaderboard', 'agent', 'benchmark'],
    })
    results.push({
      label: source.name,
      value: page.matches > 0 ? '可访问' : '需人工校验',
      note: `${hostFromUrl(source.url)} / 命中 ${page.matches} 个关键词`,
      score: page.matches > 0 ? 76 + page.matches * 4 : 58,
      url: source.url,
    })
  }
  return results
}

async function collectXSignals() {
  if (!xBearerToken) {
    addRun({
      id: 'x-recent-search',
      name: 'X Recent Search',
      column: columns.social,
      url: 'https://api.x.com/2/tweets/search/recent',
      access: 'api-key',
      status: 'skipped',
      itemCount: 0,
      message: '未配置 X_BEARER_TOKEN，跳过 X 数据刷新',
    })
    return []
  }

  const query = '(GPT-5.6 OR "Claude Code" OR "MCP server" OR "AI agent" OR Hammers) -is:retweet lang:en'
  const url = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&tweet.fields=created_at,public_metrics,author_id`
  const json = await fetchJsonSource({
    id: 'x-recent-search',
    name: 'X Recent Search',
    column: columns.social,
    url,
    access: 'api-key',
    headers: { Authorization: `Bearer ${xBearerToken}` },
  })
  const posts = Array.isArray(json?.data) ? json.data : []
  return posts.map((post) => {
    const metrics = post.public_metrics || {}
    const engagement = (metrics.like_count ?? 0) + (metrics.retweet_count ?? 0) * 2 + (metrics.reply_count ?? 0)
    return {
      label: post.text.slice(0, 80),
      value: `${engagement} eng`,
      note: `X / ${post.created_at ?? ''}`,
      score: clampScore(45 + Math.log10(Math.max(engagement, 1)) * 18),
      url: `https://x.com/i/web/status/${post.id}`,
    }
  })
}

async function collectProductHuntSignals() {
  if (!productHuntToken) {
    addRun({
      id: 'product-hunt',
      name: 'Product Hunt API',
      column: columns.tool,
      url: 'https://api.producthunt.com/v2/api/graphql',
      access: 'api-key',
      status: 'skipped',
      itemCount: 0,
      message: '未配置 PRODUCT_HUNT_TOKEN，跳过 Product Hunt 数据刷新',
    })
    return []
  }

  const query = `{
    posts(first: 20, order: RANKING) {
      edges {
        node {
          name
          tagline
          url
          votesCount
          createdAt
        }
      }
    }
  }`
  const json = await fetchJsonSource({
    id: 'product-hunt',
    name: 'Product Hunt API',
    column: columns.tool,
    url: 'https://api.producthunt.com/v2/api/graphql',
    access: 'api-key',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${productHuntToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const edges = Array.isArray(json?.data?.posts?.edges) ? json.data.posts.edges : []
  return edges.map(({ node }) => ({
    label: node.name,
    value: `${node.votesCount ?? 0} votes`,
    note: normalizeText(node.tagline).slice(0, 120),
    score: clampScore(50 + Math.log10(Math.max(node.votesCount ?? 0, 1)) * 18),
    url: node.url,
  }))
}

async function collectArtificialAnalysisSignals() {
  if (!artificialAnalysisKey || !artificialAnalysisUrl) {
    addRun({
      id: 'artificial-analysis',
      name: 'Artificial Analysis Data API',
      column: columns.model,
      url: artificialAnalysisUrl || 'https://artificialanalysis.ai/data-api',
      access: 'api-key',
      status: 'skipped',
      itemCount: 0,
      message: '未配置 ARTIFICIAL_ANALYSIS_API_KEY 和 ARTIFICIAL_ANALYSIS_API_URL，跳过该商业 API',
    })
    return []
  }

  const json = await fetchJsonSource({
    id: 'artificial-analysis',
    name: 'Artificial Analysis Data API',
    column: columns.model,
    url: artificialAnalysisUrl,
    access: 'api-key',
    headers: { 'x-api-key': artificialAnalysisKey, Authorization: `Bearer ${artificialAnalysisKey}` },
  })
  const rows = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : []
  return rows.slice(0, 20).map((row, index) => ({
    label: row.name || row.model || row.model_name || `Artificial Analysis #${index + 1}`,
    value: String(row.score ?? row.quality_index ?? row.intelligence_index ?? '榜单'),
    note: 'Artificial Analysis 商业 API',
    score: clampScore(Number(row.score ?? row.quality_index ?? row.intelligence_index ?? 70)),
    url: 'https://artificialanalysis.ai/',
  }))
}

function buildSignals({ github, hn, xSignals }) {
  const heatByKeyword = new Map()
  for (const item of [...github, ...hn, ...xSignals]) {
    const text = `${item.label} ${item.note}`.toLowerCase()
    for (const signal of seedSignals) {
      const keywords = [signal.name, signal.provider, signal.category].map((value) => value.toLowerCase())
      if (keywords.some((keyword) => keyword && text.includes(keyword))) {
        heatByKeyword.set(signal.id, (heatByKeyword.get(signal.id) ?? 0) + (item.score ?? 0) / 100)
      }
    }
  }

  return seedSignals.map((signal) => {
    const heatBonus = Math.min(4, heatByKeyword.get(signal.id) ?? 0)
    return {
      id: signal.id,
      provider: signal.provider,
      name: signal.name,
      category: signal.category,
      level: signal.level,
      confidence: clampScore(signal.baseScore + heatBonus),
      firstSeen: signal.firstSeen,
      lastUpdate: lastUpdateText(),
      releaseWindow: signal.releaseWindow,
      title: signal.title,
      summary: signal.summary,
      lane: signal.lane,
      offset: signal.offset,
      accent: signal.accent,
      trustBand: signal.baseScore >= 90 ? 'high' : signal.baseScore >= 75 ? 'medium' : signal.level === 'social' || signal.level === 'rumor' ? 'watch' : 'medium',
      sourceCount: signal.sources.length,
      sources: signal.sources,
    }
  })
}

function buildRankingItems(signals, github, agentHealth) {
  const seeded = signals.map((signal, index) => ({
    rank: index + 1,
    name: signal.name,
    provider: signal.provider,
    category: signal.category,
    score: signal.confidence,
    change: Math.max(1, Math.round((signal.confidence - 75) / 4)),
    trend: [48, 54, 58, 64, 72, 80, signal.confidence],
    accent: signal.accent,
    kind: signal.category === 'Agent' ? 'agent' : signal.category === '模型' ? 'model' : 'tool',
    source: '综合信号',
    scoringExplanation: '综合信号分由官方确认、平台可用性、榜单或社区热度共同计算。',
  }))

  const repoItems = github.slice(0, 8).map((item, index) => ({
    rank: seeded.length + index + 1,
    name: item.label.split('/').slice(-1)[0],
    provider: item.label.includes('/') ? item.label.split('/')[0] : 'GitHub',
    category: item.query === 'AI Agent' ? 'Agent' : 'Skill / 插件',
    score: item.score,
    change: null,
    trend: [30, 36, 42, 47, 55, 61, item.score ?? 65],
    accent: item.query === 'AI Agent' ? '#f7d774' : '#b79cff',
    source: 'GitHub Search',
    url: item.url,
    kind: item.query === 'AI Agent' ? 'agent' : 'tool',
    scoringExplanation: 'GitHub 搜索项主要依据仓库热度、活跃度和查询类别排序。',
  }))

  const agentItems = agentHealth.slice(0, 4).map((item, index) => ({
    rank: seeded.length + repoItems.length + index + 1,
    name: item.label.replace(' Leaderboard', ''),
    provider: hostFromUrl(item.url),
    category: 'Agent',
    score: item.score,
    change: null,
    trend: [42, 45, 49, 52, 56, 61, item.score ?? 70],
    accent: '#f7d774',
    source: 'Agent benchmark page',
    url: item.url,
    kind: 'agent',
    scoringExplanation: 'Agent 榜单项主要依据公开 benchmark 页面健康状态和页面信号分排序。',
  }))

  return [...seeded, ...repoItems, ...agentItems]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

function buildSourceHealth() {
  const grouped = new Map()
  for (const run of sourceRuns) {
    const previous = grouped.get(run.name) || {
      name: run.name,
      detail: run.column,
      type: run.access === 'api-key' ? 'social' : run.access === 'official-page' ? 'official' : run.access === 'html-page' ? 'benchmark' : 'platform',
      influence: run.access === 'official-page' ? 96 : run.access === 'public-api' ? 88 : run.access === 'api-key' ? 76 : 72,
      coverage: 0,
      accent: run.status === 'ok' ? '#16c8be' : run.status === 'skipped' ? '#ffb86b' : '#ff6f6f',
      url: run.url,
      status: run.status,
      lastCheckedAt: generatedAt,
      accessMethod: run.access,
      authRequired: run.access === 'api-key',
      freshnessSla: run.access === 'official-page' ? '30m-1h' : run.access === 'public-api' ? '1h' : run.access === 'api-key' ? '15m-6h' : 'daily',
      weight: run.access === 'official-page' ? 1 : run.access === 'public-api' ? 0.82 : run.access === 'html-page' ? 0.7 : run.access === 'api-key' ? 0.5 : 0.4,
    }
    previous.coverage = Math.max(previous.coverage, run.status === 'ok' ? 88 : run.status === 'skipped' ? 20 : 8)
    previous.status = run.status === 'ok' ? 'ok' : previous.status
    grouped.set(run.name, previous)
  }
  return Array.from(grouped.values()).slice(0, 12)
}

function sourceTypeFromColumn(column) {
  if (column === columns.official) return 'official-confirmation'
  if (column === columns.model) return 'model-capability'
  if (column === columns.agent) return 'agent-capability'
  if (column === columns.tool) return 'tool-ecosystem-heat'
  if (column === columns.research) return 'research-trends'
  if (column === columns.social) return 'early-propagation'
  if (column === '数据库') return 'database'
  return 'other'
}

function freshnessSlaForAccess(access) {
  if (access === 'official-page') return '30m-1h'
  if (access === 'public-api') return '1h'
  if (access === 'api-key') return '15m-6h'
  if (access === 'html-page') return 'daily'
  return 'on-refresh'
}

function weightForAccess(access, column) {
  if (access === 'official-page') return 1
  if (column === columns.model) return 0.88
  if (column === columns.agent) return 0.72
  if (column === columns.tool) return 0.62
  if (column === columns.social) return 0.28
  if (column === columns.research) return 0.46
  if (access === 'database') return 0.4
  return 0.5
}

function requiredEnvForSource(id) {
  if (id === 'x-recent-search') return ['X_BEARER_TOKEN']
  if (id === 'product-hunt') return ['PRODUCT_HUNT_TOKEN']
  if (id === 'artificial-analysis') return ['ARTIFICIAL_ANALYSIS_API_KEY', 'ARTIFICIAL_ANALYSIS_API_URL']
  if (id === 'mysql-database') return ['DATABASE_URL', 'DB_HOST', 'DB_NAME']
  return []
}

function buildSourceDefinitions() {
  const grouped = new Map()
  for (const run of sourceRuns) {
    const previous = grouped.get(run.id) || {
      id: run.id,
      name: run.name,
      url: run.url,
      sourceType: sourceTypeFromColumn(run.column),
      accessMethod: run.access,
      authRequired: run.access === 'api-key' || run.access === 'database',
      weight: weightForAccess(run.access, run.column),
      freshnessSla: freshnessSlaForAccess(run.access),
      status: run.status,
      requiredEnv: requiredEnvForSource(run.id),
      lastCheckedAt: run.checkedAt,
      message: run.message,
      itemCount: 0,
    }

    previous.itemCount += run.itemCount
    previous.lastCheckedAt = run.checkedAt
    previous.message = run.message
    if (run.status === 'ok') previous.status = 'ok'
    else if (previous.status !== 'ok' && run.status === 'error') previous.status = 'error'
    grouped.set(run.id, previous)
  }

  return Array.from(grouped.values()).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ok' ? -1 : b.status === 'ok' ? 1 : 0
    return b.weight - a.weight
  })
}

function buildDataPanels({ openRouter, github, hn, hf, arxiv, agentHealth, xSignals, productHunt, artificial }) {
  const modelItems = [...artificial, ...openRouter, ...hf, ...arxiv].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 8)
  const agentItems = [...agentHealth, ...github.filter((item) => item.query === 'AI Agent'), ...hn.filter((item) => /agent|hammers/i.test(`${item.query} ${item.label}`)), ...xSignals].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 8)
  const toolItems = [...productHunt, ...github.filter((item) => item.query !== 'AI Agent'), ...hn.filter((item) => /mcp|claude code|codex/i.test(`${item.query} ${item.label}`))].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 8)
  const officialItems = officialSources.map((source) => {
    const run = sourceRuns.find((item) => item.id === source.id)
    return {
      label: source.name,
      value: run?.status === 'ok' ? '已连通' : run?.status === 'error' ? '失败' : '待接入',
      note: run?.message || source.url,
      score: run?.status === 'ok' ? 92 : 40,
      url: source.url,
    }
  })

  return [
    {
      id: 'model-rankings',
      title: '模型排行榜',
      description: 'OpenRouter、Artificial Analysis、Hugging Face、arXiv 与官方文档共同组成模型排名。',
      sources: ['OpenRouter', 'Artificial Analysis', 'Hugging Face', 'arXiv', '官方文档'],
      cadence: '6 小时',
      items: modelItems.length ? modelItems : [{ label: '模型榜待刷新', value: '0', note: '运行 npm run refresh:data 后生成', score: 0 }],
    },
    {
      id: 'agent-rankings',
      title: 'Agent 排行榜',
      description: 'Steel、Agent Arena、HAL、SkillsBench、OSWorld/WebArena 与 GitHub 热度共同组成 Agent 榜。',
      sources: ['Steel.dev', 'Agent Arena', 'HAL Princeton', 'SkillsBench', 'OSWorld', 'GitHub', 'HN', 'X'],
      cadence: '每日',
      items: agentItems.length ? agentItems : [{ label: 'Agent 榜待刷新', value: '0', note: '等待公开榜单或 GitHub/HN 数据', score: 0 }],
    },
    {
      id: 'tool-rankings',
      title: '工具 / 插件热度',
      description: 'Product Hunt、GitHub、OSSInsight、HN 与 X 共同计算工具热度，Hammers 类候选会先进入观察池。',
      sources: ['GitHub', 'OSSInsight', 'Product Hunt', 'HN Algolia', 'X'],
      cadence: '1 小时',
      items: toolItems.length ? toolItems : [{ label: '工具榜待刷新', value: '0', note: '等待 Product Hunt / GitHub / HN 数据', score: 0 }],
    },
    {
      id: 'official-releases',
      title: '官网 / 文档发布源',
      description: '官方源负责确认事实，X 和社区源只作为热度辅助，不单独确认发布。',
      sources: ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'DeepSeek', 'Kimi'],
      cadence: '30 分钟',
      items: officialItems,
    },
  ]
}

function buildReleaseFrames(signals) {
  return signals.map((signal) => ({
    name: signal.name,
    provider: signal.provider,
    category: signal.category,
    confidence: signal.confidence,
    window: signal.releaseWindow,
    accent: signal.accent,
  }))
}

function buildDataset(payload) {
  const signals = buildSignals(payload)
  const rankingItems = buildRankingItems(signals, payload.github, payload.agentHealth)
  const sourceHealth = buildSourceHealth()
  const sources = buildSourceDefinitions()
  const dataPanels = buildDataPanels(payload)
  const okRuns = sourceRuns.filter((run) => run.status === 'ok').length
  const databaseStatus = payload.databaseStatus || '未配置'

  return {
    generatedAt,
    stats: {
      totalEntities: new Set([
        ...signals.map((item) => item.id),
        ...rankingItems.map((item) => item.name),
        ...dataPanels.flatMap((panel) => panel.items.map((item) => item.label)),
      ]).size,
      totalSources: sourceRuns.length,
      verifiedSources: okRuns,
      updatedLabel: '实时刷新',
      generatedAt,
      databaseStatus,
    },
    workspaceNav: [
      { label: '情报总览', href: '#overview', legacyHref: '#radar' },
      { label: '信号矩阵', href: '#signals' },
      { label: '模型地图', href: '#model-rankings' },
      { label: 'Agent 市场', href: '#agent-rankings' },
      { label: 'Skill / 插件', href: '#tool-rankings' },
      { label: '数据洞察', href: '#source-runs' },
      { label: '榜单', href: '#rankings' },
      { label: '发布日历', href: '#calendar' },
      { label: '可信来源', href: '#sources' },
      { label: '路线图', href: '#roadmap' },
    ],
    categories: ['全部', '模型', 'AI 编程', 'Agent', 'Skill / 插件', '平台'],
    categoryMeta: {
      全部: { accent: '#10b5ab', soft: 'rgba(18, 195, 185, 0.1)', icon: 'layout-dashboard' },
      模型: { accent: '#16c8be', soft: 'rgba(22, 200, 190, 0.12)', icon: 'sparkles' },
      'AI 编程': { accent: '#4b8cff', soft: 'rgba(75, 140, 255, 0.12)', icon: 'code' },
      Agent: { accent: '#f59e0b', soft: 'rgba(245, 158, 11, 0.14)', icon: 'activity' },
      'Skill / 插件': { accent: '#b07bf7', soft: 'rgba(176, 123, 247, 0.14)', icon: 'layers' },
      平台: { accent: '#ff6fd8', soft: 'rgba(255, 111, 216, 0.12)', icon: 'chart' },
    },
    signals,
    releaseFrames: buildReleaseFrames(signals),
    rankingItems,
    sourceHealth,
    sources,
    sourceRuns,
    dataPanels,
    roadmapItems: [
      { version: 'v1.2', title: '真实数据刷新与 JSON 快照', quarter: 'Q2 2026', status: 'done' },
      { version: 'v1.3', title: 'MySQL 持久化与抓取日志', quarter: 'Q3 2026', status: databaseStatus === '已同步' ? 'done' : 'active' },
      { version: 'v1.4', title: 'Agent 市场和插件生态图', quarter: 'Q3 2026', status: 'active' },
      { version: 'v1.5', title: '智能摘要与异常热度告警', quarter: 'Q4 2026', status: 'planned' },
    ],
    languageOptions: [
      { code: 'zh-CN', label: '简体中文', status: 'active' },
      { code: 'en', label: 'English', status: 'planned' },
      { code: 'ja', label: '日本語', status: 'planned' },
    ],
  }
}

async function writeJson(fileName, data) {
  await mkdir(outputDir, { recursive: true })
  await writeFile(join(outputDir, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function normalizeJdbcMysqlUrl(value) {
  const match = value.match(/^jdbc:mysql:\/\/([^/:?]+)(?::(\d+))?\/([^?]+)(?:\?(.*))?$/)
  if (!match) return null
  const [, host, port = '3306', database] = match
  return { host, port: Number(port), database }
}

function databaseConfig() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const databaseUsername = process.env.DATABASE_USERNAME || process.env.DB_USERNAME || process.env.DB_USER || ''
  const databasePassword = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || ''

  if (databaseUrl.startsWith('jdbc:mysql://')) {
    const parsed = normalizeJdbcMysqlUrl(databaseUrl)
    if (!parsed) return null
    return { ...parsed, user: databaseUsername || 'root', password: databasePassword }
  }

  if (databaseUrl.startsWith('mysql://')) {
    const parsed = new URL(databaseUrl)
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      database: parsed.pathname.replace(/^\//, ''),
      user: decodeURIComponent(parsed.username || databaseUsername || 'root'),
      password: decodeURIComponent(parsed.password || databasePassword),
    }
  }

  const host = process.env.DB_HOST || ''
  const database = process.env.DB_NAME || process.env.DB_DATABASE || ''
  if (!host || !database) return null
  return {
    host,
    port: Number(process.env.DB_PORT || 3306),
    database,
    user: databaseUsername || 'root',
    password: databasePassword,
  }
}

async function syncDatabase(dataset) {
  const config = databaseConfig()
  if (!config) {
    addRun({
      id: 'mysql-database',
      name: 'MySQL 持久化',
      column: '数据库',
      url: 'DATABASE_URL',
      access: 'database',
      status: 'skipped',
      itemCount: 0,
      message: '未配置 DATABASE_URL 或 DB_HOST/DB_NAME，跳过数据库同步',
    })
    return '未配置'
  }

  let mysql
  try {
    mysql = await import('mysql2/promise')
  } catch {
    addRun({
      id: 'mysql-database',
      name: 'MySQL 持久化',
      column: '数据库',
      url: `${config.host}/${config.database}`,
      access: 'database',
      status: 'error',
      itemCount: 0,
      message: '缺少 mysql2 依赖，运行 pnpm add mysql2 或 npm install mysql2',
    })
    return '驱动缺失'
  }

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    charset: 'utf8mb4',
    connectTimeout: 20_000,
  })

  try {
    const schema = await readFile(schemaPath, 'utf8')
    for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
      await connection.query(statement)
    }

    for (const run of sourceRuns) {
      await connection.execute(
        `insert into frontier_source_runs
          (id, source_name, source_column, source_url, access_method, status, item_count, checked_at, message)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)
         on duplicate key update
          source_name = values(source_name),
          source_column = values(source_column),
          source_url = values(source_url),
          access_method = values(access_method),
          status = values(status),
          item_count = values(item_count),
          checked_at = values(checked_at),
          message = values(message)`,
        [hashPayload(`${run.id}|${run.checkedAt}`).slice(0, 32), run.name, run.column, run.url, run.access, run.status, run.itemCount, new Date(run.checkedAt), run.message],
      )
    }

    for (const snapshot of rawSnapshots) {
      await connection.execute(
        `insert into provider_raw_snapshots
          (id, provider, sync_type, request_url, response_sha256, response_body, captured_at, status, message)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)
         on duplicate key update
          response_sha256 = values(response_sha256),
          response_body = values(response_body),
          captured_at = values(captured_at),
          status = values(status),
          message = values(message)`,
        [snapshot.id, snapshot.provider, snapshot.syncType, snapshot.requestUrl, snapshot.responseSha256, snapshot.responseBody, new Date(snapshot.capturedAt), snapshot.status, snapshot.message],
      )
    }

    for (const signal of dataset.signals) {
      await connection.execute(
        `insert into frontier_signals
          (id, provider, signal_name, category, confidence, level_name, summary, release_window, first_seen, last_update, sources_json, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on duplicate key update
          provider = values(provider),
          signal_name = values(signal_name),
          category = values(category),
          confidence = values(confidence),
          level_name = values(level_name),
          summary = values(summary),
          release_window = values(release_window),
          last_update = values(last_update),
          sources_json = values(sources_json),
          updated_at = values(updated_at)`,
        [signal.id, signal.provider, signal.name, signal.category, signal.confidence, signal.level, signal.summary, signal.releaseWindow, signal.firstSeen, signal.lastUpdate, JSON.stringify(signal.sources), new Date(generatedAt)],
      )
    }

    for (const ranking of dataset.rankingItems) {
      await connection.execute(
        `insert into frontier_rankings
          (id, rank_value, item_name, provider, category, score, change_value, kind, source_name, item_url, trend_json, measured_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         on duplicate key update
          rank_value = values(rank_value),
          provider = values(provider),
          category = values(category),
          score = values(score),
          change_value = values(change_value),
          kind = values(kind),
          source_name = values(source_name),
          item_url = values(item_url),
          trend_json = values(trend_json),
          measured_at = values(measured_at)`,
        [
          hashPayload(`${ranking.kind || 'signal'}|${ranking.name}`).slice(0, 32),
          ranking.rank,
          ranking.name,
          ranking.provider,
          ranking.category,
          ranking.score,
          ranking.change,
          ranking.kind || 'signal',
          ranking.source || '',
          ranking.url || '',
          JSON.stringify(ranking.trend),
          new Date(generatedAt),
        ],
      )
    }

    addRun({
      id: 'mysql-database',
      name: 'MySQL 持久化',
      column: '数据库',
      url: `${config.host}/${config.database}`,
      access: 'database',
      status: 'ok',
      itemCount: dataset.signals.length + dataset.rankingItems.length + rawSnapshots.length,
      message: '数据库同步完成',
    })
    return '已同步'
  } catch (error) {
    addRun({
      id: 'mysql-database',
      name: 'MySQL 持久化',
      column: '数据库',
      url: `${config.host}/${config.database}`,
      access: 'database',
      status: 'error',
      itemCount: 0,
      message: error.message,
    })
    return '同步失败'
  } finally {
    await connection.end()
  }
}

async function main() {
  const [
    officialMatchCount,
    openRouter,
    github,
    hn,
    hf,
    arxiv,
    agentHealth,
    xSignals,
    productHunt,
    artificial,
  ] = await Promise.all([
    collectOfficialSources(),
    collectOpenRouterModels(),
    collectGitHubSignals(),
    collectHackerNewsSignals(),
    collectHuggingFaceSignals(),
    collectArxivSignals(),
    collectAgentLeaderboardHealth(),
    collectXSignals(),
    collectProductHuntSignals(),
    collectArtificialAnalysisSignals(),
  ])

  let dataset = buildDataset({
    officialMatchCount,
    openRouter,
    github,
    hn,
    hf,
    arxiv,
    agentHealth,
    xSignals,
    productHunt,
    artificial,
    databaseStatus: '未配置',
  })

  const databaseStatus = await syncDatabase(dataset)
  dataset = buildDataset({
    officialMatchCount,
    openRouter,
    github,
    hn,
    hf,
    arxiv,
    agentHealth,
    xSignals,
    productHunt,
    artificial,
    databaseStatus,
  })

  await writeJson('frontier-intel-data.json', dataset)
  await writeJson('radar-data.json', dataset)
  await writeJson('signals.json', dataset.signals)
  await writeJson('sources.json', dataset.sources)
  await writeJson('model-rankings.json', dataset.dataPanels.find((panel) => panel.id === 'model-rankings'))
  await writeJson('agent-rankings.json', dataset.dataPanels.find((panel) => panel.id === 'agent-rankings'))
  await writeJson('tool-rankings.json', dataset.dataPanels.find((panel) => panel.id === 'tool-rankings'))
  await writeJson('source-runs.json', dataset.sourceRuns)
  await writeJson('raw-snapshots.index.json', rawSnapshots.map((snapshot) => {
    const { responseBody: _responseBody, ...summary } = snapshot
    return summary
  }))

  console.log(`Frontier Intel data refreshed: signals=${dataset.signals.length}, rankings=${dataset.rankingItems.length}, sources=${dataset.sourceRuns.length}, database=${databaseStatus}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
