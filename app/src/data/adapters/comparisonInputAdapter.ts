import {
  comparisonInputBundleSchema,
  comparisonPresetSchema,
} from '@/data/schema'
import type { ComparisonInputBundle, ComparisonPreset, HumanReviewInput } from '@/types/comparison'

export function emptyHumanReview(index: number): HumanReviewInput {
  return {
    id: `HR-${String(index).padStart(2, '0')}`,
    label: `Human Reviewer ${index}`,
    reviewText: '',
    sourceType: 'manual',
  }
}

export function emptyComparisonInputs(): ComparisonInputBundle {
  return { humanReviews: [emptyHumanReview(1)] }
}

export type ComparisonParseResult =
  | { ok: true; kind: 'preset'; data: ComparisonPreset }
  | { ok: true; kind: 'inputs'; data: ComparisonInputBundle }
  | { ok: false; errors: string[] }

function formatIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : 'comparison'
    return `${path}: ${issue.message}`
  })
}

export function parseComparisonJson(raw: unknown): ComparisonParseResult {
  let candidate = raw
  if (raw && typeof raw === 'object' && 'comparisonPreset' in raw) {
    candidate = (raw as { comparisonPreset: unknown }).comparisonPreset
  }

  const preset = comparisonPresetSchema.safeParse(candidate)
  if (preset.success) {
    return { ok: true, kind: 'preset', data: preset.data }
  }

  const inputs = comparisonInputBundleSchema.safeParse(candidate)
  if (inputs.success) {
    return { ok: true, kind: 'inputs', data: inputs.data }
  }

  return { ok: false, errors: formatIssues(preset.error.issues) }
}

export function cloneBundle(bundle: ComparisonInputBundle): ComparisonInputBundle {
  return structuredClone(bundle)
}
