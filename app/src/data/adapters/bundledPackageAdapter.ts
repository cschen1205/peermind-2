import { parseComparisonJson } from '@/data/adapters/comparisonInputAdapter'
import type { ComparisonPreset } from '@/types/comparison'

const PREPARED_PACKAGE_URL = '/demo-data/model-soups-v1.demo.json'
export const COMPARISON_FIXTURE_URL = '/demo-data/model-soups-v1.comparison.json'

export async function fetchComparisonFixture(): Promise<ComparisonPreset> {
  const response = await fetch(COMPARISON_FIXTURE_URL)
  if (!response.ok) {
    throw new Error('Could not load the comparison result file.')
  }
  const parsed = parseComparisonJson(await response.json())
  if (!parsed.ok || parsed.kind !== 'preset') {
    throw new Error(
      parsed.ok
        ? 'The comparison file does not contain a comparison result.'
        : (parsed.errors[0] ?? 'The comparison file could not be parsed.'),
    )
  }
  return parsed.data
}

export async function fetchPreparedPackage(): Promise<unknown> {
  const response = await fetch(PREPARED_PACKAGE_URL)
  if (!response.ok) {
    throw new Error('Could not load the prepared review for this manuscript.')
  }
  const pkg = await response.json()
  try {
    const comparisonPreset = await fetchComparisonFixture()
    if (pkg && typeof pkg === 'object') {
      return { ...pkg, comparisonPreset }
    }
  } catch {
    // Keep the package even if the standalone comparison file is missing.
  }
  return pkg
}
