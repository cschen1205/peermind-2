import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { EvidenceList } from '@/components/paper/EvidenceList'
import { KeyPointCard } from '@/components/paper/KeyPointCard'
import { GraphLegend, PaperGraph } from '@/components/paper/PaperGraph'
import { PaperPreview } from '@/components/paper/PaperPreview'
import { PaperSectionNav } from '@/components/paper/PaperSectionNav'
import { SourceInspector } from '@/components/paper/SourceInspector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getNode } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'

type MiddleTab = 'graph' | 'review'

export function UnderstandPage() {
  const pkg = useDemoStore((s) => s.package)
  const selectedPaperNodeId = useDemoStore((s) => s.selectedPaperNodeId)
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const [middleTab, setMiddleTab] = useState<MiddleTab>('graph')

  function selectPaperNode(nodeId: string) {
    if (!pkg) return
    const node = getNode(pkg, nodeId)
    if (!node) return
    focusSelection({ sourceIds: node.sourceIds, paperNodeId: node.id })
  }

  return (
    <WorkflowLayout stage="understand">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">01 / Understand</p>
          <h1 className="type-h1">Read the paper. Map the evidence.</h1>
          <p className="mt-3 max-w-[720px] text-pm-muted">
            A source-linked graph becomes key points, then the director plans which reviewers and
            verifiers to run.
          </p>
        </div>
        <Link to="/plan">
          <Button>Continue to Plan →</Button>
        </Link>
      </div>

      {pkg ? (
        <>
          <div className="mb-7">
            <p className="eyebrow">Paper summary</p>
            <p className="mb-4 max-w-[80ch] text-[15px] text-pm-ink">{pkg.paperSummary.overview}</p>
            <div className="grid grid-cols-4 gap-3 max-[1250px]:grid-cols-2 max-[760px]:grid-cols-1">
              {pkg.paperSummary.keyPoints.map((point) => (
                <KeyPointCard key={point.id} point={point} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[200px_minmax(0,1fr)_minmax(280px,340px)] gap-[18px] max-[1250px]:grid-cols-1">
            <Card className="flex h-[min(62vh,560px)] min-h-0 flex-col overflow-hidden p-4 shadow-none ring-0 max-[1250px]:h-[240px]">
              <ScrollArea className="h-full min-h-0 pr-1">
                <PaperSectionNav
                  sections={pkg.sections}
                  pane={middleTab === 'review' ? 'structure' : 'nodes'}
                />
              </ScrollArea>
            </Card>

            <Card className="flex h-[min(62vh,560px)] min-h-0 flex-col overflow-hidden p-0 shadow-none ring-0">
              <Tabs
                value={middleTab}
                onValueChange={(value) => {
                  if (value === 'graph' || value === 'review') setMiddleTab(value)
                }}
                className="flex min-h-0 flex-1 flex-col gap-0"
              >
                <div className="flex items-center justify-between gap-3 border-b border-pm-line px-[18px]">
                  <TabsList variant="line" className="h-auto gap-4 rounded-none bg-transparent p-0">
                    <TabsTrigger
                      value="graph"
                      className="rounded-none px-0 py-3.5 text-[13px] font-normal text-pm-muted data-active:text-pm-ink"
                    >
                      Paper Evidence Graph
                    </TabsTrigger>
                    <TabsTrigger
                      value="review"
                      className="rounded-none px-0 py-3.5 text-[13px] font-normal text-pm-muted data-active:text-pm-ink"
                    >
                      Paper Review
                    </TabsTrigger>
                  </TabsList>
                  {middleTab === 'graph' ? (
                    <GraphLegend graph={pkg.paperGraph} onNodeSelect={selectPaperNode} />
                  ) : null}
                </div>
                <div className="relative min-h-0 flex-1">
                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col',
                      middleTab !== 'graph' && 'pointer-events-none invisible',
                    )}
                    role="tabpanel"
                    aria-hidden={middleTab !== 'graph'}
                  >
                    <PaperGraph
                      graph={pkg.paperGraph}
                      selectedNodeId={selectedPaperNodeId}
                      onNodeSelect={selectPaperNode}
                      showHeader={false}
                    />
                  </div>
                  <div
                    className={cn(
                      'absolute inset-0 flex flex-col overflow-hidden',
                      middleTab !== 'review' && 'pointer-events-none invisible',
                    )}
                    role="tabpanel"
                    aria-hidden={middleTab !== 'review'}
                  >
                    <PaperPreview
                      paper={pkg.paper}
                      sourceRecords={pkg.sources}
                      activeSourceIds={selectedSourceIds}
                      pkg={pkg}
                      hideEyebrow
                      showEvidenceList={false}
                      className="h-full p-[18px]"
                      onSourceSelect={(sourceId) => focusSelection({ sourceIds: [sourceId] })}
                    />
                  </div>
                </div>
              </Tabs>
            </Card>

            <Card className="flex h-[min(62vh,560px)] min-h-0 flex-col overflow-hidden p-5 shadow-none ring-0">
              {middleTab === 'review' ? (
                <EvidenceList
                  sourceRecords={pkg.sources}
                  activeSourceIds={selectedSourceIds}
                  pkg={pkg}
                  className="h-full min-h-0 overflow-hidden"
                  onSourceSelect={(sourceId) => focusSelection({ sourceIds: [sourceId] })}
                />
              ) : (
                <SourceInspector
                  className="h-full min-h-0 overflow-hidden"
                  onRevealSource={() => setMiddleTab('review')}
                />
              )}
            </Card>
          </div>
        </>
      ) : (
        <EmptyState
          title="Upload a manuscript to inspect the paper graph."
          description="Workflow pages stay available after a valid PDF is processed on the landing page."
        />
      )}
    </WorkflowLayout>
  )
}
