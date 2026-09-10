# PeerMind

PeerMind is an interactive prototype for auditable, evidence-grounded scientific peer review.

## Demo

The live demo is the Vite app in [`app/`](./app):

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173`. Upload [`papers/sample_paper_v1.pdf`](./papers/sample_paper_v1.pdf) from the landing page to load the bundled package, then walk Understand → Plan → Review → Verify → Synthesize → Compare. The demo processes the PDF and replays a prepared review: no live model and no network after the first local serve.

```bash
npm run build
```

The legacy [`index.html`](./index.html) at the repo root is a visual reference only. Do not use it for presentations.

## Sample papers

- [`sample_paper_v1.pdf`](./papers/sample_paper_v1.pdf) — the manuscript used by the live demo
- [`sample_paper_v2.pdf`](./papers/sample_paper_v2.pdf)

## Additional artifacts

The `outputs/` directory contains the original demo file and knowledge-graph artifacts.
