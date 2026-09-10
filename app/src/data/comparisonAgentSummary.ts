import type {
  ComparisonAgentSummary,
  ComparisonCallout,
  ComparisonPartyScore,
  ComparisonResult,
  ComparisonTheme,
} from '@/types/comparison'

type PartyId = 'chatgpt' | 'openreview'

function partyFromLabel(label: string): PartyId | undefined {
  if (/chatgpt/i.test(label)) return 'chatgpt'
  if (/openreview/i.test(label)) return 'openreview'
  return undefined
}

function partiesOn(theme: ComparisonTheme): Set<PartyId> {
  const parties = new Set<PartyId>()
  for (const excerpt of theme.excerpts ?? []) {
    const party = partyFromLabel(excerpt.reviewerLabel)
    if (party) parties.add(party)
  }
  return parties
}

function excerptText(theme: ComparisonTheme, party: PartyId) {
  return (
    theme.excerpts?.find((excerpt) => partyFromLabel(excerpt.reviewerLabel) === party)?.text ?? ''
  )
}

function isTooBroadLanguage(theme: ComparisonTheme) {
  if (!theme.peerMindFindingIds.includes('F12')) return false
  const text = excerptText(theme, 'chatgpt')
  return (
    /too strong given the evidence|language-model setting/i.test(text) &&
    /qwen|9\.2|error bars|seeds|generality across language/i.test(text)
  )
}

export function buildComparisonAgentSummary(
  result: Omit<ComparisonResult, 'agentSummary'>,
): ComparisonAgentSummary {
  const locked = result.themes.filter((theme) => theme.peerMindFindingIds.length > 0)
  const reviewerOnly = result.themes.filter((theme) => theme.relation === 'human_only')
  const chatgptOn = locked.filter((theme) => partiesOn(theme).has('chatgpt'))
  const openreviewOn = locked.filter((theme) => partiesOn(theme).has('openreview'))
  const chatgptIncorrect = locked.filter(
    (theme) =>
      partiesOn(theme).has('chatgpt') &&
      (theme.relation === 'disagreement' || theme.verificationStatus === 'refuted'),
  )
  const chatgptTooBroad = locked.filter((theme) => isTooBroadLanguage(theme))
  const chatgptMissed = locked.filter((theme) => !partiesOn(theme).has('chatgpt'))
  const openreviewMissed = locked.filter((theme) => !partiesOn(theme).has('openreview'))
  const openreviewOnly = reviewerOnly.filter((theme) => {
    const parties = partiesOn(theme)
    return parties.has('openreview') && !parties.has('chatgpt')
  })
  const chatgptOnly = reviewerOnly.filter((theme) => {
    const parties = partiesOn(theme)
    return parties.has('chatgpt') && !parties.has('openreview')
  })
  const f03 = locked.find((theme) => theme.peerMindFindingIds.includes('F03'))
  const f04 = locked.find((theme) => theme.peerMindFindingIds.includes('F04'))
  const f06 = locked.find((theme) => theme.peerMindFindingIds.includes('F06'))
  const f12 = locked.find((theme) => theme.peerMindFindingIds.includes('F12'))
  const figure3b = reviewerOnly.find((theme) => /figure 3b/i.test(theme.label))
  const f01 = locked.find((theme) => theme.peerMindFindingIds.includes('F01'))

  const parties: ComparisonPartyScore[] = [
    {
      id: 'chatgpt',
      label: 'ChatGPT',
      raisedCount: chatgptOn.length,
      missedCount: chatgptMissed.length,
      incorrectCount: chatgptIncorrect.length,
      tooBroadCount: chatgptTooBroad.length,
      note:
        chatgptIncorrect.length > 0
          ? 'Generated review. One locked finding is incorrect; one weakness is too broad.'
          : 'Generated review. Unchecked against the manuscript.',
    },
    {
      id: 'openreview',
      label: 'OpenReview humans',
      raisedCount: openreviewOn.length,
      missedCount: openreviewMissed.length,
      incorrectCount: 0,
      tooBroadCount: 0,
      note: `Official reviewers hit ${openreviewOn.length} locked findings as weaknesses and left ${openreviewMissed.length} to PeerMind or ChatGPT.`,
    },
    {
      id: 'peermind',
      label: 'PeerMind',
      raisedCount: locked.length,
      missedCount: openreviewOnly.filter((theme) => theme.verificationStatus === 'verified_high_impact')
        .length,
      incorrectCount: 0,
      tooBroadCount: 0,
      note: `Verified ${result.summary.sharedCount} shared weaknesses, refuted ${result.summary.refutedCount ?? 0}, and added ${result.summary.peerMindOnlyCount} checks the other reviews missed as weaknesses.`,
    },
  ]

  const callouts: ComparisonCallout[] = []

  if (f03 && partiesOn(f03).has('chatgpt') && chatgptIncorrect.includes(f03)) {
    callouts.push({
      id: 'incorrect-chatgpt-architecture',
      tag: 'incorrect',
      reviewerLabel: 'ChatGPT',
      title: 'ChatGPT is incorrect on architecture coverage',
      detail:
        'ChatGPT says the manuscript has no ConvNeXt or other non-Transformer result. PeerMind F03 audits the appendix and refutes that claim. OpenReview humans did not make this false absence claim.',
      themeId: f03.id,
    })
  }

  if (f12 && isTooBroadLanguage(f12)) {
    callouts.push({
      id: 'broad-chatgpt-language',
      tag: 'too_broad',
      reviewerLabel: 'ChatGPT',
      title: 'ChatGPT’s language weakness is too broad',
      detail:
        'ChatGPT packs scale, modest deltas, missing seeds, and the +9.2 table mismatch into one weakness. PeerMind splits those into F05, F07, and F12. OpenReview humans raised the modest-gain / variability part (F07) without the table-arithmetic error.',
      themeId: f12.id,
    })
  }

  if (f01 && partiesOn(f01).has('openreview') && !partiesOn(f01).has('chatgpt')) {
    callouts.push({
      id: 'shared-openreview-novelty',
      tag: 'shared',
      reviewerLabel: 'OpenReview humans',
      title: 'OpenReview humans caught the SVD-novelty gap',
      detail:
        'mj9q raised limited novelty vs SVD-based editors. PeerMind keeps that as F01 (partially supported). ChatGPT did not raise it as a weakness.',
      themeId: f01.id,
    })
  }

  if (f06 && !partiesOn(f06).has('chatgpt') && !partiesOn(f06).has('openreview')) {
    const askedAsQuestion = result.questions?.some(
      (theme) =>
        theme.peerMindFindingIds.includes('F06') && partiesOn(theme).has('openreview'),
    )
    callouts.push({
      id: 'missed-paircount',
      tag: 'missed',
      reviewerLabel: askedAsQuestion ? 'ChatGPT · OpenReview' : 'ChatGPT',
      title: askedAsQuestion
        ? 'Humans asked the pair-count as a question; ChatGPT missed it'
        : 'Neither ChatGPT nor OpenReview raised the pair count as a weakness',
      detail: askedAsQuestion
        ? 'q1EA asked about 2,409 vs 2,415 in Questions. ChatGPT never raised it. PeerMind F06 verifies the combinatorics and downgrades severity.'
        : 'PeerMind F06 checks 70 choose 2 = 2,415 against the reported 2,409 count.',
      themeId: f06.id,
    })
  }

  if (f04 && !partiesOn(f04).has('chatgpt') && !partiesOn(f04).has('openreview')) {
    callouts.push({
      id: 'missed-ood-protocol',
      tag: 'missed',
      reviewerLabel: 'ChatGPT · OpenReview',
      title: 'Both independent reviews missed the language OOD protocol',
      detail:
        'ChatGPT and OpenReview discuss language results in general. Neither isolates that harder tasks are labeled OOD without a controlled shift. That is PeerMind F04.',
      themeId: f04.id,
    })
  }

  if (figure3b && partiesOn(figure3b).has('openreview')) {
    callouts.push({
      id: 'openreview-figure-3b',
      tag: 'shared',
      reviewerLabel: 'OpenReview humans',
      title: 'OpenReview humans found a Figure 3b tension PeerMind did not lock',
      detail:
        'q1EA argues Figure 3b undercuts the truncation-harm motivation. PeerMind verified that reviewer-only claim as high impact. This is a human-reviewer contribution, not a ChatGPT find.',
      themeId: figure3b.id,
    })
  }

  callouts.push({
    id: 'peermind-verified-core',
    tag: 'shared',
    reviewerLabel: 'PeerMind',
    title: 'PeerMind verifies the overlapping core instead of counting bullets',
    detail: `Across ChatGPT and OpenReview, ${result.summary.sharedCount} weaknesses match a locked finding and were verified. PeerMind also keeps ${chatgptOnly.length} ChatGPT-only and ${openreviewOnly.length} OpenReview-only leftovers under the same status rules.`,
    themeId: locked.find((theme) => theme.relation === 'shared')?.id,
  })

  return {
    agentId: 'AG-COMPARE',
    agentLabel: 'Comparison agent',
    headline: 'ChatGPT vs OpenReview humans vs PeerMind',
    verdict: `PeerMind is the more reliable of the three because it verifies claims. ChatGPT raised ${chatgptOn.length} locked findings but has ${chatgptIncorrect.length} incorrect and ${chatgptTooBroad.length} too-broad weakness${chatgptTooBroad.length === 1 ? '' : 'es'}. OpenReview humans raised ${openreviewOn.length} locked findings as weaknesses and missed ${openreviewMissed.length}. PeerMind covers all ${locked.length} locked findings and refutes the false ChatGPT absence claim.`,
    parties,
    callouts,
  }
}
