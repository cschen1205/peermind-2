import { useEffect, useMemo } from 'react'
import { reducePlayback, type PlaybackView } from '@/demo/playbackEngine'
import { useDemoStore, type PlaybackStatus } from '@/store/demoStore'
import type { FindingValidity } from '@/types/finding'
import type { PlaybackEvent, WorkflowNodeData } from '@/types/investigation'

const STEP_MS = 600

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function usePlayback({
  events,
  runId,
  nodes,
  initialVerdict,
  fallbackSourceIds,
}: {
  events: PlaybackEvent[]
  runId: string
  nodes: Pick<WorkflowNodeData, 'id' | 'kind'>[]
  initialVerdict: FindingValidity
  fallbackSourceIds?: string[]
}): {
  view: PlaybackView
  status: PlaybackStatus
  eventIndex: number
  play: () => void
  pause: () => void
  nextStep: () => void
  reset: () => void
  completeInstantly: () => void
} {
  const eventIndex = useDemoStore((s) => s.playback.eventIndex)
  const status = useDemoStore((s) => s.playback.status)
  const playbackRunId = useDemoStore((s) => s.playback.runId)
  const setPlaybackIndex = useDemoStore((s) => s.setPlaybackIndex)
  const setPlaybackStatus = useDemoStore((s) => s.setPlaybackStatus)
  const resetPlayback = useDemoStore((s) => s.resetPlayback)
  const focusSelection = useDemoStore((s) => s.focusSelection)

  useEffect(() => {
    if (playbackRunId !== runId) {
      resetPlayback(runId)
    }
  }, [playbackRunId, resetPlayback, runId])

  const view = useMemo(
    () => reducePlayback(events, eventIndex, nodes, initialVerdict),
    [events, eventIndex, initialVerdict, nodes],
  )

  const revealedKey = view.revealedSourceIds.join('|')
  const fallbackKey = (fallbackSourceIds ?? []).join('|')

  useEffect(() => {
    if (playbackRunId !== runId) return
    if (view.revealedSourceIds.length > 0) {
      focusSelection({ sourceIds: view.revealedSourceIds })
      return
    }
    if (fallbackSourceIds && fallbackSourceIds.length > 0) {
      focusSelection({ sourceIds: fallbackSourceIds })
    }
  }, [fallbackKey, fallbackSourceIds, focusSelection, playbackRunId, revealedKey, runId, view.revealedSourceIds])

  useEffect(() => {
    if (status !== 'playing') return
    if (eventIndex >= events.length) {
      setPlaybackStatus('complete')
      return
    }
    const delay = prefersReducedMotion() ? 0 : STEP_MS
    const timer = window.setTimeout(() => {
      const next = eventIndex + 1
      setPlaybackIndex(next)
      if (next >= events.length) {
        setPlaybackStatus('complete')
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [eventIndex, events.length, setPlaybackIndex, setPlaybackStatus, status])

  function play() {
    if (eventIndex >= events.length) return
    setPlaybackStatus('playing')
  }

  function pause() {
    if (status === 'playing') setPlaybackStatus('paused')
  }

  function nextStep() {
    if (eventIndex >= events.length) return
    const next = eventIndex + 1
    setPlaybackIndex(next)
    setPlaybackStatus(next >= events.length ? 'complete' : 'paused')
  }

  function reset() {
    resetPlayback(runId)
  }

  function completeInstantly() {
    setPlaybackIndex(events.length)
    setPlaybackStatus('complete')
  }

  return { view, status, eventIndex, play, pause, nextStep, reset, completeInstantly }
}