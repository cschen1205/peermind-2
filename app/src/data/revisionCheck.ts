import type { RevisionCheckInputs, RevisionCheckResult } from '@/types/revision'

export const PREPARED_REVISION_INPUTS: RevisionCheckInputs = {
  reviewFileName: 'chatgpt_review_v1.md',
  reviewLabel: 'Original review (v1)',
  paperFileName: 'sample_paper_v2.pdf',
  paperLabel: 'Updated manuscript (v2)',
}

export const PREPARED_REVISION_RESULT: RevisionCheckResult = {
  inputs: PREPARED_REVISION_INPUTS,
  priorScore: {
    overall: 4,
    scale: 10,
    label: 'Borderline reject',
  },
  updatedScore: {
    overall: 6,
    scale: 10,
    label: 'Weak accept',
  },
  summary:
    'The revision fixed more of the original review than a first pass suggested: the 70-checkpoint CLIP figure is now in the main paper, SVD cost is profiled through 14B, the 2,409/2,415 pair-count is disclosed, language evaluation now includes genuine cross-lingual and cross-domain shifts, and the listed typos are gone. The conceptual story is still the same: cos α is an energy fraction, not alignment, and shrinkage is still not isolated from spectral editing. Two new problems arrived with the revision itself.',
  issues: [
    {
      id: 'RC-01',
      status: 'addressed',
      severity: 'major',
      title: 'Four-checkpoint CLIP table no longer stands alone',
      originalAllegation:
        'Table 1 reports only the best/worst ID and OOD checkpoints. That selection can exaggerate the method, and the all-70 quiver plot belongs in the main paper.',
      revisionEvidence:
        'Figure 4 is now a main-paper plot over all 70 CLIP ViT-B/32 checkpoints, with a mean-Δ marker. Figure 5 also averages Wise-FT / MonoSoup curves over those 70 models.',
      assessment:
        'The original selection concern is met. A full mean/median/fraction-improved table is still thinner than requested, but the paper no longer leads with four extremes alone.',
      sourceRefs: ['Review W8', 'v2 Fig. 4', 'v2 Fig. 5'],
    },
    {
      id: 'RC-02',
      status: 'addressed',
      severity: 'major',
      title: 'SVD cost is no longer undiscussed',
      originalAllegation:
        'The method is called lightweight without wall-clock time, peak memory, exact vs randomized SVD, or feasibility on large models.',
      revisionEvidence:
        'Table 7 reports median wall-clock time and peak GPU memory on CLIP ViT-B/32, ViT-L/14, Qwen3-0.6B, and Qwen3-14B (3.1s / 2.2s / 18.8s / 83.3s; peak memory up to 20,884 MB). Storage is compared against a 10-checkpoint soup.',
      assessment:
        'Cost is now an experimental result. Feasibility at 14B is shown; accuracy at that scale is still missing and is tracked separately.',
      sourceRefs: ['Review W7', 'v2 Table 7'],
    },
    {
      id: 'RC-13',
      status: 'addressed',
      severity: 'minor',
      title: 'The missing six ModelStock pairs are now disclosed',
      originalAllegation:
        'Figure 1 reports 2,409 pairwise combinations, but 70 choose 2 is 2,415, and no exclusion is explained.',
      revisionEvidence:
        'Section 3 now writes C(70,2) = 2415. A footnote says six pairs with extreme negative outliers were dropped from the figure to preserve axis scale, and Table 9 lists those pairs with constituent and ModelStock ID/OOD numbers.',
      assessment:
        'The arithmetic gap is closed. The figure caption still says 2,409, but that count is now the disclosed exclusion, not an unexplained discrepancy.',
      sourceRefs: ['Finding F06', 'v2 §3 fn. 1', 'v2 Table 9'],
    },
    {
      id: 'RC-14',
      status: 'addressed',
      severity: 'major',
      title: 'Language OOD is no longer only harder math',
      originalAllegation:
        'GSMPlus, GSM8K Platinum, and MMLU-Pro-Math are treated as OOD, but they mainly raise reasoning difficulty rather than isolate a distribution shift.',
      revisionEvidence:
        'Appendix K adds a cross-lingual MGSM evaluation (8 languages; English-only fine-tuning) and a cross-domain 0-shot suite (ARC-Challenge, HellaSwag, MMLU Humanities / Social Sci.). MonoSoup recovers multilingual drop in 7/8 languages and improves the MMLU subsets.',
      assessment:
        'The requested controlled-shift protocol is in the paper. Main-text Table 2 still labels harder GSM tasks as OOD, but the appendix now supplies genuine language and domain shifts.',
      sourceRefs: ['Finding F04', 'v2 Appendix K'],
    },
    {
      id: 'RC-03',
      status: 'addressed',
      severity: 'minor',
      title: 'Supporting analyses were added, not just promised',
      originalAllegation:
        'The first review asked for more than the main CLIP table: component ablations and checks beyond the headline setting.',
      revisionEvidence:
        'Figure 6 ablates ρ-only versus cos α-only versus the combined rule. The appendix adds LoRA compatibility (Table 8) and positions MonoSoup against LoRA-Pro / PiSSA as a post-hoc complement.',
      assessment:
        'These are real additions. They strengthen the empirical case even where the mechanistic story stays weak.',
      sourceRefs: ['Review requests', 'v2 Fig. 6', 'v2 Table 8', 'v2 Appendix L'],
    },
    {
      id: 'RC-05',
      status: 'addressed',
      severity: 'minor',
      title: 'Listed typos are gone',
      originalAllegation:
        'Frequent typos such as “each model corressponds,” “especially pronounced in the poor of (OOD+),” “furher assume,” “demonstrates achieves,” and duplicated “Appendix Appendix.”',
      revisionEvidence:
        'Those strings are absent from the updated PDF. The old “poor of (OOD+)” sentence is now “the pair of (ID+, OOD+).” Presentation in the follow-up review rises from 2/4 to 3/4.',
      assessment:
        'The proofreading request is met. Leftover wording — “collapsed representations,” broad “matches or exceeds,” and alignment/energy naming — is conceptual and is tracked elsewhere.',
      sourceRefs: ['Review minor comments', 'v2 §5.1', 'v2 presentation'],
    },
    {
      id: 'RC-04',
      status: 'partially_addressed',
      severity: 'major',
      title: 'Language-model claims are narrower, not proven',
      originalAllegation:
        'Qwen3-0.6B with three configurations cannot support “scales naturally to LLMs,” and the +9.2 point claim does not match Table 2 versus the fine-tuned checkpoints.',
      revisionEvidence:
        'Accuracy tables are still Qwen3-0.6B. Qwen3-14B appears only in the cost study. Section 5.2 still writes “+9.2 points each” without naming the baseline; those numbers match M-3 MonoSoup versus the pretrained Qwen3-0.6B (31.7−22.5, 59.2−50.1), not versus the fine-tuned checkpoints.',
      assessment:
        'A reader can reconstruct +9.2, but the manuscript still does not say so. Generality across language-model scale remains unshown.',
      sourceRefs: ['Review W6', 'v2 §5.2', 'v2 Table 2', 'v2 Table 7'],
    },
    {
      id: 'RC-15',
      status: 'partially_addressed',
      severity: 'major',
      title: 'ρ and cos α look less redundant, but are still not independent',
      originalAllegation:
        'ρ and cos α are presented as complementary signals even though both come from the same singular-value spectrum, and cos²α ≤ 1−R for a fixed energy threshold.',
      revisionEvidence:
        'Figure 6 now ablates the mixing rule: ρ-only preserves ID with little OOD gain; cos α-only helps weak-checkpoint OOD and can hurt ID; the product rule is strongest. There is still no layer-wise correlation of ρ, k, R, and cos α.',
      assessment:
        'The ablation shows the two terms are not interchangeable. It does not show how much extra information cos α adds beyond R, k, and ρ.',
      sourceRefs: ['Review W2', 'Finding F09', 'v2 Fig. 6', 'v2 Appendix C'],
    },
    {
      id: 'RC-06',
      status: 'remaining',
      severity: 'major',
      title: 'cos α is still not an alignment measure',
      originalAllegation:
        'cos²α = ‖W_Low‖² / ‖W‖² is the residual spectral-energy fraction. It is not cosine similarity with the pretrained model, and calling it alignment invents a bridge from Section 3.',
      revisionEvidence:
        'Equation 7 is unchanged. The updated paper still uses “alignment” for this ratio. The second review repeats the same objection as the first weakness.',
      assessment:
        'Not fixed. The revision restates the quantity; it does not redefine it or replace it with a real single-model alignment measure.',
      sourceRefs: ['Review W1', 'v2 Eq. 7', 'v2 W1'],
    },
    {
      id: 'RC-07',
      status: 'remaining',
      severity: 'major',
      title: 'Multi-model alignment still does not imply MonoSoup',
      originalAllegation:
        'Pairwise task-vector alignment is a different object from a residual-energy split of one update. Section 3 does not establish the method in Section 4.',
      revisionEvidence:
        'The updated paper still opens with ModelStock / pairwise alignment, then moves to a single-checkpoint SVD split. The second review keeps this as a central weakness.',
      assessment:
        'The narrative gap remains. New experiments do not close the implication the first review asked for.',
      sourceRefs: ['Review W5', 'v2 W1'],
    },
    {
      id: 'RC-08',
      status: 'remaining',
      severity: 'major',
      title: 'Shrinkage is still not isolated from spectral editing',
      originalAllegation:
        'λ_High + λ_Low = 1 shrinks the task update. A layer-wise scalar baseline with the same ‖ΔW‖ would test whether SVD is doing the work.',
      revisionEvidence:
        'Wise-FT remains the interpolation comparison. The second review still asks for a norm-matched scalar / isotropic control.',
      assessment:
        'The requested ablation is still missing. Gains could still be shrinkage toward the pretrained model.',
      sourceRefs: ['Review W3', 'v2 W3'],
    },
    {
      id: 'RC-09',
      status: 'remaining',
      severity: 'major',
      title: 'Low-energy directions are still given a semantic job they may not have',
      originalAllegation:
        'High-energy = task / OOD-vulnerable and low-energy = pretrained knowledge is stronger than the CKA evidence supports.',
      revisionEvidence:
        'CKA is now more visible, but Low-only is a smaller perturbation by construction. The second review asks for a norm-matched random or high-energy control.',
      assessment:
        'The claim was restated with more plots, not tested against the magnitude confound.',
      sourceRefs: ['Review W4', 'v2 W2'],
    },
    {
      id: 'RC-10',
      status: 'remaining',
      severity: 'minor',
      title: 'No seeds or intervals on small gains',
      originalAllegation:
        'Sub-point to one-point Qwen differences need seeds or intervals.',
      revisionEvidence:
        'The second review still cannot find confidence intervals or repeated fine-tuning / evaluation seeds for most tables.',
      assessment:
        'Unchanged. Small reported deltas remain hard to trust.',
      sourceRefs: ['Review W6 / questions', 'v2 W5'],
    },
    {
      id: 'RC-11',
      status: 'new',
      severity: 'major',
      title: 'Effective-rank k is a new rule without a new justification',
      originalAllegation:
        'The first review did not evaluate an entropy-based rank cutoff. That rule appears in the revision.',
      revisionEvidence:
        'The updated method can set k from effective rank instead of a fixed energy threshold R. The second review calls this useful but heuristic, and asks how often k hits full rank.',
      assessment:
        'The revision added a parameter-free variant and did not show that this k is the ID/OOD optimum. That is a new methodological gap, not a leftover from v1.',
      sourceRefs: ['v2 method', 'v2 W6'],
    },
    {
      id: 'RC-12',
      status: 'new',
      severity: 'minor',
      title: 'The “anonymized” PDF still identifies the authors',
      originalAllegation:
        'The first review did not flag an anonymization failure.',
      revisionEvidence:
        'The updated PDF still carries author names, affiliations, correspondence, and conference metadata on page 1.',
      assessment:
        'A process defect introduced (or left) by the revision package. It does not change the science, but it is a new issue relative to the original review.',
      sourceRefs: ['v2 page 1', 'v2 minor comments'],
    },
  ],
}

export function preparedRevisionResult(inputs?: Partial<RevisionCheckInputs>): RevisionCheckResult {
  return {
    ...PREPARED_REVISION_RESULT,
    inputs: {
      ...PREPARED_REVISION_INPUTS,
      ...inputs,
      reviewLabel: inputs?.reviewLabel?.trim() || PREPARED_REVISION_INPUTS.reviewLabel,
      paperLabel: inputs?.paperLabel?.trim() || PREPARED_REVISION_INPUTS.paperLabel,
      reviewFileName: inputs?.reviewFileName || PREPARED_REVISION_INPUTS.reviewFileName,
      paperFileName: inputs?.paperFileName || PREPARED_REVISION_INPUTS.paperFileName,
    },
  }
}
