Summary

This paper proposes MonoSoup, a post-hoc method for improving the in-distribution (ID) versus out-of-distribution (OOD) performance trade-off of a fine-tuned model when only a single fine-tuned checkpoint is available.

The paper first studies ModelStock over pairwise combinations of 70 CLIP ViT-B/32 checkpoints and observes that successful weight merging is associated with higher alignment between fine-tuning updates. Motivated by this observation, the authors propose a Similarity-Filtered Greedy Soup and then move to the single-checkpoint setting.

MonoSoup considers the layer-wise fine-tuning update

$$ \Delta W = W_{\mathrm{FT}}-W_0 $$

and decomposes it using SVD into high- and low-energy spectral components. The partition is chosen either using a fixed spectral-energy threshold or automatically through entropy-based effective rank. The two components are then rescaled using coefficients derived from spectral decay and the relative Frobenius energy of the low-energy component.

Experiments are conducted primarily on CLIP/ImageNet with five natural distribution shifts and Qwen3-0.6B reasoning benchmarks, with additional ConvNeXt, cross-lingual/cross-domain, CKA, computational-cost, and LoRA analyses in the appendix. The results suggest that MonoSoup often improves OOD performance while preserving ID performance, despite requiring only one fine-tuned checkpoint.

Strengths
The problem is practically relevant. Model Soups require retaining or training many fine-tuned checkpoints, whereas in many realistic situations only one final checkpoint is available. A data-free post-hoc procedure that operates on that checkpoint is therefore useful.
The method is simple and easy to apply. MonoSoup requires no additional optimization or training data. Conceptually, it consists of computing fine-tuning deltas, performing layer-wise SVD, partitioning their spectrum, and applying adaptive scaling. The automated effective-rank version also avoids validation-based hyperparameter selection.
The CLIP experiments are reasonably extensive. In particular, Figure 4 evaluates MonoSoup over all 70 CLIP ViT-B/32 checkpoints rather than reporting only a few favorable examples. The predominately upward movement in OOD accuracy is convincing evidence that the effect is systematic in this experimental setting.
The gains on poorly generalized checkpoints are substantial. For example, Table 1 reports an increase in average OOD accuracy from 36.71% to 44.21% for the worst-OOD checkpoint with the fixed-\(R\) version, while ID accuracy also improves. These results make the method particularly interesting as a post-hoc recovery procedure.
The paper contains several useful supporting analyses. These include the truncation study in Figure 3, the component ablation in Figure 6, CKA analysis, ConvNeXt experiments, genuine cross-lingual/cross-domain shifts for Qwen, LoRA compatibility, and computational-cost profiling. These substantially strengthen the paper compared with presenting only the main CLIP results.
The comparison against Wise-FT is useful. MonoSoup is not simply presented as replacing interpolation methods; Figure 5 shows that using MonoSoup as the endpoint of Wise-FT can improve the resulting Pareto frontier, suggesting some complementarity.
Weaknesses
1. The connection between the multi-model alignment analysis and MonoSoup is not sufficiently established

The motivation begins with an intuitive observation about alignment between task vectors from different fine-tuned models. However, MonoSoup does not have another task vector against which alignment can be measured.

Instead, Eq. 7 defines

$$ \cos^2\alpha = \frac{\|W_{\mathrm{Low}}\|_F^2}{\|W\|_F^2}. $$

This is simply the fraction of update energy contained in the low-energy component. It is not cosine similarity or geometric alignment between two vectors in the usual sense.

The manuscript subsequently refers to this quantity repeatedly as "alignment", including when motivating Eq. 8. This makes the conceptual bridge from Section 3 to Section 4 less convincing than presented.

I think the paper would be considerably clearer if the authors explicitly distinguished:

inter-model task-vector alignment used in Section 3; and
residual spectral-energy fraction used by MonoSoup.

At present, these appear to be conflated partly through reuse of the notation \(\cos\alpha\).

2. The interpretation of low-energy directions is stronger than the experiments demonstrate

A central claim is that the low-energy directions contain information important for OOD generalization. Figure 3 does provide good evidence that removing these directions harms performance under large-scale ImageNet fine-tuning.

However, this does not necessarily establish that these directions themselves encode robustness-related information.

The CKA evidence in Appendix G has a related issue. The "Low-only" model is

$$ W_0+\Delta W_{\mathrm{Low}}, $$

and \(\Delta W_{\mathrm{Low}}\) has, by definition, substantially lower magnitude than the complete fine-tuning update. Therefore, it is expected to remain closer to the pretrained representation than \(W_0+\Delta W_{\mathrm{High}}\). The higher CKA to the pretrained model could therefore largely follow from the magnitude of the perturbation rather than from a special robustness-preserving semantic role of the low-energy directions.

A norm-matched control would help. For example, compare low-energy directions with randomly selected or high-energy directions rescaled to equal Frobenius norm. This would better establish whether the directions, rather than simply their small magnitude, are responsible for the effect.

3. It is not completely clear how much of the improvement comes from anisotropic spectral editing versus simply shrinking the fine-tuning update toward the pretrained model

Eq. 8 imposes

$$ \lambda_{\mathrm{High}}=1-\lambda_{\mathrm{Low}}. $$

Thus both components are generally attenuated relative to the original fine-tuning update, and depending on the coefficient the resulting model can move considerably back toward the pretrained checkpoint.

Wise-FT is a relevant comparison, but I would still like to see a more controlled ablation answering:

If an isotropic/layer-wise scalar update is chosen to have the same update norm as MonoSoup, how much additional benefit comes specifically from the proposed spectral anisotropy?

The anisotropic coefficients shown in Figure 12 establish that the coefficients vary across subspaces/layers, but they do not by themselves demonstrate that this anisotropy is responsible for the observed performance gain.

A matched-norm scalar interpolation baseline would significantly strengthen this conclusion.

4. Evidence of generality in the language-model setting remains relatively limited

The language experiments are useful, especially Appendix K, but most performance experiments use only Qwen3-0.6B. The 14B Qwen model appears in the computational-cost analysis but not in the main accuracy/generalization evaluation.

Consequently, statements suggesting that the method broadly scales to large language models feel somewhat premature.

Testing at least one meaningfully larger LLM—or preferably more than one architecture/family—would make this claim much more convincing.

5. Statistical reliability is insufficiently reported

Many reported improvements are relatively small on strong checkpoints, e.g. fractions of one percentage point, yet I could not find confidence intervals or variability over evaluation/training seeds for most experiments.

This matters particularly for the Qwen experiments, where only three fine-tuning configurations are shown and some differences between MonoSoup and LiNeS/ModelStock are approximately 0.2–1 point.

For ICML, I would strongly prefer either repeated runs or at least bootstrap/confidence intervals on benchmark scores.

6. The automated effective-rank rule is useful empirically but weakly justified

Entropy-based effective rank is an attractive way to remove the threshold \(R\), but the choice appears mainly heuristic.

The paper gives a mathematical relationship between \(R\) and the residual energy for the threshold-based variant, but this does not provide much justification for why

$$ k=\lceil \mathrm{effective\ rank}\rceil $$

should be the appropriate spectral boundary for maximizing the ID/OOD trade-off.

An analysis comparing effective-rank \(k\) with empirically optimal \(k\) across layers/checkpoints would help demonstrate that this is more than a convenient parameter-free heuristic.

7. Some experimental claims should be stated more precisely

For example, Section 5.2 states that the "largest gains" on GSMPlus and GSM8KPlatinum are +9.2 points each. These numbers appear to refer to improvements relative to the pretrained Qwen3-0.6B reference, rather than the corresponding fine-tuned checkpoint. Against each fine-tuned model, MonoSoup's incremental improvements are considerably smaller.

The result is still useful, but the reference point should be stated explicitly to avoid overstating the post-hoc contribution.

Questions for the Authors
Why is Eq. 7 called an alignment measure? It appears mathematically to be a low-energy Frobenius-energy ratio. What is being aligned with what?
Could the authors provide a norm-matched scalar interpolation baseline? In other words, match the distance \(\|W_{\mathrm{MonoSoup}}-W_0\|_F\) using Wise-FT or layer-wise uniform scaling and compare performance.
For the CKA analysis, could the authors compare the low-energy component against norm-matched random spectral directions? This would help distinguish a directional effect from the trivial effect of a smaller update.
How frequently does entropy-based effective rank select \(k=\operatorname{rank}(W)\)? If this occurs, how is \(\sigma_{k+1}\) in Eq. 6 defined?
Figure 4 is compelling. Could the authors report aggregate statistics over the 70 checkpoints—for example mean/median \(\Delta\)ID, mean/median \(\Delta\)OOD, fraction improved on each metric, and uncertainty—in addition to the visualization?
Can the method be evaluated on a substantially larger LLM? The Qwen3-14B experiment currently demonstrates computational feasibility but not whether the generalization benefits persist at that scale.
Minor Comments

There are several presentation issues worth correcting.

First, the terminology around "alignment", "cosine overlap", and fractional spectral energy should be made consistent. In particular, using \(\cos\alpha\) for Eq. 7 makes the quantity look more geometrical than it actually is.

Second, the manuscript sometimes claims MonoSoup "matches or exceeds multi-model approaches" somewhat broadly. Table 1 shows a more nuanced picture: the automated MonoSoup is excellent given its cost but does not universally dominate Uniform Soup, Greedy Soup, or ModelStock on every ID/OOD comparison.

Third, I would distinguish more carefully between the fixed-\(R\) MonoSoup and the hyperparameter-free MonoSoup throughout. Some of the strongest headline improvements use \(R=0.8\), while the main methodological contribution is framed as hyperparameter-free.

Finally, if this PDF is intended to be the actual anonymized ICML submission, it currently contains author names, affiliations, correspondence information, and even "Proceedings of the 43rd International Conference on Machine Learning" metadata on page 1. This obviously needs to be removed for a double-blind submission.

Overall Assessment

This is an interesting and practically useful paper. The strongest aspect is not necessarily the proposed theoretical story, but the empirical observation that simple spectral manipulation of a single fine-tuning delta can systematically recover OOD performance without data or retraining. The all-70-checkpoint CLIP experiment is particularly compelling.

My main reservation is that the manuscript currently gives a stronger mechanistic interpretation than the evidence establishes. Specifically, the transition from inter-model alignment to intra-model spectral decomposition is somewhat loose, Eq. 7 is presented as "alignment" despite being an energy fraction, and the CKA analysis does not fully separate the semantic role of low-energy directions from the simple fact that they constitute a smaller perturbation of the pretrained model.

These concerns do not invalidate the empirical contribution. With clearer claims and additional matched controls, I would view this as a solid ICML contribution.

Suggested score

Overall rating: 6 / 10 — Weak Accept

The paper is above my acceptance threshold because the method is simple, useful, inexpensive, and supported by fairly extensive vision experiments. I would be more confident at 7 if the authors provided stronger controlled evidence for the proposed mechanism and broader LLM-scale validation.

Confidence: 4 / 5 — High confidence. The method and experiments are generally clear enough to evaluate, although some questions about the interpretation and experimental controls remain.

Soundness: 3 / 4

Presentation: 3 / 4

Contribution / significance: 3 / 4

Novelty: 3 / 4

Reproducibility: 3 / 4

I would not give this a reject primarily because the theoretical explanation is imperfect: the core empirical result is meaningful enough. But as an ICML reviewer, I would make Weaknesses 1–3 the central issues for the rebuttal, because the authors could plausibly address them with clarification and relatively targeted additional experiments.