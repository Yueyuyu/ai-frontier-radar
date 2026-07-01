# 后端聚合接口契约

前端只对接一个聚合接口，不直接读取 `frontier_*` 多张表。

## GET /api/frontier/dataset

成功响应直接返回 `FrontierIntelDataset`，不要包一层 `{ data }`。

```ts
type ResponseBody = FrontierIntelDataset
```

必须包含的顶层字段：

- `generatedAt`
- `stats`
- `workspaceNav`
- `categories`
- `categoryMeta`
- `signals`
- `releaseFrames`
- `rankingItems`
- `sourceHealth`
- `sourceRuns`
- `dataPanels`
- `roadmapItems`
- `languageOptions`

建议同时返回 `sources`。虽然 `sources` 在前端类型里是可选字段，但可信来源页和数据洞察页会优先使用它展示来源元信息。

## 错误响应

只有在没有任何可用快照时返回错误。数据库不可用但 JSON 快照可用时，后端应返回 `200`，并通过 `stats.databaseStatus` 和 `sourceRuns` 暴露状态。

```json
{
  "error": {
    "code": "dataset_unavailable",
    "message": "No usable frontier dataset snapshot",
    "requestId": "optional",
    "retryAfterSeconds": 60
  }
}
```

推荐状态码：

- `400 invalid_query`
- `500 dataset_build_failed`
- `503 dataset_unavailable`

## 数据来源策略

后端 MVP 优先读取最新 `public/data/frontier-intel-data.json` 或复用 `scripts/refresh-data.mjs` 的生成逻辑。当前 MySQL schema 适合做持久化增强，但还不能单独无损拼出完整 `FrontierIntelDataset`，例如 `categoryMeta`、`dataPanels`、`roadmapItems`、`languageOptions`、部分信号展示字段和榜单解释字段仍来自快照生成层。

## 前端降级链路

前端 adapter 的读取顺序：

1. 配置 `VITE_API_BASE_URL` 时请求 `${VITE_API_BASE_URL}/api/frontier/dataset`；同源后端配置为 `/`
2. 未配置 `VITE_API_BASE_URL` 时跳过 API，直接请求 `/data/frontier-intel-data.json`
3. `/data/radar-data.json`
4. `src/data.ts` 内置 fallback

API 非 2xx、网络错误、JSON 解析失败或响应不符合最小 `FrontierIntelDataset` shape 时，前端继续尝试下一层。单个来源 `skipped/error` 或 `stats.databaseStatus` 非同步状态不触发整体降级。
