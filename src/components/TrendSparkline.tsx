type TrendSparklineProps = {
  points?: number[]
  color?: string
}

export function TrendSparkline({ color = 'var(--accent-teal)', points = [] }: TrendSparklineProps) {
  const safePoints = points.length ? points : [0, 0]
  const min = Math.min(...safePoints)
  const max = Math.max(...safePoints)
  const range = max - min || 1
  const width = 96
  const height = 32
  const step = width / Math.max(safePoints.length - 1, 1)
  const path = safePoints
    .map((point, index) => {
      const x = index * step
      const y = height - ((point - min) / range) * (height - 6) - 3
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg className="fi-sparkline" role="img" aria-label="趋势线" viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  )
}
