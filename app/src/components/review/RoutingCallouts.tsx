import { getAgentLabel } from '@/data/queryPackage'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { PlaybackEvent } from '@/types/investigation'

function calloutsFromEvents(pkg: DemoDataPackage, events: PlaybackEvent[]) {
  const messages = events.flatMap((event) => (event.type === 'message' ? [event.text] : []))
  const spawned = events.flatMap((event) =>
    event.type === 'spawn_agent' ? [getAgentLabel(pkg, event.agentId)] : [],
  )
  const stops = events.flatMap((event) => (event.type === 'stop' ? [event.reason] : []))
  return { messages, spawned, stops }
}

export function RoutingCallouts({
  pkg,
  events,
}: {
  pkg: DemoDataPackage
  events: PlaybackEvent[]
}) {
  const { messages, spawned, stops } = calloutsFromEvents(pkg, events)
  if (messages.length === 0 && spawned.length === 0 && stops.length === 0) {
    return null
  }

  return (
    <aside className="rounded-[8px] border-l-[3px] border-pm-accent bg-pm-accent-soft px-4 py-3.5">
      <p className="text-[12px] font-bold tracking-[0.15em] text-pm-accent uppercase">
        Routing decision
      </p>
      {messages.map((text) => (
        <p key={text} className="mt-2 text-[14px] text-pm-ink">
          {text}
        </p>
      ))}
      {spawned.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-[14px] text-pm-ink">
          {spawned.map((label) => (
            <li key={label}>→ {label}</li>
          ))}
        </ul>
      ) : null}
      {stops.map((reason) => (
        <div key={reason} className="mt-3">
          <p className="text-[12px] font-bold tracking-[0.15em] text-pm-accent uppercase">
            Stop rule reached
          </p>
          <p className="mt-1 text-[14px] text-pm-ink">{reason}</p>
        </div>
      ))}
    </aside>
  )
}
