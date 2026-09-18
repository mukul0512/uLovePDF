import { Button } from '@/components/ui/Button';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
  TrashIcon,
} from '@/components/ui/icon/icons';
import type { SelectedFile, SelectedFileId } from '@/types/file';
import { cn } from '@/utils/commonFunctions/cn';
import { formatBytes } from '@/utils/fileUtils/formatBytes';

interface SelectedFileListProps {
  files: readonly SelectedFile[];
  /** Merge cares about page order, so only it exposes reordering. */
  isReorderable: boolean;
  /** When set, rows become buttons that choose which file to preview. */
  selectedId?: SelectedFileId | null | undefined;
  onSelect?: ((id: SelectedFileId) => void) | undefined;
  onRemove: (id: SelectedFileId) => void;
  onMove: (id: SelectedFileId, offset: -1 | 1) => void;
}

function FileSummary({ file }: { file: SelectedFile }) {
  return (
    <>
      {/* `truncate` plus `min-w-0` on the parent is what stops a long
          filename stretching the flex row past its container. */}
      <p className="truncate text-sm font-medium">{file.name}</p>
      <p className="text-muted text-xs">{formatBytes(file.sizeBytes)}</p>
    </>
  );
}

/**
 * The chosen files, in the order they will be processed.
 *
 * Reordering is done with buttons rather than drag-and-drop. Dragging is the
 * nicer gesture but is unusable by keyboard and awkward with a screen reader,
 * so buttons are the accessible baseline. Pointer dragging can be layered on
 * top later without taking this away.
 */
export function SelectedFileList({
  files,
  isReorderable,
  selectedId = null,
  onSelect,
  onRemove,
  onMove,
}: SelectedFileListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {files.map((entry, index) => {
        const isSelected = onSelect !== undefined && entry.id === selectedId;

        return (
          <li
            key={entry.id}
            className={cn(
              'rounded-card flex items-center gap-3 border px-3 py-2.5',
              isSelected ? 'border-primary bg-info-surface' : 'border-line',
            )}
          >
            {isReorderable ? (
              <span className="text-muted w-5 shrink-0 text-right text-sm tabular-nums">
                {index + 1}
              </span>
            ) : null}

            <FileTextIcon size="md" className="text-muted shrink-0" />

            {onSelect === undefined ? (
              <div className="min-w-0 flex-1">
                <FileSummary file={entry} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(entry.id)}
                aria-current={isSelected ? 'true' : undefined}
                className="rounded-control min-w-0 flex-1 text-left"
              >
                <FileSummary file={entry} />
              </button>
            )}

            {isReorderable ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label={`Move ${entry.name} up`}
                  disabled={index === 0}
                  onClick={() => onMove(entry.id, -1)}
                >
                  <ChevronUpIcon size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  aria-label={`Move ${entry.name} down`}
                  disabled={index === files.length - 1}
                  onClick={() => onMove(entry.id, 1)}
                >
                  <ChevronDownIcon size="sm" />
                </Button>
              </>
            ) : null}

            <Button
              variant="ghost"
              size="sm"
              className="px-2"
              aria-label={`Remove ${entry.name}`}
              onClick={() => onRemove(entry.id)}
            >
              <TrashIcon size="sm" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
