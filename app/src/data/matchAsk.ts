import type {
  AskContextScope,
  AskPeerMindConfig,
  AskResponse,
  SuggestedPrompt,
} from '@/types/ask'

export const ASK_FALLBACK =
  'No prepared answer is available for this question in the current demo package.'

const FALLBACK_RESPONSE: AskResponse = {
  answer: ASK_FALLBACK,
  sourceIds: [],
}

export function matchAskResponse(
  config: AskPeerMindConfig | undefined,
  request: {
    query: string
    scope: AskContextScope
    contextIds: string[]
    promptId?: string
  },
): AskResponse {
  const prepared = config?.preparedResponses ?? []
  const prompts = config?.suggestedPrompts ?? []

  if (request.promptId) {
    const byPrompt = prepared.find((item) => item.match.promptId === request.promptId)
    if (byPrompt) return byPrompt.response
  }

  const byScopeAndContext = prepared.find((item) => {
    if (item.match.scope !== request.scope) return false
    if (!item.match.contextId) return false
    return request.contextIds.includes(item.match.contextId)
  })
  if (byScopeAndContext) return byScopeAndContext.response

  const trimmed = request.query.trim()
  if (trimmed) {
    const prompt = prompts.find((item) => item.query === trimmed)
    if (prompt) {
      const byMatchedPrompt = prepared.find((item) => item.match.promptId === prompt.id)
      if (byMatchedPrompt) return byMatchedPrompt.response
    }
  }

  return FALLBACK_RESPONSE
}

export function suggestedPromptsForContext(
  prompts: SuggestedPrompt[],
  scope: AskContextScope,
  contextIds: string[],
): SuggestedPrompt[] {
  const contextual = prompts.filter((prompt) => {
    if (prompt.scope !== scope) return false
    if (!prompt.contextId) return true
    return contextIds.includes(prompt.contextId)
  })

  const seen = new Set(contextual.map((prompt) => prompt.id))
  const extras =
    contextual.length < 2
      ? prompts.filter((prompt) => prompt.scope === 'whole_paper' && !seen.has(prompt.id))
      : []

  return [...contextual, ...extras].slice(0, 4)
}
