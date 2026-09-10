import type { ConferenceStyle } from '@/types/paper'

export type ReviewStyleKind = 'conference' | 'journal'

export interface ReviewStyle {
  id: string
  label: string
  fullName: string
  kind: ReviewStyleKind
  conferenceStyle: ConferenceStyle
  summary: string
  looksFor: string[]
  formSections: string[]
  scores: string[]
}

export const CONFERENCE_STYLE_LABELS: Record<ConferenceStyle, string> = {
  iclr: 'ICLR',
  icml: 'ICML',
  neurips: 'NeurIPS',
  acl: 'ACL',
  aaai: 'AAAI',
  generic: 'Generic',
}

export const REVIEW_STYLES: ReviewStyle[] = [
  {
    id: 'neurips',
    label: 'NeurIPS',
    fullName: 'Conference on Neural Information Processing Systems',
    kind: 'conference',
    conferenceStyle: 'neurips',
    summary:
      'A top-tier ML venue that scores originality, quality, clarity, and significance, and asks reviewers to flag limitations and broader impact.',
    looksFor: [
      'A crisp claim about what is new versus prior work',
      'Experiments that isolate the proposed idea',
      'Honest limitations, negative results, and societal impact notes',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Questions', 'Limitations', 'Ethics'],
    scores: ['Quality', 'Clarity', 'Significance', 'Originality', 'Rating', 'Confidence'],
  },
  {
    id: 'icml',
    label: 'ICML',
    fullName: 'International Conference on Machine Learning',
    kind: 'conference',
    conferenceStyle: 'icml',
    summary:
      'An empirical and theoretical ML venue that rewards sound methodology, statistical care, and claims that match the evidence.',
    looksFor: [
      'Correctness of the method and the proof or derivation, if any',
      'Multiple seeds, uncertainty, and fair baselines',
      'A contribution that would change how a practitioner or theorist works',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Soundness', 'Questions'],
    scores: ['Overall assessment', 'Reviewer confidence'],
  },
  {
    id: 'iclr',
    label: 'ICLR',
    fullName: 'International Conference on Learning Representations',
    kind: 'conference',
    conferenceStyle: 'iclr',
    summary:
      'A representation-learning venue whose official form separates soundness, presentation, and contribution from the final rating.',
    looksFor: [
      'A learning idea that is more than a new combination of known parts',
      'Reproducible setup and ablations that support the claim',
      'Clear writing that a specialist can verify without guesswork',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Questions'],
    scores: ['Soundness', 'Presentation', 'Contribution', 'Rating', 'Confidence'],
  },
  {
    id: 'aaai',
    label: 'AAAI',
    fullName: 'AAAI Conference on Artificial Intelligence',
    kind: 'conference',
    conferenceStyle: 'aaai',
    summary:
      'A broad AI conference. Reviews weigh technical quality and novelty, but also whether the result matters beyond a single ML benchmark.',
    looksFor: [
      'Significance to AI rather than a narrow leaderboard delta',
      'Technical quality and completeness of the argument',
      'Clarity that a multi-area program committee can follow',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Questions for authors'],
    scores: ['Overall score', 'Confidence'],
  },
  {
    id: 'acl',
    label: 'ACL',
    fullName: 'Annual Meeting of the Association for Computational Linguistics',
    kind: 'conference',
    conferenceStyle: 'acl',
    summary:
      'A flagship NLP venue. Reviews emphasize soundness, excitement, reproducibility, and responsible data or annotation practice.',
    looksFor: [
      'A linguistic or modeling claim that is precisely scoped',
      'Dataset construction, annotation, and evaluation details',
      'Reproducibility and ethical handling of language data',
    ],
    formSections: ['Paper summary', 'Strengths', 'Weaknesses', 'Questions', 'Ethical concerns'],
    scores: ['Soundness', 'Excitement', 'Reproducibility', 'Overall', 'Confidence'],
  },
  {
    id: 'emnlp',
    label: 'EMNLP',
    fullName: 'Empirical Methods in Natural Language Processing',
    kind: 'conference',
    conferenceStyle: 'acl',
    summary:
      'An empirical NLP venue that asks whether the method is compared fairly, whether gains are real, and whether the analysis explains them.',
    looksFor: [
      'Strong empirical design against the right baselines',
      'Error analysis, not only aggregate scores',
      'Replicable data splits, prompts, and evaluation scripts',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Questions', 'Limitations'],
    scores: ['Overall recommendation', 'Confidence'],
  },
  {
    id: 'cvpr',
    label: 'CVPR',
    fullName: 'IEEE / CVF Conference on Computer Vision and Pattern Recognition',
    kind: 'conference',
    conferenceStyle: 'generic',
    summary:
      'A leading vision conference. Reviews look for a clear visual or geometric idea, thorough experiments, and honest comparison to prior art.',
    looksFor: [
      'A method whose novelty is visible in the design, not only in scale',
      'Complete experimental protocol and comparison tables',
      'Failure cases and when the method should not be used',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Questions'],
    scores: ['Overall rating', 'Confidence'],
  },
  {
    id: 'kdd',
    label: 'KDD',
    fullName: 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining',
    kind: 'conference',
    conferenceStyle: 'generic',
    summary:
      'A data-mining venue that values real-world utility, scalability, and experimental design on messy or large-scale data.',
    looksFor: [
      'A problem that exists outside a synthetic benchmark',
      'Scalability and deployment constraints made explicit',
      'Evaluation that reflects the intended use, not only accuracy',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Questions'],
    scores: ['Overall score', 'Confidence'],
  },
  {
    id: 'jmlr',
    label: 'JMLR',
    fullName: 'Journal of Machine Learning Research',
    kind: 'journal',
    conferenceStyle: 'generic',
    summary:
      'An archival ML journal. The bar is completeness: a result should remain useful after the conference cycle, with thorough proofs or experiments.',
    looksFor: [
      'A lasting technical contribution, not a thin incremental variant',
      'Complete related work, proofs, and experimental appendices',
      'Claims that will still hold after independent re-implementation',
    ],
    formSections: ['Summary', 'Major comments', 'Minor comments', 'Recommendation'],
    scores: ['Accept / revise / reject', 'Reviewer confidence'],
  },
  {
    id: 'tmlr',
    label: 'TMLR',
    fullName: 'Transactions on Machine Learning Research',
    kind: 'journal',
    conferenceStyle: 'generic',
    summary:
      'A journal that certifies correctness and clarity. Impact theater is secondary: supported claims can be accepted even if they are not fashionable.',
    looksFor: [
      'Claims that are exactly as strong as the evidence',
      'Reproducible experiments or checkable theory',
      'Clear writing that another researcher can verify',
    ],
    formSections: ['Summary', 'Strengths', 'Weaknesses', 'Requested changes'],
    scores: ['Certification decision', 'Confidence'],
  },
  {
    id: 'nature_mi',
    label: 'Nature MI',
    fullName: 'Nature Machine Intelligence',
    kind: 'journal',
    conferenceStyle: 'generic',
    summary:
      'A selective journal for machine-intelligence work with broad scientific interest. Reviews ask whether the result changes how a wider audience thinks.',
    looksFor: [
      'A finding that matters beyond a specialist leaderboard',
      'Rigorous evidence and transparent limitations',
      'Writing that a technically literate non-specialist can follow',
    ],
    formSections: ['Summary', 'Significance', 'Evidence quality', 'Editorial comments'],
    scores: ['Editorial recommendation'],
  },
  {
    id: 'tpami',
    label: 'TPAMI',
    fullName: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    kind: 'journal',
    conferenceStyle: 'generic',
    summary:
      'An archival vision and pattern-recognition journal. Reviews expect thorough experiments, comparison to prior art, and a contribution that lasts.',
    looksFor: [
      'A method or analysis with archival technical depth',
      'Extensive experiments, ablations, and failure analysis',
      'Positioning against the established literature, not only recent preprints',
    ],
    formSections: ['Summary', 'Major comments', 'Minor comments', 'Recommendation'],
    scores: ['Accept / revise / reject'],
  },
]

export function reviewStyleById(id: string | undefined): ReviewStyle | undefined {
  if (!id) return undefined
  return REVIEW_STYLES.find((style) => style.id === id)
}
