# PeerMind Demo — Design Rules

**Status:** Binding for the fake demo frontend  
**Sources:** `peermind-demo-tech-uiux-design.md` v3.0 §26–27, plus the proven visual language in the current `index.html` prototype  
**Audience:** Implementers. Copy these tokens into Tailwind/CSS; do not invent a second palette.

This demo is a **research tool**, not a chat product and not a sci-fi dashboard. The UI should look like a careful scientific instrument: light, calm, inspectable.

---

## 1. Product look

| Do | Do not |
|---|---|
| White / light-grey surfaces, dark ink, one purple accent | Dark mode, neon gradients, glassmorphism |
| Medium-radius cards, 1px borders, almost no shadow | Heavy drop shadows, glow, 3D chrome |
| Visible source IDs, status labels, provenance | Decorative “AI” motifs, sparkles, robot icons |
| Short, deterministic motion | Fake thinking delays, looping loaders as content |
| Evidence always one click away | Confidence scores as a substitute for status |

**Primary message in the UI:** *Existing AI reviewers generate critiques. PeerMind verifies them.*

---

## 2. Color

All colors are hex. Use semantic names in code (`ink`, `accent`, `status-refuted`), never raw hex in components.

### 2.1 Surfaces and text

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F4F5F8` | App canvas behind cards |
| `bg-subtle` | `#FAFBFC` | Sidebar, inset wells |
| `bg-paper-grid` | `#FCFCFF` | Graph canvas |
| `surface` | `#FFFFFF` | Cards, header, drawers, inputs |
| `ink` | `#202339` | Primary text, headings, icons |
| `muted` | `#6A7083` | Secondary text, captions, empty states |
| `muted-2` | `#667085` | Neutral pill text |
| `line` | `#E2E5ED` | Borders, dividers, table rows |
| `line-strong` | `#CFD4E0` | Input borders |
| `nav` | `#1C2035` | Dark callouts, graph activity bar, toasts |
| `nav-muted` | `#AEB6CC` | Muted text on `nav` |
| `nav-text` | `#E7E5FF` | Primary text on `nav` |

### 2.2 Accent (PeerMind)

| Token | Hex | Use |
|---|---|---|
| `accent` | `#6554CF` | Primary buttons, active nav, selected nodes, links, stepper current |
| `accent-hover` | `#5141B8` | Primary button hover |
| `accent-soft` | `#EEEBFF` | Active nav fill, selected row wash, result callouts |
| `accent-line` | `#C2B9ED` | Dashed upload / package well |
| `accent-focus` | `#9B8EF0` | Focus ring |

### 2.3 Semantic status

Every status **must** also have a text label. Color is never the only signal.

| Status | Text | Fill | Use |
|---|---|---|---|
| Verified / supported / done | `#14775A` | `#E6F5ED` | Completed workflow, evidence nodes, passed checks |
| Partial / open / downgraded | `#986412` | `#FFF3D9` | Partial support, open question, severity downgrade, replan |
| Refuted / failed | `#AE3D54` | `#FCEBF0` | Contradiction, failed check, removed evidence |
| Selected / PeerMind | `#6554CF` | `#EEEBFF` | Selected findings, active verification, routing |
| Unverifiable / skipped | `#667085` | `#EDF0F6` | Idle, skipped tools, grey pills |

Display labels (do not collapse these into High / Medium / Low):

```text
Supported
Partially supported
Refuted
Unverifiable
Open question
Verified — High impact
Verified — Moderate impact
Verified — Low impact
Severity downgraded
```

Retired 2.0 labels: Supported Concern, Human Required, Not Checked, Disputed.

### 2.4 Paper graph nodes (AntV G6)

Rect / list style (Understand inspector lists):

| Type | Fill | Stroke | Legend dot |
|---|---|---|---|
| Method | `#EAF3FF` | `#8DB3DF` | `#5B91CE` |
| Claim | `#F0EAFF` | `#B2A2E4` | `#9982EA` |
| Evidence | `#E9F7F0` | `#90C7AF` | `#46AA86` |
| Scope / Gap | `#FFF6E3` | `#D5B775` dashed `5 3` | `#D3A24F` |
| Question | `#EEEBFF` | `#B2A2E4` | `#6554CF` |

Bubble style (if used): Method `#245F91`, Claim `#7A63D6`, Evidence `#25A376`, Gap `#EE9621`.

Selected node: stroke `#6554CF` (or `#202339` on bubbles), width 3–5px. Dimmed: opacity `0.28`. Waiting/unrevealed: opacity `0.08–0.18` or hidden.

### 2.5 Verification workflow nodes (XYFlow)

| State | Fill | Stroke |
|---|---|---|
| Idle | `#FFFFFF` | `#C9CFDD` |
| Current | `#EEEBFF` | `#8975E1` 2.5px + light purple shadow |
| Done | `#EBF7F1` | `#8BBFA8` |
| Blocked / replan | `#FFF4DF` | `#CEAC66` dashed |
| Impact / counterfactual tool | `#F0EDFF` | `#9F91DF` |
| Skipped | same as idle, opacity `0.4` |

Edges: idle `#B9C1D1`; done `#599D7D`; current `#6554CF` dashed, animated; replan loop `#D18D29`.

### 2.6 Paper highlights

Normalized overlay boxes on Paper Preview:

| Role | Fill (approx) | Note |
|---|---|---|
| claim | `#6554CF` at 14% | Purple wash |
| evidence_for | `#14775A` at 16% | Green wash |
| counter_evidence | `#AE3D54` at 14% | Red wash |
| context | `#986412` at 12% | Amber wash |
| selected | `#FFF2B2` at 85% | Strong yellow, highest z-index |

Selected region gets a 2px `accent` border on top of the fill.

### 2.7 Epistemic source coloring

Visually distinguish these so a viewer never confuses who said what:

| Source | Treatment |
|---|---|
| Author claim | Graph claim color + “Author claim” eyebrow |
| Reviewer allegation | Serif quote, no accent fill until challenged |
| PeerMind evidence | Green ledger cards |
| Counter-evidence | Red ledger cards |
| Tool result | Monospace trace on `bg` |
| Human reviewer | Neutral card, “Human review” eyebrow — never PeerMind purple as fill |
| Author rebuttal | Amber-tinted well |
| Final adjudication | Status pill + short verdict, not a big score |

---

## 3. Typography

### 3.1 Families

Bundle fonts locally. The live demo **must not** depend on Google Fonts or any CDN.

| Role | Stack | Why |
|---|---|---|
| UI | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Modern research-tool UI. Bundle Inter (400/500/600/700). |
| Paper / quotes | `Georgia, "Iowan Old Style", "Palatino Linotype", serif` | Manuscript excerpts. System serif — no network. |
| IDs / traces | `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` | Finding IDs, source IDs, run IDs, traces. |

### 3.2 Scale

Line-height for headings: `1.18`. Letter-spacing for headings: `-0.035em`. Body line-height: `1.55`. Paper body: `1.75`.

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display` | `clamp(38px, 4.5vw, 64px)` | 650–700 | 1.18 | Landing hero only |
| `h1` | `clamp(32px, 4vw, 52px)` | 650 | 1.18 | Page titles |
| `h2` | `25–28px` | 650 | 1.18 | Section titles |
| `h3` | `17–19px` | 650 | 1.3 | Card titles |
| `h4` | `15px` | 650 | 1.4 | Nested card headings |
| `body` | `16px` | 400 | 1.55 | Default UI copy |
| `body-lg` | `18px` | 400 | 1.55 | Landing subtitle |
| `small` | `14px` | 400 | 1.6 | Captions, card body, table cells |
| `xs` | `12–13px` | 500–700 | 1.4 | Eyebrows, pills, IDs, stepper |
| `quote` | `24–27px` | 400 | 1.4–1.5 | Critique quotes (Georgia) |
| `stat` | `27px` | 650 | 1.1 | Trust-profile counts |
| `paper-body` | `15px` | 400 | 1.75 | Paper excerpt (Georgia) |
| `trace` | `12px` | 400 | 1.5 | Monospace traces |

### 3.3 Eyebrow

Used above titles and on dark callouts:

- Size: `12px`
- Weight: `750` (or `700` if Inter has no 750)
- Transform: uppercase
- Letter-spacing: `0.15em` (activity labels may use `0.08em`)
- Color: `accent` on light, `#B6ADDF` on `nav`

### 3.4 Brand mark

- Wordmark: `23px`, weight 750, tracking `-0.06em`, color `ink`
- Mark: `34×34px`, radius `10px`, fill `accent`, glyph `P` in white `21px`

### 3.5 Numbers and IDs

Finding IDs (`F01`), source IDs, run IDs: monospace, `12–13px`, color `muted` unless selected (`accent`).

---

## 4. Spacing, radius, elevation

### 4.1 Spacing scale (px)

Use this scale only: `4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 38, 50, 64`.

| Context | Value |
|---|---|
| Tight control gaps (pills, icon+label) | 6–8 |
| Default stack gap | 12–16 |
| Card padding | 20–24 |
| Section gap | 24–32 |
| Page heading bottom | 28 |
| Main column padding | `38px clamp(20px, 4vw, 64px) 60px` |
| Header horizontal padding | 32 (18 on mobile) |
| Inspector / drawer padding | 20–28 |

### 4.2 Radius

| Token | px | Use |
|---|---|---|
| `radius-sm` | 5–6 | Pills, tiny buttons, highlight chips |
| `radius-md` | 8–9 | Buttons, inputs, segmented control, wells |
| `radius-lg` | 11–13 | Cards, findings, graph card |
| `radius-xl` | 14–16 | Drawers, dialogs, landing preview |
| `radius-full` | 999 | Agent chips, stepper dots |

Pills are slightly squared (`5px`), not fully rounded, so they read as status tags rather than consumer-app chips.

### 4.3 Elevation and borders

Default separator is a **1px `line` border**, not a shadow.

| Token | Value | Use |
|---|---|---|
| `shadow-none` | none | Almost everything |
| `shadow-sm` | `0 1px 4px #0000000C` | Selected segmented button |
| `shadow-card-hover` | `0 4px 14px #6554CF0A` | Finding row hover |
| `shadow-preview` | `0 20px 45px #20233918` | Landing product preview only |
| `shadow-toast` | `0 5px 25px #00000022` | Toast |

---

## 5. Layout

### 5.1 App chrome

```text
[ Header 76px — brand | paper title | stepper? | Ask PeerMind | demo badge ]
[ Sidebar 210px | Main ]
```

| Piece | Spec |
|---|---|
| Header height | `76px` (`65px` below 760px) |
| Header bg | `surface` + bottom `line` |
| Sidebar width | `210px` (`175px` at 1100px, horizontal scroll nav below 760px) |
| Sidebar bg | `#FAFBFC` |
| Main max width | `1600px`, centered |
| Graph + inspector | `minmax(0,1fr) 320px` (350px at 1500px+) |
| Verification + inspector | `minmax(0,1fr) 380px` |
| Sticky inspector | `top: 16px`, max-height ~760–850px, internal scroll |

Landing / intake **does not** use the workflow sidebar. It uses a marketing header: brand, How it works, About.

Workflow pages use a **compact stepper** in the header:

```text
Understand → Plan → Review → Verify → Synthesize
```

`Compare` sits under a visually separate **Evaluation** label. Human reviews must never look like part of the locked PeerMind run.

Disable workflow routes until a valid package is loaded.

### 5.2 Breakpoints

| Name | Width | Behavior |
|---|---|---|
| `sm` | 760px | Stack columns, horizontal nav, hide secondary header button |
| `md` | 1100px | Narrow sidebar, single-column work grids |
| `lg` | 1250px | Graph inspector may stack under canvas |
| `xl` | 1500px | Wider inspector (350px) |

Target the live demo at **1280×800 and 1440×900**. Mobile should not break; it does not need to be the design center.

### 5.3 Z-index

| Layer | z |
|---|---|
| Graph / paper content | 0–1 |
| Highlight overlays | 2–4 (selected = 4) |
| Sticky inspector | 10 |
| Header | 20 |
| Ask drawer / sheet | 40 |
| Dialog | 50 |
| Toast | 60 |

---

## 6. Motion

Library: Motion. Keep it short. The playback engine owns timing; CSS owns micro-interaction.

| Token | Value |
|---|---|
| Page enter | `250ms ease`, fade + `translateY(6px)` |
| Node reveal | `400ms` fade |
| Progress bar | `300ms` width |
| Hover | `200ms` border-color |
| Playback step | ~400–700ms between events; **no** multi-second “thinking” |
| Current edge dash | `1s linear` infinite offset |

Presenter controls on every animated view: **Play / Pause / Next step / Reset / Complete instantly**.

`prefers-reduced-motion: reduce` — disable animation and transition, including workflow dash animation.

---

## 7. Iconography

Use **Lucide React** only. Stroke width 1.75–2. Size 16px in nav/buttons, 18–20px in empty states, 21px in circular check marks.

| Concept | Suggested icon |
|---|---|
| Paper | `FileText` |
| Search / Ask | `Search` |
| Evidence | `Link2` or `Quote` |
| Workflow | `GitBranch` |
| Calculation / test | `FlaskConical` |
| Warning / gap | `TriangleAlert` |
| Lock | `Lock` |
| Human | `User` |
| Source open | `ExternalLink` |
| Play / pause | `Play` / `Pause` |

Do not mix emoji into the chrome. The brand mark “P” is the only custom glyph.

---

## 8. Component rules

### 8.1 Buttons

| Variant | Fill | Text | Border | Padding |
|---|---|---|---|---|
| Primary | `accent` | white | none | `11px 18px` |
| Secondary | white | `ink` | `1px line` | same |
| Ghost | transparent | `accent` | none | left padding 0 |
| Danger / lock | white | `ink` | `line` | same; confirm in dialog |

Radius `8px`. Weight `650`. Size `14px`. Icon gap `8px`. Disabled: opacity `0.6`, cursor default.

Primary hover: `accent-hover`. Secondary hover: `bg`.

### 8.2 Cards

White, `1px line`, radius `13px`, padding `24px`. No default shadow. Finding cards: radius `11px`, padding `22px`; hover border `#AA9EEA`.

### 8.3 Pills / badges

`12px`, weight `700`, radius `5px`, padding `4px 8px`. Use the status fill/text table. Neutral default: `#EDF0F6` / `#667085`.

### 8.4 Inputs

Full width, `1px #CFD4E0`, radius `8px`, padding `11px 12px`, white bg, `ink` text. Textarea min-height `180px`, `14px/1.6`. Labels: `14px` weight `650`, 8px below.

Upload / package well: dashed `#B9B2DD` or `#C2B9ED`, fill `#FAF9FF` or `#F8F7FF`, radius `9px`.

### 8.5 Segmented control

Track `#E9EBF1`, padding `4px`, radius `9px`. Selected segment: white + `shadow-sm`.

### 8.6 Navigation item

Padding `11px 12px`, radius `8px`, `14px`, `muted`. Active: `accent-soft` fill, `accent` text, weight `700`. Index numeral: `12px`, opacity `0.65`, width `18px`.

### 8.7 Stepper

Five numbered steps. Current: filled `accent` circle, white numeral. Done: green fill. Upcoming: `bg` circle, `line` border, `muted` label. Compare is separated with a small “Evaluation” caption.

### 8.8 Quotes

Georgia, 24–27px, `ink`. Used for critique text and landing preview. Do not put quotes in Inter.

### 8.9 Callouts (runtime decisions)

Compact, not toast spam:

```text
ROUTING DECISION
<reason>
→ <specialist>

EVIDENCE GAP
<missing>
→ Replan

STOP RULE REACHED
<reason>
→ <status>
```

On light: left border `3px accent`, fill `accent-soft`. On dark activity bar: `nav` background, `nav-text`.

### 8.10 Ask PeerMind

Secondary. Header ghost/secondary button. Opens a **right sheet** (~400–420px, or dialog `min(820px, 92vw)`). Never a permanent chat column. Collapsed by default. 2–4 suggested question chips. Fallback copy when no prepared answer:

```text
No prepared answer is available for this question in the current demo package.
```

### 8.11 Toasts

Fixed bottom center, `nav` bg, white text, radius `8px`, padding `12px 20px`. Use only for package loaded / run locked / copy exported. Not for playback steps.

### 8.12 Focus

`outline: 3px solid #9B8EF0; outline-offset: 4px` on buttons, links, inputs. Graph nodes: selected stroke instead of browser outline.

---

## 9. shadcn / Tailwind mapping

Use shadcn primitives: Button, Card, Badge, Tabs, Sheet, Dialog, Select, Tooltip, ScrollArea, Accordion, Progress, Separator, Textarea.

Map CSS variables (example for `index.css`):

```css
:root {
  --background: 220 14% 96%;          /* #F4F5F8 */
  --foreground: 232 26% 17%;          /* #202339 */
  --card: 0 0% 100%;
  --primary: 249 55% 57%;             /* #6554CF */
  --primary-foreground: 0 0% 100%;
  --muted: 220 14% 96%;
  --muted-foreground: 224 10% 46%;    /* #6A7083 */
  --border: 222 18% 91%;              /* #E2E5ED */
  --ring: 249 55% 75%;                /* #9B8EF0 */
  --radius: 0.75rem;                  /* 12px — cards; buttons override to 8px */
}
```

Do not use the default shadcn zinc/slate look. Override `--primary` to PeerMind purple on day one.

---

## 10. Content rules (non-visual but UI-binding)

Components render **only** from `DemoDataPackage` (and user-entered comparison text). No paper title, claim, finding, number, or verdict may be hard-coded in JSX.

Allowed built-in chrome copy:

```text
Understand  Plan  Review  Verify  Synthesize  Compare
Ask PeerMind
Author Claim  Candidate Finding  Evidence  Counter-evidence
Scope Relevance  Necessity  Sensitivity
Calibrated Comment
```

Generic empty states and help text are allowed. Sample finding quotes on the landing page are **not** allowed unless they come from the loaded package (show a product-empty hero before load).

---

## 11. Density and copy voice

- Default pages stay readable. Contracts, traces, and provenance live in drawers, accordions, and the inspector.
- Prefer short labels: “Open source”, “Verify”, “Lock and Compare”.
- Do not write marketing fluff on workflow pages. Landing may use the product line; everything after Intake is an instrument.
- Avoid fake certainty: always show limitations and mixed statuses when the package has them.

---

## 12. Accessibility (minimum for the demo)

- Status = color **and** label (and icon when space allows).
- All graph nodes and finding rows are keyboard-activatable.
- Focus ring as specified.
- `prefers-reduced-motion` honored.
- Contrast: `ink` on white, `muted` only for secondary text (not for primary actions).
- Do not ship a live demo that traps focus incorrectly in the Ask sheet.

Skip a full WCAG audit. Fix anything a presenter would hit with a keyboard in 3 minutes.

---

## 13. Print (Synthesize only)

Hide header, sidebar, actions, stepper. Show Synthesize expanded. Cards `break-inside: avoid`. No shadows.
