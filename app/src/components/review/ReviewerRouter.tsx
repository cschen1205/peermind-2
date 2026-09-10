import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { ReviewSignal } from '@/types/finding'

export function ReviewerRouter({ signals }: { signals: ReviewSignal[] }) {
  const reduceMotion = useReducedMotion()
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const focusSelection = useDemoStore((s) => s.focusSelection)

  return (
    <div>
      <p className="eyebrow">Paper signals</p>
      <div className="flex flex-wrap gap-2">
        {signals.map((signal, index) => {
          const active = signal.sourceIds.some((id) => selectedSourceIds.includes(id))
          return (
            <motion.button
              key={signal.id}
              type="button"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              className={cn(
                'rounded-full border border-pm-line bg-pm-surface px-3 py-1.5 text-[13px] font-[650] text-pm-ink',
                active && 'border-pm-accent bg-pm-accent-soft text-pm-accent',
              )}
              onClick={() => focusSelection({ sourceIds: signal.sourceIds })}
            >
              {signal.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
