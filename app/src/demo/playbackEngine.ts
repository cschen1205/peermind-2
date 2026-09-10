import type { EvidenceVerdict } from '@/types/finding'
import type {
  PlaybackEvent,
  ReplanEvent,
  WorkflowEdgeData,
  WorkflowNodeData,
} from '@/types/verification'

export type NodePlayState =
  | 'idle'
  | 'current'
  | 'done'
  | 'blocked'
  | 'skipped'
  | 'counterfactual'

export interface PlaybackView {
  nodeStates: Record<string, NodePlayState>
  currentMessage?: string
  revealedSourceIds: string[]
  visibleEvidenceIds: string[]
  activeReplan?: ReplanEvent
  currentVerdict?: EvidenceVerdict
  impactAssessmentId?: string
  calibratedFindingId?: string
  stopReason?: string
  spawnedAgentIds: string[]
  complete: boolean
}

export function reducePlayback(
  events: PlaybackEvent[],
  eventIndex: number,
  nodes: Pick<WorkflowNodeData, 'id' | 'kind'>[],
  initialVerdict: EvidenceVerdict,
): PlaybackView {
  const applied = events.slice(0, Math.max(0, eventIndex))
  const nodeStates: Record<string, NodePlayState> = {}
  const kindById = new Map(nodes.map((node) => [node.id, node.kind]))

  for (const node of nodes) {
    nodeStates[node.id] = 'idle'
  }

  const revealedSourceIds: string[] = []
  const visibleEvidenceIds: string[] = []
  const spawnedAgentIds: string[] = []
  let currentMessage: string | undefined
  let activeReplan: ReplanEvent | undefined
  let currentVerdict: EvidenceVerdict | undefined = initialVerdict
  let impactAssessmentId: string | undefined
  let calibratedFindingId: string | undefined
  let stopReason: string | undefined

  function markCounterfactual(nodeId: string, next: NodePlayState) {
    if (kindById.get(nodeId) === 'counterfactual' && next !== 'idle' && next !== 'skipped') {
      nodeStates[nodeId] = 'counterfactual'
      return
    }
    nodeStates[nodeId] = next
  }

  for (const event of applied) {
    switch (event.type) {
      case 'message':
        currentMessage = event.text
        break
      case 'activate_node':
        markCounterfactual(event.nodeId, 'current')
        break
      case 'complete_node':
        markCounterfactual(event.nodeId, 'done')
        break
      case 'skip_node':
        nodeStates[event.nodeId] = 'skipped'
        break
      case 'spawn_agent':
        if (!spawnedAgentIds.includes(event.agentId)) {
          spawnedAgentIds.push(event.agentId)
        }
        break
      case 'reveal_source':
        revealedSourceIds.length = 0
        revealedSourceIds.push(...event.sourceIds)
        break
      case 'update_ledger':
        for (const id of event.evidenceRecordIds) {
          if (!visibleEvidenceIds.includes(id)) visibleEvidenceIds.push(id)
        }
        break
      case 'replan':
        activeReplan = event.replan
        for (const [id, state] of Object.entries(nodeStates)) {
          if (state === 'current') markCounterfactual(id, 'blocked')
        }
        break
      case 'evidence_verdict':
        currentVerdict = event.status
        break
      case 'impact_update':
        impactAssessmentId = event.assessmentId
        break
      case 'calibrate':
        calibratedFindingId = event.findingId
        break
      case 'stop':
        stopReason = event.reason
        break
      default:
        break
    }
  }

  const complete = events.length > 0 && eventIndex >= events.length

  if (complete) {
    for (const node of nodes) {
      if (nodeStates[node.id] === 'idle') {
        nodeStates[node.id] = 'skipped'
      }
    }
  }

  return {
    nodeStates,
    currentMessage,
    revealedSourceIds,
    visibleEvidenceIds,
    activeReplan,
    currentVerdict,
    impactAssessmentId,
    calibratedFindingId,
    stopReason,
    spawnedAgentIds,
    complete,
  }
}

export const NODE_KIND_LABELS: Record<string, string> = {
  inspect: 'Inspect',
  replan: 'Replan',
  verdict: 'Evidence verdict',
  counterfactual: 'Counterfactual',
  skip: 'Skipped',
  planner: 'Plan',
}

export const NODE_STATE_LABELS: Record<NodePlayState, string> = {
  idle: 'Not started',
  current: 'In progress',
  done: 'Complete',
  blocked: 'Blocked',
  skipped: 'Skipped',
  counterfactual: 'Counterfactual',
}

const NODE_KIND_PURPOSE: Record<string, string> = {
  inspect:
    'Read the cited manuscript sources and test the allegation against what the paper actually says.',
  replan:
    'A specialist is requested because the current evidence is not enough. The replan budget is bounded.',
  verdict: 'Record the evidence verdict and stop if the remaining evidence cannot be obtained.',
  skip: 'This tool is not invoked for this paper. The skip reason comes from the review plan.',
  planner: 'The director chooses which verification tools to run.',
  counterfactual:
    'Optional impact tool: hold the rest of the paper fixed and test whether a defined intervention changes claim support.',
}

export interface NodeInspection {
  node: WorkflowNodeData
  state: NodePlayState
  kindLabel?: string
  purpose: string
  relation?: string
  message?: string
  sourceIds: string[]
  evidenceIds: string[]
  spawnedAgentIds: string[]
  replan?: ReplanEvent
  verdict?: EvidenceVerdict
  impactAssessmentId?: string
  calibratedFindingId?: string
  stopReason?: string
  started: boolean
  hasOutput: boolean
}

function purposeFor(node: WorkflowNodeData, relation?: string): string {
  const parts: string[] = []
  if (node.subtitle) parts.push(node.subtitle + '.')
  const kindPurpose = node.kind ? NODE_KIND_PURPOSE[node.kind] : undefined
  if (kindPurpose) parts.push(kindPurpose)
  else parts.push(`Run the “${node.label}” check in the verification workflow.`)
  if (relation) parts.push(`Entered from the previous step as: ${relation}.`)
  return parts.join(' ')
}

export function inspectWorkflowNode(
  nodeId: string,
  events: PlaybackEvent[],
  eventIndex: number,
  nodes: WorkflowNodeData[],
  edges: WorkflowEdgeData[],
  nodeStates: Record<string, NodePlayState>,
): NodeInspection | undefined {
  const node = nodes.find((item) => item.id === nodeId)
  if (!node) return undefined

  const applied = events.slice(0, Math.max(0, eventIndex))
  const relation = edges.find((edge) => edge.target === node.id)?.relation
  const sourceIds: string[] = []
  const evidenceIds: string[] = []
  const spawnedAgentIds: string[] = []
  const seenEvidence = new Set<string>()
  let active = false
  let started = false
  let message: string | undefined
  let replan: ReplanEvent | undefined
  let verdict: EvidenceVerdict | undefined
  let impactAssessmentId: string | undefined
  let calibratedFindingId: string | undefined
  let stopReason: string | undefined

  for (const event of applied) {
    if (event.type === 'activate_node') {
      active = event.nodeId === node.id
      if (active) started = true
      continue
    }
    if (event.type === 'update_ledger' && !active) {
      for (const id of event.evidenceRecordIds) seenEvidence.add(id)
    }
    if (!active) continue

    switch (event.type) {
      case 'message':
        message = event.text
        break
      case 'reveal_source':
        for (const id of event.sourceIds) {
          if (!sourceIds.includes(id)) sourceIds.push(id)
        }
        break
      case 'update_ledger':
        for (const id of event.evidenceRecordIds) {
          if (!seenEvidence.has(id) && !evidenceIds.includes(id)) evidenceIds.push(id)
        }
        break
      case 'spawn_agent':
        if (!spawnedAgentIds.includes(event.agentId)) {
          spawnedAgentIds.push(event.agentId)
        }
        break
      case 'replan':
        replan = event.replan
        break
      case 'evidence_verdict':
        verdict = event.status
        break
      case 'impact_update':
        impactAssessmentId = event.assessmentId
        break
      case 'calibrate':
        calibratedFindingId = event.findingId
        break
      case 'skip_node':
        stopReason = event.reason
        break
      case 'stop':
        stopReason = event.reason
        break
      default:
        break
    }
  }

  return {
    node,
    state: nodeStates[node.id] ?? 'idle',
    kindLabel: node.kind ? NODE_KIND_LABELS[node.kind] ?? node.kind : undefined,
    purpose: purposeFor(node, relation),
    relation,
    message,
    sourceIds,
    evidenceIds,
    spawnedAgentIds,
    replan,
    verdict,
    impactAssessmentId,
    calibratedFindingId,
    stopReason,
    started,
    hasOutput:
      Boolean(message || replan || verdict || impactAssessmentId || calibratedFindingId || stopReason) ||
      sourceIds.length > 0 ||
      evidenceIds.length > 0 ||
      spawnedAgentIds.length > 0,
  }
}
