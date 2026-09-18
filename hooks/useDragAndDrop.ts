'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { logger } from '@/utils/commonFunctions/logger';

/**
 * Dragging text or a link should not light up a file drop zone. The
 * `dataTransfer.types` list names what is actually being carried.
 */
const isFileDrag = (types: ArrayLike<string> | undefined): boolean =>
  types !== undefined && Array.from(types).includes('Files');

/**
 * Drag-and-drop file input for a single drop surface.
 *
 * Two non-obvious problems are solved here.
 *
 * The first is flicker. `dragenter` and `dragleave` fire for every descendant
 * the pointer crosses, so naively toggling on enter and off leave makes the
 * highlight strobe as the cursor moves over child elements. Counting enters
 * against leaves and only clearing at zero keeps it steady.
 *
 * The second is the browser's default drop behaviour, which is to navigate to
 * the dropped file. Miss the drop zone by ten pixels and the browser replaces
 * the page with a raw PDF viewer, silently discarding whatever the user had
 * selected. The window-level guard makes the rest of the page absorb stray
 * drops instead.
 */
export function useDragAndDrop(onFilesDropped: (files: readonly File[]) => void) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragDepthRef = useRef(0);

  useEffect(() => {
    // `defaultPrevented` tells us a drop zone already claimed this event, so
    // the guard stays out of the way of real drop targets.
    const guardDragOver = (event: globalThis.DragEvent): void => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (event.dataTransfer) {
        // Show "not allowed" outside the zone so the cursor does not promise
        // a drop that will be swallowed.
        event.dataTransfer.dropEffect = 'none';
      }
    };

    const guardDrop = (event: globalThis.DragEvent): void => {
      if (event.defaultPrevented) return;
      event.preventDefault();
      logger.debug('upload', 'absorbed a drop outside the drop zone');
    };

    window.addEventListener('dragover', guardDragOver);
    window.addEventListener('drop', guardDrop);

    return () => {
      window.removeEventListener('dragover', guardDragOver);
      window.removeEventListener('drop', guardDrop);
    };
  }, []);

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>): void => {
    if (!isFileDrag(event.dataTransfer.types)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingOver(true);
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>): void => {
    if (!isFileDrag(event.dataTransfer.types)) return;
    // Required: without preventDefault on dragover the element is not a valid
    // drop target and the drop event never fires.
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>): void => {
    if (!isFileDrag(event.dataTransfer.types)) return;
    event.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDraggingOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>): void => {
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingOver(false);

      const dropped = Array.from(event.dataTransfer.files);
      logger.debug('upload', `dropped ${dropped.length} file(s)`);
      if (dropped.length > 0) onFilesDropped(dropped);
    },
    [onFilesDropped],
  );

  const dragHandlers = useMemo(
    () => ({ onDragEnter, onDragOver, onDragLeave, onDrop }),
    [onDragEnter, onDragOver, onDragLeave, onDrop],
  );

  return { isDraggingOver, dragHandlers };
}
