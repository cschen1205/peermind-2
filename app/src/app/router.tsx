import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { ArchitecturePage } from '@/pages/ArchitecturePage'
import { ComparePage } from '@/pages/ComparePage'
import { LandingPage } from '@/pages/LandingPage'
import { ChallengePage } from '@/pages/ChallengePage'
import { CounterfactualPage } from '@/pages/CounterfactualPage'
import { ReportPage } from '@/pages/ReportPage'
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

function FindingRedirect({ base }: { base: 'challenge' | 'test' }) {
  const findingId = useDemoStore((s) => s.selectedFindingId ?? s.package?.findings[0]?.id)
  if (!findingId) {
    return <Navigate to="/understand" replace />
  }
  return <Navigate to={`/${base}/${findingId}`} replace />
}

function SyncFinding() {
  const { findingId } = useParams()
  const setSelectedFindingId = useDemoStore((s) => s.setSelectedFindingId)

  useEffect(() => {
    if (findingId) {
      setSelectedFindingId(findingId)
    }
  }, [findingId, setSelectedFindingId])

  return <Outlet />
}

export const appRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/intake', element: <Navigate to="/" replace /> },
  { path: '/architecture', element: <ArchitecturePage /> },
  {
    element: <RequirePackage />,
    children: [
      { path: '/understand', element: <UnderstandPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/challenge', element: <FindingRedirect base="challenge" /> },
      {
        path: '/challenge/:findingId',
        element: <SyncFinding />,
        children: [{ index: true, element: <ChallengePage /> }],
      },
      { path: '/test', element: <FindingRedirect base="test" /> },
      {
        path: '/test/:findingId',
        element: <SyncFinding />,
        children: [{ index: true, element: <CounterfactualPage /> }],
      },
      { path: '/report', element: <ReportPage /> },
      { path: '/compare', element: <ComparePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]
