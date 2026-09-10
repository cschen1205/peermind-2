export interface DemoMetadata {
  id: string
  title: string
  description?: string
}

export interface PaperMetadata {
  id: string
  title: string
  authors?: string[]
  venue?: string
  year?: number
  abstract?: string
  pdfAsset?: string
  previewMode?: 'pdf' | 'page_images' | 'excerpt_only'
  conferenceStyle?: ConferenceStyle
}

export type ConferenceStyle =
  | 'iclr'
  | 'icml'
  | 'neurips'
  | 'acl'
  | 'aaai'
  | 'generic'

export interface PaperSection {
  id: string
  title: string
  level: number
  startPage?: number
  endPage?: number
  sourceIds: string[]
}

export type SourceType =
  | 'paragraph'
  | 'claim'
  | 'equation'
  | 'table'
  | 'figure'
  | 'appendix'
  | 'code'
  | 'external'
  | 'reference'

export type HighlightRole =
  | 'claim'
  | 'evidence_for'
  | 'counter_evidence'
  | 'context'
  | 'selected'

export interface HighlightRegion {
  id: string
  page: number
  x: number
  y: number
  width: number
  height: number
  role: HighlightRole
  label?: string
}

export interface SourceRecord {
  id: string
  type: SourceType
  label: string
  sectionId?: string
  page?: number
  excerpt?: string
  highlightRegions?: HighlightRegion[]
  externalUrl?: string
}

export type PaperNodeType =
  | 'contribution'
  | 'claim'
  | 'method'
  | 'assumption'
  | 'equation'
  | 'experiment'
  | 'dataset'
  | 'baseline'
  | 'metric'
  | 'result'
  | 'table'
  | 'figure'
  | 'limitation'
  | 'appendix'
  | 'reference'
  | 'scope'
  | 'gap'
  | 'question'
  | 'evidence'

export interface PaperNode {
  id: string
  type: PaperNodeType
  label: string
  sourceIds: string[]
  summary?: string
}

export interface PaperEdge {
  id: string
  source: string
  target: string
  relation: string
  sourceIds: string[]
}

export interface GraphLayoutHint {
  nodeId: string
  x?: number
  y?: number
  group?: string
  rank?: number
}

export interface PaperKeyPoint {
  id: string
  title: string
  summary: string
  sourceIds: string[]
  nodeIds?: string[]
}

export interface PaperSummary {
  overview: string
  keyPoints: PaperKeyPoint[]
}

export interface PaperGraph {
  nodes: PaperNode[]
  edges: PaperEdge[]
  layoutHints?: GraphLayoutHint[]
}
