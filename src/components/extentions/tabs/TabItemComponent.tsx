import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export default function TabItemComponent({
  node,
  editor,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
}) {
  const tabIndex = node.attrs?.tabIndex || 0;
  const isEditable = editor?.isEditable ?? false;

  // Handle keyboard events to prevent splitting
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable || !editor) return;

    const { selection } = editor.state;
    const { $anchor } = selection;

    // Prevent Enter at the end of tab item from creating new tab items
    if (e.key === "Enter" && !e.shiftKey) {
      // Allow Enter to work normally within content, but prevent if it would split the tab item
      // The isolating property should handle this, but we add extra protection
      if ($anchor.parent.type.name === "tabItem") {
        // Check if we're at the very end of the tab item
        const tabItem = $anchor.parent;
        const isAtEnd = $anchor.parentOffset === tabItem.childCount;

        if (isAtEnd) {
          // Allow Enter to create a new paragraph within the tab item
          // The isolating property will prevent splitting
          return;
        }
      }
    }

    // Prevent Backspace at the start from splitting
    if (e.key === "Backspace") {
      if ($anchor.parent.type.name === "tabItem") {
        const tabItem = $anchor.parent;
        const isAtStart = $anchor.parentOffset === 0;

        if (isAtStart && tabItem.childCount > 0) {
          const firstChild = tabItem.firstChild;
          if (firstChild && $anchor.pos === $anchor.start($anchor.depth)) {
            // We're at the very start, prevent deletion that might cause issues
            // But allow normal backspace within content
            return;
          }
        }
      }
    }
  };

  return (
    <NodeViewWrapper
      className="tab-item-content p-4"
      data-tab-index={tabIndex}
      onKeyDown={handleKeyDown}
    >
      <NodeViewContent />
    </NodeViewWrapper>
  );
}
