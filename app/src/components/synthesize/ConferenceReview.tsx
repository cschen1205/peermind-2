import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { CONFERENCE_STYLE_LABELS } from '@/data/reviewStyles'
import { cn } from '@/lib/utils'
import type { ReviewRating, SynthesisDefinition } from '@/types/demoPackage'

function ReviewProse({ text }: { text: string }) {
  return (
    <div className="grid max-w-[90ch] gap-3">
      {text.split(/\n\n+/).map((paragraph) => (
        <p key={paragraph} className="text-[15px] leading-relaxed text-pm-ink">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function ReviewList({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  if (items.length === 0) return null
  const List = numbered ? 'ol' : 'ul'
  return (
    <List className={cn('mt-2 grid max-w-[90ch] gap-3', numbered && 'list-decimal pl-5')}>
      {items.map((item) => (
        <li key={item} className="text-[15px] leading-relaxed text-pm-ink">
          {item}
        </li>
      ))}
    </List>
  )
}

function ReviewSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <p className="eyebrow mb-2">{title}</p>
      {children}
    </section>
  )
}

function ReviewRatings({ ratings }: { ratings: ReviewRating[] }) {
  const overall = ratings.find((item) => item.label === 'Rating')
  const rest = ratings.filter((item) => item.label !== 'Rating')

  return (
    <section className="rounded-[11px] border border-pm-line bg-pm-bg-subtle px-5 py-4">
      <p className="eyebrow mb-3">Official review scores</p>
      {overall ? (
        <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-1">
          <p className="text-[13px] font-[650] tracking-[0.08em] text-pm-muted uppercase">
            Rating
          </p>
          <p className="font-[650] text-[28px] leading-none text-pm-ink">
            {overall.score}
            <span className="text-[16px] text-pm-muted"> / {overall.scale}</span>
          </p>
          <p className="text-[15px] text-pm-ink">{overall.scaleLabel}</p>
        </div>
      ) : null}
      <dl className="grid gap-2 sm:grid-cols-2">
        {rest.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline justify-between gap-3 border-t border-pm-line pt-2"
          >
            <dt className="text-[13px] text-pm-muted">{item.label}</dt>
            <dd className="text-right text-[15px] text-pm-ink">
              <span className="font-[650]">
                {item.score} / {item.scale}
              </span>
              <span className="text-pm-muted"> · {item.scaleLabel}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function ConferenceReview({ synthesis }: { synthesis: SynthesisDefinition }) {
  return (
    <Card className="grid gap-6 p-6 shadow-none ring-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-3">Conference review</p>
          <h2 className="type-h3">Calibrated conference review</h2>
        </div>
        <p className="text-[13px] font-[650] text-pm-muted">
          Conference style: {CONFERENCE_STYLE_LABELS[synthesis.conferenceStyle]}
        </p>
      </div>

      {synthesis.ratings && synthesis.ratings.length > 0 ? (
        <ReviewRatings ratings={synthesis.ratings} />
      ) : null}

      <ReviewSection title="Summary">
        <ReviewProse text={synthesis.summary} />
      </ReviewSection>

      {synthesis.strengths.length > 0 ? (
        <ReviewSection title="Strengths">
          <ReviewList items={synthesis.strengths} />
        </ReviewSection>
      ) : null}

      {synthesis.majorWeaknesses.length > 0 ? (
        <ReviewSection title="Major weaknesses">
          <ReviewList items={synthesis.majorWeaknesses} numbered />
        </ReviewSection>
      ) : null}

      {synthesis.minorWeaknesses.length > 0 ? (
        <ReviewSection title="Minor weaknesses">
          <ReviewList items={synthesis.minorWeaknesses} numbered />
        </ReviewSection>
      ) : null}

      {synthesis.authorQuestions.length > 0 ? (
        <ReviewSection title="Questions for authors">
          <ReviewList items={synthesis.authorQuestions} numbered />
        </ReviewSection>
      ) : null}

      {synthesis.evidenceNotes && synthesis.evidenceNotes.length > 0 ? (
        <ReviewSection title="Comments">
          <ReviewList items={synthesis.evidenceNotes} />
        </ReviewSection>
      ) : null}

      {synthesis.recommendation ? (
        <ReviewSection title="Overall assessment">
          <ReviewProse text={synthesis.recommendation} />
        </ReviewSection>
      ) : null}

      {synthesis.confidence ? (
        <ReviewSection title="Confidence">
          <ReviewProse text={synthesis.confidence} />
        </ReviewSection>
      ) : null}
    </Card>
  )
}
