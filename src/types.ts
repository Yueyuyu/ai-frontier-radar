export type ConfidenceLevel = 'official' | 'platform' | 'docs' | 'benchmark' | 'social' | 'rumor'

export type FrontierCategory = '模型' | 'AI 编程' | 'Agent' | 'Skill / 插件' | '平台'

export type SourceAccessMethod = 'public-api' | 'official-page' | 'html-page' | 'api-key' | 'database'

export type SignalTrustBand = 'high' | 'medium' | 'watch' | 'low' | 'system'

export type SignalSource = {
  name: string
  type: ConfidenceLevel
  detail: string
  strength: number
  url?: string
}

export type FrontierSignal = {
  id: string
  provider: string
  name: string
  category: FrontierCategory
  level: ConfidenceLevel
  confidence: number
  firstSeen: string
  lastUpdate: string
  releaseWindow: string
  title: string
  summary: string
  lane: number
  offset: number
  accent: string
  trustBand?: SignalTrustBand
  sourceCount?: number
  sources: SignalSource[]
}

export type ReleaseFrame = {
  name: string
  provider: string
  category: FrontierCategory
  confidence: number | null
  window: string
  accent: string
}

export type RankingKind = 'model' | 'agent' | 'tool' | 'signal'

export type RankingItem = {
  rank: number
  name: string
  provider: string
  category: FrontierCategory
  score: number | null
  change: number | null
  trend: number[]
  accent: string
  source?: string
  url?: string
  kind?: RankingKind
  scoringExplanation?: string
}

export type SourceHealth = {
  name: string
  detail: string
  type: ConfidenceLevel
  influence: number
  coverage: number
  accent: string
  url?: string
  status?: 'ok' | 'skipped' | 'error'
  lastCheckedAt?: string
  accessMethod?: SourceAccessMethod
  authRequired?: boolean
  freshnessSla?: string
  weight?: number
}

export type SourceDefinition = {
  id: string
  name: string
  url: string
  sourceType: string
  accessMethod: SourceAccessMethod
  authRequired: boolean
  weight: number
  freshnessSla: string
  status: 'ok' | 'skipped' | 'error'
  requiredEnv?: string[]
  lastCheckedAt?: string
  message?: string
}

export type SourceRun = {
  id: string
  name: string
  column: string
  url: string
  access: SourceAccessMethod
  status: 'ok' | 'skipped' | 'error'
  itemCount: number
  checkedAt: string
  message: string
}

export type DataPanelItem = {
  label: string
  value: string
  note: string
  score?: number | null
  url?: string
}

export type DataPanel = {
  id: string
  title: string
  description: string
  sources: string[]
  cadence: string
  items: DataPanelItem[]
}

export type FrontierStats = {
  totalEntities: number
  totalSources: number
  verifiedSources: number
  updatedLabel: string
  generatedAt: string
  databaseStatus: string
}

export type RoadmapItem = {
  version: string
  title: string
  quarter: string
  status: 'done' | 'active' | 'planned'
}

export type LanguageOption = {
  code: string
  label: string
  status: 'active' | 'planned'
}

export type WorkspaceNavItem = {
  label: string
  href: string
  legacyHref?: string
}

export type FrontierIntelDataset = {
  generatedAt: string
  stats: FrontierStats
  workspaceNav: WorkspaceNavItem[]
  categories: string[]
  categoryMeta: Record<string, { accent: string; soft: string; icon: string }>
  signals: FrontierSignal[]
  releaseFrames: ReleaseFrame[]
  rankingItems: RankingItem[]
  sourceHealth: SourceHealth[]
  sources?: SourceDefinition[]
  sourceRuns: SourceRun[]
  dataPanels: DataPanel[]
  roadmapItems: RoadmapItem[]
  languageOptions: LanguageOption[]
}

export type RadarStats = FrontierStats

export type RadarDataset = FrontierIntelDataset
