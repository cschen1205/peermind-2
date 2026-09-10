# PeerMind Demo — Detailed Implementation Plan

**Phase:** prepared frontend demo only  
**Out of scope this phase:** LLM calls, backends, OpenReview APIs, live agent orchestration, Docker services, authentication

This plan is the implementation contract for building the demo described in `peermind-demo-tech-uiux-design.md`, using the CFAR story in `PeerMind - CFAR.pptx` and reusable content from the current `index.html` prototype.

---

## 1. What we are building

PeerMind is an **evidence-based AI peer reviewer with counterfactual verification**. The demo must not look like a chatbot that says “review this paper.”

The experience the UI must make visible:

```text
UNDERSTAND   Paper → source-linked paper graph
REVIEW       Paper signals → dynamic specialists → critique contracts
CHALLENGE    Critique → evidence / counter-evidence → bounded replan → verdict
TEST         Baseline vs targeted change vs control → reviewer sensitivity
REPORT       Validity + importance + sensitivity + limits
COMPARE      PeerMind vs independent human reviews → finding-level alignment
```

Product lines to keep throughout:

- Headline: **AI peer review with unit tests.**
- Supporting line: **Every critique must survive a challenge.**
- Persistent badge: **Prepared demo · local fixtures · no live AI**

### 1.1 This phase is a fake demo

All scientific “agent” behavior is **scripted playback over local JSON fixtures**.

| Behavior | This phase |
|---|---|
| Paper understanding | Replay prepared graph records |
| Specialist routing | Replay prepared routing decisions |
| Critique generation | Show prepared critique contracts |
| Defender investigation | Step through prepared events |
| Evidence discovery | Reveal prepared evidence records |
| Replan / stop / abstain | Reveal prepared branch events |
| Counterfactual test | Reveal prepared three-branch results |
| Human comparison | Load prepared review excerpts |
| Numerical check | Local deterministic arithmetic only |
| LLM / backend / APIs | **None** |

Prepared behavior must be labeled **Prepared Demo**, **Simulated**, or **Replay** wherever a viewer could mistake it for a live model.

### 1.2 Why rebuild instead of extending `index.html`

The current prototype is a working single-file app, but it does not match the intended product:

- Understand and Review are one long page.
- Counterfactual testing is buried inside Verification.
- There is no Compare page and no review lock.
- Landing still mixes PatchBridge copy with the MonoSoup story.
- Navigation is view-id based, not URL-addressable.
- Graphs are hand-built SVG, not G6 / React Flow as specified.
- State is layered global mutations that are hard to extend safely.

This phase creates a new Vite + React + TypeScript app. `index.html` remains a **content and copy source**, not the runtime.

---

## 2. Inputs and source-of-truth decisions

| Source | Use for |
|---|---|
| `PeerMind - CFAR.pptx` | Story, 3-stage architecture, MonoSoup examples, evaluation language |
| `CFAR_Hackthon.pdf` | P2 track, judging criteria, 3-minute demo inside a 10-minute talk |
| `peermind-demo-tech-uiux-design.md` | Pages, stack, data model, interaction, visual system, P0/P1 scope |
| `index.html` | Finding copy, critique contracts, defender steps, playback copy |
| `outputs/model-soups-paper-knowledge-graph.js` | Understand-page paper graph |
| `outputs/monosoup-knowledge-graph.js` | Compare-page human-review layer and rebuttal/meta-review |

### 2.1 Canonical sample paper

Use **one paper for the entire demo**:

> **Model soups need only one ingredient** (MonoSoup / ICLR 2026 submission 25327)

Do not ship PatchBridge, ContractNet, or CacheFlow on the presentation path. Those remaining in `index.html` are legacy fixtures only.

Reasons:

- The slides are MonoSoup throughout.
- Prepared graph, critiques, counterfactuals, and OpenReview-derived comparison data already exist.
- One coherent story is more inspectable than three fictional profiles.

### 2.2 Canonical findings

Keep these IDs stable in UI, fixtures, export JSON, and speaker notes.

| ID | Critique | Validity | Sensitivity | Demo role |
|---|---|---|---|---|
| F01 | Practical, but theory and effect size are not yet strong enough | Supported concern | Incomplete / not constructible | Paper-level judgment; no binary repair |
| F02 | λLow is not theoretically justified by the four boundary conditions | Supported concern | Incomplete | Visible **replan ×1 → stop** path |
| F03 | Lacks a label-free rule and non-Transformer evidence | Refuted | Failed | Main live Challenge + Test path |
| F04 | Multi-ID conditioning is mandatory or OOD results are invalid | Refuted | Passed | Overstated importance; optional metric |
| F05 | Figure reports 2,409 pairs; 70 choose 2 = 2,415 | Verified | Passed | Deterministic arithmetic check |

F03 is the live 3-minute path because slides 6–7 use it.

**F03 Test interpretation (align slides with the design rule):**

Slide 7 and the design both require Validity ≠ Sensitivity. Implement F03 as:

- **Critique validity: Refuted.** ERank-MonoSoup, ConvNeXt, and R-sensitivity already exist.
- **Reviewer sensitivity: Failed.** In the baseline, the reviewer still treats the evidence as insufficient. The targeted branch that *adds/highlights* that evidence is the branch that should change a sensitive reviewer. The prepared reviewer does not update correctly, so sensitivity fails.
- **Importance: Moderate residual.** Broader architecture coverage would still be useful; the categorical absence claim is false.

Do not collapse these three into one badge.

### 2.3 Capability coverage vs the design’s four-finding table

The design’s PatchBridge table is a capability checklist, not the sample paper. Map it as follows:

| Design capability | MonoSoup finding |
|---|---|
| False accusation → counter-evidence → Refuted | F03 |
| Deterministic numerical check → Verified | F05 |
| Evidence gap → bounded replan → Supported concern | F02 |
| Missing source → Stop / Unverified | F01/F02 incomplete counterfactual (intervention not constructible) |

If a fifth “Unverified / human required” card is needed on Report, use F01’s paper-level judgment as **Human Required** for the remaining scientific-value decision, while keeping its validity as Supported concern.

---

## 3. Hard constraints

### 3.1 Must not implement now

- OpenAI / Anthropic / local LLM clients
- LangGraph, FastAPI, WebSockets
- PostgreSQL, Redis, Neo4j, vector DBs
- Live OpenReview HTTP calls
- Real PDF text extraction as a required demo path
- Authentication, multi-user state, observability
- Arbitrary-PDF scientific review
- Invented accuracy percentages (“PeerMind accuracy = 90%”)

### 3.2 May implement as local, deterministic code

- `70 * 69 / 2` pair-count checker for F05
- Fixture loading from `/public` or `src/data`
- Hash/path routing and Zustand state
- Scripted playback timers
- Optional static PDF preview of a local sample file, if added later

### 3.3 Reliability requirements

- Core demo runs with the network disabled
- Deterministic replay: same clicks → same events
- Play / Pause / Next Step / Reset on every animated page
- Hidden or keyboard **Complete instantly**
- Direct route access to every stage
- One-click reset of the whole demo
- No long loading sequence
- Prepared data packaged in the repo

---

## 4. Technology stack

Follow the design document. Do not add libraries unless a P0 page needs them.

```text
Vite
+ React 19
+ TypeScript
+ Tailwind CSS v4
+ shadcn/ui
+ Zustand
+ React Router v7
+ AntV G6          Paper Evidence Graph only
+ @xyflow/react    Defender / reviewer workflow only
+ motion           200–600 ms transitions
+ lucide-react
```

Optional, only after P0 is stable:

- `react-pdf` for a source-sheet PDF page preview
- Recharts for one comparison summary, not the main matrix
- TanStack Table only if the finding matrix becomes unwieldy

Install set:

```bash
npm create vite@latest . -- --template react-ts
npm install react-router-dom zustand @antv/g6 @xyflow/react lucide-react motion
npx shadcn@latest init
npx shadcn@latest add button card badge tabs dialog sheet select tooltip scroll-area accordion collapsible progress separator
```

---

## 5. Application architecture

### 5.1 Routes

```text
/                    Landing
/understand          Paper graph + inspector
/review              Routing + critique contracts
/challenge/:findingId
/test/:findingId
/report
/compare
/architecture
```

Unknown routes redirect to `/`. Refreshing a deep link reconstructs the prepared fixture and the minimum prerequisite state for that page (see 5.4).

### 5.2 Project structure

Create the app at the repo root (keep existing prototype files untouched until the new app runs).

```text
peermind-demo/                         # Vite app root; current files stay as references
  public/
    fixtures/
      sample-paper.pdf                 # optional later
    brand/
  src/
    app/
      App.tsx
      router.tsx
      providers.tsx
    pages/
      LandingPage.tsx
      UnderstandPage.tsx
      ReviewPage.tsx
      ChallengePage.tsx
      CounterfactualPage.tsx
      ReportPage.tsx
      ComparePage.tsx
      ArchitecturePage.tsx
    components/
      layout/
        AppHeader.tsx
        WorkflowStepper.tsx
        DemoBadge.tsx
        PresenterControls.tsx
        SourceLabel.tsx
      paper/
        PaperGraph.tsx                 # G6 wrapper
        PaperSectionNav.tsx
        PaperInspector.tsx
        SourceViewer.tsx
        KeyPointCard.tsx
      review/
        ReviewerRouter.tsx
        ReviewerTeam.tsx
        ReviewSummary.tsx
        CritiqueCard.tsx
        CritiqueContract.tsx
      defender/
        DefenderFlow.tsx               # React Flow wrapper
        EvidenceLedger.tsx
        LiveInspector.tsx
        ReplanStatus.tsx
        FindingVerdict.tsx
      counterfactual/
        VariantCard.tsx
        SpecificityCheck.tsx
        SensitivityResult.tsx
        JudgmentSplit.tsx              # validity / importance / sensitivity
      report/
        TrustProfile.tsx
        FindingReportCard.tsx
        LockBanner.tsx
      comparison/
        ReviewInput.tsx
        ComparisonPlayback.tsx
        ComparisonSummary.tsx
        FindingAlignment.tsx
        FindingMatrix.tsx
        HumanReviewPanel.tsx
        CapabilityTable.tsx
      shared/
        StatusBadge.tsx
        ProvenanceCode.tsx
        EmptyState.tsx
        Callout.tsx
    data/
      paper.ts
      paperGraph.ts
      reviewers.ts
      findings.ts
      investigations.ts
      counterfactuals.ts
      humanReviews.ts
      comparisons.ts
      architecture.ts
    demo/
      playbackEngine.ts
      scripts/
        understandReplay.ts
        reviewReplay.ts
        challengeReplay.ts             # keyed by findingId
        counterfactualReplay.ts
        compareReplay.ts
    store/
      demoStore.ts
      selectors.ts
    lib/
      pairCount.ts                     # deterministic 70 choose 2
      format.ts
      cn.ts
    types/
      paper.ts
      finding.ts
      playback.ts
      comparison.ts
    styles/
      globals.css
```

### 5.3 Demo state

One Zustand store. No page-local copies of findings.

```ts
type DemoStage =
  | 'landing'
  | 'understand'
  | 'review'
  | 'challenge'
  | 'test'
  | 'report'
  | 'compare'
  | 'architecture';

interface PlaybackSlice {
  status: 'idle' | 'playing' | 'paused' | 'complete';
  cursor: number;          // index into the active script
  speed: 1 | 1.5 | 2;
}

interface DemoState {
  paperId: 'monosoup';
  currentStage: DemoStage;
  selectedFindingId: string;           // default 'F03'
  paperGraphComplete: boolean;
  reviewComplete: boolean;
  completedFindingIds: string[];
  replanCountByFinding: Record<string, number>;
  findingsLocked: boolean;
  lockedAt: string | null;
  comparisonReady: boolean;
  humanReviewsLoaded: boolean;
  playback: PlaybackSlice;
  lastEventId: string | null;
}
```

Actions:

```text
loadPreparedDemo()
selectFinding(id)
markFindingComplete(id)
lockReview()
loadPreparedHumanReviews()
play() / pause() / nextStep() / completeInstantly() / resetStage()
resetDemo()                    // confirm if locked
```

Persist only `selectedFindingId`, `completedFindingIds`, `findingsLocked`, `lockedAt`, and `humanReviewsLoaded` in `sessionStorage`. Never persist timers.

### 5.4 Prerequisite reconstruction

Deep links must not dead-end.

| Entered route | Reconstruct |
|---|---|
| `/understand` | Load paper fixture; graph may start incomplete |
| `/review` | Mark paper graph complete; start or resume review replay |
| `/challenge/:id` | Graph + review complete; finding selected; defender at step 0 unless already completed |
| `/test/:id` | Same, plus challenge complete for that finding if the presenter skipped Challenge |
| `/report` | All five findings available; completed ones keep verdicts, others stay Not checked |
| `/compare` | Auto-lock prepared completed run PM-001 if the presenter skipped Report lock |

A presenter jumping to Compare should see a locked prepared result, not an empty state.

### 5.5 Playback engine

One engine, many scripts. Pages do not own `setInterval`.

```ts
type PlaybackEvent = {
  id: string;
  at: number;                 // ms from script start, used by Play
  type:
    | 'stage.started'
    | 'node.reveal'
    | 'node.activate'
    | 'node.complete'
    | 'router.selected'
    | 'specialist.spawned'
    | 'specialist.skipped'
    | 'evidence.discovered'
    | 'evidence.gap'
    | 'ledger.updated'
    | 'replan.started'
    | 'stop.reached'
    | 'verdict.recorded'
    | 'variant.reveal'
    | 'sensitivity.recorded'
    | 'comparison.step';
  payload: Record<string, unknown>;
};
```

Control semantics:

- **Play:** apply remaining events on their `at` timestamps.
- **Pause:** freeze cursor.
- **Next Step:** apply exactly one event.
- **Complete instantly:** apply all remaining events synchronously.
- **Reset:** cursor = 0, page-local derived view returns to empty/planned.

Reduced-motion: skip delays, apply events immediately, keep final states identical.

---

## 6. Data model and fixtures

Port the design’s TypeScript interfaces into `src/types`. Normalize `index.html` objects into those types instead of copying ad-hoc fields.

### 6.1 Shared labels

Every visible record carries one epistemic source label. Render with text + icon, not color alone.

```text
AUTHOR CLAIM
REVIEWER ALLEGATION
DEFENDER EVIDENCE
HUMAN REVIEW
AUTHOR REBUTTAL
PEERMIND ADJUDICATION
```

### 6.2 Finding status vocabulary

Use the design’s seven states:

```text
Verified | Supported Concern | Refuted | Unverified | Disputed | Human Required | Not Checked
```

Never replace these with High / Medium / Low confidence numbers.

### 6.3 Fixture files to author in Phase 1

Convert the following into typed JSON/TS modules.

**`paper.ts`**

- id, title, authors, venue, prepared-demo notice
- section list for the left rail: Abstract, Introduction, Related Work, Method, Experiments, Results, Discussion, Appendix
- 3–4 key-point cards from `model-soups-paper-knowledge-graph.js` `keyFindings`

**`paperGraph.ts`**

- nodes: method / claim / evidence / gap (no reviewer nodes)
- edges with relation + provenance source ids
- layout coordinates from the existing graph file so the first G6 version is stable

**`findings.ts`**

For each of F01–F05:

- critique text
- reviewer agent
- critique contract: allegation, type, scope, falsifier, evidence burden, stop rule, relevance target
- initial validity = `not_checked`
- final validity, importance, sensitivity, limitations, next action

**`investigations.ts`**

Per finding:

- specialist list and skip list
- ordered playback events
- evidence records (`for` / `against` / `gap`)
- replan budget and whether it fires
- final ledger snapshot

**`counterfactuals.ts`**

Per finding: question, fixed decision rule, baseline / targeted / control copy, expected behavior, specificity check, result, limitation.

**`humanReviews.ts`**

Prepared excerpts derived from `monosoup-knowledge-graph.js` review nodes. Do not fetch OpenReview. Include reviewer labels `mj9q`, `YMQp`, `q1EA`, `gzvH`, `Yqvj`, plus short meta-review and rebuttal snippets.

**`comparisons.ts`**

Finding-level alignment rows that produce:

- shared themes
- human-only theme
- PeerMind-only theme
- disagreement
- at least one human critique the defender refutes

### 6.4 Deterministic pair-count helper

```ts
// src/lib/pairCount.ts
export function unorderedPairs(n: number) {
  return (n * (n - 1)) / 2;
}
// unorderedPairs(70) === 2415
// reportedInFigure2 === 2409
// omitted === 6
```

The F05 Challenge inspector must show inputs, formula, output, reported value, and the limitation: this is a **reporting discrepancy**, not fabrication.

---

## 7. Visual and interaction system

### 7.1 Tokens

```text
Background     #f4f5f8 / white
Ink            #202339
Muted          #6a7083
Line           #e2e5ed
PeerMind       #6554cf
Verified       green  #14775a
Refuted        red    #ae3d54
Supported/gap  amber  #986412
Unverified     grey   #667085
Method/paper   blue
```

Typography:

- UI: Inter / system sans
- quoted paper text: Georgia / serif
- IDs and provenance: monospace (`F03`, `MS-S07`, `Appendix C / Table 8`)

### 7.2 Layout chrome

Persistent on workflow pages (`/understand` through `/report`):

```text
[P] PeerMind     Understand → Review → Challenge → Test → Report     Prepared demo
                 Compare is a separate Evaluation link, not a required stage
```

Stepper states: completed check, current active, upcoming muted. Direct click on a stage is allowed for presenter recovery.

Presenter controls sit in a compact bar on animated pages:

```text
Play    Pause    Next Step    Reset    ·    Complete instantly
```

Keyboard (ignore when focus is in an input):

```text
Space         Play / Pause
→             Next Step
Shift+→       Complete instantly
R             Reset stage
1–7           Jump stages
Esc           Close sheet/dialog
```

### 7.3 Animation budget

200–600 ms. No forced waits longer than one event delay (~400–800 ms) unless the presenter left Play running.

---

## 8. Page-by-page implementation

### 8.1 Landing `/`

**Goal:** product difference in 5–10 seconds.

Layout from the design: split hero.

Left:

- Eyebrow: `FALSIFIABLE AI PEER REVIEW`
- H1: `AI peer review with unit tests.`
- Sub: `Every critique must survive a challenge.`
- Primary CTA: `Review a Paper →` → `/understand` and `loadPreparedDemo()`
- Secondary CTA: `See the Defender investigate` → `/challenge/F03`

Right live example (static, already complete, no timer):

```text
AI Reviewer: "MonoSoup lacks a label-free threshold rule and evidence
beyond Transformer architectures."
        ↓
Defender checks ERank-MonoSoup / ConvNeXt / R-sensitivity
        ↓
REFUTED · categorical absence is false
Validity ≠ Sensitivity remains visible as a caption
```

Three feature cards: Make it testable / Challenge it / Change the evidence.

Footer note: prepared MonoSoup fixture, no live model.

**Do not** require a PDF upload.

### 8.2 Understand `/understand`

**Goal:** source-linked representation *before* review comments.

Three columns:

1. **Paper section nav.** Clicking a section filters G6 nodes whose `source` matches that section.
2. **Paper Evidence Graph (G6).** Node types Method, Claim, Evidence, Scope/Gap. Progressive reveal via `understandReplay.ts`. Click node or edge → inspector. Zoom/pan, focus path, neighborhood highlight.
3. **Inspector.** Record id, type, source location, excerpt, connected records, Open source sheet. Author claims labeled **Author claim · not yet verified**.

Bottom: paper model counts + 4 Key Point cards that focus a graph path + `Continue to Review →`.

G6 is used only here. Do not put reviewer workflow nodes in this graph. Do not mix human-review nodes into this graph; those belong on Compare.

Presenter: Play reveals ~3 nodes per event; Complete instantly shows the full 24-node MonoSoup paper graph.

### 8.3 Review `/review`

**Goal:** dynamic routing + atomic critique contracts, all still **Untested**.

Top: Paper signals → Reviewer Router → selected specialists. Show skipped roles (`Proof Reviewer · skipped · no theorem`).

Bottom: overall assessment, strengths, candidate critiques F01–F05 as cards with status `UNTESTED`, questions, `Challenge the Review →` (defaults to F03).

Clicking a critique opens `CritiqueContract` in a sheet:

- allegation, type, scope, falsification condition, evidence burden, stop rule
- `Challenge this critique →` `/challenge/:id`

Routing replay: chips appear after signals; skipped chips stay grey.

Do not show defender verdicts on this page.

### 8.4 Challenge `/challenge/:findingId`

**Goal:** investigation, not another review page.

Default live finding: **F03**.

Layout:

- Collapsed critique contract header
- Left: React Flow defender workflow
- Right: Live Inspector (current action, searching, evidence found)
- Bottom: Evidence Ledger + initial verdict + `Run Counterfactual Challenge →`

Workflow nodes:

```text
Interpret Critique → Evidence Plan → Generate Specialists
  → Specialist Checks (branch) → Evidence Ledger → Evidence Gate
  → Replan ×1 if needed → Adjudication
```

Branch scripts:

| Finding | Visible route |
|---|---|
| F03 | Source Auditor + Claim Mapper → counter-evidence ERank / ConvNeXt / R-sensitivity → Refuted |
| F05 | Numerical Checker → local `unorderedPairs(70)` → Verified |
| F02 | Statistics/Theory specialists → evidence gap → Replan ×1 → Stop → Supported concern |
| F01 | Judgment path → ledger of strengths + limits → Supported concern / Human Required |
| F04 | Scope Assessor → requested metric not mandatory → Refuted |

Replan UI for F02:

```text
EVIDENCE GAP
Required robustness derivation unavailable
Spawn Theory Follow-up specialist
Replan budget: 1 / 1
STOP RULE REACHED
Final status: Supported concern
```

Evidence ledger fields: finding id, allegation, FOR, AGAINST, missing, source provenance, tool provenance, validity, importance, sensitivity (empty until Test), limits, next action.

### 8.5 Test `/test/:findingId`

**Goal:** “Does the reviewer actually respond to evidence?”

Dedicated page. Three equal columns revealed sequentially:

| Column | F03 content |
|---|---|
| Baseline | Original manuscript; full counter-evidence present; prepared reviewer still says evidence is insufficient |
| Targeted change | Relevant edit only: highlight/add ERank + ConvNeXt + R-sensitivity |
| Control | Unrelated edit only, e.g. title casing / unrelated result formatting |

Then: expected behavior → specificity check → sensitivity result.

Always show the three-way split:

```text
CRITIQUE VALIDITY     REVIEWER SENSITIVITY     IMPORTANCE
REFUTED               FAILED                   MODERATE
```

Sandbox copies are labeled **prepared inspection copies**. They do not create new scientific results.

F05 Test: targeted caption disclosure should repair the reporting defect; control leaves it intact; sensitivity Passed.

F02 Test: targeted theory is **unavailable**; result Inconclusive / not constructible.

### 8.6 Report `/report`

Title: **Verified Review**.

- Paper title + run id `PM-001`
- Trust profile counts
- Filter chips: All / Verified / Supported / Refuted / Unverified / Human Required
- One card per finding with validity, importance, sensitivity, evidence, limits, inspect links
- Export JSON (graph, contracts, ledger, counterfactuals, lock metadata)
- Lock banner and `Compare with Human Reviews →`

Lock copy:

```text
PEERMIND REVIEW LOCKED
Run PM-001
Human reviews have not been loaded into the review-generation workflow.
```

Untested findings stay **Not Checked**. Direct entry to Report may offer `Load prepared completed run` for presenter recovery.

### 8.7 Compare `/compare`

Title: **Compare with Human Reviewers**. Subtitle: Independent finding-level comparison.

Do not use text-similarity percentages.

Flow:

1. Show locked PeerMind run.
2. Button: `Load Prepared OpenReview Reviews` (no paste required in the live demo).
3. Short comparison playback (normalize → extract → match → map evidence → disagree).
4. Dashboard: counts + filter tabs + alignment list + selected finding detail + finding matrix.
5. Persistent notice: human reviews are reference, not ground truth.
6. Optional capability table: Human / Single LLM / PeerMind. Capability only, no fake scores.

Prepared comparison rows (minimum):

| Theme | Humans | PeerMind | Defender |
|---|---|---|---|
| λLow / theory gap | Y (mj9q, q1EA, meta) | F02 | Supported |
| Label-free R / architectures | Y (gzvH) | F03 | Refuted (rebuttal added ERank + ConvNeXt) |
| Pair count 2409 vs 2415 | Y (q1EA) | F05 | Verified |
| Modest effect size | Y (Yqvj, meta) | F01 | Supported |
| Multi-ID OOD protocol | — | F04 | Refuted |
| Terminology / “soup” name | Y (mj9q) | — | — |

Author rebuttal example on the F03 row: humans asked for a label-free rule; rebuttal added ERank-MonoSoup; defender finds that evidence and refutes the remaining categorical absence claim.

### 8.8 Architecture `/architecture`

Support page, not a workflow stage.

- Three-stage diagram from slides 4–7
- Shared evidence ledger, not agent voting
- Deterministic vs prepared vs future live-agent
- Failure boundaries: unavailable source, no inferential evidence, counterfactual not constructible, human judgment required
- Evaluation ablation: Single LLM → Reviewer MAS → + Defender → + Counterfactual
- Reusable typed contract list from slide 9
- Team contribution table (5 members, one integrated artifact each)

---

## 9. Implementation phases

Work in this order. Do not start P1 visual polish or optional PDF preview until the P0 path is clickable end to end.

### Phase 0 — Bootstrap (0.5 day)

1. Scaffold Vite + React + TS + Tailwind + shadcn.
2. Add router, empty page shells, header, stepper, demo badge.
3. Add Zustand store with the shape in 5.3.
4. Confirm `npm run dev` and production `npm run build`.

**Exit:** every route renders a titled placeholder.

### Phase 1 — Types, fixtures, playback (1 day)

1. Port types from the design.
2. Author MonoSoup fixtures from `index.html` + graph JS files.
3. Implement `playbackEngine.ts` with unit tests for play / next / complete / reset.
4. Implement `pairCount.ts` with a one-line test.
5. Add a `DemoBadge` and a global keyboard handler.

**Exit:** fixtures typecheck; playback engine is independently testable.

### Phase 2 — Landing + Understand (1 day)

1. Landing hero, CTAs, static F03 example.
2. G6 paper graph, section filter, inspector, key-point cards.
3. Understand replay + presenter controls.

**Exit:** one-click from Landing reaches a inspectable source-linked graph with no upload.

### Phase 3 — Review (0.5 day)

1. Signal chips, router, skipped roles.
2. Critique cards and Critique Contract sheet.
3. Review replay.

**Exit:** F03 contract shows allegation, falsifier, burden, stop rule; status is Untested.

### Phase 4 — Challenge (1 day)

1. React Flow defender graph with active / done / skipped / gap styles.
2. Per-finding scripts; F03 is the polished default.
3. Evidence ledger + live inspector.
4. F02 replan/stop and F05 local arithmetic visible.

**Exit:** F03 playthrough ends on Refuted with counter-evidence in the ledger before the badge appears.

### Phase 5 — Test (0.5 day)

1. Three-column variant cards.
2. Sequential reveal + specificity + three judgment blocks.
3. F03 failed sensitivity; F05 passed; F02 not constructible.

**Exit:** a viewer can see Validity ≠ Importance ≠ Sensitivity without narration.

### Phase 6 — Report (0.5 day)

1. Trust profile, filters, finding cards, inspect links.
2. Lock + export JSON.
3. Direct-link recovery.

**Exit:** mixed statuses render; lock blocks mutation in Compare.

### Phase 7 — Compare (1 day)

1. Prepared OpenReview loader.
2. Comparison playback.
3. Summary, tabs, matrix, selected-finding panel, ground-truth disclaimer.
4. Capability table without numbers.

**Exit:** matrix counts reconcile with rows; F03 shows human concern + rebuttal + defender Refuted.

### Phase 8 — Architecture, presenter hardening, QA (0.5–1 day)

1. Architecture page.
2. Instant-complete, hash recovery, airplane-mode check.
3. 1366×768 layout pass.
4. Three-minute rehearsal using Section 12.

**Exit:** core path works offline; presenter can recover to any stage in one click.

---

## 10. Component and file-level task list

Use this as the implementation checklist. Each item is a concrete PR-sized unit.

### Shared

- [ ] `StatusBadge` maps the seven verdicts to color + icon + text
- [ ] `SourceLabel` for the six epistemic sources
- [ ] `PresenterControls` wired to the playback engine
- [ ] `WorkflowStepper` with Evaluation separated
- [ ] `SourceViewer` sheet: excerpt + locator; PDF preview optional later

### Understand

- [ ] `PaperGraph` G6 adapter: node types, focus, zoom, click
- [ ] `PaperSectionNav` filters by `source` string
- [ ] `PaperInspector` for node and edge
- [ ] `KeyPointCard` sets `focusNodes`

### Review

- [ ] `ReviewerRouter` animated chips
- [ ] `CritiqueCard` + `CritiqueContract` sheet
- [ ] Skipped-agent callout component

### Challenge

- [ ] `DefenderFlow` React Flow nodes/edges from investigation script
- [ ] `LiveInspector` shows current event payload
- [ ] `EvidenceLedger` FOR / AGAINST / GAP columns
- [ ] `ReplanStatus` budget 1/1
- [ ] `FindingVerdict` bounded status + limitation

### Test

- [ ] `VariantCard` × 3
- [ ] `SpecificityCheck`
- [ ] `JudgmentSplit` three independent blocks

### Report / Compare

- [ ] `TrustProfile`
- [ ] `LockBanner`
- [ ] `FindingMatrix` plain HTML table
- [ ] `HumanReviewPanel`
- [ ] Export helper writes one JSON blob

---

## 11. Content to port from the prototype

Do not rewrite scientific copy from scratch. Lift and normalize.

From `index.html` `monoCritiques` / `monoCounterfactuals`:

- F01–F05 titles, why-it-matters, criterion, explanation, revision, benefit
- F03 evidence: ERank-MonoSoup, ConvNeXt, R-sensitivity
- F05 calculation narrative

From `outputs/model-soups-paper-knowledge-graph.js`:

- 24 paper nodes, edges, key findings, coordinates

From `outputs/monosoup-knowledge-graph.js`:

- five human reviewers, rebuttal, meta-review, decision
- `reviewSynthesis` strengths / unresolved / outcome
- source URLs stored as static provenance text, not fetched

Landing copy from the design, not from the current PatchBridge hero.

---

## 12. Three-minute live demo runbook

The implementation must make this path the default.

**0:00–0:15 Landing**  
“AI can generate reviews quickly, but authors still have to check whether the review itself is correct. PeerMind treats every critique as an allegation that must survive a challenge.”  
Click **Review a Paper**.

**0:15–0:35 Understand**  
Show the paper graph. Click claim → evidence.  
“Before reviewing, PeerMind builds a source-linked representation so every downstream judgment can point back to the paper.”

**0:35–0:55 Review**  
Show signals, selected vs skipped specialists, open F03 contract.  
“The paper determines which specialists are needed. Each critique is a falsifiable contract, not just review prose.”

**0:55–1:35 Challenge F03**  
Play defender. Source Auditor → ERank / ConvNeXt / R-sensitivity → ledger AGAINST → **Refuted**.  
“The reviewer sounded plausible but overlooked evidence already in the paper.”

**1:35–2:15 Test F03**  
Baseline / Targeted / Control. Point at:

```text
Validity ≠ Importance ≠ Reviewer Sensitivity
```

“The original absence claim is false. Separately, the prepared reviewer did not update the way a sensitive reviewer should.”

**2:15–2:35 Report**  
Mixed statuses. Lock PM-001.  
“PeerMind does not force every criticism into a confident answer.”

**2:35–3:00 Compare**  
Load prepared reviews. Show shared theory concern, PeerMind-only F04, human-only terminology, F03 human concern refuted with rebuttal evidence.  
“PeerMind is not designed to imitate human reviewers. It makes comments inspectable, challengeable, and falsifiable.”

Backup tabs: `/challenge/F03` and `/test/F03` already completed.

---

## 13. Verification

### 13.1 Functional matrix

| ID | Test | Expected |
|---|---|---|
| A01 | Open `/` with network disabled | Landing renders, no required remote request |
| A02 | Click Review a Paper | `/understand`, MonoSoup graph replay-ready |
| A03 | Play / pause / step / reset Understand | Deterministic node reveal |
| A04 | Click node and edge | Inspector shows id, locator, excerpt, provenance |
| A05 | Open Review | Selected and skipped specialists have reasons |
| A06 | Open F03 contract | Allegation, scope, falsifier, burden, stop rule |
| A07 | Run F03 Challenge | Counter-evidence appears before Refuted |
| A08 | Run F02 Challenge | Exactly one replan, then stop / Supported concern |
| A09 | Run F05 Challenge | UI computes 2,415 and difference of 6 |
| A10 | Run F03 Test | Three columns; validity Refuted; sensitivity Failed; importance separate |
| A11 | Open Report early | Uncompleted findings remain Not Checked |
| A12 | Lock report | Banner + timestamp; Compare cannot mutate findings |
| A13 | Load prepared humans | Matrix counts match rows |
| A14 | Export | Valid JSON with graph, contracts, ledger, tests, limits, lock |
| A15 | Refresh each route | Prerequisite prepared state reconstructs |
| A16 | Complete instantly | Final state equals full Play |
| A17 | Keyboard while typing | Shortcuts do not steal input |

### 13.2 Content integrity

- Every citation points at a prepared source record
- F05 says reporting discrepancy, not misconduct
- Counterfactual copy never claims an unperformed experiment was run
- Human agreement is never “correctness”
- No quantitative PeerMind accuracy numbers
- Prepared / simulated / deterministic are labeled
- Finding IDs match this plan and the slides

### 13.3 Display

- 1366×768: no page-level horizontal overflow
- Graph canvases may scroll internally
- Semantic color always paired with a text label
- `prefers-reduced-motion` reaches the same end states
- Focus-visible on interactive controls

---

## 14. Mapping to CFAR judging

| Criterion | What the fake demo must still show |
|---|---|
| Innovativeness 25% | Critique contracts, counter-evidence search, counterfactual unit test, Validity ≠ Sensitivity |
| Teamwork 20% | Architecture page lists five integrated artifacts sharing the same finding ids |
| Reusable asset 20% | Typed ledger, graph schema, replay events, JSON export; clearly labeled as the contract a future live service would emit |
| Technical rigor 20% | Deterministic pair-count, provenance, stop rules, bounded replan, fixture boundaries |
| Agentic design 10% | Dynamic specialists, branching, replan, abstain/stop, not a fixed prompt chain |
| Demonstration 5% | Reliable 3-minute MonoSoup path with instant-complete recovery |

Honesty to judges: this build is a **prepared interactive prototype**. The reusable asset is the protocol and data contract, not a hidden live LLM.

---

## 15. Explicit non-goals and later phases

### Not this phase

- Connecting any model provider
- Implementing LangGraph / MAS runtime
- FastAPI or other backend
- Real OpenReview ingestion
- Production PDF pipeline
- Multi-paper library
- User accounts

### Later, only after the fake demo is stable

1. Replace playback scripts with a local agent runtime that writes the same JSON contracts.
2. Keep the UI; swap `src/demo/scripts/*` for live event streams.
3. Add a tiny local service: PDF in, ledger JSON out.
4. Blinded CFAR pilot with finding-level labels.

The UI should be built so that swap is a data-source change, not a page rewrite: pages read `DemoState` + typed fixtures/events, never hardcode “call the model.”

---

## 16. Definition of done for this phase

The fake demo is done when:

1. A presenter can complete the Section 12 runbook in about three minutes without a network.
2. F01–F05 are inspectable from graph → contract → ledger → counterfactual → report → comparison.
3. F03 shows counter-evidence refutation and a separate sensitivity result.
4. F05 shows a real local arithmetic check.
5. F02 shows one replan and a stop.
6. Compare uses prepared human reviews and never treats them as ground truth.
7. There is no LLM client, no backend process, and no required external API in the runtime.
8. `npm run build` produces a static app that can be served by any local static server.
