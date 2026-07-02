const DEFAULT_SITE_URL = 'https://yueyuyu.github.io/ai-frontier-radar'

export const WORKSPACE_PATH = '/workspace'

const workspaceHashes = new Set([
  '#coverage-map',
  '#overview',
  '#radar',
  '#mobile-empty',
  '#mobile-loading',
  '#signals',
  '#model-rankings',
  '#agent-rankings',
  '#tool-rankings',
  '#source-runs',
  '#rankings',
  '#calendar',
  '#sources',
  '#roadmap',
  '#components-states',
])

function normalizedBasePath() {
  const base = import.meta.env.BASE_URL || '/'
  if (!base || base === '/') return ''
  return `/${base.replace(/^\/+|\/+$/g, '')}`
}

export function currentPublicPath() {
  if (typeof window === 'undefined') return '/'
  const base = normalizedBasePath()
  const pathname = window.location.pathname || '/'
  if (base && (pathname === base || pathname.startsWith(`${base}/`))) {
    return pathname.slice(base.length) || '/'
  }
  return pathname
}

export function isWorkspaceLocation() {
  if (typeof window === 'undefined') return false
  const path = currentPublicPath()
  return path === WORKSPACE_PATH || path.startsWith(`${WORKSPACE_PATH}/`) || workspaceHashes.has(window.location.hash)
}

export function publicHref(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const base = normalizedBasePath()
  return `${base}${normalizedPath}` || '/'
}

export function signalHref(signalId: string) {
  return publicHref(`/signals/${encodeURIComponent(signalId)}`)
}

export function workspaceHref(hash = '#overview') {
  return `${publicHref(WORKSPACE_PATH)}${hash}`
}

export function siteBaseUrl() {
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL?.trim()
  return (configured || DEFAULT_SITE_URL).replace(/\/+$/, '')
}

export function canonicalUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteBaseUrl()}${normalizedPath === '/' ? '/' : normalizedPath}`
}
