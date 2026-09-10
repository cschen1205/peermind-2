import { useEffect } from 'react'
import { useDemoStore } from '@/store/demoStore'

export function Toast() {
  const toast = useDemoStore((s) => s.toast)
  const clearToast = useDemoStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => clearToast(), 2800)
    return () => window.clearTimeout(timer)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-[8px] bg-pm-nav px-5 py-3 text-[14px] text-white shadow-[0_5px_25px_#00000022]"
      role="status"
    >
      {toast}
    </div>
  )
}
