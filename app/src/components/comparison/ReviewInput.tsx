import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { emptyHumanReview } from '@/data/adapters/comparisonInputAdapter'
import { cn } from '@/lib/utils'
import type { ComparisonInputBundle, HumanReviewInput } from '@/types/comparison'

type OptionalKey = 'metaReview' | 'authorRebuttal' | 'baselineReview'

const OPTIONALS: { key: OptionalKey; label: string; addLabel: string; amber?: boolean }[] = [
  { key: 'metaReview', label: 'Meta-review', addLabel: '+ Meta-review' },
  { key: 'authorRebuttal', label: 'Author rebuttal', addLabel: '+ Author rebuttal', amber: true },
  { key: 'baselineReview', label: 'Baseline LLM review', addLabel: '+ Baseline LLM review' },
]

function ReviewCard({
  review,
  amber,
  onChange,
  onRemove,
}: {
  review: HumanReviewInput
  amber?: boolean
  onChange: (text: string) => void
  onRemove?: () => void
}) {
  return (
    <Card
      className={cn(
        'gap-3 rounded-[11px] p-4 shadow-none ring-0',
        amber ? 'border-[#ead9b3] bg-[#fff9e9]' : 'border-pm-line bg-pm-surface',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Human review</p>
          <p className="mt-1 text-[15px] font-[650] text-pm-ink">{review.label}</p>
        </div>
        {onRemove ? (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>
      <Textarea
        value={review.reviewText}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste review..."
        className="min-h-[120px] rounded-[8px] border-pm-line bg-pm-surface text-[14px] text-pm-ink"
      />
    </Card>
  )
}

export function ReviewInput({
  inputs,
  onUpdateReview,
  onAddReviewer,
  onSetOptional,
}: {
  inputs: ComparisonInputBundle
  onUpdateReview: (id: string, text: string) => void
  onAddReviewer: () => void
  onSetOptional: (key: OptionalKey, value?: HumanReviewInput) => void
}) {
  return (
    <div className="grid gap-3">
      {inputs.humanReviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onChange={(text) => onUpdateReview(review.id, text)}
        />
      ))}
      <Button variant="secondary" size="sm" onClick={onAddReviewer}>
        <Plus size={14} strokeWidth={1.75} />
        Add reviewer
      </Button>

      <p className="mt-2 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
        Optional
      </p>
      {OPTIONALS.map((item) => {
        const current = inputs[item.key]
        if (!current) {
          return (
            <Button
              key={item.key}
              variant="secondary"
              size="sm"
              onClick={() =>
                onSetOptional(item.key, {
                  ...emptyHumanReview(1),
                  id: item.key,
                  label: item.label,
                })
              }
            >
              {item.addLabel}
            </Button>
          )
        }
        return (
          <ReviewCard
            key={item.key}
            review={current}
            amber={item.amber}
            onChange={(text) => onSetOptional(item.key, { ...current, reviewText: text })}
            onRemove={() => onSetOptional(item.key, undefined)}
          />
        )
      })}
    </div>
  )
}
