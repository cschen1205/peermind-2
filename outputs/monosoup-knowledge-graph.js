(function (root) {
  'use strict';

  const OPENREVIEW = 'https://openreview.net/forum?id=ICANwnoGgN&noteId=p0VR9cKoYg';
  const ARXIV = 'https://arxiv.org/abs/2602.09689v1';

  const graph = {
    id: 'monosoup-ICANwnoGgN',
    title: 'Model soups need only one ingredient',
    authors: ['Alireza Abdollahpoorrostam', 'Nikolaos Dimitriadis', 'Adam Hazimeh', 'Pascal Frossard'],
    venue: 'ICLR 2026 submission 25327',
    decision: 'Reject',
    sourcePolicy: {
      paper: 'arXiv:2602.09689v1, 10 February 2026. This is a stable public edition, not proven identical to every review-time revision.',
      reviews: 'Human reviews, discussion, meta-review, and decision from the OpenReview forum.',
      interpretation: 'Paper claims, reviewer judgments, author replies, and the area-chair conclusion are different node types. An edge records a relationship, not truth.'
    },
    sources: {
      paper: { label: 'Paper · arXiv v1', url: ARXIV },
      forum: { label: 'OpenReview forum', url: OPENREVIEW },
      meta: { label: 'Meta-review · Ax5fH58HGb', url: 'https://openreview.net/forum?id=ICANwnoGgN&noteId=Ax5fH58HGb' },
      mj9q: { label: 'Review · mj9q · 1U7Spi9ioT', url: 'https://openreview.net/forum?id=ICANwnoGgN&noteId=1U7Spi9ioT' },
      YMQp: { label: 'Review · YMQp · XkBl7Bnxog', url: 'https://openreview.net/forum?id=ICANwnoGgN&noteId=XkBl7Bnxog' },
      q1EA: { label: 'Review · q1EA · 6jZIsbB3sl', url: 'https://openreview.net/forum?id=ICANwnoGgN&noteId=6jZIsbB3sl' },
      gzvH: { label: 'Review · gzvH · jhHPrP2PT5', url: 'https://openreview.net/forum?id=ICANwnoGgN&noteId=jhHPrP2PT5' },
      Yqvj: { label: 'Review · Yqvj · jSZaC4b9rS', url: 'https://openreview.net/forum?id=ICANwnoGgN&noteId=jSZaC4b9rS' },
      rebuttal: { label: 'Author rebuttal thread', url: OPENREVIEW },
      decision: { label: 'Decision · p0VR9cKoYg', url: OPENREVIEW }
    },
    nodes: [
      { id: 'paper', type: 'paper', label: 'MonoSoup paper', detail: 'A post-hoc spectral edit intended to improve the in-distribution / out-of-distribution balance from one fine-tuned checkpoint.', source: 'paper', locator: 'Title and abstract', x: 80, y: 300 },
      { id: 'problem', type: 'context', label: 'ID–OOD trade-off', detail: 'Fine-tuning can improve target-distribution accuracy while degrading robustness under distribution shift.', source: 'paper', locator: 'Abstract; §1', x: 270, y: 95 },
      { id: 'constraint', type: 'context', label: 'One checkpoint', detail: 'The motivating deployment constraint is that multiple suitable fine-tuned checkpoints may be unavailable or expensive to produce and retain.', source: 'paper', locator: '§1–2', x: 270, y: 215 },
      { id: 'alignment', type: 'claim', label: 'Alignment predicts merging', detail: 'The authors associate successful same-task merging with high alignment between fine-tuning updates.', source: 'paper', locator: '§3; Figures 1–2', x: 270, y: 395 },
      { id: 'paircount', type: 'evidence', label: '70-model pair study', detail: 'The paper analyzes pairwise combinations of 70 CLIP ViT-B/32 checkpoints; one review flags 2,409 versus the combinatorial total of 2,415.', source: 'paper', locator: '§3; Figure 1', x: 270, y: 530 },
      { id: 'update', type: 'method', label: 'Layer update ΔW', detail: 'For each layer, MonoSoup starts from the difference between fine-tuned and pretrained weights.', source: 'paper', locator: '§4', x: 500, y: 90 },
      { id: 'svd', type: 'method', label: 'SVD decomposition', detail: 'Each layer update is decomposed into high-energy and low-energy spectral components.', source: 'paper', locator: '§4; Equations 2–4', x: 500, y: 205 },
      { id: 'erank', type: 'method', label: 'Effective-rank split', detail: 'The later automatic variant uses entropy-based effective rank to choose the high/low partition without a manually selected R.', source: 'paper', locator: '§4; Equation 3', x: 500, y: 320 },
      { id: 'weights', type: 'method', label: 'Adaptive reweighting', detail: 'Layer-wise coefficients recombine high- and low-energy components using spectral decay and the low-energy fraction of update energy.', source: 'paper', locator: '§4; Equations 5–8', x: 500, y: 435 },
      { id: 'edited', type: 'method', label: 'Edited checkpoint', detail: 'The output is one deterministically edited checkpoint; no multi-checkpoint average is required at inference.', source: 'paper', locator: '§4', x: 500, y: 550 },
      { id: 'tail', type: 'claim', label: 'Low-energy tail can matter', detail: 'On the ImageNet setting, truncating low-energy directions degrades ID and OOD performance; the paper argues these directions may preserve robustness-relevant information.', source: 'paper', locator: '§4; Figure 3', x: 735, y: 90 },
      { id: 'vision', type: 'evidence', label: 'Vision evaluation', detail: 'CLIP ViT-B/32 is evaluated on ImageNet-1K and five natural shifts; ConvNeXt appears in the expanded analysis.', source: 'paper', locator: '§5.1; Table 1; appendices', x: 735, y: 225 },
      { id: 'language', type: 'evidence', label: 'Language evaluation', detail: 'Qwen3-0.6B variants are evaluated on mathematical reasoning and multiple-choice tasks with an approximate ID/OOD split.', source: 'paper', locator: '§5.2; Table 2', x: 735, y: 350 },
      { id: 'results', type: 'claim', label: 'Reported performance claim', detail: 'The authors report systematic OOD gains, especially for weak checkpoints, and competitive results against multi-checkpoint methods.', source: 'paper', locator: '§5; Tables 1–2; Figure 4', x: 735, y: 485 },
      { id: 'scope', type: 'scope', label: 'Claim boundaries', detail: 'Large gains concentrate on weak or representation-collapsed checkpoints. Gains on strong checkpoints are modest, and the language ID/OOD distinction is less rigid.', source: 'paper', locator: '§5.1–5.2', x: 735, y: 610 },

      { id: 'r_mj9q', type: 'review', label: 'Reviewer mj9q · 4', detail: 'Raises limited novelty versus prior SVD methods, heuristic coefficient design, “soup” terminology, stronger-shift coverage, and later scalability to 2–7B models.', source: 'mj9q', locator: 'Official review and follow-up', x: 1000, y: 80 },
      { id: 'r_YMQp', type: 'review', label: 'Reviewer YMQp · 6', detail: 'Views the method as lightweight with strong OOD results, but questions whether single-checkpoint storage is the right primary motivation and asks for broader modalities.', source: 'YMQp', locator: 'Official review', x: 1000, y: 190 },
      { id: 'r_q1EA', type: 'review', label: 'Reviewer q1EA · 4→6', detail: 'Challenges the low-energy interpretation, strength and generality of gains, same-task alignment claim, pair count, undefined τ, and pairwise adaptation. Most concerns were resolved; coefficient interpretation remained central.', source: 'q1EA', locator: 'Official review and discussion', x: 1000, y: 300 },
      { id: 'r_gzvH', type: 'review', label: 'Reviewer gzvH · 6→8', detail: 'Praises practicality and empirical breadth while asking for a label-free R rule, architecture diversity, variability reporting, and clearer coefficient interpretation.', source: 'gzvH', locator: 'Official review and discussion', x: 1000, y: 410 },
      { id: 'r_Yqvj', type: 'review', label: 'Reviewer Yqvj · 6→8', detail: 'Highlights modest gains on strong checkpoints, absent variability reporting, coefficient interpretability, and unclear M-x identifiers; the rebuttal led to a score increase.', source: 'Yqvj', locator: 'Official review and discussion', x: 1000, y: 520 },
      { id: 'rebuttal', type: 'response', label: 'Author rebuttal & revision', detail: 'The authors distinguish the single-checkpoint setting, add CKA and architecture analyses, introduce effective-rank MonoSoup, clarify identifiers and pairwise use, and defend the coefficient through boundary conditions and sensitivity.', source: 'rebuttal', locator: '25–28 November 2025 discussion', x: 1245, y: 300 },
      { id: 'meta', type: 'meta', label: 'Area chair meta-review', detail: 'Acknowledges motivation, clarity, efficient post-processing, and rebuttal additions. It finds the λ_low design still lacks adequate theoretical support and the gains remain modest.', source: 'meta', locator: '16 December 2025', x: 1475, y: 235 },
      { id: 'decision', type: 'decision', label: 'Decision · Reject', detail: 'The program-chair decision is reject. Updated reviewer scores were 4, 6, 6, 8, and 8, but the area chair retained the central theory and impact concerns.', source: 'decision', locator: '26 January 2026', x: 1475, y: 390 }
    ],
    edges: [
      { from: 'paper', to: 'problem', relation: 'addresses', source: 'paper' },
      { from: 'paper', to: 'constraint', relation: 'assumes', source: 'paper' },
      { from: 'alignment', to: 'paircount', relation: 'studied with', source: 'paper' },
      { from: 'alignment', to: 'update', relation: 'motivates', source: 'paper' },
      { from: 'update', to: 'svd', relation: 'decomposed by', source: 'paper' },
      { from: 'svd', to: 'erank', relation: 'partition chosen by', source: 'paper' },
      { from: 'svd', to: 'tail', relation: 'isolates', source: 'paper' },
      { from: 'erank', to: 'weights', relation: 'sets boundary for', source: 'paper' },
      { from: 'tail', to: 'weights', relation: 'motivates preserving', source: 'paper' },
      { from: 'weights', to: 'edited', relation: 'produces', source: 'paper' },
      { from: 'edited', to: 'vision', relation: 'evaluated by', source: 'paper' },
      { from: 'edited', to: 'language', relation: 'evaluated by', source: 'paper' },
      { from: 'vision', to: 'results', relation: 'supports', source: 'paper' },
      { from: 'language', to: 'results', relation: 'supports', source: 'paper' },
      { from: 'results', to: 'scope', relation: 'qualified by', source: 'paper' },

      { from: 'r_mj9q', to: 'svd', relation: 'questions novelty of', source: 'mj9q' },
      { from: 'r_mj9q', to: 'weights', relation: 'questions theory for', source: 'mj9q' },
      { from: 'r_mj9q', to: 'scope', relation: 'questions scale of', source: 'mj9q' },
      { from: 'r_YMQp', to: 'constraint', relation: 'questions motivation for', source: 'YMQp' },
      { from: 'r_q1EA', to: 'tail', relation: 'challenges interpretation of', source: 'q1EA' },
      { from: 'r_q1EA', to: 'paircount', relation: 'flags discrepancy in', source: 'q1EA' },
      { from: 'r_q1EA', to: 'results', relation: 'questions robustness of', source: 'q1EA' },
      { from: 'r_gzvH', to: 'erank', relation: 'prompts label-free', source: 'gzvH' },
      { from: 'r_gzvH', to: 'vision', relation: 'asks broader architectures for', source: 'gzvH' },
      { from: 'r_Yqvj', to: 'results', relation: 'qualifies', source: 'Yqvj' },
      { from: 'r_Yqvj', to: 'weights', relation: 'asks interpretation of', source: 'Yqvj' },
      { from: 'r_mj9q', to: 'rebuttal', relation: 'answered by', source: 'rebuttal' },
      { from: 'r_YMQp', to: 'rebuttal', relation: 'answered by', source: 'rebuttal' },
      { from: 'r_q1EA', to: 'rebuttal', relation: 'partly resolved by', source: 'rebuttal' },
      { from: 'r_gzvH', to: 'rebuttal', relation: 'resolved enough for 8 by', source: 'rebuttal' },
      { from: 'r_Yqvj', to: 'rebuttal', relation: 'resolved enough for 8 by', source: 'rebuttal' },
      { from: 'rebuttal', to: 'erank', relation: 'adds', source: 'rebuttal' },
      { from: 'rebuttal', to: 'tail', relation: 'adds CKA evidence for', source: 'rebuttal' },
      { from: 'rebuttal', to: 'meta', relation: 'considered by', source: 'meta' },
      { from: 'r_mj9q', to: 'meta', relation: 'synthesized by', source: 'meta' },
      { from: 'r_q1EA', to: 'meta', relation: 'synthesized by', source: 'meta' },
      { from: 'r_gzvH', to: 'meta', relation: 'synthesized by', source: 'meta' },
      { from: 'r_Yqvj', to: 'meta', relation: 'synthesized by', source: 'meta' },
      { from: 'meta', to: 'decision', relation: 'recommends', source: 'decision' }
    ],
    reviewSynthesis: {
      strengths: ['Clear and well-motivated single-checkpoint problem', 'Simple, data-free post-hoc procedure', 'Vision and language evaluations', 'Large gains on weak or collapsed checkpoints'],
      resolvedOrImproved: ['A label-free effective-rank variant was added', 'CKA analysis was added for the high/low-energy interpretation', 'ConvNeXt and wider checkpoint analysis broadened coverage', 'Several reviewers raised scores after rebuttal'],
      unresolved: ['Theoretical justification for λ_low and its boundary conditions', 'Modest gains over strong baselines on strong checkpoints', 'Evidence at the large-model scale where checkpoint costs matter most', 'Limited exploration of richer or multi-step editing'],
      outcome: 'Positive reviewer movement did not overcome the area chair’s concerns about theoretical grounding and practical effect size.'
    }
  };

  root.MONOSOUP_KNOWLEDGE_GRAPH = graph;
  if (typeof module !== 'undefined' && module.exports) module.exports = graph;
})(typeof window !== 'undefined' ? window : globalThis);
