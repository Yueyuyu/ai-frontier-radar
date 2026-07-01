import { AlertCircle, KeyRound, SearchX, WifiOff } from 'lucide-react'

type EmptyStateType = 'search' | 'filter' | 'source-error' | 'missing-key' | 'degraded'

type EmptyStateProps = {
  type: EmptyStateType
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

const copyByType: Record<EmptyStateType, { title: string; message: string; Icon: typeof SearchX }> = {
  search: { title: '没有匹配结果', message: '换一个关键词，或清空搜索条件后再查看。', Icon: SearchX },
  filter: { title: '当前筛选没有信号', message: '调整类别、可信度或时间窗口后再查看。', Icon: SearchX },
  'source-error': { title: '数据源刷新失败', message: '来源失败不会被隐藏，请检查运行记录里的错误原因。', Icon: AlertCircle },
  'missing-key': { title: '来源密钥未配置', message: '商业 API 会标记为 skipped，只展示环境变量名，不展示密钥值。', Icon: KeyRound },
  degraded: { title: '正在使用降级数据', message: '远程数据不可用时保留内置快照，避免工作台空白。', Icon: WifiOff },
}

export function EmptyState({ actionLabel, message, onAction, title, type }: EmptyStateProps) {
  const fallback = copyByType[type]
  const Icon = fallback.Icon
  return (
    <div className="fi-empty-state">
      <span>
        <Icon size={20} />
      </span>
      <strong>{title ?? fallback.title}</strong>
      <p>{message ?? fallback.message}</p>
      {actionLabel && onAction && (
        <button className="fi-action" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
