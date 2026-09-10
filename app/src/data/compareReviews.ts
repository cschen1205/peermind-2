import { buildComparisonAgentSummary } from '@/data/comparisonAgentSummary'
import { findingStatusFromVerification } from '@/data/findingStatus'
import type {
  ComparisonInputBundle,
  ComparisonItemKind,
  ComparisonResult,
  ComparisonTheme,
  HumanReviewInput,
} from '@/types/comparison'
import type { DemoDataPackage } from '@/types/demoPackage'
import type { EvidenceVerdict, FindingImpact, FindingRecord, FindingStatus } from '@/types/finding'

export interface ExtractedReviewFinding {
  id: string
  reviewId: string
  reviewerLabel: string
  title: string
  text: string
  kind: ComparisonItemKind
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'are', 'was', 'were', 'have',
  'has', 'had', 'not', 'but', 'its', 'into', 'than', 'then', 'them', 'they', 'their',
  'there', 'these', 'those', 'which', 'while', 'where', 'when', 'what', 'would',
  'could', 'should', 'about', 'after', 'also', 'only', 'more', 'most', 'such',
  'does', 'did', 'done', 'over', 'under', 'between', 'because', 'through', 'using',
  'used', 'use', 'each', 'both', 'some', 'any', 'all', 'can', 'may', 'might',
  'will', 'been', 'being', 'other', 'into', 'our', 'out', 'how', 'why', 'who',
  'paper', 'method', 'model', 'models', 'results', 'result', 'authors', 'author',
  'reviewer', 'review', 'section', 'figure', 'table', 'appendix', 'claim',
])

function normalize(text: string) {
  return text
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[α𝛼]/g, ' alpha ')
    .replace(/[ρ𝜌]/g, ' rho ')
    .replace(/[λ𝜆]/g, ' lambda ')
    .replace(/cos\s*[²2]?\s*alpha/gi, ' cosine alpha ')
    .replace(/(\d),(\d)/g, '$1$2')
    .replace(/[#*_`>]+/g, ' ')
    .replace(/[-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stem(token: string) {
  const trimmed = token.replace(/^\+/, '')
  if (trimmed.length > 5 && trimmed.endsWith('ies')) return `${trimmed.slice(0, -3)}y`
  if (trimmed.length > 4 && /(?<!s)s$/.test(trimmed) && !trimmed.endsWith('ss')) {
    return trimmed.slice(0, -1)
  }
  return trimmed
}

function tokenize(text: string): string[] {
  return normalize(text)
    .toLowerCase()
    .split(/[^\p{L}\p{N}.]+/u)
    .map((token) => stem(token.replace(/^\.+|\.+$/g, '')))
    .filter((token) => token.length >= 3 || /\d/.test(token))
    .filter((token) => !STOPWORDS.has(token))
}

function bigrams(tokens: string[]) {
  const pairs: string[] = []
  for (let i = 0; i < tokens.length - 1; i += 1) {
    pairs.push(`${tokens[i]} ${tokens[i + 1]}`)
  }
  return pairs
}

function numberTokens(text: string) {
  return [...normalize(text).matchAll(/\d+(?:\.\d+)?/g)].map((match) => match[0])
}

function cosine(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0
  const left = new Set(a)
  const right = new Set(b)
  let overlap = 0
  for (const token of left) {
    if (right.has(token)) overlap += 1
  }
  if (overlap === 0) return 0
  return overlap / Math.sqrt(left.size * right.size)
}

function documentFrequency(docs: string[][]) {
  const df = new Map<string, number>()
  for (const tokens of docs) {
    for (const token of new Set(tokens)) {
      df.set(token, (df.get(token) ?? 0) + 1)
    }
  }
  return df
}

function scoreTexts(left: string, right: string) {
  const leftTokens = tokenize(left)
  const rightTokens = tokenize(right)
  const leftNumbers = new Set(numberTokens(left))
  const rightNumbers = new Set(numberTokens(right))
  let numberBonus = 0
  for (const value of leftNumbers) {
    if (value.length >= 2 && rightNumbers.has(value)) numberBonus += 0.12
  }
  return (
    cosine(leftTokens, rightTokens) +
    1.35 * cosine(bigrams(leftTokens), bigrams(rightTokens)) +
    numberBonus
  )
}

const TOPIC_MARKERS = [
  'imagenet',
  'qwen',
  'gsm',
  'gsm8k',
  'clip',
  'convnext',
  'language',
  'audio',
  'lora',
  'shrinkage',
  'ensembling',
]

function topicMarkers(text: string) {
  const tokens = new Set(tokenize(text))
  return new Set(TOPIC_MARKERS.filter((marker) => tokens.has(marker)))
}

function disjointTopics(left: string, right: string) {
  const a = topicMarkers(left)
  const b = topicMarkers(right)
  if (a.size === 0 || b.size === 0) return false
  for (const marker of a) {
    if (b.has(marker)) return false
  }
  return true
}

function titleSupport(document: string, title: string) {
  const doc = new Set(tokenize(document))
  const terms = tokenize(title).filter((token) => token.length >= 5)
  if (terms.length === 0) return 0
  let hits = 0
  for (const term of terms) {
    if (doc.has(term)) hits += 1
  }
  return hits / terms.length
}

const GENERIC_CLAIM_TOKENS = new Set([
  'energy', 'pretrained', 'pretrain', 'weight', 'update', 'direction',
  'spectral', 'component', 'evidence', 'manuscript', 'quantity', 'signal',
  'definition', 'normalized', 'method', 'checkpoint', 'performance',
  'accuracy', 'reported', 'improvement', 'robustness', 'generalization',
  'describing', 'identify', 'establishe', 'overstate', 'chosen', 'necessary',
  'disclosed', 'report', 'count', 'below', 'partly', 'arise', 'toward',
  'forcing', 'property', 'mathematical', 'useful', 'current', 'false',
  'rather', 'itself', 'experiment', 'statement', 'supported', 'clearly',
  'stated', 'alternative', 'choose', 'reference', 'baseline', 'coefficient',
  'reweighting', 'separation', 'exclusion', 'vector',
])

const SHORT_TECH_TOKENS = new Set(['svd', 'cka', 'ood', 'gsm', 'lora'])

function findingKeywords(finding: FindingRecord, df: Map<string, number>, n: number) {
  return [...new Set(tokenize(peerMindDocument(finding)))]
    .filter(
      (token) =>
        token.length >= 6 || /\d/.test(token) || SHORT_TECH_TOKENS.has(token),
    )
    .filter((token) => !GENERIC_CLAIM_TOKENS.has(token))
    .filter((token) => (df.get(token) ?? 0) <= 3)
    .map((token) => ({
      token,
      weight: Math.log((n + 1) / ((df.get(token) ?? 0) + 0.5)),
    }))
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 8)
    .map((item) => item.token)
}

function distinctiveNumbers(text: string) {
  return numberTokens(text).filter((value) => value.length >= 3 || value.includes('.'))
}

function sameClaim(
  finding: FindingRecord,
  item: ExtractedReviewFinding,
  keywords: string[],
  df: Map<string, number>,
) {
  const document = peerMindDocument(finding)
  const titleTokens = new Set(tokenize(item.title))
  const bodyTokens = new Set(tokenize(item.text))
  const titleHits = keywords.filter((token) => titleTokens.has(token))
  const bodyHits = keywords.filter((token) => bodyTokens.has(token))
  const reviewNumbers = new Set(distinctiveNumbers(item.text))
  const numberHits = distinctiveNumbers(document).filter((value) => reviewNumbers.has(value)).length
  const uniqueTitleHits = titleHits.filter((token) => (df.get(token) ?? 0) <= 1)
  const distinctHits = new Set([...titleHits, ...bodyHits])
  return (
    numberHits >= 1 ||
    distinctHits.size >= 2 ||
    uniqueTitleHits.length >= 1
  )
}

function buildFindingScorer(findings: FindingRecord[]) {
  const docs = findings.map(peerMindDocument)
  const df = documentFrequency(docs.map(tokenize))
  const n = Math.max(findings.length, 1)
  const keywords = new Map(
    findings.map((finding) => [finding.id, findingKeywords(finding, df, n)]),
  )

  return (finding: FindingRecord, item: ExtractedReviewFinding) => {
    const document = peerMindDocument(finding)
    const itemText = `${item.title}\n${item.text}`
    const penalty = disjointTopics(document, itemText) ? 0.35 : 0
    const score =
      scoreTexts(document, item.text) +
      0.9 * scoreTexts(document, item.title) +
      0.4 * titleSupport(document, item.title) -
      penalty
    return {
      score,
      sameClaim: sameClaim(finding, item, keywords.get(finding.id) ?? [], df),
    }
  }
}

const MATCH_THRESHOLD = 0.32
const STRONG_MATCH = 0.7
const MIN_MARGIN = 0.05

function acceptFindingMatch(
  best: { score: number; sameClaim: boolean },
  secondScore: number,
) {
  if (!best.sameClaim || best.score < MATCH_THRESHOLD) return false
  if (best.score < STRONG_MATCH && best.score - secondScore < MIN_MARGIN) return false
  return true
}

function firstSentence(text: string) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const match = cleaned.match(/^(.{12,140}?[.!?])(?:\s|$)/)
  return match?.[1] ?? cleaned.slice(0, 120)
}

function excerptOf(text: string, limit = 420) {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (compact.length <= limit) return compact
  return `${compact.slice(0, limit).trim()}…`
}

function pushFinding(
  findings: ExtractedReviewFinding[],
  review: HumanReviewInput,
  title: string,
  body: string,
  kind: ComparisonItemKind,
) {
  const text = `${title}\n\n${body}`.replace(/\s+\n/g, '\n').trim()
  const minTitle = kind === 'question' ? 16 : 24
  if (text.length < 40 || title.trim().length < minTitle || isJunkFinding(title, body)) return
  findings.push({
    id: `${review.id}-P${String(findings.filter((item) => item.reviewId === review.id).length + 1).padStart(2, '0')}`,
    reviewId: review.id,
    reviewerLabel: review.label,
    title: title.replace(/\s+/g, ' ').trim() || firstSentence(body),
    text,
    kind,
  })
}

function sectionBody(text: string, heading: RegExp) {
  const match = heading.exec(text)
  if (!match || match.index === undefined) return undefined
  const start = match.index + match[0].length
  const rest = text.slice(start)
  const next = rest.search(
    /\n(?:#{1,3}\s+)?(?:Strengths|Weaknesses|Main weaknesses|Questions|Additional questions|Minor comments|Overall assessment|Suggested ICLR|Soundness\s*:|Presentation\s*:|Contribution\s*:|Rating\s*:|Confidence\s*:|Summary|Official Comment|Add:|Flag For Ethics|Code Of Conduct)\b/i,
  )
  return (next >= 0 ? rest.slice(0, next) : rest).trim()
}

function extractNumberedItems(block: string) {
  const items: { title: string; body: string }[] = []
  const pattern = /(?:^|\n)\s*(\d+)\.\s+([^\n]+)\n?([\s\S]*?)(?=(?:\n\s*\d+\.\s+)|\s*$)/g
  for (const match of block.matchAll(pattern)) {
    items.push({ title: match[2].trim(), body: match[3].trim() })
  }
  return items
}

function isJunkFinding(title: string, body: string) {
  const combined = `${title}\n${body}`
  if (/flag for ethics|no ethics review needed|code of conduct/i.test(combined) && combined.length < 220) {
    return true
  }
  if (/^the reviewer notes the following/i.test(title)) return true
  if (/^(soundness|presentation|contribution|rating|confidence)\b/i.test(title)) return true
  return false
}

function chunksFromBlock(block: string) {
  const blank = block
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length >= 40)
  const question = block
    .split(/(?<=\?)\s+(?=[A-Z“"])/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length >= 40)
  if (question.length > blank.length) return question
  if (blank.length >= 2) return blank
  return block
    .split(/(?<=\.)\s*\n(?=[A-Z“"])/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length >= 40)
}

function extractTitledParagraphs(block: string) {
  const items: { title: string; body: string }[] = []
  for (const chunk of chunksFromBlock(block)) {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean)
    if (lines.length >= 2 && lines[0].length <= 140 && !lines[0].includes('. ')) {
      items.push({ title: lines[0], body: lines.slice(1).join(' ') })
    } else {
      items.push({ title: firstSentence(chunk), body: chunk })
    }
  }
  return items
}

function addBlockItems(
  findings: ExtractedReviewFinding[],
  review: HumanReviewInput,
  block: string,
  kind: ComparisonItemKind,
) {
  if (!block.trim()) return
  const numbered = extractNumberedItems(block)
  const items = numbered.length > 0 ? numbered : extractTitledParagraphs(block)
  for (const item of items) pushFinding(findings, review, item.title, item.body, kind)
}

function extractFromReview(review: HumanReviewInput): ExtractedReviewFinding[] {
  const findings: ExtractedReviewFinding[] = []
  const text = review.reviewText

  const weaknessBlock =
    sectionBody(text, /(?:^|\n)(?:#{1,3}\s+)?(?:Main weaknesses|Weaknesses)\b[^\n]*/i) ?? ''
  const questionBlock =
    sectionBody(
      text,
      /(?:^|\n)(?:#{1,3}\s+)?(?:Questions|Additional questions(?:\s*\/\s*requested experiments)?)\b[^\n]*/i,
    ) ?? ''

  addBlockItems(findings, review, weaknessBlock, 'weakness')
  addBlockItems(findings, review, questionBlock, 'question')

  if (findings.length > 0) return findings

  const paragraphs = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length >= 180)
    .slice(0, 16)
  for (const paragraph of paragraphs) {
    pushFinding(findings, review, firstSentence(paragraph), paragraph, 'weakness')
  }
  if (findings.length === 0 && text.trim()) {
    pushFinding(findings, review, review.label, text, 'weakness')
  }
  return findings
}

function collectedReviews(inputs: ComparisonInputBundle): HumanReviewInput[] {
  return [
    ...inputs.humanReviews,
    inputs.metaReview,
    inputs.authorRebuttal,
    inputs.baselineReview,
  ].filter((review): review is HumanReviewInput => Boolean(review?.reviewText.trim()))
}

function peerMindDocument(finding: FindingRecord) {
  return [finding.critique, finding.contract.verificationQuestion].join('\n')
}

function findingLabel(finding: FindingRecord) {
  return finding.critique
}

function relationFor(peerMind?: FindingRecord, reviewHits = 0): ComparisonTheme['relation'] {
  if (peerMind && reviewHits > 0) {
    return peerMind.status === 'refuted' ? 'disagreement' : 'shared'
  }
  if (peerMind) return 'peermind_only'
  return 'human_only'
}

function itemDocument(item: ExtractedReviewFinding) {
  return `${item.title}\n${item.text}`
}

const PEERMIND_CLAIM_FAMILIES: { findingId: string; patterns: RegExp[] }[] = [
  {
    findingId: 'F01',
    patterns: [
      /limited novelty/i,
      /spectral adapter/i,
      /svd-based (merging|editing|spectral)/i,
      /task singular vector/i,
    ],
  },
  {
    findingId: 'F02',
    patterns: [
      /heuristic.{0,40}(mixing|coefficient|weighting|rule)/i,
      /(mixing|weighting) rule.{0,40}heuristic/i,
      /without theoretical grounding/i,
      /boundary condition/i,
      /described as .principled/i,
      /interpretability of coefficients/i,
    ],
  },
  {
    findingId: 'F03',
    patterns: [
      /no non-transformer/i,
      /contains no convnext/i,
      /no convnext/i,
      /transformer-only/i,
      /categorical gap/i,
    ],
  },
  {
    findingId: 'F05',
    patterns: [
      /computational cost of svd/i,
      /wall-clock/i,
      /peak[- ]memory/i,
      /several-billion/i,
      /larger lms/i,
      /2–7b|2-7b|7b\+|70b/i,
    ],
  },
  {
    findingId: 'F06',
    patterns: [/2,?409/, /2,?415/],
  },
  {
    findingId: 'F07',
    patterns: [
      /modest gains/i,
      /lack of variability/i,
      /standard deviations/i,
      /gains over lines/i,
      /four selected clip/i,
      /70-model statistics/i,
      /aggregate .{0,40}70/i,
      /statistically (significant|meaningful|reliab)/i,
    ],
  },
  {
    findingId: 'F08',
    patterns: [
      /does not appear to measure alignment/i,
      /alignment coefficient/i,
      /called cosine alignment/i,
      /residual[- ]energy/i,
      /state. and a .dif/i,
      /what two objects are geometrically/i,
    ],
  },
  {
    findingId: 'F09',
    patterns: [/not as independent or complementary/i, /two complementary signals/i],
  },
  {
    findingId: 'F10',
    patterns: [
      /sum to one/i,
      /shrinkage baseline/i,
      /lambda.?high.{0,20}lambda.?low/i,
      /coefficients to (sum|vary independently)/i,
      /\\lambda_\{\\mathrm\{high\}\}\+\\lambda/i,
    ],
  },
  {
    findingId: 'F11',
    patterns: [
      /connection between the multi-model/i,
      /section 3 is framed/i,
      /does not actually reproduce this mechanism/i,
    ],
  },
  {
    findingId: 'F12',
    patterns: [/\+9\.2/, /9\.2 points/],
  },
]

const STRICT_CLAIM_FAMILIES = new Set(['F06', 'F11'])

function familyMatch(findingId: string, item: ExtractedReviewFinding) {
  const document = itemDocument(item)
  return (
    PEERMIND_CLAIM_FAMILIES.find((family) => family.findingId === findingId)?.patterns.some(
      (pattern) => pattern.test(document),
    ) ?? false
  )
}

interface ReviewerClusterSpec {
  id: string
  label: string
  patterns: RegExp[]
  verdict: EvidenceVerdict
  impact: Pick<FindingImpact, 'scopeRelevance' | 'necessity'>
  sourceIds: string[]
  explanation: string
}

const REVIEWER_ONLY_CLUSTERS: ReviewerClusterSpec[] = [
  {
    id: 'semantic-energy',
    label:
      'Causal or semantic readings of high- and low-energy directions (knowledge, pretrained information, OOD vulnerability) are stronger than the CKA and accuracy evidence supports.',
    patterns: [
      /semantic interpretations of high/i,
      /high-energy directions →/i,
      /task-specific knowledge/i,
    ],
    verdict: 'supported',
    impact: { scopeRelevance: 'high', necessity: 'moderate' },
    sourceIds: ['MS1-S12', 'MS1-S23'],
    explanation:
      'Appendix CKA cases are consistent with representation drift, but they do not establish that high-energy directions are task knowledge or that low-energy directions are pretrained information. Same evidence-verdict and impact rules as locked findings.',
  },
  {
    id: 'soup-name',
    label:
      'Calling the method a soup overstates a single-checkpoint spectral reweighting as ensembling; spectral anisotropic rescaling is the more accurate description.',
    patterns: [
      /overrstatement of .soup/i,
      /describing it as a .soup/i,
      /anisotropic re-?scaling/i,
      /true model ensembling/i,
      /true weight-space average/i,
    ],
    verdict: 'supported',
    impact: { scopeRelevance: 'low', necessity: 'low' },
    sourceIds: ['MS1-S03', 'MS1-S08'],
    explanation:
      'MonoSoup edits one update; it does not average multiple checkpoints. The naming mismatch is true but does not change the algorithm, so severity is downgraded.',
  },
  {
    id: 'stronger-ood',
    label:
      'The vision evaluation is limited to natural ImageNet shifts; stronger distributional or adversarial robustness benchmarks are not reported.',
    patterns: [/adversarial robustness/i, /stronger distributional/i],
    verdict: 'open_question',
    impact: { scopeRelevance: 'moderate', necessity: 'low' },
    sourceIds: ['MS1-S13'],
    explanation:
      'This is a request for additional protocols, not a contradiction in the reported ImageNet-shift numbers. Marked as an open question under the same status model.',
  },
  {
    id: 'single-ckpt-motivation',
    label:
      'The claim that practical storage of only one fine-tuned checkpoint necessitates MonoSoup is unconvincing; an alternative motivation would be stronger.',
    patterns: [
      /storing only a/i,
      /single best-performing checkpoint necessitates/i,
      /alternative motivation for monosoup/i,
    ],
    verdict: 'partially_supported',
    impact: { scopeRelevance: 'moderate', necessity: 'moderate' },
    sourceIds: ['MS1-S01', 'MS1-S03'],
    explanation:
      'Avoiding a multi-checkpoint soup is a real cost argument, but “therefore only one checkpoint is stored and MonoSoup is necessary” is not established. Partially supported.',
  },
  {
    id: 'figure-3b',
    label:
      'Figure 3b undercuts the claim that truncating low-energy components harms both ID and OOD, because moderate truncation can improve OOD.',
    patterns: [/undermined by its own data/i, /moderate truncation/i],
    verdict: 'supported',
    impact: { scopeRelevance: 'high', necessity: 'high' },
    sourceIds: ['MS1-S09'],
    explanation:
      'The manuscript uses truncation harm to motivate reweighting, while the plotted moderate-rank OOD curve can rise. The tension is supported on the supplied figure.',
  },
  {
    id: 'imagenet-only-generality',
    label:
      'The low-energy-robustness motivation is taken from large-scale ImageNet fine-tuning and is shown not to hold on the small-scale 20-task benchmark, so generality is limited.',
    patterns: [/generality appears limited/i, /20-task/i, /small-scale 20/i],
    verdict: 'supported',
    impact: { scopeRelevance: 'high', necessity: 'high' },
    sourceIds: ['MS1-S09', 'MS1-S18'],
    explanation:
      'The paper itself contrasts ImageNet truncation with the 20-task setting. That domain dependence is supported and material to the generality claim.',
  },
  {
    id: 'alignment-vs-mtl',
    label:
      'The claim that high same-task alignment helps merging sits in tension with multi-task work that prefers orthogonality, and it is unclear whether the principle is same-task only.',
    patterns: [
      /high task vector alignment is beneficial/i,
      /high alignment is beneficial/i,
      /multi-task learning/i,
    ],
    verdict: 'open_question',
    impact: { scopeRelevance: 'moderate', necessity: 'low' },
    sourceIds: ['MS1-S05', 'MS1-S07'],
    explanation:
      'Section 3 reports an empirical same-task merging correlation. Reconciliation with multi-task orthogonality is not answered in the manuscript, so the status is an open question.',
  },
  {
    id: 'plug-and-play-r',
    label:
      'The plug-and-play claim needs qualification because performance depends on choosing R, and the paper does not explain why a stable mid-range R transfers across architectures and datasets.',
    patterns: [
      /plug-and-play/i,
      /architecture- and dataset-dependence of/i,
      /choosing \(?r\)? well/i,
    ],
    verdict: 'supported',
    impact: { scopeRelevance: 'moderate', necessity: 'moderate' },
    sourceIds: ['MS1-S12', 'MS1-S17', 'MS1-S18'],
    explanation:
      'R is presented as the only hyperparameter and as potentially architecture-dependent, which undercuts an unqualified plug-and-play claim. Verified at moderate impact.',
  },
  {
    id: 'architecture-coverage',
    label:
      'Most reported results use Transformer backbones, so transfer of R and the mixing rule to broader non-Transformer families remains thinly supported.',
    patterns: [/limited architecture diversity/i, /non-transformer models/i, /convnext, resnet/i],
    verdict: 'partially_supported',
    impact: { scopeRelevance: 'moderate', necessity: 'low' },
    sourceIds: ['MS1-S18', 'MS1-S24', 'MS1-S25'],
    explanation:
      'The revised snapshot includes ConvNeXt, so categorical absence is false, but coverage is still narrow. Same verdict pattern as other architecture-coverage checks: partially supported.',
  },
  {
    id: 'mx-identifiers',
    label:
      'The M-x checkpoint identifiers (M-14, M-31, and similar) are not defined clearly enough to tell whether they are specific fine-tuning configurations.',
    patterns: [/models labeled m-x/i, /m-14/i, /fine-tuning configurations/i],
    verdict: 'open_question',
    impact: { scopeRelevance: 'low', necessity: 'low' },
    sourceIds: ['MS1-S13', 'MS1-S14'],
    explanation:
      'Table captions use M-x labels without a reproduced key in the extracted sources. Treated as an open clarification question, not a refuted numerical claim.',
  },
]

function reviewerClusterFor(item: ExtractedReviewFinding) {
  const document = itemDocument(item)
  return REVIEWER_ONLY_CLUSTERS.find((cluster) =>
    cluster.patterns.some((pattern) => pattern.test(document)),
  )
}

function clusterUnusedFindings(items: ExtractedReviewFinding[]) {
  const groups = new Map<string, ExtractedReviewFinding[]>()
  const leftovers: ExtractedReviewFinding[] = []
  for (const item of items) {
    const cluster = reviewerClusterFor(item)
    if (!cluster) {
      leftovers.push(item)
      continue
    }
    const hits = groups.get(cluster.id) ?? []
    hits.push(item)
    groups.set(cluster.id, hits)
  }

  const clustered = [...groups.entries()].map(([id, members]) => ({
    spec: REVIEWER_ONLY_CLUSTERS.find((cluster) => cluster.id === id)!,
    members,
  }))

  leftovers.forEach((item, index) => {
    let partner = -1
    let best = 0
    clustered.forEach((group, groupIndex) => {
      const score = Math.max(
        ...group.members.map((member) => scoreTexts(itemDocument(member), itemDocument(item))),
      )
      if (score > best) {
        best = score
        partner = groupIndex
      }
    })
    if (partner >= 0 && best >= 0.55) {
      clustered[partner].members.push(item)
      return
    }
    const question = /\?\s*$/.test(item.title.trim()) || /\?\s*$/.test(item.text.trim())
    clustered.push({
      spec: {
        id: `other-${index}`,
        label: item.title,
        patterns: [],
        verdict: question ? 'open_question' : 'unverifiable',
        impact: { scopeRelevance: 'moderate', necessity: 'low' },
        sourceIds: [],
        explanation: question
          ? 'This reviewer question is not resolved by a locked PeerMind finding. Status follows the same open-question rule.'
          : 'This reviewer comment was not matched to a locked finding and could not be closed from the supplied sources.',
      },
      members: [item],
    })
  })

  return clustered
}

function reviewerOnlyStatus(spec: ReviewerClusterSpec): FindingStatus {
  return findingStatusFromVerification(spec.verdict, spec.impact)
}

export function extractIndependentFindings(inputs: ComparisonInputBundle): ExtractedReviewFinding[] {
  return collectedReviews(inputs).flatMap(extractFromReview)
}

function uniqueHits(hits: ExtractedReviewFinding[]) {
  const seen = new Set<string>()
  return hits.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function assignItems(
  items: ExtractedReviewFinding[],
  findings: FindingRecord[],
  scoreFinding: ReturnType<typeof buildFindingScorer>,
) {
  const used = new Set<string>()
  const assigned = new Map<string, ExtractedReviewFinding[]>()

  for (const item of items) {
    const candidates: { id: string; score: number; family: boolean; sameClaim: boolean }[] = []
    for (const finding of findings) {
      const scored = scoreFinding(finding, item)
      const family = familyMatch(finding.id, item)
      if (STRICT_CLAIM_FAMILIES.has(finding.id) && !family) continue
      if (!scored.sameClaim && !family) continue
      candidates.push({ id: finding.id, ...scored, family })
    }
    candidates.sort((left, right) => right.score - left.score)
    const accepted = candidates.filter((candidate, index) => {
      if (candidate.family) return true
      if (index === 0) return acceptFindingMatch(candidate, candidates[1]?.score ?? 0)
      return candidate.sameClaim && candidate.score >= STRONG_MATCH
    })
    for (const match of accepted) {
      const hits = assigned.get(match.id) ?? []
      hits.push(item)
      assigned.set(match.id, hits)
      used.add(item.id)
    }
  }

  return { assigned, used }
}

function leftoverThemes(
  items: ExtractedReviewFinding[],
  prefix: string,
  kind: ComparisonItemKind,
): ComparisonTheme[] {
  return clusterUnusedFindings(items).map((group, index) => {
    const reviewers = [...new Set(group.members.map((item) => item.reviewerLabel))]
    return {
      id: `${prefix}${String(index + 1).padStart(2, '0')}`,
      label: group.spec.label,
      kind,
      peerMindFindingIds: [],
      humanFindingIds: group.members.map((item) => item.id),
      relation: 'human_only' as const,
      sourceIds: group.spec.sourceIds,
      verificationStatus: reviewerOnlyStatus(group.spec),
      excerpts: group.members.slice(0, 8).map((item) => ({
        reviewId: item.reviewId,
        reviewerLabel: item.reviewerLabel,
        text: excerptOf(item.text),
      })),
      explanation: `Raised by ${reviewers.join(', ')}. ${group.spec.explanation}`,
    }
  })
}

export function compareIndependentReviews(
  pkg: DemoDataPackage,
  inputs: ComparisonInputBundle,
): ComparisonResult {
  const extracted = extractIndependentFindings(inputs)
  const weaknesses = extracted.filter((item) => item.kind === 'weakness')
  const questionItems = extracted.filter((item) => item.kind === 'question')
  const scoreFinding = buildFindingScorer(pkg.findings)
  const weaknessMatch = assignItems(weaknesses, pkg.findings, scoreFinding)
  const questionMatch = assignItems(questionItems, pkg.findings, scoreFinding)

  const themes: ComparisonTheme[] = []

  pkg.findings.forEach((finding, index) => {
    const hits = uniqueHits(weaknessMatch.assigned.get(finding.id) ?? [])
    const excerpts = hits.slice(0, 8).map((item) => ({
      reviewId: item.reviewId,
      reviewerLabel: item.reviewerLabel,
      text: excerptOf(item.text),
    }))
    const reviewers = [...new Set(excerpts.map((item) => item.reviewerLabel))]
    const relation = relationFor(finding, hits.length)

    themes.push({
      id: `LT${String(index + 1).padStart(2, '0')}`,
      label: findingLabel(finding),
      kind: 'weakness',
      peerMindFindingIds: [finding.id],
      humanFindingIds: hits.map((item) => item.id),
      relation,
      sourceIds: finding.sourceIds,
      verificationStatus: finding.status,
      excerpts,
      explanation:
        relation === 'peermind_only'
          ? `PeerMind raised this finding; it was not raised as a weakness in the uploaded reviews.`
          : relation === 'disagreement'
            ? `Raised as a weakness by ${reviewers.join(', ')}. PeerMind verified the current manuscript against this finding.`
            : `Raised as a weakness by ${reviewers.join(', ')}. PeerMind verified this shared finding against the manuscript.`,
    })
  })

  themes.push(
    ...leftoverThemes(
      weaknesses.filter((item) => !weaknessMatch.used.has(item.id)),
      'LR',
      'weakness',
    ),
  )

  const questions: ComparisonTheme[] = []

  pkg.findings.forEach((finding) => {
    const hits = uniqueHits(questionMatch.assigned.get(finding.id) ?? [])
    if (hits.length === 0) return
    const excerpts = hits.slice(0, 8).map((item) => ({
      reviewId: item.reviewId,
      reviewerLabel: item.reviewerLabel,
      text: excerptOf(item.text),
    }))
    const reviewers = [...new Set(excerpts.map((item) => item.reviewerLabel))]
    questions.push({
      id: `LQ-${finding.id}`,
      label: findingLabel(finding),
      kind: 'question',
      peerMindFindingIds: [finding.id],
      humanFindingIds: hits.map((item) => item.id),
      relation: finding.status === 'refuted' ? 'disagreement' : 'shared',
      sourceIds: finding.sourceIds,
      verificationStatus: finding.status,
      excerpts,
      explanation: `This question restates PeerMind finding ${finding.id}. Raised by ${reviewers.join(', ')}.`,
    })
  })

  questions.push(
    ...leftoverThemes(
      questionItems.filter((item) => !questionMatch.used.has(item.id)),
      'LQ',
      'question',
    ),
  )

  const summary = {
    sharedCount: themes.filter((theme) => theme.relation === 'shared').length,
    humanOnlyCount: themes.filter((theme) => theme.relation === 'human_only').length,
    peerMindOnlyCount: themes.filter((theme) => theme.relation === 'peermind_only').length,
    disagreementCount: themes.filter((theme) => theme.relation === 'disagreement').length,
    refutedCount: themes.filter((theme) => theme.verificationStatus === 'refuted').length,
    questionCount: questions.length,
    questionMappedCount: questions.filter((theme) => theme.relation === 'shared').length,
    questionOpenCount: questions.filter((theme) => theme.relation === 'human_only').length,
  }

  const draft = { themes, questions, summary }
  return { ...draft, agentSummary: buildComparisonAgentSummary(draft) }
}
