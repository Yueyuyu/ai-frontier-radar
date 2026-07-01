import type { RankingItem } from '../types'
import { StatusBadge } from './StatusBadge'
import { TrendSparkline } from './TrendSparkline'

type RankingTableProps = {
  items: RankingItem[]
}

export function RankingTable({ items }: RankingTableProps) {
  return (
    <div className="fi-table-wrap">
      <table className="fi-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>对象</th>
            <th>类别</th>
            <th>分数</th>
            <th>变化</th>
            <th>趋势</th>
            <th>依据</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.kind}-${item.rank}-${item.name}`}>
              <td>#{item.rank}</td>
              <td>
                <strong>{item.name}</strong>
                <br />
                <span>{item.provider}</span>
              </td>
              <td>
                <StatusBadge category={item.category}>{item.kind ?? item.category}</StatusBadge>
              </td>
              <td>{item.score ?? '观察'}</td>
              <td>{item.change === null || item.change === undefined ? '0' : item.change > 0 ? `+${item.change}` : item.change}</td>
              <td>
                <TrendSparkline color={item.accent} points={item.trend} />
              </td>
              <td>{item.scoringExplanation ?? item.source ?? '综合信号'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
