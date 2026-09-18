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

export interface ToolDefinition {
  readonly id: ToolId;
  readonly name: string;
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
    label: 'Edit and annotate',
    description: 'Add text, drawings, highlights and signatures on top of a page.',
  },
];

export const TOOLS = {
  merge: {
    id: 'merge',
    name: 'Merge PDF',
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
      'Combine several PDF files into one document in the order you choose. Pages are copied across without re-encoding, so nothing loses quality.',
    notes: [
      'Pages are copied without re-compression, so text and images keep their original quality.',
      'Bookmarks and form fields from the source files are not carried over yet.',
      'Encrypted PDFs must be unlocked in another application first.',
    ],
  },
  split: {
    id: 'split',
    name: 'Split PDF',
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
      'Break one PDF into separate files, either a file per page or by the page ranges you specify. Useful for pulling a single contract or chapter out of a larger document.',
    notes: [
      'Each output file keeps the original page size and orientation.',
      'Splitting into many files produces a ZIP archive so you get one download.',
    ],
  },
  rotate: {
    id: 'rotate',
    name: 'Rotate PDF',
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
      'Rotate some or all pages in 90 degree steps and save the corrected orientation permanently, so the document opens upright everywhere.',
    notes: [
      'Rotation is stored in the page metadata, so the file size does not change.',
      'Every page is turned by the same amount. To rotate pages independently, use the editor.',
    ],
  },
  compress: {
    id: 'compress',
    name: 'Compress PDF',
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
      'Shrink a PDF by re-encoding embedded images at a lower resolution and removing data the document does not need.',
    notes: [
      'Scanned and image-heavy documents shrink the most. Text-only PDFs are already efficient and may barely change.',
      'This is not equivalent to a desktop tool like Ghostscript: fonts are not re-subset, because that cannot be done reliably in a browser.',
      'You will see the resulting size before deciding whether to download it.',
    ],
  },
  editor: {
    id: 'editor',
    name: 'Edit PDF',
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
      'Annotate a PDF with text, freehand drawing, highlights, shapes and a signature, then export a new file with your changes applied.',
    notes: [
      'Annotations are drawn on top of the page. Editing the existing text of a PDF in place is not supported.',
      'Download writes a new file. Existing form fields and bookmarks are not carried over yet.',
    ],
  },
} as const satisfies Record<ToolId, ToolDefinition>;

/** Ordered list for rendering. Object key order is the display order. */
export const TOOL_LIST: readonly ToolDefinition[] = Object.values(TOOLS);

export const getToolsInCategory = (category: ToolCategoryId): readonly ToolDefinition[] =>
  TOOL_LIST.filter((tool) => tool.category === category);
