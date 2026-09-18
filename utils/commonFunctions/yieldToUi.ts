/**
 * Lets the browser paint between heavy PDF steps.
 *
 * pdf-lib work is CPU-bound on the main thread in this phase. Without a
 * turn, a spinner set immediately before `save()` never appears, and the tab
 * looks frozen. A zero-delay timeout is enough for layout and paint to run.
 */
export function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
