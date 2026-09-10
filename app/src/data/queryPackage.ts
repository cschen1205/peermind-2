import type { DemoDataPackage } from '@/types/demoPackage'
import type { EvidenceVerdict, FindingRecord, FindingStatus } from '@/types/finding'
import type { PaperNode, PaperSection, SourceRecord, SourceType } from '@/types/paper'
import type { CounterfactualRecord, ImpactAssessment, VerificationRecord } from '@/types/verification'

export const NODE_TYPE_LABELS: Record<PaperNode['type'], string> = {
  contribution: 'Contribution',
  claim: 'Claim',
  method: 'Method',
  assumption: 'Assumption',
  equation: 'Equation',
  experiment: 'Experiment',
  dataset: 'Dataset',
  baseline: 'Baseline',
  metric: 'Metric',
  result: 'Result',
  table: 'Table',
  figure: 'Figure',
  limitation: 'Limitation',
  appendix: 'Appendix',
  reference: 'Reference',
  scope: 'Scope',
  gap: 'Scope / Gap',
  question: 'Question',
  evidence: 'Evidence',
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  paragraph: 'Paragraph',
  claim: 'Claim',
  equation: 'Equation',
  table: 'Table',
  figure: 'Figure',
  appendix: 'Appendix',
  code: 'Code',
  external: 'External',
  reference: 'Reference',
}

export function getSource(pkg: DemoDataPackage, id: string): SourceRecord | undefined {
  return pkg.sources.find((source) => source.id === id)
}

export function getSources(pkg: DemoDataPackage, ids: string[]): SourceRecord[] {
  const byId = new Map(pkg.sources.map((source) => [source.id, source]))
  return ids.flatMap((id) => {
    const source = byId.get(id)
    return source ? [source] : []
  })
}

export function getSection(pkg: DemoDataPackage, id: string): PaperSection | undefined {
  return pkg.sections.find((section) => section.id === id)
}

export function getNode(pkg: DemoDataPackage, id: string): PaperNode | undefined {
  return pkg.paperGraph.nodes.find((node) => node.id === id)
}

export function getFinding(pkg: DemoDataPackage, id: string): FindingRecord | undefined {
  return pkg.findings.find((finding) => finding.id === id)
}

export function getAgent(pkg: DemoDataPackage, agentId: string) {
  return pkg.reviewerRun.candidateAgents.find((agent) => agent.id === agentId)
}

export function getAgentLabel(pkg: DemoDataPackage, agentId: string): string {
  return getAgent(pkg, agentId)?.label ?? agentId
}

export function findingsForAgent(pkg: DemoDataPackage, agentId: string): FindingRecord[] {
  return pkg.findings.filter((finding) => finding.reviewerAgentId === agentId)
}

export function nodesForSources(pkg: DemoDataPackage, sourceIds: string[]): PaperNode[] {
  if (sourceIds.length === 0) return []
  const wanted = new Set(sourceIds)
  return pkg.paperGraph.nodes.filter((node) => node.sourceIds.some((id) => wanted.has(id)))
}

export function findingsForSources(pkg: DemoDataPackage, sourceIds: string[]): FindingRecord[] {
  if (sourceIds.length === 0) return []
  const wanted = new Set(sourceIds)
  return pkg.findings.filter((finding) => finding.sourceIds.some((id) => wanted.has(id)))
}

export function neighborNodes(pkg: DemoDataPackage, nodeId: string): PaperNode[] {
  const ids = new Set<string>()
  for (const edge of pkg.paperGraph.edges) {
    if (edge.source === nodeId) ids.add(edge.target)
    if (edge.target === nodeId) ids.add(edge.source)
  }
  return pkg.paperGraph.nodes.filter((node) => ids.has(node.id))
}

export function sourceLocation(pkg: DemoDataPackage, source: SourceRecord): string {
  const section = source.sectionId ? getSection(pkg, source.sectionId) : undefined
  const parts: string[] = []
  if (section) parts.push(section.title)
  if (source.page != null) parts.push(`p. ${source.page}`)
  return parts.join(' · ')
}

export function deriveSectionId(pkg: DemoDataPackage, sourceIds: string[]): string | undefined {
  const first = getSource(pkg, sourceIds[0] ?? '')
  return first?.sectionId
}

export function getVerification(
  pkg: DemoDataPackage,
  findingId: string,
): VerificationRecord | undefined {
  return pkg.verifications.find((item) => item.findingId === findingId)
}

export function findingIdsWithVerifications(pkg: DemoDataPackage): string[] {
  return [...new Set(pkg.verifications.map((item) => item.findingId))]
}

export function getImpactAssessment(
  pkg: DemoDataPackage,
  findingId: string,
): ImpactAssessment | undefined {
  return pkg.impactAssessments.find((item) => item.findingId === findingId)
}

export function getCounterfactual(
  pkg: DemoDataPackage,
  findingId: string,
): CounterfactualRecord | undefined {
  const impact = getImpactAssessment(pkg, findingId)
  if (impact?.counterfactualTestId) {
    const byId = pkg.counterfactualTests.find((item) => item.id === impact.counterfactualTestId)
    if (byId) return byId
  }
  return pkg.counterfactualTests.find((item) => item.findingId === findingId)
}

export interface TrustProfile {
  verdicts: Record<EvidenceVerdict, number>
  statuses: Record<FindingStatus, number>
}

export function emptyTrustProfile(): TrustProfile {
  return {
    verdicts: {
      supported: 0,
      partially_supported: 0,
      refuted: 0,
      unverifiable: 0,
      open_question: 0,
    },
    statuses: {
      verified_high_impact: 0,
      verified_moderate_impact: 0,
      verified_low_impact: 0,
      partially_supported: 0,
      refuted: 0,
      unverifiable: 0,
      open_question: 0,
      severity_downgraded: 0,
    },
  }
}

export function trustProfileCounts(findings: FindingRecord[]): TrustProfile {
  const counts = emptyTrustProfile()
  for (const finding of findings) {
    counts.verdicts[finding.evidenceVerdict] += 1
    counts.statuses[finding.status] += 1
  }
  return counts
}
