import { parseReviewerLabel, shortReviewerName } from '@/data/reviewerLabels'
import type {
  ComparisonInputBundle,
  ComparisonTheme,
  HumanReviewInput,
} from '@/types/comparison'

export interface ReviewerMember {
  full: string
  short: string
}

export interface ReviewerGroup {
  source: string
  members: ReviewerMember[]
}

export { parseReviewerLabel, shortReviewerName } from '@/data/reviewerLabels'

export function reviewsWithText(inputs: ComparisonInputBundle) {
  return [
    ...inputs.humanReviews,
    inputs.metaReview,
    inputs.authorRebuttal,
    inputs.baselineReview,
  ].filter((review): review is HumanReviewInput => Boolean(review?.reviewText.trim()))
}

export function collectReviewerLabels(
  themes: ComparisonTheme[],
  reviews: HumanReviewInput[],
) {
  const labels: string[] = []
  const seen = new Set<string>()
  const add = (label: string) => {
    const trimmed = label.trim()
    if (!trimmed || seen.has(trimmed)) return
    seen.add(trimmed)
    labels.push(trimmed)
  }
  for (const review of reviews) {
    if (review.reviewText.trim()) add(review.label)
  }
  for (const theme of themes) {
    for (const excerpt of theme.excerpts ?? []) add(excerpt.reviewerLabel)
  }
  return labels
}

export function groupReviewers(
  themes: ComparisonTheme[],
  reviews: HumanReviewInput[],
): ReviewerGroup[] {
  const groups = new Map<string, ReviewerGroup>()
  const order: string[] = []
  for (const label of collectReviewerLabels(themes, reviews)) {
    const { source, member } = parseReviewerLabel(label)
    if (!groups.has(source)) {
      groups.set(source, { source, members: [] })
      order.push(source)
    }
    const group = groups.get(source)
    if (!group || group.members.some((item) => item.full === label)) continue
    group.members.push({ full: label, short: shortReviewerName(member, source) })
  }
  return order.map((source) => groups.get(source)).filter((group) => group !== undefined)
}

export function groupHits(theme: ComparisonTheme, group: ReviewerGroup) {
  return group.members.filter((member) =>
    theme.excerpts?.some((excerpt) => excerpt.reviewerLabel === member.full),
  )
}

export function excerptsBySource(theme: Pick<ComparisonTheme, 'excerpts'>) {
  const groups = new Map<string, { source: string; items: NonNullable<ComparisonTheme['excerpts']> }>()
  const order: string[] = []
  for (const excerpt of theme.excerpts ?? []) {
    const { source } = parseReviewerLabel(excerpt.reviewerLabel)
    if (!groups.has(source)) {
      groups.set(source, { source, items: [] })
      order.push(source)
    }
    groups.get(source)?.items.push(excerpt)
  }
  return order.map((source) => groups.get(source)).filter((group) => group !== undefined)
}
