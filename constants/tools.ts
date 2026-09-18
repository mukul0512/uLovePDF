import { ROUTES, type Route } from './routes';

/**
 * The tool catalogue, as data.
 *
 * One source of truth drives the landing page grid, each tool page's heading
 * and copy, page metadata and the sitemap. Adding a tool means editing this
 * file and creating a route, nothing else.
 *
 * Note that icons are referenced by key rather than as components. The
 * architecture boundary forbids React imports in `constants/`, which is the
 * right outcome here: this file is data, and mapping data to components is
 * the component layer's job (see `components/tools/toolIcons.tsx`).
 */

export type ToolId = 'merge' | 'split' | 'rotate' | 'compress' | 'editor';
export type ToolIconKey = 'merge' | 'split' | 'rotate' | 'compress' | 'edit';
export type ToolCategoryId = 'organise' | 'optimise' | 'edit';

export interface ToolCategory {
  readonly id: ToolCategoryId;
  readonly label: string;
  readonly description: string;
}

export interface ToolFileSelection {
  /** Merge needs many files; the rest operate on one document at a time. */
  readonly allowMultiple: boolean;
  readonly minFiles: number;
  /** Shown while the minimum is unmet, so the disabled action explains itself. */
  readonly minFilesHint: string;
}

export interface ToolFaq {
  readonly question: string;
  readonly answer: string;
}

export interface ToolDefinition {
  readonly id: ToolId;
  readonly name: string;
  /** Visible H1. Often a little longer than `name` so the primary query is explicit. */
  readonly headline: string;
  /**
   * Document title (the `%s` in the layout template). Keep it under ~60
   * characters and lead with the query the page should rank for.
   */
  readonly seoTitle: string;
  /** `null` until the route exists, so the UI can render it as unavailable. */
  readonly href: Route | null;
  readonly category: ToolCategoryId;
  readonly iconKey: ToolIconKey;
  readonly fileSelection: ToolFileSelection;
  /** Label for the primary action, e.g. "Merge PDFs". */
  readonly actionLabel: string;
  /** One line, used on the tool card. */
  readonly summary: string;
  /** Fuller description, used as the page lead and the meta description. */
  readonly description: string;
  /** Honest caveats, shown on the tool page. Users deserve these up front. */
  readonly notes: readonly string[];
  /** Visible FAQ copy, also emitted as FAQPage JSON-LD. */
  readonly faqs: readonly ToolFaq[];
}

export const TOOL_CATEGORIES: readonly ToolCategory[] = [
  {
    id: 'organise',
    label: 'Organise pages',
    description: 'Combine, separate and straighten the pages of a document.',
  },
  {
    id: 'optimise',
    label: 'Optimise',
    description: 'Make files smaller so they fit email and upload limits.',
  },
  {
    id: 'edit',
    label: 'PDF editor',
    description: 'Annotate, highlight and sign a PDF in the browser.',
  },
];

export const TOOLS = {
  merge: {
    id: 'merge',
    name: 'Merge PDF',
    headline: 'Merge PDF files online',
    seoTitle: 'Merge PDF Files Online — Free',
    href: ROUTES.merge,
    category: 'organise',
    iconKey: 'merge',
    fileSelection: {
      allowMultiple: true,
      minFiles: 2,
      minFilesHint: 'Add at least two PDFs to merge.',
    },
    actionLabel: 'Merge PDFs',
    summary: 'Combine several PDFs into a single document.',
    description:
      'Merge PDF files in your browser. Combine documents in the order you choose. Pages are copied without re-encoding, so nothing loses quality, and nothing is uploaded.',
    notes: [
      'Pages are copied without re-compression, so text and images keep their original quality.',
      'Bookmarks and form fields from the source files are not carried over yet.',
      'Encrypted PDFs must be unlocked in another application first.',
    ],
    faqs: [
      {
        question: 'Can I merge PDF files without uploading them?',
        answer:
          'Yes. Recto reads each file on your device with the browser File API and writes the combined PDF in memory. There is no upload, because there is no server that could receive one.',
      },
      {
        question: 'Does merging PDFs reduce quality?',
        answer:
          'No. Pages are copied into the new file without re-compressing images or re-encoding text, so the output matches the sources.',
      },
      {
        question: 'How many PDFs can I combine?',
        answer:
          'Add at least two files. The practical limit is your device memory, not a server quota — this tool never sends the documents away.',
      },
    ],
  },
  split: {
    id: 'split',
    name: 'Split PDF',
    headline: 'Split PDF files',
    seoTitle: 'Split PDF Online — Extract Pages',
    href: ROUTES.split,
    category: 'organise',
    iconKey: 'split',
    fileSelection: {
      allowMultiple: false,
      minFiles: 1,
      minFilesHint: 'Add a PDF to split.',
    },
    actionLabel: 'Split PDF',
    summary: 'Separate a PDF into pages or custom ranges.',
    description:
      'Split a PDF in your browser into single pages or custom ranges. Pull a contract or chapter out of a larger document without uploading the file.',
    notes: [
      'Each output file keeps the original page size and orientation.',
      'Splitting into many files produces a ZIP archive so you get one download.',
    ],
    faqs: [
      {
        question: 'How do I split a PDF into separate files?',
        answer:
          'Open the PDF, choose one file per page or enter page ranges, then download. Ranges become individual PDFs; many files are packed into one ZIP.',
      },
      {
        question: 'Is the original PDF uploaded when I split it?',
        answer:
          'No. The file stays in the tab. Split is a local copy of selected pages into new documents.',
      },
      {
        question: 'Can I extract a single page from a PDF?',
        answer:
          'Yes. Enter that page number as a range of one. You get a new PDF that contains only that page.',
      },
    ],
  },
  rotate: {
    id: 'rotate',
    name: 'Rotate PDF',
    headline: 'Rotate PDF pages',
    seoTitle: 'Rotate PDF Online',
    href: ROUTES.rotate,
    category: 'organise',
    iconKey: 'rotate',
    fileSelection: {
      allowMultiple: false,
      minFiles: 1,
      minFilesHint: 'Add a PDF to rotate.',
    },
    actionLabel: 'Rotate PDF',
    summary: 'Turn sideways pages the right way up.',
    description:
      'Rotate PDF pages in your browser in 90 degree steps and save the upright orientation into the file. Nothing is uploaded.',
    notes: [
      'Rotation is stored in the page metadata, so the file size does not change.',
      'Every page is turned by the same amount. To rotate pages independently, use the PDF editor.',
    ],
    faqs: [
      {
        question: 'How do I rotate a PDF the right way up?',
        answer:
          'Add the file, choose 90, 180 or 270 degrees, then download. The new orientation is written into the page so other readers open it upright.',
      },
      {
        question: 'Does rotating a PDF change the file size?',
        answer:
          'No. This tool updates page rotation metadata rather than redrawing the content, so the size stays the same.',
      },
      {
        question: 'Can I rotate pages independently?',
        answer:
          'This page turns every page by the same amount. For mixed orientations, open the PDF editor and rotate pages one at a time.',
      },
    ],
  },
  compress: {
    id: 'compress',
    name: 'Compress PDF',
    headline: 'Compress PDF files',
    seoTitle: 'Compress PDF Online',
    href: ROUTES.compress,
    category: 'optimise',
    iconKey: 'compress',
    fileSelection: {
      allowMultiple: false,
      minFiles: 1,
      minFilesHint: 'Add a PDF to compress.',
    },
    actionLabel: 'Compress PDF',
    summary: 'Reduce file size for email and upload limits.',
    description:
      'Compress a PDF in your browser by re-encoding images and dropping unused data. See the new size before you download. The file never leaves this device.',
    notes: [
      'Scanned and image-heavy documents shrink the most. Text-only PDFs are already efficient and may barely change.',
      'This is not equivalent to a desktop tool like Ghostscript: fonts are not re-subset, because that cannot be done reliably in a browser.',
      'You will see the resulting size before deciding whether to download it.',
    ],
    faqs: [
      {
        question: 'How can I compress a PDF without uploading it?',
        answer:
          'Open the file here. Compression runs in the tab: embedded images are re-encoded and unused objects are dropped, then you download the smaller file.',
      },
      {
        question: 'Will compressing a PDF make text blurry?',
        answer:
          'Text stays vector. Size comes down mainly on photos and scans. A text-only PDF may barely change, which is expected rather than a failure.',
      },
      {
        question: 'Is this the same as Ghostscript compression?',
        answer:
          'No. A browser cannot reliably re-subset fonts the way a desktop toolchain can. You see the output size first so you can decide whether it is enough.',
      },
    ],
  },
  editor: {
    id: 'editor',
    name: 'PDF Editor',
    headline: 'Online PDF editor',
    seoTitle: 'Free Online PDF Editor',
    href: ROUTES.editor,
    category: 'edit',
    iconKey: 'edit',
    fileSelection: {
      allowMultiple: false,
      minFiles: 1,
      minFilesHint: 'Add a PDF to edit.',
    },
    actionLabel: 'Open in editor',
    summary: 'Add text, shapes, highlights and signatures.',
    description:
      'Free online PDF editor in your browser. Annotate, highlight, draw shapes and sign a PDF, then download a new file. Your document stays on this device and is never uploaded.',
    notes: [
      'Annotations are drawn on top of the page. Editing the existing text of a PDF in place is not supported.',
      'Download writes a new file. Existing form fields and bookmarks are not carried over yet.',
    ],
    faqs: [
      {
        question: 'Is Recto a free online PDF editor?',
        answer:
          'Yes. This free online PDF editor runs in your browser with no account and no payment. Open a file, mark it up, and download the result.',
      },
      {
        question: 'Does this PDF editor upload my files?',
        answer:
          'No. The browser reads the PDF with the File API and keeps it in memory. Recto is static files on a CDN; there is no upload API.',
      },
      {
        question: 'Can I edit a PDF online without creating an account?',
        answer:
          'Yes. There is no sign-up. Choose a PDF from disk, add text, highlights, shapes or a signature, then download. Close the tab and the file is gone from memory.',
      },
      {
        question: 'Can I edit existing text in a PDF?',
        answer:
          'Not in place. You add text, highlights, shapes and signatures on top of the page, then export a new file. That is an honest limit of a browser editor.',
      },
      {
        question: 'Can I sign a PDF in my browser?',
        answer:
          'Yes. Draw a signature on the pad, place it on the page, and download. The signature is stored as vector strokes, not an uploaded image.',
      },
    ],
  },
} as const satisfies Record<ToolId, ToolDefinition>;

/** Ordered list for rendering. Object key order is the display order. */
export const TOOL_LIST: readonly ToolDefinition[] = Object.values(TOOLS);

export const getToolsInCategory = (category: ToolCategoryId): readonly ToolDefinition[] =>
  TOOL_LIST.filter((tool) => tool.category === category);
