import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { MarkdownView } from '@/components/MarkdownView'
import { StatusPill } from '@/components/StatusPill'
import { SourceLink } from '@/components/paper/SourceLink'
import { Button } from '@/components/ui/button'
import { alignmentItemLabel, relationLabel } from '@/components/comparison/FindingAlignment'
import { useStickBelowHeader } from '@/components/comparison/useStickBelowHeader'
import {
  excerptsBySource,
  parseReviewerLabel,
  reviewsWithText,
} from '@/components/comparison/reviewerGroups'
import { getFinding } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { useDemoStore } from '@/store/demoStore'
import type { ComparisonTheme } from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'

type InspectorView = 'finding' | 'reviews'

function InspectorShell({ children }: { children: ReactNode }) {
  const { ref, style } = useStickBelowHeader()
  return (
    <div
      ref={ref}
      className="sticky z-10 self-start overflow-y-auto overscroll-y-contain bg-pm-bg max-[1100px]:static max-[1100px]:max-h-none max-[1100px]:overflow-visible"
      style={style}
    >
      {children}
    </div>
  )
}

export function ComparisonInspector({
  theme,
  pkg,
}: {
  theme?: ComparisonTheme
  pkg: DemoDataPackage
}) {
  const comparisonInputs = useDemoStore((s) => s.comparisonInputs)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const openAsk = useDemoStore((s) => s.openAsk)
  const uploadedReviews = reviewsWithText(comparisonInputs)
  const [view, setView] = useState<InspectorView>()
  const [activeReviewId, setActiveReviewId] = useState<string>()

  const excerpts = theme?.excerpts ?? []
  const groupedExcerpts = excerptsBySource({ excerpts })
  const reviewGroups =
    groupedExcerpts.length > 0 ? groupedExcerpts : [{ source: 'Reviews', items: excerpts }]
  const resolvedView: InspectorView =
    view ?? (theme && excerpts.length > 0 ? 'finding' : 'reviews')
  const findings = theme
    ? theme.peerMindFindingIds.map((id) => getFinding(pkg, id)).filter((item) => item !== undefined)
    : []
  const sourceIds = theme?.sourceIds ?? findings.flatMap((finding) => finding.sourceIds)
  const uniqueSources = [...new Set(sourceIds)]
  const activeReview =
    uploadedReviews.find((review) => review.id === activeReviewId) ?? uploadedReviews[0]
  const showReviews = resolvedView === 'reviews' || !theme

  if (!theme && uploadedReviews.length === 0) {
    return (
      <InspectorShell>
        <p className="eyebrow mb-3">Selected comparison item</p>
        <p className="text-[14px] text-pm-muted">Select a finding to inspect alignment.</p>
      </InspectorShell>
    )
  }

  return (
    <InspectorShell>
      <p className="eyebrow mb-3">
        {theme?.kind === 'question' ? 'Selected question' : 'Selected comparison item'}
      </p>
      {theme ? (
        <>
          <p className="type-h3">{alignmentItemLabel(theme, pkg)}</p>
          {findings.length > 0 ? (
            <p className="mt-1 font-mono text-[12px] text-pm-accent">
              {findings.map((finding) => finding.id).join(', ')}
            </p>
          ) : null}
          <p className="mt-2 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
            {relationLabel(theme)}
          </p>
        </>
      ) : (
        <p className="type-h3">Uploaded reviews</p>
      )}

      {theme && uploadedReviews.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { id: 'finding', label: theme.kind === 'question' ? 'This question' : 'This finding' },
              { id: 'reviews', label: 'Reviews' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                resolvedView === item.id
                  ? 'bg-pm-accent-soft text-pm-accent'
                  : 'bg-pm-status-unverified-fill text-pm-muted-2',
              )}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {showReviews ? (
        <section className="mt-5 rounded-[11px] border border-pm-line bg-pm-bg p-4">
          <p className="eyebrow">Uploaded reviews</p>
          {uploadedReviews.length === 0 ? (
            <p className="mt-2 text-[14px] text-pm-muted">No uploaded review text to display.</p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedReviews.map((review) => (
                  <button
                    key={review.id}
                    type="button"
                    className={cn(
                      'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                      review.id === activeReview?.id
                        ? 'bg-pm-accent-soft text-pm-accent'
                        : 'bg-pm-status-unverified-fill text-pm-muted-2',
                    )}
                    onClick={() => setActiveReviewId(review.id)}
                  >
                    {review.label}
                  </button>
                ))}
              </div>
              {activeReview ? (
                <div className="mt-4 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
                  <MarkdownView>{activeReview.reviewText}</MarkdownView>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : theme ? (
        <>
          <section className="mt-5 rounded-[11px] border border-pm-line bg-pm-bg p-4">
            <p className="eyebrow">
              {theme.kind === 'question' ? 'On this question' : 'On this finding'}
            </p>
            {excerpts.length === 0 ? (
              <p className="mt-2 text-[14px] text-pm-muted">
                No excerpt from the current uploaded reviews.
              </p>
            ) : (
              reviewGroups.map((group) => (
                <div key={group.source} className="mt-4">
                  <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                    {group.source}
                    {group.items.length > 1 ? ` · ${group.items.length}` : ''}
                  </p>
                  {group.items.map((excerpt) => {
                    const { member } = parseReviewerLabel(excerpt.reviewerLabel)
                    const showMember = member !== group.source
                    return (
                      <div key={`${excerpt.reviewId}-${excerpt.text.slice(0, 24)}`} className="mt-3">
                        {showMember ? (
                          <p className="text-[13px] font-[650] text-pm-ink">{member}</p>
                        ) : null}
                        <MarkdownView className="mt-1">{excerpt.text}</MarkdownView>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </section>

          <section className="mt-3 rounded-[11px] border border-pm-line bg-pm-surface p-4">
            <p className="eyebrow">
              {findings.length > 0 ? 'PeerMind finding' : 'Reviewer-only verification'}
            </p>
            {findings.length === 0 ? (
              <p className="mt-2 text-[14px] leading-relaxed text-pm-ink">
                PeerMind checked this reviewer finding against the manuscript with the same
                evidence-verdict and impact rules used for locked findings.
              </p>
            ) : (
              findings.map((finding) => (
                <div key={finding.id} className="mt-2">
                  <p className="font-mono text-[12px] text-pm-accent">{finding.id}</p>
                  <p className="type-quote mt-2 text-[22px]">{finding.critique}</p>
                  <Link to={`/verify/${finding.id}`} className="mt-3 inline-flex">
                    <Button variant="secondary" size="sm">
                      Inspect verification
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </section>

          {theme.explanation ? (
            <p className="mt-4 text-[14px] leading-relaxed text-pm-ink">{theme.explanation}</p>
          ) : null}

          {uniqueSources.length > 0 ? (
            <div className="mt-4">
              <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                Evidence
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueSources.map((id) => (
                  <SourceLink key={id} sourceId={id} />
                ))}
              </div>
            </div>
          ) : null}

          {theme.verificationStatus ? (
            <div className="mt-4">
              <p className="mb-2 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
                Verification status
              </p>
              <StatusPill status={theme.verificationStatus} kind="status" />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={uniqueSources.length === 0}
              onClick={() => {
                const first = uniqueSources[0]
                if (!first) return
                focusSelection({ sourceIds: uniqueSources })
                document.getElementById(`source-card-${first}`)?.scrollIntoView({
                  block: 'nearest',
                  behavior: 'smooth',
                })
              }}
            >
              Open source
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openAsk('comparison', [theme.id])}
            >
              <Search size={14} strokeWidth={1.75} />
              Ask about this comparison
            </Button>
          </div>
        </>
      ) : null}
    </InspectorShell>
  )
}
