import { FastForward, Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PlaybackStatus } from '@/store/demoStore'

export function PlaybackControls({
  status,
  eventIndex,
  eventCount,
  onPlay,
  onPause,
  onNext,
  onReset,
  onComplete,
}: {
  status: PlaybackStatus
  eventIndex: number
  eventCount: number
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onReset: () => void
  onComplete: () => void
}) {
  const atEnd = eventCount === 0 || eventIndex >= eventCount
  const playing = status === 'playing'

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      {playing ? (
        <Button variant="secondary" size="sm" onClick={onPause}>
          <Pause size={16} strokeWidth={1.75} />
          Pause
        </Button>
      ) : (
        <Button variant="secondary" size="sm" disabled={atEnd} onClick={onPlay}>
          <Play size={16} strokeWidth={1.75} />
          Play
        </Button>
      )}
      <Button variant="secondary" size="sm" disabled={atEnd || playing} onClick={onNext}>
        <StepForward size={16} strokeWidth={1.75} />
        Next step
      </Button>
      <Button variant="secondary" size="sm" onClick={onReset}>
        <RotateCcw size={16} strokeWidth={1.75} />
        Reset
      </Button>
      <Button variant="secondary" size="sm" disabled={atEnd} onClick={onComplete}>
        <FastForward size={16} strokeWidth={1.75} />
        Complete instantly
      </Button>
      <span className="ml-auto font-mono text-[12px] text-pm-muted">
        {eventIndex} / {eventCount}
      </span>
    </div>
  )
}
