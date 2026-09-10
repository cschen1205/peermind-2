import type { DemoDataPackage } from '@/types/demoPackage'
import type { ReviewerAgent } from '@/types/finding'
import { formatValidationErrors, validateDemoPackage } from './schema'

export type LoadPackageResult =
  | { ok: true; data: DemoDataPackage }
  | { ok: false; errors: string[]; message: string }

const LITERATURE_AGENT: ReviewerAgent = {
  id: 'AG-LIT',
  label: 'Literature audit',
  description:
    'Checks cited work and nearest related papers when novelty cannot be resolved from the manuscript alone.',
  selected: true,
  triggerSignalIds: ['SIG-NOVELTY'],
  role: 'verifier',
}

function uniqueIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

function withCurrentPlanRoster(pkg: DemoDataPackage): DemoDataPackage {
  if (pkg.demo.id !== 'model-soups-v1') return pkg

  const candidateAgents = pkg.reviewerRun.candidateAgents.map((agent) => {
    if (agent.id === 'AG-SCOPE') return { ...agent, label: 'Scope Review' }
    if (agent.id === 'AG-LIT') return { ...agent, label: 'Literature audit', selected: true }
    return agent
  })
  if (!candidateAgents.some((agent) => agent.id === 'AG-LIT')) {
    const proofIndex = candidateAgents.findIndex((agent) => agent.id === 'AG-PROOF')
    if (proofIndex === -1) candidateAgents.push(LITERATURE_AGENT)
    else candidateAgents.splice(proofIndex, 0, LITERATURE_AGENT)
  }

  return {
    ...pkg,
    reviewPlan: {
      ...pkg.reviewPlan,
      selectedVerifierIds: uniqueIds([...pkg.reviewPlan.selectedVerifierIds, 'AG-LIT']),
    },
    reviewerRun: {
      ...pkg.reviewerRun,
      candidateAgents,
      selectedAgentIds: uniqueIds([...pkg.reviewerRun.selectedAgentIds, 'AG-LIT']),
    },
  }
}

function rewriteLegacyVerdictEvents(events: unknown): void {
  if (!Array.isArray(events)) return
  for (const event of events) {
    if (event && typeof event === 'object' && (event as { type?: unknown }).type === 'verdict') {
      ;(event as { type: string }).type = 'evidence_verdict'
    }
  }
}

function coerceLegacyPlaybackEvents(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const pkg = raw as {
    reviewPlan?: { routingEvents?: unknown }
    reviewerRun?: { routingEvents?: unknown }
    verifications?: Array<{ events?: unknown }>
  }
  rewriteLegacyVerdictEvents(pkg.reviewPlan?.routingEvents)
  rewriteLegacyVerdictEvents(pkg.reviewerRun?.routingEvents)
  for (const verification of pkg.verifications ?? []) {
    rewriteLegacyVerdictEvents(verification.events)
  }
  return raw
}

export function loadDemoPackage(raw: unknown): LoadPackageResult {
  const result = validateDemoPackage(coerceLegacyPlaybackEvents(raw))
  if (!result.ok) {
    return {
      ok: false,
      errors: result.errors,
      message: formatValidationErrors(result.errors),
    }
  }
  return { ok: true, data: withCurrentPlanRoster(result.data) }
}
