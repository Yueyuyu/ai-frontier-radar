import { useEffect, useState } from 'react'
import { fallbackRadarDataset } from './data'
import type { FrontierIntelDataset } from './types'

const API_DATASET_PATH = '/api/frontier/dataset'
const FRONTIER_INTEL_DATASET_URL = '/data/frontier-intel-data.json'
const RADAR_DATASET_URL = '/data/radar-data.json'
const DATASET_REFRESH_MS = 60_000

export type FrontierIntelDataSource = 'api' | 'frontier-intel-json' | 'radar-json' | 'inline-fallback'

export type FrontierIntelDataState = {
  dataset: FrontierIntelDataset
  loading: boolean
  error: string | null
  lastUpdated: string | null
  isFallback: boolean
  source: FrontierIntelDataSource
}

type DatasetEndpoint = {
  source: Exclude<FrontierIntelDataSource, 'inline-fallback'>
  url: string
  fallback: boolean
}

type DatasetLoadResult = {
  remote: Partial<FrontierIntelDataset>
  source: DatasetEndpoint['source']
  error: string | null
  isFallback: boolean
}

const INITIAL_DATA_STATE: FrontierIntelDataState = {
  dataset: fallbackRadarDataset,
  loading: true,
  error: null,
  lastUpdated: resolveLastUpdated(fallbackRadarDataset),
  isFallback: true,
  source: 'inline-fallback',
}

function mergeDataset(remote: Partial<FrontierIntelDataset>): FrontierIntelDataset {
  return {
    ...fallbackRadarDataset,
    ...remote,
    stats: {
      ...fallbackRadarDataset.stats,
      ...remote.stats,
    },
    categoryMeta: {
      ...fallbackRadarDataset.categoryMeta,
      ...remote.categoryMeta,
    },
    workspaceNav: remote.workspaceNav?.length ? remote.workspaceNav : fallbackRadarDataset.workspaceNav,
    categories: remote.categories?.length ? remote.categories : fallbackRadarDataset.categories,
    signals: remote.signals?.length ? remote.signals : fallbackRadarDataset.signals,
    releaseFrames: remote.releaseFrames?.length ? remote.releaseFrames : fallbackRadarDataset.releaseFrames,
    rankingItems: remote.rankingItems?.length ? remote.rankingItems : fallbackRadarDataset.rankingItems,
    sourceHealth: remote.sourceHealth?.length ? remote.sourceHealth : fallbackRadarDataset.sourceHealth,
    sourceRuns: remote.sourceRuns?.length ? remote.sourceRuns : fallbackRadarDataset.sourceRuns,
    dataPanels: remote.dataPanels?.length ? remote.dataPanels : fallbackRadarDataset.dataPanels,
    roadmapItems: remote.roadmapItems?.length ? remote.roadmapItems : fallbackRadarDataset.roadmapItems,
    languageOptions: remote.languageOptions?.length ? remote.languageOptions : fallbackRadarDataset.languageOptions,
  }
}

function resolveApiDatasetUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!apiBaseUrl) return null
  const normalizedBaseUrl = apiBaseUrl === '/' ? '' : apiBaseUrl.replace(/\/+$/, '')
  return `${normalizedBaseUrl}${API_DATASET_PATH}`
}

function buildDatasetEndpoints(): DatasetEndpoint[] {
  const apiDatasetUrl = resolveApiDatasetUrl()
  return [
    ...(apiDatasetUrl ? [{ source: 'api' as const, url: apiDatasetUrl, fallback: false }] : []),
    { source: 'frontier-intel-json', url: FRONTIER_INTEL_DATASET_URL, fallback: true },
    { source: 'radar-json', url: RADAR_DATASET_URL, fallback: true },
  ]
}

function withCacheBust(url: string) {
  return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
}

function resolveLastUpdated(dataset: FrontierIntelDataset) {
  return dataset.generatedAt || dataset.stats.generatedAt || null
}

function buildFallbackError(source: FrontierIntelDataSource) {
  if (source === 'frontier-intel-json') {
    return '后端聚合接口不可用，已回退到主静态数据。'
  }

  if (source === 'radar-json') {
    return '后端聚合接口和主静态数据不可用，已回退到兼容静态数据。'
  }

  if (source === 'inline-fallback') {
    return '所有远程数据源不可用，已使用内置 fallback 数据。'
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasDatasetShape(value: unknown): value is Partial<FrontierIntelDataset> {
  if (!isRecord(value)) return false
  if (typeof value.generatedAt !== 'string') return false
  if (!isRecord(value.stats)) return false

  return [
    'workspaceNav',
    'categories',
    'signals',
    'releaseFrames',
    'rankingItems',
    'sourceHealth',
    'sourceRuns',
    'dataPanels',
    'roadmapItems',
    'languageOptions',
  ].every((field) => Array.isArray(value[field]))
}

async function fetchDatasetEndpoint(endpoint: DatasetEndpoint) {
  const response = await fetch(withCacheBust(endpoint.url), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('dataset-source-unavailable')
  }

  const payload: unknown = await response.json()
  if (!hasDatasetShape(payload)) {
    throw new Error('dataset-shape-invalid')
  }

  return payload
}

async function fetchRemoteDataset(): Promise<DatasetLoadResult | null> {
  for (const endpoint of buildDatasetEndpoints()) {
    try {
      const remote = await fetchDatasetEndpoint(endpoint)
      return {
        remote,
        source: endpoint.source,
        error: endpoint.fallback ? buildFallbackError(endpoint.source) : null,
        isFallback: endpoint.fallback,
      }
    } catch {
      // 单个候选源失败不暴露 URL 或响应体，避免把部署细节写入 UI 状态。
    }
  }

  return null
}

export function useFrontierIntelDataState(): FrontierIntelDataState {
  const [state, setState] = useState<FrontierIntelDataState>(INITIAL_DATA_STATE)

  useEffect(() => {
    let cancelled = false

    async function loadDataset() {
      setState((current) => ({ ...current, loading: true }))

      const remote = await fetchRemoteDataset()
      if (cancelled) {
        return
      }

      if (remote) {
        const dataset = mergeDataset(remote.remote)
        setState({
          dataset,
          loading: false,
          error: remote.error,
          lastUpdated: resolveLastUpdated(dataset),
          isFallback: remote.isFallback,
          source: remote.source,
        })
        return
      }

      setState({
        dataset: fallbackRadarDataset,
        loading: false,
        error: buildFallbackError('inline-fallback'),
        lastUpdated: resolveLastUpdated(fallbackRadarDataset),
        isFallback: true,
        source: 'inline-fallback',
      })
    }

    void loadDataset()

    const refreshTimer = window.setInterval(() => {
      void loadDataset()
    }, DATASET_REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(refreshTimer)
    }
  }, [])

  return state
}

export function useFrontierIntelDataset() {
  return useFrontierIntelDataState().dataset
}

export function useRadarDataset() {
  return useFrontierIntelDataset()
}
