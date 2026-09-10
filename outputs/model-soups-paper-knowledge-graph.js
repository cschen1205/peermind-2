(function (root) {
  'use strict';

  const graph = {
    id: 'model-soups-need-only-one-ingredient',
    title: 'Model soups need only one ingredient',
    source: {
      file: '25327_Model_soups_need_only_on.pdf',
      venueState: 'Under review as a conference paper at ICLR 2026',
      note: 'This graph represents the supplied paper only. Author claims, methods, reported evidence, and stated limitations are encoded as different node types; graph edges do not independently verify a claim.'
    },
    legend: {
      claim: 'Author claim',
      method: 'Method or construct',
      evidence: 'Reported evidence',
      gap: 'Scope or limitation'
    },
    nodes: [
      { id: 'MS-S01', label: 'MonoSoup', type: 'method', source: 'Abstract; Section 4', detail: 'A data-free, post-hoc method that edits one fine-tuned checkpoint to balance in-distribution accuracy and out-of-distribution robustness.', x: 540, y: 292, radius: 34 },
      { id: 'MS-S02', label: 'Representation collapse', type: 'gap', source: 'Abstract; Section 1', detail: 'Fine-tuning can improve target-distribution accuracy while degrading general-purpose knowledge and OOD performance.', x: 95, y: 115, radius: 25 },
      { id: 'MS-S03', label: 'ID-OOD balance', type: 'claim', source: 'Abstract; Sections 1 and 7', detail: 'The paper targets a checkpoint that preserves strong ID performance while recovering OOD robustness.', x: 295, y: 90, radius: 25 },
      { id: 'MS-S04', label: 'Model Soups', type: 'method', source: 'Sections 1 and 2', detail: 'Averages many fine-tuned checkpoints from the same pretrained initialization, improving robustness at substantial training and storage cost.', x: 95, y: 275, radius: 25 },
      { id: 'MS-S05', label: 'Multi-checkpoint cost', type: 'gap', source: 'Sections 1 and 2', detail: 'Standard soups may require dozens of fine-tuned checkpoints; ModelStock still assumes two suitable checkpoints.', x: 285, y: 235, radius: 23 },
      { id: 'MS-S06', label: 'Update alignment', type: 'claim', source: 'Section 3; Figure 2', detail: 'The authors report that merging tends to succeed when fine-tuning updates are well aligned and fails when conflicting updates interfere.', x: 145, y: 450, radius: 25 },
      { id: 'MS-S07', label: '2,409 CLIP pairs', type: 'evidence', source: 'Section 3; Figure 2', detail: 'ModelStock is analyzed on 2,409 reported pairwise combinations of 70 CLIP ViT-B/32 ImageNet checkpoints.', x: 345, y: 505, radius: 23 },
      { id: 'MS-S08', label: 'Similarity-filtered soup', type: 'method', source: 'Section 3; Figure 1', detail: 'A geometric variant of Greedy Soup accepts a checkpoint when average layer-wise cosine similarity to the current soup exceeds a threshold.', x: 145, y: 590, radius: 25 },
      { id: 'MS-S09', label: 'Layer update ΔW', type: 'method', source: 'Section 4', detail: 'For each layer, MonoSoup starts from the difference between fine-tuned and pretrained weights.', x: 430, y: 135, radius: 22 },
      { id: 'MS-S10', label: 'SVD split', type: 'method', source: 'Section 4; Equations 2-3', detail: 'Singular value decomposition separates each layer update into high-energy and low-energy components.', x: 540, y: 190, radius: 24 },
      { id: 'MS-S11', label: 'High-energy directions', type: 'method', source: 'Section 4', detail: 'Leading singular directions are treated as concentrated task-specific adaptation.', x: 715, y: 105, radius: 23 },
      { id: 'MS-S12', label: 'Low-energy directions', type: 'method', source: 'Section 4', detail: 'Residual directions may contain noise but can also preserve information important for OOD robustness.', x: 745, y: 240, radius: 24 },
      { id: 'MS-S13', label: 'Energy threshold R', type: 'method', source: 'Section 4; Equation 3', detail: 'R determines the smallest rank that preserves a chosen fraction of spectral energy; experiments usually set R to 0.8.', x: 445, y: 390, radius: 22 },
      { id: 'MS-S14', label: 'Spectral decay ρ', type: 'method', source: 'Section 4; Equation 5', detail: 'The ratio of the first discarded singular value to the leading singular value estimates how flat the residual spectrum is.', x: 645, y: 405, radius: 22 },
      { id: 'MS-S15', label: 'Low-energy fraction cos α', type: 'method', source: 'Section 4; Equation 6', detail: 'The squared cosine term measures the fraction of update energy carried by low-energy directions.', x: 820, y: 385, radius: 23 },
      { id: 'MS-S16', label: 'Adaptive reweighting', type: 'method', source: 'Section 4; Equations 4 and 6', detail: 'Layer-wise coefficients derived from spectral decay and low-energy share recombine the two components.', x: 700, y: 520, radius: 25 },
      { id: 'MS-S17', label: 'Tail ablation', type: 'evidence', source: 'Section 4; Figure 3', detail: 'On ImageNet with natural shifts, removing low-energy components reduces both ID and OOD accuracy even when 95% of spectral energy is retained.', x: 970, y: 165, radius: 23 },
      { id: 'MS-S18', label: 'CLIP evaluation', type: 'evidence', source: 'Section 5.1; Table 1', detail: 'CLIP ViT-B/32 is evaluated on ImageNet-1K and five natural shifts using representative strong and weak checkpoints from a pool of 70.', x: 950, y: 335, radius: 24 },
      { id: 'MS-S19', label: 'Vision gains', type: 'claim', source: 'Section 5.1; Table 1', detail: 'Reported average OOD accuracy rises from 50.67% to 51.60% on the strongest OOD checkpoint and by about 7.5-7.9 points on weak checkpoints.', x: 1085, y: 455, radius: 24 },
      { id: 'MS-S20', label: 'Qwen evaluation', type: 'evidence', source: 'Section 5.2; Table 2', detail: 'Qwen3-0.6B variants are tested on mathematical reasoning and multiple-choice benchmarks with an approximate ID/OOD split.', x: 915, y: 570, radius: 24 },
      { id: 'MS-S21', label: 'Language gains', type: 'claim', source: 'Section 5.2; Table 2', detail: 'The paper reports improvement over each fine-tuned Qwen variant and LiNeS across all listed benchmarks, using one checkpoint.', x: 1090, y: 620, radius: 23 },
      { id: 'MS-S22', label: 'Wise-FT complement', type: 'evidence', source: 'Section 5.3; Figure 4', detail: 'MonoSoup plus Wise-FT produces reported Pareto fronts that dominate Wise-FT and LiNeS plus Wise-FT across five vision shifts.', x: 930, y: 700, radius: 24 },
      { id: 'MS-S23', label: 'Threshold sensitivity', type: 'gap', source: 'Sections 5.4 and 7; Figure 5', detail: 'Intermediate R values around 0.7-0.85 work best in the reported analysis, but R remains an architecture- or domain-dependent hyperparameter.', x: 605, y: 680, radius: 24 },
      { id: 'MS-S24', label: 'Evidence boundary', type: 'gap', source: 'Sections 5.1-5.2', detail: 'Large recoveries are concentrated on weak checkpoints, and the language benchmark has a less rigid ID/OOD distinction than the vision setting.', x: 355, y: 680, radius: 24 }
    ],
    edges: [
      { from: 'MS-S02', to: 'MS-S03', relation: 'creates trade-off' },
      { from: 'MS-S04', to: 'MS-S03', relation: 'partly addresses' },
      { from: 'MS-S04', to: 'MS-S05', relation: 'requires' },
      { from: 'MS-S06', to: 'MS-S07', relation: 'supported by analysis' },
      { from: 'MS-S06', to: 'MS-S08', relation: 'tested by' },
      { from: 'MS-S06', to: 'MS-S01', relation: 'motivates' },
      { from: 'MS-S05', to: 'MS-S01', relation: 'motivates' },
      { from: 'MS-S09', to: 'MS-S10', relation: 'decomposed by' },
      { from: 'MS-S01', to: 'MS-S09', relation: 'edits' },
      { from: 'MS-S10', to: 'MS-S11', relation: 'extracts' },
      { from: 'MS-S10', to: 'MS-S12', relation: 'extracts' },
      { from: 'MS-S13', to: 'MS-S10', relation: 'sets split for' },
      { from: 'MS-S12', to: 'MS-S17', relation: 'tested by' },
      { from: 'MS-S14', to: 'MS-S16', relation: 'controls' },
      { from: 'MS-S15', to: 'MS-S16', relation: 'controls' },
      { from: 'MS-S11', to: 'MS-S16', relation: 'reweighted by' },
      { from: 'MS-S12', to: 'MS-S16', relation: 'reweighted by' },
      { from: 'MS-S16', to: 'MS-S01', relation: 'defines' },
      { from: 'MS-S01', to: 'MS-S18', relation: 'evaluated on' },
      { from: 'MS-S18', to: 'MS-S19', relation: 'supports reported' },
      { from: 'MS-S01', to: 'MS-S20', relation: 'evaluated on' },
      { from: 'MS-S20', to: 'MS-S21', relation: 'supports reported' },
      { from: 'MS-S01', to: 'MS-S22', relation: 'combined with' },
      { from: 'MS-S13', to: 'MS-S23', relation: 'creates' },
      { from: 'MS-S19', to: 'MS-S24', relation: 'qualified by' },
      { from: 'MS-S21', to: 'MS-S24', relation: 'qualified by' },
      { from: 'MS-S03', to: 'MS-S01', relation: 'targeted by' }
    ],
    keyFindings: [
      { id: 'MS-K01', title: 'Single-checkpoint objective', summary: 'MonoSoup aims to recover soup-like robustness benefits without retaining multiple fine-tuned checkpoints.', sources: ['MS-S01', 'MS-S03', 'MS-S05'] },
      { id: 'MS-K02', title: 'Geometry-to-method argument', summary: 'Observed update alignment in successful merges motivates decomposing and reweighting directions inside one checkpoint.', sources: ['MS-S06', 'MS-S09', 'MS-S10', 'MS-S16'] },
      { id: 'MS-K03', title: 'Low-energy directions are not simply noise', summary: 'The ImageNet truncation study reports that removing the spectral tail can hurt both ID and OOD accuracy.', sources: ['MS-S12', 'MS-S17'] },
      { id: 'MS-K04', title: 'Reported cross-domain evidence', summary: 'The paper reports gains on CLIP vision shifts and Qwen reasoning benchmarks, with larger recovery on weak checkpoints.', sources: ['MS-S18', 'MS-S19', 'MS-S20', 'MS-S21', 'MS-S24'] },
      { id: 'MS-K05', title: 'Main stated limitation', summary: 'The interpretable threshold R still requires adaptation across architectures or domains.', sources: ['MS-S13', 'MS-S23'] }
    ]
  };

  root.MODEL_SOUPS_PAPER_KNOWLEDGE_GRAPH = graph;
  if (typeof module !== 'undefined' && module.exports) module.exports = graph;
})(typeof window !== 'undefined' ? window : globalThis);
