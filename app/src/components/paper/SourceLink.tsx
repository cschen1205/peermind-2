import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'

export function SourceLink({
  sourceId,
  className,
}: {
  sourceId: string
  className?: string
}) {
  const focusSelection = useDemoStore((s) => s.focusSelection)

  return (
    <button
      type="button"
      className={cn(
        'type-trace rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-pm-muted hover:text-pm-accent',
        className,
      )}
      onClick={() => focusSelection({ sourceIds: [sourceId] })}
    >
      {sourceId}
    </button>
  )
}
