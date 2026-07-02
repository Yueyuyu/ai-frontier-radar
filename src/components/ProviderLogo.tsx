import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  BrainCircuit,
  Boxes,
  Code2,
  GitFork,
  Globe2,
  MessageCircle,
  Newspaper,
  PackageSearch,
  SearchCheck,
  Sparkles,
  Trophy,
} from 'lucide-react'

type ProviderBrand = {
  className: string
  icon: LucideIcon
  label: string
  short: string
}

type ProviderLogoProps = {
  provider: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const providerBrands: Array<{ match: RegExp; brand: ProviderBrand }> = [
  { match: /openai/i, brand: { className: 'is-openai', icon: Sparkles, label: 'OpenAI', short: 'OA' } },
  { match: /anthropic|claude/i, brand: { className: 'is-anthropic', icon: BrainCircuit, label: 'Anthropic', short: 'CL' } },
  { match: /google|gemini/i, brand: { className: 'is-google', icon: SearchCheck, label: 'Google', short: 'G' } },
  { match: /deepseek/i, brand: { className: 'is-deepseek', icon: Bot, label: 'DeepSeek', short: 'DS' } },
  { match: /moonshot|kimi/i, brand: { className: 'is-moonshot', icon: Sparkles, label: 'Moonshot', short: 'KM' } },
  { match: /mistral/i, brand: { className: 'is-mistral', icon: Bot, label: 'Mistral', short: 'MI' } },
  { match: /openrouter/i, brand: { className: 'is-openrouter', icon: Globe2, label: 'OpenRouter', short: 'OR' } },
  { match: /lmarena|arena/i, brand: { className: 'is-arena', icon: Trophy, label: 'LMArena', short: 'AR' } },
  { match: /mcp|skill/i, brand: { className: 'is-mcp', icon: Boxes, label: 'MCP', short: 'MCP' } },
  { match: /github/i, brand: { className: 'is-github', icon: GitFork, label: 'GitHub', short: 'GH' } },
  { match: /hacker news|hn/i, brand: { className: 'is-hn', icon: Newspaper, label: 'HN', short: 'HN' } },
  { match: /hugging face|huggingface/i, brand: { className: 'is-hf', icon: PackageSearch, label: 'Hugging Face', short: 'HF' } },
  { match: /product hunt/i, brand: { className: 'is-producthunt', icon: PackageSearch, label: 'Product Hunt', short: 'PH' } },
  { match: /\bx\b|twitter/i, brand: { className: 'is-x', icon: MessageCircle, label: 'X', short: 'X' } },
]

function providerBrand(provider: string): ProviderBrand {
  return providerBrands.find((item) => item.match.test(provider))?.brand ?? {
    className: 'is-default',
    icon: Code2,
    label: provider.split('/')[0]?.trim() || 'AI',
    short: provider
      .split(/\s+|\/|-/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AI',
  }
}

export function ProviderLogo({ provider, showName = false, size = 'md' }: ProviderLogoProps) {
  const brand = providerBrand(provider)
  const Icon = brand.icon

  return (
    <span className={`fi-provider-logo ${brand.className} is-${size}`} title={provider}>
      <span className="fi-provider-mark" aria-hidden="true">
        <Icon size={size === 'lg' ? 20 : size === 'sm' ? 14 : 16} />
      </span>
      {showName ? <span>{brand.label}</span> : null}
    </span>
  )
}
