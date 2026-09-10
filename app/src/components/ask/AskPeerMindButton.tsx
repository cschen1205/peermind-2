import { Search } from 'lucide-react'
import { deriveAskContext } from '@/components/ask/askContext'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/store/demoStore'

export function AskPeerMindButton({ className }: { className?: string }) {
  const ready = useDemoStore((s) => s.packageStatus === 'ready')
  const openAsk = useDemoStore((s) => s.openAsk)
  const stage = useDemoStore((s) => s.currentStage)
  const selectedPaperNodeId = useDemoStore((s) => s.selectedPaperNodeId)
  const selectedSourceIds = useDemoStore((s) => s.selectedSourceIds)
  const selectedFindingId = useDemoStore((s) => s.selectedFindingId)
  const selectedComparisonThemeId = useDemoStore((s) => s.selectedComparisonThemeId)
  const verifyPanel = useDemoStore((s) => s.verifyPanel)

  return (
    <Button
      variant="secondary"
      disabled={!ready}
      className={className}
      onClick={() => {
        const { scope, contextIds } = deriveAskContext({
          stage,
          selectedPaperNodeId,
          selectedSourceIds,
          selectedFindingId,
          selectedComparisonThemeId,
          verifyPanel,
        })
        openAsk(scope, contextIds)
      }}
    >
      <Search size={16} strokeWidth={1.75} />
      Ask PeerMind
    </Button>
  )
}
