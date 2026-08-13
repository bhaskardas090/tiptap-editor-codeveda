import { useEffect, useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { X } from "lucide-react";
import type { Editor } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { findColumnLayout, removeColumnAt } from "./columnCommands";

/**
 * A single column, with a remove button in its top-right corner.
 *
 * Removing the last column takes the layout with it — see removeColumnAt — so
 * the button stays available at every child count rather than being disabled on
 * the final column.
 */
export default function ColumnComponent({
  node,
  editor,
  getPos,
}: {
  node: PMNode;
  editor: Editor;
  getPos: () => number | undefined;
}) {
  const [isEditable, setIsEditable] = useState(editor?.isEditable ?? false);

  // Drop the editing chrome as soon as the editor is switched to read-only.
  useEffect(() => {
    if (!editor) return;
    const sync = () => setIsEditable(editor.isEditable);
    sync();
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor]);

  const handleRemoveColumn = () => {
    if (!isEditable || !editor || typeof getPos !== "function") return;

    const columnPos = getPos();
    if (typeof columnPos !== "number") return;

    const found = findColumnLayout(editor.state.doc, columnPos);
    if (!found) return;

    const { layoutPos, index, childCount } = found;
    const isLastColumn = childCount <= 1;
    const hasContent = (node.textContent || "").trim().length > 0;

    // An empty column goes without ceremony; anything that would lose content —
    // or the whole layout — asks first.
    if (isLastColumn) {
      if (
        !confirm(
          "This is the last column, so the column layout will be removed as well. Continue?"
        )
      ) {
        return;
      }
    } else if (hasContent && !confirm("Delete this column and its content?")) {
      return;
    }

    editor.chain().command(removeColumnAt(layoutPos, index)).run();
  };

  return (
    // `data-type="column"` matches what renderHTML emits, so the column keeps
    // its box styling whether it is rendered by this node view or from
    // serialized HTML.
    <NodeViewWrapper className="column-container" data-type="column">
      {isEditable && (
        <button
          type="button"
          onClick={handleRemoveColumn}
          onMouseDown={(e) => e.preventDefault()}
          className="column-remove-button rounded p-0.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-[#2a2a2a]"
          title="Remove this column"
          contentEditable={false}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <NodeViewContent as="div" className="column-content" />
    </NodeViewWrapper>
  );
}
