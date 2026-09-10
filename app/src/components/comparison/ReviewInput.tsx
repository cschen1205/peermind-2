import { useEffect, useRef, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { MarkdownView } from '@/components/MarkdownView'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { REVIEW_FILE_ACCEPT } from '@/data/adapters/reviewFileAdapter'
import { cn } from '@/lib/utils'
import type { ComparisonInputBundle, HumanReviewInput } from '@/types/comparison'

function ReviewCard({
  review,
  canRemove,
  onLabelChange,
  onTextChange,
  onUpload,
  onRemove,
}: {
  review: HumanReviewInput
  canRemove: boolean
  onLabelChange: (label: string) => void
  onTextChange: (text: string) => void
  onUpload: (file: File) => void
  onRemove?: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const hasText = Boolean(review.reviewText.trim())
  const [showText, setShowText] = useState(Boolean(hasText && !review.fileName))
  const [mode, setMode] = useState<'preview' | 'edit'>(
    review.fileName && hasText ? 'preview' : 'edit',
  )

  useEffect(() => {
    if (!review.fileName || !hasText) return
    setShowText(true)
    setMode('preview')
  }, [hasText, review.fileName])

  return (
    <Card className="gap-3 rounded-[11px] border-pm-line bg-pm-surface p-4 shadow-none ring-0">
      <div className="flex items-start justify-between gap-3">
        <label className="grid min-w-0 flex-1 gap-1">
          <span className="eyebrow">Reviewer name</span>
          <input
            value={review.label}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder="e.g. ChatGPT or OpenReview"
            className="h-10 rounded-[8px] border border-pm-line bg-pm-surface px-3 text-[14px] font-[650] text-pm-ink outline-none placeholder:font-normal placeholder:text-pm-muted focus-visible:border-pm-accent"
          />
        </label>
        {canRemove ? (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
          <Upload size={14} strokeWidth={1.75} />
          Upload review file
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept={REVIEW_FILE_ACCEPT}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) onUpload(file)
          }}
        />
        {review.fileName ? (
          <p className="min-w-0 truncate text-[13px] text-pm-muted">{review.fileName}</p>
        ) : hasText ? (
          <p className="text-[13px] text-pm-muted">Text entered</p>
        ) : (
          <p className="text-[13px] text-pm-muted">Markdown, text, HTML, or JSON</p>
        )}
      </div>

      {hasText ? (
        <button
          type="button"
          className="text-left text-[13px] font-[650] text-pm-accent"
          onClick={() => {
            setShowText((open) => !open)
            if (!showText && review.fileName) setMode('preview')
          }}
        >
          {showText ? 'Hide review' : 'Show review'}
        </button>
      ) : (
        <button
          type="button"
          className="text-left text-[13px] font-[650] text-pm-accent"
          onClick={() => {
            setMode('edit')
            setShowText(true)
          }}
        >
          Or paste review text
        </button>
      )}

      {showText ? (
        <div className="grid gap-2">
          {hasText ? (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'preview', label: 'Markdown' },
                  { id: 'edit', label: 'Edit' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                    mode === item.id
                      ? 'bg-pm-accent-soft text-pm-accent'
                      : 'bg-pm-status-unverified-fill text-pm-muted-2',
                  )}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          {mode === 'preview' && hasText ? (
            <div className="max-h-[480px] overflow-y-auto rounded-[8px] border border-pm-line bg-pm-bg p-4">
              <MarkdownView>{review.reviewText}</MarkdownView>
            </div>
          ) : (
            <Textarea
              value={review.reviewText}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Paste markdown or review text..."
              className={cn(
                'min-h-[120px] rounded-[8px] border-pm-line bg-pm-surface text-[14px] text-pm-ink',
              )}
            />
          )}
        </div>
      ) : null}
    </Card>
  )
}

export function ReviewInput({
  inputs,
  onUpdateReview,
  onAddReviewer,
  onRemoveReviewer,
  onUploadFile,
}: {
  inputs: ComparisonInputBundle
  onUpdateReview: (id: string, patch: Partial<HumanReviewInput>) => void
  onAddReviewer: () => void
  onRemoveReviewer: (id: string) => void
  onUploadFile: (id: string, file: File) => void
}) {
  return (
    <div className="grid gap-3">
      {inputs.humanReviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          canRemove={inputs.humanReviews.length > 1}
          onLabelChange={(label) => onUpdateReview(review.id, { label })}
          onTextChange={(text) => onUpdateReview(review.id, { reviewText: text })}
          onUpload={(file) => onUploadFile(review.id, file)}
          onRemove={() => onRemoveReviewer(review.id)}
        />
      ))}
      <Button variant="secondary" size="sm" onClick={onAddReviewer}>
        <Plus size={14} strokeWidth={1.75} />
        Add review
      </Button>
    </div>
  )
}
