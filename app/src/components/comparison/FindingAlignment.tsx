import { StatusPill } from '@/components/StatusPill'
import { groupHits, groupReviewers } from '@/components/comparison/reviewerGroups'
import { getFinding } from '@/data/queryPackage'
import { cn } from '@/lib/utils'
import type { ComparisonTheme, HumanReviewInput } from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'
import { FINDING_STATUS_LABELS, type FindingStatus } from '@/types/finding'

export type AlignmentFilter =
  | 'all'
  | 'shared'
  | 'human_only'
  | 'peermind_only'
  | 'disagreement'
  | 'refuted'

export type StatusFilter = 'all' | FindingStatus

export const ALIGNMENT_FILTERS: { id: AlignmentFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shared', label: 'Shared' },
  { id: 'human_only', label: 'Reviewer only' },
  { id: 'peermind_only', label: 'PeerMind only' },
  { id: 'disagreement', label: 'Disagreement' },
  { id: 'refuted', label: 'Refuted' },
]

const QUESTION_FILTERS: { id: AlignmentFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shared', label: 'Restates finding' },
  { id: 'human_only', label: 'Open question' },
]

const STATUS_ORDER = Object.keys(FINDING_STATUS_LABELS) as FindingStatus[]

export const RELATION_LABELS: Record<ComparisonTheme['relation'], string> = {
  shared: 'Shared',
  human_only: 'Reviewer only',
  peermind_only: 'PeerMind only',
  disagreement: 'Disagreement',
}

const QUESTION_RELATION_LABELS: Record<ComparisonTheme['relation'], string> = {
  shared: 'Restates finding',
  human_only: 'Open question',
  peermind_only: 'PeerMind only',
  disagreement: 'Disagreement',
}

export function relationLabel(theme: ComparisonTheme) {
  if (theme.kind === 'question') return QUESTION_RELATION_LABELS[theme.relation]
  return RELATION_LABELS[theme.relation]
}

const RELATION_CLASS: Record<ComparisonTheme['relation'], string> = {
  shared: 'bg-pm-status-verified-fill text-pm-status-verified',
  human_only: 'bg-pm-status-unverified-fill text-pm-muted-2',
  peermind_only: 'bg-pm-accent-soft text-pm-accent',
  disagreement: 'bg-pm-status-disputed-fill text-pm-status-disputed',
}

export function statusesInThemes(themes: ComparisonTheme[]): FindingStatus[] {
  const present = new Set<FindingStatus>()
  for (const theme of themes) {
    if (theme.verificationStatus) present.add(theme.verificationStatus)
  }
  return STATUS_ORDER.filter((status) => present.has(status))
}

export function alignmentItemLabel(theme: ComparisonTheme, pkg: DemoDataPackage) {
  const findings = theme.peerMindFindingIds
    .map((id) => getFinding(pkg, id))
    .filter((item) => item !== undefined)
  if (findings.length === 1) return findings[0].critique
  if (findings.length > 1) {
    return findings.map((finding) => `${finding.id}: ${finding.critique}`).join(' ')
  }
  return theme.label
}

export function themeMatchesFilter(
  theme: ComparisonTheme,
  filter: AlignmentFilter,
  statusFilter: StatusFilter = 'all',
) {
  const matchesRelation =
    filter === 'all'
      ? true
      : filter === 'refuted'
        ? theme.verificationStatus === 'refuted'
        : theme.relation === filter
  const matchesStatus =
    statusFilter === 'all' || theme.verificationStatus === statusFilter
  return matchesRelation && matchesStatus
}

function ChipRow<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            'rounded-[5px] px-2 py-1 text-[12px] font-bold',
            value === item.id
              ? 'bg-pm-accent-soft text-pm-accent'
              : 'bg-pm-status-unverified-fill text-pm-muted-2',
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function CoverageCell({
  hits,
  total,
}: {
  hits: { short: string }[]
  total: number
}) {
  if (hits.length === 0) return <span className="text-pm-muted">—</span>
  if (total === 1) {
    return (
      <span className="inline-flex rounded-[5px] bg-pm-accent-soft px-2 py-1 text-[12px] font-bold text-pm-accent">
        Raised
      </span>
    )
  }
  return (
    <div>
      <p className="text-[12px] font-bold text-pm-ink">
        {hits.length} / {total}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {hits.map((hit) => (
          <span
            key={hit.short}
            className="rounded-[5px] bg-pm-status-unverified-fill px-2 py-0.5 text-[12px] font-bold text-pm-ink"
          >
            {hit.short}
          </span>
        ))}
      </div>
    </div>
  )
}

export function FindingAlignment({
  themes,
  reviews,
  pkg,
  selectedId,
  filter,
  statusFilter,
  onFilter,
  onStatusFilter,
  onSelect,
  mode = 'weaknesses',
}: {
  themes: ComparisonTheme[]
  reviews: HumanReviewInput[]
  pkg: DemoDataPackage
  selectedId?: string
  filter: AlignmentFilter
  statusFilter: StatusFilter
  onFilter: (filter: AlignmentFilter) => void
  onStatusFilter: (filter: StatusFilter) => void
  onSelect: (id: string) => void
  mode?: 'weaknesses' | 'questions'
}) {
  const visible = themes.filter((theme) => themeMatchesFilter(theme, filter, statusFilter))
  const groups = groupReviewers(themes, reviews)
  const relationLabels = mode === 'questions' ? QUESTION_RELATION_LABELS : RELATION_LABELS
  const filters = mode === 'questions' ? QUESTION_FILTERS : ALIGNMENT_FILTERS
  const statusChips: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All statuses' },
    ...statusesInThemes(themes).map((status) => ({
      id: status,
      label: FINDING_STATUS_LABELS[status],
    })),
  ]
  const headerCell =
    'sticky top-0 z-10 bg-pm-bg-subtle px-3 py-3 text-[12px] font-bold tracking-[0.08em] text-pm-muted uppercase'
  const bodyCell = 'px-3 py-3 align-top text-[14px] leading-relaxed text-pm-ink'

  return (
    <div>
      <p className="eyebrow mb-3">
        {mode === 'questions' ? 'Question alignment' : 'Weakness alignment'}
      </p>
      <p className="mb-3 text-[13px] text-pm-muted">
        {mode === 'questions'
          ? 'Each row is a reviewer question. Restates finding means the question makes the same claim as a locked PeerMind finding. Open questions are asks, not missing weaknesses.'
          : 'Each row is a weakness. Reviewer comments from the Weaknesses section are grouped when they make the same claim. This table is the scored comparison.'}
      </p>
      <div className="mb-3 grid gap-2">
        <ChipRow items={filters} value={filter} onChange={onFilter} />
        <ChipRow items={statusChips} value={statusFilter} onChange={onStatusFilter} />
      </div>
      {visible.length === 0 ? (
        <p className="text-[14px] text-pm-muted">No findings match this filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-[11px] border border-pm-line bg-pm-surface">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-pm-line">
                <th className={cn(headerCell, 'min-w-[280px]')}>
                  {mode === 'questions' ? 'Question' : 'Finding'}
                </th>
                <th className={cn(headerCell, 'min-w-[110px]')}>Alignment</th>
                <th className={cn(headerCell, 'min-w-[88px]')}>PeerMind</th>
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <th key={group.source} className={cn(headerCell, 'min-w-[120px]')}>
                      {group.source}
                      {group.members.length > 1 ? (
                        <span className="mt-0.5 block font-medium tracking-normal text-pm-muted normal-case">
                          {group.members.length} reviewers
                        </span>
                      ) : null}
                    </th>
                  ))
                ) : (
                  <th className={cn(headerCell, 'min-w-[140px]')}>Reviews</th>
                )}
                <th className={cn(headerCell, 'min-w-[140px]')}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((theme) => {
                const selected = theme.id === selectedId
                const findings = theme.peerMindFindingIds
                  .map((id) => getFinding(pkg, id))
                  .filter((item) => item !== undefined)
                const raisedIndependently =
                  theme.humanFindingIds.length > 0 || (theme.baselineFindingIds?.length ?? 0) > 0
                return (
                  <tr
                    key={theme.id}
                    tabIndex={0}
                    aria-selected={selected}
                    className={cn(
                      'cursor-pointer border-t border-pm-line outline-none hover:bg-pm-bg',
                      selected && 'bg-pm-accent-soft',
                    )}
                    onClick={() => onSelect(theme.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect(theme.id)
                      }
                    }}
                  >
                    <td className={cn(bodyCell, 'font-[650]')}>
                      {findings.length > 0 ? (
                        <div>
                          <p className="font-mono text-[12px] font-bold text-pm-accent">
                            {findings.map((finding) => finding.id).join(', ')}
                          </p>
                          <p className="mt-1.5">{alignmentItemLabel(theme, pkg)}</p>
                        </div>
                      ) : (
                        alignmentItemLabel(theme, pkg)
                      )}
                    </td>
                    <td className={bodyCell}>
                      <span
                        className={cn(
                          'inline-flex rounded-[5px] px-2 py-1 text-[12px] font-bold',
                          RELATION_CLASS[theme.relation],
                        )}
                      >
                        {relationLabels[theme.relation]}
                      </span>
                    </td>
                    <td className={bodyCell}>
                      {findings.length === 0 ? (
                        <span className="text-pm-muted">—</span>
                      ) : (
                        <div>
                          <span className="inline-flex rounded-[5px] bg-pm-accent-soft px-2 py-1 text-[12px] font-bold text-pm-accent">
                            Raised
                          </span>
                          <p className="mt-1.5 font-mono text-[12px] text-pm-muted">
                            {findings.map((finding) => finding.id).join(', ')}
                          </p>
                        </div>
                      )}
                    </td>
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <td key={group.source} className={bodyCell}>
                          <CoverageCell
                            hits={groupHits(theme, group)}
                            total={group.members.length}
                          />
                        </td>
                      ))
                    ) : (
                      <td className={bodyCell}>
                        {raisedIndependently ? (
                          <span className="inline-flex rounded-[5px] bg-pm-accent-soft px-2 py-1 text-[12px] font-bold text-pm-accent">
                            Raised
                          </span>
                        ) : (
                          <span className="text-pm-muted">—</span>
                        )}
                      </td>
                    )}
                    <td className={bodyCell}>
                      {theme.verificationStatus ? (
                        <StatusPill status={theme.verificationStatus} kind="status" />
                      ) : (
                        <span className="text-pm-muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
