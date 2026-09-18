/**
 * Copies pdf.js runtime assets into `public/pdfjs`.
 *
 * pdf.js does not bundle these; it fetches them by URL at runtime, and only
 * when a document actually needs them. A PDF that embeds all its fonts never
 * downloads a byte of `standard_fonts`, and a document with no JPEG 2000
 * images never touches the WebAssembly decoders.
 *
 * They are copied rather than committed so they cannot drift from the
 * installed version of the library, which is a genuinely nasty class of bug:
 * a mismatched worker fails in ways that look like a corrupt PDF.
 *
 * Wired to `predev` and `prebuild`, so it is impossible to forget.
 */
import { cp, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const packageRoot = dirname(require.resolve('pdfjs-dist/package.json'));
const targetRoot = join(process.cwd(), 'public', 'pdfjs');

/** Lazily fetched by pdf.js, so size here is not download size. */
const ASSET_DIRECTORIES = ['standard_fonts', 'cmaps', 'wasm', 'iccs'];
/**
 * The legacy worker, matching the legacy main build loaded by
 * `lib/pdf/engine/pdfjs.ts`. Worker and main build must come from the same
 * variant: pdf.js checks their versions match and refuses to run otherwise.
 */
const WORKER_FILE = join('legacy', 'build', 'pdf.worker.min.mjs');

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

for (const directory of ASSET_DIRECTORIES) {
  await cp(join(packageRoot, directory), join(targetRoot, directory), { recursive: true });
}

await cp(join(packageRoot, WORKER_FILE), join(targetRoot, 'pdf.worker.min.mjs'));

const { version } = require('pdfjs-dist/package.json');
console.log(`pdf.js ${version} assets copied to public/pdfjs`);
