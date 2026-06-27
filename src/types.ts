export type ConfidenceLevel = 'official' | 'platform' | 'docs' | 'rumor'

export type FrontierCategory = '模型' | 'AI 编程' | 'Agent' | 'Skill / 插件' | '平台'

export type SignalSource = {
  name: string
  type: ConfidenceLevel
  detail: string
  strength: number
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
