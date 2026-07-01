import { useEffect, useState } from 'react'
import { fallbackRadarDataset } from './data'
import type { FrontierIntelDataset } from './types'

const DATASET_URLS = ['/data/frontier-intel-data.json', '/data/radar-data.json'] as const
const DATASET_REFRESH_MS = 60_000

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

async function fetchRemoteDataset(): Promise<Partial<FrontierIntelDataset> | null> {
  for (const url of DATASET_URLS) {
    try {
      const response = await fetch(`${url}?t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) continue
      return (await response.json()) as Partial<FrontierIntelDataset>
    } catch {
      // 本地预览或首次部署时可能还没有生成 JSON，继续尝试下一个兼容入口。
    }
  }
  return null
}

export function useFrontierIntelDataset() {
  const [dataset, setDataset] = useState<FrontierIntelDataset>(fallbackRadarDataset)

  useEffect(() => {
    let cancelled = false

    async function loadDataset() {
      const remote = await fetchRemoteDataset()
      if (!cancelled && remote) {
        setDataset(mergeDataset(remote))
      }
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

  return dataset
}

export function useRadarDataset() {
  return useFrontierIntelDataset()
}
