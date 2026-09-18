# Recto

PDF tools that never upload your files.

Recto is a browser-based PDF editor. Merging, splitting, rotating, annotating
and signing all happen on the device using browser APIs. There is no upload
path, because there is no server.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript, strict |
| UI | React 19, Tailwind CSS 4 |
| PDF rendering | PDF.js |
| PDF writing | pdf-lib |
| Editor state | Zustand |
| Hosting | Firebase Hosting (static) |

Every dependency is justified in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Requires Node.js 20.9 or later.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static export into `out/` |
| `npm run preview` | Serve the built `out/` directory locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, including architecture boundary rules |
| `npm run format` | Prettier write |
| `npm run check` | Typecheck, lint and format check together |

Run `npm run check` before committing.

## Project structure

```
app/            Routes, metadata, sitemap, robots, Open Graph image
  (tools)/      One indexable URL per tool
components/     ui/ layout/ home/ tools/ pdf/ editor/
hooks/          React bindings for editor and document state
store/          Editor store and undo history
lib/pdf/        Public adapters; engine/ holds PDF.js and pdf-lib
utils/          commonFunctions/ pdfUtils/ fileUtils/
types/          Domain types and branded ids
constants/      Limits, routes, catalogue
config/         Site identity and metadata builders
docs/           Architecture and decision records
firebase.json   Hosting headers and cache policy
```

Two architectural boundaries are enforced by ESLint and fail the build if
broken:

- `app/`, `components/` and `hooks/` may not import `pdfjs-dist` or `pdf-lib`
  directly — use the adapters in `lib/pdf`.
- `lib/`, `utils/`, `constants/` and `types/` may not import React or Next, so
  they stay usable inside Web Workers.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design.

## Debugging

Debug output goes through `@/utils/commonFunctions/logger`, which compiles away
in production builds. Direct `console` calls are blocked by ESLint.

```ts
logger.debug('pdf', 'document loaded', { pageCount });
await logger.time('render', 'page 1', () => renderPage(1));
```

## Design system

Every UI primitive is rendered on one page for review:

```
npm run dev   # then open http://localhost:3000/design-system
```

The page is marked `noindex` and omitted from the sitemap. It ships with the
static export because every route is prerendered, but it is not for visitors.

Icons are local SVG components in `components/ui/icon/`. There is no icon
package: only the icons actually imported end up in the bundle.

## Adding a tool

The catalogue lives in `constants/tools.ts` and drives the landing page grid,
each tool page's copy, page metadata and the sitemap. Adding a tool means
editing that file and creating a route under `app/(tools)/` that renders
`ToolPageShell`.

Set `href: null` for a tool whose route does not exist yet. It renders as a
"coming soon" card rather than a link that 404s.

## How files are handled

Files are never uploaded, and they are never fully read into memory at
selection time. `useFileSelection` holds the browser's `File` handles, which
are lazy references to data still on disk.

Validation happens in two stages. `validateFileMetadata` does the free checks
(size, extension). `validatePdfFile` then reads the first four bytes and
requires them to be `%PDF`, because a filename and a MIME type are both just
metadata and neither describes the contents. Decisions that depend on the
existing selection — duplicates, count limits — are made inside the reducer
instead, so concurrent drops cannot race past them.

## Rendering PDFs

`pdfjs-dist` is confined to `lib/pdf/engine`; everything else imports the
`LoadedPdfDocument` interface from `@/lib/pdf`, and ESLint enforces the
boundary. The library is behind a dynamic import, so roughly 500 KB is
fetched only when a document is actually opened.

pdf.js needs runtime assets (its worker, standard font metrics, CJK
character maps and WebAssembly image decoders) served as static files.
`scripts/copy-pdfjs-assets.mjs` copies them from `node_modules` into
`public/pdfjs` on `predev` and `prebuild`. They are gitignored, so a fresh
clone gets them on the first `npm run dev`.

Known limitations: rendered pages are canvas only, so text is not selectable
and not reachable by a screen reader — pdf.js's text layer is a separate
feature. Password-protected documents are reported clearly but cannot be
unlocked in the app.

## The editor

`/editor` holds the document as a list of instructions — which source page,
turned how far — rather than as modified bytes. Rotating, deleting and
reordering are operations on that list, so they are instant on a 300-page
file and, being plain data, can be replayed by undo.

State is split deliberately. Zustand holds the replayable edit; the open
`LoadedPdfDocument` travels by React context because it owns worker memory
and a disposal lifecycle. Thumbnails render only while near the rail and
release their canvas on the way out, which keeps memory proportional to
what is visible.

Reordering is done with toolbar buttons rather than drag-and-drop. That is
keyboard-operable by default.

Annotations (text, ink, highlight, rectangle, ellipse, line, signature) live
in the same store as plain JSON, in page points rather than screen pixels.
An SVG overlay draws them on top of the PDF canvas, so zoom never detaches
geometry from the page. Signatures are captured as vector strokes, not
bitmaps, so they stay sharp when stamped and stay small at export.

Undo and redo snapshot that same JSON. A drag or a burst of typing collapses
into one step; zoom and tool changes are left out, so undoing a rectangle
does not also undo a zoom.

## Exporting

`pdf-lib` is confined to `lib/pdf/engine` the same way pdf.js is. Export
reads the original `File` (pdf.js has already transferred its copy to the
worker), combines it with the edit model, and downloads a new PDF. Rotation
is flattened so annotations stay where they were drawn.

Split of many pages downloads a ZIP (uncompressed STORE, because PDFs do
not shrink inside another deflate). Compress re-saves with object streams
and shows both sizes before download; it is not Ghostscript.

## Deploy

```bash
npm run build
firebase deploy --only hosting
```

`output: 'export'` writes static HTML into `out/`. Security headers live in
`firebase.json` because Next.js headers are inert under a static export.

## Privacy

Documents are read with the `File` API and processed in memory. Nothing is
uploaded, stored remotely or transmitted. Firebase Hosting serves static
assets only; no Firebase data service is used. The public statement is the
`/privacy` route.
