import { useState } from 'react'
import { AskContextSelector } from '@/components/ask/AskContextSelector'
import { AskResponseView } from '@/components/ask/AskResponseView'
import { SuggestedQuestions } from '@/components/ask/SuggestedQuestions'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { suggestedPromptsForContext } from '@/data/matchAsk'
import { useDemoStore } from '@/store/demoStore'

export function AskPeerMindDrawer() {
  const ask = useDemoStore((s) => s.ask)
  const closeAsk = useDemoStore((s) => s.closeAsk)
  const submitAsk = useDemoStore((s) => s.submitAsk)
  const rawPrompts = useDemoStore((s) => s.package?.askPeerMind?.suggestedPrompts)
  const prompts = rawPrompts ?? []
  const contextKey = `${ask.open}:${ask.scope}:${ask.contextIds.join(',')}`
  const [draftKey, setDraftKey] = useState(contextKey)
  const [draft, setDraft] = useState(ask.query)

  if (draftKey !== contextKey) {
    setDraftKey(contextKey)
    setDraft(ask.query)
  }

  const suggested = suggestedPromptsForContext(prompts, ask.scope, ask.contextIds)

  return (
    <Sheet
      open={ask.open}
      onOpenChange={(open) => {
        if (!open) closeAsk()
      }}
    >
      <SheetContent
        side="right"
        overlayClassName="z-40"
        className="z-40 w-full gap-0 bg-pm-surface p-0 sm:max-w-[420px]"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b border-pm-line p-6">
          <p className="eyebrow mb-2">Ask PeerMind</p>
          <SheetTitle className="type-h3">Secondary inspector</SheetTitle>
          <SheetDescription className="text-[13px] text-pm-muted">
            Prepared answers only. No live model.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="grid gap-5 p-6">
            <AskContextSelector scope={ask.scope} contextIds={ask.contextIds} />
            <SuggestedQuestions
              prompts={suggested}
              onSelect={(prompt) => {
                setDraft(prompt.query)
                submitAsk(prompt.query, prompt.id)
              }}
            />
            <div>
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about this context..."
                className="min-h-[88px] rounded-[8px] border-pm-line text-[14px] text-pm-ink"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  disabled={!draft.trim()}
                  onClick={() => submitAsk(draft)}
                >
                  Ask
                </Button>
              </div>
            </div>
            {ask.response ? <AskResponseView response={ask.response} /> : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
