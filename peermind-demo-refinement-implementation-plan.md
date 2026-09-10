# PeerMind Demo — Refinement Implementation Plan

**Goal:** Update the existing prepared demo in `app/` so it matches `peermind-system-design.md` and `peermind-demo-tech-uiux-design.md` v3.0. This is a refinement of a working 2.0 demo, not a greenfield rebuild.

**Design sources:**

- System architecture: `peermind-system-design.md`
- Product / IA / data: `peermind-demo-tech-uiux-design.md` (v3.0)
- Visual tokens: `peermind-demo-design-rules.md`

**Why this exists:** The 2.0 demo treats counterfactual testing as a primary stage (`/test`) and treats the defender as the whole verification story (`/challenge`). That is the incorrect architecture. Counterfactual analysis is a tool inside impact verification. Verification is the overall process. Truth and impact are separate.

**Priority:** Correct the workflow and the product story first. Keep Understand, Paper Preview, Compare, and Ask unless a change is required by the new schema.

**Time box:** Four phases. Each phase should leave a clickable demo.

The original build plan (`peermind-demo-implementation-plan.md`) stays as the 2.0 historical record. Do not rewrite it. Implement against this file.

---



## Constraints (read once)

1. **Content-agnostic UI.** No paper title, claims, findings, or numbers in components. All of that lives in `DemoDataPackage`.
2. **Offline demo.** Do not add network calls.
3. **Almost no tests.** Acceptance = `npm run build` plus a manual click-through of the new presentation script. Zod validation of the package is required.
4. **Reuse the current app.** Do not scaffold a second Vite project. Do not migrate `index.html`.
5. **Do not rebuild P2.** No live PDF parsing, no live LLM, no OpenReview API, no formal proof runner, no live literature search.

---



## What is wrong in the current demo


| Current 2.0 behavior                                                   | Why it is wrong                                                          | Target 3.0 behavior                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Stepper: Understand → Review → Challenge → Test → Report               | Counterfactual is not a stage. Plan is missing. Report is not synthesis. | Understand → Plan → Review → Verify → Synthesize                    |
| Review page shows a complete review, then “Challenge”                  | Reviewers produce candidate findings, not the final review               | Review lists atomic findings; conference review moves to Synthesize |
| `/challenge` is a Defender investigation                               | Defender is one adversarial strategy inside verification                 | `/verify` is Evidence + Impact                                      |
| `/test` is Baseline / Targeted / Control                               | That tests reviewer-update behavior, not claim-support sensitivity       | Optional counterfactual tool on the Impact tab                      |
| Statuses: Verified, Supported Concern, Human Required, Disputed        | Mixes truth, uncertainty, and process states                             | `EvidenceVerdict` + `FindingStatus` from the system design          |
| Landing pillars: Make it testable / Challenge it / Change the evidence | Elevates the old Test stage                                              | Is it true? / Does it apply? / Does it matter?                      |
| No skipped-capability story on its own page                            | Dynamic routing is the Plan beat                                         | Plan page shows selected and skipped reviewers/verifiers            |


---



## What to keep

Do not rewrite these unless the schema forces a small API change:

- `UnderstandPage` and the paper graph / preview / inspector
- Compare page structure and lock-before-compare
- Ask PeerMind drawer (update scopes and copy only)
- Playback engine timing and presenter controls
- Design tokens, shadcn primitives, fonts, `DemoModeBadge`
- Bundled page-image / excerpt preview adapters
- Session persistence, reset, validation diagnostic

Keep XYFlow. Rename the canvas from Defender workflow to Verification workflow.

---



## Target routes

```text
/
/understand
/plan
/review
/verify/:findingId
/synthesize
/compare
/architecture
```

Compatibility redirects, so old presenter notes and bookmarks still work:

```text
/challenge            -> /verify
/challenge/:findingId -> /verify/:findingId
/test                 -> /verify
/test/:findingId      -> /verify/:findingId?panel=impact
/report               -> /synthesize
```

---



## Target stack (unchanged)

```text
Vite · React · TypeScript
Tailwind CSS + shadcn/ui
Zustand · React Router · Zod
AntV G6          → Paper Evidence Graph only
XYFlow           → Verification workflow only
Motion           → short reveals
Lucide React     → icons
```

---



## What “done” means

A presenter, with no network, can:

1. Open the app, read the new pitch in under 10 seconds, load the bundled package.
2. Walk **Understand → Plan → Review → Verify → Synthesize → Compare**.
3. On Plan, see selected reviewers, selected verifiers, and at least one skipped capability with a reason.
4. On Review, open a Verification Contract and go to Verify. There is no complete conference review yet.
5. On Verify, play evidence collection (including a skipped tool if present), then open Impact and see scope, necessity, and sensitivity as three judgments.
6. If the finding has a counterfactual record, see either a defined intervention or `NOT IDENTIFIABLE`. There is no Test stage.
7. On Synthesize, see original critique vs calibrated comment, then lock and Compare.

If those hold, the refinement is shippable even if Ask copy is thin and the Architecture page is only updated text.

---



# Phase 1 — Schema, copy, and shell

**Outcome:** The app speaks the new workflow even if Verify is still the old Challenge page behind a rename. The 1.0 package no longer loads.

**Why first:** Every page reads Zustand + Zod. If the contract is wrong, later UI work will be redone.

### 1.1 Schema bump

Change `DemoDataPackage.schemaVersion` from `'1.0'` to `'2.0'`.

Port interfaces from the v3 design doc into:

```text
app/src/types/finding.ts
app/src/types/verification.ts   (new; replaces most of investigation.ts)
app/src/types/demoPackage.ts
app/src/types/ask.ts
app/src/types/paper.ts          (add node / source types as needed)
app/src/data/schema.ts
```

Required new or reshaped fields:

```text
reviewPlan
verifications[]          (replaces investigations[])
impactAssessments[]
counterfactualTests[]    (new shape: identifiable + intervention, not 3 variants)
synthesis                (replaces report)
findings[].proposedSeverity
findings[].evidenceVerdict
findings[].status
findings[].calibratedComment
findings[].contract      as VerificationContract
```

Remove or stop reading:

```text
reviewerRun.review as a complete conference review
findings[].validity
findings[].importance / sensitivity as the old 2.0 shapes
investigations[]
CounterfactualRecord.baseline / targeted / control / result
```

`schemaVersion: '1.0'` must fail validation with a clear diagnostic: the package needs a 2.0 migration. Do not write a silent compatibility shim inside React components.

### 1.2 Package migration

Update the bundled package (currently `app/public/demo-data/model-soups-v1.demo.json` or whatever `bundledPackageAdapter` points at).

Migration rules for each finding:

1. Keep critique text, sources, and reviewer assignment.
2. Rewrite `contract` into a verification question, evidence burden, falsifier, preferred tools, and stop rule.
3. Move the old investigation into `verifications[]`. Relabel defender-only nodes so the planner and auditors are visible. Add a skipped Formal Proof Verifier node if the paper has no theorem-level guarantee.
4. Move old `importance` / `sensitivity` into `impactAssessments[]` as scope, necessity, and sensitivity. Write real explanations; do not copy one sentence into all three fields.
5. Convert an old 3-variant test into either:
  - an identifiable intervention (`currentSupport` / `intervention` / `reevaluatedSupport`), or
  - `identifiable: false` with a reason.
6. Write `calibratedComment` for every finding that appears in Synthesize.
7. Move overall assessment, strengths, recommendation, and author questions into `synthesis`.
8. Add `reviewPlan` with paper type, central claims, selected reviewers/verifiers, and skipped capabilities.

Do not invent new scientific claims. Re-frame the existing Model Soups (or current sample) story.

Suggested finding coverage in the migrated package:

```text
At least one REFUTED or PARTIALLY SUPPORTED absence claim   (Source Auditor)
At least one VERIFIED numerical finding                     (Numerical Auditor)
At least one PARTIALLY SUPPORTED novelty / related-work finding
At least one SEVERITY DOWNGRADED finding                    (true, but low necessity or low impact)
At least one skipped Formal Proof Verifier
At most one identifiable counterfactual tool
At most one NOT IDENTIFIABLE counterfactual
```



### 1.3 Status model in the UI

Replace `FindingValidity` and `StatusPill` mappings.

```text
EvidenceVerdict
  supported | partially_supported | refuted | unverifiable | open_question

FindingStatus
  verified_high_impact | verified_moderate_impact | verified_low_impact
  | partially_supported | refuted | unverifiable | open_question
  | severity_downgraded
```

Update CSS token usage in `StatusPill` to the design-rules v3 labels. Retired labels must not appear in chrome copy.

Update `trustProfileCounts` to count evidence verdicts and final statuses separately if both are shown.

### 1.4 Shell and routes

Update these files together:

```text
app/src/app/router.tsx
app/src/components/layout/WorkflowStepper.tsx
app/src/components/layout/WorkflowLayout.tsx
app/src/store/demoStore.ts
app/src/pages/LandingPage.tsx
app/src/pages/ArchitecturePage.tsx
```

- Stepper and sidebar: Understand → Plan → Review → Verify → Synthesize. Compare stays under Evaluation.
- Store stages: add `plan`, `verify`, `synthesize`; remove `challenge`, `test`, `report`.
- Add `verifyPanel: 'evidence' | 'impact'`.
- Landing hero and pillars: use the v3 pitch. Remove “Change the evidence.”
- Architecture page: six stages matching the new IA. No Test card.

Temporary wiring allowed in this phase only:

```text
/plan        can render a thin page from reviewPlan, even if Review still shows routing
/verify      can mount the current ChallengePage content under the new name
/synthesize  can mount the current ReportPage content under the new name
```

That keeps the demo walkable while Phase 2 and 3 do the real page work.

### 1.5 Out of scope this phase

New Impact UI, calibrated-comment cards, deleting Challenge/Test files, Ask rewrite.

### 1.6 Acceptance (manual, ~15 min)

- Invalid 1.0 package shows a schema-version diagnostic.
- Valid 2.0 package loads; stepper shows the five new stages.
- Landing no longer mentions Challenge / Test / unit tests.
- Old URLs `/challenge/:id`, `/test/:id`, `/report` redirect.
- `npm run build` succeeds.

---



# Phase 2 — Plan, Review, and Verify / Evidence

**Outcome:** The director and the verification story are demoable without a Test page.

This is the first half of the live script (0:00–1:50).

### 2.1 Plan page

Add `app/src/pages/PlanPage.tsx` and `app/src/components/plan/`.

Show only package data:

- paper type
- central claims (chips that focus the paper graph / preview)
- selected reviewers
- selected verification capabilities
- skipped reviewers and skipped verifiers, each with a reason
- compact routing-decision callouts

Move `ReviewerRouter`, `ReviewerTeam`, and `RoutingCallouts` here, or wrap them so Review no longer owns routing.

The skipped Formal Proof Verifier (or whichever skip the package has) must be visible without opening a drawer.

Continue CTA: `Continue to Review`.

### 2.2 Slim Review page

`ReviewPage` becomes a candidate-finding list.

- Remove the complete-review block (overall assessment, strengths, recommendation).
- Keep finding cards, but change the primary action from `Challenge` to `Verify`.
- Rename `CritiqueContract` to `VerificationContract` (file can stay and re-export during the move).
- Drawer fields: allegation, target claim, verification question, evidence burden, falsifier, preferred tools, stop rule, proposed severity.

If `reviewerRun.review.draftNotes` exists, put it in a collapsed “Reviewer draft (unverified)” well. Default view is the finding list.

### 2.3 Verify page, Evidence tab

Rename and reshape, do not start over:

```text
ChallengePage.tsx        -> VerifyPage.tsx
components/defender/     -> components/verification/
DefenderFlow             -> VerificationFlow
FindingVerdict           -> EvidenceVerdict
```

Page chrome:

```text
04 / Verify / <finding id>
Proposed severity
[ Evidence ] [ Impact ]
```

Evidence tab keeps:

- XYFlow playback
- live inspector + Paper Preview
- evidence ledger (for / against / gaps / provenance)
- Play / Pause / Next / Reset / Complete instantly
- All findings back-link

Evidence tab adds:

- tool trace with invoked and skipped tools
- `skip_node` playback events
- evidence verdict, not a final conference status
- copy that the defender is searching for counter-evidence, not judging the paper alone

Continue CTA on this tab: switch to Impact, or `Continue to Synthesize` after impact exists.

Remove `Continue to Test`.

### 2.4 Query helpers

Update `app/src/data/queryPackage.ts`:

```text
getVerification(pkg, findingId)
findingIdsWithVerifications(pkg)
getImpactAssessment(pkg, findingId)
getCounterfactual(pkg, findingId)   (new record shape)
trustProfileCounts                  (new enums)
```

Delete `findingIdsWithTests` once `/test` is gone.

### 2.5 Out of scope this phase

Impact panel UI beyond a placeholder tab, Synthesize calibration cards, Compare label sweep.

### 2.6 Acceptance (manual)

- Plan shows a skip with a reason.
- Review has no full conference review and no Challenge button.
- Verify / Evidence plays a finding, highlights sources, can show a skipped tool, and ends on an evidence verdict.
- There is no Test item in the stepper.
- No sample-specific strings in `app/src` except comments.

---



# Phase 3 — Impact, Synthesize, retire Test

**Outcome:** Truth and impact are visibly separate. Counterfactual is a tool. The final review is calibrated.

This is the core talk (1:50–2:30).

### 3.1 Impact tab

Add `app/src/components/impact/`:

```text
ImpactPanel.tsx
ScopeNecessity.tsx
CounterfactualTool.tsx
```

Always render three separate rows when an assessment exists:

1. Scope relevance
2. Necessity
3. Sensitivity

Each row: level pill + explanation from the package.

Rules:

- If evidence is `refuted`, show “Impact not applicable” instead of inventing sensitivity.
- If no `impactAssessments` record exists, show a generic empty state and a link to Synthesize.
- Do not show a single importance score.



### 3.2 Counterfactual tool

Replace `components/counterfactual/` (`VariantCard`, `SpecificityCheck`, `SensitivityResult`) and delete `CounterfactualPage.tsx`.

Render `CounterfactualTool` only when a record exists:

- Identifiable: current support, intervention, re-evaluated support, sensitivity.
- Optional current / intervened variants if present. Never require a control column.
- Not identifiable: the exact `NOT IDENTIFIABLE` pattern from the system design, plus the loaded reason.

If the old 3-variant JSON is still in the file during migration, fail Zod. Do not render Baseline / Targeted / Control “for compatibility.”

### 3.3 Synthesize page

Rename and reshape:

```text
ReportPage.tsx              -> SynthesizePage.tsx
components/report/          -> components/synthesize/
```

Keep lock-and-compare and print CSS.

Add:

- conference-style sections from `synthesis`
- filter chips for the new statuses
- finding cards that show original critique and `calibratedComment` side by side when expanded
- impact summary (scope / necessity / impact / final severity)
- Inspect verification (not “Inspect investigation”)

Eyebrow / title copy should say calibrated review, not “Evidence before confidence” alone. The beat is: verified ledger in, constructive rewrite out.

### 3.4 Delete retired surfaces

After redirects are in place, delete:

```text
app/src/pages/ChallengePage.tsx
app/src/pages/CounterfactualPage.tsx
app/src/pages/ReportPage.tsx
app/src/components/defender/          if anything remains
app/src/components/counterfactual/
```

Grep `app/src` for `challenge`, `Continue to Test`, `Supported Concern`, `Human Required`, `Baseline`, `Targeted change`. Those strings should remain only in comments that explain the 2.0 retirement, if at all.

### 3.5 Playback events

Extend `playbackEngine.ts` / types for:

```text
skip_node
evidence_verdict
impact_update
calibrate
```

Keep `verdict` out of new packages. If a leftover event appears, treat it as `evidence_verdict` only in the loader, not in UI copy.

### 3.6 Acceptance (manual)

- One finding: Evidence playback, then Impact with three judgments.
- A second finding: either an identifiable counterfactual tool or a NOT IDENTIFIABLE callout. No `/test` route content.
- Synthesize shows at least one before/after calibration and mixed final statuses.
- Lock still gates Compare.
- Reset returns Verify playback to event 0.

---



# Phase 4 — Compare, Ask, data polish

**Outcome:** Evaluation and secondary Ask match the new language. The talk is presenter-proof.

### 4.1 Compare

Keep the page. Update labels only:

- “Defender status” → “Verification status”
- Filter chips use the new statuses
- Inspector can link to `/verify/:findingId`

Prepared comparison JSON in the package must reference 2.0 finding IDs and statuses.

### 4.2 Ask PeerMind

Update `AskContextScope`:

```text
verification
impact
synthesis
```

Retire or alias:

```text
report
open_investigation
```

Add 2–4 suggested prompts that fit the new beat (contract, counter-evidence, why severity dropped, why a tool was skipped). Prepared answers stay in the package.

### 4.3 Architecture and README

- Architecture page matches Understand → Plan → Review → Verify → Synthesize, plus Compare and Ask.
- Root `README.md`: walk Understand → Synthesize → Compare, not Understand → Report.



### 4.4 Presenter polish

- `Reset demo` clears lock, playback, comparison, Ask, and `verifyPanel`.
- Direct URLs to `/plan`, `/verify/:id`, `/synthesize` work after package load.
- `?panel=impact` opens the Impact tab.
- Reduced-motion path still disables XYFlow dash animation.
- Landing / Understand / Verify checked at 1440px and 1280px.



### 4.5 Out of scope (stay out)

Real LLM, live literature search, formal proof tools, real OpenReview, mobile-first redesign, unit/e2e tests, a second sample paper.

### 4.6 Acceptance (manual, full talk)

Run the 3-minute script in the v3 design doc §33 on a cold load with network off:


| Time     | Beat              | Must see                                                     |
| -------- | ----------------- | ------------------------------------------------------------ |
| 0:00     | Landing           | Verify-the-reviewer pitch, load package, no hard-coded paper |
| 0:15     | Understand        | Graph + source highlight                                     |
| 0:40     | Plan              | Selected team + one skipped capability                       |
| 0:55     | Review            | One Verification Contract, no final review                   |
| 1:10     | Verify / Evidence | Tools, ledger, optional skip/replan, evidence verdict        |
| 1:50     | Verify / Impact   | Scope, necessity, sensitivity; optional counterfactual tool  |
| 2:10     | Synthesize        | Original vs calibrated comment, lock                         |
| 2:30     | Compare           | Prepared alignment themes                                    |
| Optional | Ask               | One suggested question + source link                         |


---



## File-level change map


| File / folder                                                  | Action                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `app/src/types/finding.ts`                                     | Replace validity model; add contract / calibration fields          |
| `app/src/types/investigation.ts`                               | Split into `verification.ts`; retire 3-variant counterfactual      |
| `app/src/types/demoPackage.ts`                                 | `schemaVersion: '2.0'`; `reviewPlan`, `verifications`, `synthesis` |
| `app/src/types/ask.ts`                                         | New scopes                                                         |
| `app/src/data/schema.ts`                                       | Zod 2.0, reject 1.0                                                |
| `app/src/data/queryPackage.ts`                                 | Verification / impact helpers                                      |
| `app/src/data/loadDemoPackage.ts`                              | No silent 1.0 coerce                                               |
| `app/public/demo-data/*.json`                                  | Migrate content                                                    |
| `app/src/store/demoStore.ts`                                   | Stages + `verifyPanel`                                             |
| `app/src/app/router.tsx`                                       | New routes + redirects                                             |
| `WorkflowStepper.tsx` / `WorkflowLayout.tsx`                   | New steps                                                          |
| `LandingPage.tsx` / `ArchitecturePage.tsx`                     | New pitch                                                          |
| `PlanPage.tsx` + `components/plan/`                            | Add                                                                |
| `ReviewPage.tsx` / `CritiqueCard.tsx` / `CritiqueContract.tsx` | Slim + rename actions                                              |
| `ChallengePage.tsx` → `VerifyPage.tsx`                         | Reshape                                                            |
| `components/defender/` → `components/verification/`            | Rename + skip/tool trace                                           |
| `CounterfactualPage.tsx`                                       | Delete                                                             |
| `components/counterfactual/` → `components/impact/`            | Replace                                                            |
| `ReportPage.tsx` → `SynthesizePage.tsx`                        | Calibration + conference review                                    |
| `StatusPill.tsx`                                               | New enums                                                          |
| `playbackEngine.ts`                                            | New event types                                                    |
| `README.md`                                                    | Walk the new path                                                  |


---



## Cross-cutting rules for every phase


| Rule                       | Practice                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| No paper in components     | Sample strings only under `public/demo-data` or fixtures           |
| Generic chrome copy only   | Design doc §2.2                                                    |
| Evidence first             | Any verdict/finding/node has Open source                           |
| Truth before impact        | Verify defaults to the Evidence tab                                |
| Counterfactual is optional | No empty Test stage; omit the panel when the package has no record |
| Playback owns time         | Components do not `setTimeout` their own “thinking” copy           |
| Visual system              | Design rules file is source of truth                               |
| Testing                    | Zod at the boundary + manual script                                |


---



## Suggested build order inside a phase

Always: **schema/tokens → data on the page → interaction → motion**. Do not restyle XYFlow before the Evidence ledger shows the selected finding in a static state.

---



## Cut line if time runs out

Ship in this order (stop at the last complete line):

1. Phase 1 shell + migrated 2.0 JSON + Verify as renamed Challenge + Synthesize as renamed Report + `/test` redirected away
2. + Plan page + slim Review + skipped-capability callout
3. + Impact tab with three judgments + delete Test page
4. + Calibrated comments + counterfactual tool + Compare/Ask copy

A correct Verify page with Evidence and Impact beats a polished leftover Test page.

Do not ship a demo that still has Test in the stepper. That re-teaches the wrong architecture.

---



## Explicitly not a phase

- Rebuilding the Vite app
- Re-deriving the paper graph from the PDF
- Filling a second paper package
- Implementing live Source / Numerical / Literature auditors
- Multi-round debate beyond a prepared playback branch

When a second paper appears, replace `public/demo-data/*.json` and paper assets only.