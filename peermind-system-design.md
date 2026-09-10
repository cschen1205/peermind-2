# PeerMind: Verifiable AI Peer Review System
## Design Specification for CFAR Agentic AI Hackathon P2

**Project:** PeerMind  
**Track:** P2 — Scientific Paper Critic and Reviewer Agent  
**Purpose:** Build an autonomous, evidence-driven AI peer-review system that generates review findings, actively stress-tests them, verifies their scientific support, calibrates their impact, and produces a traceable final review.

---

## 1. Problem Statement

Current AI peer reviewers can generate fluent and plausible comments, but the author still has to manually verify whether those comments are correct, relevant, and important.

PeerMind focuses on two common failure modes:

### 1.1 False Accusation
The reviewer claims that something is missing, incorrect, unsupported, or inconsistent, but the paper actually contains the relevant evidence.

Examples:
- “No ablation study is provided,” while the ablation exists in the appendix.
- “The paper does not evaluate on a non-Transformer model,” while a ConvNeXt result is present.
- “The pair count is 2,409,” while deterministic recomputation gives 2,415.

### 1.2 Importance Inflation
The reviewer identifies a real limitation but overstates its importance.

Examples:
- A missing experiment is described as a “major validity problem” even though the paper’s stated claim does not require that experiment.
- A useful additional metric is treated as mandatory.
- A scope limitation is incorrectly described as invalidating the main contribution.

PeerMind therefore separates two questions:

1. **Is the critique true?**
2. **Does the critique matter?**

The system does not trust a review finding simply because another LLM generated it.

---

## 2. Core Design Principle

> **Every important review finding is treated as a falsifiable hypothesis rather than a final judgment.**

A finding must survive:
- source inspection,
- evidence and counter-evidence search,
- deterministic checks where available,
- external literature/reference verification where needed,
- claim-scope analysis,
- impact calibration,
- disagreement resolution,
- final meta-review synthesis.

The core loop is:

```text
Understand
→ Plan
→ Review
→ Verify
→ Stress-test
→ Reflect
→ Re-plan
→ Synthesize
```

---

## 3. High-Level Architecture

```text
                           PAPER
                             │
                             ▼
                 ┌──────────────────────┐
                 │ 1. Paper Understanding│
                 │ + Source-linked Graph │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ 2. Review Director   │
                 │ Planner / Controller │
                 └──────────┬───────────┘
                            │
                     Dynamic Routing
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
       Contribution      Theory          Scope
        Reviewer        Reviewer        Reviewer
             └──────────────┼──────────────┘
                            │
                            ▼
                    Candidate Findings
                            │
                            ▼
                 ┌──────────────────────┐
                 │ 3. Verification      │
                 │ Network              │
                 └──────────┬───────────┘
                            │
           ┌────────────────┼───────────────────┐
           ▼                ▼                   ▼
      Source Audit      Numerical Audit     Literature /
                                            Reference Audit
           │                │                   │
           └────────────────┼───────────────────┘
                            │
                            ▼
                      Evidence Ledger
                            │
                            ▼
                 ┌──────────────────────┐
                 │ 4. Impact Verification│
                 │ Scope / Necessity /  │
                 │ Sensitivity          │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ 5. Reflection        │
                 │ Coverage / Confidence│
                 │ Disagreement         │
                 └──────────┬───────────┘
                            │
                 if unresolved / high impact
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
         More tools                  Focused Debate
              │                           │
              └─────────────┬─────────────┘
                            ▼
                 ┌──────────────────────┐
                 │ 6. Meta Reviewer     │
                 │ Final calibrated     │
                 │ conference review    │
                 └──────────────────────┘
```

---

## 4. Component 1 — Paper Understanding

The system should not immediately ask multiple agents to review the raw PDF.

It first converts the manuscript into a source-linked structured representation.

### 4.1 Extracted Elements

```text
Paper
├── Metadata
├── Abstract
├── Sections
├── Contributions
├── Claims
├── Methods
├── Assumptions
├── Equations
├── Experiments
├── Datasets
├── Baselines
├── Metrics
├── Results
├── Tables
├── Figures
├── Limitations
├── Appendix
└── References
```

### 4.2 Source-Linked Paper Graph

Example:

```text
Contribution C01
   │
   ├── Claim C12
   │      ├── supported_by → Result R08
   │      ├── supported_by → Table T03
   │      ├── supported_by → Figure F02
   │      └── scope → image classification
   │
   └── Method M04
          └── derived_from → Eq. 7
```

Every graph node must point back to an exact source location.

Example record:

```json
{
  "id": "C12",
  "type": "claim",
  "text": "The method generalizes across model families.",
  "section": "4.2",
  "page": 6,
  "source_span": "exact paragraph span",
  "related_evidence": ["R08", "T03", "F02"],
  "scope": ["image classification", "evaluated architectures"]
}
```

### 4.3 Why the Paper Graph Matters

- Avoids repeatedly searching the full PDF.
- Provides exact provenance for review comments.
- Supports claim-evidence traversal.
- Enables structured source auditing.
- Makes disagreements inspectable.
- Supports graph visualization in the demo.

---

## 5. Component 2 — Review Director

The Review Director is the primary autonomous agent.

Its job is not to directly review the paper. It decides:
- what type of paper this is,
- which claims are central,
- which specialist reviewers are needed,
- what verification burden applies,
- what tools should be invoked,
- when to investigate further,
- when to stop.

### 5.1 Review Director Inputs

```text
Paper Graph
Conference / review style
Central claims
Detected paper type
Available reviewer capabilities
Available verification tools
Current evidence ledger
Current uncertainty
Current review coverage
Compute / time budget
```

### 5.2 Review Director Actions

```text
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
```

### 5.3 Example Dynamic Routing

For an empirical ML paper:

```text
Detected:
- new algorithm
- empirical claims
- coefficient derivation
- no theorem-level guarantee

Selected:
✓ Contribution Reviewer
✓ Theory Reviewer
✓ Scope Reviewer

Verification capabilities available:
✓ Source Auditor
✓ Numerical Auditor
✓ Literature / Reference Auditor

Skipped:
○ Formal Proof Verifier
  Reason: no theorem-level guarantee detected
```

This explicit “skip” behavior is important because it demonstrates that PeerMind is not a fixed prompt chain.

---

## 6. Component 3 — Reviewer Network

Reviewer agents generate **candidate findings**, not final prose reviews.

### 6.1 Recommended Reviewer Set for the Demo

#### Contribution Reviewer
Separates:
- setting novelty,
- problem novelty,
- mechanism / primitive novelty,
- empirical novelty.

Checks whether the claimed contribution is genuinely new or mainly a new combination/application.

#### Theory Reviewer
Checks:
- whether derivations support the claimed interpretation,
- whether assumptions are sufficient,
- whether named quantities match their definitions,
- whether the narrative overclaims what follows from the equations.

#### Scope Reviewer
Checks:
- whether evaluation evidence supports the stated scope,
- whether a generalization claim is broader than the tested conditions,
- whether limitations are correctly framed,
- whether requested additions are actually necessary for the stated claim.

### 6.2 Candidate Finding Schema

```json
{
  "finding_id": "F07",
  "reviewer": "ScopeReviewer",
  "type": "weakness",
  "target_claim": "C12",
  "statement": "Evidence is insufficient to support broad cross-architecture generalization.",
  "proposed_severity": "major",
  "paper_evidence": ["T03", "R08"],
  "counter_evidence_known": [],
  "missing_evidence": "additional non-Transformer evaluation",
  "scope": "cross-architecture generalization",
  "falsifier": "Evidence from a substantially different architecture would weaken this critique.",
  "confidence": 0.74
}
```

### 6.3 Important Rule

Reviewers should not directly write the final review.

They produce structured atomic findings that can be independently verified.

---

## 7. Component 4 — Verification Network

### 7.1 Defender vs Verification

**Verification** is the overall process.

**Defender** is an adversarial strategy inside verification.

The defender tries to prove the reviewer wrong or overstated by searching for counter-evidence.

The verification system remains neutral and can conclude:
- the reviewer is correct,
- the reviewer is wrong,
- the reviewer is partially correct,
- the evidence is insufficient.

### 7.2 Verification Philosophy

Use this hierarchy:

```text
1. Deterministic tool if possible
2. Source retrieval if possible
3. Cross-document comparison if possible
4. LLM interpretation only where judgment is required
5. Abstain when evidence is insufficient
```

The LLM is used mainly for:
- critique interpretation,
- planning,
- tool selection,
- semantic comparison,
- synthesis.

It should not be the sole source of truth when a check can be grounded in data or tools.

---

## 8. Verification Planner

Each finding is first converted into a verification contract.

### 8.1 Verification Contract

```json
{
  "finding_id": "F07",
  "allegation": "No non-Transformer evaluation is provided.",
  "target_claim": "C12",
  "verification_question": "Does the manuscript contain a non-Transformer evaluation relevant to C12?",
  "evidence_burden": "Find any qualifying experiment in main text, appendix, figures, or supplement.",
  "falsifier": "A relevant ConvNet / non-Transformer experiment exists.",
  "preferred_tools": [
    "paper_graph_search",
    "source_auditor"
  ],
  "stop_rule": "Stop when qualifying evidence is found or all relevant paper regions have been exhausted."
}
```

### 8.2 Critique-Type to Tool Routing

| Critique Type | Preferred Verification |
|---|---|
| “X is missing” | Source Auditor |
| “Not novel” | Literature / Reference Auditor |
| “Prior work already did X” | Reference-paper inspection |
| “Number is wrong” | Numerical Auditor |
| “Not significant” | Statistical checker |
| “Claim too broad” | Claim–Evidence Coverage + Scope Reviewer |
| “Theory is inconsistent” | Theory + symbolic/numerical check |
| “Theorem is invalid” | Formal Proof Verifier |
| “Not reproducible” | Method completeness audit |
| “Needs experiment X” | Scope + necessity + impact analysis |

---

## 9. Verification Capability A — Source Auditor

The Source Auditor checks the manuscript before accepting absence claims.

### 9.1 Search Targets

```text
Main text
Appendix
Supplementary sections
Tables
Figures
Captions
Footnotes
Method variants
Aliases / synonyms
Cross-references
```

### 9.2 Example

Candidate critique:

```text
"No ablation study is provided."
```

Source Auditor:

```text
Search:
- "ablation"
- component names
- table captions
- appendix headings

Found:
Appendix C.2
Table 7
Rows 3–6
```

Result:

```text
Verdict: REFUTED
Reason: The claimed missing ablation is present.
```

---

## 10. Verification Capability B — Numerical Auditor

The Numerical Auditor recomputes deterministic quantities and cross-checks narrative statements against tables.

### 10.1 Supported Checks

- arithmetic,
- combinatorics,
- percentage improvement,
- means,
- standard deviations,
- table-cell consistency,
- ranking consistency,
- equation substitution,
- metric consistency,
- basic statistical calculations where raw values are available.

### 10.2 Example

Paper says:

```text
70 items generate 2,409 pairs.
```

Numerical check:

```text
70 × 69 / 2 = 2,415
```

Verdict:

```text
VERIFIED REVIEW FINDING
The numerical inconsistency is real.
```

---

## 11. Verification Capability C — Literature / Reference Auditor

This is critical because novelty cannot be verified from the target paper alone.

### 11.1 Two Search Modes

#### A. Citation-Grounded Audit
Inspect papers already cited by the manuscript.

Questions:
- Did the reviewer mischaracterize cited work?
- Does cited work really contain the alleged method/result?
- Is the cited prior work in the same setting?

#### B. Open-World Related-Paper Search
Search external literature when a serious novelty or missing-baseline concern remains unresolved.

Possible workflow:

```text
Extract contribution claim
→ Generate semantic queries
→ Retrieve nearest papers
→ Expand citation graph
→ Inspect top related papers
→ Compare mechanisms / settings / assumptions
→ Produce evidence table
```

### 11.2 Example

Reviewer:

```text
"The method is not novel because prior work already uses adaptive weighting."
```

Literature audit:

```text
Prior Paper A:
static coefficient

Prior Paper B:
adaptive coefficient based on entropy

Submitted Paper:
adaptive coefficient derived from rank statistic
```

Calibrated verdict:

```text
PARTIALLY SUPPORTED

The general idea of adaptive weighting is not new,
but the rank-derived mechanism appears distinct.

Recommended rewrite:
"Narrow the novelty claim to the specific rank-derived weighting mechanism."
```

---

## 12. Verification Capability D — Formal Proof Verifier

This capability is optional and should be invoked only when the paper makes theorem-level guarantees.

Possible checks:
- theorem statement consistency,
- assumptions vs proof dependencies,
- symbolic algebra,
- proof step verification,
- formal proof tools if available.

Demo behavior:

```text
Formal Proof Verifier · SKIPPED
Reason:
No theorem-level guarantee detected.
```

The skipped state itself demonstrates dynamic agent routing.

---

## 13. Evidence Ledger

The Evidence Ledger is the shared state of PeerMind.

One record is maintained per finding.

### 13.1 Ledger Record

```json
{
  "finding_id": "F07",
  "reviewer": "ScopeReviewer",
  "critique": "Cross-architecture generalization is insufficiently supported.",
  "target_claim": "C12",

  "proposed_severity": "major",

  "evidence_for": [
    "Main experiments are predominantly Transformer-based."
  ],

  "counter_evidence": [
    "ConvNeXt result appears in Appendix C."
  ],

  "source_provenance": [
    "Section 4.2",
    "Appendix C",
    "Table 9"
  ],

  "verification_tools": [
    "paper_graph_search",
    "source_auditor"
  ],

  "evidence_verdict": "partially_supported",

  "scope_relevance": "high",
  "impact": "moderate",

  "counterfactual_test": null,

  "final_severity": "minor",
  "confidence": 0.88,

  "status": "DOWNGRADED",

  "limitations": []
}
```

### 13.2 Final Finding Statuses

```text
VERIFIED — HIGH IMPACT
VERIFIED — MODERATE IMPACT
VERIFIED — LOW IMPACT
PARTIALLY SUPPORTED
REFUTED
UNVERIFIABLE
OPEN QUESTION
SEVERITY DOWNGRADED
```

---

## 14. Component 5 — Impact Verification

Evidence verification asks:

> **Is the critique true?**

Impact verification asks:

> **Does the critique matter?**

This is how PeerMind addresses importance inflation.

### 14.1 Impact Verification Dimensions

#### A. Scope Relevance

Does the critique apply to the claim the authors actually make?

Example:

```text
Paper claim:
"Effective on image classification."

Reviewer:
"No NLP experiments."

Observation:
True.

Scope relevance:
Low.

Final:
Optional extension, not a major weakness.
```

#### B. Necessity

Is the requested evidence necessary for evaluating the stated claim?

Example:

```text
Claim:
"Improves ImageNet classification."

Existing:
5 architectures
3 seeds
2 model sizes

Reviewer:
"Needs CIFAR-10."

Necessity:
Low for the stated claim.
```

#### C. Sensitivity

Would fixing or violating the issue materially change:
- support for the target claim,
- the scientific conclusion,
- the recommendation?

### 14.2 Counterfactual Reasoning

Counterfactual analysis is a **tool within impact verification**, not the overall verification method.

Use it only when a meaningful intervention can be defined.

Example:

```text
Current:
Claim support = strong

Intervention:
Remove the only non-Transformer experiment

Re-evaluate:
Claim support drops from strong → weak

Result:
High sensitivity
```

If the required counterfactual depends on an unobserved experiment whose outcome is unknowable:

```text
COUNTERFACTUAL TEST: NOT IDENTIFIABLE
Reason:
Requires an unobserved real-world experimental outcome.

Final:
Keep finding uncertain or request clarification.
```

---

## 15. Claim–Evidence Coverage Analysis

PeerMind can quantify how strongly a claim is already supported.

Example:

```text
Claim C12
├── Dataset A
├── Dataset B
├── Transformer A
├── Transformer B
├── ConvNeXt
├── Metric 1
└── Metric 2
```

The system can summarize:

```text
Independent datasets: 2
Architecture families: 2
Metrics: 2
Supporting result records: 7
```

This does not mechanically decide correctness, but it gives the Impact Verifier structured evidence about coverage, redundancy, and scope.

---

## 16. Disagreement Detection

Reviewer findings and verifier judgments may conflict.

Example:

```text
Contribution Reviewer:
Major novelty concern

Scope Reviewer:
Minor concern

Literature Auditor:
Partially supported

Evidence confidence:
0.62
```

The Director calculates that this is:
- high severity,
- high disagreement,
- incomplete evidence.

It can then decide to:
- search more literature,
- spawn another specialist,
- run focused debate,
- mark unresolved.

---

## 17. Focused Debate

Do not debate the whole paper.

Debate only unresolved high-impact findings.

Example:

```text
Finding F12:
"Contribution is incremental."

Round 1:
Contribution Reviewer argues for the finding.

Counter-position:
Verification agent presents differentiating evidence.

Literature Auditor:
provides nearest related work.

Round 2:
Agents respond to the concrete evidence.

Judge / Director:
SUPPORTED / PARTIAL / REFUTED / UNRESOLVED
```

Debate is therefore a conditional mechanism, not a fixed stage.

---

## 18. Reflection and Re-Planning

The system periodically inspects its own state.

### 18.1 Reflection State

```text
Paper understanding        COMPLETE
Contribution review        COMPLETE
Theory review              COMPLETE
Scope review               COMPLETE
Source verification        COMPLETE
Numerical verification     COMPLETE
Novelty verification       UNCERTAIN
Disagreement               HIGH
Evidence coverage          INCOMPLETE
```

### 18.2 Possible Response

```text
Critical unresolved issue:
Novelty of coefficient mechanism.

Decision:
→ run external related-paper search
→ inspect top 5 nearest papers
→ re-run contribution assessment
```

This makes the workflow autonomous rather than a predefined chain.

---

## 19. Review Calibration

After verification, findings should be rewritten into useful reviewer comments.

Do not call this “humanization.”

Use:

> **Review Calibration** or **Constructive Rewrite**

### 19.1 Calibration Inputs

```text
Original critique
Verified facts
Counter-evidence
Target claim
Scope
Impact
Severity
Confidence
Uncertainty
Recommended author action
```

### 19.2 Calibration Rules

```text
Never say "missing" if evidence exists.

Never say "invalidates" unless impact is high.

Use qualified language when evidence is partial.

Mention material counter-evidence.

Distinguish:
- required correction,
- important additional evidence,
- optional suggestion.

Provide actionable author guidance.

Do not introduce new unverified criticisms.
```

### 19.3 Example

Before:

```text
"The lack of non-Transformer experiments is a major weakness
that significantly undermines generalization."
```

After verification:

```text
"The ConvNeXt result in Appendix C provides some evidence beyond
Transformer architectures. Additional architectural diversity would
strengthen the generality claim, but I would treat this primarily as
a scope limitation rather than a major validity concern."
```

---

## 20. Meta Reviewer

The Meta Reviewer receives the verified ledger rather than raw reviewer prose.

### 20.1 Inputs

```text
Paper summary
Paper graph
Central claims
Verified strengths
Verified weaknesses
Refuted findings
Unresolved findings
Impact estimates
Disagreements
Confidence
Conference review schema
```

### 20.2 Outputs

Conference-specific final review, for example:

```text
Summary

Strengths

Major Weaknesses

Minor Weaknesses

Questions for Authors

Evidence / Verification Notes

Recommendation

Confidence
```

The UI may allow the user to select:
- ICLR,
- ICML,
- NeurIPS,
- ACL,
- AAAI,
- Generic scientific review.

---

## 21. End-to-End Workflow

```text
① INGEST
Paper + conference

        ↓

② UNDERSTAND
Parse manuscript
Extract structure
Build Paper Graph

        ↓

③ PLAN
Review Director identifies:
- paper type
- central claims
- required reviewers
- required verification capabilities

        ↓

④ REVIEW
Selected reviewers generate atomic candidate findings

        ↓

⑤ INTERPRET FINDINGS
Convert each critique into:
- allegation
- target claim
- evidence burden
- falsifier
- verification plan

        ↓

⑥ VERIFY EVIDENCE
Use:
- source search
- appendix search
- numerical checks
- literature/reference inspection
- other scientific tools

        ↓

⑦ BUILD EVIDENCE LEDGER
Record:
- evidence for
- counter-evidence
- tool provenance
- verdict
- uncertainty

        ↓

⑧ VERIFY IMPACT
Check:
- scope
- necessity
- sensitivity
- optional counterfactual tests

        ↓

⑨ REFLECT
Check:
- coverage
- uncertainty
- disagreement
- unresolved major findings

        ↓

⑩ RE-PLAN IF NEEDED
Search more
Spawn another verifier
Run focused debate
Abstain

        ↺

⑪ CALIBRATE FINDINGS
Rewrite verified findings constructively

        ↓

⑫ META REVIEW
Produce final conference-style review
```

---

## 22. What Makes PeerMind Different

PeerMind should not be presented as:

```text
"Many reviewer agents"
```

because specialist reviewer ensembles already exist.

The novelty should be framed around what happens **after** a critique is generated.

### Contribution 1 — Critique-as-Hypothesis Verification

Every important review comment is treated as a falsifiable hypothesis.

```text
Reviewer finding
→ Evidence for
→ Counter-evidence
→ Verification
→ Verdict
```

### Contribution 2 — Finding-Specific Verification Routing

Different criticisms require different verification contracts and tools.

```text
Missing content
→ Source Auditor

Novelty
→ Literature Auditor

Numerical inconsistency
→ Numerical Auditor

Scope problem
→ Scope / Coverage Analysis

Formal guarantee
→ Proof Verifier
```

The system dynamically invokes only the required capabilities.

### Contribution 3 — Truth–Impact Decomposition

PeerMind explicitly separates:

```text
Is the critique true?
        ↓
Does the critique matter?
```

This allows a comment to be:
- refuted,
- supported,
- partially supported,
- downgraded,
- marked uncertain.

### Contribution 4 — Executable Verification Tasks

A strong one-line technical framing:

> **PeerMind turns each AI-generated critique into an executable verification task.**

Instead of an LLM simply judging another LLM, the system determines:
- what evidence would support the critique,
- what evidence could falsify it,
- which tools to call,
- when enough evidence has been collected.

---

## 23. Recommended Demo Reviewer / Verifier Set

### Review Generation

```text
✓ Contribution Reviewer
✓ Theory Reviewer
✓ Scope Reviewer
```

### Verification Capabilities

```text
✓ Source Auditor
✓ Numerical Auditor
✓ Literature / Reference Auditor

○ Formal Proof Verifier
  Skipped — no theorem-level guarantee detected

○ Statistical Auditor
  Invoke only when a finding requires statistical recomputation
```

This is preferable to running many generic agents.

The demo should explicitly show both:
- dynamically selected capabilities,
- capabilities intentionally skipped.

---

## 24. Recommended Demo Story

A strong demo should show one finding from generation to final adjudication.

### Example A — False Accusation

```text
Reviewer:
"No non-Transformer experiment is provided."

↓ Verification Planner

Source Auditor:
Searches main text, appendix, tables, figures

↓ Found

Appendix C
ConvNeXt experiment

↓ Verdict

REFUTED / PARTIALLY REFUTED
```

### Example B — Numerical Error

```text
Paper:
"70 objects create 2,409 pairs."

↓ Numerical Auditor

70 × 69 / 2 = 2,415

↓ Verdict

REVIEW FINDING VERIFIED
```

### Example C — Novelty Claim

```text
Contribution Reviewer:
"The adaptive coefficient is not novel."

↓ Literature Auditor

Search cited work
Search nearest related papers

↓ Comparison

Prior work:
adaptive weighting based on entropy

Current paper:
rank-derived adaptive coefficient

↓ Verdict

PARTIALLY SUPPORTED

↓ Calibrated Comment

"The broader adaptive-weighting idea is established,
while the specific rank-derived coefficient appears distinct.
The novelty claim should therefore be narrowed."
```

---

## 25. Recommended UI Flow

```text
UPLOAD
  ↓
UNDERSTAND
  ↓
PLAN
  ↓
REVIEW
  ↓
VERIFY
  ↓
SYNTHESIZE
```

### Understand

Show:
- paper structure,
- claim-evidence graph,
- number of claims,
- methods,
- experiments,
- evidence links.

### Plan

Show:

```text
Paper type:
Empirical ML

Selected:
✓ Contribution Reviewer
✓ Theory Reviewer
✓ Scope Reviewer

Skipped:
○ Formal Proof Verifier
  No theorem-level guarantees
```

### Review

Show reviewer cards with atomic findings.

### Verify

For each finding:

```text
Finding F07

Original severity      MAJOR
Evidence               PARTIAL
Counter-evidence       FOUND
Scope relevance        HIGH
Impact                 MODERATE

Tools used
✓ Paper Graph Search
✓ Source Auditor
✓ Literature Auditor

Final status
SEVERITY DOWNGRADED

Final severity
MINOR
```

### Synthesize

Show:
- final review,
- score,
- confidence,
- verified vs refuted findings,
- expandable evidence trail.

---

## 26. System-Level Design Rules

### Rule 1
A reviewer finding is never assumed correct by default.

### Rule 2
Use deterministic verification whenever possible.

### Rule 3
Absence claims require exhaustive relevant source search.

### Rule 4
External novelty claims require literature/reference inspection.

### Rule 5
Truth and impact must be evaluated separately.

### Rule 6
Do not invoke every agent for every paper.

### Rule 7
High-impact unresolved disagreement triggers additional investigation.

### Rule 8
Unverifiable findings should be marked uncertain rather than fabricated.

### Rule 9
Final comments must preserve provenance.

### Rule 10
The final Meta Reviewer should consume verified findings, not raw reviewer prose.

---

## 27. Minimal Hackathon Implementation

For the prototype, not every component has to be fully production-ready.

### Must Work

```text
Paper parsing
Paper graph / structured evidence representation
Review Director routing
3 reviewer agents
Source Auditor
Numerical Auditor
Evidence Ledger
Final calibrated review
```

### Can Be Simplified / Simulated

```text
Large-scale literature search
Formal theorem proving
Complex statistics
Multi-round debate
Full citation graph traversal
```

### Best Visible Tool Executions

Show at least:

1. **Source / appendix audit**
2. **Related-paper or reference-paper search**
3. **Deterministic numerical verification**
4. **Final constructive rewrite**

These provide much stronger evidence of agentic behavior than simply showing reviewer and judge LLMs talking to each other.

---

## 28. Evaluation Design

Compare:

```text
Baseline A
Single LLM reviewer

Baseline B
Reviewer MAS

Baseline C
Reviewer MAS + evidence verification

PeerMind
Reviewer MAS + evidence + impact verification + calibration
```

### Finding-Level Metrics

```text
Finding precision
False-positive rate
Evidence citation accuracy
Refutation accuracy
Severity calibration
Relevance calibration
Appropriate abstention
Human usefulness
```

### Suggested Test Sources

- human-reviewed papers,
- OpenReview review/rebuttal histories,
- adjudicated individual findings,
- controlled paper variants with planted or removed defects,
- known numerical inconsistencies,
- known appendix evidence.

---

## 29. Reusable Asset

The reusable unit is not merely the reviewer prompt.

It is the verification protocol:

```text
Paper Graph Schema
+
Critique Contract
+
Verification Router
+
Evidence Ledger
+
Tool Contracts
+
Impact Calibration
+
Meta Review Schema
```

Potential reuse beyond peer review:

```text
Proposal claim verification
Literature contradiction analysis
Research-plan criticism
Technical report QA
Scientific benchmark analysis
Internal research quality assurance
```

---

## 30. Final Positioning

### Short Pitch

> **Existing AI reviewers generate critiques. PeerMind verifies them.**

### Stronger Technical Pitch

> **PeerMind treats each reviewer comment as a falsifiable hypothesis, dynamically converts it into an executable verification task, gathers evidence and counter-evidence using scientific tools, separately evaluates truth and impact, and only then admits the calibrated finding into the final review.**

### Three Questions

Every important finding must answer:

```text
1. Is it true?
2. Does it apply?
3. Does it matter?
```

### Final Tagline

> **PeerMind does not trust its own reviewers.**
