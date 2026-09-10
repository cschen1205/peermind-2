export type AskContextScope =
  | 'whole_paper'
  | 'section'
  | 'source'
  | 'paper_graph_node'
  | 'finding'
  | 'verification'
  | 'evidence_ledger'
  | 'impact'
  | 'counterfactual_test'
  | 'synthesis'
  | 'comparison'

export interface AskRequest {
  query: string
  scope: AskContextScope
  contextIds: string[]
}

export interface AskResponse {
  answer: string
  sourceIds: string[]
  actions?: Array<{
    type: 'open_source' | 'focus_graph' | 'open_finding' | 'open_verification' | 'run_check'
    label: string
    targetId?: string
  }>
  toolTrace?: Array<{
    label: string
    status: 'running' | 'done' | 'failed' | 'skipped'
  }>
}

export interface SuggestedPrompt {
  id: string
  scope: AskContextScope
  contextId?: string
  label: string
  query: string
}

export interface PreparedAskResponse {
  id: string
  match: {
    scope: AskContextScope
    contextId?: string
    promptId?: string
  }
  response: AskResponse
}

export interface AskPeerMindConfig {
  suggestedPrompts: SuggestedPrompt[]
  preparedResponses?: PreparedAskResponse[]
}
