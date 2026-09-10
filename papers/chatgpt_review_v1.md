Summary

This paper proposes MonoSoup, a post-hoc, data-free method intended to improve the in-distribution (ID) / out-of-distribution (OOD) trade-off of a single fine-tuned checkpoint. The motivation comes from Model Soups and ModelStock: the authors first analyze pairs of fine-tuned CLIP models and argue that successful weight merging is associated with alignment between fine-tuning updates. They then ask whether analogous useful structure can be extracted from only one checkpoint.

MonoSoup decomposes each layer-wise fine-tuning update \(\Delta W = W_1-W_0\) using SVD into a high-energy component and a low-energy component. Rather than discarding low-energy directions, the method reweights the two components using layer-specific coefficients derived from the singular-value spectrum and the amount of energy contained in the low-energy component. The resulting edited update is

$$ W_{\text{MonoSoup}}^{(\ell)} =\lambda_{\text{High}}^{(\ell)}W_{\text{High}}^{(\ell)} +\lambda_{\text{Low}}^{(\ell)}W_{\text{Low}}^{(\ell)}. $$

The method is evaluated primarily on CLIP ViT models fine-tuned on ImageNet and evaluated on five natural distribution shifts, with additional experiments on Qwen3-0.6B and ConvNeXt. The reported results suggest improved OOD performance over the original fine-tuned checkpoint while generally preserving ID accuracy, with competitive results relative to Model Soups, ModelStock, Wise-FT, and LiNeS.

I find the central problem relevant and the single-checkpoint setting practically interesting. However, I have substantial concerns about the conceptual justification of the proposed coefficients, some incorrect or misleading interpretations of the quantities used in the method, and the strength of the experimental evidence relative to the claims.

Strengths
Practically relevant problem. Requiring dozens of fine-tuned checkpoints, as in Model Soups, is often unrealistic. A post-hoc method operating from the pretrained model and one fine-tuned checkpoint is useful in practice. The paper motivates this setting clearly in the introduction.
Simple and easy-to-apply method. MonoSoup is conceptually straightforward and does not require additional training data. The SVD-based decomposition is interpretable, and the distinction between dominant and residual update directions provides an intuitive lens for studying fine-tuning.
Interesting observation regarding low-energy components. Figure 3 provides a useful empirical observation: while low-rank approximations appear sufficient on the standard multi-task arithmetic benchmark, aggressive truncation behaves differently for ImageNet fine-tuning under natural distribution shifts. In particular, even preserving approximately 95% of spectral energy can hurt both ID and OOD accuracy. This is arguably one of the more interesting observations in the paper.
Reasonably broad vision evaluation. The paper includes multiple CLIP checkpoints, five OOD datasets, zero-shot and linear-probe initializations, additional ConvNeXt experiments, and an all-70-checkpoint visualization. This is considerably stronger than showing results for only one or two hand-selected checkpoints.
Complementarity with Wise-FT is useful. Figure 4 suggests that using MonoSoup as the endpoint of Wise-FT interpolation can improve the resulting Pareto frontier. This is practically interesting because MonoSoup need not replace existing interpolation-based methods.
Main weaknesses
1. The quantity called cos α does not appear to measure alignment

This is my largest conceptual concern.

The paper defines

$$ \cos^2\alpha^{(\ell)} = \frac{\|W_{\mathrm{Low}}^{(\ell)}\|_F^2} {\|W^{(\ell)}\|_F^2}. $$

According to the definition, this quantity is simply the fraction of the update energy contained in the low-energy component. Because \(W_{\mathrm{High}}\) and \(W_{\mathrm{Low}}\) are orthogonal SVD components, this quantity is determined almost directly by the energy threshold \(R\). Indeed, Appendix C derives

$$ \cos^2\alpha = 1-P_k, $$

where \(P_k\) is the fraction of spectral energy retained in the high-energy component.

Therefore, I do not understand why this quantity is repeatedly described as “alignment”, or especially as alignment with the pretrained model.

For example, the paper states that this signal “quantifies how much of the fine-tuning update lies in low-energy directions,” which is accurate. But it later states that \(\cos\alpha\) “restores low-energy directions when they align with the pre-trained model,” and Appendix H calls it a “pre-training preservation signal.”

I do not see how that interpretation follows mathematically.

There is no cosine similarity between \(W_{\mathrm{Low}}\) and \(W_0\), nor between their induced representations. In fact, because \(W_{\mathrm{Low}}\) is a component of \(\Delta W\), its Frobenius norm alone says nothing about its geometric alignment with the pretrained parameters.

This issue is particularly important because the paper begins by motivating MonoSoup through geometric alignment between different task vectors, but the single-checkpoint method eventually replaces this notion with a residual-energy ratio that is not the same concept.

I believe the paper needs either:

a revised interpretation that does not call this quantity alignment; or
an actual single-model alignment measure demonstrating the claimed connection to the multi-model analysis.

At present, there seems to be a conceptual gap between Sections 3 and 4.

2. \(\rho\) and cos α are not as independent or complementary as the presentation suggests

The paper presents spectral decay

$$ \rho = \left(\frac{\sigma_{k+1}}{\sigma_1}\right)^2 $$

and \(\cos\alpha\) as “two complementary signals.” However, both quantities are computed from the same singular-value spectrum, and Appendix C explicitly establishes a tight relation between \(R\) and \(\cos\alpha\).

For a fixed energy threshold \(R\),

$$ \cos^2\alpha = 1-P_k \le 1-R. $$

Thus with the default \(R=0.8\), for example,

$$ \cos\alpha \le \sqrt{0.2}\approx0.447. $$

This makes \(\cos\alpha\) largely a consequence of the threshold and spectral distribution rather than an independent notion of geometry.

I would like to see a clearer analysis of how much additional information \(\cos\alpha\) actually contributes beyond \(R\), \(k\), and \(\rho\). A correlation analysis across layers/models would be informative.

3. The derivation of the mixing rule is heuristic despite being described as “principled”

The final rule is

$$ \lambda_{\mathrm{Low}} = \rho+(1-\rho)\cos\alpha,\qquad \lambda_{\mathrm{High}}=1-\lambda_{\mathrm{Low}}. $$

Appendix G argues that the first expression is uniquely obtained after imposing four boundary conditions and assuming a bilinear form.

This provides a reasonable design heuristic, but it does not establish that the rule should optimize ID/OOD generalization, nor that those boundary conditions are uniquely justified by the learning problem. Many other monotone functions could satisfy similar desired behavior if the bilinear assumption were removed.

More importantly, I do not see a comparable derivation for

$$ \lambda_{\mathrm{High}} = 1-\lambda_{\mathrm{Low}}. $$

Why must the two coefficients sum to one?

The original fine-tuned update corresponds to

$$ W_{\mathrm{High}}+W_{\mathrm{Low}}, $$

i.e. coefficients \((1,1)\), not coefficients summing to one. Consequently, MonoSoup is not merely redistributing emphasis between the two subspaces; it also substantially shrinks the total task update.

This raises an important possibility: how much of the gain is simply due to layer-wise shrinkage toward the pretrained model?

The comparison with Wise-FT only partially addresses this, because Wise-FT uses a global coefficient whereas MonoSoup induces layer-dependent shrinkage. I would strongly encourage comparison against a simple layer-wise norm/shrinkage baseline using the same effective update magnitude but without the SVD decomposition.

4. Several causal or semantic interpretations of high- and low-energy directions are stronger than the evidence supports

The manuscript frequently associates:

high-energy directions → task-specific knowledge / specialization;
low-energy directions → pretrained/generalization information;
high-energy directions → OOD-vulnerable representations.

For example, Appendix H states that the high-energy task directions “essentially represent the fine-tuning” and empirically correspond to representation drift that degrades OOD performance, while low-only preserves pretrained knowledge.

The CKA results are suggestive, but they do not establish this interpretation generally. They are shown primarily for the best-OOD and worst-OOD CLIP checkpoints, with ImageNet-A as the OOD dataset.

CKA similarity to the pretrained representation is also not equivalent to retaining “knowledge,” nor does increased similarity establish that a particular spectral component is responsible for robustness.

I would prefer the claims to be presented as empirical observations rather than as properties of the decomposition itself.

5. The connection between the multi-model analysis and MonoSoup is weak

Section 3 is framed as the key motivation for the method. It shows that pairwise model merging tends to work better when task vectors are aligned. The proposed Similarity-Filtered Greedy Soup further supports this observation.

However, MonoSoup does not actually reproduce this mechanism within a single checkpoint.

Multi-model alignment involves something of the form

$$ \cos(\Delta W_i,\Delta W_j), $$

whereas MonoSoup's central quantity depends on

$$ \|W_{\mathrm{Low}}\|/\|\Delta W\|. $$

These are fundamentally different objects.

As written, the narrative is:

good model merging → aligned task vectors → therefore decompose one task vector by SVD → therefore low/high spectral components can approximate the same principle.

I do not think the middle implication has been established.

Interestingly, MonoSoup may still work empirically, but the current explanation overstates what Section 3 demonstrates about the proposed method.

6. Experimental claims for the language-model setting are too strong given the evidence

The language evaluation uses only Qwen3-0.6B, with three fine-tuning configurations.

This is useful as an initial sanity check, but it is insufficient to support broad claims such as scaling “naturally” to LLMs or demonstrating generality across language models.

The improvements over the corresponding fine-tuned checkpoints are also relatively modest. For example:

M-1 GSM8K: 55.8 → 56.7
M-1 GSMPlus: 29.5 → 30.3
M-2 GSMPlus: 30.8 → 31.7
M-3 GSM8KPlatinum: 57.3 → 58.8.

These are approximately 0.5–1.5 point improvements, not large gains.

In particular, the manuscript states:

“the largest gains observed on GSMPlus and GSM8KPlatinum (+9.2 points each).”

I cannot reconcile this statement with Table 2.

For example, on M-1:

GSMPlus: 29.5 → 30.3 = +0.8
GSM8KPlatinum: 55.6 → 56.7 = +1.1

Even relative to the base Qwen model, the numbers do not appear to yield +9.2 on both datasets.

This should be corrected.

Furthermore, there are no error bars or multiple fine-tuning seeds. For sub-point-to-one-point differences, run-to-run variability could matter considerably.

7. The computational cost of SVD is not adequately discussed

The method is repeatedly characterized as “lightweight,” “practical,” and an alternative that avoids the computational overhead of multiple checkpoints.

While it certainly avoids training dozens of models, performing SVD independently on every large weight matrix of a modern LLM can itself be computationally and memory intensive.

This issue becomes increasingly important for 7B, 14B, 70B, etc. models.

The paper should report at least:

preprocessing wall-clock time;
peak memory;
exact/full vs randomized/truncated SVD;
storage overhead;
complexity as a function of matrix dimensions;
whether the method remains practical for realistically large foundation models.

Using Qwen3-0.6B does not adequately establish this.

8. Evaluation of only four selected CLIP checkpoints in the main table can exaggerate the method's behavior

Table 1 focuses on:

best ID,
worst ID,
best OOD,
worst OOD.

This does illustrate boundary cases, but it is not sufficient for demonstrating average effectiveness because extreme weak checkpoints naturally provide more room for improvement.

The appendix's all-70-checkpoint quiver plot is therefore important and should probably be elevated to the main paper.

More useful statistics would include across all 70 checkpoints:

mean ID change;
mean OOD change;
median change;
percentage of checkpoints improved on ID;
percentage improved on OOD;
percentage Pareto-improved;
worst degradation;
confidence intervals.

Figure 12 visually suggests that some checkpoints lose ID accuracy after MonoSoup. Quantifying this is necessary to support the “consistently” language used throughout the paper.

Additional questions / requested experiments

I would ask the authors to address the following in rebuttal:

Why is \(\|W_{\mathrm{Low}}\|/\|W\|\) called cosine alignment? What two objects are geometrically being aligned?
Why should \(\lambda_{\mathrm{High}}+\lambda_{\mathrm{Low}}=1\)? Please provide either a theoretical motivation or an ablation allowing the two coefficients to vary independently.
Shrinkage baseline: Can the authors compare MonoSoup against a layer-wise scalar shrinkage baseline that matches MonoSoup's resulting \(\|\Delta W_\ell\|_F\) but does not use spectral decomposition?
Full 70-model statistics: Please report aggregate improvement and degradation statistics rather than only the four extreme checkpoints.
Statistical reliability for Qwen: How many fine-tuning/evaluation seeds were used? Are differences of approximately 0.5–1 point statistically meaningful?
Larger LMs: Does MonoSoup remain computationally feasible and effective on at least a several-billion-parameter model?
SVD cost: What is the wall-clock and peak-memory cost of applying MonoSoup to CLIP ViT-L/14 and Qwen3-0.6B?
Clarify the “+9.2 points” language result, which appears inconsistent with Table 2.
Minor comments

There are a number of presentation and proofreading problems that should be fixed. Examples include “each model corressponds,” “especially pronounced in the poor of (OOD+),” “furher assume,” “Our proposed MonoSoup demonstrates achieves,” “fine-tune and at a fixed context length,” and duplicated wording such as “Appendix Appendix H.” These are individually minor but sufficiently frequent to distract from the presentation.

I also recommend using more conservative terminology than “representation collapse” whenever the paper is only measuring OOD accuracy degradation. Those phenomena are related but not necessarily identical.

The claim that the method “matches or exceeds” multi-model methods should also be qualified. For instance, in Table 1, Greedy Soup has substantially higher ID performance (81.0%) than the single-model MonoSoup variants, although MonoSoup can have better average OOD accuracy. The appropriate conclusion is therefore about the trade-off, rather than unqualified superiority.

Overall assessment

The paper contains a promising practical idea and some interesting empirical observations, particularly the finding that low-energy update directions behave differently under large-scale ImageNet adaptation than in standard task-arithmetic settings.

However, I currently see a significant mismatch between the conceptual story and the actual method. Most importantly, the quantity called \(\cos\alpha\) is not an alignment measure in the usual geometric sense; mathematically it is the square root of the residual spectral-energy fraction and is tightly coupled to \(R\). This weakens the claimed bridge from multi-model geometric alignment to single-model MonoSoup. In addition, the proposed mixing equation appears to introduce substantial update shrinkage, but the experiments do not isolate whether this rather than the spectral decomposition accounts for the gains.

The empirical results are encouraging enough that I would not dismiss the method, but stronger ablations and more precise claims are needed before I would be confident that the proposed explanation is correct and the improvements generalize beyond the evaluated settings.

Suggested ICLR ratings

Soundness: 2 / 4 — Fair
The empirical method appears to work, but key parts of its conceptual justification are insufficiently supported and some interpretations appear mathematically questionable.

Presentation: 2 / 4 — Fair
The overall structure is understandable, but there are numerous wording issues, overstatements, and some confusing terminology.

Contribution: 3 / 4 — Good
The single-checkpoint, data-free setting is valuable, and the low-energy observation is interesting. The algorithm itself is relatively simple, however, and its conceptual novelty depends heavily on the currently weak alignment argument.

Overall recommendation: 4 / 10 — Borderline Reject

I would be open to moving toward 5 / 10 (Borderline Accept) if the rebuttal convincingly resolves the interpretation of \(\cos\alpha\), demonstrates that MonoSoup's gains cannot be explained primarily by layer-wise shrinkage, provides aggregate results across the 70 CLIP checkpoints, and clarifies the Qwen results.

Confidence: 4 / 5.