import type { DemoDataPackage } from '@/types/demoPackage'
import type { FindingRecord, FindingValidity } from '@/types/finding'
import type { CounterfactualRecord, InvestigationRecord } from '@/types/investigation'
import type { PaperNode, PaperSection, SourceRecord, SourceType } from '@/types/paper'

export const NODE_TYPE_LABELS: Record<PaperNode['type'], string> = {
  method: 'Method',
  claim: 'Claim',
  evidence: 'Evidence',
  gap: 'Scope / Gap',
  question: 'Question',
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

export function getAgentLabel(pkg: DemoDataPackage, agentId: string): string {
  return pkg.reviewerRun.candidateAgents.find((agent) => agent.id === agentId)?.label ?? agentId
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

export function investigationsByFinding(
  pkg: DemoDataPackage,
  findingId: string,
): InvestigationRecord[] {
  return pkg.investigations.filter((item) => item.findingId === findingId)
}

export function getInvestigation(
  pkg: DemoDataPackage,
  findingId: string,
): InvestigationRecord | undefined {
  return investigationsByFinding(pkg, findingId)[0]
}

export function counterfactualsByFinding(
  pkg: DemoDataPackage,
  findingId: string,
): CounterfactualRecord[] {
  const inv = getInvestigation(pkg, findingId)
  const byId = inv?.counterfactualTestId
    ? pkg.counterfactualTests.filter((item) => item.id === inv.counterfactualTestId)
    : []
  if (byId.length > 0) return byId
  return pkg.counterfactualTests.filter((item) => item.findingId === findingId)
}

export function getCounterfactual(
  pkg: DemoDataPackage,
  findingId: string,
): CounterfactualRecord | undefined {
  return counterfactualsByFinding(pkg, findingId)[0]
}

export function findingIdsWithInvestigations(pkg: DemoDataPackage): string[] {
  return [...new Set(pkg.investigations.map((item) => item.findingId))]
}

export function findingIdsWithTests(pkg: DemoDataPackage): string[] {
  return [...new Set(pkg.counterfactualTests.map((item) => item.findingId))]
}

export function trustProfileCounts(
  findings: FindingRecord[],
): Record<FindingValidity, number> {
  const counts: Record<FindingValidity, number> = {
    verified: 0,
    supported: 0,
    refuted: 0,
    unverified: 0,
    disputed: 0,
    human_required: 0,
    not_checked: 0,
  }
  for (const finding of findings) {
    counts[finding.validity] += 1
  }
  return counts
}
