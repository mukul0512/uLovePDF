'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { PageRail } from './PageRail';

function isUndoRedoShortcut(event: KeyboardEvent): 'undo' | 'redo' | null {
  const key = event.key.toLowerCase();
  const withModifier = event.metaKey || event.ctrlKey;
  if (!withModifier || event.altKey) return null;

  if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
  if (key === 'y' && !event.shiftKey) return 'redo';
  return null;
}

export function EditorShell() {
  const goToAdjacentPage = useEditorStore((state) => state.goToAdjacentPage);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const historyAction = isUndoRedoShortcut(event);
      if (historyAction !== null) {
        // Claimed even while a text annotation is focused: native textarea
        // undo would desync from the store, which already holds the text.
        event.preventDefault();
        if (historyAction === 'undo') undo();
        else redo();
        return;
      }

      // Arrow keys belong to whatever the user is typing in or operating,
      // so only claim them when focus is on the page background.
      const target = event.target;
      if (target instanceof HTMLElement && target !== document.body) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        goToAdjacentPage(1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        goToAdjacentPage(-1);
      } else {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToAdjacentPage, redo, undo]);

  return (
    <div className="border-line rounded-card flex flex-col overflow-hidden border">
      <EditorToolbar />

      {/* The rail is a horizontal strip on narrow screens and a column
          beside the page on wide ones, which is the same markup either
          way — only the axis changes. */}
      <div className="flex min-h-0 flex-col md:h-[70vh] md:flex-row">
        <PageRail />
        <EditorCanvas />
      </div>
    </div>
  );
}
