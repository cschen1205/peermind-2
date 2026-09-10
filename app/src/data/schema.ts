import { z } from 'zod'
import type { DemoDataPackage } from '@/types/demoPackage'

const findingValiditySchema = z.enum([
  'verified',
  'supported',
  'refuted',
  'unverified',
  'disputed',
  'human_required',
  'not_checked',
])

const sensitivityStatusSchema = z.enum([
  'passed',
  'failed',
  'inconclusive',
  'not_applicable',
])

const askScopeSchema = z.enum([
  'whole_paper',
  'section',
  'source',
  'paper_graph_node',
  'finding',
  'evidence_ledger',
  'counterfactual_test',
  'report',
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
  type: z.enum(['method', 'claim', 'evidence', 'gap', 'question']),
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

const critiqueContractSchema = z.object({
  allegation: z.string().min(1),
  type: z.string().min(1),
  scope: z.string().min(1),
  falsifier: z.string().min(1),
  evidenceBurden: z.string().min(1),
  stopRule: z.string().min(1),
  relevanceTarget: z.string().min(1),
})

const findingRecordSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  critique: z.string().min(1),
  reviewerAgentId: z.string().min(1),
  sourceIds: z.array(z.string()),
  contract: critiqueContractSchema,
  evidenceFor: z.array(evidenceRecordSchema),
  evidenceAgainst: z.array(evidenceRecordSchema),
  missingEvidence: z.array(z.string()),
  validity: findingValiditySchema,
  importance: z.object({
    level: z.string().min(1),
    explanation: z.string().min(1),
  }),
  sensitivity: z
    .object({
      status: sensitivityStatusSchema,
      explanation: z.string().min(1),
    })
    .optional(),
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
  z.object({ type: z.literal('spawn_agent'), agentId: z.string() }),
  z.object({ type: z.literal('reveal_source'), sourceIds: z.array(z.string()) }),
  z.object({ type: z.literal('update_ledger'), evidenceRecordIds: z.array(z.string()) }),
  z.object({ type: z.literal('replan'), replan: replanEventSchema }),
  z.object({ type: z.literal('verdict'), status: findingValiditySchema }),
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

const evidenceLedgerSchema = z.object({
  for: z.array(evidenceRecordSchema),
  against: z.array(evidenceRecordSchema),
  gaps: z.array(evidenceRecordSchema),
})

const investigationRecordSchema = z.object({
  findingId: z.string().min(1),
  agentIds: z.array(z.string()),
  workflowNodes: z.array(workflowNodeSchema),
  workflowEdges: z.array(workflowEdgeSchema),
  events: z.array(playbackEventSchema),
  finalLedger: evidenceLedgerSchema,
  initialVerdict: findingValiditySchema,
  limitations: z.array(z.string()),
  counterfactualTestId: z.string().optional(),
})

const counterfactualVariantSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  changedSourceIds: z.array(z.string()),
  reviewerResponse: z.string().min(1),
})

const counterfactualRecordSchema = z.object({
  id: z.string().min(1),
  findingId: z.string().min(1),
  baseline: counterfactualVariantSchema,
  targeted: counterfactualVariantSchema,
  control: counterfactualVariantSchema,
  expectedBehavior: z.string().min(1),
  result: sensitivityStatusSchema,
  explanation: z.string().min(1),
})

const humanReviewInputSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  reviewText: z.string(),
  sourceType: z.enum(['openreview', 'manual', 'other']),
  sourceUrl: z.string().optional(),
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
  peerMindFindingIds: z.array(z.string()),
  humanFindingIds: z.array(z.string()),
  baselineFindingIds: z.array(z.string()).optional(),
  relation: z.enum(['shared', 'human_only', 'peermind_only', 'disagreement']),
  sourceIds: z.array(z.string()).optional(),
  defenderStatus: findingValiditySchema.optional(),
  explanation: z.string().optional(),
})

export const comparisonPresetSchema = z.object({
  id: z.string().min(1),
  inputs: comparisonInputBundleSchema.optional(),
  result: z.object({
    themes: z.array(comparisonThemeSchema),
    summary: z.object({
      sharedCount: z.number().int().nonnegative(),
      humanOnlyCount: z.number().int().nonnegative(),
      peerMindOnlyCount: z.number().int().nonnegative(),
      disagreementCount: z.number().int().nonnegative(),
      refutedCount: z.number().int().nonnegative().optional(),
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
          'open_investigation',
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

export const demoDataPackageSchema = z.object({
  schemaVersion: z.literal('1.0'),
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
        description: z.string().optional(),
        selected: z.boolean(),
        triggerSignalIds: z.array(z.string()),
      }),
    ),
    selectedAgentIds: z.array(z.string()),
    routingEvents: z.array(playbackEventSchema),
    review: z.object({
      overallAssessment: z.string().min(1),
      strengths: z.array(z.string()),
      authorQuestions: z.array(z.string()),
      findingIds: z.array(z.string()),
    }),
  }),
  findings: z.array(findingRecordSchema),
  investigations: z.array(investigationRecordSchema),
  counterfactualTests: z.array(counterfactualRecordSchema),
  report: z.object({
    summary: z.string().min(1),
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

export function validateDemoPackage(raw: unknown): PackageValidationResult {
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
  const keyPointIds = data.paperSummary.keyPoints.map((k) => k.id)
  const promptIds = data.askPeerMind?.suggestedPrompts.map((p) => p.id) ?? []
  const askResponseIds = data.askPeerMind?.preparedResponses?.map((r) => r.id) ?? []
  const themeIds = data.comparisonPreset?.result.themes.map((t) => t.id) ?? []

  const evidenceIds = [
    ...data.findings.flatMap((f) => [
      ...f.evidenceFor.map((e) => e.id),
      ...f.evidenceAgainst.map((e) => e.id),
    ]),
    ...data.investigations.flatMap((inv) => [
      ...inv.finalLedger.for.map((e) => e.id),
      ...inv.finalLedger.against.map((e) => e.id),
      ...inv.finalLedger.gaps.map((e) => e.id),
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
  collectDuplicates(keyPointIds, 'Key point', errors)
  collectDuplicates(promptIds, 'Ask prompt', errors)
  collectDuplicates(askResponseIds, 'Ask response', errors)
  collectDuplicates(themeIds, 'Comparison theme', errors)
  collectDuplicates(evidenceIds, 'Evidence record', errors)
  collectDuplicates(
    data.investigations.map((inv) => inv.findingId),
    'Investigation for finding',
    errors,
  )

  const sources = new Set(sourceIds)
  const sections = new Set(sectionIds)
  const nodes = new Set(nodeIds)
  const findings = new Set(findingIds)
  const agents = new Set(agentIds)
  const signals = new Set(signalIds)
  const tests = new Set(testIds)
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

  for (const investigation of data.investigations) {
    if (!findings.has(investigation.findingId)) {
      errors.push(`Investigation references unknown finding ${investigation.findingId}`)
    }
    requireIds(
      investigation.agentIds,
      agents,
      (id) => `Investigation ${investigation.findingId} references unknown agent ${id}`,
      errors,
    )
    if (investigation.counterfactualTestId && !tests.has(investigation.counterfactualTestId)) {
      errors.push(
        `Investigation ${investigation.findingId} references unknown counterfactual ${investigation.counterfactualTestId}`,
      )
    }

    const workflowNodeIds = new Set(investigation.workflowNodes.map((n) => n.id))
    collectDuplicates(
      investigation.workflowNodes.map((n) => n.id),
      `Workflow node in ${investigation.findingId}`,
      errors,
    )

    for (const edge of investigation.workflowEdges) {
      if (!workflowNodeIds.has(edge.source) || !workflowNodeIds.has(edge.target)) {
        errors.push(
          `Workflow event references unknown node ${!workflowNodeIds.has(edge.source) ? edge.source : edge.target}`,
        )
      }
    }

    for (const event of investigation.events) {
      if (event.type === 'activate_node' || event.type === 'complete_node') {
        if (!workflowNodeIds.has(event.nodeId)) {
          errors.push(`Workflow event references unknown node ${event.nodeId}`)
        }
      }
      if (event.type === 'spawn_agent' && !agents.has(event.agentId)) {
        errors.push(
          `Investigation ${investigation.findingId} spawn event references unknown agent ${event.agentId}`,
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
    }

    for (const record of [
      ...investigation.finalLedger.for,
      ...investigation.finalLedger.against,
      ...investigation.finalLedger.gaps,
    ]) {
      requireIds(
        record.sourceIds,
        sources,
        (id) => `Ledger ${record.id} references unknown source ${id}`,
        errors,
      )
    }
  }

  for (const test of data.counterfactualTests) {
    if (!findings.has(test.findingId)) {
      errors.push(`Counterfactual ${test.id} references unknown finding ${test.findingId}`)
    }
    for (const variant of [test.baseline, test.targeted, test.control]) {
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
    for (const theme of data.comparisonPreset.result.themes) {
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
