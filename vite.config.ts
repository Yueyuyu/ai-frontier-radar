import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Connect } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const datasetSnapshotPath = join(projectRoot, 'public', 'data', 'frontier-intel-data.json')

function frontierDatasetMiddleware(): Connect.NextHandleFunction {
  return async (request, response, next) => {
    if (!request.url?.startsWith('/api/frontier/dataset')) {
      next()
      return
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.statusCode = 405
      response.setHeader('Allow', 'GET, HEAD')
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ error: { code: 'method_not_allowed', message: 'Only GET is supported' } }))
      return
    }

    try {
      const dataset = await readFile(datasetSnapshotPath, 'utf8')
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.setHeader('Cache-Control', 'no-cache')
      response.setHeader('X-Frontier-Dataset-Source', 'snapshot')
      response.end(request.method === 'HEAD' ? undefined : dataset)
    } catch {
      response.statusCode = 503
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.setHeader('Cache-Control', 'no-cache')
      response.end(JSON.stringify({
        error: {
          code: 'dataset_unavailable',
          message: 'No usable frontier dataset snapshot',
        },
      }))
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'frontier-dataset-api',
      configureServer(server) {
        server.middlewares.use(frontierDatasetMiddleware())
      },
      configurePreviewServer(server) {
        server.middlewares.use(frontierDatasetMiddleware())
      },
    },
    react(),
    tailwindcss(),
  ],
})
