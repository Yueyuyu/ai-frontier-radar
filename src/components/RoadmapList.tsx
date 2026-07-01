import type { RoadmapItem } from '../types'
import { StatusBadge } from './StatusBadge'

type RoadmapListProps = {
  items: RoadmapItem[]
}

export function RoadmapList({ items }: RoadmapListProps) {
  return (
    <section className="fi-grid two">
      {items.map((item) => (
        <article className="fi-card" key={item.version}>
          <StatusBadge status={item.status}>{item.status}</StatusBadge>
          <h3>{item.version} · {item.title}</h3>
          <p>{item.quarter}</p>
        </article>
      ))}
    </section>
  )
}
