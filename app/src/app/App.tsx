import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AskPeerMindDrawer } from '@/components/ask/AskPeerMindDrawer'
import { Toast } from '@/components/Toast'
import { useDemoStore, type DemoStage } from '@/store/demoStore'

const STAGE_BY_PATH: Record<string, DemoStage> = {
  '/': 'intake',
  '/understand': 'understand',
  '/review': 'review',
  '/report': 'report',
  '/compare': 'compare',
}

function stageFromPath(pathname: string): DemoStage {
  if (pathname.startsWith('/challenge')) return 'challenge'
  if (pathname.startsWith('/test')) return 'test'
  return STAGE_BY_PATH[pathname] ?? 'intake'
}

export function App({ children }: { children: ReactNode }) {
  const location = useLocation()
  const setStage = useDemoStore((s) => s.setStage)

  useEffect(() => {
    setStage(stageFromPath(location.pathname))
  }, [location.pathname, setStage])

  return (
    <>
      {children}
      <AskPeerMindDrawer />
      <Toast />
    </>
  )
}
