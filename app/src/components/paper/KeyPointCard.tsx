import { useDemoStore } from '@/store/demoStore'
import type { PaperKeyPoint } from '@/types/paper'
import { cn } from '@/lib/utils'

export function KeyPointCard({ point }: { point: PaperKeyPoint }) {
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const active = point.sourceIds.some((id) => selectedSourceIds.includes(id))

  return (
    <button
      type="button"
      className={cn(
        'h-full rounded-[13px] border border-pm-line bg-pm-surface p-[18px] text-left',
        active && 'border-pm-accent bg-pm-accent-soft/40',
      )}
      onClick={() =>
        focusSelection({
          sourceIds: point.sourceIds,
          paperNodeId: point.nodeIds?.[0],
        })
      }
    >
      <span className="font-mono text-[12px] text-pm-accent">{point.id}</span>
      <h3 className="mt-2.5 text-[16px] font-[650]">{point.title}</h3>
      <p className="mt-2 text-[14px] text-pm-muted">{point.summary}</p>
    </button>
  )
}
