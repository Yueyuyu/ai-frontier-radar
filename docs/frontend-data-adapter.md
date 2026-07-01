# 前端数据 adapter

`src/dataRuntime.ts` 是前端工作台的数据入口。现有 UI 仍可继续调用 `useFrontierIntelDataset()` 获取 `FrontierIntelDataset`，需要读取加载状态和数据来源时改用 `useFrontierIntelDataState()`。

## 数据源优先级

1. 配置 `VITE_API_BASE_URL` 时，请求 `${VITE_API_BASE_URL}/api/frontier/dataset`。如果后端与前端同源，配置为 `/`。
2. 未配置 `VITE_API_BASE_URL` 时跳过 API，直接读取静态 JSON，避免纯静态预览产生 `/api/frontier/dataset` 404。
3. API 不可用时回退 `/data/frontier-intel-data.json`。
4. 主静态数据不可用时回退 `/data/radar-data.json`。
5. 所有远程数据源不可用时使用 `src/data.ts` 的内置 fallback。

所有远程数据都会继续经过 `mergeDataset` 合并，缺失或空数组字段会保留内置 fallback 内容。adapter 每 60 秒刷新一次。

远程响应会先经过最小 shape guard：必须包含 `generatedAt`、`stats`，以及 `workspaceNav`、`categories`、`signals`、`releaseFrames`、`rankingItems`、`sourceHealth`、`sourceRuns`、`dataPanels`、`roadmapItems`、`languageOptions` 这些数组字段。校验失败时继续尝试下一层数据源。

## Hook 用法

```ts
import { useFrontierIntelDataState, useFrontierIntelDataset } from './dataRuntime'

const dataset = useFrontierIntelDataset()

const {
  dataset: statefulDataset,
  loading,
  error,
  lastUpdated,
  isFallback,
  source,
} = useFrontierIntelDataState()
```

`source` 的取值：

- `api`：后端聚合接口。
- `frontier-intel-json`：主静态 JSON。
- `radar-json`：历史兼容静态 JSON。
- `inline-fallback`：内置 fallback 数据。

`error` 只返回脱敏后的降级原因，不包含请求 URL、响应体、密钥或部署细节。
