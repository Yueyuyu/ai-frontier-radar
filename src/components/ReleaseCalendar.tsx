import type { ReleaseFrame } from '../types'
import { StatusBadge } from './StatusBadge'

type ReleaseCalendarProps = {
  frames: ReleaseFrame[]
}

export function ReleaseCalendar({ frames }: ReleaseCalendarProps) {
  const groups = frames.reduce<Record<string, ReleaseFrame[]>>((acc, frame) => {
    const key = frame.window || '观察窗口'
    acc[key] = acc[key] ?? []
    acc[key].push(frame)
    return acc
  }, {})

  return (
    <section className="fi-panel fi-timeline">
      {Object.entries(groups).map(([window, items]) => (
        <div className="fi-timeline-group" key={window}>
          <div className="fi-section-head">
            <h2>{window}</h2>
            <StatusBadge tone="blue">{items.length} 条</StatusBadge>
          </div>
          {items
            .slice()
            .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
            .map((frame) => {
              const lowTrust = (frame.confidence ?? 0) < 70
              return (
                <article className={lowTrust ? 'is-low-trust' : ''} key={`${frame.provider}-${frame.name}`}>
                  <StatusBadge confidence={frame.confidence ?? 0}>{frame.confidence ?? '观察'}%</StatusBadge>
                  <h3>{frame.name}</h3>
                  <p>{frame.provider} · {frame.category} · {lowTrust ? '观察信号，等待官方确认' : '发布 / 文档 / 榜单信号'}</p>
                </article>
              )
            })}
        </div>
      ))}
    </section>
  )
}
