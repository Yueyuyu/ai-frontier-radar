import type { SignalSource } from '../types'
import { BookOpenText, ExternalLink, FileCheck2, Globe2, MessageCircle, ShieldCheck, Trophy } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

type SourceEvidenceCardProps = {
  source: SignalSource
}

function SourceIcon({ type }: { type: SignalSource['type'] }) {
  const Icon = {
    official: ShieldCheck,
    docs: BookOpenText,
    platform: Globe2,
    benchmark: Trophy,
    social: MessageCircle,
    rumor: FileCheck2,
  }[type]

  return <Icon size={16} strokeWidth={2.2} />
}

export function SourceEvidenceCard({ source }: SourceEvidenceCardProps) {
  return (
    <a className={`fi-source-item is-${source.type}`} href={source.url} target="_blank" rel="noreferrer" aria-label={`打开来源 ${source.name}`}>
      <span className="fi-source-icon" aria-hidden="true">
        <SourceIcon type={source.type} />
      </span>
      <div className="fi-source-main">
        <div className="fi-tag-row">
          <strong>{source.name}</strong>
          <StatusBadge status={source.type}>{source.type}</StatusBadge>
          <ExternalLink className="fi-source-open" size={13} aria-hidden="true" />
        </div>
        <p>{source.detail}</p>
        <div className="fi-source-strength">
          <span>证据强度</span>
          <b>{source.strength}</b>
        </div>
        <div className="fi-progress" aria-hidden="true">
          <span style={{ width: `${source.strength}%` }} />
        </div>
      </div>
    </a>
  )
}
