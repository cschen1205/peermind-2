import { Button } from '@/components/ui/button'
import type { SuggestedPrompt } from '@/types/ask'

export function SuggestedQuestions({
  prompts,
  onSelect,
}: {
  prompts: SuggestedPrompt[]
  onSelect: (prompt: SuggestedPrompt) => void
}) {
  if (prompts.length === 0) return null

  return (
    <div>
      <p className="text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase">
        Suggested questions
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <Button
            key={prompt.id}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onSelect(prompt)}
          >
            {prompt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
