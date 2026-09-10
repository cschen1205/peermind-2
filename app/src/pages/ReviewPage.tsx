import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WorkflowLayout } from '@/components/layout/WorkflowLayout'
import { CritiqueCard } from '@/components/review/CritiqueCard'
import { ReviewSummary } from '@/components/review/ReviewSummary'
import { VerificationContract } from '@/components/review/VerificationContract'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { findingIdsWithVerifications, getFinding } from '@/data/queryPackage'
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
  const nextFindingId = findingIdsWithVerifications(pkg)[0] ?? findings[0]?.id
  const draftNotes = pkg.reviewerRun.review.draftNotes ?? []
  const authorQuestions = pkg.reviewerRun.review.authorQuestions

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
          <p className="eyebrow">03 / Review</p>
          <h1 className="type-h1">Candidate findings, not the final review</h1>
          <p className="mt-3 max-w-[720px] text-pm-muted">
            Reviewers propose inspectable findings. The conference review is written after
            verification.
          </p>
        </div>
        {nextFindingId ? (
          <Link to={`/verify/${nextFindingId}`}>
            <Button>Continue to Verify →</Button>
          </Link>
        ) : null}
      </div>

      {draftNotes.length > 0 ? (
        <Accordion className="mb-5">
          <AccordionItem value="draft" className={sectionItemClass}>
            <AccordionTrigger className={sectionTriggerClass}>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1 pr-3 text-left">
                <span className="eyebrow mb-0">Reviewer draft (unverified)</span>
                <span className="text-[17px] font-[650] text-pm-ink">Unverified notes</span>
                <span className="text-[13px] font-normal text-pm-muted">
                  {draftNotes.length} notes · not the conference review
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className={sectionContentClass}>
              <ReviewSummary review={pkg.reviewerRun.review} hideQuestions />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}

      <Card className="p-5 shadow-none ring-0">
        <p className="eyebrow mb-1">Candidate findings</p>
        <h2 className="text-[17px] font-[650] text-pm-ink">Inspectable findings</h2>
        <p className="mt-1 text-[13px] text-pm-muted">
          {findings.length} findings · inspect a contract to open the paper
        </p>
        <div className="mt-5 grid gap-4">
          {findings.map((finding) => (
            <CritiqueCard
              key={finding.id}
              finding={finding}
              pkg={pkg}
              onInspect={inspectFinding}
            />
          ))}
        </div>
      </Card>

      {authorQuestions.length > 0 ? (
        <section className="mt-6 max-w-[80ch]">
          <p className="eyebrow mb-3">Questions for later calibration</p>
          <ul className="grid gap-2">
            {authorQuestions.map((item) => (
              <li key={item} className="text-[15px] text-pm-ink">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <VerificationContract
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

const sectionItemClass = 'rounded-[13px] border border-pm-line bg-pm-surface px-5'
const sectionTriggerClass = 'items-center py-4 hover:no-underline'
const sectionContentClass = '[&_a]:no-underline [&_p:not(:last-child)]:mb-0'
