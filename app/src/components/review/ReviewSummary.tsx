import type { ReviewDocument } from '@/types/finding'

export function ReviewSummary({ review }: { review: ReviewDocument }) {
  return (
    <div className="grid gap-7">
      <section>
        <p className="eyebrow">Overall assessment</p>
        <p className="max-w-[80ch] text-[16px] leading-[1.55] text-pm-ink">
          {review.overallAssessment}
        </p>
      </section>
      <section>
        <p className="eyebrow">Strengths</p>
        <ul className="grid max-w-[80ch] gap-2">
          {review.strengths.map((item) => (
            <li key={item} className="text-[15px] text-pm-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>
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
    </div>
  )
}
