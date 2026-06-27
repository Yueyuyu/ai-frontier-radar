export type ConfidenceLevel = 'official' | 'platform' | 'document' | 'community'

export type ModelSignal = {
  id: number
  company: string
  model: string
  title: string
  level: ConfidenceLevel
  confidence: number
  source: string
  stage: string
  time: string
  impact: string
}

export type WatchCompany = {
  name: string
  family: string
  focus: string
  status: string
  score: number
  activeSignals: number
  accent: string
}

export type RankingMove = {
  model: string
  company: string
  board: string
  change: number
  score: string
}

export type TimelineStep = {
  label: string
  status: 'done' | 'active' | 'pending'
  detail: string
}
