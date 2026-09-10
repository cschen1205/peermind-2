import type { LockedRun } from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'
import { loadDemoPackage } from './loadDemoPackage'

const SESSION_KEY = 'peermind-demo-session'

export interface SessionSnapshot {
  package: DemoDataPackage
  lockedRun?: LockedRun
  selectedFindingId?: string
}

function canUseStorage() {
  return typeof sessionStorage !== 'undefined'
}

export function readSessionSnapshot(): SessionSnapshot | undefined {
  if (!canUseStorage()) return undefined
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as SessionSnapshot
    const loaded = loadDemoPackage(parsed.package)
    if (!loaded.ok) {
      sessionStorage.removeItem(SESSION_KEY)
      return undefined
    }

    const lockedRun = parsed.lockedRun
    const lockValid =
      lockedRun &&
      Array.isArray(lockedRun.findingIds) &&
      lockedRun.findingIds.every((id) => loaded.data.findings.some((finding) => finding.id === id))

    return {
      package: loaded.data,
      lockedRun: lockValid ? lockedRun : undefined,
      selectedFindingId:
        parsed.selectedFindingId &&
        loaded.data.findings.some((finding) => finding.id === parsed.selectedFindingId)
          ? parsed.selectedFindingId
          : loaded.data.findings[0]?.id,
    }
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return undefined
  }
}

export function writeSessionSnapshot(snapshot: SessionSnapshot | undefined) {
  if (!canUseStorage()) return
  if (!snapshot) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
}
