import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Trash2 } from "lucide-react";

export default function AccordionComponent({
  node,
  updateAttributes,
  editor,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
}) {
  const [open, setOpen] = useState(node.attrs?.open ?? true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(node.attrs?.title || "Output");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isEditable = editor?.isEditable ?? false;

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    updateAttributes({ title, open });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitle(node.attrs?.title || "Output");
      setIsEditingTitle(false);
    }
  };

  const toggleAccordion = () => {
    const newOpen = !open;
    setOpen(newOpen);
    updateAttributes({ title, open: newOpen });
  };

  const handleDeleteAccordion = () => {
    if (!isEditable) return; // Don't allow deletion in read-only mode
    if (editor && confirm("Are you sure you want to delete this accordion?")) {
      editor.chain().focus().deleteNode("accordion").run();
    }
  };

  // Handle keyboard events to prevent unwanted deletion and cursor escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable || !editor) return;

    const { selection } = editor.state;
    const { $anchor } = selection;

    // Prevent Enter from escaping the accordion
    if (e.key === "Enter" && !e.shiftKey) {
      // If we're right after the accordion node, prevent creating new content outside
      if ($anchor.nodeBefore?.type.name === "accordion") {
        e.preventDefault();
        e.stopPropagation();
        // Move cursor inside the last accordion item's content
        const accordionNode = $anchor.nodeBefore;
        if (accordionNode && accordionNode.childCount > 0) {
          const lastAccordionItem = accordionNode.lastChild;
          if (lastAccordionItem && lastAccordionItem.content.size > 0) {
            // Find the position of the last accordion item
            let lastItemPos = -1;
            editor.state.doc.descendants((node: any, pos: number) => {
              if (node.type.name === "accordionItem") {
                lastItemPos = pos;
                return false;
              }
            });

            if (lastItemPos !== -1) {
              const endPos = lastItemPos + lastAccordionItem.nodeSize - 2;
              editor.chain().focus().setTextSelection(endPos).run();
            }
          } else {
            // If last item is empty, just focus inside it
            let lastItemPos = -1;
            editor.state.doc.descendants((node: any, pos: number) => {
              if (node.type.name === "accordionItem") {
                lastItemPos = pos;
                return false;
              }
            });
            if (lastItemPos !== -1) {
              editor
                .chain()
                .focus()
                .setTextSelection(lastItemPos + 1)
                .run();
            }
          }
        }
        return;
      }
    }

    // Prevent Backspace/Delete from deleting the accordion when empty
    if ((e.key === "Backspace" || e.key === "Delete") && !e.shiftKey) {
      // If we're right after the accordion node, prevent deletion
      if ($anchor.nodeBefore?.type.name === "accordion") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // If we're right before the accordion node, prevent deletion
      if ($anchor.nodeAfter?.type.name === "accordion") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // If we're inside an accordion item, check if it would delete the item itself
      if ($anchor.parent.type.name === "accordionItem") {
        const accordionItem = $anchor.parent;
        const isAtStart = $anchor.parentOffset === 0;

        // Check if the accordion item is effectively empty (only empty paragraphs)
        const hasContent = accordionItem.content.content.some((node: any) => {
          if (node.type.name === "paragraph") {
            return node.content.size > 0;
          }
          return true; // Non-paragraph nodes are considered content
        });

        // If at start and no meaningful content, prevent deletion
        if (isAtStart && !hasContent && e.key === "Backspace") {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // If we're inside an accordion (but not in an item), check if it's empty
      if ($anchor.parent.type.name === "accordion") {
        const accordion = $anchor.parent;
        // Check if all accordion items are empty
        const hasAnyContent = accordion.content.content.some((item: any) => {
          if (item.type.name === "accordionItem") {
            return item.content.content.some((node: any) => {
              if (node.type.name === "paragraph") {
                return node.content.size > 0;
              }
              return true;
            });
          }
          return true;
        });

        // If accordion has no content, prevent deletion
        if (!hasAnyContent) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    }
  };

  return (
    <NodeViewWrapper
      className="accordion border border-gray-200 rounded-lg mb-3 overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Accordion Header */}
      <div
        className="accordion-header bg-gray-50 border-b border-gray-200"
        onClick={toggleAccordion}
      >
        <div className="flex items-center gap-2 px-1">
          {/* Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAccordion();
            }}
            className="flex items-center justify-center w-6 h-6 text-gray-600 hover:text-gray-800"
            title={open ? "Collapse" : "Expand"}
          >
            <span
              className={`cursor-pointer transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </button>

          {/* Title */}
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="bg-transparent border-b border-gray-300 outline-none font-medium text-gray-800 flex-1 py-1"
              placeholder="Enter accordion title..."
            />
          ) : (
            <div
              onClick={
                isEditable
                  ? (e) => {
                      e.stopPropagation();
                      setIsEditingTitle(true);
                    }
                  : undefined
              }
              className={`font-medium text-gray-800 flex-1 py-1 ${
                isEditable
                  ? "cursor-text hover:text-blue-600"
                  : "cursor-pointer"
              }`}
              title={isEditable ? "Click to edit title" : undefined}
            >
              {title}
            </div>
          )}

          {/* Delete Button */}
          {isEditable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAccordion();
              }}
              className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded"
              title="Delete accordion"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Content */}
      {open && (
        <div className="accordion-content p-3 bg-white">
          <NodeViewContent />
        </div>
      )}
    </NodeViewWrapper>
  );
}
