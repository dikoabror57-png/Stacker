# AstroReconstruct

**Clearer skies. Deeper discoveries.**

AstroReconstruct is a web application for astrophotography reconstruction: upload observation frames, validate and inspect them, align and combine them into a stack, optionally produce a clearly-labelled enhanced derivative, and review quality metrics, processing history, and downloadable products.

It is built around a single rule: **enhance observed data, never fabricate astronomical evidence.** Every number, image, progress bar, and download comes from real computation on the inputs you supply. When a capability is unavailable, the app reports a `not-configured` state instead of inventing a result.

![AstroReconstruct dashboard](docs/screenshots/dashboard.png)

---

## Table of contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Demo walkthrough](#demo-walkthrough)
- [Configuration](#configuration)
- [API overview](#api-overview)
- [Processing pipeline](#processing-pipeline)
- [Scientific integrity rules](#scientific-integrity-rules)
- [Current limitations](#current-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Screenshots

The project workspace pairs a canvas viewer (zoom, pan, pixel inspector, display stretch) with frame status, a parameter panel, and live quality metrics.

![Project workspace showing a stacked image, active job, export products, and event log](docs/screenshots/workspace.png)

Every run is recorded with its parameters, frame count, duration, and outcome.

![Processing history listing completed runs](docs/screenshots/history.png)

> Screenshots were captured locally against **synthetic test frames** generated for development. No real observational data is bundled with the repository, and the numbers shown reflect genuine computation on those test frames.

---

## Features

**Projects and uploads**
- Create projects with a workflow type (multiple exposures, single image, FITS science, unclassified).
- Drag-and-drop upload of JPEG, PNG, TIFF, and FITS frames, with per-file size, frame-count, and total-size limits.
- File validation endpoint returning severity-tagged errors and warnings; SHA-256 content hashing on upload.
- Per-file inspection: dimensions, channel count, bit depth, FITS header/extensions, WCS presence, statistics.

**Workspace**
- Canvas image viewer with zoom, pan, pixel inspector, and display-stretch controls (linear, log, sqrt, asinh).
- Overlay toggles, frame list with rejection state, and an editable configuration panel for processing parameters.
- Quality metric cards that distinguish measured values from estimates and show the method and assumptions behind each one.

**Processing**
- Mean, median, and sigma-clipped combination of multiple frames.
- Frame rejection with recorded reasons (decode failures and dimension mismatches against the reference frame).
- Alignment and coverage reporting (reference frame, registered count, residual notes, output shape, valid fraction).
- Optional enhancement stage (denoise, deconvolve, or both) written as a separate derivative product.
- Live job progress, stage events, cancellation, and full processing history.
- Products: PNG stack preview, a header-only FITS surrogate, an enhanced derivative, and a JSON processing manifest with inputs, parameters, checksums, and limitations.

**Platform**
- Express API with JSON-file storage — no database required for local development or demos.
- Health endpoint that reports `ok`, `degraded`, or `not-configured` based on which integrations are configured.
- Settings page for viewer and processing defaults, persisted locally.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 6 |
| Charts/UI | Hand-rolled components in `apps/web/src/components/ui.tsx` |
| Backend | Node.js, Express 4, TypeScript (`tsx` in dev) |
| Imaging | `canvas` (Node) for decoding, stacking, stretching, and PNG encoding |
| Storage | JSON document store + filesystem blobs (`data/`, `uploads/`) |
| Shared types | `@astro-reconstruct/shared` workspace package |
| Tests | Vitest (configured in both apps) |

Monorepo managed with npm workspaces.

---

## Repository layout

```
astro-reconstruct/
├── apps/
│   ├── api/                 # Express API
│   │   └── src/
│   │       ├── server.ts    # App wiring, middleware, startup
│   │       ├── lib.ts       # Config, hashing, ids, health
│   │       ├── routes/      # projects, files, process (jobs/products/metrics/events)
│   │       ├── services/    # image loading, stacking, stretch, enhancement, metrics
│   │       └── storage/     # JSON store + file/product persistence
│   └── web/                 # React SPA
│       └── src/
│           ├── pages/       # Dashboard, NewProject, ProjectWorkspace, History, Settings, Docs
│           ├── components/  # ImageViewer, DragDropUpload, UI primitives
│           └── lib/         # API client, formatting, stretch maths, settings
├── packages/
│   └── shared/              # Types and constants used by both apps
├── docs/screenshots/        # Images used in this README
├── data/                    # Runtime JSON store and generated outputs (git-ignored)
└── uploads/                 # Uploaded frames and rendered previews (git-ignored)
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer (20 LTS recommended)
- npm 9+
- Build tools for the native `canvas` dependency (Xcode Command Line Tools on macOS, `build-essential` + `libcairo2-dev` + `libpango1.0-dev` on Debian/Ubuntu). Prebuilt binaries cover most platforms.

### Install and run

```bash
git clone https://github.com/<your-user>/astro-reconstruct.git
cd astro-reconstruct

npm install

# Web (Vite, port 5199) + API (Express, port 3001) together
npm run dev
```

Open <http://localhost:5199>. The Vite dev server proxies `/api` to `http://127.0.0.1:3001`.

Run the halves separately if you prefer:

```bash
npm run dev:web
npm run dev:api
```

### Build

```bash
npm run build:web   # tsc + vite build -> apps/web/dist
npm run build:api   # tsc          -> apps/api/dist
```

### Tests

```bash
npm test            # runs the Vitest suites in both apps
```

> No test suites exist yet, so Vitest exits with `No test files found` (code 1). The scripts and dependencies are wired up; this is the first thing to change before a public release.

### Fresh start

The app keeps state in `data/store.json` and blobs in `uploads/`. Delete both directories to reset to an empty install; they are recreated on boot.

---

## Demo walkthrough

No API keys or accounts are needed — the default demo mode runs the full flow locally.

1. **Start the app.** `npm run dev`, then open <http://localhost:5199>.
2. **Create a project.** Hit **New Project**, give it a name, and choose **Multiple exposures** (for stacking) or **Single image**. The dashboard lists projects with frame counts and status.
3. **Upload frames.** Drag JPEG, PNG, TIFF, or FITS files into the drop zone. Files are hashed and inspected on upload; the validation endpoint returns severity-tagged errors and warnings, and errors block processing.
4. **Open the workspace.** Review the frame list and preview, zoom into the image, and move the pixel inspector to read values. Display stretch (linear/log/sqrt/asinh) changes what you see, not the stored pixel data.
5. **Configure the run.** Open the **Configure** panel and pick mean, median, or iterative sigma-clip combination, plus optional denoise/deconvolve enhancement.
6. **Run it.** Start the job and watch stages move from alignment to combining to enhancement. Alignment results, coverage, and rejected frames appear as they complete.
7. **Review outputs.** Quality metric cards separate measurements from estimates; downloads include the PNG stack, a FITS surrogate (header only — see [limitations](#current-limitations)), the enhanced derivative, and the JSON processing manifest. Every run is listed under **Processing History** with its parameters and duration.

Prefer the API? The same flow works from the shell with three PNG frames to hand:

```bash
# 1. create a project
PID=$(curl -s -X POST http://127.0.0.1:3001/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo","workflow":"multi-exposure"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')

# 2. upload frames
curl -s -X POST "http://127.0.0.1:3001/api/projects/$PID/upload" \
  -F "files=@frame-1.png" -F "files=@frame-2.png" -F "files=@frame-3.png"

# 3. queue and run a sigma-clipped stack (defaults fill in the rest)
JOB=$(curl -s -X POST "http://127.0.0.1:3001/api/projects/$PID/jobs" \
  -H 'Content-Type: application/json' \
  -d '{"workflow":"multi-exposure","combineMethod":"sigma-clip"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
curl -s -X POST "http://127.0.0.1:3001/api/jobs/$JOB/run"

# 4. products appear once the job completes
curl -s "http://127.0.0.1:3001/api/projects/$PID/products"
```

---

## Configuration

The API runs in **demo mode** with no environment variables: authentication is a fixed demo user, storage is the local filesystem, and processing happens in-process in JavaScript. That is enough to exercise every UI flow.

The API reads `process.env` directly — there is no `.env` loader. Export variables in your shell, or point Node at a file:

```bash
# reference list of supported variables lives in .env.example
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_ANON_KEY="..."
npm run dev

# or, on Node 20.6+, load the file yourself
node --env-file=.env ./node_modules/.bin/tsx apps/api/src/server.ts
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | API listen port (bound to `127.0.0.1`) |
| `REQUIRE_AUTH` | `false` | Require a Supabase token instead of the demo user |
| `SUPABASE_URL` | — | Supabase project URL; enables authentication and private storage |
| `SUPABASE_ANON_KEY` | — | Supabase anon key, paired with `SUPABASE_URL` |
| `DATABASE_URL` | — | Postgres connection string for production persistence |
| `PYTHON_BACKEND_URL` | — | FastAPI processing backend for real astrometric registration and science-grade outputs |
| `MAX_FILE_SIZE_BYTES` | `524288000` (500 MB) | Per-file upload limit |
| `MAX_FRAMES` | `100` | Maximum frames per project |
| `MAX_TOTAL_BYTES` | `10737418240` (10 GB) | Total project upload limit |

`GET /api/health` reports which integrations are live:

```json
{
  "status": "degraded",
  "version": "0.1.0",
  "stack": ["express", "typescript", "json-storage"],
  "configured": { "authentication": false, "storage": false, "processingBackend": false },
  "message": "Running in demo mode. ..."
}
```

---

## API overview

All routes are prefixed with `/api`. The web client talks to them through `apps/web/src/lib/api.ts`.

### Projects

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Service status and configured integrations |
| `GET` | `/projects` | Paginated project list (`page`, `pageSize`) |
| `POST` | `/projects` | Create a project (name, description, workflow, visibility) |
| `GET` | `/projects/:projectId` | Project detail |
| `PATCH` | `/projects/:projectId` | Partial update |
| `DELETE` | `/projects/:projectId` | Delete project |

### Files

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/projects/:projectId/upload` | Multipart upload (`files[]`) |
| `POST` | `/projects/:projectId/files/init` | Create a project and upload frames in one call (wizard path) |
| `GET` | `/projects/:projectId/files` | List frames |
| `GET` | `/files/:fileId/inspect` | Dimensions, bit depth, FITS info, statistics |
| `GET` | `/files/:fileId/preview` | Rendered preview image |
| `GET` | `/files/:fileId/stats` | Pixel statistics |
| `POST` | `/projects/:projectId/validate` | Re-validate the frame set |
| `DELETE` | `/files/:fileId` | Remove a frame |

### Processing

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/projects/:projectId/jobs` | Create a job with processing parameters |
| `GET` | `/projects/:projectId/jobs` | List jobs for a project |
| `GET` | `/jobs/:jobId` | Job status, progress, alignment and coverage results |
| `POST` | `/jobs/:jobId/run` | Start processing |
| `POST` | `/jobs/:jobId/cancel` | Cancel a running job |
| `GET` | `/jobs/:jobId/pixel` | Pixel inspector sample (`x`, `y`) |
| `GET` | `/projects/:projectId/metrics` | Quality metrics for the project |
| `GET` | `/projects/:projectId/events` | Processing event log |
| `GET` | `/projects/:projectId/products` | Generated outputs |
| `GET` | `/products/:productId/download` | Download a product |

---

## Processing pipeline

1. **Validate** — extension, MIME, size, frame count, and dimension checks via `POST /projects/:id/validate`; errors are reported back to the client before a job is queued.
2. **Load** — decode with `canvas`, normalise to a `Float64Array`, and compute statistics (min/max/mean/σ, background median and sigma, saturated fraction, dynamic range, star count, FWHM estimate).
3. **Reject** — frames that fail to decode or whose dimensions differ from the reference are excluded, with the reason stored on the job.
4. **Align** — register frames to a reference frame on a common grid.
5. **Combine** — mean, median, or iterative sigma-clipped stacking.
6. **Measure coverage** — output shape, valid-pixel fraction, whether edges were cropped.
7. **Enhance** *(optional)* — denoise and/or deconvolve into a separate derivative, never overwriting the stack.
8. **Render** — apply the requested display stretch (linear/log/sqrt/asinh with percentile clipping and gamma) to produce previews and PNG products.
9. **Report** — persist quality metrics, the product list, and a JSON manifest capturing inputs, parameters, alignment, coverage, checksums, and scientific-integrity notes.

Long jobs run asynchronously and stream progress through the job record and the event log, so the workspace can poll without blocking.

---

## Scientific integrity rules

These are product requirements, not just documentation:

- No generative models invent stars, nebulae, galaxies, or any other structure.
- Stacking is only reported when multiple frames were genuinely combined; a single image never claims a stack.
- Enhanced results are always a separate, labelled derivative with the technique named — the scientific stack stays untouched.
- Display brightness changes (stretch, gamma) are labelled as visualisation, never presented as pixel-data modification.
- Metric values carry `method`, `isEstimate`, and `assumptions`, so estimated quantities cannot pass as measurements.
- Missing capabilities surface as explicit `not-configured` states rather than placeholder numbers.
- No claim of 100% accuracy or of recovering every invisible star.

---

## Current limitations

- **Authentication is a stub.** Every request is attributed to `demo-user`. Supabase JWT verification is not wired up yet.
- **Storage is local.** Projects, jobs, and products live in `data/store.json` plus `uploads/`; there is no multi-user isolation or object storage yet.
- **FITS support is partial on both ends.** Input headers and extensions are parsed for inspection, but pixels are read through the image decoder, so full science-array handling needs the Python backend. On output, the `.fits` product is a **header-only surrogate** (~310 bytes, no pixel array), labelled `FITS surrogate` in the UI and manifest so it cannot be mistaken for a science product.
- **Alignment is placeholder registration.** Real astrometric/WCS registration requires `PYTHON_BACKEND_URL`.
- **Enhancement is conservative and heuristic** — a demonstration of the pipeline shape, not a publication-grade deconvolution.
- **Overlays** (star masks, coverage maps) are UI placeholders pending backend support.
- **No CI, lint config, or meaningful test coverage yet.**
- `data/` and `uploads/` are runtime state and are git-ignored; do not commit them.

---

## Roadmap

- Supabase auth with per-user project isolation.
- Postgres persistence behind the existing storage interface.
- Python/FastAPI backend for FITS science arrays, WCS-based registration, and photometric calibration.
- Real star detection, PSF modelling, and deconvolution.
- Exportable processing manifests verified end-to-end for reproducibility.
- CI with typecheck, lint, and API integration tests.

---

## License

No license has been chosen yet. Until one is added, the code is all rights reserved by default — add a `LICENSE` file (MIT or Apache-2.0 are common choices for this kind of tool) before publishing if you want others to reuse it.
