import type { DemoDataPackage } from '@/types/demoPackage'
import { formatValidationErrors, validateDemoPackage } from './schema'

export type LoadPackageResult =
  | { ok: true; data: DemoDataPackage }
  | { ok: false; errors: string[]; message: string }

export function loadDemoPackage(raw: unknown): LoadPackageResult {
  const result = validateDemoPackage(raw)
  if (!result.ok) {
    return {
      ok: false,
      errors: result.errors,
      message: formatValidationErrors(result.errors),
    }
  }
  return { ok: true, data: result.data }
}
