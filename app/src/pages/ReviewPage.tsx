import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { CritiqueCard } from '@/components/review/CritiqueCard'
import { CritiqueContract } from '@/components/review/CritiqueContract'
import { ReviewerRouter } from '@/components/review/ReviewerRouter'
import { ReviewerTeam } from '@/components/review/ReviewerTeam'
import { ReviewSummary } from '@/components/review/ReviewSummary'
import { RoutingCallouts } from '@/components/review/RoutingCallouts'
import { StatusPill } from '@/components/StatusPill'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { findingIdsWithInvestigations, getFinding } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'

export function ReviewPage() {
  const pkg = useDemoStore((s) => s.package)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const [contractFindingId, setContractFindingId] = useState<string>()

  if (!pkg) return null

  const findings = pkg.reviewerRun.review.findingIds.flatMap((id) => {
    const finding = getFinding(pkg, id)
    return finding ? [finding] : []
  })
  const contractFinding = contractFindingId ? getFinding(pkg, contractFindingId) : undefined
  const selectedAgents = pkg.reviewerRun.candidateAgents.filter((agent) => agent.selected)
  const nextFindingId = findingIdsWithInvestigations(pkg)[0] ?? findings[0]?.id

  function inspectFinding(id: string) {
    if (!pkg) return
    const next = getFinding(pkg, id)
    if (!next) return
    focusSelection({
      sourceIds: next.sourceIds[0] ? [next.sourceIds[0]] : next.sourceIds,
      findingId: next.id,
    })
    setContractFindingId(id)
  }

  return (
    <WorkflowLayout stage="review">
      <div className="mb-7 flex items-end justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="eyebrow">02 / Review</p>
          <h1 className="type-h1">A full review of the paper</h1>
          <p className="mt-3 max-w-[720px] text-pm-muted">
            Specialist routing is visible, then the review decomposes into inspectable findings.
          </p>
        </div>
        {nextFindingId ? (
          <Link to={`/challenge/${nextFindingId}`}>
            <Button>Continue to Challenge →</Button>
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 items-start gap-5 max-[960px]:grid-cols-1">
        <Accordion multiple defaultValue={['routing', 'review']} className="gap-3">
          <AccordionItem value="routing" className={sectionItemClass}>
            <AccordionTrigger className={sectionTriggerClass}>
              <SectionLabel
                eyebrow="Process"
                title="How reviewers were chosen"
                meta={`${pkg.reviewerRun.signals.length} signals · ${selectedAgents.length} specialists`}
              />
            </AccordionTrigger>
            <AccordionContent className={sectionContentClass}>
              <div className="grid gap-7 pb-2">
                <ReviewerRouter signals={pkg.reviewerRun.signals} />
                <ReviewerTeam agents={pkg.reviewerRun.candidateAgents} />
                <RoutingCallouts pkg={pkg} events={pkg.reviewerRun.routingEvents} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="review" className={sectionItemClass}>
            <AccordionTrigger className={sectionTriggerClass}>
              <SectionLabel
                eyebrow="Complete review"
                title="Assessment, strengths, and questions"
                meta={`${pkg.reviewerRun.review.strengths.length} strengths · ${pkg.reviewerRun.review.authorQuestions.length} questions`}
              />
            </AccordionTrigger>
            <AccordionContent className={sectionContentClass}>
              <ReviewSummary review={pkg.reviewerRun.review} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Card className="p-5 shadow-none ring-0">
          <SectionLabel
            eyebrow="Candidate critiques"
            title="Inspectable findings"
            meta={`${findings.length} findings · inspect a contract to open the paper`}
          />
          <Accordion className="mt-3">
            {findings.map((finding) => (
              <AccordionItem
                key={finding.id}
                value={finding.id}
                className="border-pm-line not-last:border-b"
              >
                <AccordionTrigger className="items-center gap-3 py-4 hover:no-underline">
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5 pr-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12px] text-pm-accent">{finding.id}</span>
                      <span className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-1 text-[12px] font-bold text-pm-muted-2">
                        {finding.category}
                      </span>
                    </span>
                    <span className="line-clamp-2 text-[14px] font-normal leading-snug text-pm-ink">
                      {finding.critique}
                    </span>
                  </span>
                  <StatusPill status={finding.validity} />
                </AccordionTrigger>
                <AccordionContent className={cn(sectionContentClass, 'pb-4')}>
                  <CritiqueCard
                    finding={finding}
                    pkg={pkg}
                    embedded
                    onInspect={inspectFinding}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      <CritiqueContract
        pkg={pkg}
        finding={contractFinding}
        open={Boolean(contractFinding)}
        onOpenChange={(open) => {
          if (!open) setContractFindingId(undefined)
        }}
      />
    </WorkflowLayout>
  )
}

const sectionItemClass =
  'rounded-[13px] border border-pm-line bg-pm-surface px-5 not-last:border-b-0'
const sectionTriggerClass = 'items-center py-4 hover:no-underline'
const sectionContentClass = '[&_a]:no-underline [&_p:not(:last-child)]:mb-0'

function SectionLabel({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string
  title: string
  meta?: string
}) {
  return (
    <span className="flex min-w-0 flex-1 flex-col items-start gap-1 pr-3 text-left">
      <span className="eyebrow mb-0">{eyebrow}</span>
      <span className="text-[17px] font-[650] text-pm-ink">{title}</span>
      {meta ? <span className="text-[13px] font-normal text-pm-muted">{meta}</span> : null}
    </span>
  )
}
