import { parseReviewerLabel, shortReviewerName } from '@/data/reviewerLabels'
import type { ComparisonInputBundle, HumanReviewInput } from '@/types/comparison'
import type { DemoDataPackage, ReviewRating } from '@/types/demoPackage'

export const SCORE_METRICS = [
  'Soundness',
  'Presentation',
  'Contribution',
  'Novelty',
  'Reproducibility',
  'Rating',
  'Confidence',
] as const

export type ScoreMetric = (typeof SCORE_METRICS)[number]

const DEFAULT_SCALE: Record<ScoreMetric, string> = {
  Soundness: '4',
  Presentation: '4',
  Contribution: '4',
  Novelty: '4',
  Reproducibility: '4',
  Rating: '10',
  Confidence: '5',
}

const SCALE_LABELS: Record<string, Record<string, string>> = {
  '4': { '1': 'Poor', '2': 'Fair', '3': 'Good', '4': 'Excellent' },
  '5': { '1': 'Low', '2': 'Low–medium', '3': 'Medium', '4': 'High', '5': 'Very high' },
}

const METRIC_LINE =
  /^(Soundness|Presentation|Contribution(?:\s*\/\s*significance)?|Overall recommendation|Overall rating|Rating|Confidence|Novelty|Reproducibility)\s*:\s*(.+)$/i

export interface ScoreColumn {
  id: string
  label: string
  short: string
  source: string
}

export interface ScoreCell {
  score: string
  scale: string
  scaleLabel: string
}

export interface ScoreMetricRow {
  label: ScoreMetric
  scale: string
  cells: Record<string, ScoreCell>
}

export interface ScoreGroup {
  source: string
  columnIds: string[]
}

export interface Scorecard {
  columns: ScoreColumn[]
  groups: ScoreGroup[]
  metrics: ScoreMetricRow[]
}

function normalizeMetric(raw: string): ScoreMetric | undefined {
  const key = raw.toLowerCase().replace(/\s+/g, ' ').trim()
  if (key.startsWith('soundness')) return 'Soundness'
  if (key === 'presentation') return 'Presentation'
  if (key.startsWith('contribution')) return 'Contribution'
  if (key.startsWith('novelty')) return 'Novelty'
  if (key.startsWith('reproducibility')) return 'Reproducibility'
  if (key === 'rating' || key.includes('overall')) return 'Rating'
  if (key.startsWith('confidence')) return 'Confidence'
  return undefined
}

function firstLabel(text: string) {
  return text.replace(/\s+/g, ' ').replace(/\.$/, '').split(/[.!]/)[0]?.trim().slice(0, 56) ?? ''
}

function inferredLabel(score: string, scale: string, explicit?: string, metric?: ScoreMetric) {
  if (metric === 'Confidence') return SCALE_LABELS[scale]?.[score] ?? explicit ?? ''
  if (explicit) return explicit
  return SCALE_LABELS[scale]?.[score] ?? ''
}

export function parseScoreValue(
  raw: string,
  metric: ScoreMetric,
): { score: string; scale: string; scaleLabel: string } | undefined {
  const slash = raw.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*(?:[—–-]\s*(.+))?/)
  if (slash) {
    return {
      score: slash[1],
      scale: slash[2],
      scaleLabel: inferredLabel(slash[1], slash[2], firstLabel(slash[3] ?? ''), metric),
    }
  }
  const colon = raw.match(/^(\d+(?:\.\d+)?)\s*:\s*(.+)/)
  if (colon) {
    const scale = DEFAULT_SCALE[metric]
    return {
      score: colon[1],
      scale,
      scaleLabel: inferredLabel(colon[1], scale, firstLabel(colon[2]), metric),
    }
  }
  const bare = raw.match(/^(\d+(?:\.\d+)?)\b/)
  if (!bare) return undefined
  const scale = DEFAULT_SCALE[metric]
  return {
    score: bare[1],
    scale,
    scaleLabel: inferredLabel(bare[1], scale, undefined, metric),
  }
}

export function extractReviewRatings(text: string): ReviewRating[] {
  const found = new Map<ScoreMetric, ReviewRating>()
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim()
    if (/^presentation quality\b/i.test(trimmed)) continue
    const match = trimmed.match(METRIC_LINE)
    if (!match) continue
    const label = normalizeMetric(match[1])
    if (!label || found.has(label)) continue
    const parsed = parseScoreValue(match[2], label)
    if (!parsed) continue
    found.set(label, { label, ...parsed })
  }
  return SCORE_METRICS.flatMap((metric) => {
    const rating = found.get(metric)
    return rating ? [rating] : []
  })
}

function collectedReviews(inputs: ComparisonInputBundle): HumanReviewInput[] {
  return [
    ...inputs.humanReviews,
    inputs.metaReview,
    inputs.authorRebuttal,
    inputs.baselineReview,
  ].filter((review): review is HumanReviewInput => Boolean(review?.reviewText.trim()))
}

function toCell(rating: ReviewRating): ScoreCell {
  return {
    score: rating.score,
    scale: rating.scale,
    scaleLabel: rating.scaleLabel,
  }
}

export function groupAverage(row: ScoreMetricRow, columnIds: string[]) {
  const values = columnIds
    .map((id) => row.cells[id])
    .filter((cell): cell is ScoreCell => Boolean(cell))
    .map((cell) => Number(cell.score))
    .filter((value) => Number.isFinite(value))
  if (values.length === 0) return undefined
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const scale = row.cells[columnIds.find((id) => row.cells[id]) ?? '']?.scale ?? row.scale
  return {
    mean,
    min: Math.min(...values),
    max: Math.max(...values),
    scale,
    count: values.length,
  }
}

export function buildScorecard(
  pkg: DemoDataPackage,
  inputs: ComparisonInputBundle,
): Scorecard | undefined {
  const columns: ScoreColumn[] = []
  const ratingsByColumn = new Map<string, ReviewRating[]>()

  const peerMindRatings = pkg.synthesis.ratings ?? []
  if (peerMindRatings.length > 0) {
    columns.push({
      id: 'peermind',
      label: 'PeerMind',
      short: 'PeerMind',
      source: 'PeerMind',
    })
    ratingsByColumn.set('peermind', peerMindRatings)
  }

  for (const review of collectedReviews(inputs)) {
    const ratings =
      review.ratings && review.ratings.length > 0
        ? review.ratings
        : extractReviewRatings(review.reviewText)
    if (ratings.length === 0) continue
    const { source, member } = parseReviewerLabel(review.label)
    columns.push({
      id: review.id,
      label: review.label,
      short: shortReviewerName(member, source),
      source,
    })
    ratingsByColumn.set(review.id, ratings)
  }

  const independentCount = columns.filter((column) => column.id !== 'peermind').length
  if (independentCount === 0) return undefined

  const groups: ScoreGroup[] = []
  for (const column of columns) {
    const current = groups[groups.length - 1]
    if (current?.source === column.source) current.columnIds.push(column.id)
    else groups.push({ source: column.source, columnIds: [column.id] })
  }

  const metrics = SCORE_METRICS.flatMap((label) => {
    const cells: Record<string, ScoreCell> = {}
    let scale = DEFAULT_SCALE[label]
    for (const column of columns) {
      const rating = ratingsByColumn.get(column.id)?.find((item) => item.label === label)
      if (!rating) continue
      cells[column.id] = toCell(rating)
      scale = rating.scale || scale
    }
    if (Object.keys(cells).length === 0) return []
    return [{ label, scale, cells }]
  })

  if (metrics.length === 0) return undefined
  return { columns, groups, metrics }
}
