# Recto — Architecture

Recto is a browser-based PDF editor. Every document operation runs on the
visitor's device; there is no server and no upload. That single constraint
drives most of what follows.

## Layers

Dependencies point downward only. A layer may use the ones below it and must
never reach upward.

| Layer | Location | Responsibility |
| --- | --- | --- |
| Infrastructure | `next.config.ts`, `firebase.json` | Build output, hosting, security headers |
| Routes | `app/` | Routing, metadata, SEO, code-split boundaries |
| Features | `components/editor/`, `components/pdf/`, `components/tools/`, `components/home/` | Editor shell, tool pages, landing sections |
| UI | `components/ui/`, `components/layout/` | Presentational primitives with no domain knowledge |
| State | `store/`, `hooks/` | Editor store, document lifecycle, command history |
| Domain | `utils/pdfUtils/`, `types/` | Pure functions: page operations, geometry |
| Engine | `lib/pdf/engine/` | Adapters over PDF.js and pdf-lib |
| Platform | `utils/fileUtils/`, `utils/commonFunctions/` | File IO, blob lifecycle, feature detection |

Two boundaries are enforced by ESLint rather than convention, so violations
fail the build:

- `app/`, `components/` and `hooks/` may not import `pdfjs-dist` or `pdf-lib`.
  They talk to our adapters instead.
- `lib/`, `utils/`, `constants/` and `types/` may not import React or Next.
  This keeps domain logic runnable inside a Web Worker.

## Core model: immutable source plus an edit model

The naive design mutates the PDF on every action. That is slow (full
re-serialisation per keystroke), lossy (repeated save cycles degrade a PDF),
and makes undo mean keeping many megabyte-scale copies in memory.

Instead we hold two things:

```
SourceDocument   immutable bytes, loaded once, never modified
EditModel        small plain-JSON description of the user's changes
                   - pageOrder:   PageId[]
                   - pageState:   rotation, deleted, crop per page
                   - annotations: id, pageId, type, geometry, style
```

Every user action that changes pages or annotations is recorded as a
snapshot of that tiny `EditModel`. Undo restores the previous snapshot.
The two are combined into bytes exactly once, at export.

This buys four things: undo/redo is a stack over a tiny object, the original
file never degrades, the rendered view updates instantly without touching the
file, and the `EditModel` is serialisable so session recovery is possible later
without a redesign.

## Data flow

```
File → validate magic bytes → ArrayBuffer → PDF.js worker → LoadedPdfDocument
     → PdfDocumentContext (React context, one value per document)
     → page count and first page size into the Zustand store

User action → store action → snapshot EditModel → EditorPage[] / Annotation[] → overlay re-render

Export → source bytes + EditorPage[] + Annotation[] → pdf-lib → Blob → download
```

**PDF bytes, engine handles and canvases never enter the Zustand store.** The
store holds `EditorPage[]` and `Annotation[]`: page order, rotation and
overlay geometry, which are plain data and therefore replayable — that is
what makes undo possible. The `LoadedPdfDocument` travels by
context instead, because it owns worker memory and a disposal lifecycle and
cannot be snapshotted. Putting an `ArrayBuffer` into a store is how you get
a leak that survives navigation.

## Rendering

Each visible page is two stacked surfaces: a base canvas holding the PDF.js
raster, and an overlay for annotations. The overlay uses DOM/SVG for
interactive objects, which gives hit-testing, focus and keyboard access for
free — important for WCAG compliance.

Pages are virtualised with `IntersectionObserver`, rendering only the viewport
plus an overscan margin. PDF.js `RenderTask`s are explicitly cancelled when a
page scrolls away, because an abandoned task keeps decoding. A render queue
serialises work so fast scrolling cannot launch dozens of concurrent renders.

Scale is device-pixel-ratio aware but clamped, both to limit memory and to stay
under browser canvas ceilings, which vary enormously between desktop Chrome and
iOS Safari. Those ceilings are probed once per tab (`getCanvasLimits`) rather
than assumed; see `constants/limits.ts`. Page rasters themselves are queued so
a fast thumbnail scroll cannot start one pdf.js paint per visible rail item.

## Threading

PDF.js ships its own worker for parsing. Export currently runs on the main
thread: pdf-lib's `save()` already yields via `objectsPerTick`, and we yield
between pages so the spinner can paint. A dedicated export worker is deferred
until the write path is proven (see `DECISIONS.md`, ADR-023).

Transferring an `ArrayBuffer` to a worker *detaches* it on the sender side.
The engine adapter owns this lifecycle so callers cannot trip over it.

## Deployment

`output: 'export'` produces fully static HTML in `out/`, served by Firebase
Hosting's CDN on the free Spark plan. There is no Cloud Run, no Cloud Functions
and no server runtime, because there is no server-side work to do.

Consequence: `headers`, `redirects` and `rewrites` in `next.config.ts` are
inert under static export. All security headers are declared in `firebase.json`
instead.

Hosting is the only Firebase service used. Auth, Firestore and Cloud Storage
are deliberately absent — storing documents remotely would contradict the
product's central promise.

## Known limitations

- Existing PDF text cannot be edited in place; we overlay new content instead.
- Encrypted PDFs are refused; they cannot be viewed or edited.
- Password protection is not offered (see `DECISIONS.md`, ADR-004).
- Compression is metadata and image oriented, not a Ghostscript equivalent.
- Conversion to Office formats is out of scope.
- Very large files may exhaust memory on mobile; thresholds in `constants/limits.ts`.
- No cross-device sync or shareable links, by design.
