import { NODE_TYPE_LABELS } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import { NODE_CHIP_CLASS, NODE_SWATCH_CLASS } from '@/styles/graphStyles'
import { useDemoStore } from '@/store/demoStore'
import type { PaperSection } from '@/types/paper'

export function PaperSectionNav({
  sections,
  pane = 'structure',
}: {
  sections: PaperSection[]
  pane?: 'structure' | 'nodes'
}) {
  const pkg = useDemoStore((s) => s.package)
  const selectedSectionId = useDemoStore((s) => s.selectedSectionId)
  const selectedPaperNodeId = useDemoStore((s) => s.selectedPaperNodeId)
  const focusSelection = useDemoStore((s) => s.focusSelection)
  const nodes = pkg?.paperGraph.nodes ?? []
  const structure = pane === 'structure'

  return (
    <nav
      aria-label={structure ? 'Paper structure' : 'Graph nodes'}
      className="flex h-full flex-col"
    >
      {structure ? (
        <>
          <p className="eyebrow mb-3">Paper structure</p>
          <ul className="grid gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-start rounded-[8px] px-3 py-2.5 text-left text-[14px] text-pm-muted',
                    selectedSectionId === section.id && 'bg-pm-accent-soft font-bold text-pm-accent',
                  )}
                  style={{ paddingLeft: 12 + (section.level - 1) * 12 }}
                  onClick={() =>
                    focusSelection({ sourceIds: section.sourceIds, sectionId: section.id })
                  }
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="eyebrow mb-3">Graph nodes</p>
          <ul className="grid gap-1">
            {nodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px]',
                    selectedPaperNodeId === node.id
                      ? 'bg-pm-accent-soft font-bold text-pm-accent'
                      : 'text-pm-muted',
                  )}
                  onClick={() => focusSelection({ sourceIds: node.sourceIds, paperNodeId: node.id })}
                >
                  <span
                    className={cn('size-2 shrink-0 rounded-full', NODE_SWATCH_CLASS[node.type])}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{node.label}</span>
                  <span
                    className={cn(
                      'ml-auto hidden rounded-[5px] px-1.5 py-0.5 text-[11px] xl:inline',
                      NODE_CHIP_CLASS[node.type],
                    )}
                  >
                    {NODE_TYPE_LABELS[node.type]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  )
}
