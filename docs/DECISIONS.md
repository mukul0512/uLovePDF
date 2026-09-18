# Architecture Decision Records

Short records of choices that would be expensive to reverse, and why they were
made. Each entry states the alternatives considered so a future reader can tell
whether the reasoning still holds.

---

## ADR-001 — PDF.js for rendering

**Decision.** Use `pdfjs-dist` (Apache-2.0) for parsing and rendering.

**Alternatives.** PDFium via WASM is BSD-licensed and fast, but offers no text
layer and a much rougher API. MuPDF is capable but AGPL-3.0 (see ADR-004).
Commercial SDKs conflict with both the cost and no-SaaS constraints.

**Consequence.** The package is large on disk, but what ships is the API module
plus a worker loaded off the main thread, with CMaps and fallback fonts fetched
on demand. It must always be behind a dynamic import so landing-page visitors
never download it.

---

## ADR-002 — pdf-lib for writing, behind our own adapter

**Decision.** Use `pdf-lib` 1.17.1 (MIT), imported only inside
`lib/pdf/engine/`, which exposes an interface the rest of the app depends on.

**Context.** `pdf-lib` was last published in May 2022 and is effectively
unmaintained. `@cantoo/pdf-lib` is an actively maintained fork, but adds
dependencies including an HTML parser, widening the supply-chain surface.

**Rationale.** Start on the smaller, better-understood package. Because nothing
outside the adapter imports it, switching to the fork later is a one-file
change. The general principle: wrap third-party engines you do not control
behind an interface you do.

---

## ADR-003 — Zustand for editor state

**Decision.** Use Zustand for editor state; keep binary data out of it.

**Rationale.** React Context has no selector mechanism, so every consumer
re-renders when any part of the value changes. In an editor updating on
`pointermove` that means re-rendering the tree at pointer frequency. Zustand
subscribes per-selector and supports transient reads that bypass React
rendering entirely. Redux Toolkit would work but costs more ceremony for no
gain in a client-only app.

---

## ADR-004 — No password protection in v1

**Decision.** Ship without a "Protect PDF" tool.

**Rationale.** `pdf-lib` cannot write encrypted PDFs. The only mature WASM
alternative is MuPDF, which is AGPL-3.0. For a publicly hosted web app, AGPL
would oblige us to release the entire service under AGPL. The feature is not
worth that exposure.

---

## ADR-005 — Static export to Firebase Hosting

**Decision.** `output: 'export'` deployed to classic Firebase Hosting.

**Alternatives.** Firebase App Hosting targets server-rendered apps and runs
them on Cloud Run. We have no server-side work, so it would add cost and
latency for no benefit; Firebase's own guidance recommends classic Hosting for
static apps.

**Consequence.** Security headers move to `firebase.json`. No API routes, no
Server Actions, no dynamic routes without `generateStaticParams`.

---

## ADR-006 — No third-party icon or utility packages

**Decision.** Icons are project-local inline SVG React components. Class
merging uses a local `cn` helper rather than `clsx` + `tailwind-merge`.

**Rationale.** Inline SVG components are zero-runtime, perfectly tree-shaken
and let us control accessibility attributes directly. `tailwind-merge` only
earns its weight once components accept genuinely conflicting `className`
overrides. Variant buttons exist and still do not need it.

---

## ADR-007 — TypeScript 5.9 rather than 7.x

**Decision.** Stay on the TypeScript 5.9 line that `create-next-app` selects.

**Rationale.** TypeScript 7 (the native compiler) is faster, but Next.js 16 and
the type-aware ESLint tooling are validated against 5.x. The only benefit
forgone is compile speed, which is not a bottleneck at this size. Revisit once
the ecosystem defaults to 7.

---

## ADR-008 — Prettier as the only added dev dependency

**Decision.** Add `prettier` and `eslint-config-prettier` as dev dependencies.

**Rationale.** Zero bundle impact, and it eliminates formatting churn from
diffs. `eslint-config-prettier` disables ESLint rules that would otherwise
fight Prettier, and must remain last in the flat config array.

---

## ADR-010 — Tool catalogue as framework-free data

**Decision.** `constants/tools.ts` holds the tool registry as plain data;
icons are referenced by key and mapped to components in
`components/tools/toolIcons.tsx`.

**Context.** The natural first instinct is to put the icon component straight
into the registry. The architecture boundary rule forbids React imports in
`constants/`, which blocked it.

**Rationale.** The constraint produced the better design. The registry is now
serialisable data that a sitemap generator or a worker could read, and the
data-to-component mapping lives in the layer that owns components. The
exhaustive `Record<ToolIconKey, ...>` means a new tool without an icon is a
compile error rather than a blank space.

---

## ADR-011 — Category headings instead of filter tabs

**Decision.** The landing page groups tools under static category headings
rather than the reference site's interactive filter tabs.

**Rationale.** Filter tabs earn their keep across thirty tools. With five they
would hide content behind an interaction, add client-side JavaScript to an
otherwise static page, and remove the headings that give screen-reader users
and crawlers real structure. Revisit if the catalogue passes roughly fifteen
tools.

---

## ADR-012 — Validate PDFs by magic bytes, not by name

**Decision.** A file is only accepted if its first four bytes are `%PDF`.

**Rationale.** The filename extension and the `type` reported by the browser
are both metadata passed through from the operating system; neither says
anything about the contents. Without the byte check, a renamed archive would
be accepted and then fail deep inside the PDF parser, surfacing to the user as
an unintelligible error. Reading four bytes via `File.slice` costs nothing
even for a 200 MB file.

---

## ADR-013 — Selection state in useReducer, not a global store

**Decision.** `useFileSelection` uses `useReducer`, scoped to one tool page.

**Rationale.** The state dies with the page and no distant component reads it.
The editor uses Zustand because distant components share document state.
Selection on a tool page does not, so a reducer is enough.

Duplicate and count checks live inside the reducer rather than the async
callback that calls it. Validation is asynchronous, so two rapid drops can
overlap; a closure would compare against a stale list, while a reducer always
sees current state. Ids are minted before dispatch so the reducer stays pure
under React's development-mode double invocation.

---

## ADR-014 — Window-level drop guard

**Decision.** A window listener calls `preventDefault` on any `dragover` or
`drop` that no drop zone claimed.

**Rationale.** The browser's default action for a dropped file is to navigate
to it. Missing the drop zone by a few pixels would replace the page with a raw
PDF viewer and silently discard the user's selection. The guard checks
`defaultPrevented` so it never interferes with a real drop target.

---

## ADR-015 — pdf.js for rendering, behind an adapter

**Decision.** `pdfjs-dist` renders pages, and nothing outside
`lib/pdf/engine` may import it. The public surface is `LoadedPdfDocument`,
an interface of methods rather than an exposed `PDFDocumentProxy`.

**Rationale.** No browser API rasterises a PDF, so there is no native
alternative; pdf.js is the only production-grade option. The adapter matters
because pdf.js's API is large and moves between majors — this phase already
hit one such move (see below). Keeping the UI dependent on five methods
rather than on a library surface means an engine change stays inside one
directory.

Loading is a dynamic import, so roughly 500 KB stays out of the initial
payload of every tool page and is fetched only when a file is opened.

---

## ADR-016 — The legacy pdf.js build, not the default

**Decision.** Load `pdfjs-dist/legacy/build/pdf.mjs`.

**Context.** The default build of pdf.js 6.3 calls
`Map.prototype.getOrInsertComputed`, a TC39 addition so recent that Chrome
144 does not have it. Parsing any document throws a `TypeError` that
surfaces as a generic "could not be opened", which is a miserable failure
mode: it looks like a bad file rather than an unsupported browser.

**Rationale.** The legacy build is the same library with polyfills bundled.
It costs about 60 KB more and works on browsers people actually run. The
worker must come from the same variant, since pdf.js refuses to pair
mismatched builds.

---

## ADR-017 — pdf.js runtime assets copied at build time

**Decision.** `scripts/copy-pdfjs-assets.mjs` copies the worker plus the
`standard_fonts`, `cmaps`, `wasm` and `iccs` directories into `public/pdfjs`,
wired to `predev` and `prebuild`. They are gitignored, not committed.

**Rationale.** pdf.js fetches these by URL at runtime and only when a
document needs them, so their 3.4 MB total is not a download cost for
anybody. Copying rather than committing means they cannot drift from the
installed version — a mismatched worker fails in ways that look like a
corrupt PDF, which is a genuinely expensive bug to chase.

---

## ADR-018 — The document is a list of instructions, not bytes

**Decision.** The editor state is `EditorPage[]`, where each entry says which
source page to use and how far to turn it. The source bytes are never
modified.

**Rationale.** Reordering becomes an array splice rather than a rewrite of
the PDF, so it is instant regardless of file size. More importantly the
state stays plain data, which is what undo needs: you can
snapshot and replay a list of instructions, but not a mutated buffer.

Page ids are stable across reorders. That is what lets React keep the right
canvas alive when a page moves, instead of repainting the rail.

---

## ADR-019 — Zustand for edit state, context for the engine handle

**Decision.** Page order, rotation, selection and zoom live in a Zustand
store. The `LoadedPdfDocument` travels by React context.

**Rationale.** Three surfaces — toolbar, rail and canvas — read overlapping
slices of the same state, and context alone would re-render every consumer
on any change, which with hundreds of thumbnails is not viable. Zustand's
selector subscriptions mean a zoom change does not touch the rail.

The alternative was a hand-rolled store over `useSyncExternalStore`, which
React provides for exactly this. Measured against it, Zustand is 342 bytes
gzipped for the React binding plus 405 for the core, with no dependencies.
At that size the tested implementation wins over 35 lines of our own.

The split matters as much as the choice. The store holds replayable data;
the engine handle owns worker memory and a disposal lifecycle, so it stays
out. Context suits it because it changes once per document, not per
interaction.

---

## ADR-020 — Thumbnails render on intersection, with the rail as root

**Decision.** Each thumbnail renders only while near the rail's viewport,
and resets its canvas to zero when it leaves.

**Rationale.** Memory becomes proportional to what is visible rather than
to document length. Measured on a 300-page file: 15 live canvases and
1.6 MB of bitmaps regardless of scroll position, against roughly 31 MB had
every page been kept.

The root must be the rail, not the default viewport. `rootMargin` expands
the root's rectangle, so with the default root the overscan describes
distance from the window edge — which says nothing about a thumbnail
clipped by a scroll container. Measured before and after: the same document
held 6 live thumbnails with no effective read-ahead, and 10 with it.

---

## ADR-021 — Annotations as plain JSON on an SVG overlay

**Decision.** Annotation geometry is stored in page points (top-left origin,
Y down) as a discriminated union in the Zustand store. Rendering and
hit-testing use an SVG overlay sized to the page canvas.

**Alternatives.** Drawing onto a second canvas would be faster for dense ink,
but loses hit-testing, focus and keyboard access. Editing the PDF content
stream in place is not feasible in the browser for arbitrary documents.

**Rationale.** Point-space storage means zoom and device pixel ratio never
bake into the model — the SVG viewBox is the page, so the same numbers
paint correctly at any scale. SVG gives selection and accessibility for
free. Keeping signatures as vector paths (not PNGs) preserves sharpness at
export and avoids embedding large bitmaps.

A draft-in-progress must be held in a ref as well as in React state: the
pointer-up handler would otherwise close over a stale `null` and silently
drop every shape on release.

---

## ADR-022 — Undo is a stack of EditModel snapshots, not inverse commands

**Decision.** History stores up to 50 snapshots of `{ pages, annotations,
currentPageId, selectedAnnotationId }`. Undo restores the previous
snapshot; redo restores the one that was current.

**Alternatives.** An earlier sketch used Command `{ do, undo, label }` —
an inverse function per action. Zustand's `zundo` / `temporal` middleware
would snapshot the entire store.

**Rationale.** Inverse commands for this editor are easy to get wrong:
rotating a page also remaps every annotation's coordinates, deleting a
page also drops its annotations and repairs the current-page pointer. A
missed inverse would corrupt the document on Ctrl+Z, which is worse than
a missed history entry. Snapshots cannot drift from the model, because
they *are* the model.

The whole point of keeping the edit as plain JSON was that it is cheap to
copy. Fifty copies of pages-plus-annotations are kilobytes, not the
megabyte-scale PDF copies the architecture set out to avoid. Zoom, tool
and colour stay out of the snapshot so undoing a rectangle does not also
undo a zoom.

Typing and dragging fire many mutations. Consecutive edits that share a
coalesce key collapse into one stack entry, so Ctrl+Z walks back a
gesture rather than a character or a pointer-move.

`zundo` was skipped: the snapshot shape is a subset of the store, and
the coalesce rules are specific enough that a general middleware would
still need wrapping.

---

## ADR-023 — Export on the main thread for v1

**Decision.** pdf-lib write runs on the main thread, behind a busy button.
A dedicated export worker is deferred.

**Context.** The architecture sketch put serialisation on a worker so a
large save would not freeze the tab. Next.js static export plus pdf-lib's
CJS build makes that worker a bundling project of its own.

**Rationale.** `save({ useObjectStreams: true })` already yields every
`objectsPerTick` operations, and we `setTimeout(0)` between pages so the
spinner can paint. That is enough for the documents this phase targets.
If a 200 MB save still feels frozen, that measurement is what justifies
the worker — not the sketch.

---

## ADR-024 — Flatten rotation on editor export

**Decision.** Editor download draws each source page onto a new unrotated
page, baking source `/Rotate` plus the editor turn into the content
stream, then paints annotations in that displayed space.

**Alternatives.** `setRotation` on the copied page and draw marks in
displayed coordinates. That double-applies `/Rotate` to the annotations:
viewers rotate the page *and* the marks, so they detach from the content.

**Rationale.** The overlay lives in displayed page space (pdf.js viewport,
Y down). The only WYSIWYG write is to flatten that space into PDF user
space (Y up, `/Rotate` 0) in one step.

Tool-page rotate is different: it only updates `/Rotate` metadata, because
there are no annotations to keep glued.

---

## ADR-025 — STORE ZIP with no extra library

**Decision.** Split-to-many-files is packed with a local STORE ZIP writer
(`utils/fileUtils/createZipArchive.ts`), not `jszip`.

**Rationale.** PDFs are already deflate-compressed; wrapping them in
another deflate layer costs CPU and rarely saves bytes. STORE is the ZIP
method that means "copy the bytes", and the format is small enough to
write without a dependency.

---

## ADR-026 — Theme as a class, painted before React

**Decision.** Persist `light` / `dark` / `system` in `localStorage`, paint
the resolved scheme by toggling `html.light` / `html.dark`, and run that
paint from a blocking inline script in the root layout.

**Alternatives.** Keep following `prefers-color-scheme` only (no override).
Use `next-themes`. Set a cookie from a server action.

**Rationale.** A visitor who wants light while their OS is dark must be
able to say so, and the choice has to survive a reload. Cookies would need
a server; we have none. `next-themes` is the same pattern as a few dozen
lines we can own. The inline script exists because React hydration is too
late: without it the SSR HTML would flash the wrong scheme for a frame.

`useSyncExternalStore` (not `useEffect`) reads the stored preference into
React, so the toggle icon hydrates against the server snapshot and then
updates, instead of tripping the `set-state-in-effect` rule.

---

## ADR-027 — Probe canvas ceilings, queue page rasters

**Decision.** Measure `maxDimension` and `maxArea` once per tab by painting
onto a scratch canvas, and run at most two pdf.js paints at a time.

**Alternatives.** Keep the iOS-era 4096 / 16.7M fallback for every browser.
Start every thumbnail render immediately.

**Rationale.** Exceeding a canvas ceiling does not throw; it yields a blank
page, which looks like a corrupt file. Desktop Chrome can draw far past
4096px, so using only the fallback made high zoom softer than the machine
allowed. The probe reads a pixel back because iOS Safari will accept a
`width` assignment and still refuse to draw.

Unbounded concurrency is the other failure mode: a flick through the rail
would start one decode per intersecting thumbnail. Two in flight keeps the
worker busy without stacking dozens of bitmaps. Cancelled jobs are skipped
in the queue, so scrolling away is still cheap.

## ADR-028 — Security headers in firebase.json

**Decision.** Declare all HTTP security headers in `firebase.json`, not
`next.config.ts`.

**Alternatives.** `headers()` in Next config. A Cloud Function that adds
them. Skip headers until a domain is attached.

**Rationale.** Static export makes Next's `headers` inert (see ADR-005).
Firebase Hosting is the only server that will ever speak for this app, so
the headers belong next to the CDN config. `Referrer-Policy: no-referrer`
and a lock-down Permissions-Policy match the product promise: a document
opened here should not leak its URL, and the tab should not grow camera or
mic access it will never use.

`script-src` keeps `'unsafe-inline'` because the theme bootstrap is an
inline blocking script (ADR-026) and Next's static runtime also inlines a
small amount of bootstrapping. `'wasm-unsafe-eval'` is required for pdf.js
image decoders. Tightening either would blank pages or flash the wrong
theme.

---

## ADR-029 — Metadata and sitemap from the catalogue

**Decision.** Page titles, descriptions, Open Graph tags, JSON-LD and the
sitemap are derived from `constants/tools.ts` and `config/site.ts`. The
Open Graph image is generated at build time with `next/og`.

**Alternatives.** Hand-written meta tags per page. A committed PNG.

**Rationale.** Adding a tool already requires a catalogue entry; duplicating
copy for crawlers is how titles drift. `next/og` emits a PNG social crawlers
accept, without checking a binary into git. `/design-system` is excluded from
the sitemap and `robots.txt` because it is an internal reference, not a
product page.

---

## ADR-030 — SEO copy lives in the catalogue, editor URL is `/pdf-editor`

**Decision.** Each tool carries `headline`, `seoTitle` and `faqs` next to the
UI copy. The editor route is `/pdf-editor`. Firebase Hosting 301s `/editor`
to that URL. Home H1, titles and FAQs lead with "free online PDF editor"
while keeping the no-upload promise in the same sentence.

**Alternatives.** Hand-written meta tags and FAQ markup per page. Keep
`/editor` and rely on the title tag alone. A blog or marketing site on a
second origin.

**Rationale.** "PDF editor" / "online PDF editor" are the queries the product
must be eligible for. The URL, H1, title and FAQ copy have to say that in one
voice, and the catalogue is already the source of truth (ADR-029). A blog
would add pages we cannot keep honest. Rank is not guaranteed by markup —
Google still needs crawl, links and time — but soft titles like "Edit PDF"
leave the query on the table.

---

## ADR-009 — No unit tests; static analysis as the quality gate

**Decision.** Quality gates are `tsc --noEmit` and ESLint. No unit or
component test suite.

**Rationale.** Project convention. End-to-end tests exercise the real PDF
pipeline in a real browser, which is where this application's risk actually
lives; the strict compiler settings cover much of what unit tests would.
