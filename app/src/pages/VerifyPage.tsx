import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { ImpactPanel } from '@/components/impact/ImpactPanel'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EvidenceLedger } from '@/components/verification/EvidenceLedger'
import { EvidenceVerdict } from '@/components/verification/EvidenceVerdict'
import { LiveInspector } from '@/components/verification/LiveInspector'
import { ReplanStatus } from '@/components/verification/ReplanStatus'
import { ToolTrace } from '@/components/verification/ToolTrace'
import {
  VerificationFlow,
  verificationGraphHeight,
} from '@/components/verification/VerificationFlow'
import { inspectWorkflowNode, reducePlayback } from '@/demo/playbackEngine'
import {
  findingIdsWithVerifications,
  getFinding,
  getImpactAssessment,
  getVerification,
} from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import { SEVERITY_LEVEL_LABELS } from '@/types/finding'

export function VerifyPage() {
  const { findingId = '' } = useParams()
  const pkg = useDemoStore((s) => s.package)
  const verifyPanel = useDemoStore((s) => s.verifyPanel)
  const setVerifyPanel = useDemoStore((s) => s.setVerifyPanel)
  const [searchParams, setSearchParams] = useSearchParams()

  if (!pkg) return null

  const finding = getFinding(pkg, findingId)
  const verification = getVerification(pkg, findingId)
  const impact = getImpactAssessment(pkg, findingId)
  const otherVerifications = findingIdsWithVerifications(pkg).filter((id) => id !== findingId)

  function selectPanel(panel: 'evidence' | 'impact') {
    setVerifyPanel(panel)
    const next = new URLSearchParams(searchParams)
    if (panel === 'impact') next.set('panel', 'impact')
    else next.delete('panel')
    setSearchParams(next, { replace: true })
  }

  return (
    <WorkflowLayout stage="verify">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">04 / Verify{finding ? ` / ${finding.id}` : ''}</p>
          <h1 className="type-h1">Collect evidence for this finding.</h1>
          {finding ? (
            <p className="mt-3 text-[14px] text-pm-muted">
              Proposed severity: {SEVERITY_LEVEL_LABELS[finding.proposedSeverity]}
            </p>
          ) : null}
        </div>
        <Link to="/review" className="no-print">
          <Button variant="secondary">All findings</Button>
        </Link>
      </div>

      {finding ? <p className="type-quote mb-6 max-w-[52rem]">{finding.critique}</p> : null}

      <div
        className="mb-6 inline-flex rounded-[9px] bg-pm-status-unverified-fill p-1"
        role="tablist"
        aria-label="Verification panels"
      >
        {(['evidence', 'impact'] as const).map((panel) => {
          const active = verifyPanel === panel
          return (
            <button
              key={panel}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                'rounded-[8px] px-3.5 py-1.5 text-[14px] font-[650] capitalize',
                active
                  ? 'bg-pm-surface text-pm-ink shadow-[0_1px_4px_#0000000C]'
                  : 'text-pm-muted hover:text-pm-ink',
              )}
              onClick={() => selectPanel(panel)}
            >
              {panel}
            </button>
          )
        })}
      </div>

      {!finding ? (
        <EmptyState
          title="Finding not in this package"
          description="Return to Review and choose a critique that exists in the loaded demo package."
          action={
            <Link to="/review">
              <Button variant="secondary">All findings</Button>
            </Link>
          }
        />
      ) : !verification ? (
        <EmptyState
          title="No prepared verification for this finding"
          description="This demo package only includes verification playback for selected findings. Open a prepared verification or continue to Synthesize."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {otherVerifications.map((id) => (
                <Link key={id} to={`/verify/${id}`}>
                  <Button size="sm">Open {id}</Button>
                </Link>
              ))}
              <Link to="/synthesize">
                <Button variant="secondary" size="sm">
                  Continue to Synthesize
                </Button>
              </Link>
            </div>
          }
        />
      ) : verifyPanel === 'impact' ? (
        <ImpactPanel
          pkg={pkg}
          findingId={finding.id}
          evidenceVerdict={finding.evidenceVerdict}
          onBack={() => selectPanel('evidence')}
        />
      ) : (
        <EvidencePlayback
          key={finding.id}
          pkg={pkg}
          verification={verification}
          hasImpact={Boolean(impact)}
          onOpenImpact={() => selectPanel('impact')}
        />
      )}
    </WorkflowLayout>
  )
}

function EvidencePlayback({
  pkg,
  verification,
  hasImpact,
  onOpenImpact,
}: {
  pkg: NonNullable<ReturnType<typeof useDemoStore.getState>['package']>
  verification: NonNullable<ReturnType<typeof getVerification>>
  hasImpact: boolean
  onOpenImpact: () => void
}) {
  const eventIndex = verification.events.length
  const view = useMemo(
    () =>
      reducePlayback(
        verification.events,
        eventIndex,
        verification.workflowNodes,
        verification.evidenceVerdict,
      ),
    [eventIndex, verification],
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const lastActiveNodeId = useMemo(() => {
    let last: string | null = null
    for (const event of verification.events) {
      if (
        event.type === 'activate_node' ||
        event.type === 'complete_node' ||
        event.type === 'skip_node'
      ) {
        last = event.nodeId
      }
    }
    return last
  }, [verification.events])
  const inspectedNodeId = selectedNodeId ?? lastActiveNodeId
  const inspection = inspectedNodeId
    ? inspectWorkflowNode(
        inspectedNodeId,
        verification.events,
        eventIndex,
        verification.workflowNodes,
        verification.workflowEdges,
        view.nodeStates,
      )
    : undefined

  const verdict = view.currentVerdict ?? verification.evidenceVerdict
  const graphHeight = verificationGraphHeight(verification.workflowNodes)

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-[18px] max-[1250px]:grid-cols-1">
        <div className="grid gap-2">
          <div className="flex items-end justify-between gap-3 px-1">
            <p className="eyebrow mb-0">Verification workflow</p>
            <p className="text-[12px] text-pm-muted">Click a step to inspect it</p>
          </div>
          <Card className="min-h-0 gap-0 overflow-hidden p-0 shadow-none ring-0">
            <VerificationFlow
              workflowNodes={verification.workflowNodes}
              workflowEdges={verification.workflowEdges}
              nodeStates={view.nodeStates}
              selectedNodeId={inspectedNodeId ?? undefined}
              onNodeSelect={setSelectedNodeId}
            />
          </Card>
        </div>
        <div className="grid gap-2">
          <p className="eyebrow mb-0 px-1">Action</p>
          <Card
            className="flex min-h-0 flex-col overflow-hidden p-4 shadow-none ring-0"
            style={{ height: graphHeight }}
          >
            <div className="min-h-0 h-full overflow-y-auto overscroll-contain pr-1">
              <LiveInspector
                pkg={pkg}
                ledger={verification.ledger}
                message={view.currentMessage}
                inspection={inspection}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <EvidenceLedger
          ledger={verification.ledger}
          visibleIds={view.visibleEvidenceIds}
        />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(240px,380px)] items-start gap-4 max-[1100px]:grid-cols-1">
        <div className="grid gap-4">
          <EvidenceVerdict
            status={verdict}
            limitations={verification.limitations}
            stopReason={view.stopReason}
          />
          <ReplanStatus pkg={pkg} replan={view.activeReplan} />
        </div>
        <ToolTrace verification={verification} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2 no-print">
        {hasImpact ? (
          <Button variant="secondary" onClick={onOpenImpact}>
            Open Impact
          </Button>
        ) : null}
        <Link to="/synthesize">
          <Button>Continue to Synthesize →</Button>
        </Link>
      </div>
    </>
  )
}
