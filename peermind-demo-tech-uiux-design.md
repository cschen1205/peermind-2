# PeerMind Hackathon Demo - Tech Stack and UI/UX Design

**Version:** 3.0  
**Aligned with:** `peermind-system-design.md`  
**Purpose:** Content-agnostic frontend design for the PeerMind hackathon demo  
**Primary principle:** The application contains **no hard-coded paper title, paper text, claims, findings, evidence, reviewer comments, verdicts, human reviews, or comparison results**. All paper-specific content is loaded through a defined demo-data interface.

**What changed from 2.0:** Counterfactual testing is no longer a primary workflow stage. Verification is the overall process. The defender is an adversarial strategy inside verification. Truth and impact are evaluated separately. The primary path is Understand → Plan → Review → Verify → Synthesize.

---

# 1. Product Goal

PeerMind should demonstrate a scientific-review workflow that does not trust its own reviewers:

```text
Paper
  -> Understand
  -> Plan
  -> Review
  -> Verify (evidence, then impact)
  -> Synthesize

Independent evaluation
  -> Compare with human / baseline reviews
```

The central product message is:

> **Existing AI reviewers generate critiques. PeerMind verifies them.**
>
> **PeerMind does not trust its own reviewers.**

Every important finding must answer three questions:

```text
1. Is it true?
2. Does it apply?
3. Does it matter?
```

PeerMind is not a chat-with-PDF product and not a multi-reviewer ensemble. It is an inspectable review system in which paper claims, candidate findings, verification contracts, tool results, evidence, counter-evidence, impact judgments, calibrated comments, and the final meta-review remain traceable.

Do **not** present the product as “AI peer review with unit tests” or treat counterfactual testing as the verification method. Counterfactual analysis is a tool inside impact verification, used only when a meaningful intervention can be defined.

---

# 2. Non-Negotiable Content-Agnostic Requirement

The frontend implementation must be reusable for any prepared sample paper.

## 2.1 Do not hard-code sample-paper content

Do **not** place any sample-specific values directly in React components, page code, graph code, or playback logic, including:

- paper title;
- author names;
- section names beyond generic defaults;
- claims;
- methods;
- table or figure descriptions;
- paper excerpts;
- review findings;
- critique text;
- reviewer-agent assignments;
- skipped-capability reasons;
- evidence or counter-evidence;
- numerical values;
- verdicts;
- impact judgments;
- counterfactual interventions;
- human reviews;
- author rebuttal;
- baseline LLM review;
- comparison statistics.

Components must render only from loaded data.

## 2.2 Allowed built-in content

The application may contain only generic product/interface language such as:

```text
Understand
Plan
Review
Verify
Synthesize
Compare
Author Claim
Candidate Finding
Evidence
Counter-evidence
Verification Contract
Impact
Scope Relevance
Necessity
Sensitivity
Calibrated Comment
Ask PeerMind
```

Generic empty-state and help text is also allowed.

## 2.3 Prepared demo package

Before the presentation, generate one paper-specific `DemoDataPackage` and load it into the application.

Recommended runtime model:

```text
Generic PeerMind UI
        +
DemoDataPackage for selected paper
        +
Paper PDF / page assets
        +
Optional human-review inputs
        |
        v
Complete prepared demo
```

A different paper should require replacing the data package and paper asset, not editing page components.

---

# 3. Recommended Technology Stack

## 3.1 Core stack

```text
Vite
React
TypeScript
Tailwind CSS
shadcn/ui
Zustand
React Router
AntV G6
XYFlow / React Flow
Motion
Lucide React
Zod
```

Recommended source-preview support:

```text
react-pdf / PDF.js
```

For the prepared hackathon mode, a page-image adapter may be used instead of live PDF rendering.

## 3.2 Why this stack

### Vite

Use for build and development. It is appropriate for a frontend-first prepared demo and avoids unnecessary SSR/backend complexity.

### React + TypeScript

Use for page composition, reusable inspectors, evidence cards, state-driven playback, comparison views, and typed demo-data contracts.

### Tailwind CSS + shadcn/ui

Use for layout and UI primitives. Recommended shadcn primitives:

- Button
- Card
- Badge
- Tabs
- Sheet
- Dialog
- Select
- Tooltip
- ScrollArea
- Collapsible / Accordion
- Progress
- Separator
- Textarea

### Zustand

Use for the active loaded package, navigation state, selected source/finding, playback state, verification progress, comparison inputs, and Ask PeerMind context.

### Zod

Use to validate loaded demo data before rendering. A malformed package should fail with a clear validation error rather than breaking during the presentation.

### AntV G6

Use for the **Paper Evidence Graph** only.

It visualizes paper-level relationships such as:

```text
Contribution -> Claim -> Result / Table / Figure
                     -> Method / Equation
                     -> Scope
```

Do not use G6 for the verification process flow.

### XYFlow / React Flow

Use for the **Verification workflow** because it represents runtime process, tool routing, skipped capabilities, defender search, bounded replanning, and optional impact tools.

Do not title this canvas “Defender workflow.” The defender is one adversarial strategy inside verification, not the whole stage.

### Motion

Use for short deterministic demo transitions:

- node reveal;
- routing reveal;
- current workflow step;
- evidence discovery;
- skipped-capability callout;
- replan appearance;
- verdict reveal;
- calibration rewrite reveal;
- comparison-result reveal.

Avoid long fake thinking delays.

### Lucide React

Use for consistent paper, search, evidence, workflow, calculation, warning, lock, user, and source-link icons.

### react-pdf / PDF.js

Use for the Paper Preview if reliable in the target browser. The viewer should expose a normalized overlay layer for evidence highlighting.

For maximum demo reliability, also support a prepared page-image mode.

---

# 4. Required Libraries

Minimum:

```bash
npm install react-router-dom zustand zod @antv/g6 @xyflow/react lucide-react motion
```

Configure separately:

```text
Tailwind CSS
shadcn/ui
```

Recommended for source preview:

```bash
npm install react-pdf
```

Optional:

```bash
npm install @tanstack/react-table recharts
```

`@tanstack/react-table` is useful only if the comparison matrix becomes complex. `recharts` is optional; the finding-level matrix is more important than charts.

---

# 5. Technologies Not Required for the Demo

Do not add these unless already available and trivial to reuse:

- PostgreSQL;
- Redis;
- Neo4j;
- vector database;
- FastAPI;
- LangGraph;
- WebSocket infrastructure;
- authentication;
- multi-user collaboration;
- model-provider abstraction;
- production observability;
- distributed orchestration.

The demo should prioritize deterministic presentation, inspectable technical ideas, and clear data interfaces.

---

# 6. Application Information Architecture

## 6.1 Primary workflow

```text
Landing / Intake
      |
      v
1 Understand
      |
      v
2 Plan
      |
      v
3 Review
      |
      v
4 Verify
      |
      v
5 Synthesize

Evaluation
      |
      v
6 Compare

Secondary capability
      |
      v
Ask PeerMind
```

`Verify` contains two ordered questions on the same page:

```text
Evidence verification   Is the critique true?
Impact verification     Does the critique apply, and does it matter?
```

Counterfactual analysis appears only inside impact verification, and only when the package defines an identifiable intervention or an explicit `not_identifiable` result.

There is no `Test` stage and no `/test/:findingId` page.

## 6.2 Persistent header

All workflow pages use a compact stepper:

```text
Understand -> Plan -> Review -> Verify -> Synthesize
```

`Compare` is visually separated under **Evaluation** because human reviews must not influence the locked PeerMind run.

A global secondary button may appear on applicable pages:

```text
[ Ask PeerMind ]
```

It opens a context-aware drawer. It must never dominate the page.

## 6.3 Recommended routes

```text
/
/intake
/understand
/plan
/review
/verify/:findingId
/synthesize
/compare
/architecture
```

Compatibility redirects from the 2.0 demo:

```text
/challenge            -> /verify
/challenge/:findingId -> /verify/:findingId
/test                 -> /verify
/test/:findingId      -> /verify/:findingId?panel=impact
/report               -> /synthesize
```

---

# 7. Data Loading Architecture

The frontend should support three independent input channels.

## 7.1 Channel A - PeerMind demo package

Primary prepared input:

```text
Load Demo Package
```

Accepted forms:

- bundled local JSON selected by configuration;
- user-selected JSON file;
- TypeScript fixture imported at build time;
- later, a generated JSON response from a real backend.

The UI must consume the same interface regardless of source.

## 7.2 Channel B - Paper source asset

Load separately or reference from the package:

- PDF file;
- prepared page images;
- prepared source excerpts;
- highlight coordinate metadata.

The Paper Preview component must not assume any specific page or evidence location.

## 7.3 Channel C - Independent comparison inputs

The Compare page accepts:

- manually pasted human reviews;
- imported human-review JSON;
- optional author rebuttal;
- optional meta-review / area-chair review;
- optional single-LLM baseline review.

For the hackathon, manual paste or prepared local import is preferred over live OpenReview API dependence.

---

# 8. Top-Level Demo Data Interface

Recommended TypeScript interface:

```ts
interface DemoDataPackage {
  schemaVersion: '2.0';

  demo: DemoMetadata;
  paper: PaperMetadata;
  sources: SourceRecord[];
  sections: PaperSection[];

  paperGraph: {
    nodes: PaperNode[];
    edges: PaperEdge[];
  };

  paperSummary: PaperSummary;

  reviewPlan: ReviewPlan;

  reviewerRun: {
    signals: ReviewSignal[];
    candidateAgents: ReviewerAgent[];
    selectedAgentIds: string[];
    review: ReviewDocument;
  };

  findings: FindingRecord[];
  verifications: VerificationRecord[];
  impactAssessments: ImpactAssessment[];
  counterfactualTests: CounterfactualRecord[];

  synthesis: SynthesisDefinition;

  askPeerMind?: AskPeerMindConfig;
  comparisonPreset?: ComparisonPreset;
}
```

Every UI page should read from this package or from user-entered comparison data.

`schemaVersion: '1.0'` packages from the previous demo must not render. Show a diagnostic that the package needs to be migrated to 2.0.

---

# 9. Paper and Source Interfaces

## 9.1 Paper metadata

```ts
interface PaperMetadata {
  id: string;
  title: string;
  authors?: string[];
  venue?: string;
  year?: number;
  abstract?: string;
  pdfAsset?: string;
  previewMode?: 'pdf' | 'page_images' | 'excerpt_only';
  conferenceStyle?: ConferenceStyle;
}

type ConferenceStyle =
  | 'iclr'
  | 'icml'
  | 'neurips'
  | 'acl'
  | 'aaai'
  | 'generic';
```

The intake UI may expose a conference-style selector. The selected value only changes Synthesize section labels and prepared review framing. It must not invent findings.

## 9.2 Sections

```ts
interface PaperSection {
  id: string;
  title: string;
  level: number;
  startPage?: number;
  endPage?: number;
  sourceIds: string[];
}
```

## 9.3 Source record

Every evidence-bearing item should resolve to a source record.

```ts
interface SourceRecord {
  id: string;
  type:
    | 'paragraph'
    | 'claim'
    | 'equation'
    | 'table'
    | 'figure'
    | 'appendix'
    | 'code'
    | 'external'
    | 'reference';

  label: string;
  sectionId?: string;
  page?: number;
  excerpt?: string;

  highlightRegions?: HighlightRegion[];
  externalUrl?: string;
}
```

## 9.4 Highlight regions

Use normalized coordinates so the same data can drive PDF or image rendering.

```ts
interface HighlightRegion {
  id: string;
  page: number;
  x: number;      // 0..1
  y: number;      // 0..1
  width: number;  // 0..1
  height: number; // 0..1

  role:
    | 'claim'
    | 'evidence_for'
    | 'counter_evidence'
    | 'context'
    | 'selected';

  label?: string;
}
```

No page number or coordinate should be hard-coded in `PaperPreview.tsx`.

---

# 10. Paper Preview and Evidence Highlighting

## 10.1 Purpose

Paper Preview is a first-class inspection component. It provides direct visual proof that PeerMind's graph, findings, and verification decisions point back to the manuscript.

It is more important than adding visual complexity to the graph.

## 10.2 Required component API

```tsx
<PaperPreview
  paper={paper}
  sourceRecords={sources}
  activeSourceIds={activeSourceIds}
  focusMode="evidence"
  onSourceSelect={handleSourceSelect}
/>
```

Possible `focusMode` values:

```ts
type PaperPreviewFocus =
  | 'paper'
  | 'claim'
  | 'evidence'
  | 'counter_evidence'
  | 'comparison';
```

## 10.3 Required behavior

When a user selects a graph node, critique, evidence record, verification step, or comparison finding:

1. Resolve associated `sourceIds`.
2. Jump to the corresponding paper page or excerpt.
3. Draw all relevant highlight regions.
4. Emphasize the currently selected region.
5. Show source ID, section/page label, role, and optional excerpt.
6. Allow `Open source` / `Expand paper`.

## 10.4 Bidirectional navigation

Recommended relationship:

```text
Paper Graph <-> Paper Preview <-> Finding / Evidence Ledger
```

Examples of generic interactions:

```text
Click graph node
-> highlight source in paper

Click evidence badge
-> jump to source

Click critique
-> show all source records used by the critique

Click active verification step
-> show source currently being inspected

Click paper highlight
-> show which claims/findings reference it
```

## 10.5 Implementation modes

### Mode A - PDF rendering

Use `react-pdf` / PDF.js and absolute-position overlay boxes.

### Mode B - prepared page images

For the hackathon, pre-render only pages needed by the prepared data package and draw overlays over images.

This is the most reliable mode for exact highlighting.

### Mode C - excerpt-only fallback

If no renderable asset is available, show source cards with page/section/excerpt instead of a broken viewer.

---

# 11. Ask PeerMind - Secondary Contextual Function

## 11.1 Product role

`Ask PeerMind` is a secondary capability, not the primary application experience.

It should function as a natural-language interface into the currently selected paper, evidence, critique, verification record, report finding, or comparison item.

Do not redesign the product around a permanent chat window.

## 11.2 Entry points

Recommended entry points:

```text
Global header: [ Ask PeerMind ]
Paper Preview: [ Ask about this source ]
Critique drawer: [ Ask about this critique ]
Evidence Ledger: [ Ask about this evidence ]
Impact panel: [ Ask about this impact judgment ]
Synthesize finding: [ Ask about this finding ]
Compare detail: [ Ask about this comparison ]
```

## 11.3 Drawer layout

```text
+----------------------------------+
| ASK PEERMIND                     |
|                                  |
| Context                          |
| [ Selected evidence        v ]   |
|                                  |
| Suggested questions              |
| [ question chip ]                |
| [ question chip ]                |
| [ question chip ]                |
|                                  |
| -------------------------------- |
| Ask about this context...   [->] |
|                                  |
| Response                         |
| ...                              |
|                                  |
| [Open source] [Trace evidence]   |
+----------------------------------+
```

## 11.4 Supported context scopes

```ts
type AskContextScope =
  | 'whole_paper'
  | 'section'
  | 'source'
  | 'paper_graph_node'
  | 'finding'
  | 'verification'
  | 'evidence_ledger'
  | 'impact'
  | 'counterfactual_test'
  | 'synthesis'
  | 'comparison';
```

## 11.5 Ask request interface

```ts
interface AskRequest {
  query: string;
  scope: AskContextScope;
  contextIds: string[];
}
```

## 11.6 Ask response interface

```ts
interface AskResponse {
  answer: string;
  sourceIds: string[];

  actions?: Array<{
    type:
      | 'open_source'
      | 'focus_graph'
      | 'open_finding'
      | 'open_verification'
      | 'run_check';
    label: string;
    targetId?: string;
  }>;

  toolTrace?: Array<{
    label: string;
    status: 'running' | 'done' | 'failed' | 'skipped';
  }>;
}
```

## 11.7 Prepared-demo behavior

For the hackathon, questions and answers can be supplied through the data package.

```ts
interface AskPeerMindConfig {
  suggestedPrompts: SuggestedPrompt[];
  preparedResponses?: PreparedAskResponse[];
}

interface SuggestedPrompt {
  id: string;
  scope: AskContextScope;
  contextId?: string;
  label: string;
  query: string;
}

interface PreparedAskResponse {
  id: string;
  match: {
    scope: AskContextScope;
    contextId?: string;
    promptId?: string;
  };
  response: AskResponse;
}
```

The UI may later replace this adapter with a real agent endpoint without changing the drawer components.

## 11.8 UX rules

- Keep Ask PeerMind collapsed by default.
- Show 2-4 contextual suggested questions rather than forcing typing during the live demo.
- Answers should cite `sourceIds` and link back to Paper Preview.
- Do not return unsupported generic prose if the prepared adapter has no answer.
- Use a clear fallback:

```text
No prepared answer is available for this question in the current demo package.
```

- If a question maps to a tool/check, show the tool action rather than pretending the answer came from pure conversation.

---

# 12. Page 0 - Landing / Intake

## Goal

Explain the product in 5-10 seconds and load the prepared paper package.

## Layout

```text
+--------------------------------------------------------------------+
| PeerMind                                  How it works      About   |
+--------------------------------------------------------------------+
|                                                                    |
| FALSIFIABLE AI PEER REVIEW                                         |
|                                                                    |
| Existing AI reviewers generate critiques. PeerMind verifies them.  |
| PeerMind does not trust its own reviewers.                         |
|                                                                    |
| [ Load Demo Package ]     [ Load Paper ]                            |
|                                                                    |
| Loaded paper                                                       |
| <paper title from package>                                         |
| <metadata from package>                                            |
| Conference style: <selector from package / user choice>            |
|                                                                    |
|                                  [ Start Review -> ]                |
+--------------------------------------------------------------------+
| Is it true? | Does it apply? | Does it matter?                     |
+--------------------------------------------------------------------+
```

## Requirements

- No built-in paper title.
- No built-in finding example.
- Empty state before package load.
- Validate package with Zod.
- Show a short validation summary after load.
- Disable workflow navigation until required data is present.
- Do not use “Challenge it” or “Change the evidence” as landing pillars.

---

# 13. Page 1 - Understand

## Goal

Show that PeerMind builds a source-linked representation before generating review comments.

## Layout

```text
+--------------------------------------------------------------------------------+
| PeerMind     <loaded paper title>                         [ Ask PeerMind ]       |
| [active] UNDERSTAND   PLAN   REVIEW   VERIFY   SYNTHESIZE                      |
+------------------+-----------------------------------+---------------------------+
| PAPER STRUCTURE  | PAPER EVIDENCE GRAPH              | PAPER PREVIEW / INSPECTOR |
|                  |                                   |                           |
| <sections from   | <nodes and relationships from     | <selected source page /  |
| package>         | loaded package>                   | excerpt>                  |
|                  |                                   |                           |
|                  |                                   | <highlight overlays>      |
|                  |                                   |                           |
|                  |                                   | [Ask about this source]   |
+------------------+-----------------------------------+---------------------------+
| PAPER SUMMARY / KEY POINTS                                                     |
| <summary cards loaded from package>                                             |
|                                                    [ Continue to Plan -> ]        |
+--------------------------------------------------------------------------------+
```

## Paper graph node types

Recommended generic types from the paper graph:

```text
Contribution
Claim
Method
Equation
Experiment
Result
Table / Figure
Limitation
Scope
Reference
```

The renderer must not assume a fixed set of scientific examples. Unknown types fall back to a neutral node style.

## Inspector rules

Selecting a graph node should show:

```text
<record ID>
<record type>
<label>
<source location>
<source excerpt>
<connected records>
[Open source]
[Ask PeerMind]
```

Never insert fixed claim or table examples in the component.

---

# 14. Page 2 - Plan

## Goal

Make the Review Director visible as a planner, not a reviewer. Show dynamic routing and explicit skips.

## Layout

```text
+--------------------------------------------------------------------------------+
| 2 PLAN                                                     [ Ask PeerMind ]     |
| The director decides what to run. It does not write the review.                 |
+--------------------------------------------------------------------------------+
| PAPER TYPE                                                                      |
| <paper type from package>                                                       |
|                                                                                |
| CENTRAL CLAIMS                                                                  |
| <claim chips linked to paper graph / sources>                                   |
+------------------------------------------+-------------------------------------+
| SELECTED REVIEWERS                       | SELECTED VERIFICATION               |
|                                          |                                     |
| ✓ <reviewer label>                       | ✓ <capability label>                |
| ✓ <reviewer label>                       | ✓ <capability label>                |
|                                          |                                     |
| SKIPPED                                  | SKIPPED                             |
| ○ <role>                                 | ○ <capability>                      |
|   <reason from package>                  |   <reason from package>             |
+------------------------------------------+-------------------------------------+
| ROUTING DECISIONS                                                               |
| <compact callouts from routing events>                                          |
|                                                                                |
|                              [ Continue to Review -> ]                          |
+--------------------------------------------------------------------------------+
```

This page must show at least one intentionally skipped capability when the package includes one. The skipped state is part of the product story: PeerMind is not a fixed prompt chain.

## Review plan interface

```ts
interface ReviewPlan {
  paperType: string;
  centralClaimIds: string[];
  selectedReviewerIds: string[];
  selectedVerifierIds: string[];
  skippedReviewers: SkippedCapability[];
  skippedVerifiers: SkippedCapability[];
  routingEvents: PlaybackEvent[];
  notes?: string[];
}

interface SkippedCapability {
  id: string;
  label: string;
  reason: string;
}

interface ReviewerAgent {
  id: string;
  label: string;
  role: 'reviewer' | 'verifier' | 'director' | 'meta_reviewer';
  description?: string;
  selected: boolean;
  triggerSignalIds: string[];
}

interface ReviewSignal {
  id: string;
  label: string;
  sourceIds: string[];
}
```

Recommended demo reviewer set:

```text
Contribution Reviewer
Theory Reviewer
Scope Reviewer
```

Recommended demo verification set:

```text
Source Auditor
Numerical Auditor
Literature / Reference Auditor
Formal Proof Verifier   (often skipped)
```

The labels and the selected/skipped sets come from the package. Do not hard-code the recommended set in page components.

A short playback of routing events is useful if cheap. If time is tight, render the final routed team immediately and keep compact “ROUTING DECISION” callouts.

---

# 15. Page 3 - Review

## Goal

Present candidate findings as structured, falsifiable hypotheses. Reviewers do not write the final conference review on this page.

## Layout

```text
+--------------------------------------------------------------------------------+
| 3 REVIEW                                                   [ Ask PeerMind ]     |
| Specialists produce atomic findings, not final prose.                           |
+--------------------------------------------------------------------------------+
| CANDIDATE FINDINGS                                                              |
| <finding cards loaded from package>                                             |
|                                                                                |
| Questions for later calibration                                                 |
| <optional loaded author questions>                                              |
+--------------------------------------------------------------------------------+
```

Do **not** show a complete conference-style review here. Strengths, recommendation, and calibrated prose belong on Synthesize, after verification.

If the package still includes an early overall assessment, treat it as a draft note in a collapsed “Reviewer draft (unverified)” well. Default view is the finding list.

## Finding card

Generic rendering only:

```text
<finding ID>      <category>
<critique text>

Proposed severity: <severity>
Reviewer: <agent label>
Target claim: <claim id / label>
Source path: <source labels>

[Inspect contract] [Verify ->]
```

## Verification Contract drawer

This drawer is the executable task created from a critique. Do not call it only a “Critique Contract.”

```text
<finding ID>

Allegation
<text>

Target claim
<claim id + text>

Verification question
<text>

Evidence burden
<text>

Falsifier
<text>

Preferred tools
<tool labels>

Stop rule
<text>

Proposed severity
<severity>

Current evidence verdict
<status or pending>

[Open source]
[Ask about this critique]
[Verify this finding ->]
```

---

# 16. Page 4 - Verify

## Goal

Show that each important finding becomes an executable verification task. First decide whether the critique is true. Then decide whether it applies and whether it matters.

This page replaces both Challenge and Test from the 2.0 demo.

## Layout

```text
+--------------------------------------------------------------------------------+
| 4 VERIFY / <finding ID>                        [Ask PeerMind] [All findings]    |
| <critique text from package>                                                    |
| Proposed severity: <severity>                                                   |
+--------------------------------------------------------------------------------+
| [ Evidence ]  [ Impact ]                                                        |
+------------------------------------------+-------------------------------------+
| VERIFICATION WORKFLOW                    | PAPER PREVIEW / LIVE INSPECTOR      |
|                                          |                                     |
| <XYFlow nodes from verification record>  | Current action                      |
| Planner / tools / defender / skip        | <activity from playback event>      |
|                                          |                                     |
|                                          | Current source                      |
|                                          | <paper page or excerpt>             |
|                                          |                                     |
|                                          | [Open source]                       |
+------------------------------------------+-------------------------------------+
| EVIDENCE LEDGER                                                                |
| <evidence for> | <counter-evidence> | <gaps> | <provenance> | <tools used>     |
|                                                                                |
| Evidence verdict: <status>                                                      |
| Current limit: <text>                                                           |
|                                                                                |
| [Play] [Pause] [Next step] [Reset]                                              |
+--------------------------------------------------------------------------------+
| IMPACT  (shown after evidence playback, or immediately on the Impact tab)       |
|                                                                                |
| Scope relevance     <level>   <explanation>                                     |
| Necessity           <level>   <explanation>                                     |
| Sensitivity         <level>   <explanation>                                     |
|                                                                                |
| Counterfactual tool  (only if the package defines one)                          |
| <identifiable intervention or NOT IDENTIFIABLE reason>                          |
|                                                                                |
| Final status        <status>                                                    |
| Final severity      <severity>                                                  |
|                                                                                |
|                         [ Continue to Synthesize -> ]                           |
+--------------------------------------------------------------------------------+
```

## 16.1 Evidence tab

The Evidence tab answers: **Is the critique true?**

Show:

- verification contract summary;
- dynamically selected tools;
- explicitly skipped tools, with reasons;
- defender search as one strategy, labeled as such;
- evidence for, counter-evidence, and gaps;
- evidence verdict.

Recommended tool labels, when present in data:

```text
Paper Graph Search
Source Auditor
Numerical Auditor
Literature / Reference Auditor
Formal Proof Verifier
Statistical Auditor
```

The UI should make skipped tools visible. A grey skipped Formal Proof Verifier node is more useful than hiding it.

Do not title the page “Challenge” or “Defender.”

## 16.2 Impact tab

The Impact tab answers: **Does the critique apply, and does it matter?**

Three judgments stay separate:

1. **Scope relevance** — does the critique apply to the claim the authors actually make?
2. **Necessity** — is the requested evidence necessary for evaluating that claim?
3. **Sensitivity** — would fixing or violating the issue change support for the claim?

Never merge these into one “importance score.”

Impact verification runs on findings whose evidence verdict is supported or partially supported. Refuted findings can show a short “impact not applicable” empty state instead of inventing sensitivity.

## 16.3 Counterfactual tool

Counterfactual analysis is optional and nested.

Show a panel only when `counterfactualTests` contains a record for the finding.

### Identifiable

```text
COUNTERFACTUAL TOOL

Current support
<loaded state>

Intervention
<loaded intervention>

Re-evaluated support
<loaded state>

Sensitivity
<high / moderate / low>
```

Do not require a Baseline / Targeted / Control triad. That 2.0 layout tested reviewer-update behavior. The 3.0 tool tests claim-support sensitivity under a defined intervention.

If a prepared record still includes before/after variants, render them as **Current** and **Intervention**, not as a three-way control experiment.

### Not identifiable

```text
COUNTERFACTUAL TEST: NOT IDENTIFIABLE
Reason:
<loaded reason>

Keep the finding uncertain, or request clarification.
Do not invent an experimental outcome.
```

If no counterfactual record exists, omit the panel. Do not invent a test in the UI.

## 16.4 Verification record interface

```ts
interface VerificationRecord {
  findingId: string;
  contract: VerificationContract;
  agentIds: string[];
  invokedToolIds: string[];
  skippedTools: SkippedCapability[];
  workflowNodes: WorkflowNodeData[];
  workflowEdges: WorkflowEdgeData[];
  events: PlaybackEvent[];
  ledger: EvidenceLedger;
  evidenceVerdict: EvidenceVerdict;
  limitations: string[];
  impactAssessmentId?: string;
}

interface VerificationContract {
  allegation: string;
  targetClaimId?: string;
  verificationQuestion: string;
  evidenceBurden: string;
  falsifier: string;
  preferredTools: string[];
  stopRule: string;
}

interface EvidenceLedger {
  for: EvidenceRecord[];
  against: EvidenceRecord[];
  gaps: EvidenceRecord[];
  provenance: string[];
  toolsUsed: string[];
}

interface EvidenceRecord {
  id: string;
  direction: 'for' | 'against' | 'gap';
  sourceIds: string[];
  summary: string;
  toolId?: string;
}
```

## 16.5 Impact and counterfactual interfaces

```ts
interface ImpactAssessment {
  id: string;
  findingId: string;
  scopeRelevance: ImpactLevel;
  scopeExplanation: string;
  necessity: ImpactLevel;
  necessityExplanation: string;
  sensitivity: SensitivityLevel;
  sensitivityExplanation: string;
  counterfactualTestId?: string;
  finalSeverity: SeverityLevel;
  status: FindingStatus;
}

type ImpactLevel = 'high' | 'moderate' | 'low' | 'unknown';
type SensitivityLevel = ImpactLevel | 'not_identifiable';
type SeverityLevel = 'major' | 'minor' | 'suggestion' | 'none';

interface CounterfactualRecord {
  id: string;
  findingId: string;
  identifiable: boolean;
  reason?: string;
  currentSupport?: string;
  intervention?: string;
  reevaluatedSupport?: string;
  sensitivity?: Exclude<SensitivityLevel, 'unknown' | 'not_identifiable'>;
  current?: CounterfactualVariant;
  intervened?: CounterfactualVariant;
}

interface CounterfactualVariant {
  label: string;
  description: string;
  changedSourceIds: string[];
  claimSupport: string;
}
```

## 16.6 Bounded replan

Replanning must be data-driven.

```ts
interface ReplanEvent {
  reason: string;
  attempt: number;
  maxAttempts: number;
  spawnedAgentIds: string[];
  requestedEvidence: string[];
}
```

The UI should visibly distinguish:

```text
Evidence gap
-> Replan
-> New specialist / tool
-> Re-check
-> Stop when budget is exhausted
```

No loop count, replan reason, or specialist should be hard-coded.

Focused debate is also conditional. If the package includes a debate segment, render it as a bounded branch on the verification canvas, not as a fixed stage in the stepper.

---

# 17. Page 5 - Synthesize

## Goal

Show the Meta Reviewer consuming the verified ledger, not raw reviewer prose. Present a calibrated conference-style review with provenance, uncertainty, and constructive rewrites.

Do not call this “humanization.” Use **Review Calibration** or **Constructive Rewrite**.

## Layout

```text
+--------------------------------------------------------------------------------+
| 5 SYNTHESIZE                                       [Export] [Ask PeerMind]      |
| Verified findings, then a calibrated review.                                    |
+--------------------------------------------------------------------------------+
| PAPER                                                                          |
| <loaded metadata>                                                              |
| Conference style: <label>                                                       |
|                                                                                |
| REVIEW SUMMARY                                                                 |
| <loaded calibrated summary>                                                     |
|                                                                                |
| TRUST PROFILE                                                                  |
| <computed / loaded aggregate counts by evidence verdict and final status>       |
+--------------------------------------------------------------------------------+
| FILTER                                                                         |
| [All] [Verified] [Partially supported] [Refuted] [Unverifiable] [Open]          |
| [Downgraded]                                                                   |
+--------------------------------------------------------------------------------+
| <finding report cards>                                                         |
|                                                                                |
| Each card:                                                                     |
| <finding ID> <final status>                                                     |
| <original critique>                                                            |
| <calibrated comment>                                                           |
| <evidence / counter-evidence summary>                                          |
| <scope / necessity / impact>                                                   |
| <final severity>                                                               |
| <limitations>                                                                  |
| [Inspect verification] [Open source] [Ask about this finding]                  |
+--------------------------------------------------------------------------------+
| CONFERENCE REVIEW                                                               |
| Summary | Strengths | Major weaknesses | Minor weaknesses                      |
| Questions for authors | Evidence notes | Recommendation | Confidence           |
+--------------------------------------------------------------------------------+
| PEERMIND RUN LOCK                                                              |
| Lock this run before loading independent comparison reviews.                    |
|                                         [Lock and Compare ->]                  |
+--------------------------------------------------------------------------------+
```

## Calibration rules, visible as UI constraints

The Synthesize view should make these rules inspectable, not just implied:

```text
Never say "missing" if evidence exists.
Never say "invalidates" unless impact is high.
Use qualified language when evidence is partial.
Mention material counter-evidence.
Distinguish required correction, additional evidence, and optional suggestion.
Do not introduce new unverified criticisms.
```

Show the original critique and the calibrated comment side by side on expanded cards. The rewrite is the product beat.

## Synthesis interface

```ts
interface SynthesisDefinition {
  summary: string;
  strengths: string[];
  majorWeaknesses: string[];
  minorWeaknesses: string[];
  authorQuestions: string[];
  evidenceNotes?: string[];
  recommendation?: string;
  confidence?: string;
  conferenceStyle: ConferenceStyle;
}

interface LockedRun {
  runId: string;
  lockedAt: string;
  packageHash?: string;
  findingIds: string[];
}
```

Comparison must not mutate the generated PeerMind review. The Compare page should clearly indicate that independent reviews are loaded only after the PeerMind run is locked.

---

# 18. Page 6 - Compare

## Goal

Compare PeerMind with independent human reviews and optional baseline reviews at the **finding/theme level**, without treating human reviews as ground truth.

## 18.1 Input state

```text
+--------------------------------------------------------------------------------+
| 6 COMPARE                                                                      |
| Independent review comparison                                                  |
| PeerMind run: LOCKED                                                           |
+------------------------------------------+-------------------------------------+
| LOCKED PEERMIND RUN                      | COMPARISON INPUTS                   |
|                                          |                                     |
| <paper metadata>                         | Human Reviewer 1                    |
| <run ID>                                 | [Paste review...]                   |
| <finding count>                          |                                     |
|                                          | [+ Add reviewer]                    |
|                                          |                                     |
|                                          | Optional                            |
|                                          | [+ Meta-review]                     |
|                                          | [+ Author rebuttal]                 |
|                                          | [+ Baseline LLM review]             |
|                                          | [Import comparison JSON]            |
|                                          |                                     |
|                                          | [Compare Reviews ->]                |
+------------------------------------------+-------------------------------------+
```

Manual paste is an intentional supported workflow for the hackathon.

## 18.2 Human review input interface

```ts
interface HumanReviewInput {
  id: string;
  label: string;
  reviewText: string;
  sourceType: 'openreview' | 'manual' | 'other';
  sourceUrl?: string;
}
```

## 18.3 Additional independent inputs

```ts
interface ComparisonInputBundle {
  humanReviews: HumanReviewInput[];
  metaReview?: HumanReviewInput;
  authorRebuttal?: HumanReviewInput;
  baselineReview?: HumanReviewInput;
}
```

## 18.4 Comparison processing

Prepared or real processing should expose generic stages:

```text
Normalize review comments
-> Extract atomic findings
-> Match related issue themes
-> Link findings to paper evidence
-> Detect disagreement
-> Compare with locked PeerMind findings
```

## 18.5 Dashboard layout

```text
+--------------------------------------------------------------------------------+
| COMPARE / <loaded paper title>                           Blind comparison: Yes  |
+--------------------------------------------------------------------------------+
| Human reviewers | PeerMind findings | Shared | Human-only | PeerMind-only      |
| <counts loaded or computed from comparison result>                              |
+------------------------------------------+-------------------------------------+
| FINDING ALIGNMENT                        | SELECTED COMPARISON ITEM            |
|                                          |                                     |
| [All] [Shared] [Human only]              | <theme>                             |
| [PeerMind only] [Disagreement] [Refuted] |                                     |
|                                          | Human review excerpt                |
| <comparison items>                       | <loaded text>                       |
|                                          |                                     |
|                                          | PeerMind finding                    |
|                                          | <loaded text>                       |
|                                          |                                     |
|                                          | Evidence                            |
|                                          | <source links>                      |
|                                          |                                     |
|                                          | Verification status                 |
|                                          | <status>                            |
|                                          |                                     |
|                                          | [Open source]                       |
|                                          | [Ask about this comparison]         |
+------------------------------------------+-------------------------------------+
```

## 18.6 Comparison result interface

```ts
interface ComparisonResult {
  themes: ComparisonTheme[];
  summary: ComparisonSummary;
}

interface ComparisonTheme {
  id: string;
  label: string;

  peerMindFindingIds: string[];
  humanFindingIds: string[];
  baselineFindingIds?: string[];

  relation:
    | 'shared'
    | 'human_only'
    | 'peermind_only'
    | 'disagreement';

  sourceIds?: string[];
  verificationStatus?: FindingStatus;
  explanation?: string;
}

interface ComparisonSummary {
  sharedCount: number;
  humanOnlyCount: number;
  peerMindOnlyCount: number;
  disagreementCount: number;
  refutedCount?: number;
}
```

## 18.7 Comparison rules

Do not use raw review-text similarity as the primary metric.

Prefer:

```text
Shared issue themes
Human-only issue themes
PeerMind-only issue themes
Disagreements
Finding-level evidence alignment
Refuted allegations
Unresolved allegations
```

Always show this principle in the interface:

> Human reviews are independent reference points, not ground truth. Agreement does not prove correctness, and disagreement does not imply PeerMind is wrong.

---

# 19. Generic Status Model

Separate **evidence verdict** from **final finding status**. The UI may show both. Do not collapse them into High / Medium / Low confidence.

```ts
type EvidenceVerdict =
  | 'supported'
  | 'partially_supported'
  | 'refuted'
  | 'unverifiable'
  | 'open_question';

type FindingStatus =
  | 'verified_high_impact'
  | 'verified_moderate_impact'
  | 'verified_low_impact'
  | 'partially_supported'
  | 'refuted'
  | 'unverifiable'
  | 'open_question'
  | 'severity_downgraded';
```

Display labels:

```text
Evidence
  Supported
  Partially supported
  Refuted
  Unverifiable
  Open question

Final status
  Verified — High impact
  Verified — Moderate impact
  Verified — Low impact
  Partially supported
  Refuted
  Unverifiable
  Open question
  Severity downgraded
```

Retired 2.0 labels (do not use):

```text
Supported Concern
Human Required
Not Checked
Disputed
```

Map leftover 1.0 package values only in a migration script, never in page copy.

Color mapping:

```text
Green   Supported evidence / verified / completed tool
Amber   Partial support / open question / downgrade / replan
Red     Refuted / contradiction / failed check
Purple  Selected / PeerMind routing / active verification
Grey    Unverifiable / skipped / not invoked
```

Do not rely on color alone; every state must have a text label.

---

# 20. Core Finding Interface

```ts
interface FindingRecord {
  id: string;
  category: string;
  critique: string;
  reviewerAgentId: string;
  targetClaimId?: string;
  sourceIds: string[];
  proposedSeverity: SeverityLevel;
  contract: VerificationContract;

  evidenceFor: EvidenceRecord[];
  evidenceAgainst: EvidenceRecord[];
  missingEvidence: string[];

  evidenceVerdict: EvidenceVerdict;
  impact?: {
    scopeRelevance: ImpactLevel;
    necessity: ImpactLevel;
    sensitivity: SensitivityLevel;
    explanation: string;
  };

  finalSeverity: SeverityLevel;
  status: FindingStatus;
  calibratedComment?: string;
  limitations: string[];
  nextAction?: string;
}
```

A finding starts as a candidate hypothesis. `evidenceVerdict`, `impact`, `finalSeverity`, `status`, and `calibratedComment` are filled by verification and synthesis data. The Review page may show pending values; Verify and Synthesize show completed ones.

---

# 21. Paper Graph Interfaces

```ts
interface PaperNode {
  id: string;
  type:
    | 'contribution'
    | 'claim'
    | 'method'
    | 'assumption'
    | 'equation'
    | 'experiment'
    | 'dataset'
    | 'baseline'
    | 'metric'
    | 'result'
    | 'table'
    | 'figure'
    | 'limitation'
    | 'appendix'
    | 'reference'
    | 'scope'
    | 'gap'
    | 'question';
  label: string;
  sourceIds: string[];
  summary?: string;
}

interface PaperEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  sourceIds: string[];
}

interface GraphLayoutHint {
  nodeId: string;
  x?: number;
  y?: number;
  group?: string;
  rank?: number;
}
```

Graph labels, node count, edge count, coordinates/layout hints, and source links all come from the package. Prepared coordinates are acceptable for a hackathon demo.

---

# 22. Reviewer Routing Interfaces

See §14 for `ReviewPlan`, `ReviewerAgent`, and `ReviewSignal`.

```ts
interface ReviewDocument {
  findingIds: string[];
  draftNotes?: string[];
  authorQuestions: string[];
}
```

The Review document is a list of candidate findings. The conference review lives in `synthesis`.

---

# 23. Playback Engine

## 23.1 Principle

The UI playback engine is generic. Paper-specific activity text, node IDs, evidence IDs, branch decisions, skipped tools, and verdicts come from `PlaybackEvent[]`.

## 23.2 Event interface

```ts
type PlaybackEvent =
  | {
      type: 'message';
      text: string;
    }
  | {
      type: 'activate_node';
      nodeId: string;
    }
  | {
      type: 'complete_node';
      nodeId: string;
    }
  | {
      type: 'skip_node';
      nodeId: string;
      reason: string;
    }
  | {
      type: 'spawn_agent';
      agentId: string;
    }
  | {
      type: 'reveal_source';
      sourceIds: string[];
    }
  | {
      type: 'update_ledger';
      evidenceRecordIds: string[];
    }
  | {
      type: 'replan';
      replan: ReplanEvent;
    }
  | {
      type: 'evidence_verdict';
      status: EvidenceVerdict;
    }
  | {
      type: 'impact_update';
      assessmentId: string;
    }
  | {
      type: 'calibrate';
      findingId: string;
    }
  | {
      type: 'stop';
      reason: string;
    };
```

The playback engine owns timing only; it does not own scientific content.

## 23.3 Presenter controls

Every animated workflow should support:

```text
Play
Pause
Next Step
Reset
Complete Instantly
```

The demo should be fully operable in manual step mode.

---

# 24. Zustand State Design

```ts
interface DemoState {
  package?: DemoDataPackage;
  packageStatus: 'empty' | 'loading' | 'ready' | 'invalid';
  packageError?: string;

  currentStage:
    | 'intake'
    | 'understand'
    | 'plan'
    | 'review'
    | 'verify'
    | 'synthesize'
    | 'compare';

  selectedSectionId?: string;
  selectedPaperNodeId?: string;
  selectedSourceIds: string[];
  selectedFindingId?: string;
  verifyPanel: 'evidence' | 'impact';

  playback: {
    runId?: string;
    eventIndex: number;
    status: 'idle' | 'playing' | 'paused' | 'complete';
  };

  lockedRun?: LockedRun;

  comparisonInputs: ComparisonInputBundle;
  comparisonResult?: ComparisonResult;

  ask: {
    open: boolean;
    scope: AskContextScope;
    contextIds: string[];
    query: string;
    response?: AskResponse;
  };
}
```

---

# 25. Suggested Frontend Project Structure

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
|   |   +-- IntakePage.tsx
|   |   +-- UnderstandPage.tsx
|   |   +-- PlanPage.tsx
|   |   +-- ReviewPage.tsx
|   |   +-- VerifyPage.tsx
|   |   +-- SynthesizePage.tsx
|   |   +-- ComparePage.tsx
|   |   +-- ArchitecturePage.tsx
|   |
|   +-- components/
|   |   +-- layout/
|   |   |   +-- AppHeader.tsx
|   |   |   +-- WorkflowStepper.tsx
|   |   |   +-- DemoModeBadge.tsx
|   |
|   |   +-- paper/
|   |   |   +-- PaperGraph.tsx
|   |   |   +-- PaperSectionNav.tsx
|   |   |   +-- PaperPreview.tsx
|   |   |   +-- PdfPaperRenderer.tsx
|   |   |   +-- PageImageRenderer.tsx
|   |   |   +-- EvidenceHighlight.tsx
|   |   |   +-- SourceInspector.tsx
|   |   |   +-- SourceLink.tsx
|   |   |   +-- KeyPointCard.tsx
|   |
|   |   +-- plan/
|   |   |   +-- ReviewDirector.tsx
|   |   |   +-- CapabilityList.tsx
|   |   |   +-- SkippedCallout.tsx
|   |
|   |   +-- review/
|   |   |   +-- ReviewerTeam.tsx
|   |   |   +-- CritiqueCard.tsx
|   |   |   +-- VerificationContract.tsx
|   |
|   |   +-- verification/
|   |   |   +-- VerificationFlow.tsx
|   |   |   +-- EvidenceLedger.tsx
|   |   |   +-- LiveInspector.tsx
|   |   |   +-- ReplanStatus.tsx
|   |   |   +-- EvidenceVerdict.tsx
|   |   |   +-- ToolTrace.tsx
|   |
|   |   +-- impact/
|   |   |   +-- ImpactPanel.tsx
|   |   |   +-- ScopeNecessity.tsx
|   |   |   +-- CounterfactualTool.tsx
|   |
|   |   +-- synthesize/
|   |   |   +-- TrustProfile.tsx
|   |   |   +-- FindingReportCard.tsx
|   |   |   +-- CalibratedComment.tsx
|   |   |   +-- ConferenceReview.tsx
|   |
|   |   +-- comparison/
|   |   |   +-- ReviewInput.tsx
|   |   |   +-- ComparisonSummary.tsx
|   |   |   +-- FindingAlignment.tsx
|   |   |   +-- FindingMatrix.tsx
|   |   |   +-- ComparisonInspector.tsx
|   |
|   |   +-- ask/
|   |       +-- AskPeerMindButton.tsx
|   |       +-- AskPeerMindDrawer.tsx
|   |       +-- AskContextSelector.tsx
|   |       +-- SuggestedQuestions.tsx
|   |       +-- AskResponseView.tsx
|   |
|   +-- data/
|   |   +-- schema.ts
|   |   +-- loadDemoPackage.ts
|   |   +-- adapters/
|   |       +-- bundledPackageAdapter.ts
|   |       +-- jsonFileAdapter.ts
|   |       +-- comparisonInputAdapter.ts
|   |
|   +-- demo/
|   |   +-- playbackEngine.ts
|   |
|   +-- store/
|   |   +-- demoStore.ts
|   |
|   +-- types/
|       +-- demoPackage.ts
|       +-- paper.ts
|       +-- finding.ts
|       +-- verification.ts
|       +-- comparison.ts
|       +-- ask.ts
|
+-- public/
|   +-- demo-data/
|   |   +-- <prepared-demo-package>.json
|   |
|   +-- papers/
|       +-- <paper asset supplied later>
|
+-- package.json
```

Retired 2.0 locations:

```text
pages/ChallengePage.tsx
pages/CounterfactualPage.tsx
pages/ReportPage.tsx
components/defender/
components/counterfactual/   (replace with components/impact/)
```

The repository may contain a prepared package later, but component source code remains paper-independent.

---

# 26. Visual Design System

## 26.1 Style

Use a professional research-tool aesthetic:

- white / light-grey background;
- dark neutral text;
- restrained accent color;
- minimal shadows;
- medium-radius cards;
- clear technical hierarchy;
- visible source IDs and provenance;
- no futuristic AI decoration.

Follow `peermind-demo-design-rules.md` for tokens. Do not invent a second palette.

## 26.2 Semantic states

Recommended mapping:

```text
Primary accent -> selected / active / PeerMind routing
Blue           -> paper structure / method
Green          -> evidence / completed / supported / verified
Red            -> refuted / contradiction / failed check
Amber          -> partial / open question / downgrade / replan / stop
Grey           -> unverifiable / skipped / not invoked
```

Do not rely on color alone; every state must have a text label.

## 26.3 Typography

- UI: modern sans serif;
- paper excerpts: optional serif;
- source IDs / trace IDs: monospace.

---

# 27. UX Principles

## 27.1 Evidence first

Whenever possible, a claim or verdict should have an immediate path to its paper source.

## 27.2 Progressive disclosure

Default pages should remain readable. Put detailed contracts, logs, and provenance in drawers/collapsibles/inspectors.

## 27.3 Separate epistemic sources

Visually distinguish:

```text
Author claim
Reviewer allegation
PeerMind evidence
Counter-evidence
Tool result
Impact judgment
Calibrated comment
Human reviewer comment
Author rebuttal
Final adjudication
```

## 27.4 Make runtime decisions visible

Use compact callouts such as:

```text
ROUTING DECISION
<reason loaded from event>
-> <selected specialist or tool>
```

```text
SKIPPED
<capability>
<reason>
```

```text
EVIDENCE GAP
<missing evidence>
-> Replan
```

```text
STOP RULE REACHED
<reason>
-> <bounded status>
```

```text
IMPACT
True, but low necessity for the stated claim
-> Severity downgraded
```

## 27.5 Avoid fake certainty

Do not replace explicit statuses and limitations with a single confidence number.

## 27.6 Chat remains secondary

Ask PeerMind should help inspect the current artifact, not become the center of the application.

## 27.7 Truth before impact

The Verify page always presents evidence before impact. A presenter can open the Impact tab early, but the default path is Evidence → Impact.

## 27.8 Do not elevate optional tools

Counterfactual, focused debate, and formal proof verification are conditional. If they are absent or skipped, say so. Do not leave an empty Test-like stage in the stepper.

---

# 28. Demo Package Validation

Use Zod to validate at minimum:

- unique IDs;
- `schemaVersion` is `2.0`;
- all graph edge endpoints exist;
- all `sourceIds` resolve;
- all finding references resolve;
- all verification `findingId` values resolve;
- all impact `findingId` values resolve;
- all counterfactual `findingId` values resolve;
- all workflow event node IDs resolve;
- all selected and skipped agents/tools exist;
- all source pages/highlights are valid for the preview mode;
- all comparison-preset references resolve;
- Ask PeerMind prepared-response references resolve;
- a counterfactual record is either identifiable with an intervention, or not identifiable with a reason.

If validation fails, show a diagnostic page such as:

```text
Demo package could not be loaded.

3 validation errors:
- Finding <id> references unknown source <id>
- Workflow event references unknown node <id>
- Highlight region has invalid normalized coordinates
```

This is preferable to a silent UI failure during the presentation.

---

# 29. Demo Data Preparation Workflow

When the sample paper is chosen later, generate its content separately from the frontend.

Recommended process:

```text
Sample paper
   |
   v
Generate / curate paper structure
   |
   v
Generate source-linked paper graph
   |
   v
Generate paper summary
   |
   v
Generate Review Director plan
   selected reviewers, selected verifiers, explicit skips
   |
   v
Generate candidate findings only
   |
   v
Normalize each finding into a Verification Contract
   |
   v
Prepare verification investigations and evidence ledgers
   |
   v
Prepare impact assessments
   scope / necessity / sensitivity
   |
   v
Prepare a counterfactual tool only when identifiable
   or record NOT IDENTIFIABLE
   |
   v
Calibrate comments and assemble the conference review
   |
   v
Prepare Ask PeerMind suggested questions / responses
   |
   v
Validate DemoDataPackage
   |
   v
Load into generic frontend
```

Human OpenReview reviews are added **after** the PeerMind run is locked:

```text
Locked PeerMind run
      +
Human reviews / rebuttal / baseline
      |
      v
Comparison processor or prepared comparison package
      |
      v
Compare page
```

---

# 30. Comparison Data Preparation

The frontend should support two modes.

## Mode A - live manual comparison input

Paste human reviews into text areas, then invoke a comparison adapter.

## Mode B - prepared comparison package

Load normalized human findings and alignment results prepared before the presentation.

Recommended for hackathon reliability:

```text
Load Prepared Comparison
```

The UI should still show the manual input interface so the application appears general-purpose.

---

# 31. Demo Playback and Reliability

The frontend must support:

- deterministic replay;
- no network dependency for the core demo;
- no mandatory LLM call;
- no mandatory OpenReview API call;
- direct navigation to each stage;
- one-click reset;
- Play / Pause / Next Step;
- Complete Instantly fallback;
- prevalidated local demo package;
- preloaded source assets;
- comparison input fallback;
- Ask PeerMind prepared-answer fallback.

The application must not require a successful internet connection during the presentation.

---

# 32. Recommended Implementation Priority

## P0 - Must have

1. Generic demo-package schema 2.0 + Zod validation.
2. App shell + updated workflow stepper.
3. Intake/package loader and conference-style selector.
4. Understand page.
5. Paper Evidence Graph.
6. Paper Preview with evidence highlighting.
7. Plan page with selected and skipped capabilities.
8. Review page of candidate findings.
9. Verification Contract drawer.
10. Verify page, Evidence tab, with workflow playback.
11. Evidence Ledger and tool trace, including skipped tools.
12. At least one data-driven bounded replan path.
13. Verify page, Impact tab: scope, necessity, sensitivity.
14. Optional counterfactual tool panel, including `not_identifiable`.
15. Synthesize page with original vs calibrated comment.
16. Locked-run behavior before comparison.
17. Compare page with manual human-review inputs.
18. Prepared comparison loading path.

## P1 - Strongly recommended

1. Ask PeerMind drawer as secondary function.
2. Context-aware suggested questions.
3. Source-linked Ask responses.
4. Finding alignment matrix.
5. Deterministic tool/check adapter support.
6. PDF and page-image preview adapters.
7. Demo recovery controls.
8. Architecture page updated to the six-stage director/verify story.

## P2 - Optional

1. Real PDF parsing.
2. Real LLM Q&A.
3. Real OpenReview API integration.
4. Real semantic human-review alignment.
5. TanStack Table.
6. Recharts.
7. Full automatic PDF text-range highlighting.
8. Live formal proof tools or live literature search.

Do not start P2 work until the P0 demo flow is stable.

---

# 33. Recommended Demo Presentation Flow

The demo content itself will be loaded later, so the presentation sequence is defined independently from any specific paper.

```text
0:00  Landing
      Explain: existing AI reviewers generate critiques; PeerMind verifies them.

0:15  Understand
      Show source-linked paper graph.
      Select one record and reveal the exact source in Paper Preview.

0:40  Plan
      Show paper type, selected reviewers, selected verifiers,
      and at least one skipped capability with a reason.

0:55  Review
      Open one Verification Contract.
      Emphasize that this is a candidate finding, not the final review.

1:10  Verify / Evidence
      Run one verification.
      Show tool routing, a skipped tool if present, source highlights,
      evidence and counter-evidence, and the evidence verdict.
      If the prepared case includes a replan, show the bounded loop.

1:50  Verify / Impact
      Show scope, necessity, and sensitivity as separate judgments.
      If a counterfactual tool exists, show the intervention or
      NOT IDENTIFIABLE. Do not present this as a third workflow stage.

2:10  Synthesize
      Show original critique vs calibrated comment.
      Show mixed statuses, then lock the run.

2:30  Compare
      Load prepared human reviews / comparison data.
      Show shared, human-only, PeerMind-only, disagreement, and refuted themes.

Optional
      Open Ask PeerMind from a selected source/finding and use one prepared contextual question.
```

Ask PeerMind should take no more than a short optional moment in the demo because it is not the core differentiator.

The strongest live beats are:

1. Source / appendix audit
2. Related-paper or reference inspection
3. Deterministic numerical check
4. Final constructive rewrite

These beat a reviewer-and-judge conversation or a standalone counterfactual page.

---

# 34. Final Product Structure

The final generic application should be remembered as:

```text
LOAD
DemoDataPackage + paper asset

UNDERSTAND
Paper -> Source-linked Paper Graph -> Paper Preview

PLAN
Paper type -> Review Director -> Selected and skipped capabilities

REVIEW
Specialists -> Candidate findings -> Verification Contracts

VERIFY
Finding -> Evidence for / against -> Tool results -> Evidence verdict
       -> Scope / necessity / sensitivity
       -> Optional counterfactual tool
       -> Final status and severity

SYNTHESIZE
Verified ledger -> Calibrated comments -> Conference review -> Lock

COMPARE
Locked PeerMind Review vs Independent Reviews -> Finding-Level Alignment

ASK PEERMIND
Secondary contextual inquiry over the currently selected paper/evidence/review artifact
```

The main UX principle is:

> **The frontend must not know the demo paper. It only knows how to render an inspectable PeerMind run. Paper-specific content is injected through validated interfaces.**

This separation allows the same demo application to be reused for another paper, another set of findings, or a later real backend without redesigning the UI.

---

# 35. Mapping from Demo 2.0

Use this table when reading older notes or the current `app/` tree.

| 2.0 | 3.0 |
|---|---|
| Understand → Review → Challenge → Test → Report | Understand → Plan → Review → Verify → Synthesize |
| Reviewer routing on the Review page | First-class Plan page |
| Complete review on Review | Candidate findings on Review; conference review on Synthesize |
| Challenge / Defender page | Verify / Evidence tab |
| Test / counterfactual page | Impact tab; counterfactual is an optional tool |
| Baseline / Targeted / Control | Current support vs defined intervention, or NOT IDENTIFIABLE |
| Critique Contract | Verification Contract |
| `FindingValidity` including Human Required | `EvidenceVerdict` + `FindingStatus` |
| Report | Synthesize, with calibration before/after |
| “AI peer review with unit tests” | “PeerMind verifies its own reviewers” |

The original implementation plan (`peermind-demo-implementation-plan.md`) describes how 2.0 was built. Use `peermind-demo-refinement-implementation-plan.md` to update the existing demo to 3.0.
