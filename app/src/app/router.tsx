import { useEffect } from 'react'
import { Navigate, Outlet, useParams, useSearchParams } from 'react-router-dom'
import { ArchitecturePage } from '@/pages/ArchitecturePage'
import { ComparePage } from '@/pages/ComparePage'
import { LandingPage } from '@/pages/LandingPage'
import { VerifyPage } from '@/pages/VerifyPage'
import { PlanPage } from '@/pages/PlanPage'
import { RevisePage } from '@/pages/RevisePage'
import { SynthesizePage } from '@/pages/SynthesizePage'
import { ReviewPage } from '@/pages/ReviewPage'
import { UnderstandPage } from '@/pages/UnderstandPage'
import { useDemoStore } from '@/store/demoStore'

function RequirePackage() {
  const ready = useDemoStore((s) => s.packageStatus === 'ready')
  if (!ready) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

function FindingRedirect({
  base,
  panel,
}: {
  base: 'verify'
  panel?: 'evidence' | 'impact'
}) {
  const findingId = useDemoStore((s) => s.selectedFindingId ?? s.package?.findings[0]?.id)
  if (!findingId) {
    return <Navigate to="/understand" replace />
  }
  const search = panel === 'impact' ? '?panel=impact' : ''
  return <Navigate to={`/${base}/${findingId}${search}`} replace />
}

function SyncFinding() {
  const { findingId } = useParams()
  const [searchParams] = useSearchParams()
  const setSelectedFindingId = useDemoStore((s) => s.setSelectedFindingId)
  const setVerifyPanel = useDemoStore((s) => s.setVerifyPanel)

  useEffect(() => {
    if (findingId) {
      setSelectedFindingId(findingId)
    }
  }, [findingId, setSelectedFindingId])

  useEffect(() => {
    setVerifyPanel(searchParams.get('panel') === 'impact' ? 'impact' : 'evidence')
  }, [searchParams, setVerifyPanel])

  return <Outlet />
}

export const appRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/intake', element: <Navigate to="/" replace /> },
  { path: '/architecture', element: <ArchitecturePage /> },
  { path: '/revise', element: <RevisePage /> },
  {
    element: <RequirePackage />,
    children: [
      { path: '/understand', element: <UnderstandPage /> },
      { path: '/plan', element: <PlanPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/verify', element: <FindingRedirect base="verify" /> },
      {
        path: '/verify/:findingId',
        element: <SyncFinding />,
        children: [{ index: true, element: <VerifyPage /> }],
      },
      { path: '/synthesize', element: <SynthesizePage /> },
      { path: '/compare', element: <ComparePage /> },
      { path: '/challenge', element: <Navigate to="/verify" replace /> },
      { path: '/challenge/:findingId', element: <VerifyLegacyRedirect /> },
      { path: '/test', element: <FindingRedirect base="verify" panel="impact" /> },
      { path: '/test/:findingId', element: <TestLegacyRedirect /> },
      { path: '/report', element: <Navigate to="/synthesize" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]

function VerifyLegacyRedirect() {
  const { findingId } = useParams()
  return <Navigate to={findingId ? `/verify/${findingId}` : '/verify'} replace />
}

function TestLegacyRedirect() {
  const { findingId } = useParams()
  return (
    <Navigate to={findingId ? `/verify/${findingId}?panel=impact` : '/verify?panel=impact'} replace />
  )
}
