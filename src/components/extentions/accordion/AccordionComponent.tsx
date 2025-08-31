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
  const [title, setTitle] = useState(node.attrs?.title || "Accordion Title");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isEditable = editor?.isEditable ?? true;

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
      setTitle(node.attrs?.title || "Accordion Title");
      setIsEditingTitle(false);
    }
  };

  const toggleAccordion = () => {
    const newOpen = !open;
    setOpen(newOpen);
    updateAttributes({ title, open: newOpen });
  };

  const handleDeleteAccordion = () => {
    if (editor && confirm("Are you sure you want to delete this accordion?")) {
      editor.chain().focus().deleteNode("accordion").run();
    }
  };

  return (
    <NodeViewWrapper className="accordion border border-gray-200 rounded-lg mb-3 overflow-hidden">
      {/* Accordion Header */}
      <div
        className="accordion-header bg-gray-50 border-b border-gray-200"
        onClick={toggleAccordion}
      >
        <div className="flex items-center gap-2 px-1">
          {/* Toggle Button */}
          <button
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
