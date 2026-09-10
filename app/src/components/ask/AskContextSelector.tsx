import { ASK_SCOPE_LABELS } from '@/components/ask/askContext'
import type { AskContextScope } from '@/types/ask'

export function AskContextSelector({
  scope,
  contextIds,
}: {
  scope: AskContextScope
  contextIds: string[]
}) {
  return (
    <div>
      <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">Context</p>
      <p className="mt-1.5 rounded-[8px] border border-pm-line bg-pm-bg px-3 py-2 text-[14px] text-pm-ink">
        {ASK_SCOPE_LABELS[scope]}
        {contextIds[0] ? <span className="ml-2 font-mono text-[12px] text-pm-muted">{contextIds[0]}</span> : null}
      </p>
    </div>
  )
}
