import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { DefenderFlow } from '@/components/defender/DefenderFlow'
import { EvidenceLedger } from '@/components/defender/EvidenceLedger'
import { FindingVerdict } from '@/components/defender/FindingVerdict'
import { LiveInspector } from '@/components/defender/LiveInspector'
import { PlaybackControls } from '@/components/defender/PlaybackControls'
import { ReplanStatus } from '@/components/defender/ReplanStatus'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { inspectWorkflowNode } from '@/demo/playbackEngine'
import { usePlayback } from '@/demo/usePlayback'
import {
  findingIdsWithInvestigations,
  getCounterfactual,
  getFinding,
  getInvestigation,
} from '@/data/queryPackage'
import { useDemoStore } from '@/store/demoStore'

export function ChallengePage() {
  const { findingId = '' } = useParams()
  const pkg = useDemoStore((s) => s.package)

  if (!pkg) return null

  const finding = getFinding(pkg, findingId)
  const investigation = getInvestigation(pkg, findingId)
  const hasTest = Boolean(getCounterfactual(pkg, findingId))
  const otherInvestigations = findingIdsWithInvestigations(pkg).filter((id) => id !== findingId)

  return (
    <WorkflowLayout stage="challenge">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">03 / Challenge{finding ? ` / ${finding.id}` : ''}</p>
          <h1 className="type-h1">How should this review be answered?</h1>
        </div>
        <Link to="/review" className="no-print">
          <Button variant="secondary">All findings</Button>
        </Link>
      </div>

      {finding ? <p className="type-quote mb-8 max-w-[52rem]">{finding.critique}</p> : null}

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
      ) : !investigation ? (
        <EmptyState
          title="No prepared investigation for this finding"
          description="This demo package only includes defender playback for selected findings. Open a prepared investigation or continue to the report."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {otherInvestigations.map((id) => (
                <Link key={id} to={`/challenge/${id}`}>
                  <Button size="sm">Open {id}</Button>
                </Link>
              ))}
              <Link to="/report">
                <Button variant="secondary" size="sm">
                  Continue to Report
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <ChallengeInvestigation
          pkg={pkg}
          findingId={finding.id}
          sourceIds={finding.sourceIds}
          hasTest={hasTest}
        />
      )}
    </WorkflowLayout>
  )
}

function ChallengeInvestigation({
  pkg,
  findingId,
  sourceIds,
  hasTest,
}: {
  pkg: NonNullable<ReturnType<typeof useDemoStore.getState>['package']>
  findingId: string
  sourceIds: string[]
  hasTest: boolean
}) {
  const investigation = getInvestigation(pkg, findingId)
  if (!investigation) return null

  return (
    <ChallengePlayback
      pkg={pkg}
      findingId={findingId}
      sourceIds={sourceIds}
      hasTest={hasTest}
      investigation={investigation}
    />
  )
}

function ChallengePlayback({
  pkg,
  findingId,
  sourceIds,
  hasTest,
  investigation,
}: {
  pkg: NonNullable<ReturnType<typeof useDemoStore.getState>['package']>
  findingId: string
  sourceIds: string[]
  hasTest: boolean
  investigation: NonNullable<ReturnType<typeof getInvestigation>>
}) {
  const playback = usePlayback({
    events: investigation.events,
    runId: `challenge:${findingId}`,
    nodes: investigation.workflowNodes,
    initialVerdict: investigation.initialVerdict,
    fallbackSourceIds: sourceIds,
  })
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedNodeId(null)
  }, [findingId])

  const currentNodeId = useMemo(
    () =>
      Object.entries(playback.view.nodeStates).find(([, state]) => state === 'current')?.[0] ??
      null,
    [playback.view.nodeStates],
  )
  const lastActiveNodeId = useMemo(() => {
    let last: string | null = null
    for (const event of investigation.events.slice(0, playback.eventIndex)) {
      if (event.type === 'activate_node' || event.type === 'complete_node') {
        last = event.nodeId
      }
    }
    return last
  }, [investigation.events, playback.eventIndex])
  const inspectedNodeId = selectedNodeId ?? currentNodeId ?? lastActiveNodeId
  const inspection = inspectedNodeId
    ? inspectWorkflowNode(
        inspectedNodeId,
        investigation.events,
        playback.eventIndex,
        investigation.workflowNodes,
        investigation.workflowEdges,
        playback.view.nodeStates,
      )
    : undefined

  const verdict = playback.view.currentVerdict ?? investigation.initialVerdict

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-[18px] max-[1250px]:grid-cols-1">
        <Card className="overflow-hidden p-0 shadow-none ring-0">
          <div className="flex items-end justify-between gap-3 px-5 pt-4">
            <p className="eyebrow">Defender workflow</p>
            <p className="pb-0.5 text-[12px] text-pm-muted">Click a step to inspect it</p>
          </div>
          <DefenderFlow
            workflowNodes={investigation.workflowNodes}
            workflowEdges={investigation.workflowEdges}
            nodeStates={playback.view.nodeStates}
            selectedNodeId={inspectedNodeId ?? undefined}
            onNodeSelect={setSelectedNodeId}
          />
        </Card>
        <Card className="sticky top-4 max-h-[560px] overflow-hidden p-5 shadow-none ring-0 max-[1250px]:static max-[1250px]:max-h-none">
          <ScrollArea className="h-[min(52vh,520px)] max-[1250px]:h-auto pr-2">
            <LiveInspector
              pkg={pkg}
              ledger={investigation.finalLedger}
              message={playback.view.currentMessage}
              inspection={inspection}
            />
          </ScrollArea>
        </Card>
      </div>

      <div className="mt-6">
        <EvidenceLedger
          ledger={investigation.finalLedger}
          visibleIds={playback.view.visibleEvidenceIds}
        />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(240px,380px)] gap-4 max-[1100px]:grid-cols-1">
        <FindingVerdict
          status={verdict}
          limitations={investigation.limitations}
          stopReason={playback.view.stopReason}
        />
        <ReplanStatus pkg={pkg} replan={playback.view.activeReplan} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <PlaybackControls
          status={playback.status}
          eventIndex={playback.eventIndex}
          eventCount={investigation.events.length}
          onPlay={playback.play}
          onPause={playback.pause}
          onNext={playback.nextStep}
          onReset={playback.reset}
          onComplete={playback.completeInstantly}
        />
        {hasTest ? (
          <Link to={`/test/${findingId}`} className="no-print">
            <Button>Continue to Test →</Button>
          </Link>
        ) : (
          <Link to="/report" className="no-print">
            <Button variant="secondary">Continue to Report →</Button>
          </Link>
        )}
      </div>
    </>
  )
}
