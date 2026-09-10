import type { ReviewDocument } from '@/types/finding'

export function ReviewSummary({
  review,
  hideQuestions = false,
}: {
  review: ReviewDocument
  hideQuestions?: boolean
}) {
  const notes = review.draftNotes ?? []

  return (
    <div className="grid gap-7">
      <section>
        <p className="eyebrow">Reviewer draft (unverified)</p>
        {notes.length === 0 ? (
          <p className="max-w-[80ch] text-[16px] leading-[1.55] text-pm-muted">
            Candidate findings only. The conference review is written after verification.
          </p>
        ) : (
          <ul className="grid max-w-[80ch] gap-2">
            {notes.map((item) => (
              <li key={item} className="text-[16px] leading-[1.55] text-pm-ink">
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>
      {!hideQuestions && review.authorQuestions.length > 0 ? (
        <section>
          <p className="eyebrow">Questions</p>
          <ul className="grid max-w-[80ch] gap-2">
            {review.authorQuestions.map((item) => (
              <li key={item} className="text-[15px] text-pm-ink">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
