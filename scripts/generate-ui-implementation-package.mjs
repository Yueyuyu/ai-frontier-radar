import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
const packageDir = join(repoRoot, 'docs', 'ui-implementation-package')
const fixtureDir = join(packageDir, 'fixtures')
const screenSpecDir = join(packageDir, 'screen-specs')
const referenceDir = join(repoRoot, 'reference-ui')
const referenceAssetDir = join(referenceDir, 'assets')

const updatedAt = '2026-06-30'

const designTokens = {
  schemaVersion: '1.0.0',
  updatedAt,
  product: {
    name: 'AI 前沿情报站',
    englishName: 'Frontier Intel',
    theme: 'light workspace intelligence console',
  },
  colors: {
    page: '#f6fbff',
    pageTint: '#edf8ff',
    surface: '#ffffff',
    surfaceSoft: '#f9fdff',
    surfaceGlass: 'rgba(255, 255, 255, 0.82)',
    line: 'rgba(122, 153, 180, 0.24)',
    lineStrong: 'rgba(83, 126, 160, 0.34)',
    textStrong: '#0b1d35',
    textBody: '#52657b',
    textMuted: '#8798ab',
    teal: '#17c9c0',
    tealSoft: '#dcfbf8',
    blue: '#3d8cff',
    blueSoft: '#e3f0ff',
    coral: '#ff7c4d',
    coralSoft: '#fff0e9',
    purple: '#9b6df5',
    purpleSoft: '#f0eaff',
    green: '#33bf7a',
    greenSoft: '#e7f9ef',
    warning: '#f7a928',
    warningSoft: '#fff5df',
    danger: '#ec5f67',
    dangerSoft: '#ffecef',
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
    pageTitle: { size: 32, lineHeight: 40, weight: 800 },
    sectionTitle: { size: 20, lineHeight: 28, weight: 760 },
    cardTitle: { size: 16, lineHeight: 24, weight: 720 },
    body: { size: 14, lineHeight: 22, weight: 500 },
    meta: { size: 12, lineHeight: 18, weight: 600 },
    control: { size: 13, lineHeight: 18, weight: 700 },
  },
  spacing: {
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
  },
  radius: {
    control: '8px',
    card: '8px',
    panel: '12px',
    drawer: '20px',
    pill: '999px',
  },
  shadow: {
    panel: '0 18px 42px rgba(70, 112, 145, 0.13)',
    focus: '0 0 0 3px rgba(23, 201, 192, 0.18)',
  },
  layout: {
    desktop: {
      width: 1440,
      minHeight: 960,
      sidebar: 232,
      contentMax: 1180,
      gutter: 24,
      rightInspector: 320,
    },
    tablet: { breakpoint: 900, gutter: 20 },
    mobile: {
      width: 390,
      minHeight: 844,
      gutter: 16,
      bottomNavHeight: 68,
      drawerRadius: 20,
    },
  },
}

const fixture = {
  schemaVersion: '1.0.0',
  updatedAt,
  note: 'UI 还原专用固定 fixture。内容用于布局、状态和视觉密度校准，不作为事实来源。',
  product: designTokens.product,
  stats: {
    signalCount: 12,
    connectedSources: 31,
    freshness: '26 分钟前',
    databaseStatus: '未配置',
    highTrustSignals: 7,
    skippedSources: 3,
  },
  categories: [
    { id: 'model', label: '模型', color: 'teal' },
    { id: 'agent', label: 'Agent', color: 'blue' },
    { id: 'tool', label: '工具', color: 'purple' },
    { id: 'plugin', label: 'Skill / 插件', color: 'coral' },
    { id: 'research', label: '研究趋势', color: 'green' },
  ],
  signals: [
    {
      id: 'sig-openai-model-preview',
      title: 'OpenAI 模型预览进入高可信观察',
      entity: 'OpenAI frontier model',
      category: 'model',
      confidence: 0.94,
      heatScore: 91,
      trustBand: 'high',
      sourceCount: 4,
      releaseWindow: '24h',
      summary: '官方页面、API 变更和模型聚合源同时出现变化，进入发布窗口观察。',
      sources: ['openai-news', 'openai-api-changelog', 'openrouter-models', 'hn-algolia'],
    },
    {
      id: 'sig-claude-code-workflow',
      title: 'Claude Code 工作流能力信号增强',
      entity: 'Claude Code',
      category: 'agent',
      confidence: 0.88,
      heatScore: 84,
      trustBand: 'high',
      sourceCount: 3,
      releaseWindow: '48h',
      summary: 'release notes、开发者讨论和 benchmark 目录均有新增记录。',
      sources: ['anthropic-release-notes', 'skillsbench', 'github-rest'],
    },
    {
      id: 'sig-gemini-api-window',
      title: 'Gemini API 文档窗口出现模型参数变化',
      entity: 'Gemini API',
      category: 'model',
      confidence: 0.82,
      heatScore: 76,
      trustBand: 'medium',
      sourceCount: 3,
      releaseWindow: '72h',
      summary: '官方 changelog 和 OpenRouter 上下文字段出现同步更新。',
      sources: ['gemini-api-changelog', 'openrouter-models', 'huggingface-hub'],
    },
    {
      id: 'sig-agent-leaderboard-refresh',
      title: 'Agent benchmark 榜单刷新',
      entity: 'Agent benchmark cluster',
      category: 'agent',
      confidence: 0.79,
      heatScore: 72,
      trustBand: 'medium',
      sourceCount: 5,
      releaseWindow: 'weekly',
      summary: 'Steel、Agent Arena、HAL 与 OSWorld 的可访问性健康状态正常。',
      sources: ['steel-leaderboard', 'agent-arena', 'hal-princeton', 'osworld', 'webarena'],
    },
    {
      id: 'sig-mcp-directory-growth',
      title: 'MCP 与 Skill 生态热度连续上升',
      entity: 'MCP / Skills ecosystem',
      category: 'plugin',
      confidence: 0.74,
      heatScore: 69,
      trustBand: 'medium',
      sourceCount: 4,
      releaseWindow: 'weekly',
      summary: 'GitHub 搜索、HN 讨论和产品目录源同时增长，但仍需官方仓库确认。',
      sources: ['github-rest', 'ossinsight', 'hn-algolia', 'product-hunt'],
    },
    {
      id: 'sig-openrouter-context',
      title: 'OpenRouter 模型上下文窗口变化',
      entity: 'OpenRouter catalog',
      category: 'model',
      confidence: 0.81,
      heatScore: 66,
      trustBand: 'medium',
      sourceCount: 2,
      releaseWindow: '24h',
      summary: '模型目录中的上下文和定价字段变化，需要与官方文档交叉确认。',
      sources: ['openrouter-models', 'provider-docs'],
    },
    {
      id: 'sig-hf-download-spike',
      title: 'Hugging Face 下载量异常增长',
      entity: 'Open model cluster',
      category: 'research',
      confidence: 0.68,
      heatScore: 71,
      trustBand: 'watch',
      sourceCount: 2,
      releaseWindow: 'weekly',
      summary: '下载量和 likes 上升，作为生态热度，不直接确认模型发布。',
      sources: ['huggingface-hub', 'github-rest'],
    },
    {
      id: 'sig-product-hunt-tool',
      title: 'AI 工具新品热度进入观察池',
      entity: 'AI tool launch',
      category: 'tool',
      confidence: 0.61,
      heatScore: 63,
      trustBand: 'watch',
      sourceCount: 2,
      releaseWindow: '72h',
      summary: 'Product Hunt 和 HN 有早期热度，需要官网或 GitHub 进一步确认。',
      sources: ['product-hunt', 'hn-algolia'],
    },
    {
      id: 'sig-x-rumor-muted',
      title: 'X 传播信号被降权',
      entity: 'Rumor cluster',
      category: 'tool',
      confidence: 0.36,
      heatScore: 58,
      trustBand: 'low',
      sourceCount: 1,
      releaseWindow: 'watch',
      summary: '只有 X 热度，缺少官网、文档、API 或 GitHub 证据，不进入事实确认。',
      sources: ['x-recent-search'],
    },
    {
      id: 'sig-arxiv-agent-paper',
      title: 'Agent 评测论文新增引用',
      entity: 'Agent evaluation papers',
      category: 'research',
      confidence: 0.67,
      heatScore: 57,
      trustBand: 'watch',
      sourceCount: 2,
      releaseWindow: 'weekly',
      summary: 'arXiv 与 Semantic Scholar 方向一致，用于研究趋势，不直接影响发布日历。',
      sources: ['arxiv-api', 'semantic-scholar'],
    },
    {
      id: 'sig-github-coding-agent',
      title: 'Coding Agent 仓库活跃度上升',
      entity: 'Coding Agent repos',
      category: 'agent',
      confidence: 0.72,
      heatScore: 64,
      trustBand: 'medium',
      sourceCount: 3,
      releaseWindow: 'weekly',
      summary: 'GitHub stars、release 与 HN 讨论同步上升，等待 benchmark 确认。',
      sources: ['github-rest', 'hn-algolia', 'ossinsight'],
    },
    {
      id: 'sig-source-health-warning',
      title: '部分商业 API 来源待配置',
      entity: 'Source credentials',
      category: 'tool',
      confidence: 0.9,
      heatScore: 45,
      trustBand: 'system',
      sourceCount: 1,
      releaseWindow: 'now',
      summary: 'Artificial Analysis、Product Hunt、X 需要环境变量后才能进入完整刷新。',
      sources: ['source-run-log'],
    },
  ],
  rankingItems: [
    {
      id: 'rank-openai-frontier',
      kind: 'model',
      name: 'OpenAI frontier model',
      provider: 'OpenAI',
      score: 94,
      rank: 1,
      change: '+2',
      basis: '官方确认、API 可用性、OpenRouter 覆盖',
    },
    {
      id: 'rank-gemini-api',
      kind: 'model',
      name: 'Gemini API model',
      provider: 'Google',
      score: 88,
      rank: 2,
      change: '+1',
      basis: 'Gemini changelog、模型目录、生态热度',
    },
    {
      id: 'rank-claude-code',
      kind: 'agent',
      name: 'Claude Code',
      provider: 'Anthropic',
      score: 86,
      rank: 1,
      change: '+3',
      basis: 'release notes、SkillsBench、开发者活跃度',
    },
    {
      id: 'rank-agent-benchmark',
      kind: 'agent',
      name: 'Browser / computer-use agents',
      provider: 'Benchmark cluster',
      score: 81,
      rank: 2,
      change: '0',
      basis: 'Steel、Agent Arena、HAL、OSWorld、WebArena',
    },
    {
      id: 'rank-mcp-ecosystem',
      kind: 'tool',
      name: 'MCP / Skill ecosystem',
      provider: 'Open ecosystem',
      score: 79,
      rank: 1,
      change: '+5',
      basis: 'GitHub、OSSInsight、HN、目录站',
    },
    {
      id: 'rank-coding-agent-tools',
      kind: 'tool',
      name: 'Coding Agent tools',
      provider: 'GitHub ecosystem',
      score: 74,
      rank: 2,
      change: '+1',
      basis: 'GitHub 28 天增长、release 活跃、HN 讨论',
    },
  ],
  sourceHealth: [
    {
      id: 'openai-news',
      name: 'OpenAI News',
      group: '官方确认',
      status: 'healthy',
      accessMethod: 'official-page',
      authRequired: false,
      weight: 1,
      freshnessSla: '30m-1h',
      lastChecked: '2026-06-30T12:40:00+08:00',
      coverage: 94,
    },
    {
      id: 'openai-api-changelog',
      name: 'OpenAI API Changelog',
      group: '官方确认',
      status: 'healthy',
      accessMethod: 'official-page',
      authRequired: false,
      weight: 1,
      freshnessSla: '30m-1h',
      lastChecked: '2026-06-30T12:42:00+08:00',
      coverage: 92,
    },
    {
      id: 'openrouter-models',
      name: 'OpenRouter Models API',
      group: '模型能力',
      status: 'healthy',
      accessMethod: 'public-api',
      authRequired: false,
      weight: 0.86,
      freshnessSla: '1h',
      lastChecked: '2026-06-30T12:38:00+08:00',
      coverage: 89,
    },
    {
      id: 'artificial-analysis',
      name: 'Artificial Analysis API',
      group: '模型能力',
      status: 'skipped',
      accessMethod: 'api-key',
      authRequired: true,
      requiredEnv: ['ARTIFICIAL_ANALYSIS_API_KEY', 'ARTIFICIAL_ANALYSIS_API_URL'],
      weight: 0.9,
      freshnessSla: '6h',
      lastChecked: '2026-06-30T12:35:00+08:00',
      coverage: 0,
    },
    {
      id: 'steel-leaderboard',
      name: 'Steel.dev Agent Leaderboards',
      group: 'Agent 能力',
      status: 'healthy',
      accessMethod: 'html-page',
      authRequired: false,
      weight: 0.72,
      freshnessSla: 'daily',
      lastChecked: '2026-06-30T12:32:00+08:00',
      coverage: 76,
    },
    {
      id: 'agent-arena',
      name: 'Agent Arena',
      group: 'Agent 能力',
      status: 'healthy',
      accessMethod: 'html-page',
      authRequired: false,
      weight: 0.72,
      freshnessSla: 'daily',
      lastChecked: '2026-06-30T12:33:00+08:00',
      coverage: 74,
    },
    {
      id: 'skillsbench',
      name: 'SkillsBench',
      group: 'Agent 能力',
      status: 'healthy',
      accessMethod: 'html-page',
      authRequired: false,
      weight: 0.7,
      freshnessSla: 'daily',
      lastChecked: '2026-06-30T12:30:00+08:00',
      coverage: 71,
    },
    {
      id: 'github-rest',
      name: 'GitHub REST API',
      group: '工具与生态热度',
      status: 'healthy',
      accessMethod: 'public-api',
      authRequired: false,
      weight: 0.62,
      freshnessSla: '1h',
      lastChecked: '2026-06-30T12:45:00+08:00',
      coverage: 82,
    },
    {
      id: 'product-hunt',
      name: 'Product Hunt API',
      group: '工具与生态热度',
      status: 'skipped',
      accessMethod: 'api-key',
      authRequired: true,
      requiredEnv: ['PRODUCT_HUNT_TOKEN'],
      weight: 0.54,
      freshnessSla: '6h',
      lastChecked: '2026-06-30T12:36:00+08:00',
      coverage: 0,
    },
    {
      id: 'hn-algolia',
      name: 'HN Algolia API',
      group: '早期传播',
      status: 'healthy',
      accessMethod: 'public-api',
      authRequired: false,
      weight: 0.44,
      freshnessSla: '30m',
      lastChecked: '2026-06-30T12:44:00+08:00',
      coverage: 68,
    },
    {
      id: 'x-recent-search',
      name: 'X Recent Search',
      group: '早期传播',
      status: 'skipped',
      accessMethod: 'api-key',
      authRequired: true,
      requiredEnv: ['X_BEARER_TOKEN'],
      weight: 0.28,
      freshnessSla: '15m',
      lastChecked: '2026-06-30T12:36:00+08:00',
      coverage: 0,
    },
    {
      id: 'arxiv-api',
      name: 'arXiv API',
      group: '研究趋势',
      status: 'healthy',
      accessMethod: 'public-api',
      authRequired: false,
      weight: 0.46,
      freshnessSla: '6h',
      lastChecked: '2026-06-30T12:31:00+08:00',
      coverage: 57,
    },
  ],
  sourceRuns: [
    {
      id: 'run-openai-news',
      sourceId: 'openai-news',
      status: 'success',
      itemCount: 12,
      latencyMs: 842,
      finishedAt: '2026-06-30T12:40:00+08:00',
    },
    {
      id: 'run-openrouter',
      sourceId: 'openrouter-models',
      status: 'success',
      itemCount: 221,
      latencyMs: 1260,
      finishedAt: '2026-06-30T12:38:00+08:00',
    },
    {
      id: 'run-artificial-analysis',
      sourceId: 'artificial-analysis',
      status: 'skipped',
      itemCount: 0,
      latencyMs: 0,
      finishedAt: '2026-06-30T12:35:00+08:00',
      reason: '缺少 ARTIFICIAL_ANALYSIS_API_KEY 或 ARTIFICIAL_ANALYSIS_API_URL',
    },
    {
      id: 'run-product-hunt',
      sourceId: 'product-hunt',
      status: 'skipped',
      itemCount: 0,
      latencyMs: 0,
      finishedAt: '2026-06-30T12:36:00+08:00',
      reason: '缺少 PRODUCT_HUNT_TOKEN',
    },
    {
      id: 'run-x',
      sourceId: 'x-recent-search',
      status: 'skipped',
      itemCount: 0,
      latencyMs: 0,
      finishedAt: '2026-06-30T12:36:00+08:00',
      reason: '缺少 X_BEARER_TOKEN',
    },
  ],
  releaseFrames: [
    {
      id: 'release-openai-window',
      date: '2026-06-30',
      label: '官方 / API 窗口',
      confidence: 'high',
      items: ['OpenAI API changelog', 'OpenRouter model field change'],
    },
    {
      id: 'release-gemini-window',
      date: '2026-07-01',
      label: '模型文档变化',
      confidence: 'medium',
      items: ['Gemini API changelog', 'HF ecosystem heat'],
    },
    {
      id: 'release-rumor-window',
      date: '2026-07-02',
      label: '传播观察',
      confidence: 'low',
      items: ['X discussion only', '等待官网或文档确认'],
    },
  ],
  roadmapItems: [
    {
      id: 'phase-0',
      title: 'UI 还原实施包',
      status: 'in-progress',
      progress: 65,
      impact: ['screen specs', 'reference-ui', 'fixture'],
    },
    {
      id: 'phase-1',
      title: '数据契约与命名迁移',
      status: 'next',
      progress: 20,
      impact: ['types', 'dataRuntime', 'frontier-intel-data.json'],
    },
    {
      id: 'phase-2',
      title: '多源刷新脚本',
      status: 'next',
      progress: 15,
      impact: ['refresh-data', 'sources', 'source-runs'],
    },
    {
      id: 'phase-3',
      title: '前端工作台页面',
      status: 'planned',
      progress: 5,
      impact: ['React shell', '10 pages', 'mobile'],
    },
  ],
  dataPanels: [
    { id: 'frontier-intel-data', file: 'public/data/frontier-intel-data.json', status: 'target', owner: 'refresh:data' },
    { id: 'signals', file: 'public/data/signals.json', status: 'target', owner: 'refresh:data' },
    { id: 'sources', file: 'public/data/sources.json', status: 'target', owner: 'refresh:data' },
    { id: 'source-runs', file: 'public/data/source-runs.json', status: 'target', owner: 'refresh:data' },
    { id: 'radar-data', file: 'public/data/radar-data.json', status: 'compatibility fallback', owner: 'refresh:data' },
  ],
  missingCredentials: [
    { env: 'ARTIFICIAL_ANALYSIS_API_KEY', source: 'Artificial Analysis API', requiredFor: '模型能力榜' },
    { env: 'PRODUCT_HUNT_TOKEN', source: 'Product Hunt API', requiredFor: '工具新品热度' },
    { env: 'X_BEARER_TOKEN', source: 'X Recent Search', requiredFor: '早期传播' },
  ],
}

const screens = [
  {
    id: '00-coverage-map',
    title: '设计覆盖说明',
    route: 'internal://coverage-map',
    kind: 'archive',
    image: 'design-concepts/complete-ui/pages/00-coverage-map.png',
    purpose: '说明页面覆盖、来源分层、前端还原依据和禁止项。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop-archive' },
    components: ['CoverageMatrix', 'SourceGroupLegend', 'ImplementationInputs', 'DoNotUseList'],
  },
  {
    id: '01-overview',
    title: '情报总览',
    route: '#overview',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/01-overview.png',
    purpose: '用 KPI、信号矩阵、详情 Inspector 和来源健康展示今日 AI 前沿变化。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['KpiStrip', 'SignalMatrix', 'SignalInspector', 'SignalFeed', 'RankingDelta', 'SourceHealthPanel'],
  },
  {
    id: '02-signal-feed',
    title: '前沿信号流',
    route: '#signals',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/02-signal-feed.png',
    purpose: '支持筛选、搜索、按可信度查看信号，并打开证据链详情。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['SignalFilterBar', 'SignalList', 'EvidenceChain', 'DegradedDataBanner', 'EmptyState'],
  },
  {
    id: '03-model-map',
    title: '模型地图',
    route: '#model-rankings',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/03-model-map.png',
    purpose: '展示模型供应商、能力维度、API 可用性、价格上下文和榜单变化。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['ModelKpis', 'RankingTable', 'CapabilityGrid', 'ProviderCoverage', 'SourceHealthPanel'],
  },
  {
    id: '04-agent-market',
    title: 'Agent 市场',
    route: '#agent-rankings',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/04-agent-market.png',
    purpose: '跟踪浏览器、代码、电脑使用和研究 Agent 的 benchmark 与市场信号。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['AgentCapabilityBoard', 'BenchmarkTable', 'SourceCoverage', 'SignalList'],
  },
  {
    id: '05-skill-plugin',
    title: 'Skill / 插件',
    route: '#tool-rankings',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/05-skill-plugin.png',
    purpose: '展示 MCP Server、Agent Skill、连接器和插件生态热度。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['ToolHeatMap', 'EcosystemRanking', 'SourceDistribution', 'SignalList'],
  },
  {
    id: '06-data-operations',
    title: '数据洞察',
    route: '#source-runs',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/06-data-operations.png',
    purpose: '展示刷新状态、数据库状态、缺失密钥、数据文件和失败原因。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['DatabaseStatus', 'MissingCredentialList', 'DataFileGrid', 'SourceRunTable'],
  },
  {
    id: '07-rankings',
    title: '榜单',
    route: '#rankings',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/07-rankings.png',
    purpose: '统一展示模型、Agent、工具和插件榜单，说明评分构成。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['SegmentedControl', 'RankingTable', 'ScoreBreakdown', 'TrendSparkline'],
  },
  {
    id: '08-release-calendar',
    title: '发布日历',
    route: '#calendar',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/08-release-calendar.png',
    purpose: '按时间窗口展示发布、文档、API、榜单和低可信传播事件。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['ReleaseTimeline', 'CalendarWindow', 'TrustLegend', 'EvidenceList'],
  },
  {
    id: '09-trusted-sources',
    title: '可信来源',
    route: '#sources',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/09-trusted-sources.png',
    purpose: '展示来源目录、分组、健康状态、权重、SLA 和最近抓取结果。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['SourceDirectory', 'SourceGroupTabs', 'HealthMetricGrid', 'SourceDetailPanel'],
  },
  {
    id: '10-roadmap',
    title: '路线图',
    route: '#roadmap',
    kind: 'page',
    image: 'design-concepts/complete-ui/pages/10-roadmap.png',
    purpose: '展示前后端落地阶段、状态、影响页面和验收节点。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop' },
    components: ['RoadmapList', 'PhaseCard', 'AcceptanceChecklist', 'ImpactTags'],
  },
  {
    id: '11-mobile-390',
    title: '移动端 390px',
    route: 'responsive://390',
    kind: 'responsive',
    image: 'design-concepts/complete-ui/pages/11-mobile-390.png',
    purpose: '定义移动端顶部栏、信号卡、底部导航和详情抽屉的还原标准。',
    viewport: { width: 390, minHeight: 844, mode: 'mobile' },
    components: ['MobileTopBar', 'MobileSignalCard', 'MobileBottomNav', 'MobileDetailDrawer'],
  },
  {
    id: '12-components-states',
    title: '组件与状态板',
    route: 'internal://components-states',
    kind: 'archive',
    image: 'design-concepts/complete-ui/pages/12-components-states.png',
    purpose: '定义按钮、筛选、徽标、卡片、证据、loading、空结果、失败、缺密钥和降级状态。',
    viewport: { width: 1440, minHeight: 960, mode: 'desktop-archive' },
    components: ['Buttons', 'FilterChips', 'StatusBadge', 'SignalCard', 'EvidenceCard', 'LoadingState', 'EmptyState', 'ErrorState'],
  },
]

const pageNav = screens.filter((screen) => screen.kind === 'page')

function writeJson(path, value) {
  return writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function labelForCategory(category) {
  return fixture.categories.find((item) => item.id === category)?.label ?? category
}

function statusLabel(status) {
  return {
    healthy: '健康',
    skipped: '待配置',
    failed: '失败',
    success: '成功',
  }[status] ?? status
}

function trustLabel(trustBand) {
  return {
    high: '高可信',
    medium: '中可信',
    watch: '观察',
    low: '低可信',
    system: '系统',
  }[trustBand] ?? trustBand
}

function sourceById(id) {
  return fixture.sourceHealth.find((source) => source.id === id)
}

function createScreenSpec(screen) {
  return {
    schemaVersion: '1.0.0',
    updatedAt,
    id: screen.id,
    title: screen.title,
    route: screen.route,
    purpose: screen.purpose,
    referenceImage: screen.image,
    fixture: 'docs/ui-implementation-package/fixtures/frontier-intel-fixture.json',
    designTokens: 'docs/ui-implementation-package/design-tokens.json',
    staticReference: `reference-ui/${screen.id}.html`,
    viewport: screen.viewport,
    layoutGrid:
      screen.viewport.mode === 'mobile'
        ? {
            columns: 1,
            gutter: 16,
            safeArea: 'top 16px, bottom 80px',
            fixedRegions: ['MobileTopBar', 'MobileBottomNav'],
          }
        : {
            columns: 12,
            gutter: 24,
            sidebar: '232px',
            content: 'minmax(0, 1fr)',
            rightRail: screen.id === '01-overview' || screen.id === '02-signal-feed' ? '320px' : 'optional',
          },
    regions:
      screen.viewport.mode === 'mobile'
        ? [
            { id: 'mobile-topbar', role: '品牌、搜索入口、刷新状态', height: '64px' },
            { id: 'mobile-content', role: '单列信号卡和核心数据', width: '100%' },
            { id: 'mobile-drawer', role: '详情和证据链', behavior: '从底部弹出，圆角 20px' },
            { id: 'mobile-bottom-nav', role: '4 项主导航', height: '68px' },
          ]
        : [
            { id: 'sidebar', role: '全局导航', width: '232px' },
            { id: 'command-bar', role: '搜索、刷新状态、语言和外链', height: '72px' },
            { id: 'main-content', role: '页面主工作区', width: 'fluid' },
            { id: 'right-context', role: '详情、来源、状态或说明', width: '320px optional' },
          ],
    components: screen.components.map((name) => ({
      name,
      contract: '组件尺寸、状态和数据字段以本 screen spec、fixture、reference-ui 为准。',
    })),
    dataBindings: {
      stats: 'fixture.stats',
      signals: 'fixture.signals',
      rankingItems: 'fixture.rankingItems',
      sourceHealth: 'fixture.sourceHealth',
      sourceRuns: 'fixture.sourceRuns',
      releaseFrames: 'fixture.releaseFrames',
      roadmapItems: 'fixture.roadmapItems',
    },
    states: [
      { id: 'normal', description: '有数据且来源健康。' },
      { id: 'loading', description: '骨架屏保留布局高度，不造成跳动。' },
      { id: 'empty', description: '筛选无结果时显示清空筛选入口。' },
      { id: 'degraded', description: '远程数据不可用或部分来源缺密钥时显示降级提示。' },
      { id: 'error', description: '来源失败时显示来源、错误原因和最后检查时间。' },
    ],
    interactions: [
      '点击导航切换 hash 路由，旧 #radar 映射到 #overview。',
      '点击信号卡打开详情 Inspector 或移动端底部抽屉。',
      '筛选和搜索只改变当前页数据视图，不修改原始 fixture。',
      '来源、证据链和健康状态必须可见，不隐藏到后台。',
    ],
    acceptanceChecklist: [
      '页面使用浅色系统主题，不出现暗色整页背景。',
      '不出现雷达、靶心、扫描、中心放射或中心 hub 视觉。',
      '首屏是可操作工作台，不是营销式 hero。',
      '所有关键卡片能追溯到 fixture 字段或真实数据字段。',
      '来源健康、证据链、缺失密钥或降级数据状态至少有一个显性入口。',
      'React 实现截图需与 reference-ui 结构一致，再和 imagegen 图做视觉对照。',
    ],
  }
}

function badge(text, tone = 'teal') {
  return `<span class="badge badge-${tone}">${escapeHtml(text)}</span>`
}

function navHtml(activeId) {
  return pageNav
    .map(
      (screen) =>
        `<a class="nav-item ${screen.id === activeId ? 'is-active' : ''}" href="${screen.id}.html"><span>${escapeHtml(
          screen.title,
        )}</span><small>${escapeHtml(screen.route)}</small></a>`,
    )
    .join('\n')
}

function kpiCards() {
  return [
    ['高可信信号', fixture.stats.highTrustSignals, '官方 / API / 榜单交叉确认', 'teal'],
    ['来源覆盖', fixture.stats.connectedSources, '健康与待配置来源并列展示', 'blue'],
    ['最近刷新', fixture.stats.freshness, '固定刷新状态区域', 'green'],
    ['数据库状态', fixture.stats.databaseStatus, '缺省也必须可见', 'warning'],
  ]
    .map(
      ([label, value, caption, tone]) => `<article class="metric-card">
        <span class="metric-label">${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <p>${escapeHtml(caption)}</p>
        <i class="metric-dot dot-${tone}"></i>
      </article>`,
    )
    .join('\n')
}

function signalCard(signal, compact = false) {
  const tone = signal.trustBand === 'high' ? 'teal' : signal.trustBand === 'medium' ? 'blue' : signal.trustBand === 'low' ? 'danger' : 'warning'
  return `<article class="signal-card ${compact ? 'is-compact' : ''}">
    <div class="signal-card-head">
      ${badge(labelForCategory(signal.category), signal.category === 'agent' ? 'blue' : signal.category === 'plugin' ? 'coral' : signal.category === 'research' ? 'green' : 'teal')}
      ${badge(trustLabel(signal.trustBand), tone)}
    </div>
    <h3>${escapeHtml(signal.title)}</h3>
    <p>${escapeHtml(signal.summary)}</p>
    <div class="signal-meta">
      <span>${escapeHtml(signal.entity)}</span>
      <span>${Math.round(signal.confidence * 100)}%</span>
      <span>${signal.sourceCount} 个来源</span>
    </div>
  </article>`
}

function inspectorHtml(signal = fixture.signals[0]) {
  const evidence = signal.sources
    .map((id) => sourceById(id))
    .filter(Boolean)
    .slice(0, 4)
    .map(
      (source) => `<li>
        <strong>${escapeHtml(source.name)}</strong>
        <span>${escapeHtml(source.group)} / ${escapeHtml(statusLabel(source.status))}</span>
      </li>`,
    )
    .join('\n')
  return `<aside class="inspector">
    <div class="section-kicker">信号详情</div>
    <h2>${escapeHtml(signal.entity)}</h2>
    <p>${escapeHtml(signal.summary)}</p>
    <div class="confidence">
      <strong>${Math.round(signal.confidence * 100)}%</strong>
      <span>可信度</span>
    </div>
    <h3>证据链</h3>
    <ul class="evidence-list">${evidence}</ul>
  </aside>`
}

function rankingTable(kind = 'all') {
  const items = kind === 'all' ? fixture.rankingItems : fixture.rankingItems.filter((item) => item.kind === kind)
  return `<table class="data-table">
    <thead><tr><th>排名</th><th>对象</th><th>类型</th><th>分数</th><th>变化</th><th>依据</th></tr></thead>
    <tbody>
      ${items
        .map(
          (item) => `<tr>
            <td>#${item.rank}</td>
            <td><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.provider)}</span></td>
            <td>${badge(item.kind, item.kind === 'agent' ? 'blue' : item.kind === 'tool' ? 'purple' : 'teal')}</td>
            <td>${item.score}</td>
            <td>${escapeHtml(item.change)}</td>
            <td>${escapeHtml(item.basis)}</td>
          </tr>`,
        )
        .join('\n')}
    </tbody>
  </table>`
}

function rankingCards(items = fixture.rankingItems) {
  return `<div class="ranking-list">
    ${items
      .map(
        (item) => `<article class="ranking-mini-card">
          <span>#${item.rank}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(item.provider)} · ${item.score} · ${escapeHtml(item.change)}</small>
        </article>`,
      )
      .join('\n')}
  </div>`
}

function sourceGrid(filterGroup = '') {
  const sources = filterGroup ? fixture.sourceHealth.filter((source) => source.group === filterGroup) : fixture.sourceHealth
  return `<div class="source-grid">
    ${sources
      .map(
        (source) => `<article class="source-card">
          <div class="source-head">
            <strong>${escapeHtml(source.name)}</strong>
            ${badge(statusLabel(source.status), source.status === 'healthy' ? 'green' : 'warning')}
          </div>
          <p>${escapeHtml(source.group)} / ${escapeHtml(source.accessMethod)} / 权重 ${source.weight}</p>
          <div class="progress"><span style="width:${source.coverage}%"></span></div>
          <small>SLA ${escapeHtml(source.freshnessSla)} · ${escapeHtml(source.lastChecked)}</small>
        </article>`,
      )
      .join('\n')}
  </div>`
}

function sourceRunTable() {
  return `<table class="data-table">
    <thead><tr><th>来源</th><th>状态</th><th>数量</th><th>耗时</th><th>原因</th></tr></thead>
    <tbody>
      ${fixture.sourceRuns
        .map((run) => {
          const source = sourceById(run.sourceId)
          return `<tr>
            <td><strong>${escapeHtml(source?.name ?? run.sourceId)}</strong><span>${escapeHtml(run.finishedAt)}</span></td>
            <td>${badge(statusLabel(run.status), run.status === 'success' ? 'green' : 'warning')}</td>
            <td>${run.itemCount}</td>
            <td>${run.latencyMs}ms</td>
            <td>${escapeHtml(run.reason ?? '正常完成')}</td>
          </tr>`
        })
        .join('\n')}
    </tbody>
  </table>`
}

function pageShell(screen, content, aside = '') {
  const isMobile = screen.viewport.mode === 'mobile'
  if (isMobile) {
    return htmlDocument(
      screen,
      `<main class="mobile-canvas">
        <header class="mobile-topbar"><strong>AI 前沿情报站</strong><span>26 分钟前</span></header>
        ${content}
        <nav class="mobile-bottom-nav"><span>总览</span><span>信号</span><span>榜单</span><span>来源</span></nav>
      </main>`,
    )
  }

  return htmlDocument(
    screen,
    `<div class="app-shell">
      <aside class="sidebar">
        <div class="brand-mark"><span>FI</span><strong>AI 前沿情报站</strong><small>Frontier Intel</small></div>
        <nav class="nav-list">${navHtml(screen.id)}</nav>
      </aside>
      <main class="workspace">
        <header class="command-bar">
          <div>
            <span class="section-kicker">Frontier Intel</span>
            <h1>${escapeHtml(screen.title)}</h1>
          </div>
          <div class="command-actions">
            ${badge('来源健康', 'teal')}
            ${badge('证据链', 'blue')}
            <span class="search-box">搜索模型、Agent、工具、来源</span>
          </div>
        </header>
        <!-- reference image: ${escapeHtml(screen.image)}; fixture: docs/ui-implementation-package/fixtures/frontier-intel-fixture.json -->
        ${content}
      </main>
      ${aside}
    </div>`,
  )
}

function htmlDocument(screen, body) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(screen.title)} - Frontier Intel Reference UI</title>
  <link rel="stylesheet" href="assets/reference-ui.css">
</head>
<body>
${body}
</body>
</html>
`
}

function coverageContent() {
  const rows = screens
    .map(
      (screen) => `<tr>
        <td>${escapeHtml(screen.id)}</td>
        <td><strong>${escapeHtml(screen.title)}</strong><span>${escapeHtml(screen.route)}</span></td>
        <td>${escapeHtml(screen.purpose)}</td>
        <td>${screen.components.map((name) => badge(name, 'blue')).join(' ')}</td>
      </tr>`,
    )
    .join('\n')
  return `<section class="panel">
    <h2>设计覆盖和实现入口</h2>
    <p>这张归档页说明 13 张 imagegen 图如何映射成可执行规格。实现时先读规则、tokens、fixture、screen spec 和静态参考页，最后再看图片。</p>
    <table class="data-table coverage-table"><thead><tr><th>ID</th><th>页面</th><th>职责</th><th>组件</th></tr></thead><tbody>${rows}</tbody></table>
  </section>
  <section class="panel warning-panel">
    <h2>禁止项</h2>
    <div class="tag-row">${['暗色整页背景', '雷达', '靶心', '扫描动画', '中心 hub', '营销 hero'].map((item) => badge(item, 'danger')).join('')}</div>
  </section>`
}

function overviewContent() {
  return `<section class="metric-grid">${kpiCards()}</section>
  <section class="workspace-grid">
    <div class="panel span-8">
      <div class="panel-head"><h2>信号矩阵</h2>${badge('12 条固定 fixture', 'teal')}</div>
      <div class="signal-grid">${fixture.signals.slice(0, 6).map((signal) => signalCard(signal, true)).join('\n')}</div>
    </div>
    <div class="panel span-4">
      <div class="panel-head"><h2>榜单变化</h2>${badge('综合评分', 'blue')}</div>
      ${rankingCards(fixture.rankingItems.slice(0, 5))}
    </div>
  </section>
  <section class="panel"><div class="panel-head"><h2>来源健康</h2>${badge('显性展示', 'green')}</div>${sourceGrid()}</section>`
}

function signalFeedContent() {
  return `<section class="panel">
    <div class="filter-bar">
      ${fixture.categories.map((category) => badge(category.label, category.color)).join('')}
      ${badge('高可信优先', 'teal')}
      ${badge('X 仅热度', 'warning')}
    </div>
  </section>
  <section class="two-column">
    <div class="stacked-list">${fixture.signals.map((signal) => signalCard(signal)).join('\n')}</div>
    ${inspectorHtml(fixture.signals[1])}
  </section>`
}

function modelMapContent() {
  return `<section class="metric-grid">${[
    ['模型来源', '8 组', '官方、OpenRouter、榜单、HF'],
    ['API 可用', '已追踪', '上下文、价格、模态'],
    ['待配置', 'AA API', '缺失时显示 skipped'],
    ['确认规则', '官方优先', 'X 不确认事实'],
  ]
    .map(([label, value, caption]) => `<article class="metric-card"><span class="metric-label">${label}</span><strong>${value}</strong><p>${caption}</p></article>`)
    .join('')}</section>
  <section class="two-column">
    <div class="panel"><h2>模型排行</h2>${rankingTable('model')}</div>
    <div class="panel"><h2>模型来源覆盖</h2>${sourceGrid('模型能力')}</div>
  </section>`
}

function agentMarketContent() {
  return `<section class="panel">
    <div class="panel-head"><h2>Agent 能力面板</h2>${badge('Benchmark first', 'blue')}</div>
    <div class="capability-grid">
      ${['浏览器任务', '代码修复', '电脑使用', '研究任务', '工具调用', '长 session'].map((item, index) => `<article><strong>${item}</strong><span>${72 + index * 3}% 覆盖</span></article>`).join('')}
    </div>
  </section>
  <section class="two-column">
    <div class="panel"><h2>Agent 榜单</h2>${rankingTable('agent')}</div>
    <div class="panel"><h2>评测来源健康</h2>${sourceGrid('Agent 能力')}</div>
  </section>`
}

function skillPluginContent() {
  return `<section class="panel">
    <div class="panel-head"><h2>生态热度</h2>${badge('GitHub / HN / Product', 'purple')}</div>
    <div class="heat-grid">
      ${fixture.signals
        .filter((signal) => signal.category === 'plugin' || signal.category === 'tool')
        .map((signal) => `<article><strong>${escapeHtml(signal.entity)}</strong><span style="height:${signal.heatScore + 20}px"></span><small>${signal.heatScore}</small></article>`)
        .join('')}
    </div>
  </section>
  <section class="two-column">
    <div class="panel"><h2>工具榜</h2>${rankingTable('tool')}</div>
    <div class="panel"><h2>工具来源</h2>${sourceGrid('工具与生态热度')}</div>
  </section>`
}

function dataOperationsContent() {
  return `<section class="metric-grid">
    ${fixture.dataPanels
      .map((panel) => `<article class="metric-card"><span class="metric-label">${escapeHtml(panel.id)}</span><strong>${escapeHtml(panel.status)}</strong><p>${escapeHtml(panel.file)}</p></article>`)
      .join('')}
  </section>
  <section class="two-column">
    <div class="panel">
      <h2>缺失密钥</h2>
      <div class="stacked-list">
        ${fixture.missingCredentials.map((item) => `<article class="source-card"><strong>${escapeHtml(item.env)}</strong><p>${escapeHtml(item.source)} · ${escapeHtml(item.requiredFor)}</p>${badge('skipped', 'warning')}</article>`).join('')}
      </div>
    </div>
    <div class="panel">
      <h2>刷新任务</h2>
      ${sourceRunTable()}
    </div>
  </section>`
}

function rankingsContent() {
  return `<section class="panel">
    <div class="filter-bar">${['综合榜', '模型', 'Agent', '工具', '插件'].map((item, index) => badge(item, index === 0 ? 'teal' : 'blue')).join('')}</div>
    ${rankingTable('all')}
  </section>
  <section class="panel">
    <h2>评分构成</h2>
    <div class="score-grid">
      ${[
        ['模型', '能力榜 35% / API 20% / 价格上下文 15% / 官方确认 15% / 热度 15%'],
        ['Agent', 'benchmark 40% / 真实任务 20% / GitHub 15% / 热度 15% / 官方可用 10%'],
        ['工具', 'GitHub 30% / PH-HN 25% / X 20% / 发布活跃 15% / 生态依赖 10%'],
      ]
        .map(([title, text]) => `<article class="source-card"><strong>${title}</strong><p>${text}</p></article>`)
        .join('')}
    </div>
  </section>`
}

function releaseCalendarContent() {
  return `<section class="panel">
    <h2>发布窗口</h2>
    <div class="timeline">
      ${fixture.releaseFrames
        .map((frame) => `<article>
          <time>${escapeHtml(frame.date)}</time>
          <strong>${escapeHtml(frame.label)}</strong>
          ${badge(frame.confidence, frame.confidence === 'high' ? 'teal' : frame.confidence === 'medium' ? 'blue' : 'warning')}
          <ul>${frame.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </article>`)
        .join('')}
    </div>
  </section>`
}

function trustedSourcesContent() {
  return `<section class="metric-grid">
    ${['官方确认', '模型能力', 'Agent 能力', '工具与生态热度', '早期传播', '研究趋势']
      .map((group) => {
        const count = fixture.sourceHealth.filter((source) => source.group === group).length
        return `<article class="metric-card"><span class="metric-label">${group}</span><strong>${count}</strong><p>来源分组必须显性展示</p></article>`
      })
      .join('')}
  </section>
  <section class="panel"><h2>来源目录</h2>${sourceGrid()}</section>`
}

function roadmapContent() {
  return `<section class="roadmap">
    ${fixture.roadmapItems
      .map((item) => `<article class="phase-card">
        <div>${badge(item.status, item.status === 'in-progress' ? 'teal' : 'blue')}<strong>${escapeHtml(item.title)}</strong></div>
        <div class="progress"><span style="width:${item.progress}%"></span></div>
        <p>影响：${item.impact.map(escapeHtml).join('、')}</p>
      </article>`)
      .join('')}
  </section>
  <section class="panel">
    <h2>验收节点</h2>
    <ul class="check-list">
      <li>每页有 screen spec、reference UI 和 imagegen 对照。</li>
      <li>先实现数据契约和状态，再进入真实 React 页面。</li>
      <li>每阶段运行 lint、build、数据刷新或截图验证。</li>
    </ul>
  </section>`
}

function mobileContent() {
  return `<section class="mobile-list">
    ${fixture.signals.slice(0, 4).map((signal) => signalCard(signal, true)).join('\n')}
  </section>
  <section class="mobile-drawer">
    <span class="drawer-handle"></span>
    <h2>${escapeHtml(fixture.signals[0].entity)}</h2>
    <p>${escapeHtml(fixture.signals[0].summary)}</p>
    <div class="tag-row">${fixture.signals[0].sources.slice(0, 3).map((id) => badge(sourceById(id)?.name ?? id, 'teal')).join('')}</div>
  </section>`
}

function componentsStatesContent() {
  return `<section class="panel components-board">
    <h2>组件状态</h2>
    <div class="component-row">${['默认按钮', '主按钮', '危险按钮', '禁用按钮'].map((item, index) => `<button class="demo-button tone-${index}">${item}</button>`).join('')}</div>
    <div class="component-row">${fixture.categories.map((category) => badge(category.label, category.color)).join('')}</div>
    <div class="component-row">${['健康', '待配置', '失败', '降级数据', '空结果'].map((item, index) => badge(item, ['green', 'warning', 'danger', 'blue', 'coral'][index])).join('')}</div>
    <div class="state-grid">
      <article><strong>Loading</strong><p>骨架屏保留卡片高度，不跳动。</p></article>
      <article><strong>Empty</strong><p>清空筛选、查看全部信号。</p></article>
      <article><strong>Error</strong><p>展示来源、状态码、最后检查时间。</p></article>
      <article><strong>Missing key</strong><p>只显示环境变量名，不显示密钥值。</p></article>
    </div>
  </section>
  <section class="two-column">
    <div>${signalCard(fixture.signals[0])}</div>
    ${inspectorHtml(fixture.signals[0])}
  </section>`
}

function contentFor(screen) {
  switch (screen.id) {
    case '00-coverage-map':
      return pageShell(screen, coverageContent())
    case '01-overview':
      return pageShell(screen, overviewContent(), inspectorHtml())
    case '02-signal-feed':
      return pageShell(screen, signalFeedContent())
    case '03-model-map':
      return pageShell(screen, modelMapContent())
    case '04-agent-market':
      return pageShell(screen, agentMarketContent())
    case '05-skill-plugin':
      return pageShell(screen, skillPluginContent())
    case '06-data-operations':
      return pageShell(screen, dataOperationsContent())
    case '07-rankings':
      return pageShell(screen, rankingsContent())
    case '08-release-calendar':
      return pageShell(screen, releaseCalendarContent())
    case '09-trusted-sources':
      return pageShell(screen, trustedSourcesContent())
    case '10-roadmap':
      return pageShell(screen, roadmapContent())
    case '11-mobile-390':
      return pageShell(screen, mobileContent())
    case '12-components-states':
      return pageShell(screen, componentsStatesContent())
    default:
      throw new Error(`Unknown screen: ${screen.id}`)
  }
}

const implementationRules = `# UI 还原实施规则

更新时间：${updatedAt}

本文件用于解决“只靠图片还原不稳定”的问题。后续 Codex 或前端实现必须按以下顺序工作：

1. 先读本文件。
2. 再读 \`docs/ui-implementation-package/design-tokens.json\`。
3. 再读目标页面的 \`docs/ui-implementation-package/screen-specs/*.json\`。
4. 再打开对应 \`reference-ui/*.html\`。
5. 最后才看 \`design-concepts/complete-ui/pages/*.png\` 做视觉对照。

## 硬性规则

- 使用现有浅色系统主题：浅蓝白页面、白色面板、浅蓝灰描边、青绿主色。
- 不允许暗色整页背景。
- 不允许雷达、靶心、扫描、中心放射、中心 hub、中心节点扩散等视觉。
- 首屏必须是可使用工作台，不是营销 hero。
- 数据来源、证据链、来源健康、缺失密钥、降级数据必须显性展示。
- X / Twitter 只作为早期传播和热度，不作为事实确认。
- 图片里的局部文案不作为事实来源，精确字段以 JSON 契约和 screen spec 为准。

## 还原验收

- React 页面截图先与 \`reference-ui/*.html\` 对齐，再与 imagegen 图对照。
- 每个页面至少检查桌面 1440x960；移动端检查 390x844。
- 文本不能溢出按钮、卡片、表格或抽屉。
- 所有列表、表格、卡片都要能追溯到 fixture 或真实数据字段。
- 缺失 API Key 时展示 \`skipped\` 和环境变量名，不展示密钥值。
`

const packageReadme = `# UI 还原实施包

更新时间：${updatedAt}

这个目录把完整 UI 图转成前端可执行契约，避免后续只凭 imagegen 图片猜布局。

## 文件

- \`design-tokens.json\`：颜色、字体、间距、圆角、布局断点。
- \`fixtures/frontier-intel-fixture.json\`：所有页面共用的固定示例数据。
- \`screen-specs/*.json\`：每个页面的路由、区域、组件、状态、交互和验收清单。
- \`../../reference-ui/*.html\`：每个页面的静态 HTML 参考实现，可直接打开。
- \`../ui-implementation-rules.md\`：后续 React 还原的硬性执行规则。

## 执行顺序

1. 选定页面。
2. 读取对应 screen spec。
3. 打开对应 reference UI。
4. 实现 React 页面。
5. 截图对比 reference UI 和 imagegen 页面图。
`

const referenceCss = `:root {
  --page: ${designTokens.colors.page};
  --page-tint: ${designTokens.colors.pageTint};
  --surface: ${designTokens.colors.surface};
  --surface-soft: ${designTokens.colors.surfaceSoft};
  --line: ${designTokens.colors.line};
  --line-strong: ${designTokens.colors.lineStrong};
  --text-strong: ${designTokens.colors.textStrong};
  --text-body: ${designTokens.colors.textBody};
  --text-muted: ${designTokens.colors.textMuted};
  --teal: ${designTokens.colors.teal};
  --teal-soft: ${designTokens.colors.tealSoft};
  --blue: ${designTokens.colors.blue};
  --blue-soft: ${designTokens.colors.blueSoft};
  --coral: ${designTokens.colors.coral};
  --coral-soft: ${designTokens.colors.coralSoft};
  --purple: ${designTokens.colors.purple};
  --purple-soft: ${designTokens.colors.purpleSoft};
  --green: ${designTokens.colors.green};
  --green-soft: ${designTokens.colors.greenSoft};
  --warning: ${designTokens.colors.warning};
  --warning-soft: ${designTokens.colors.warningSoft};
  --danger: ${designTokens.colors.danger};
  --danger-soft: ${designTokens.colors.dangerSoft};
  font-family: ${designTokens.typography.fontFamily};
  color: var(--text-strong);
}

* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    linear-gradient(90deg, rgba(61, 140, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(23, 201, 192, 0.04) 1px, transparent 1px),
    linear-gradient(120deg, #ffffff 0%, var(--page) 50%, #eef9ff 100%);
  background-size: 32px 32px, 32px 32px, auto;
}

a { color: inherit; text-decoration: none; }
h1, h2, h3, p { margin: 0; }
h1 { font-size: 30px; line-height: 38px; letter-spacing: 0; }
h2 { font-size: 20px; line-height: 28px; letter-spacing: 0; }
h3 { font-size: 16px; line-height: 24px; letter-spacing: 0; }
p { color: var(--text-body); line-height: 1.62; }

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr) 320px;
}
.sidebar {
  border-right: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  padding: 24px 18px;
}
.brand-mark { display: grid; grid-template-columns: 42px 1fr; gap: 10px; align-items: center; margin-bottom: 28px; }
.brand-mark span {
  width: 42px; height: 42px; display: grid; place-items: center; border-radius: 8px;
  background: var(--teal-soft); color: var(--teal); font-weight: 800; border: 1px solid rgba(23, 201, 192, 0.24);
}
.brand-mark small { grid-column: 2; color: var(--text-muted); margin-top: -8px; }
.nav-list { display: grid; gap: 8px; }
.nav-item {
  min-height: 56px; border-radius: 8px; padding: 10px 12px; display: grid; gap: 3px;
  color: #62758c; border: 1px solid transparent;
}
.nav-item small { color: var(--text-muted); font-size: 11px; }
.nav-item.is-active { background: var(--surface); border-color: rgba(23, 201, 192, 0.28); color: var(--text-strong); box-shadow: 0 12px 26px rgba(23, 201, 192, 0.08); }
.workspace { padding: 28px 24px 40px; min-width: 0; }
.command-bar { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 18px; }
.command-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.search-box {
  min-width: 260px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface);
  padding: 12px 14px; color: var(--text-muted); font-size: 13px;
}
.section-kicker { color: var(--teal); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.reference-note {
  display: flex; flex-wrap: wrap; gap: 12px; color: var(--text-muted); font-size: 12px;
  margin-bottom: 18px;
}
.panel, .inspector, .metric-card, .signal-card, .source-card, .phase-card {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 16px 34px rgba(70, 112, 145, 0.08);
}
.panel { padding: 20px; margin-bottom: 18px; overflow: hidden; }
.panel-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.metric-card { position: relative; padding: 18px; min-height: 124px; overflow: hidden; }
.metric-card strong { display: block; margin-top: 8px; font-size: 28px; line-height: 34px; }
.metric-label { color: var(--text-muted); font-size: 12px; font-weight: 800; }
.metric-dot { position: absolute; right: 16px; top: 16px; width: 10px; height: 10px; border-radius: 50%; }
.dot-teal { background: var(--teal); } .dot-blue { background: var(--blue); } .dot-green { background: var(--green); } .dot-warning { background: var(--warning); }
.workspace-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 18px; }
.span-8 { grid-column: span 8; } .span-4 { grid-column: span 4; }
.two-column { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 18px; align-items: start; }
.signal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.stacked-list { display: grid; gap: 12px; }
.signal-card { padding: 16px; display: grid; gap: 10px; }
.signal-card h3, .signal-card p { overflow-wrap: anywhere; }
.signal-card.is-compact { min-height: 190px; }
.signal-card-head, .tag-row, .filter-bar, .component-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.signal-meta { display: flex; flex-wrap: wrap; gap: 10px; color: var(--text-muted); font-size: 12px; font-weight: 700; }
.badge {
  display: inline-flex; align-items: center; min-height: 24px; padding: 3px 9px; border-radius: 999px;
  font-size: 12px; font-weight: 800; border: 1px solid transparent; white-space: nowrap;
}
.badge-teal { color: #078e87; background: var(--teal-soft); border-color: rgba(23, 201, 192, 0.25); }
.badge-blue { color: #236bc8; background: var(--blue-soft); border-color: rgba(61, 140, 255, 0.24); }
.badge-coral { color: #c2522b; background: var(--coral-soft); border-color: rgba(255, 124, 77, 0.28); }
.badge-purple { color: #7045c8; background: var(--purple-soft); border-color: rgba(155, 109, 245, 0.28); }
.badge-green { color: #168452; background: var(--green-soft); border-color: rgba(51, 191, 122, 0.24); }
.badge-warning { color: #9b670d; background: var(--warning-soft); border-color: rgba(247, 169, 40, 0.28); }
.badge-danger { color: #b53c45; background: var(--danger-soft); border-color: rgba(236, 95, 103, 0.28); }
.inspector { padding: 24px; margin: 128px 24px 24px 0; position: sticky; top: 24px; min-height: 560px; }
.inspector h2 { margin: 10px 0; font-size: 26px; line-height: 34px; }
.confidence { display: grid; grid-template-columns: 88px 1fr; align-items: center; margin: 18px 0; padding: 14px; border-radius: 8px; background: var(--teal-soft); }
.confidence strong { font-size: 32px; color: var(--teal); }
.evidence-list { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 10px; }
.evidence-list li { border: 1px solid var(--line); border-radius: 8px; padding: 12px; display: grid; gap: 4px; }
.evidence-list span, .data-table span { display: block; color: var(--text-muted); font-size: 12px; margin-top: 3px; }
.data-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px; }
.data-table th { text-align: left; color: var(--text-muted); font-size: 12px; padding: 0 10px; }
.data-table td { background: var(--surface); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 12px 10px; vertical-align: top; }
.data-table td, .data-table th { overflow-wrap: anywhere; }
.data-table td:first-child { border-left: 1px solid var(--line); border-radius: 8px 0 0 8px; }
.data-table td:last-child { border-right: 1px solid var(--line); border-radius: 0 8px 8px 0; }
.source-grid, .score-grid, .capability-grid, .state-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.source-card, .capability-grid article, .state-grid article { padding: 14px; }
.source-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 8px; }
.progress { height: 8px; background: #e8f1f7; border-radius: 999px; overflow: hidden; margin: 12px 0; }
.progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--teal), var(--blue)); }
.ranking-list { display: grid; gap: 10px; }
.ranking-mini-card {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 4px 10px;
  align-items: start;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
}
.ranking-mini-card span { color: var(--teal); font-weight: 900; }
.ranking-mini-card strong { min-width: 0; overflow-wrap: anywhere; }
.ranking-mini-card small { grid-column: 2; color: var(--text-muted); font-size: 12px; }
.heat-grid { height: 280px; display: flex; gap: 18px; align-items: end; padding-top: 24px; }
.heat-grid article { flex: 1; min-width: 96px; display: grid; gap: 8px; align-items: end; }
.heat-grid span { display: block; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, var(--purple), var(--teal)); }
.timeline { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.timeline article { border-left: 4px solid var(--teal); padding: 14px; background: var(--surface); border-radius: 8px; }
.timeline time { color: var(--text-muted); font-weight: 800; font-size: 12px; }
.roadmap { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
.phase-card { padding: 18px; display: grid; gap: 12px; }
.phase-card div:first-child { display: flex; align-items: center; gap: 10px; }
.check-list { line-height: 1.8; color: var(--text-body); }
.warning-panel { border-color: rgba(236, 95, 103, 0.22); }
.demo-button { min-height: 38px; border-radius: 8px; border: 1px solid var(--line); padding: 0 14px; background: var(--surface); color: var(--text-strong); font-weight: 800; }
.tone-1 { background: var(--teal); color: white; } .tone-2 { background: var(--danger); color: white; } .tone-3 { opacity: .48; }
.components-board { display: grid; gap: 16px; }

.mobile-canvas {
  width: min(100vw, 390px);
  min-height: 844px;
  margin: 0;
  padding: 16px 16px 86px;
  background: linear-gradient(180deg, #fff 0%, var(--page) 100%);
}
.mobile-topbar {
  height: 56px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  border-bottom: 1px solid var(--line);
}
.mobile-list { display: grid; gap: 12px; }
.mobile-drawer {
  position: relative; margin-top: 16px; background: var(--surface); border: 1px solid var(--line);
  border-radius: 20px 20px 8px 8px; padding: 22px 16px; box-shadow: 0 -12px 32px rgba(70, 112, 145, 0.13);
}
.drawer-handle { position: absolute; left: 50%; top: 8px; transform: translateX(-50%); width: 44px; height: 4px; border-radius: 999px; background: #d9e8f2; }
.mobile-bottom-nav {
  position: fixed; left: 0; bottom: 0; width: min(100vw, 390px); height: 68px;
  display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; text-align: center;
  background: #ffffff; border-top: 1px solid var(--line); color: var(--text-body); font-size: 12px; font-weight: 800;
  box-shadow: 0 -10px 28px rgba(70, 112, 145, 0.1);
}

@media (max-width: 1180px) {
  .app-shell { grid-template-columns: 216px minmax(0, 1fr); }
  .inspector { display: none; }
  .metric-grid, .source-grid, .score-grid, .capability-grid, .timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .two-column { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .app-shell { display: block; }
  .sidebar { display: none; }
  .workspace { padding: 18px 14px 32px; }
  .command-bar { display: grid; }
  .metric-grid, .signal-grid, .source-grid, .score-grid, .capability-grid, .timeline, .roadmap { grid-template-columns: 1fr; }
  .search-box { min-width: 0; width: 100%; }
}
`

async function main() {
  await mkdir(fixtureDir, { recursive: true })
  await mkdir(screenSpecDir, { recursive: true })
  await mkdir(referenceAssetDir, { recursive: true })

  await writeJson(join(packageDir, 'design-tokens.json'), designTokens)
  await writeJson(join(fixtureDir, 'frontier-intel-fixture.json'), fixture)
  await writeFile(join(repoRoot, 'docs', 'ui-implementation-rules.md'), implementationRules, 'utf8')
  await writeFile(join(packageDir, 'README.md'), packageReadme, 'utf8')
  await writeFile(join(referenceAssetDir, 'reference-ui.css'), referenceCss, 'utf8')

  for (const screen of screens) {
    await writeJson(join(screenSpecDir, `${screen.id}.json`), createScreenSpec(screen))
    await writeFile(join(referenceDir, `${screen.id}.html`), contentFor(screen), 'utf8')
  }

  console.log(`Generated ${screens.length} screen specs and ${screens.length} reference UI pages.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
