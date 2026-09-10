import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AskPeerMindDrawer } from '@/components/ask/AskPeerMindDrawer'
import { Toast } from '@/components/Toast'
import { useDemoStore, type DemoStage } from '@/store/demoStore'

const STAGE_BY_PATH: Record<string, DemoStage> = {
  '/': 'intake',
  '/understand': 'understand',
  '/plan': 'plan',
  '/review': 'review',
  '/synthesize': 'synthesize',
  '/compare': 'compare',
  '/revise': 'revise',
}

function stageFromPath(pathname: string): DemoStage {
  if (pathname.startsWith('/verify')) return 'verify'
  return STAGE_BY_PATH[pathname] ?? 'intake'
}

export function App({ children }: { children: ReactNode }) {
  const location = useLocation()
  const setStage = useDemoStore((s) => s.setStage)
  const syncPreparedPackage = useDemoStore((s) => s.syncPreparedPackage)

  useEffect(() => {
    setStage(stageFromPath(location.pathname))
  }, [location.pathname, setStage])

  useEffect(() => {
    void syncPreparedPackage()
  }, [syncPreparedPackage])

  return (
    <>
      {children}
      <AskPeerMindDrawer />
      <Toast />
    </>
  )
}
