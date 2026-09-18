import type { Brand } from './brand';

export type SelectedFileId = Brand<string, 'SelectedFileId'>;

/**
 * A file the user has chosen, before any PDF parsing happens.
 *
 * This holds the `File` handle rather than its bytes, and that is deliberate.
 * A `File` is a lazy reference to data still sitting on disk: creating one
 * costs almost nothing, and the browser only reads from disk when you call
 * `.arrayBuffer()` or `.slice()`. Eagerly buffering a 200 MB PDF at selection
 * time would burn 200 MB of heap for a list the user may clear a second later.
 *
 * No object URLs are created here either, so there is nothing to revoke until
 * a renderer actually needs bytes.
 */
export interface SelectedFile {
  readonly id: SelectedFileId;
  readonly file: File;
  readonly name: string;
  readonly sizeBytes: number;
  /** Large enough that parsing and rendering may strain the tab's memory. */
  readonly isLarge: boolean;
}
