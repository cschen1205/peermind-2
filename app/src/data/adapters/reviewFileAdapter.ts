import {
  nextReviewIndex,
  parseComparisonJson,
  type ComparisonParseResult,
} from '@/data/adapters/comparisonInputAdapter'
import { extractReviewRatings } from '@/data/extractReviewScores'
import type { HumanReviewInput } from '@/types/comparison'

export const REVIEW_FILE_ACCEPT =
  '.md,.markdown,.txt,.json,.html,.htm,.text,text/markdown,text/plain,application/json,text/html'

const TEXT_EXTENSIONS = new Set(['md', 'markdown', 'txt', 'text', 'html', 'htm'])

export type ReviewFileParseResult =
  | { ok: true; kind: 'reviews'; reviews: Omit<HumanReviewInput, 'id'>[] }
  | ComparisonParseResult
  | { ok: false; errors: string[] }

function extensionOf(fileName: string) {
  const parts = fileName.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

function stemLabel(fileName: string) {
  if (/chatgpt|chat-gpt/i.test(fileName)) return 'ChatGPT'
  if (/claude/i.test(fileName)) return 'Claude'
  if (/gemini/i.test(fileName)) return 'Gemini'
  const stem = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  return stem || fileName
}

function asReview(
  label: string,
  reviewText: string,
  sourceType: HumanReviewInput['sourceType'],
  fileName?: string,
): Omit<HumanReviewInput, 'id'> {
  const text = reviewText.trim()
  const ratings = extractReviewRatings(text)
  return {
    label,
    reviewText: text,
    sourceType,
    fileName,
    ...(ratings.length > 0 ? { ratings } : {}),
  }
}

function looksLikeReviewObject(value: unknown): value is {
  label?: string
  reviewText?: string
  text?: string
  content?: string
  sourceType?: HumanReviewInput['sourceType']
  sourceUrl?: string
} {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.reviewText === 'string' ||
    typeof record.text === 'string' ||
    typeof record.content === 'string'
  )
}

function reviewFromUnknown(
  value: unknown,
  fallbackLabel: string,
  fileName?: string,
): Omit<HumanReviewInput, 'id'> | undefined {
  if (typeof value === 'string' && value.trim()) {
    return asReview(fallbackLabel, value, 'manual', fileName)
  }
  if (!looksLikeReviewObject(value)) return undefined
  const text = [value.reviewText, value.text, value.content].find(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  )
  if (!text) return undefined
  const label = typeof value.label === 'string' && value.label.trim() ? value.label.trim() : fallbackLabel
  const sourceType = value.sourceType ?? 'manual'
  const parsed = asReview(label, text, sourceType, fileName)
  const explicitRatings = Array.isArray((value as { ratings?: unknown }).ratings)
    ? (value as { ratings: NonNullable<HumanReviewInput['ratings']> }).ratings
    : undefined
  return {
    ...parsed,
    sourceUrl: value.sourceUrl,
    ...(explicitRatings && explicitRatings.length > 0 ? { ratings: explicitRatings } : {}),
  }
}

const OFFICIAL_REVIEW =
  /Official Review of Submission\d+ by Reviewer (\S+)/g
const SECTION_STOP =
  /(?:^|\n)(?:Official Review of Submission|Meta Review of Submission|Official Comment|Paper Decision|Public Comment)\b/g

function sliceUntilNextSection(text: string, start: number) {
  const stopper = new RegExp(SECTION_STOP.source, 'g')
  stopper.lastIndex = start + 1
  const next = stopper.exec(text)
  return text.slice(start, next ? next.index : text.length).trim()
}

function cleanOfficialReview(text: string) {
  return text
    .replace(/^Official Review of Submission\d+ by Reviewer \S+\s*/i, '')
    .replace(/^Official Reviewby Reviewer \S+[^\n]*\n?/i, '')
    .replace(/\nAdd:\s*$/i, '')
    .trim()
}

export function splitConferenceDiscussion(text: string): Omit<HumanReviewInput, 'id'>[] {
  const reviews: Omit<HumanReviewInput, 'id'>[] = []

  for (const match of text.matchAll(OFFICIAL_REVIEW)) {
    if (match.index === undefined) continue
    const reviewerId = match[1]
    const body = cleanOfficialReview(sliceUntilNextSection(text, match.index))
    if (body.length < 80) continue
    reviews.push(asReview(`Reviewer ${reviewerId}`, body, 'openreview'))
  }

  return reviews
}

function parseJsonReviews(raw: unknown, fileName: string): ReviewFileParseResult {
  const comparison = parseComparisonJson(raw)
  if (comparison.ok) return comparison

  if (Array.isArray(raw)) {
    const reviews = raw
      .map((item, index) => reviewFromUnknown(item, `${stemLabel(fileName)} ${index + 1}`, fileName))
      .filter((item): item is Omit<HumanReviewInput, 'id'> => item !== undefined)
    if (reviews.length) return { ok: true, kind: 'reviews', reviews }
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    const nested = [record.reviews, record.humanReviews].find(Array.isArray)
    if (nested) {
      const reviews = nested
        .map((item, index) => reviewFromUnknown(item, `${stemLabel(fileName)} ${index + 1}`, fileName))
        .filter((item): item is Omit<HumanReviewInput, 'id'> => item !== undefined)
      if (reviews.length) return { ok: true, kind: 'reviews', reviews }
    }

    const single = reviewFromUnknown(raw, stemLabel(fileName), fileName)
    if (single) return { ok: true, kind: 'reviews', reviews: [single] }
  }

  if (typeof raw === 'string' && raw.trim()) {
    return parseTextReviews(raw, fileName)
  }

  return { ok: false, errors: comparison.errors }
}

function parseTextReviews(text: string, fileName: string): ReviewFileParseResult {
  const trimmed = text.replace(/^\uFEFF/, '').trim()
  if (!trimmed) return { ok: false, errors: ['The file is empty.'] }

  const conference = splitConferenceDiscussion(trimmed)
  if (conference.length >= 2) {
    return {
      ok: true,
      kind: 'reviews',
      reviews: conference.map((review) => ({ ...review, fileName })),
    }
  }

  if (conference.length === 1) {
    return { ok: true, kind: 'reviews', reviews: [{ ...conference[0], fileName }] }
  }

  return {
    ok: true,
    kind: 'reviews',
    reviews: [asReview(stemLabel(fileName), trimmed, 'other', fileName)],
  }
}

export async function readReviewFile(file: File): Promise<ReviewFileParseResult> {
  const text = await file.text()
  const ext = extensionOf(file.name)

  if (ext === 'json' || file.type === 'application/json') {
    try {
      return parseJsonReviews(JSON.parse(text) as unknown, file.name)
    } catch {
      return { ok: false, errors: ['The JSON file could not be parsed.'] }
    }
  }

  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/') || !ext) {
    return parseTextReviews(text, file.name)
  }

  return {
    ok: false,
    errors: [`Unsupported review format (.${ext || 'unknown'}). Use Markdown, text, HTML, or JSON.`],
  }
}

export function replaceSlotWithReviews(
  existing: HumanReviewInput[],
  slotId: string,
  incoming: Omit<HumanReviewInput, 'id'>[],
  preferredLabel?: string,
): HumanReviewInput[] {
  if (incoming.length === 0) return existing
  const slotIndex = existing.findIndex((review) => review.id === slotId)
  const start = slotIndex >= 0 ? slotIndex : existing.length
  const sourceName = preferredLabel?.trim()
  const labeled =
    incoming.length === 1 && sourceName
      ? [{ ...incoming[0], label: sourceName }]
      : incoming.map((review) => ({
          ...review,
          label:
            incoming.length > 1 && sourceName
              ? review.label.startsWith(`${sourceName} - `)
                ? review.label
                : `${sourceName} - ${review.label}`
              : review.label,
        }))
  const withoutSlot = slotIndex >= 0 ? existing.filter((review) => review.id !== slotId) : existing
  let nextIndex = nextReviewIndex(withoutSlot)
  const created = labeled.map((review, offset) => {
    const id = offset === 0 && slotIndex >= 0 ? slotId : `RV-${String(nextIndex).padStart(2, '0')}`
    if (!(offset === 0 && slotIndex >= 0)) nextIndex += 1
    return { ...review, id }
  })
  const next = [...existing]
  if (slotIndex >= 0) next.splice(start, 1, ...created)
  else next.push(...created)
  return next
}
