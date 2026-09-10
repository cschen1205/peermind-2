# PeerMind Hackathon Demo - Detailed Tech Stack and UI/UX Design

## 1. Document Purpose

This document defines the recommended frontend technology stack, application structure, interaction model, page-level UI/UX, demo data model, and implementation constraints for the **PeerMind** hackathon demo.

PeerMind is positioned as an **evidence-based AI peer reviewer with counterfactual verification**. The demo should not look like a generic paper-review chatbot. Its defining user experience is:

> **Understand the paper -> generate structured critiques -> challenge each critique with evidence and counter-evidence -> test reviewer sensitivity with counterfactual variants -> produce an inspectable verified review -> compare against independent human reviews.**

The demo is optimized for the CFAR Agentic AI Hackathon P2 track, where the key challenge is a structured scientific paper-review workflow using specialized agents rather than a single-prompt review.

---

# 2. Product Positioning

## 2.1 Core message

Recommended headline:

> **AI peer review with unit tests.**

Recommended supporting line:

> **Every critique must survive a challenge.**

Recommended product description:

PeerMind first constructs a source-linked representation of the manuscript, then dynamically routes paper content to specialist reviewers. Each generated critique is converted into a falsifiable critique contract. A defender investigates the critique using evidence and counter-evidence, can replan when evidence is insufficient, and optionally runs a counterfactual sensitivity test to check whether reviewer reasoning updates when relevant evidence changes. The final report preserves provenance, limitations, validity, importance, and unresolved questions.

## 2.2 What PeerMind should not look like

Avoid positioning PeerMind as:

- a chat interface that simply says "review this paper";
- a fixed chain of five or six reviewer prompts;
- a generic knowledge-graph viewer;
- a system that treats model confidence as truth;
- a system that assumes human reviewers are ground truth;
- a system that forces every critique to a binary verdict.

## 2.3 Main differentiators to make visible in the UI

1. **Source-linked paper understanding**
2. **Dynamic specialist routing**
3. **Critique contracts**
4. **Evidence and counter-evidence search**
5. **Bounded replan loop**
6. **Explicit stop / abstain / human-required states**
7. **Counterfactual reviewer-sensitivity test**
8. **Separation of validity, importance, and reviewer sensitivity**
9. **Finding-level evidence ledger**
10. **Independent comparison with human OpenReview reviews**

---

# 3. Recommended Demo Scope

The hackathon demo does not need to be a complete production system. The recommended scope is:

## 3.1 Real / deterministic parts

Implement at least one or two small capabilities for technical credibility:

- local PDF preview or simple text extraction;
- deterministic arithmetic verification for numerical findings;
- optionally simple keyword/section extraction;
- optionally deterministic source-reference linking for prepared fixtures.

## 3.2 Prepared / replayed parts

The following may be scripted for the demo:

- paper graph extraction;
- specialist reviewer generation;
- candidate critique generation;
- defender investigation paths;
- evidence discovery events;
- reviewer reassessment;
- counterfactual responses;
- human-review matching;
- final comparison metrics.

All prepared behavior should be clearly labeled as **Prepared Demo**, **Simulated**, or **Replay** where appropriate.

## 3.3 Recommended sample-case strategy

Use one paper throughout the entire demo so the story remains coherent.

Prepare four findings with different behavior:

| Finding | Example | Demo capability |
|---|---|---|
| F01 | "The paper provides no ablation study." | False accusation -> counter-evidence -> Refuted |
| F02 | "The reported relative improvement is inconsistent with Table 2." | Deterministic numerical check -> Verified |
| F03 | "The statistical significance claim lacks sufficient inferential evidence." | Evidence gap -> bounded replan -> Supported concern |
| F04 | "The method duplicates prior work by Chen et al." | Missing external source -> Stop / Unverified |

These four findings collectively demonstrate evidence verification, tool use, dynamic routing, replanning, uncertainty handling, and abstention.

---

# 4. Recommended Technology Stack

## 4.1 Primary stack

Recommended frontend stack:

```text
Vite
+ React
+ TypeScript
+ Tailwind CSS
+ shadcn/ui
+ Zustand
+ React Router
+ AntV G6
+ XYFlow / React Flow
+ Motion
+ Lucide React
```

This stack is intentionally frontend-first. No production backend is required for the hackathon demo.

---

# 5. Technology Decisions

## 5.1 Vite

**Use for:** project build and development server.

Why:

- minimal setup;
- fast local development;
- easy static deployment;
- low complexity compared with a full SSR framework;
- appropriate for a prepared frontend demo.

If the existing prototype has already moved substantially into Next.js, staying with Next.js is acceptable. If rebuilding from the current HTML prototype, **Vite is the preferred option**.

## 5.2 React + TypeScript

**Use for:** application pages, component composition, demo state, scripted interactions.

Why:

- clean separation between page-level experiences;
- easier maintenance than one large HTML/JS file;
- easy creation of reusable components such as critique cards and evidence records;
- TypeScript helps keep complex finding and ledger data consistent.

## 5.3 Tailwind CSS

**Use for:** page layout, typography, spacing, borders, responsive behavior, state styling.

Recommended visual direction:

- light background;
- dark navy text;
- purple as primary PeerMind accent;
- green for verified/completed;
- red for refuted/error;
- amber for supported concern/evidence gap;
- muted grey for unverified/not checked.

Do not over-style the demo. Prioritize information hierarchy and inspectability.

## 5.4 shadcn/ui

**Use for:** common UI primitives.

Recommended components:

- Card
- Badge
- Tabs
- Dialog
- Sheet
- Select
- Tooltip
- ScrollArea
- Accordion / Collapsible
- Progress
- Separator
- Button

## 5.5 Lucide React

**Use for:** consistent icons.

Suggested icons:

- FileText
- Network
- Search
- ShieldCheck
- GitBranch
- Calculator
- FlaskConical
- TriangleAlert
- CircleCheck
- CircleX
- UserRound
- ExternalLink
- Lock
- Scale
- RotateCcw

## 5.6 Zustand

**Use for:** persistent demo state across pages.

Recommended state:

```ts
interface DemoState {
  currentStage:
    | 'understand'
    | 'review'
    | 'challenge'
    | 'test'
    | 'report'
    | 'compare';

  selectedFindingId?: string;
  paperGraphComplete: boolean;
  reviewComplete: boolean;

  defenderStep: number;
  replanCount: number;
  completedFindings: string[];

  findings: FindingRecord[];
  humanReviews: HumanReviewInput[];
  comparisonReady: boolean;
}
```

Keep demo state deterministic so the presentation can always be replayed reliably.

## 5.7 React Router

Recommended routes:

```text
/
/understand
/review
/challenge/:findingId
/test/:findingId
/report
/compare
/architecture
```

The presenter should also be able to jump directly to any prepared stage if a demo reset is required.

## 5.8 AntV G6

**Use only for:** the **Paper Evidence Graph**.

The Paper Graph is relational and exploratory rather than a workflow. G6 is therefore appropriate for:

- paper entities;
- claims;
- methods;
- evidence;
- source relationships;
- scope/gap records;
- click-to-inspect;
- focus path;
- zoom/pan;
- local neighborhood highlighting.

Recommended node types:

```text
Method
Claim
Evidence
Scope / Gap
Question (optional)
```

Do not put reviewer workflow nodes into the Paper Graph.

## 5.9 XYFlow / React Flow

**Use only for:** agent and defender workflow visualization.

Use it for:

```text
Interpret Critique
    -> Evidence Plan
    -> Generate Specialists
    -> Specialist Checks
    -> Evidence Ledger
    -> Evidence Gate
    -> Replan x1 if needed
    -> Adjudication
```

Why:

- explicit process graph;
- natural representation of branching;
- easy representation of bounded loops;
- easy active/completed/skipped node styling;
- good fit for live-step playback.

## 5.10 Motion

**Use for:** subtle stage transitions and scripted activity.

Recommended animations:

- graph nodes appear progressively;
- review specialist cards/chips appear after routing;
- workflow nodes pulse while active;
- evidence cards slide/fade in when discovered;
- verdict badge animates after investigation;
- counterfactual columns reveal sequentially.

Keep each animation approximately 200-600 ms. Do not force long waits.

## 5.11 TanStack Table - optional

Use only if the comparison matrix becomes complex.

For a small prepared comparison, a plain React table is sufficient.

## 5.12 Recharts - optional

Use only for one or two summary charts on the Comparison page.

Avoid making charts the center of the comparison experience. The finding matrix and matched evidence are more informative.

## 5.13 react-pdf - optional

Use for a lightweight source viewer if needed.

Recommended behavior:

- click a source record;
- open a right-side sheet or dialog;
- show page reference and prepared excerpt;
- optionally display the PDF page.

Do not spend large development effort on exact text highlighting.

---

# 6. Libraries to Install

Minimum recommended install set:

```bash
npm install react-router-dom zustand @antv/g6 @xyflow/react lucide-react motion
```

Then configure:

```text
Tailwind CSS
shadcn/ui
```

Optional:

```bash
npm install @tanstack/react-table recharts react-pdf
```

---

# 7. Technologies Not Required for the Demo

Do not add these unless they already exist and are trivial to reuse:

- PostgreSQL
- Redis
- Neo4j
- vector database
- FastAPI
- LangGraph
- WebSocket infrastructure
- authentication
- multi-user collaboration
- production observability
- Docker orchestration
- model-provider abstraction

The demo should optimize for reliability and clarity of the PeerMind concept.

---

# 8. Application Information Architecture

## 8.1 Main workflow

```text
Landing
  -> Understand
  -> Review
  -> Challenge
  -> Test
  -> Report

Evaluation
  -> Compare

Support
  -> Architecture / How It Works
```

## 8.2 Persistent workflow stepper

Use a persistent header stepper on all workflow screens:

```text
Understand -> Review -> Challenge -> Test -> Report
```

Example states:

```text
[check] Understand   [active] Review   Challenge   Test   Report
```

Comparison should be visually separated as **Evaluation**, not as a stage required to produce the review.

---

# 9. Page 0 - Landing

## 9.1 Goal

Explain the product difference within 5-10 seconds.

## 9.2 Layout

```text
+--------------------------------------------------------------------+
| PeerMind                                      How it works   GitHub |
+--------------------------------------------------------------------+
|                                                                    |
| FALSIFIABLE AI PEER REVIEW            LIVE EXAMPLE                 |
|                                                                    |
| AI peer review with unit tests.       AI Reviewer:                 |
|                                       "The paper provides no       |
| Every critique must                  ablation study."             |
| survive a challenge.                        |                       |
|                                             v                       |
| [ Review a Paper -> ]                  Defender checks             |
|                                       Appendix C / Table 8         |
|                                             |                       |
|                                             v                       |
|                                       REFUTED                       |
|                                       Ablation exists              |
|                                                                    |
+--------------------------------------------------------------------+
| Make it testable | Challenge it | Change the evidence             |
+--------------------------------------------------------------------+
```

## 9.3 Key interaction

Primary CTA:

```text
Review a Paper ->
```

Secondary CTA:

```text
See the Defender investigate
```

---

# 10. Page 1 - Understand

## 10.1 Goal

Show that PeerMind creates a source-linked representation before generating review comments.

## 10.2 Main layout

```text
+--------------------------------------------------------------------------+
| PeerMind  SamplePaper.pdf                                                |
| [active] UNDERSTAND    REVIEW    CHALLENGE    TEST    REPORT             |
+-------------------+----------------------------------+-------------------+
| PAPER             | PAPER EVIDENCE GRAPH             | INSPECTOR         |
|                   |                                  |                   |
| Abstract          |              Method              | C12 / Claim       |
| Introduction      |                o                 |                   |
| Related Work      |              /   \               | Source            |
| Method            |            o       o             | Section 4.2 p.6   |
| Experiments       |          Claim    Claim          |                   |
| Results           |            |       |             | Exact excerpt     |
| Appendix          |            o       o             |                   |
|                   |         Table 2  Figure 4        | Connected records |
|                   |                                  |                   |
|                   |            [gap]                 | [Open source]     |
+-------------------+----------------------------------+-------------------+
| PAPER MODEL                                                              |
| 18 records | 21 relations | 4 claims | 7 evidence items | 2 gaps        |
|                                                 [ Continue to Review -> ] |
+--------------------------------------------------------------------------+
```

## 10.3 Left paper navigation

Display sections:

- Abstract
- Introduction
- Related Work
- Method
- Experiments
- Results
- Discussion
- Appendix

Clicking a section filters/highlights related graph nodes.

## 10.4 Paper graph semantics

Recommended relationships:

```text
Paper -> proposes -> Method
Paper -> claims -> Claim
Claim -> supported by -> Evidence
Evidence -> reported in -> Table/Figure/Appendix
Method -> tested by -> Experiment
Claim -> bounded by -> Scope/Gap
```

## 10.5 Inspector panel

On node click show:

```text
C12 / AUTHOR CLAIM

"Our method improves accuracy by 12% relative to the baseline."

Source
Section 4.2 / page 6

Linked evidence
E07 / Table 2
Baseline: 85.0
Method: 89.3

Status
Author claim - not yet verified
```

## 10.6 Key Paper Point cards

Below the graph show 3-4 cards:

- Core contribution
- Evaluation result
- Component analysis
- Main author claims

Each card links back to a graph path.

---

# 11. Page 2 - Review

## 11.1 Goal

Make dynamic multi-agent routing visible and generate a complete review composed of atomic candidate critiques.

## 11.2 Page layout

Top: dynamic reviewer routing.

Bottom: review summary + strengths + critiques + questions.

```text
+--------------------------------------------------------------------------+
| 2 REVIEW                                                                 |
| The paper determines who should review it                               |
+--------------------------------------------------------------------------+
| PAPER SIGNALS                                                            |
| [Numerical claim] [Ablation] [Statistics] [Novelty]                     |
|                         |                                                |
|                         v                                                |
|                   REVIEWER ROUTER                                        |
|                         |                                                |
|      +------------------+------------------+                             |
|      v                  v                  v                             |
| Experiment           Statistics          Numerical                       |
| Reviewer             Reviewer            Checker                         |
|      \                  |                  /                             |
|       +-----------------+-----------------+                              |
|                         v                                                |
|                    Review Editor                                         |
|                                                                          |
| Proof Reviewer: SKIPPED - no theorem                                     |
+--------------------------------------------------------------------------+
| COMPLETE REVIEW                                                          |
| Overall assessment...                                                    |
|                                                                          |
| Strengths                                                                |
| S01 ...                                                                  |
| S02 ...                                                                  |
|                                                                          |
| Candidate critiques                                                      |
| F01 No ablation study                             UNTESTED       ->      |
| F02 12% improvement inconsistent                  UNTESTED       ->      |
| F03 Statistical significance concern              UNTESTED       ->      |
| F04 Duplicates Chen et al.                        UNTESTED       ->      |
|                                                                          |
| Questions                                                                |
| Q01 What target-domain information is used?                              |
|                                            [ Challenge the Review -> ]    |
+--------------------------------------------------------------------------+
```

## 11.3 Reviewer routing states

Possible specialist roles:

- Experiment Reviewer
- Numerical Checker
- Statistics Reviewer
- Method Reviewer
- Novelty Reviewer
- Reproducibility Reviewer
- Proof Reviewer
- Code Reviewer

Only show roles selected for the sample paper.

Also show one or two skipped agents to emphasize dynamic routing.

## 11.4 Critique Contract

Clicking a critique opens a details panel or modal:

```text
F02 / NUMERICAL CONSISTENCY

Critique
"The reported relative improvement is inconsistent with Table 2."

Allegation
The reported 12% gain cannot be reproduced from the stated values.

Scope
Section 4.2 + Table 2

Falsification condition
The reported values reproduce 12% within acceptable rounding.

Evidence burden
Extract the compared values and recompute the percentage.

Stop rule
If source values cannot be uniquely identified, do not issue a numerical verdict.

Current status
UNTESTED

[ Challenge this critique -> ]
```

This **Critique Contract** is one of the most important reusable product concepts.

---

# 12. Page 3 - Challenge

## 12.1 Goal

Show the Evidence-based MAS Defender actively investigating one critique.

This page should feel like an investigation, not another review page.

## 12.2 Layout

```text
+--------------------------------------------------------------------------+
| 3 CHALLENGE / F01                              <- All critiques           |
| "The paper provides no ablation study."                                  |
+------------------------------------------+-------------------------------+
| DEFENDER WORKFLOW                        | LIVE INSPECTOR                |
|                                          |                               |
| Interpret Critique [done]                | CURRENT ACTION                |
|       |                                  | Source Auditor                |
|       v                                  |                               |
| Evidence Plan [done]                     | Searching                     |
|       |                                  | Section 4 -> Appendix C       |
|       v                                  |                               |
| Generate Specialists [done]              | COUNTER-EVIDENCE FOUND        |
|      /       \                           | E07 / Table 8                 |
|     v         v                          | Full: 89.3                    |
| Claim     Source Auditor [active]         | - Alignment: 86.1            |
| Mapper       |                           | - Adapter: 84.8              |
|      \       /                           |                               |
|       v     v                            | [Open source]                 |
| Evidence Ledger                          |                               |
|       |                                  |                               |
|       v                                  |                               |
| Evidence Gate                            |                               |
|       |                                  |                               |
|       v                                  |                               |
| Initial Verdict                          |                               |
+------------------------------------------+-------------------------------+
| EVIDENCE LEDGER                                                          |
| FOR: none | AGAINST: E07 Component ablation | PROVENANCE: Appendix C     |
|                                                                          |
| INITIAL VERDICT                                                          |
| REFUTED                                                                  |
| Limit: existence of ablation does not prove scientific sufficiency.      |
|                                   [ Run Counterfactual Challenge -> ]     |
+--------------------------------------------------------------------------+
```

## 12.3 Bounded replan loop

This is the most important loop in the demo.

Recommended logic:

```text
Evidence Check
    |
    v
Enough evidence?
    |
 +--+--+
 |     |
Yes    No
 |     |
 v     v
Ledger Replan x1
       |
       v
   New specialist
       |
       +----> Evidence Check
```

Expose the loop visually:

```text
REPLAN
Evidence gap detected
Spawn Statistics Source Auditor
Replan budget: 1 / 1
```

After the budget is exhausted:

```text
STOP RULE REACHED
Required run-level statistics unavailable.
Final status: Supported concern / Unverified
```

## 12.4 Dynamic branches

Recommended branch behaviors:

```text
Numerical allegation -> Numeric Checker
Missing-paper-content allegation -> Source Auditor
Statistical claim -> Statistics Reviewer
External novelty allegation -> Citation Resolver
Scientific judgment -> Adjudicator / Human Required
Insufficient evidence -> Replan x1 -> Stop
```

## 12.5 Evidence Ledger design

Persistent fields:

```text
Finding ID
Allegation
Evidence FOR
Evidence AGAINST
Missing evidence
Source provenance
Tool provenance
Validity status
Importance status
Sensitivity status
Limits
Next action
```

---

# 13. Page 4 - Test

## 13.1 Goal

Explain the most distinctive concept in PeerMind: **Counterfactual Reviewer Sensitivity Testing**.

User-facing page title:

> **Does the reviewer actually respond to evidence?**

Technical subtitle:

> Counterfactual Challenge

## 13.2 Counterfactual design

This is not a loop. It is a controlled three-branch comparison.

```text
               Original finding
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      Baseline     Targeted     Control
                    Change
          |           |           |
          v           v           v
       Reviewer     Reviewer     Reviewer
          |           |           |
          +-----------+-----------+
                      |
                      v
              Specificity Check
                      |
                      v
              Sensitivity Result
```

## 13.3 Layout

```text
+--------------------------------------------------------------------------+
| 4 TEST / COUNTERFACTUAL CHALLENGE                                       |
| Does the reviewer respond to the evidence that actually matters?        |
+--------------------------------------------------------------------------+
|                                                                          |
|      BASELINE              TARGETED CHANGE             CONTROL           |
|                                                                          |
| +---------------+       +----------------+       +---------------+       |
| | Original      |       | Relevant edit  |       | Unrelated edit|       |
| | manuscript    |       | only           |       | only          |       |
| |               |       |                |       |               |       |
| | "12%"        |       | "5.06%"        |       | Title casing  |       |
| +-------+-------+       +--------+-------+       +-------+-------+       |
|         |                        |                       |               |
|         v                        v                       v               |
|      Reviewer                 Reviewer                Reviewer           |
|         |                        |                       |               |
|         v                        v                       v               |
|     "Incorrect"             "Incorrect"            "Incorrect"       |
|                                                                          |
+--------------------------------------------------------------------------+
| EXPECTED                                                                 |
| Targeted repair should change the bounded response.                      |
| Unrelated control should leave it stable.                                |
|                                                                          |
| SENSITIVITY RESULT                                                       |
| FAILED                                                                   |
+--------------------------------------------------------------------------+
| CRITIQUE VALIDITY      REVIEWER SENSITIVITY        IMPORTANCE            |
| VERIFIED               FAILED                      MODERATE              |
| 12% is incorrect.      Reviewer did not update.    Reporting issue;      |
| Correct = 5.06%.                                   scores unchanged.     |
+--------------------------------------------------------------------------+
```

## 13.4 Crucial interpretation rule

Always separate:

1. **Critique validity** - is the allegation supported?
2. **Reviewer sensitivity** - does the reviewer update appropriately?
3. **Scientific importance** - how much does the issue matter?

Never collapse these into one confidence score.

---

# 14. Page 5 - Report

## 14.1 Goal

Present a complete review while preserving inspection, provenance, uncertainty, and bounded verdicts.

Recommended title:

> **Verified Review**

Alternative:

> **Review Ledger**

## 14.2 Layout

```text
+--------------------------------------------------------------------------+
| 5 REPORT                                             [ Export Review ]   |
| Evidence before confidence                                              |
+--------------------------------------------------------------------------+
| PAPER                                                                    |
| Sample Paper Title                                                       |
|                                                                          |
| SUMMARY                                                                  |
| 8 generated findings | 6 investigated | 2 awaiting evidence             |
|                                                                          |
| TRUST PROFILE                                                            |
| Grounded findings           7 / 8                                        |
| Refuted false accusations   2                                            |
| Unresolved findings         1                                            |
| Sensitivity failures        1                                            |
| Human decisions required    1                                            |
+--------------------------------------------------------------------------+
| FILTER                                                                   |
| [All] [Verified] [Supported] [Refuted] [Unverified] [Human Required]     |
+--------------------------------------------------------------------------+
| F01 No ablation exists                                                   |
| REFUTED                                                                  |
| Counter-evidence: Appendix C / Table 8                                   |
| Importance: Overstated                                                   |
| Sensitivity: Passed                                                      |
| [Inspect investigation ->]                                               |
|                                                                          |
| F02 Relative improvement inconsistent                                    |
| VERIFIED                                                                 |
| Calculation: 5.06%, not 12%                                              |
| Importance: Relevant but narrower than claimed                           |
| Sensitivity: Failed                                                      |
| [Inspect investigation ->]                                               |
|                                                                          |
| F04 Duplicates Chen et al.                                               |
| UNVERIFIED                                                               |
| Missing: identifiable prior source                                       |
| Next action: ask reviewer for citation                                   |
+--------------------------------------------------------------------------+
| Have independent reviews?                                                |
| Compare PeerMind with human reviewers without modifying this locked run. |
|                                      [ Compare with Human Reviews -> ]    |
+--------------------------------------------------------------------------+
```

## 14.3 Review locking

Before entering comparison, show:

```text
PEERMIND REVIEW LOCKED
Run PM-001
Human reviews have not been loaded into the review-generation workflow.
```

This makes the comparison conceptually blind and avoids the appearance that PeerMind copied the human reviews.

---

# 15. Page 6 - Compare

## 15.1 Goal

Compare PeerMind against independent human reviews from OpenReview, without treating human review as ground truth.

Recommended title:

> **Compare with Human Reviewers**

Subtitle:

> **Independent finding-level comparison**

## 15.2 Human-review input state

```text
+--------------------------------------------------------------------------+
| 6 COMPARE                                                                |
| Compare PeerMind with independent human reviews                          |
| Blind evaluation: PeerMind review is locked                              |
+--------------------------------------+-----------------------------------+
| SAMPLE PAPER                         | COMPARISON SOURCES                |
|                                      |                                   |
| Paper title                          | Human Reviewer 1                  |
| PeerMind run PM-001                  | [ Paste review... ]               |
| 8 findings                          |                                   |
| LOCKED                              | Human Reviewer 2                  |
|                                      | [ Paste review... ]               |
|                                      |                                   |
|                                      | [ + Add reviewer ]                |
|                                      | [ + Meta-review ]                 |
|                                      | [ + Author rebuttal ]             |
|                                      | [ + Single-LLM baseline ]         |
|                                      |                                   |
|                                      | [ Compare Reviews -> ]            |
+--------------------------------------+-----------------------------------+
```

For the hackathon, manual paste is sufficient. Preload the actual OpenReview reviews before the presentation and provide a button such as:

```text
Load Prepared OpenReview Reviews
```

Do not spend demo time manually pasting long reviews.

## 15.3 Comparison processing animation

Prepared replay steps:

```text
Normalizing reviewer comments...        done
Extracting atomic findings...           done
Matching related issue themes...        done
Mapping findings to paper evidence...   done
Detecting disagreement...               done
Comparing with PeerMind...              done
```

## 15.4 Comparison dashboard

```text
+--------------------------------------------------------------------------+
| COMPARE / Sample Paper                            Blind evaluation: Yes   |
+--------------------------------------------------------------------------+
| Human reviewers       PeerMind findings       Shared issues              |
|       3                       8                     5                      |
|                                                                          |
| Human-only            PeerMind-only          Disagreements               |
|       2                       2                     2                      |
+--------------------------------------+-----------------------------------+
| FINDING ALIGNMENT                    | SELECTED FINDING                  |
|                                      |                                   |
| [All] [Shared] [Human only]          | F03 / Statistical support        |
| [PeerMind only] [Disagreement]       |                                   |
| [Refuted]                            | Human Reviewer 2                  |
|                                      | "..."                            |
| F01 Ablation concern                 |                                   |
| Human R1: yes                        | PeerMind                          |
| PeerMind: yes                        | "..."                            |
| Defender: REFUTED                    |                                   |
|                                      | Relation: MATCHED                 |
| F02 Relative improvement             |                                   |
| Human: not mentioned                 | Evidence                          |
| PeerMind: yes                        | Section 4.2 / Table 2             |
| Defender: VERIFIED                   |                                   |
|                                      | Defender verdict                  |
| F04 Novelty                          | SUPPORTED CONCERN                 |
| Human R3: yes                        |                                   |
| PeerMind: no                         | [Inspect evidence ->]             |
+--------------------------------------+-----------------------------------+
```

## 15.5 Finding comparison categories

Use these tabs:

- All
- Shared
- Human only
- PeerMind only
- Disagreement
- Refuted

## 15.6 Do not use raw text similarity as the main metric

Avoid:

```text
Review similarity: 82%
```

Instead compare atomic issue themes / findings.

Example:

```text
Human:
"More extensive OOD experiments are required."

PeerMind:
"The generalization claim exceeds the evaluated domain scope."

Alignment:
Same underlying issue - generalization / evaluation coverage
```

## 15.7 Finding Matrix

Recommended table:

```text
+--------------------------+----+----+----+----------+------------+
| Finding                  | R1 | R2 | R3 | PeerMind | Defender   |
+--------------------------+----+----+----+----------+------------+
| Component ablation       | Y  | -  | -  | Y        | REFUTED    |
| Relative improvement     | -  | -  | -  | Y        | VERIFIED   |
| Statistical support      | Y  | Y  | -  | Y        | SUPPORTED  |
| Generalization           | -  | Y  | Y  | Y        | SUPPORTED  |
| Novelty vs Method X      | Y  | -  | Y  | -        | -          |
+--------------------------+----+----+----+----------+------------+
```

## 15.8 Human reviews are reference, not ground truth

Show an informational note:

```text
Human reviews are independent reference points, not ground truth.
Agreement does not prove correctness, and disagreement does not imply PeerMind is wrong.
Evidence and adjudication remain finding-specific.
```

## 15.9 Author rebuttal integration

If an OpenReview rebuttal exists, include it as a source layer.

Example:

```text
Human reviewer:
"The paper has no ablation experiment."

Author rebuttal:
"Please see Appendix C, Table 8."

PeerMind defender:
Appendix C -> Table 8 -> Component ablation found

Final finding:
REFUTED
```

This is especially useful because it demonstrates that PeerMind checks evidence rather than simply trying to agree with humans.

## 15.10 Single-LLM baseline

Optional but recommended.

Use a capability comparison rather than invented benchmark numbers:

```text
+-------------------------+-------------+------------+----------+
| Capability              | Human review| Single LLM | PeerMind |
+-------------------------+-------------+------------+----------+
| Complete review         | Yes         | Yes        | Yes      |
| Dynamic specialists     | Human       | No         | Yes      |
| Source-linked evidence  | Mixed       | Limited    | Yes      |
| Critique contract       | No          | No         | Yes      |
| Counter-evidence search | Manual      | No         | Yes      |
| Deterministic checks    | Manual      | No         | Yes      |
| Counterfactual test     | No          | No         | Yes      |
| Explicit abstention     | Reviewer    | Variable   | Yes      |
| Evidence ledger         | No          | No         | Yes      |
+-------------------------+-------------+------------+----------+
```

Do not report quantitative performance values unless measured.

---

# 16. Verdict and Status System

Recommended finding states:

```text
Verified
Supported Concern
Refuted
Unverified
Disputed
Human Required
Not Checked
```

Suggested semantics:

### Verified
Direct evidence or deterministic calculation establishes the bounded factual allegation.

### Supported Concern
Available evidence supports a scientifically reasonable concern, but a broader scientific judgment remains necessary.

### Refuted
Counter-evidence defeats the allegation within the stated scope.

### Unverified
The necessary evidence, tool access, or source is unavailable.

### Disputed
Credible supporting and counter-evidence remain unresolved.

### Human Required
The remaining decision is primarily a scientific/value judgment or requires author/area-chair input.

### Not Checked
The defender has not investigated the finding yet.

Do not replace this with only High / Medium / Low confidence.

---

# 17. Separation of Final Judgments

For every completed finding, preserve three different outputs:

```text
1. Critique Validity
2. Scientific Importance
3. Reviewer Sensitivity
```

Example:

```text
Finding F02

Critique validity
VERIFIED
The 12% calculation is inconsistent with the reported values.

Scientific importance
MODERATE
The correction improves reporting accuracy but does not change the measured scores.

Reviewer sensitivity
FAILED
The reviewer repeated the criticism after the targeted repair.
```

This separation is a key PeerMind design principle.

---

# 18. Demo Playback Engine

## 18.1 Purpose

Use a simple scripted playback layer rather than implementing real orchestration.

Example:

```ts
const challengeReplay = [
  { delay: 0, event: 'activate', node: 'interpret' },
  { delay: 350, event: 'complete', node: 'interpret' },
  { delay: 500, event: 'activate', node: 'plan' },
  { delay: 850, event: 'complete', node: 'plan' },
  { delay: 1000, event: 'spawn', node: 'source-auditor' },
  { delay: 1350, event: 'activate', node: 'source-auditor' },
  { delay: 1750, event: 'evidence', id: 'E07' },
  { delay: 2100, event: 'complete', node: 'ledger' },
  { delay: 2400, event: 'verdict', value: 'refuted' }
];
```

## 18.2 Presenter controls

Every animated page should provide:

```text
Play
Pause
Next Step
Reset
```

**Next Step** is especially important for a live presentation because it gives the presenter control.

## 18.3 Skip animation

Provide a hidden or subtle:

```text
Complete instantly
```

or keyboard shortcut for demo recovery.

---

# 19. Suggested Data Model

## 19.1 Paper graph node

```ts
interface PaperNode {
  id: string;
  type: 'method' | 'claim' | 'evidence' | 'gap' | 'question';
  label: string;
  source: SourceRef;
  excerpt: string;
}
```

## 19.2 Paper graph edge

```ts
interface PaperEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  provenance: string[];
}
```

## 19.3 Critique contract

```ts
interface CritiqueContract {
  allegation: string;
  type: string;
  scope: string;
  falsifier: string;
  evidenceBurden: string;
  stopRule: string;
  relevanceTarget: string;
}
```

## 19.4 Evidence record

```ts
interface EvidenceRecord {
  id: string;
  direction: 'for' | 'against' | 'gap';
  sourceId: string;
  sourceLabel: string;
  excerpt: string;
  tool?: string;
}
```

## 19.5 Finding record

```ts
interface FindingRecord {
  id: string;
  critique: string;
  reviewerAgent: string;
  contract: CritiqueContract;

  evidenceFor: EvidenceRecord[];
  evidenceAgainst: EvidenceRecord[];
  missingEvidence: string[];

  validity:
    | 'verified'
    | 'supported'
    | 'refuted'
    | 'unverified'
    | 'disputed'
    | 'human_required'
    | 'not_checked';

  importance: {
    level: string;
    explanation: string;
  };

  sensitivity?: {
    status: 'passed' | 'failed' | 'inconclusive' | 'not_applicable';
    explanation: string;
  };

  limitations: string[];
  nextAction?: string;
}
```

## 19.6 Counterfactual record

```ts
interface CounterfactualRecord {
  findingId: string;

  baseline: {
    manuscriptChange: string;
    reviewerResponse: string;
  };

  targeted: {
    manuscriptChange: string;
    reviewerResponse: string;
  };

  control: {
    manuscriptChange: string;
    reviewerResponse: string;
  };

  expectedBehavior: string;
  result: 'passed' | 'failed' | 'inconclusive';
}
```

## 19.7 Human review input

```ts
interface HumanReviewInput {
  id: string;
  reviewerLabel: string;
  reviewText: string;
  source: 'openreview' | 'manual';
}
```

## 19.8 Comparison finding

```ts
interface ComparisonFinding {
  themeId: string;
  theme: string;
  peerMindFindingIds: string[];
  humanFindingIds: string[];
  relation:
    | 'shared'
    | 'human_only'
    | 'peermind_only'
    | 'disagreement';
  defenderVerdict?: string;
}
```

---

# 20. Suggested Frontend Project Structure

```text
peermind-demo/
|
+-- src/
|   +-- app/
|   |   +-- App.tsx
|   |   +-- router.tsx
|   |
|   +-- pages/
|   |   +-- LandingPage.tsx
|   |   +-- UnderstandPage.tsx
|   |   +-- ReviewPage.tsx
|   |   +-- ChallengePage.tsx
|   |   +-- CounterfactualPage.tsx
|   |   +-- ReportPage.tsx
|   |   +-- ComparePage.tsx
|   |   +-- ArchitecturePage.tsx
|   |
|   +-- components/
|   |   +-- layout/
|   |   |   +-- AppHeader.tsx
|   |   |   +-- WorkflowStepper.tsx
|   |   |   +-- DemoBadge.tsx
|   |   |
|   |   +-- paper/
|   |   |   +-- PaperGraph.tsx
|   |   |   +-- PaperSectionNav.tsx
|   |   |   +-- PaperInspector.tsx
|   |   |   +-- SourceViewer.tsx
|   |   |   +-- KeyPointCard.tsx
|   |   |
|   |   +-- review/
|   |   |   +-- ReviewerRouter.tsx
|   |   |   +-- ReviewerTeam.tsx
|   |   |   +-- ReviewSummary.tsx
|   |   |   +-- CritiqueCard.tsx
|   |   |   +-- CritiqueContract.tsx
|   |   |
|   |   +-- defender/
|   |   |   +-- DefenderFlow.tsx
|   |   |   +-- EvidenceLedger.tsx
|   |   |   +-- LiveInspector.tsx
|   |   |   +-- ReplanStatus.tsx
|   |   |   +-- FindingVerdict.tsx
|   |   |
|   |   +-- counterfactual/
|   |   |   +-- VariantCard.tsx
|   |   |   +-- SpecificityCheck.tsx
|   |   |   +-- SensitivityResult.tsx
|   |   |
|   |   +-- report/
|   |   |   +-- TrustProfile.tsx
|   |   |   +-- FindingReportCard.tsx
|   |   |
|   |   +-- comparison/
|   |       +-- ReviewInput.tsx
|   |       +-- ComparisonSummary.tsx
|   |       +-- FindingAlignment.tsx
|   |       +-- FindingMatrix.tsx
|   |       +-- HumanReviewPanel.tsx
|   |
|   +-- data/
|   |   +-- paper.ts
|   |   +-- paperGraph.ts
|   |   +-- reviewers.ts
|   |   +-- findings.ts
|   |   +-- investigations.ts
|   |   +-- counterfactuals.ts
|   |   +-- humanReviews.ts
|   |   +-- comparisons.ts
|   |
|   +-- demo/
|   |   +-- playbackEngine.ts
|   |   +-- reviewReplay.ts
|   |   +-- challengeReplay.ts
|   |   +-- counterfactualReplay.ts
|   |
|   +-- store/
|   |   +-- demoStore.ts
|   |
|   +-- types/
|       +-- paper.ts
|       +-- finding.ts
|       +-- comparison.ts
|
+-- public/
|   +-- sample-paper.pdf
|
+-- package.json
```

---

# 21. Visual Design System

## 21.1 General style

Use a professional research-tool aesthetic rather than a futuristic AI dashboard.

Recommended qualities:

- clean;
- white/light grey background;
- restrained shadows;
- medium-radius cards;
- dense enough to feel technical but not cluttered;
- clear hierarchy;
- strong source/provenance visibility.

## 21.2 Semantic colors

Suggested semantic mapping:

```text
Purple  -> PeerMind / active / selected / routing
Blue    -> Method / paper structure
Green   -> Evidence / Verified / completed
Red     -> Refuted / contradiction
Amber   -> Supported concern / gap / replan / stop
Grey    -> Unverified / Not checked / skipped
```

Do not rely on color alone. Always use text labels/icons.

## 21.3 Typography

Recommended:

- UI: Inter, system UI, or similar modern sans serif;
- quoted paper text: optionally serif to distinguish source text;
- IDs/provenance: monospace.

Example:

```text
F02
EMP-S12
Appendix C / Table 8
```

should visually look like traceable records.

---

# 22. Interaction Principles

## 22.1 Every major result should be inspectable

Clicking a finding should reveal:

- exact critique;
- critique contract;
- sources;
- evidence and counter-evidence;
- defender route;
- tool activity;
- limitations;
- final bounded status.

## 22.2 Reveal complexity progressively

Default view should remain clean.

Use:

- collapsible details;
- side inspectors;
- tabs;
- focused graph paths;
- optional trace view.

Do not show raw logs by default.

## 22.3 Preserve source distinction

Clearly distinguish:

```text
Author claim
Reviewer allegation
Defender evidence
Human reviewer comment
Author rebuttal
PeerMind adjudication
```

These are different epistemic sources and should not visually blend together.

## 22.4 Do not overuse confidence numbers

Prefer explicit states and evidence descriptions.

Good:

```text
UNVERIFIED
Required prior source unavailable.
```

Less useful:

```text
Confidence 0.61
```

## 22.5 Make dynamic decisions visible

Examples:

```text
ROUTING DECISION
Numerical claim detected
-> Numeric Checker selected
```

```text
EVIDENCE GAP
Inferential result unavailable
-> Replan x1
```

```text
STOP RULE REACHED
No identifiable external source
-> Unverified
```

These small callouts provide direct evidence of agentic behavior.

---

# 23. Demo Flow for the Presentation

Recommended approximately 3-minute live demo:

## 0:00-0:15 - Landing

Say:

> "AI can generate reviews quickly, but authors still have to manually check whether the review itself is correct. PeerMind treats every critique as an allegation that must survive a challenge."

Click **Review a Paper**.

## 0:15-0:35 - Understand

Show the Paper Evidence Graph.

Highlight one claim -> evidence path.

Say:

> "Before reviewing, PeerMind builds a source-linked representation of the manuscript, so every downstream judgment can point back to the paper."

## 0:35-0:55 - Review

Show paper signals and dynamically generated reviewers.

Show candidate critiques.

Say:

> "The paper determines which specialists are needed. Each critique is stored as a falsifiable contract rather than just review prose."

## 0:55-1:35 - Challenge

Select F01: "No ablation study."

Play defender workflow.

Show Source Auditor -> Appendix C -> Table 8 -> counter-evidence.

End on:

```text
REFUTED
```

Say:

> "The reviewer sounded plausible but overlooked evidence that was already in the paper."

## 1:35-2:15 - Test

Show Baseline / Targeted / Control.

Use F02 to demonstrate a reviewer sensitivity failure.

Emphasize:

```text
Validity != Importance != Reviewer Sensitivity
```

## 2:15-2:35 - Report

Show mixed final statuses:

- Verified
- Supported Concern
- Refuted
- Unverified
- Human Required

Say:

> "PeerMind does not force every criticism into a confident answer."

## 2:35-3:00 - Compare

Load prepared OpenReview reviews.

Show:

- shared findings;
- PeerMind-only finding;
- human-only finding;
- one disagreement/refuted critique.

Finish with:

> **"PeerMind is not designed to imitate human reviewers. It is designed to make review comments inspectable, challengeable, and falsifiable - whether they come from AI or humans."**

---

# 24. Comparison Evaluation Guidance

When comparing with OpenReview:

Do not claim human reviews are ground truth.

Recommended evaluation language:

```text
Human-review issue coverage
Shared issue themes
Human-only issue themes
PeerMind-only issue themes
Reviewer disagreement
Finding-level evidence alignment
Defender refutation cases
```

Avoid unsupported labels such as:

```text
PeerMind accuracy = 90%
Human agreement = ground truth
```

unless independently adjudicated.

---

# 25. Recommended Implementation Priority

## P0 - Must have

1. App shell + workflow stepper
2. Understand page
3. Paper Evidence Graph
4. Review page
5. Critique Contract
6. Challenge page
7. Defender workflow playback
8. Evidence Ledger
9. One visible bounded replan path
10. Test page with three-way counterfactual comparison
11. Report page
12. Compare page with prepared human reviews

## P1 - Strongly recommended

1. Prepared OpenReview loader
2. Finding alignment matrix
3. Single deterministic numerical checker
4. PDF/source preview
5. Single-LLM capability comparison
6. Lock PeerMind result before comparison

## P2 - Optional

1. Real PDF extraction
2. TanStack Table
3. Recharts summary chart
4. Full PDF text highlighting
5. Real OpenReview API integration

For the hackathon, do not spend time on P2 until all P0 flows are stable.

---

# 26. Demo Reliability Requirements

The frontend must support:

- deterministic replay;
- no network dependency for the core demo;
- one-click reset;
- manual Next Step;
- instant-complete fallback;
- direct route access to each stage;
- prepared data packaged locally;
- no mandatory LLM calls;
- no mandatory OpenReview API calls;
- no long loading sequence.

A prepared local demo is preferable to an impressive but fragile live dependency chain.

---

# 27. Final Recommended Stack Summary

| Area | Recommended choice |
|---|---|
| Build | Vite |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| State | Zustand |
| Routing | React Router |
| Icons | Lucide React |
| Paper graph | AntV G6 |
| Defender workflow | XYFlow / React Flow |
| Animation | Motion |
| PDF preview | react-pdf, optional |
| Comparison matrix | Plain React table or TanStack Table |
| Charts | Recharts, optional |
| Backend | Not required for demo |
| Demo behavior | Prepared deterministic playback |

---

# 28. Final Product Structure

The complete demo experience should be remembered as:

```text
UNDERSTAND
Paper -> Source-linked Paper Graph

REVIEW
Paper signals -> Dynamic Specialists -> Critique Contracts

CHALLENGE
Critique -> Evidence / Counter-evidence -> Bounded Replan -> Initial Verdict

TEST
Baseline vs Targeted Change vs Control -> Reviewer Sensitivity

REPORT
Validity + Importance + Sensitivity + Limits

COMPARE
PeerMind vs Independent Human Reviews -> Finding-Level Alignment
```

The main UX principle is:

> **Do not make the interface primarily show that AI agents are busy. Make it show the decisions, evidence, disagreements, replanning, stopping conditions, and verification results that make the agentic workflow useful.**

