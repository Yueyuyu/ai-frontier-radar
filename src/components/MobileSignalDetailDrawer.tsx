import { X } from 'lucide-react'
import type { FrontierSignal } from '../types'
import { SignalInspector } from './SignalInspector'

type MobileSignalDetailDrawerProps = {
  signal: FrontierSignal | null
  open: boolean
  onClose: () => void
}

export function MobileSignalDetailDrawer({ onClose, open, signal }: MobileSignalDetailDrawerProps) {
  if (!open || !signal) return null
  return (
    <div className="fi-mobile-drawer" role="dialog" aria-modal="true" aria-label="信号详情">
      <button className="fi-mobile-drawer-close" onClick={onClose} type="button" aria-label="关闭详情">
        <X size={18} />
      </button>
      <SignalInspector signal={signal} />
    </div>
  )
}
