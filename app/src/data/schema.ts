import { z } from 'zod'
import type { DemoDataPackage } from '@/types/demoPackage'

const SCHEMA_VERSION_ERROR =
  'schemaVersion: This package uses schema 1.0 and must be migrated to DemoDataPackage 2.0. The 1.0 fields (investigations, a complete conference review, and baseline/targeted/control tests) are no longer accepted.'

const evidenceVerdictSchema = z.enum([
  'supported',
  'partially_supported',
  'refuted',
  'unverifiable',
  'open_question',
])

const findingStatusSchema = z.enum([
  'verified_high_impact',
  'verified_moderate_impact',
  'verified_low_impact',
  'partially_supported',
  'refuted',
  'unverifiable',
  'open_question',
  'severity_downgraded',
])

const impactLevelSchema = z.enum(['high', 'moderate', 'low', 'unknown'])
const sensitivityLevelSchema = z.enum(['high', 'moderate', 'low', 'unknown', 'not_identifiable'])
const severityLevelSchema = z.enum(['major', 'minor', 'suggestion', 'none'])
const conferenceStyleSchema = z.enum(['iclr', 'icml', 'neurips', 'acl', 'aaai', 'generic'])

const askScopeSchema = z.enum([
  'whole_paper',
  'section',
  'source',
  'paper_graph_node',
  'finding',
  'verification',
  'evidence_ledger',
  'impact',
  'counterfactual_test',
  'synthesis',
  'comparison',
])

const highlightRegionSchema = z.object({
  id: z.string().min(1),
  page: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  role: z.enum(['claim', 'evidence_for', 'counter_evidence', 'context', 'selected']),
  label: z.string().optional(),
})

const sourceRecordSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'paragraph',
    'claim',
    'equation',
    'table',
    'figure',
    'appendix',
    'code',
    'external',
    'reference',
  ]),
  label: z.string().min(1),
  sectionId: z.string().optional(),
  page: z.number().int().positive().optional(),
  excerpt: z.string().optional(),
  highlightRegions: z.array(highlightRegionSchema).optional(),
  externalUrl: z.string().optional(),
})

const paperSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: z.number().int().min(1),
  startPage: z.number().int().positive().optional(),
  endPage: z.number().int().positive().optional(),
  sourceIds: z.array(z.string()),
})

const paperNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'contribution',
    'claim',
    'method',
    'assumption',
    'equation',
    'experiment',
    'dataset',
    'baseline',
    'metric',
    'result',
    'table',
    'figure',
    'limitation',
    'appendix',
    'reference',
    'scope',
    'gap',
    'question',
    'evidence',
  ]),
  label: z.string().min(1),
  sourceIds: z.array(z.string()),
  summary: z.string().optional(),
})

const paperEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  relation: z.string().min(1),
  sourceIds: z.array(z.string()),
})

const evidenceRecordSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(['for', 'against', 'gap']),
  sourceIds: z.array(z.string()),
  summary: z.string().min(1),
  toolId: z.string().optional(),
})

const verificationContractSchema = z.object({
  allegation: z.string().min(1),
  targetClaimId: z.string().optional(),
  verificationQuestion: z.string().min(1),
  evidenceBurden: z.string().min(1),
  falsifier: z.string().min(1),
  preferredTools: z.array(z.string()),
  stopRule: z.string().min(1),
})

const findingRecordSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  critique: z.string().min(1),
  reviewerAgentId: z.string().min(1),
  targetClaimId: z.string().optional(),
  sourceIds: z.array(z.string()),
  proposedSeverity: severityLevelSchema,
  contract: verificationContractSchema,
  evidenceFor: z.array(evidenceRecordSchema),
  evidenceAgainst: z.array(evidenceRecordSchema),
  missingEvidence: z.array(z.string()),
  evidenceVerdict: evidenceVerdictSchema,
  impact: z
    .object({
      scopeRelevance: impactLevelSchema,
      necessity: impactLevelSchema,
      sensitivity: sensitivityLevelSchema,
      explanation: z.string().min(1),
    })
    .optional(),
  finalSeverity: severityLevelSchema,
  status: findingStatusSchema,
  calibratedComment: z.string().optional(),
  limitations: z.array(z.string()),
  nextAction: z.string().optional(),
})

const replanEventSchema = z.object({
  reason: z.string().min(1),
  attempt: z.number().int().positive(),
  maxAttempts: z.number().int().positive(),
  spawnedAgentIds: z.array(z.string()),
  requestedEvidence: z.array(z.string()),
})

const playbackEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('message'), text: z.string() }),
  z.object({ type: z.literal('activate_node'), nodeId: z.string() }),
  z.object({ type: z.literal('complete_node'), nodeId: z.string() }),
  z.object({ type: z.literal('skip_node'), nodeId: z.string(), reason: z.string() }),
  z.object({ type: z.literal('spawn_agent'), agentId: z.string() }),
  z.object({ type: z.literal('reveal_source'), sourceIds: z.array(z.string()) }),
  z.object({ type: z.literal('update_ledger'), evidenceRecordIds: z.array(z.string()) }),
  z.object({ type: z.literal('replan'), replan: replanEventSchema }),
  z.object({ type: z.literal('evidence_verdict'), status: evidenceVerdictSchema }),
  z.object({ type: z.literal('impact_update'), assessmentId: z.string() }),
  z.object({ type: z.literal('calibrate'), findingId: z.string() }),
  z.object({ type: z.literal('stop'), reason: z.string() }),
])

const workflowNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  subtitle: z.string().optional(),
  kind: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
})

const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  relation: z.string().optional(),
})

const skippedCapabilitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  reason: z.string().min(1),
})

const evidenceLedgerSchema = z.object({
  for: z.array(evidenceRecordSchema),
  against: z.array(evidenceRecordSchema),
  gaps: z.array(evidenceRecordSchema),
  provenance: z.array(z.string()),
  toolsUsed: z.array(z.string()),
})

const verificationRecordSchema = z.object({
  findingId: z.string().min(1),
  contract: verificationContractSchema,
  agentIds: z.array(z.string()),
  invokedToolIds: z.array(z.string()),
  skippedTools: z.array(skippedCapabilitySchema),
  workflowNodes: z.array(workflowNodeSchema),
  workflowEdges: z.array(workflowEdgeSchema),
  events: z.array(playbackEventSchema),
  ledger: evidenceLedgerSchema,
  evidenceVerdict: evidenceVerdictSchema,
  limitations: z.array(z.string()),
  impactAssessmentId: z.string().optional(),
})

const impactAssessmentSchema = z.object({
  id: z.string().min(1),
  findingId: z.string().min(1),
  scopeRelevance: impactLevelSchema,
  scopeExplanation: z.string().min(1),
  necessity: impactLevelSchema,
  necessityExplanation: z.string().min(1),
  sensitivity: sensitivityLevelSchema,
  sensitivityExplanation: z.string().min(1),
  counterfactualTestId: z
    .string()
    .min(1)
    .nullish()
    .transform((id) => id ?? undefined),
  finalSeverity: severityLevelSchema,
  status: findingStatusSchema,
})

const counterfactualVariantSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  changedSourceIds: z.array(z.string()),
  claimSupport: z.string().min(1),
})

const counterfactualRecordSchema = z.object({
  id: z.string().min(1),
  findingId: z.string().min(1),
  identifiable: z.boolean(),
  reason: z.string().optional(),
  currentSupport: z.string().optional(),
  intervention: z.string().optional(),
  reevaluatedSupport: z.string().optional(),
  sensitivity: z.enum(['high', 'moderate', 'low']).optional(),
  current: counterfactualVariantSchema.optional(),
  intervened: counterfactualVariantSchema.optional(),
})

const reviewRatingSchema = z.object({
  label: z.string().min(1),
  score: z.string().min(1),
  scale: z.string().min(1),
  scaleLabel: z.string().min(1),
})

const humanReviewInputSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  reviewText: z.string(),
  sourceType: z.enum(['openreview', 'manual', 'other']),
  sourceUrl: z.string().optional(),
  fileName: z.string().optional(),
  ratings: z.array(reviewRatingSchema).optional(),
})

export const comparisonInputBundleSchema = z.object({
  humanReviews: z.array(humanReviewInputSchema),
  metaReview: humanReviewInputSchema.optional(),
  authorRebuttal: humanReviewInputSchema.optional(),
  baselineReview: humanReviewInputSchema.optional(),
})

const comparisonThemeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(['weakness', 'question']).optional(),
  peerMindFindingIds: z.array(z.string()),
  humanFindingIds: z.array(z.string()),
  baselineFindingIds: z.array(z.string()).optional(),
  relation: z.enum(['shared', 'human_only', 'peermind_only', 'disagreement']),
  sourceIds: z.array(z.string()).optional(),
  verificationStatus: findingStatusSchema.optional(),
  explanation: z.string().optional(),
  excerpts: z
    .array(
      z.object({
        reviewId: z.string().min(1),
        reviewerLabel: z.string().min(1),
        text: z.string(),
      }),
    )
    .optional(),
})

export const comparisonPresetSchema = z.object({
  id: z.string().min(1),
  inputs: comparisonInputBundleSchema.optional(),
  result: z.object({
    themes: z.array(comparisonThemeSchema),
    questions: z.array(comparisonThemeSchema).optional(),
    agentSummary: z
      .object({
        agentId: z.string().min(1),
        agentLabel: z.string().min(1),
        headline: z.string().min(1),
        verdict: z.string().min(1),
        parties: z
          .array(
            z.object({
              id: z.enum(['chatgpt', 'openreview', 'peermind']),
              label: z.string().min(1),
              raisedCount: z.number().int().nonnegative(),
              missedCount: z.number().int().nonnegative(),
              incorrectCount: z.number().int().nonnegative(),
              tooBroadCount: z.number().int().nonnegative(),
              addedCount: z.number().int().nonnegative().optional(),
              verifiedCount: z.number().int().nonnegative().optional(),
              refutedCount: z.number().int().nonnegative().optional(),
              note: z.string().min(1),
            }),
          )
          .optional(),
        callouts: z.array(
          z.object({
            id: z.string().min(1),
            tag: z.enum(['incorrect', 'too_broad', 'missed', 'shared']),
            reviewerLabel: z.string().min(1),
            title: z.string().min(1),
            detail: z.string().min(1),
            themeId: z.string().optional(),
          }),
        ),
      })
      .optional(),
    summary: z.object({
      sharedCount: z.number().int().nonnegative(),
      humanOnlyCount: z.number().int().nonnegative(),
      peerMindOnlyCount: z.number().int().nonnegative(),
      disagreementCount: z.number().int().nonnegative(),
      refutedCount: z.number().int().nonnegative().optional(),
      questionCount: z.number().int().nonnegative().optional(),
      questionMappedCount: z.number().int().nonnegative().optional(),
      questionOpenCount: z.number().int().nonnegative().optional(),
    }),
  }),
})

const askResponseSchema = z.object({
  answer: z.string().min(1),
  sourceIds: z.array(z.string()),
  actions: z
    .array(
      z.object({
        type: z.enum([
          'open_source',
          'focus_graph',
          'open_finding',
          'open_verification',
          'run_check',
        ]),
        label: z.string(),
        targetId: z.string().optional(),
      }),
    )
    .optional(),
  toolTrace: z
    .array(
      z.object({
        label: z.string(),
        status: z.enum(['running', 'done', 'failed', 'skipped']),
      }),
    )
    .optional(),
})

const reviewPlanSchema = z.object({
  paperType: z.string().min(1),
  centralClaimIds: z.array(z.string()),
  selectedReviewerIds: z.array(z.string()),
  selectedVerifierIds: z.array(z.string()),
  skippedReviewers: z.array(skippedCapabilitySchema),
  skippedVerifiers: z.array(skippedCapabilitySchema),
  routingEvents: z.array(playbackEventSchema),
  notes: z.array(z.string()).optional(),
})

export const demoDataPackageSchema = z.object({
  schemaVersion: z.literal('2.0'),
  demo: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
  }),
  paper: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    authors: z.array(z.string()).optional(),
    venue: z.string().optional(),
    year: z.number().int().optional(),
    abstract: z.string().optional(),
    pdfAsset: z.string().optional(),
    previewMode: z.enum(['pdf', 'page_images', 'excerpt_only']).optional(),
    conferenceStyle: conferenceStyleSchema.optional(),
  }),
  sources: z.array(sourceRecordSchema),
  sections: z.array(paperSectionSchema),
  paperGraph: z.object({
    nodes: z.array(paperNodeSchema),
    edges: z.array(paperEdgeSchema),
    layoutHints: z
      .array(
        z.object({
          nodeId: z.string().min(1),
          x: z.number().optional(),
          y: z.number().optional(),
          group: z.string().optional(),
          rank: z.number().optional(),
        }),
      )
      .optional(),
  }),
  paperSummary: z.object({
    overview: z.string().min(1),
    keyPoints: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        summary: z.string().min(1),
        sourceIds: z.array(z.string()),
        nodeIds: z.array(z.string()).optional(),
      }),
    ),
  }),
  reviewPlan: reviewPlanSchema,
  reviewerRun: z.object({
    signals: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        sourceIds: z.array(z.string()),
      }),
    ),
    candidateAgents: z.array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        role: z.enum(['reviewer', 'verifier', 'director', 'meta_reviewer']),
        description: z.string().optional(),
        selected: z.boolean(),
        triggerSignalIds: z.array(z.string()),
      }),
    ),
    selectedAgentIds: z.array(z.string()),
    routingEvents: z.array(playbackEventSchema).optional(),
    review: z.object({
      findingIds: z.array(z.string()),
      draftNotes: z.array(z.string()).optional(),
      authorQuestions: z.array(z.string()),
    }),
  }),
  findings: z.array(findingRecordSchema),
  verifications: z.array(verificationRecordSchema),
  impactAssessments: z.array(impactAssessmentSchema),
  counterfactualTests: z.array(counterfactualRecordSchema),
  synthesis: z.object({
    summary: z.string().min(1),
    strengths: z.array(z.string()),
    majorWeaknesses: z.array(z.string()),
    minorWeaknesses: z.array(z.string()),
    authorQuestions: z.array(z.string()),
    evidenceNotes: z.array(z.string()).optional(),
    recommendation: z.string().optional(),
    confidence: z.string().optional(),
    ratings: z.array(reviewRatingSchema).optional(),
    conferenceStyle: conferenceStyleSchema,
  }),
  askPeerMind: z
    .object({
      suggestedPrompts: z.array(
        z.object({
          id: z.string().min(1),
          scope: askScopeSchema,
          contextId: z.string().optional(),
          label: z.string().min(1),
          query: z.string().min(1),
        }),
      ),
      preparedResponses: z
        .array(
          z.object({
            id: z.string().min(1),
            match: z.object({
              scope: askScopeSchema,
              contextId: z.string().optional(),
              promptId: z.string().optional(),
            }),
            response: askResponseSchema,
          }),
        )
        .optional(),
    })
    .optional(),
  comparisonPreset: comparisonPresetSchema.optional(),
})

function collectDuplicates(ids: string[], label: string, errors: string[]) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) {
      errors.push(`${label} ${id} is duplicated`)
    }
    seen.add(id)
  }
}

function requireIds(
  refs: string[],
  known: Set<string>,
  format: (id: string) => string,
  errors: string[],
) {
  for (const id of refs) {
    if (!known.has(id)) {
      errors.push(format(id))
    }
  }
}

function isNormalized(n: number) {
  return n >= 0 && n <= 1
}

export type PackageValidationResult =
  | { ok: true; data: DemoDataPackage }
  | { ok: false; errors: string[] }

function schemaVersionDiagnostic(raw: unknown): string[] | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const version = (raw as { schemaVersion?: unknown }).schemaVersion
  if (version === '1.0') return [SCHEMA_VERSION_ERROR]
  if (version !== undefined && version !== '2.0') {
    return [
      `schemaVersion: Unsupported package version ${String(version)}. This demo loads DemoDataPackage 2.0 only.`,
    ]
  }
  return undefined
}

export function validateDemoPackage(raw: unknown): PackageValidationResult {
  const versionErrors = schemaVersionDiagnostic(raw)
  if (versionErrors) {
    return { ok: false, errors: versionErrors }
  }

  const parsed = demoDataPackageSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => {
      const path = issue.path.length ? issue.path.join('.') : 'package'
      return `${path}: ${issue.message}`
    })
    return { ok: false, errors }
  }

  const data = parsed.data
  const errors: string[] = []

  const sourceIds = data.sources.map((s) => s.id)
  const sectionIds = data.sections.map((s) => s.id)
  const nodeIds = data.paperGraph.nodes.map((n) => n.id)
  const edgeIds = data.paperGraph.edges.map((e) => e.id)
  const findingIds = data.findings.map((f) => f.id)
  const agentIds = data.reviewerRun.candidateAgents.map((a) => a.id)
  const signalIds = data.reviewerRun.signals.map((s) => s.id)
  const testIds = data.counterfactualTests.map((t) => t.id)
  const impactIds = data.impactAssessments.map((a) => a.id)
  const keyPointIds = data.paperSummary.keyPoints.map((k) => k.id)
  const promptIds = data.askPeerMind?.suggestedPrompts.map((p) => p.id) ?? []
  const askResponseIds = data.askPeerMind?.preparedResponses?.map((r) => r.id) ?? []
  const themeIds = data.comparisonPreset?.result.themes.map((t) => t.id) ?? []

  const evidenceIds = [
    ...data.findings.flatMap((f) => [
      ...f.evidenceFor.map((e) => e.id),
      ...f.evidenceAgainst.map((e) => e.id),
    ]),
    ...data.verifications.flatMap((item) => [
      ...item.ledger.for.map((e) => e.id),
      ...item.ledger.against.map((e) => e.id),
      ...item.ledger.gaps.map((e) => e.id),
    ]),
  ]

  collectDuplicates(sourceIds, 'Source', errors)
  collectDuplicates(sectionIds, 'Section', errors)
  collectDuplicates(nodeIds, 'Graph node', errors)
  collectDuplicates(edgeIds, 'Graph edge', errors)
  collectDuplicates(findingIds, 'Finding', errors)
  collectDuplicates(agentIds, 'Reviewer agent', errors)
  collectDuplicates(signalIds, 'Review signal', errors)
  collectDuplicates(testIds, 'Counterfactual test', errors)
  collectDuplicates(impactIds, 'Impact assessment', errors)
  collectDuplicates(keyPointIds, 'Key point', errors)
  collectDuplicates(promptIds, 'Ask prompt', errors)
  collectDuplicates(askResponseIds, 'Ask response', errors)
  collectDuplicates(themeIds, 'Comparison theme', errors)
  collectDuplicates(evidenceIds, 'Evidence record', errors)
  collectDuplicates(
    data.verifications.map((item) => item.findingId),
    'Verification for finding',
    errors,
  )
  collectDuplicates(
    data.impactAssessments.map((item) => item.findingId),
    'Impact assessment for finding',
    errors,
  )

  const sources = new Set(sourceIds)
  const sections = new Set(sectionIds)
  const nodes = new Set(nodeIds)
  const findings = new Set(findingIds)
  const agents = new Set(agentIds)
  const signals = new Set(signalIds)
  const tests = new Set(testIds)
  const impacts = new Set(impactIds)
  const prompts = new Set(promptIds)
  const evidence = new Set(evidenceIds)

  for (const source of data.sources) {
    if (source.sectionId && !sections.has(source.sectionId)) {
      errors.push(`Source ${source.id} references unknown section ${source.sectionId}`)
    }
    for (const region of source.highlightRegions ?? []) {
      if (
        !isNormalized(region.x) ||
        !isNormalized(region.y) ||
        !isNormalized(region.width) ||
        !isNormalized(region.height)
      ) {
        errors.push(`Highlight region ${region.id} has invalid normalized coordinates`)
      }
    }
  }

  for (const section of data.sections) {
    requireIds(
      section.sourceIds,
      sources,
      (id) => `Section ${section.id} references unknown source ${id}`,
      errors,
    )
  }

  for (const node of data.paperGraph.nodes) {
    requireIds(
      node.sourceIds,
      sources,
      (id) => `Graph node ${node.id} references unknown source ${id}`,
      errors,
    )
  }

  for (const edge of data.paperGraph.edges) {
    if (!nodes.has(edge.source)) {
      errors.push(`Graph edge ${edge.id} references unknown node ${edge.source}`)
    }
    if (!nodes.has(edge.target)) {
      errors.push(`Graph edge ${edge.id} references unknown node ${edge.target}`)
    }
    requireIds(
      edge.sourceIds,
      sources,
      (id) => `Graph edge ${edge.id} references unknown source ${id}`,
      errors,
    )
  }

  for (const hint of data.paperGraph.layoutHints ?? []) {
    if (!nodes.has(hint.nodeId)) {
      errors.push(`Layout hint references unknown node ${hint.nodeId}`)
    }
  }

  for (const point of data.paperSummary.keyPoints) {
    requireIds(
      point.sourceIds,
      sources,
      (id) => `Key point ${point.id} references unknown source ${id}`,
      errors,
    )
    requireIds(
      point.nodeIds ?? [],
      nodes,
      (id) => `Key point ${point.id} references unknown node ${id}`,
      errors,
    )
  }

  requireIds(
    data.reviewPlan.centralClaimIds,
    nodes,
    (id) => `Review plan references unknown central claim ${id}`,
    errors,
  )
  requireIds(
    data.reviewPlan.selectedReviewerIds,
    agents,
    (id) => `Review plan selected reviewer ${id} does not exist`,
    errors,
  )
  requireIds(
    data.reviewPlan.selectedVerifierIds,
    agents,
    (id) => `Review plan selected verifier ${id} does not exist`,
    errors,
  )

  for (const signal of data.reviewerRun.signals) {
    requireIds(
      signal.sourceIds,
      sources,
      (id) => `Review signal ${signal.id} references unknown source ${id}`,
      errors,
    )
  }

  for (const agent of data.reviewerRun.candidateAgents) {
    requireIds(
      agent.triggerSignalIds,
      signals,
      (id) => `Reviewer agent ${agent.id} references unknown signal ${id}`,
      errors,
    )
  }

  requireIds(
    data.reviewerRun.selectedAgentIds,
    agents,
    (id) => `Selected agent ${id} does not exist`,
    errors,
  )

  requireIds(
    data.reviewerRun.review.findingIds,
    findings,
    (id) => `Review document references unknown finding ${id}`,
    errors,
  )

  for (const finding of data.findings) {
    if (!agents.has(finding.reviewerAgentId)) {
      errors.push(`Finding ${finding.id} references unknown agent ${finding.reviewerAgentId}`)
    }
    if (finding.targetClaimId && !nodes.has(finding.targetClaimId)) {
      errors.push(`Finding ${finding.id} references unknown claim ${finding.targetClaimId}`)
    }
    if (finding.contract.targetClaimId && !nodes.has(finding.contract.targetClaimId)) {
      errors.push(
        `Finding ${finding.id} contract references unknown claim ${finding.contract.targetClaimId}`,
      )
    }
    requireIds(
      finding.sourceIds,
      sources,
      (id) => `Finding ${finding.id} references unknown source ${id}`,
      errors,
    )
    for (const record of [...finding.evidenceFor, ...finding.evidenceAgainst]) {
      requireIds(
        record.sourceIds,
        sources,
        (id) => `Finding ${finding.id} evidence ${record.id} references unknown source ${id}`,
        errors,
      )
    }
  }

  for (const verification of data.verifications) {
    if (!findings.has(verification.findingId)) {
      errors.push(`Verification references unknown finding ${verification.findingId}`)
    }
    requireIds(
      verification.agentIds,
      agents,
      (id) => `Verification ${verification.findingId} references unknown agent ${id}`,
      errors,
    )
    if (verification.impactAssessmentId && !impacts.has(verification.impactAssessmentId)) {
      errors.push(
        `Verification ${verification.findingId} references unknown impact ${verification.impactAssessmentId}`,
      )
    }

    const workflowNodeIds = new Set(verification.workflowNodes.map((n) => n.id))
    collectDuplicates(
      verification.workflowNodes.map((n) => n.id),
      `Workflow node in ${verification.findingId}`,
      errors,
    )

    for (const edge of verification.workflowEdges) {
      if (!workflowNodeIds.has(edge.source) || !workflowNodeIds.has(edge.target)) {
        errors.push(
          `Workflow event references unknown node ${!workflowNodeIds.has(edge.source) ? edge.source : edge.target}`,
        )
      }
    }

    for (const event of verification.events) {
      if (
        event.type === 'activate_node' ||
        event.type === 'complete_node' ||
        event.type === 'skip_node'
      ) {
        if (!workflowNodeIds.has(event.nodeId)) {
          errors.push(`Workflow event references unknown node ${event.nodeId}`)
        }
      }
      if (event.type === 'spawn_agent' && !agents.has(event.agentId)) {
        errors.push(
          `Verification ${verification.findingId} spawn event references unknown agent ${event.agentId}`,
        )
      }
      if (event.type === 'reveal_source') {
        requireIds(
          event.sourceIds,
          sources,
          (id) => `Workflow event references unknown source ${id}`,
          errors,
        )
      }
      if (event.type === 'update_ledger') {
        requireIds(
          event.evidenceRecordIds,
          evidence,
          (id) => `Workflow event references unknown evidence ${id}`,
          errors,
        )
      }
      if (event.type === 'replan') {
        requireIds(
          event.replan.spawnedAgentIds,
          agents,
          (id) => `Replan event references unknown agent ${id}`,
          errors,
        )
      }
      if (event.type === 'impact_update' && !impacts.has(event.assessmentId)) {
        errors.push(
          `Verification ${verification.findingId} impact event references unknown assessment ${event.assessmentId}`,
        )
      }
      if (event.type === 'calibrate' && !findings.has(event.findingId)) {
        errors.push(
          `Verification ${verification.findingId} calibrate event references unknown finding ${event.findingId}`,
        )
      }
    }

    for (const record of [
      ...verification.ledger.for,
      ...verification.ledger.against,
      ...verification.ledger.gaps,
    ]) {
      requireIds(
        record.sourceIds,
        sources,
        (id) => `Ledger ${record.id} references unknown source ${id}`,
        errors,
      )
    }
  }

  for (const assessment of data.impactAssessments) {
    if (!findings.has(assessment.findingId)) {
      errors.push(`Impact ${assessment.id} references unknown finding ${assessment.findingId}`)
    }
    if (assessment.counterfactualTestId && !tests.has(assessment.counterfactualTestId)) {
      errors.push(
        `Impact ${assessment.id} references unknown counterfactual ${assessment.counterfactualTestId}`,
      )
    }
  }

  for (const test of data.counterfactualTests) {
    if (!findings.has(test.findingId)) {
      errors.push(`Counterfactual ${test.id} references unknown finding ${test.findingId}`)
    }
    for (const variant of [test.current, test.intervened]) {
      if (!variant) continue
      requireIds(
        variant.changedSourceIds,
        sources,
        (id) => `Counterfactual ${test.id} references unknown source ${id}`,
        errors,
      )
    }
  }

  if (data.askPeerMind) {
    for (const prompt of data.askPeerMind.suggestedPrompts) {
      if (prompt.scope === 'finding' && prompt.contextId && !findings.has(prompt.contextId)) {
        errors.push(`Ask prompt ${prompt.id} references unknown finding ${prompt.contextId}`)
      }
      if (prompt.scope === 'source' && prompt.contextId && !sources.has(prompt.contextId)) {
        errors.push(`Ask prompt ${prompt.id} references unknown source ${prompt.contextId}`)
      }
    }
    for (const prepared of data.askPeerMind.preparedResponses ?? []) {
      if (prepared.match.promptId && !prompts.has(prepared.match.promptId)) {
        errors.push(`Ask response ${prepared.id} references unknown prompt ${prepared.match.promptId}`)
      }
      requireIds(
        prepared.response.sourceIds,
        sources,
        (id) => `Ask response ${prepared.id} references unknown source ${id}`,
        errors,
      )
    }
  }

  if (data.comparisonPreset) {
    const comparisonRows = [
      ...data.comparisonPreset.result.themes,
      ...(data.comparisonPreset.result.questions ?? []),
    ]
    for (const theme of comparisonRows) {
      requireIds(
        theme.peerMindFindingIds,
        findings,
        (id) => `Comparison theme ${theme.id} references unknown finding ${id}`,
        errors,
      )
      requireIds(
        theme.sourceIds ?? [],
        sources,
        (id) => `Comparison theme ${theme.id} references unknown source ${id}`,
        errors,
      )
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, data: data as DemoDataPackage }
}

export function formatValidationErrors(errors: string[]) {
  const count = errors.length
  const heading = `${count} validation error${count === 1 ? '' : 's'}:`
  return [heading, ...errors.map((error) => `- ${error}`)].join('\n')
}
