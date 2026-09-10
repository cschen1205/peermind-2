1. Overall PeerMind architecture

I would design the complete system as:

                         ┌─────────────────────┐
                         │   REVIEW DIRECTOR   │
                         │ Planner / Controller│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  PAPER UNDERSTANDING│
                         │ + Paper Graph       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   REVIEW PLANNER    │
                         │ What should we check│
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Method Reviewer   Experiment      Novelty
                                Reviewer        Reviewer
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                         CANDIDATE FINDINGS
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ EVIDENCE VERIFIER   │
                         │ Is it actually true?│
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
           REFUTED              SUPPORTED              UNCLEAR
              │                     │                     │
              │                     ▼                     ▼
              │           ┌─────────────────────┐    Tool/Search
              │           │  IMPACT VERIFIER    │       │
              │           │ Does it matter?     │◀───────┘
              │           └──────────┬──────────┘
              │                      │
              │          ┌───────────┼───────────┐
              │          ▼           ▼           ▼
              │       HIGH         LOW       UNKNOWN
              │       IMPACT       IMPACT
              │          │           │
              │          │        downgrade
              │          │
              └──────────┼─────────────────────────┐
                         ▼                         │
                 DISAGREEMENT CHECK               │
                         │                         │
                 high disagreement?               │
                         │                         │
                        YES                        │
                         ▼                         │
                       DEBATE                      │
                         │                         │
                         ▼                         ▼
                    META REVIEWER / AREA CHAIR
                         │
                         ▼
                    VERIFIED REVIEW

The key difference is:

Reviewers generate findings. They do not directly generate the final review.

That makes the verification architecture much cleaner.

2. Stage 1 — Paper Understanding

The first stage should build a structured representation before reviewing.

Your current slide already proposes:

sections
claims
methods
tables/figures
appendix
graph record IDs
exact source locations.

I would formalize this as a Paper Graph.

For example:

Paper
 ├── Contribution C1
 │      ├── Claim C12
 │      │     ├── Evidence E07 → Table 2
 │      │     ├── Evidence E09 → Figure 3
 │      │     └── Scope → image classification
 │      │
 │      └── Method M04
 │
 ├── Experiment X1
 │      ├── Dataset D1
 │      ├── Baseline B1
 │      ├── Metric accuracy
 │      └── Result R3
 │
 └── Limitation L2

Each node must point back to the actual paper location:

{
  "id": "C12",
  "type": "claim",
  "text": "...",
  "section": "4.2",
  "page": 6,
  "source_span": "...",
  "related_evidence": ["E07", "E09"]
}

This is important because the reviewer shouldn't need to repeatedly reread the entire PDF.

3. Stage 2 — Review Director

This should be the primary autonomous agent.

Its job is not reviewing.

Its job is deciding:

What kind of paper is this?

What claims are central?

Where are the likely risks?

Which reviewers are needed?

What can be skipped?

What requires external verification?

When is enough evidence collected?

For example:

Detected paper:
Empirical ML + new algorithm

Central claims:
C03 performance improvement
C07 robustness
C12 generalization

Selected reviewers:
✓ Methodology
✓ Experiments
✓ Statistics
✓ Novelty

Skipped:
○ Formal Proof Reviewer
○ Ethics Reviewer

This is much stronger than having seven reviewers run every time.

The hackathon explicitly wants runtime decisions, delegation, verification, uncertainty handling and adaptation rather than a predetermined prompt sequence.

4. Stage 3 — Specialist reviewer pool

Don't define them as a fixed pipeline.

Define a reviewer capability pool:

Contribution Reviewer
Novelty Reviewer
Methodology Reviewer
Theory Reviewer
Experiment Reviewer
Statistics Reviewer
Benchmark Reviewer
Reproducibility Reviewer
Citation Reviewer
Scope Reviewer
Ethics Reviewer
Adversarial Reviewer

The Director dynamically selects a subset.

Each reviewer should output atomic findings, not a full narrative review.

For example:

{
  "finding_id": "F07",
  "type": "weakness",
  "target_claim": "C12",
  "statement":
    "The evidence is insufficient to support broad
     cross-architecture generalization.",

  "severity_proposed": "major",

  "paper_evidence": ["E07", "E11"],

  "missing_evidence":
    "non-Transformer evaluation",

  "falsifier":
    "Evidence of successful evaluation on a substantially
     different architecture would weaken this criticism.",

  "confidence": 0.74
}

The falsifier is worth keeping from your existing architecture. Your slide currently says the reviewer output includes “claim + scope + falsifier.”

That's a very good idea.

5. Stage 4 — Evidence Verifier

This replaces your current generic “defender” concept with a clearer responsibility.

The question is:

Is the review finding factually supported?

It should attempt to disprove the reviewer.

For every finding:

F07:
"No non-Transformer experiment."

Evidence Verifier:

1. Search main text
2. Search tables
3. Search figures
4. Search appendix
5. Search supplementary evidence
6. Resolve terminology aliases

Then:

Evidence found:
Appendix C, Table 9:
ConvNeXt-B experiment

Verdict:
REFUTED

Reason:
The experiment claimed to be missing is present.

This directly solves what your slide calls false accusation—comments saying something is missing when it actually exists.

The Evidence Verifier should use dynamically generated specialists when needed, as your current deck already proposes.

For example:

Finding:
"The experimental pair count is incorrect."

Spawn:
Numerical Checker

Finding:
"Relevant baseline X is omitted."

Spawn:
Source Auditor + Literature Checker

Finding:
"Claim extends beyond demonstrated scope."

Spawn:
Claim Mapper + Scope Assessor
6. Stage 5 — Impact Verifier

Only findings that survive factual verification move here.

This addresses your second failure mode:

The criticism can be true but its importance may be inflated.

The Impact Verifier asks three sequential questions.

A. Scope

Does this criticism attack what the paper actually claims?

Example:

Paper:
"We demonstrate the method on image classification."

Reviewer:
"No NLP experiments."

Observation:
True.

Scope relevance:
Low.

Result:
Valid suggestion,
not a major weakness.
B. Necessity

Would the requested evidence actually be necessary to justify the claim?

Example:

Claim:
Method consistently improves ImageNet models.

Existing:
5 architectures
3 random seeds
2 model sizes

Reviewer:
"You should add CIFAR-10."

Question:
Is CIFAR-10 required for the stated ImageNet claim?

No.

→ low impact.
C. Sensitivity

Would changing or repairing this issue materially affect:

claim support?
scientific conclusion?
review recommendation?

This is where counterfactual reasoning can optionally be used.

So:

Impact Verifier
   ├── scope test
   ├── necessity test
   └── sensitivity test
          └── counterfactual analysis
              when identifiable

Not every finding needs it.

7. Where counterfactual reasoning now fits

Counterfactual analysis should be a tool, not an agent/stage.

For example:

Finding:
"Removing experiment X would leave insufficient evidence."

Counterfactual tool:
Hide X → reassess claim support.

Original support:
0.84

Without X:
0.47

Result:
HIGH sensitivity.

Or:

Finding:
"Missing ablation makes the central mechanism unsupported."

Counterfactual:
Suppose module B had no effect.

Would the mechanism claim still stand?

→ No.

Finding impact:
HIGH

But if no meaningful intervention can be constructed:

Counterfactual:
NOT IDENTIFIABLE

Reason:
Requires unobserved real-world experiment.

→ Impact remains uncertain.

That is technically much more defensible.

8. Stage 6 — Evidence Ledger

This should become the core shared memory/state of PeerMind.

I would make every finding one ledger record:

{
  "finding_id": "F07",

  "reviewer": "ExperimentReviewer",

  "critique":
    "Cross-architecture generalization is insufficiently supported.",

  "target_claim": "C12",

  "proposed_severity": "major",

  "evidence_for": [
    "Only Transformer models in Table 2"
  ],

  "counter_evidence": [
    "ConvNeXt result in Appendix C"
  ],

  "evidence_verdict": "partially_supported",

  "scope_relevance": "high",

  "impact": "moderate",

  "verification_tools": [
    "paper_graph_search",
    "source_auditor"
  ],

  "counterfactual_test": null,

  "final_severity": "minor",

  "confidence": 0.88,

  "limitations": []
}

This is very close to what your current deck already calls a reusable “typed record: claim, evidence, counter-evidence, intervention and verdict.”

I would keep that. It is arguably one of the strongest reusable assets in the whole project.

9. Stage 7 — Verification routing

Do not verify every critique in exactly the same way.

Use a finding classifier:

Candidate finding
       │
       ▼
What type is it?
       │
       ├── Missing content
       │      → Source Auditor
       │
       ├── Numerical error
       │      → Numerical Checker
       │
       ├── Novelty claim
       │      → Literature Search
       │
       ├── Statistics
       │      → Statistical Checker
       │
       ├── Scope/generalization
       │      → Claim Mapper + Scope Assessor
       │
       ├── Reproducibility
       │      → Method Completeness Checker
       │
       └── Importance/severity
              → Impact Verifier

This preserves the good idea from the current defender stage: specialists are generated from the critique rather than fixed ahead of time.

10. Stage 8 — Disagreement detection

After verification, compare reviewers.

Suppose:

Novelty Reviewer:
Major weakness

Method Reviewer:
Minor issue

Evidence Verifier:
Supported

Impact Verifier:
Moderate impact

Calculate:

finding disagreement = HIGH

Then the Director decides whether it matters enough to investigate further.

Don't debate everything.

Use:

if severity >= major
and disagreement >= threshold:
    debate()
11. Stage 9 — Debate / adversarial review

The debate should operate around one finding, not the whole paper.

Example:

Finding F12:
"Contribution is incremental."

Novelty Reviewer:
supports

Author/Defender:
challenges

Literature Agent:
retrieves nearest related work

Novelty Reviewer:
revises

Judge:
PARTIALLY SUPPORTED

This keeps debate focused and cheap.

12. Stage 10 — Review quality controller

Before generating the final review, run a deterministic/LLM hybrid quality check.

For every major weakness require:

✓ target paper claim
✓ exact evidence
✓ verification status
✓ relevance
✓ confidence
✓ severity justification

If any major comment is:

unsupported
low confidence
unverified external assertion

the Director can:

SEARCH
VERIFY
DOWNGRADE
ABSTAIN

rather than letting it through.

13. Stage 11 — Meta Reviewer

The Meta Reviewer receives only the verified ledger, not raw reviewer prose.

Input:

paper summary
+
central claims
+
verified strengths
+
verified weaknesses
+
uncertainties
+
reviewer disagreements
+
impact estimates

Then produces a conference-specific review.

If the user chooses:

ICLR
ICML
NeurIPS
ACL
AAAI
...

the output schema adapts.

For example:

Summary

Strengths

Weaknesses

Questions

Soundness
Presentation
Contribution

Recommendation
Confidence

This also fits well with your current demo idea of letting the user select the target conference.

14. Final finding statuses

I would not use only “verified/refuted.”

Use something like:

VERIFIED — HIGH IMPACT
VERIFIED — MODERATE IMPACT
VERIFIED — LOW IMPACT

PARTIALLY SUPPORTED

REFUTED

UNVERIFIABLE

OPEN QUESTION

And optionally:

SEVERITY DOWNGRADED

For the UI:

F07
Cross-architecture evaluation is missing

Evidence       ✓ Verified
Scope          ✓ Relevant
Impact         Low
Reviewer said  MAJOR
PeerMind       MINOR

Status:
SEVERITY DOWNGRADED

This is much more interesting than a binary verifier.

15. The complete autonomous workflow

I would put this exact flow in the architecture slide:

                         PAPER
                           │
                           ▼
                ① UNDERSTAND & MODEL
                     Paper Graph
                           │
                           ▼
                    ② PLAN REVIEW
                    Review Director
                           │
                     dynamic routing
                           │
               ┌───────────┼───────────┐
               ▼           ▼           ▼
           Method       Experiment    Novelty
           Reviewer      Reviewer     Reviewer
               └───────────┼───────────┘
                           │
                           ▼
                 ③ GENERATE FINDINGS
                   Atomic critiques
                           │
                           ▼
                 ④ VERIFY EVIDENCE
                   "Is it true?"
                           │
                  ┌────────┴────────┐
                false              true
                  │                 │
               REFUTE              ▼
                           ⑤ VERIFY IMPACT
                           "Does it matter?"
                                  │
                       scope / necessity /
                          sensitivity
                                  │
                   optional counterfactual
                                  │
                                  ▼
                         ⑥ RECONCILE
                    Evidence Ledger
                                  │
                                  ▼
                        ⑦ REFLECT
            coverage / confidence / disagreement
                                  │
                    ┌─────────────┴────────────┐
                    │                          │
               insufficient                  enough
                    │                          │
                    ▼                          ▼
          search / spawn / debate        ⑧ SYNTHESIZE
                    │                     Meta Reviewer
                    └──────────↺               │
                                               ▼
                                      VERIFIED REVIEW
16. The autonomous loop

Underneath this architecture, the Director is continually doing:

OBSERVE
   ↓
ASSESS
   ↓
DECIDE
   ↓
DELEGATE
   ↓
VERIFY
   ↓
REFLECT
   ↓
REPLAN
   ↺

Possible Director actions:

RUN_REVIEWER
RUN_VERIFIER
CALL_TOOL
SEARCH_PAPER
SEARCH_LITERATURE
SPAWN_SPECIALIST
START_DEBATE
DOWNGRADE_FINDING
ABSTAIN
SYNTHESIZE
STOP

That's your actual autonomous agent.

17. What makes PeerMind different

I would simplify your contribution story to three innovations.

1. Paper Graph

The reviewer reasons over source-linked paper claims/evidence rather than unstructured PDF text.

2. Critique Verification

Every important AI-generated criticism is challenged before inclusion:

Is it true?
Does it apply?
Does it matter?
3. Adaptive Review Orchestration

PeerMind dynamically decides:

who should review
what to verify
when to search
when to debate
when to stop

This maps very naturally to the hackathon's definition of meaningful agentic behavior.

18. I would also change the term “Defender”

I actually think you can improve the naming.

Instead of:

MAS Reviewer
Evidence-based MAS Defender
Counterfactual Defender

I would use:

Review Director
Reviewer Network
Verification Network
Meta Reviewer

Within Verification Network:

Evidence Verifier
Source Auditor
Numerical Checker
Scope Assessor
Impact Assessor
Literature Verifier
Counterfactual Sensitivity Tool

Because Defender sounds like the system always tries to defend the authors.

What you actually want is:

an adversarial verifier that can either defend the paper or defend the reviewer, depending on the evidence.

“Verifier” is more neutral.

19. What the user sees in the demo

For tomorrow, your UI could visualize this as five stages:

UNDERSTAND
   34 claims
   61 evidence links

      ↓

PLAN
   Empirical ML paper
   4 reviewers selected

      ↓

REVIEW
   16 candidate findings

      ↓

VERIFY
   9 supported
   3 downgraded
   2 refuted
   2 uncertain

      ↓

SYNTHESIZE
   Weak Accept
   Confidence 0.82

Clicking a finding shows:

AI Reviewer Finding
────────────────────────────────────
"Non-Transformer evaluation is missing"

Reviewer:
Experiment Reviewer

Proposed severity:
MAJOR


EVIDENCE VERIFICATION
────────────────────────────────────
Appendix C → ConvNeXt experiment found

Evidence verdict:
PARTIALLY REFUTED


IMPACT VERIFICATION
────────────────────────────────────
Central claim:
Architecture-independent effectiveness

Scope relevance:
HIGH

Remaining concern:
Only one non-Transformer architecture

Impact:
MODERATE


FINAL PEERMIND VERDICT
────────────────────────────────────
Original: MAJOR
Final:    MINOR

Reason:
The criticism identifies a real limitation,
but the original reviewer overlooked relevant
counter-evidence and overstated its severity.

That is a very convincing demo.

Final architecture in one sentence

I would describe PeerMind as:

An autonomous peer-review system that builds a source-linked model of a paper, dynamically assigns specialist reviewers, treats their critiques as hypotheses rather than facts, verifies both their evidential support and scientific impact, and iteratively investigates disagreements before producing a calibrated meta-review.

And the most memorable three questions in the entire system should be:

Is the critique true?
Does it apply?
Does it matter?

That is, in my view, a much stronger and cleaner PeerMind design than the current “MAS reviewer → evidence defender → counterfactual defender” pipeline.