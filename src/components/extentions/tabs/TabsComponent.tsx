import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Trash2 } from "lucide-react";

export default function TabsComponent({
  node,
  updateAttributes,
  editor,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
}) {
  const [activeTab, setActiveTab] = useState(node.attrs?.activeTab ?? 0);
  const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const tabItems = node.content?.content || [];
  const tabCount = node.attrs?.tabCount || tabItems.length;
  const isEditable = editor?.isEditable ?? true;

  useEffect(() => {
    if (editingTabIndex !== null && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTabIndex]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    updateAttributes({ ...node.attrs, activeTab: index });
  };

  const handleTitleEdit = (index: number, currentTitle: string) => {
    if (!isEditable) return; // Don't allow editing in read-only mode
    setEditingTabIndex(index);
    setEditingTitle(currentTitle);
  };

  const handleTitleSave = () => {
    if (editingTabIndex !== null && tabItems[editingTabIndex]) {
      // Update the tab item's title attribute
      const tabItem = tabItems[editingTabIndex];
      if (tabItem.attrs) {
        tabItem.attrs.title = editingTitle;
      }
      updateAttributes({ ...node.attrs });
    }
    setEditingTabIndex(null);
    setEditingTitle("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditingTabIndex(null);
      setEditingTitle("");
    }
  };

  const handleDeleteTabs = () => {
    if (
      editor &&
      confirm("Are you sure you want to delete this tabs component?")
    ) {
      editor.chain().focus().deleteNode("tabs").run();
    }
  };

  const getTabTitle = (index: number) => {
    return tabItems[index]?.attrs?.title || `Tab ${index + 1}`;
  };

  return (
    <NodeViewWrapper
      className="tabs-container border border-gray-200 rounded-lg mb-4 overflow-hidden"
      data-active-tab={activeTab}
    >
      {/* Tab Headers */}
      <div className="tabs-header bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 overflow-x-auto">
            {tabItems.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`px-4 py-2 text-sm font-medium border-b-2 border-r border-gray-200 transition-colors relative lg:px-12 cursor-pointer ${
                  activeTab === index
                    ? "border-blue-500 border-r-gray-200 text-blue-600 bg-white"
                    : "border-transparent border-r-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } ${index === tabItems.length - 1 ? "border-r-0" : ""}`}
              >
                {editingTabIndex === index ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="bg-transparent border-none outline-none text-center min-w-16"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    onClick={
                      isEditable
                        ? (e) => {
                            e.stopPropagation();
                            handleTitleEdit(index, getTabTitle(index));
                          }
                        : undefined
                    }
                    className={isEditable ? "cursor-text" : "cursor-pointer"}
                    title={isEditable ? "Click to edit title" : undefined}
                  >
                    {getTabTitle(index)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Delete Button */}
          {isEditable && (
            <button
              onClick={handleDeleteTabs}
              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Delete tabs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Content - NodeViewContent will render all TabItems */}
      <div className="tabs-content">
        <NodeViewContent
          className="tab-content-wrapper"
          data-active-tab={activeTab}
        />
      </div>
    </NodeViewWrapper>
  );
}
