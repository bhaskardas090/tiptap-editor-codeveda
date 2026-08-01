import type { Editor } from "@tiptap/react";

export interface TrackedPosition {
  /** The remembered position, mapped through every change made since. */
  get(): number;
  /** Stop following changes. Safe to call more than once. */
  release(): void;
}

/**
 * Remembers where an upload was started so the media can be dropped there when
 * it finishes, however far the cursor has wandered in the meantime.
 *
 * The raw position is not enough on its own — the author keeps typing while the
 * file uploads, which shifts everything after the caret. Each transaction is
 * therefore mapped through, exactly like ProseMirror does for its own
 * selections.
 */
export function trackInsertPosition(editor: Editor): TrackedPosition {
  let pos = editor.state.selection.from;
  let released = false;

  const onTransaction = ({ transaction }: { transaction: any }) => {
    if (transaction.docChanged) {
      // Bias 1: content inserted exactly here goes *before* the tracked spot,
      // so several uploads finishing in order stay in order.
      pos = transaction.mapping.map(pos, 1);
    }
  };

  editor.on("transaction", onTransaction);

  return {
    get: () => Math.min(Math.max(pos, 0), editor.state.doc.content.size),
    release: () => {
      if (released) return;
      released = true;
      editor.off("transaction", onTransaction);
    },
  };
}
