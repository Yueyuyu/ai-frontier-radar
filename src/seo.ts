import { canonicalUrl } from './publicRoutes'

type SeoOptions = {
  description: string
  path: string
  title: string
  type?: 'website' | 'article'
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    element.setAttribute('data-frontier-seo', 'true')
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    element.setAttribute('data-frontier-seo', 'true')
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

export function applySeo({ description, path, title, type = 'website' }: SeoOptions) {
  if (typeof document === 'undefined') return
  const url = canonicalUrl(path)

  document.documentElement.lang = 'zh-CN'
  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:site_name', 'AI 前沿情报站')
  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('name', 'twitter:card', 'summary')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertCanonical(url)
}
