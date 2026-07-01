import type { FrontierIntelDataset } from '../types'

export type FreshnessStatus = 'fresh' | 'delayed' | 'stale' | 'skipped' | 'unknown'

export type FreshnessAssessment = {
  ageLabel: string
  checkedAt?: string
  label: string
  minutesOld: number | null
  slaLabel: string
  slaMinutes: number | null
  status: FreshnessStatus
}

export function toneForCategory(category: string) {
  if (category === '模型') return 'teal'
  if (category === 'Agent') return 'blue'
  if (category === 'AI 编程') return 'coral'
  if (category === 'Skill / 插件') return 'purple'
  return 'green'
}

export function toneForStatus(status?: string) {
  if (status === 'ok' || status === 'success' || status === 'done' || status === 'official' || status === 'fresh') return 'green'
  if (status === 'error' || status === 'failed' || status === 'rumor' || status === 'stale') return 'danger'
  if (status === 'skipped' || status === 'planned' || status === 'social' || status === 'delayed') return 'warning'
  if (status === 'docs' || status === 'platform') return 'blue'
  if (status === 'benchmark' || status === 'active') return 'purple'
  return 'teal'
}

export function confidenceTone(value: number) {
  if (value >= 90) return 'teal'
  if (value >= 75) return 'blue'
  if (value >= 55) return 'warning'
  return 'danger'
}

export function formatDate(value: string) {
  if (!value) return '未刷新'
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return value
  }
}

function parseFreshnessSlaMinutes(value?: string) {
  if (!value) return null
  const normalized = value.toLowerCase().trim()
  if (normalized === 'daily' || normalized === '1d') return 24 * 60
  if (normalized === 'on-refresh') return 24 * 60

  const matches = [...normalized.matchAll(/(\d+(?:\.\d+)?)\s*(m|min|minute|minutes|h|hr|hour|hours|d|day|days)/g)]
  if (!matches.length) return null

  return Math.max(
    ...matches.map((match) => {
      const amount = Number(match[1])
      const unit = match[2]
      if (unit.startsWith('d')) return amount * 24 * 60
      if (unit.startsWith('h')) return amount * 60
      return amount
    }),
  )
}

export function formatRelativeAge(value?: string) {
  if (!value) return '未刷新'
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return value

  const ageMs = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(ageMs / 60_000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function assessFreshness(checkedAt?: string, freshnessSla?: string, sourceStatus?: string): FreshnessAssessment {
  const slaMinutes = parseFreshnessSlaMinutes(freshnessSla)
  const slaLabel = freshnessSla || '未声明'

  if (sourceStatus === 'skipped') {
    return {
      ageLabel: checkedAt ? formatRelativeAge(checkedAt) : '待配置',
      checkedAt,
      label: '待配置',
      minutesOld: null,
      slaLabel,
      slaMinutes,
      status: 'skipped',
    }
  }

  if (!checkedAt) {
    return {
      ageLabel: '未刷新',
      label: '未刷新',
      minutesOld: null,
      slaLabel,
      slaMinutes,
      status: 'unknown',
    }
  }

  const timestamp = new Date(checkedAt).getTime()
  if (!Number.isFinite(timestamp)) {
    return {
      ageLabel: checkedAt,
      checkedAt,
      label: '时间异常',
      minutesOld: null,
      slaLabel,
      slaMinutes,
      status: 'unknown',
    }
  }

  const minutesOld = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (!slaMinutes) {
    return {
      ageLabel: formatRelativeAge(checkedAt),
      checkedAt,
      label: '未声明 SLA',
      minutesOld,
      slaLabel,
      slaMinutes,
      status: 'unknown',
    }
  }

  if (minutesOld > slaMinutes) {
    return {
      ageLabel: formatRelativeAge(checkedAt),
      checkedAt,
      label: '已过期',
      minutesOld,
      slaLabel,
      slaMinutes,
      status: 'stale',
    }
  }

  if (minutesOld > slaMinutes * 0.75) {
    return {
      ageLabel: formatRelativeAge(checkedAt),
      checkedAt,
      label: '接近 SLA',
      minutesOld,
      slaLabel,
      slaMinutes,
      status: 'delayed',
    }
  }

  return {
    ageLabel: formatRelativeAge(checkedAt),
    checkedAt,
    label: '新鲜',
    minutesOld,
    slaLabel,
    slaMinutes,
    status: 'fresh',
  }
}

export function datasetFreshness(dataset: FrontierIntelDataset) {
  const sources = dataset.sources?.length ? dataset.sources : dataset.sourceHealth
  const sourceAssessments = sources.map((source) => assessFreshness(source.lastCheckedAt, source.freshnessSla, source.status))
  const generated = assessFreshness(dataset.generatedAt || dataset.stats.generatedAt, '1h')
  const latestRun = dataset.sourceRuns
    .map((run) => run.checkedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  const latestRunFreshness = assessFreshness(latestRun, '1h')
  const staleCount = sourceAssessments.filter((item) => item.status === 'stale').length
  const delayedCount = sourceAssessments.filter((item) => item.status === 'delayed').length
  const skippedCount = sourceAssessments.filter((item) => item.status === 'skipped').length
  const okCount = sourceAssessments.filter((item) => item.status === 'fresh' || item.status === 'delayed').length
  const failedCount = sources.filter((source) => source.status === 'error').length
  const status: FreshnessStatus = generated.status === 'stale' || latestRunFreshness.status === 'stale' || staleCount > 0 ? 'stale' : failedCount > 0 || delayedCount > 0 ? 'delayed' : skippedCount > 0 ? 'skipped' : 'fresh'

  return {
    delayedCount,
    failedCount,
    generated,
    latestRunFreshness,
    okCount,
    skippedCount,
    staleCount,
    status,
    totalSources: sources.length,
  }
}
