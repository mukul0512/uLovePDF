import { HISTORY_LIMITS } from '@/constants/limits';
import type { EditSnapshot, HistoryEntry } from '@/types/editor';

interface SnapshotSource {
  readonly pages: EditSnapshot['pages'];
  readonly annotations: EditSnapshot['annotations'];
  readonly currentPageId: EditSnapshot['currentPageId'];
  readonly selectedAnnotationId: EditSnapshot['selectedAnnotationId'];
}

interface HistoryState {
  readonly past: readonly HistoryEntry[];
  readonly future: readonly HistoryEntry[];
}

export function snapshotEdit(state: SnapshotSource): EditSnapshot {
  return {
    pages: state.pages,
    annotations: state.annotations,
    currentPageId: state.currentPageId,
    selectedAnnotationId: state.selectedAnnotationId,
  };
}

function isSameEdit(left: SnapshotSource, right: SnapshotSource): boolean {
  return (
    left.pages === right.pages &&
    left.annotations === right.annotations &&
    left.currentPageId === right.currentPageId &&
    left.selectedAnnotationId === right.selectedAnnotationId
  );
}

/**
 * Records the current edit model so the next mutation can be undone.
 *
 * Coalescing keeps the original snapshot and extends the timestamp: that is
 * what makes a drag or a burst of typing one Ctrl+Z instead of fifty.
 */
export function recordHistory(
  state: SnapshotSource & HistoryState,
  label: string,
  coalesceKey: string | null,
  coalesceWindowMs: number,
): HistoryState {
  const now = Date.now();
  const last = state.past[state.past.length - 1];

  if (
    coalesceKey !== null &&
    last !== undefined &&
    last.coalesceKey === coalesceKey &&
    now - last.recordedAt <= coalesceWindowMs
  ) {
    const past = state.past.map((entry, index) =>
      index === state.past.length - 1 ? { ...entry, recordedAt: now } : entry,
    );
    return { past, future: [] };
  }

  const entry: HistoryEntry = {
    label,
    snapshot: snapshotEdit(state),
    coalesceKey,
    recordedAt: now,
  };

  const past = [...state.past, entry];
  const overflow = past.length - HISTORY_LIMITS.maxEntries;
  return {
    past: overflow > 0 ? past.slice(overflow) : past,
    future: [],
  };
}

/**
 * Applies a document mutation and, when the edit model actually changed,
 * pushes a history entry. View-only patches (selection, tool, zoom) pass
 * through without touching the stacks.
 */
export function commitEdit<TState extends SnapshotSource & HistoryState>(
  state: TState,
  label: string,
  patch: Partial<TState>,
  options?: { readonly coalesceKey?: string | null; readonly coalesceWindowMs?: number },
): TState {
  const next = { ...state, ...patch };

  const editChanged =
    !isSameEdit(state, next) && (patch.pages !== undefined || patch.annotations !== undefined);

  if (!editChanged) return next;

  return {
    ...next,
    ...recordHistory(state, label, options?.coalesceKey ?? null, options?.coalesceWindowMs ?? 0),
  };
}

export function undoEdit<TState extends SnapshotSource & HistoryState>(state: TState): TState {
  const entry = state.past[state.past.length - 1];
  if (entry === undefined) return state;

  const present: HistoryEntry = {
    label: entry.label,
    snapshot: snapshotEdit(state),
    coalesceKey: null,
    recordedAt: Date.now(),
  };

  return {
    ...state,
    ...entry.snapshot,
    past: state.past.slice(0, -1),
    future: [...state.future, present],
  };
}

export function redoEdit<TState extends SnapshotSource & HistoryState>(state: TState): TState {
  const entry = state.future[state.future.length - 1];
  if (entry === undefined) return state;

  const present: HistoryEntry = {
    label: entry.label,
    snapshot: snapshotEdit(state),
    coalesceKey: null,
    recordedAt: Date.now(),
  };

  return {
    ...state,
    ...entry.snapshot,
    past: [...state.past, present],
    future: state.future.slice(0, -1),
  };
}
