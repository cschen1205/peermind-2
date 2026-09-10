import { cn } from '@/lib/utils'
import type { ComparisonTheme } from '@/types/comparison'

export type AlignmentFilter =
  | 'all'
  | 'shared'
  | 'human_only'
  | 'peermind_only'
  | 'disagreement'
  | 'refuted'

export const ALIGNMENT_FILTERS: { id: AlignmentFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shared', label: 'Shared' },
  { id: 'human_only', label: 'Human only' },
  { id: 'peermind_only', label: 'PeerMind only' },
  { id: 'disagreement', label: 'Disagreement' },
  { id: 'refuted', label: 'Refuted' },
]

export const RELATION_LABELS: Record<ComparisonTheme['relation'], string> = {
  shared: 'Shared',
  human_only: 'Human only',
  peermind_only: 'PeerMind only',
  disagreement: 'Disagreement',
}

const RELATION_CLASS: Record<ComparisonTheme['relation'], string> = {
  shared: 'bg-pm-status-verified-fill text-pm-status-verified',
  human_only: 'bg-pm-status-unverified-fill text-pm-muted-2',
  peermind_only: 'bg-pm-accent-soft text-pm-accent',
  disagreement: 'bg-pm-status-disputed-fill text-pm-status-disputed',
}

export function themeMatchesFilter(theme: ComparisonTheme, filter: AlignmentFilter) {
  if (filter === 'all') return true
  if (filter === 'refuted') return theme.defenderStatus === 'refuted'
  return theme.relation === filter
}

export function FindingAlignment({
  themes,
  selectedId,
  filter,
  onFilter,
  onSelect,
}: {
  themes: ComparisonTheme[]
  selectedId?: string
  filter: AlignmentFilter
  onFilter: (filter: AlignmentFilter) => void
  onSelect: (id: string) => void
}) {
  const visible = themes.filter((theme) => themeMatchesFilter(theme, filter))

  return (
    <div>
      <p className="eyebrow mb-3">Finding alignment</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {ALIGNMENT_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'rounded-[5px] px-2 py-1 text-[12px] font-bold',
              filter === item.id
                ? 'bg-pm-accent-soft text-pm-accent'
                : 'bg-pm-status-unverified-fill text-pm-muted-2',
            )}
            onClick={() => onFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-[14px] text-pm-muted">No themes match this filter.</p>
      ) : (
        <ul className="grid gap-2">
          {visible.map((theme) => {
            const selected = theme.id === selectedId
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  className={cn(
                    'w-full rounded-[11px] border border-pm-line bg-pm-surface p-4 text-left',
                    selected && 'border-pm-accent',
                  )}
                  onClick={() => onSelect(theme.id)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-[650] text-pm-ink">{theme.label}</span>
                    <span
                      className={cn(
                        'rounded-[5px] px-2 py-1 text-[12px] font-bold',
                        RELATION_CLASS[theme.relation],
                      )}
                    >
                      {RELATION_LABELS[theme.relation]}
                    </span>
                  </div>
                  {theme.explanation ? (
                    <p className="mt-2 line-clamp-2 text-[13px] text-pm-muted">{theme.explanation}</p>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
