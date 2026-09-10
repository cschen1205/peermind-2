import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { ReviewerAgent } from '@/types/finding'

export function ReviewerTeam({ agents }: { agents: ReviewerAgent[] }) {
  const reduceMotion = useReducedMotion()
  const selected = agents.filter((agent) => agent.selected)
  const skipped = agents.filter((agent) => !agent.selected)

  return (
    <div>
      <p className="eyebrow">Reviewer router</p>
      <p className="mb-3 text-[14px] text-pm-muted">Selected specialists</p>
      <div className="flex flex-wrap gap-2">
        {selected.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.05, duration: 0.2 }}
            className="rounded-full bg-pm-accent-soft px-3.5 py-2 text-[13px] font-[650] text-pm-accent"
          >
            <span>{agent.label}</span>
            {agent.description ? (
              <span className="ml-2 font-normal text-pm-muted">{agent.description}</span>
            ) : null}
          </motion.div>
        ))}
      </div>
      {skipped.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[14px] text-pm-muted">Skipped candidate roles</p>
          <div className="flex flex-wrap gap-2">
            {skipped.map((agent) => (
              <span
                key={agent.id}
                className={cn(
                  'rounded-full bg-pm-status-unverified-fill px-3.5 py-2 text-[13px] text-pm-muted-2 opacity-80',
                )}
              >
                {agent.label}
                {agent.description ? ` · ${agent.description}` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
