import type { EvidenceVerdict, FindingImpact, FindingStatus, SeverityLevel } from '@/types/finding'

export function findingStatusFromVerification(
  verdict: EvidenceVerdict,
  impact?: Pick<FindingImpact, 'scopeRelevance' | 'necessity'>,
  finalSeverity?: SeverityLevel,
): FindingStatus {
  if (verdict !== 'supported') return verdict
  if (
    finalSeverity === 'suggestion' ||
    (impact?.scopeRelevance === 'low' && impact.necessity === 'low')
  ) {
    return 'severity_downgraded'
  }
  if (impact?.scopeRelevance === 'high' || impact?.necessity === 'high') {
    return 'verified_high_impact'
  }
  if (impact?.scopeRelevance === 'moderate' || impact?.necessity === 'moderate') {
    return 'verified_moderate_impact'
  }
  return 'verified_low_impact'
}
