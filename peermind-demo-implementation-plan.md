# PeerMind Demo — Implementation Plan

**Status:** Historical 2.0 build plan. The running `app/` was built from this file. Do not implement new work from it.

**Current target:** `peermind-system-design.md`, `peermind-demo-tech-uiux-design.md` v3.0, and `peermind-demo-refinement-implementation-plan.md`.

**Goal:** A good-looking, content-agnostic **fake demo** of the PeerMind workflow. Presenters can load a prepared package, walk Understand → Report, then Compare. No live model, no backend, no internet required.

**Design sources:**

- Product / IA / data: `peermind-demo-tech-uiux-design.md`
- Visual tokens: `peermind-demo-design-rules.md`

**Priority:** Look and UX flow first. Skip real AI, skip production infra, skip a test suite.

**Time box:** Four phases. Each phase should leave a clickable demo, not a half-wired scaffold.

---

## Constraints (read once)

1. **Fake but honest.** Playback of prepared JSON. Never pretend a network model is running. Badge: `Prepared sample · No live AI`.
2. **Content-agnostic UI.** No paper title, claims, findings, or numbers in components. All of that lives in `DemoDataPackage`.
3. **Offline demo.** Bundle fonts, demo JSON, and paper assets. Do not rely on CDNs at presentation time.
4. **Almost no tests.** No Jest/Vitest/Playwright suite. Acceptance = `npm run build` plus a manual click-through of the presentation script. Zod validation of the package **is** required (it prevents a live demo crash).
5. **Do not build P2** from the design doc: real PDF parsing, real LLM Q&A, OpenReview API, real semantic alignment, TanStack Table, Recharts, Neo4j, FastAPI, auth.

Reuse the existing `index.html` only as a **visual and content mine**. Do not extend that file. The new app is a Vite + React rewrite.

---

## Target stack

```text
Vite · React · TypeScript
Tailwind CSS + shadcn/ui
Zustand · React Router · Zod
AntV G6          → Paper Evidence Graph only
XYFlow           → Defender workflow only
Motion           → short reveals
Lucide React     → icons
react-pdf        → optional; page-image / excerpt first
```

No PostgreSQL, Redis, LangGraph, WebSockets, or auth.

Suggested app root: `app/` (keep current `index.html` as a reference until the new demo replaces it).

---

## Recommended repo layout

Follow design doc §25. Condensed:

```text
app/
  src/
    app/            App.tsx, router.tsx
    pages/          one file per route
    components/     layout, paper, review, defender, counterfactual, report, comparison, ask
    data/           schema.ts, loadDemoPackage.ts, adapters/
    demo/           playbackEngine.ts
    store/          demoStore.ts
    types/
    styles/         tokens.css (from design rules)
  public/
    demo-data/      bundled DemoDataPackage JSON
    papers/         PDF and/or page images
    fonts/          Inter (if not npm-bundled)
```

---

## What “done” means for the whole demo

A presenter, with no network, can:

1. Open the app, read the landing in under 10 seconds, load the bundled package (one click).
2. Walk **Understand → Review → Challenge → Test → Report → Compare** using only on-screen controls.
3. Click a graph node / finding / evidence row and see the matching paper highlight or excerpt.
4. Play, step, skip, and reset the defender animation.
5. Lock the run, load prepared comparison data, show shared / human-only / PeerMind-only / disagreement.
6. Optionally open Ask PeerMind and click one suggested question.

If those six hold, the demo is shippable even if PDF.js is unused and Ask is fully canned.

---

# Phase 1 — Foundation, shell, and intake

**Outcome:** The app looks like PeerMind, loads a validated package, and blocks the workflow until then.

**Why first:** Every later page reads Zustand + the schema. If tokens and the package contract are wrong, you will restyle and reshape everything.

### 1.1 Scaffold

- Vite React TypeScript app.
- Tailwind + shadcn with colors from `peermind-demo-design-rules.md` (override default zinc primary to `#6554CF` immediately).
- Bundle Inter locally (`@fontsource/inter` or `public/fonts`). Georgia stays system.
- React Router routes:

```text
/                Landing
/intake          Intake (can be combined with landing)
/understand
/review
/challenge/:findingId
/test/:findingId
/report
/compare
/architecture    stub page is enough
```

- Lucide, Zustand, Zod, Motion. Defer G6 / XYFlow / react-pdf until the phase that needs them.

### 1.2 Design system in code

Implement, do not approximate:

- CSS variables for surfaces, accent, status colors.
- Button / Card / Badge / Sheet / Dialog / Tabs / Tooltip / ScrollArea / Accordion / Progress / Separator / Textarea.
- `AppHeader`, `WorkflowStepper`, `DemoModeBadge`.
- Status pill component mapped to `FindingValidity`.
- Empty-state and validation-error layouts.

Follow spacing, type scale, header `76px`, and sidebar `210px` from the design rules.

### 1.3 Data contract

Port the TypeScript interfaces from the design doc (§8–23) into `src/types` and a **Zod** schema in `src/data/schema.ts`.

Validate at load:

- unique IDs
- graph edges point at existing nodes
- `sourceIds` resolve
- findings, investigations, counterfactuals, playback node IDs, selected agents, Ask matches, comparison-preset refs

On failure, show a diagnostic page (design §28). Do not render half a graph.

Adapters (same UI for all):

- bundled JSON (default, one-click)
- user-selected JSON file
- (optional) TS fixture import — not required if bundled JSON works

### 1.4 Store

Zustand `DemoState` as in design §24: package, stage, selection, playback, lock, comparison, ask.

Navigation to workflow routes is disabled while `packageStatus !== 'ready'`.

### 1.5 Landing + Intake

Landing must explain the product in 5–10 seconds **without** a hard-coded sample finding. Before load: empty product hero + three generic pillars (Make it testable / Challenge it / Change the evidence). After load: show **package** title, metadata, short Zod summary, **Start Review**.

Intake actions:

- Load Demo Package (bundled)
- Load Paper / JSON file (for the “this is generic” beat)
- Start Review → `/understand`

### 1.6 Fixture package (minimal but real)

Create `public/demo-data/demo-package.json` with enough records that Phase 2–3 are not blocked:

- paper metadata + 4–8 sections
- 8–15 sources with excerpts (and highlight regions if page images exist)
- a small paper graph
- a summary
- reviewer signals + 3–5 agents + a review document
- 3–6 findings (mixed statuses)
- one investigation with a replan event
- one counterfactual
- report block
- a few Ask prepared responses
- a comparison preset

**Mine content from the current `index.html` / sample paper**, but put it only in JSON. If PDFs are not handy, use `previewMode: "excerpt_only"` for Phase 1–2.

### 1.7 Out of scope this phase

G6 graph, XYFlow, playback, Compare, Ask drawer (header button can be disabled), PDF renderer.

### 1.8 Acceptance (manual, ~10 min)

- Tokens match the design rules on Landing and a blank Understand shell.
- Bundled package loads; invalid JSON shows the diagnostic.
- Stepper visible; Review+ routes blocked until load.
- `npm run build` succeeds.
- Works with the network disabled after the first local serve (fonts and JSON bundled).

---

# Phase 2 — Understand and Review

**Outcome:** The inspection story works: paper graph ↔ preview ↔ critique cards.

This is the first half of the live script (0:00–1:05).

### 2.1 Understand page

Three-pane layout from the design:

```text
Section nav | Paper Evidence Graph (G6) | Paper Preview / Inspector
Key point cards
Continue to Review
```

**PaperGraph (AntV G6)**

- Node types from package only: method, claim, evidence, gap, question.
- Colors from design rules §2.4.
- Prefer **prepared layout hints** in JSON over a live force layout (deterministic for the talk).
- Click node → set `selectedPaperNodeId` + `selectedSourceIds`.
- Reveal animation on first visit (Motion / G6); honor reduced motion.

**PaperPreview**

Implement the component API in design §10. For the hackathon, ship **two adapters**, use the first that the package supports:

1. **Page images** — most reliable highlighting (pre-render only pages cited by the package).
2. **Excerpt-only** — source cards with page/section/excerpt; never a broken iframe.

`react-pdf` is optional in this phase. Add it only if page images are missing and a PDF is already in-repo. Overlay boxes use normalized 0..1 coordinates. No page number hard-coded in the component.

**SourceInspector**

Record ID, type, label, location, excerpt, connected records, Open source, Ask about this source (Ask can no-op until Phase 4).

**KeyPointCard** — from `paperSummary` only.

Bidirectional: click highlight → show which claims/findings reference it (query the loaded package).

### 2.2 Review page

Make routing visible, then show the full review:

1. Paper signal chips
2. Reviewer router → selected specialists (and skipped candidates)
3. Review editor / complete review: overall assessment, strengths, finding cards, author questions
4. Critique Contract **drawer** (not a new route)

**CritiqueCard:** id, category, critique, status, agent, source path, Inspect contract, Challenge.

**CritiqueContract drawer:** fields from `CritiqueContract` + current status + Open source + Challenge this critique → `/challenge/:findingId`.

Short playback of routing events is nice if cheap (signal chips → agents). If time is tight, render the final routed team immediately and keep a compact “ROUTING DECISION” callout list from `routingEvents`.

### 2.3 Shared selection behavior

Selecting a finding, evidence badge, or graph node always:

1. Resolves `sourceIds`
2. Jumps Paper Preview
3. Draws highlights
4. Emphasizes the selected region
5. Shows id / page / role / excerpt in the inspector

### 2.4 Out of scope this phase

Defender XYFlow, counterfactual page, report aggregation, comparison, Ask answers.

### 2.5 Acceptance (manual, presentation slice)

- Load package → Understand: click two different node types, preview/excerpt follows.
- Review: open one contract, sources listed, **Challenge** lands on `/challenge/:id` (page may be a placeholder until Phase 3).
- No sample-specific strings in component source (`rg` for a known paper title in `src/` should only hit JSON or comments).

---

# Phase 3 — Challenge, Test, Report

**Outcome:** The product differentiator is demoable: unit-test the critique, then publish a locked review.

This is the core talk (1:05–2:35).

### 3.1 Playback engine

Generic `playbackEngine.ts`. It only advances `PlaybackEvent[]` and updates store flags. It does **not** contain scientific text.

Events from design §23: message, activate/complete node, spawn_agent, reveal_source, update_ledger, replan, verdict, stop.

Controls on Challenge (and anywhere else that animates): Play, Pause, Next step, Reset, Complete instantly.

Default for live talks: presenter can run **Next step** only. Auto-play is optional and slow-ish (≤700ms/event). No fake multi-second thinking.

### 3.2 Challenge page

Layout:

```text
Header: finding id + critique quote
Defender workflow (XYFlow) | Live inspector + Paper Preview
Evidence ledger (for / against / gaps / provenance)
Validity + limits
Playback controls → Continue to Test (if package has a test)
```

**DefenderFlow (XYFlow, not G6)**

- Nodes/edges from `InvestigationRecord`.
- States: idle, current, done, blocked, skipped, counterfactual.
- Bounded replan must be **visible** when the package includes a `replan` event: gap callout → new node/agent → re-check → stop. Loop count and reasons come from data.

**LiveInspector:** current action text, current source, Open source.

**EvidenceLedger:** three columns/groups from `finalLedger` / in-progress updates. Click a row → preview.

**FindingVerdict:** `FindingValidity` pill + limitations. Never a single 0–100 confidence bar as the answer.

Deep-link `/challenge/:findingId`. Provide **All findings** back to Review.

### 3.3 Test (counterfactual) page

Three columns, always: **Baseline | Targeted change | Control**.

Then: expected behavior, sensitivity result (`passed | failed | inconclusive | not_applicable`).

Then three **separate** judgments:

1. Critique validity
2. Reviewer sensitivity
3. Scientific importance

Do not merge them into one score. Data from `CounterfactualRecord`. If a finding has no test, show a generic empty state and a link to Report — do not invent a test in the UI.

### 3.4 Report page

- Paper metadata
- Review summary
- Trust profile (counts by status, computed from findings)
- Filter chips: All / Verified / Supported / Refuted / Unverified / Human Required
- Finding report cards: status, critique, evidence summary, importance, sensitivity, limits, Inspect investigation, Open source
- **PeerMind run lock** — button **Lock and Compare** writes `LockedRun` (`runId`, `lockedAt`, finding ids). After lock, review data is read-only. Compare route stays disabled until lock.

Export can be `window.print()` on the Report view (design rules §13). Do not build a PDF exporter.

### 3.5 Acceptance (manual)

- One finding: Play/Next through defender, source highlights update, a replan appears if present, final pill matches package.
- Complete instantly works (recovery if the presenter overshoots).
- Test page shows three variants and three separate judgments.
- Report filters work; lock persists in the store; Compare is reachable only after lock.
- Reset from header or playback returns Challenge to event 0.

---

# Phase 4 — Compare, Ask PeerMind, demo polish

**Outcome:** Evaluation beat + secondary Ask + presenter-proofing.

Keep this phase short. If time slips, ship Phase 3 and add only prepared comparison + a thin Ask.

### 4.1 Compare

**Input state (after lock):**

- Left: locked run summary (paper, run id, finding count) — clearly labeled LOCKED.
- Right: paste Human Reviewer 1, add reviewer, optional meta-review / rebuttal / baseline, import comparison JSON, **Load prepared comparison**, Compare Reviews.

For the hackathon, **Mode B** (prepared alignment in the package) is the real path. Manual paste should still **look** live: if the presenter pastes text and clicks Compare, either (a) show the prepared result with a note that this demo uses the prepared alignment, or (b) if paste is empty, just load the preset. Do **not** build NLP matching.

**Dashboard:**

- Counts: human reviewers, PeerMind findings, shared, human-only, PeerMind-only
- Filters: All / Shared / Human only / PeerMind only / Disagreement / Refuted
- List + inspector: theme, human excerpt, PeerMind finding, evidence, defender status
- Persistent principle copy:

> Human reviews are independent reference points, not ground truth. Agreement does not prove correctness, and disagreement does not imply PeerMind is wrong.

Human cards must not use PeerMind purple as their fill (design rules §2.7).

Skip TanStack Table and Recharts. A filterable list + inspector is enough.

### 4.2 Ask PeerMind

Right sheet, collapsed by default. Context from store (`scope` + `contextIds`). 2–4 suggested chips from `AskPeerMindConfig`.

Match `PreparedAskResponse`; render answer, source links (open preview), optional action buttons (`open_source`, `focus_graph`, `open_finding`, …). If a match implies a check, show a tool-trace row, not a chatty paragraph.

Fallback when nothing matches — exact sentence from the design doc.

Entry points (wire as many as cheap): header, inspector, critique drawer, report card, compare inspector. Header is mandatory; the rest can share one `openAsk(scope, ids)` helper.

### 4.3 Architecture page

A static, generic diagram of the six stages + Ask as secondary. No paper content. Optional; skip if behind schedule.

### 4.4 Presenter polish (do these; they matter more than tests)

- Demo badge + “Interactive demonstration” + one-click **Reset demo** (clears lock, playback, comparison, Ask; keeps or reloads bundled package).
- Direct URL to each stage still works after package load (store in memory is enough; `sessionStorage` of package id is a plus).
- Empty / invalid / locked-gate states look designed, not like crashes.
- Reduced-motion path.
- Keyboard: stepper, finding rows, sheet focus trap.
- Landing / Understand / Challenge checked at **1440px** and **1280px**.
- Remove any remaining CDN use.
- Replace root README demo pointer from old `index.html` to the Vite app when you cut over.

### 4.5 Out of scope (stay out)

Real LLM, real OpenReview, real PDF text-range highlighting, analytics, auth, dark mode, mobile-first redesign, unit/e2e tests, performance profiling beyond “the graph does not jank during Next step”.

### 4.6 Acceptance (manual, full talk)

Run the 3-minute script in design §33 on a cold load with network off:

| Time | Beat | Must see |
|---|---|---|
| 0:00 | Landing | Load package, no hard-coded paper |
| 0:15 | Understand | Graph + source highlight |
| 0:40 | Review | Routing + one Critique Contract |
| 1:05 | Challenge | Defender + ledger + optional replan |
| 1:45 | Test | Baseline / Targeted / Control |
| 2:15 | Report | Mixed statuses, lock |
| 2:35 | Compare | Prepared alignment themes |
| Optional | Ask | One suggested question + source link |

---

## Cross-cutting rules for every phase

| Rule | Practice |
|---|---|
| No paper in components | Put sample strings only under `public/demo-data` or `src/data/fixtures` |
| Generic chrome copy only | Design doc §2.2 |
| Evidence first | Any verdict/finding/node has Open source |
| Progressive disclosure | Contracts, traces, logs in drawers |
| Playback owns time | Components do not `setTimeout` their own “thinking” copy |
| Visual system | Design rules file is source of truth; do not introduce new colors |
| Testing | Zod at the boundary + manual script. No test app. |

---

## Suggested build order inside a phase

Always: **tokens/layout → data on the page → interaction → motion**. Do not start G6 animation before the inspector shows the selected node in a static state.

---

## Cut line if time runs out

Ship in this order (stop at the last complete line):

1. Phase 1 + Understand excerpt-only + Review list + Report static + no Compare  
2. + Challenge playback + lock  
3. + Test + Compare prepared  
4. + Paper highlights + Ask + polish  

A beautiful Challenge + Report with excerpt sources beats a fragile PDF.js + empty Compare.

---

## Explicitly not a phase

- Migrating the old `index.html` behavior 1:1
- Production backend swap (keep adapters so a later JSON API can replace the file loader)
- Filling the demo package for a second paper (that is data work after the UI exists)

When a second paper appears, replace `public/demo-data/*.json` and paper assets only.
