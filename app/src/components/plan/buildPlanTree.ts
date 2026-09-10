import { findingsForAgent, getAgent, getNode } from '@/data/queryPackage'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { ReviewerAgent, ReviewerRole, SkippedCapability } from '@/types/finding'

export const PLAN_DIRECTOR_ID = 'plan-director'
export const PLAN_PAPER_ID = 'plan-paper'
export const PLAN_REVIEWERS_ID = 'plan-reviewers'
export const PLAN_FINDINGS_ID = 'plan-findings'
export const PLAN_VERIFIERS_ID = 'plan-verifiers'

export type PlanNodeKind = 'paper' | 'director' | 'group' | 'findings' | 'agent'

export interface PlanGraphNode {
  id: string
  kind: PlanNodeKind
  label: string
  subtitle?: string
  skipped?: boolean
  agentId?: string
  group?: 'reviewers' | 'verifiers'
  x: number
  y: number
}

export interface PlanGraphEdge {
  id: string
  source: string
  target: string
  skipped?: boolean
}

export interface PlanSubtask {
  id: string
  kind: 'signal' | 'agent' | 'finding' | 'claim' | 'decision'
  label: string
  detail?: string
  sourceIds?: string[]
  findingId?: string
  agentId?: string
  paperNodeId?: string
}

export interface PlanAssignment {
  nodeId: string
  kind: PlanNodeKind
  title: string
  roleLabel?: string
  summary: string
  status: 'selected' | 'skipped' | 'context'
  skipReason?: string
  tasks: PlanSubtask[]
  notes?: string[]
}

export const ROLE_LABELS: Record<ReviewerRole, string> = {
  reviewer: 'Reviewer',
  verifier: 'Verifier',
  director: 'Director',
  meta_reviewer: 'Meta reviewer',
}

const NODE_WIDTH = 168
const COL_GAP = 16
const ROW_GAP = 108
const PAD = 28

interface PlannedAgent {
  id: string
  label: string
  skipped: boolean
  reason?: string
  agent?: ReviewerAgent
}

function clusterWidth(count: number): number {
  if (count <= 0) return 0
  return count * NODE_WIDTH + (count - 1) * COL_GAP
}

function slotX(count: number, index: number, originX: number): number {
  const width = clusterWidth(count)
  return originX + index * (NODE_WIDTH + COL_GAP) + NODE_WIDTH / 2 - width / 2
}

function resolveAgents(
  pkg: DemoDataPackage,
  selectedIds: string[],
  skipped: SkippedCapability[],
): PlannedAgent[] {
  const seen = new Set<string>()
  const out: PlannedAgent[] = []

  for (const id of selectedIds) {
    if (seen.has(id)) continue
    seen.add(id)
    const agent = getAgent(pkg, id)
    out.push({
      id,
      label: agent?.label ?? id,
      skipped: false,
      agent,
    })
  }

  for (const item of skipped) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    const agent = getAgent(pkg, item.id)
    out.push({
      id: item.id,
      label: agent?.label ?? item.label,
      skipped: true,
      reason: item.reason,
      agent,
    })
  }

  return out
}

function selectedCount(agents: PlannedAgent[]): number {
  return agents.filter((agent) => !agent.skipped).length
}

function skippedCount(agents: PlannedAgent[]): number {
  return agents.filter((agent) => agent.skipped).length
}

function groupSubtitle(agents: PlannedAgent[]): string {
  const selected = selectedCount(agents)
  const skipped = skippedCount(agents)
  if (skipped > 0) return `${selected} selected · ${skipped} skipped`
  return `${selected} selected`
}

export function buildPlanTree(pkg: DemoDataPackage): {
  nodes: PlanGraphNode[]
  edges: PlanGraphEdge[]
} {
  const plan = pkg.reviewPlan
  const reviewers = resolveAgents(pkg, plan.selectedReviewerIds, plan.skippedReviewers)
  const verifiers = resolveAgents(pkg, plan.selectedVerifierIds, plan.skippedVerifiers)
  const selectedReviewers = reviewers.filter((agent) => !agent.skipped)
  const showFindings = selectedReviewers.length > 0

  const contentWidth = Math.max(
    NODE_WIDTH,
    clusterWidth(reviewers.length),
    clusterWidth(verifiers.length),
  )
  const midX = PAD + contentWidth / 2

  let rowY = PAD
  const nextRow = () => {
    const current = rowY
    rowY += ROW_GAP
    return current
  }

  const yPaper = nextRow()
  const yDirector = nextRow()
  const yReviewersGroup = reviewers.length > 0 ? nextRow() : -1
  const yReviewerAgents = reviewers.length > 0 ? nextRow() : -1
  const yFindings = showFindings ? nextRow() : -1
  const yVerifiersGroup = verifiers.length > 0 ? nextRow() : -1
  const yVerifierAgents = verifiers.length > 0 ? nextRow() : -1

  const nodes: PlanGraphNode[] = [
    {
      id: PLAN_PAPER_ID,
      kind: 'paper',
      label: 'Paper type',
      subtitle: 'Input',
      x: midX - NODE_WIDTH / 2,
      y: yPaper,
    },
    {
      id: PLAN_DIRECTOR_ID,
      kind: 'director',
      label: 'Review Director',
      subtitle: 'Planner',
      x: midX - NODE_WIDTH / 2,
      y: yDirector,
    },
  ]
  const edges: PlanGraphEdge[] = [
    { id: 'e-paper-director', source: PLAN_PAPER_ID, target: PLAN_DIRECTOR_ID },
  ]

  if (reviewers.length > 0) {
    nodes.push({
      id: PLAN_REVIEWERS_ID,
      kind: 'group',
      label: 'Reviewers',
      subtitle: groupSubtitle(reviewers),
      group: 'reviewers',
      x: midX - NODE_WIDTH / 2,
      y: yReviewersGroup,
    })
    edges.push({
      id: 'e-director-reviewers',
      source: PLAN_DIRECTOR_ID,
      target: PLAN_REVIEWERS_ID,
    })
    reviewers.forEach((agent, index) => {
      nodes.push({
        id: agent.id,
        kind: 'agent',
        label: agent.label,
        subtitle: agent.skipped
          ? `${ROLE_LABELS[agent.agent?.role ?? 'reviewer']} · skipped`
          : ROLE_LABELS[agent.agent?.role ?? 'reviewer'],
        skipped: agent.skipped,
        agentId: agent.id,
        x: slotX(reviewers.length, index, midX) - NODE_WIDTH / 2,
        y: yReviewerAgents,
      })
      edges.push({
        id: `e-reviewers-${agent.id}`,
        source: PLAN_REVIEWERS_ID,
        target: agent.id,
        skipped: agent.skipped,
      })
    })
  }

  if (showFindings) {
    nodes.push({
      id: PLAN_FINDINGS_ID,
      kind: 'findings',
      label: 'Candidate Findings',
      subtitle: 'After reviews',
      x: midX - NODE_WIDTH / 2,
      y: yFindings,
    })
    for (const agent of selectedReviewers) {
      edges.push({
        id: `e-${agent.id}-findings`,
        source: agent.id,
        target: PLAN_FINDINGS_ID,
      })
    }
  }

  if (verifiers.length > 0) {
    nodes.push({
      id: PLAN_VERIFIERS_ID,
      kind: 'group',
      label: 'Verification Network',
      subtitle: groupSubtitle(verifiers),
      group: 'verifiers',
      x: midX - NODE_WIDTH / 2,
      y: yVerifiersGroup,
    })
    const verificationSource = showFindings
      ? PLAN_FINDINGS_ID
      : reviewers.length > 0
        ? PLAN_REVIEWERS_ID
        : PLAN_DIRECTOR_ID
    edges.push({
      id: 'e-findings-verifiers',
      source: verificationSource,
      target: PLAN_VERIFIERS_ID,
    })
    verifiers.forEach((agent, index) => {
      nodes.push({
        id: agent.id,
        kind: 'agent',
        label: agent.label,
        subtitle: agent.skipped
          ? `${ROLE_LABELS[agent.agent?.role ?? 'verifier']} · skipped`
          : ROLE_LABELS[agent.agent?.role ?? 'verifier'],
        skipped: agent.skipped,
        agentId: agent.id,
        x: slotX(verifiers.length, index, midX) - NODE_WIDTH / 2,
        y: yVerifierAgents,
      })
      edges.push({
        id: `e-verifiers-${agent.id}`,
        source: PLAN_VERIFIERS_ID,
        target: agent.id,
        skipped: agent.skipped,
      })
    })
  }

  return { nodes, edges }
}

function routingNotes(pkg: DemoDataPackage): string[] {
  const notes: string[] = []
  for (const event of pkg.reviewPlan.routingEvents) {
    if (event.type === 'message') notes.push(event.text)
    if (event.type === 'stop') notes.push(event.reason)
  }
  for (const note of pkg.reviewPlan.notes ?? []) notes.push(note)
  return notes
}

function agentTasks(pkg: DemoDataPackage, agent: PlannedAgent): PlanSubtask[] {
  const tasks: PlanSubtask[] = []
  const signals = pkg.reviewerRun.signals
  const triggerIds = agent.agent?.triggerSignalIds ?? []

  for (const finding of findingsForAgent(pkg, agent.id)) {
    tasks.push({
      id: finding.id,
      kind: 'finding',
      label: finding.category,
      detail: finding.contract.verificationQuestion,
      sourceIds: finding.sourceIds,
      findingId: finding.id,
      paperNodeId: finding.targetClaimId,
    })
  }

  for (const signalId of triggerIds) {
    const signal = signals.find((item) => item.id === signalId)
    if (!signal) continue
    tasks.push({
      id: signal.id,
      kind: 'signal',
      label: signal.label,
      detail: 'Paper signal assigned to this specialist.',
      sourceIds: signal.sourceIds,
    })
  }

  return tasks
}

function plannedAgent(
  pkg: DemoDataPackage,
  id: string,
  skipped: SkippedCapability[],
): PlannedAgent {
  const skip = skipped.find((item) => item.id === id)
  const agent = getAgent(pkg, id)
  return {
    id,
    label: agent?.label ?? skip?.label ?? id,
    skipped: Boolean(skip),
    reason: skip?.reason,
    agent,
  }
}

export function getPlanAssignment(pkg: DemoDataPackage, nodeId: string): PlanAssignment | undefined {
  const plan = pkg.reviewPlan
  const reviewers = resolveAgents(pkg, plan.selectedReviewerIds, plan.skippedReviewers)
  const verifiers = resolveAgents(pkg, plan.selectedVerifierIds, plan.skippedVerifiers)

  if (nodeId === PLAN_PAPER_ID) {
    return {
      nodeId,
      kind: 'paper',
      title: 'Paper type',
      roleLabel: 'Input',
      summary: plan.paperType,
      status: 'context',
      tasks: plan.centralClaimIds.map((id) => {
        const node = getNode(pkg, id)
        return {
          id,
          kind: 'claim' as const,
          label: node?.label ?? id,
          detail: 'Central claim the director will staff against.',
          sourceIds: node?.sourceIds,
          paperNodeId: id,
        }
      }),
    }
  }

  if (nodeId === PLAN_DIRECTOR_ID) {
    const runTasks = [...reviewers, ...verifiers].map((agent) => ({
      id: `decision-${agent.id}`,
      kind: 'decision' as const,
      label: agent.skipped ? `Skip ${agent.label}` : `Run ${agent.label}`,
      detail: agent.skipped
        ? agent.reason
        : (agent.agent?.description ?? 'Selected from paper signals.'),
      agentId: agent.id,
    }))
    return {
      nodeId,
      kind: 'director',
      title: 'Review Director',
      roleLabel: 'Planner',
      summary:
        'The director staffs reviewers first. Verification runs only after those reviewers produce candidate findings. The director does not write the review.',
      status: 'selected',
      tasks: runTasks,
      notes: routingNotes(pkg),
    }
  }

  if (nodeId === PLAN_REVIEWERS_ID) {
    return {
      nodeId,
      kind: 'group',
      title: 'Reviewers',
      roleLabel: 'Assigned team',
      summary: 'Specialists assigned to produce atomic candidate findings.',
      status: 'selected',
      tasks: reviewers.map((agent) => ({
        id: agent.id,
        kind: 'agent' as const,
        label: agent.label,
        detail: agent.skipped
          ? agent.reason
          : (agent.agent?.description ?? 'Selected reviewer.'),
        agentId: agent.id,
      })),
    }
  }

  if (nodeId === PLAN_FINDINGS_ID) {
    return {
      nodeId,
      kind: 'findings',
      title: 'Candidate Findings',
      roleLabel: 'Review output',
      summary:
        'Selected reviewers generate atomic candidate findings. The Verification Network starts only after those findings exist.',
      status: 'selected',
      tasks: pkg.findings.map((finding) => ({
        id: finding.id,
        kind: 'finding' as const,
        label: finding.category,
        detail: finding.contract.verificationQuestion,
        sourceIds: finding.sourceIds,
        findingId: finding.id,
        paperNodeId: finding.targetClaimId,
      })),
    }
  }

  if (nodeId === PLAN_VERIFIERS_ID) {
    return {
      nodeId,
      kind: 'group',
      title: 'Verification Network',
      roleLabel: 'Assigned team',
      summary:
        'Verification is planned after candidate findings exist. Capabilities include the evidence burden and explicit skips.',
      status: 'selected',
      tasks: verifiers.map((agent) => ({
        id: agent.id,
        kind: 'agent' as const,
        label: agent.label,
        detail: agent.skipped
          ? agent.reason
          : (agent.agent?.description ?? 'Selected verifier.'),
        agentId: agent.id,
      })),
    }
  }

  const fromLists = [...reviewers, ...verifiers].find((agent) => agent.id === nodeId)
  const agent =
    fromLists ??
    plannedAgent(pkg, nodeId, [...plan.skippedReviewers, ...plan.skippedVerifiers])
  if (!fromLists && !getAgent(pkg, nodeId)) return undefined

  return {
    nodeId,
    kind: 'agent',
    title: agent.label,
    roleLabel: ROLE_LABELS[agent.agent?.role ?? 'reviewer'],
    summary:
      agent.skipped && (!agent.agent?.description || agent.agent.description === agent.reason)
        ? 'The director did not assign this capability.'
        : (agent.agent?.description ??
          'The director assigned this specialist from the paper signals.'),
    status: agent.skipped ? 'skipped' : 'selected',
    skipReason: agent.reason,
    tasks: agentTasks(pkg, agent),
  }
}
