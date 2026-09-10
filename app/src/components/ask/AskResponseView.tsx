import { useNavigate } from 'react-router-dom'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { ASK_FALLBACK } from '@/data/matchAsk'
import { useDemoStore } from '@/store/demoStore'
import type { AskResponse } from '@/types/ask'

const TRACE_STATUS: Record<NonNullable<AskResponse['toolTrace']>[number]['status'], string> = {
  running: 'Running',
  done: 'Done',
  failed: 'Failed',
  skipped: 'Skipped',
}

export function AskResponseView({ response }: { response: AskResponse }) {
  const navigate = useNavigate()
  const runAskAction = useDemoStore((s) => s.runAskAction)
  const askScope = useDemoStore((s) => s.ask.scope)
  const isFallback = response.answer === ASK_FALLBACK

  function handleAction(action: NonNullable<AskResponse['actions']>[number]) {
    runAskAction(action)
    if (action.type === 'open_source' || action.type === 'focus_graph') {
      navigate('/understand')
      if (action.type === 'open_source' && action.targetId) {
        window.setTimeout(() => {
          document.getElementById(`source-card-${action.targetId}`)?.scrollIntoView({
            block: 'nearest',
          })
        }, 80)
      }
    }
    if (
      (action.type === 'open_finding' || action.type === 'open_verification') &&
      action.targetId
    ) {
      const impact = action.type === 'open_verification' && askScope === 'impact'
      navigate(`/verify/${action.targetId}${impact ? '?panel=impact' : ''}`)
    }
  }

  return (
    <div>
      <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">Response</p>
      <p className="mt-2 text-[15px] leading-relaxed text-pm-ink">{response.answer}</p>

      {!isFallback && response.sourceIds.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-pm-muted">Sources</span>
          {response.sourceIds.map((id) => (
            <SourceLink key={id} sourceId={id} />
          ))}
        </div>
      ) : null}

      {response.toolTrace && response.toolTrace.length > 0 ? (
        <ul className="mt-3 grid gap-1 rounded-[8px] bg-pm-bg p-3">
          {response.toolTrace.map((step) => (
            <li key={step.label} className="type-trace text-pm-muted">
              {step.label}
              <span className="ml-2 text-pm-ink">{TRACE_STATUS[step.status]}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {response.actions && response.actions.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {response.actions.map((action) => (
            <Button
              key={`${action.type}-${action.targetId ?? action.label}`}
              variant="secondary"
              size="sm"
              onClick={() => handleAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
