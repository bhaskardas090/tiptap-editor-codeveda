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
  const isEditable = editor?.isEditable ?? false;

  // Sync activeTab with node attributes
  useEffect(() => {
    const currentActiveTab = node.attrs?.activeTab ?? 0;
    if (currentActiveTab !== activeTab) {
      setActiveTab(currentActiveTab);
    }
  }, [node.attrs?.activeTab]);

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

  const handleDeleteTabs = () => {
    if (!isEditable) return; // Don't allow deletion in read-only mode
    if (
      editor &&
      confirm("Are you sure you want to delete this tabs component?")
    ) {
      editor.chain().focus().deleteNode("tabs").run();
    }
  };

  const handleTitleSave = () => {
    if (editingTabIndex !== null && tabItems[editingTabIndex] && editor) {
      // Find the position of the tab item in the document
      let tabItemPosition = -1;
      editor.state.doc.descendants((node: any, pos: number) => {
        if (
          node.type.name === "tabItem" &&
          node.attrs.tabIndex === editingTabIndex
        ) {
          tabItemPosition = pos;
          return false;
        }
      });

      if (tabItemPosition !== -1) {
        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }: any) => {
            if (dispatch) {
              const nodeAtPos = tr.doc.nodeAt(tabItemPosition);
              if (nodeAtPos) {
                tr.setNodeMarkup(tabItemPosition, undefined, {
                  ...nodeAtPos.attrs,
                  title: editingTitle,
                });
              }
            }
            return true;
          })
          .run();
      }
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

  const getTabTitle = (index: number) => {
    return tabItems[index]?.attrs?.title || `Tab ${index + 1}`;
  };

  // Handle keyboard events to prevent unwanted TabItem creation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable || !editor) return;

    const { selection } = editor.state;
    const { $anchor } = selection;

    // Prevent Enter from creating new tab items when clicking outside
    if (e.key === "Enter" && !e.shiftKey) {
      // If we're right after the tabs node, prevent creating new tab items
      if ($anchor.nodeBefore?.type.name === "tabs") {
        e.preventDefault();
        e.stopPropagation();
        // Move cursor inside the last tab item's content
        const tabsNode = $anchor.nodeBefore;
        if (tabsNode && tabsNode.childCount > 0) {
          const lastTabItem = tabsNode.lastChild;
          if (lastTabItem && lastTabItem.content.size > 0) {
            // Find the position of the last tab item
            let lastTabItemPos = -1;
            editor.state.doc.descendants((node: any, pos: number) => {
              if (
                node.type.name === "tabItem" &&
                node.attrs.tabIndex === tabsNode.childCount - 1
              ) {
                lastTabItemPos = pos;
                return false;
              }
            });

            if (lastTabItemPos !== -1) {
              const endPos = lastTabItemPos + lastTabItem.nodeSize - 2;
              editor.chain().focus().setTextSelection(endPos).run();
            }
          }
        }
        return;
      }
    }

    // Prevent Backspace/Delete from creating new tab items
    if ((e.key === "Backspace" || e.key === "Delete") && !e.shiftKey) {
      // If we're right after the tabs node, prevent deletion
      if ($anchor.nodeBefore?.type.name === "tabs") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // If we're right before the tabs node, prevent deletion
      if ($anchor.nodeAfter?.type.name === "tabs") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  };

  return (
    <NodeViewWrapper
      className="tabs-container border border-gray-200 rounded-lg mb-4 overflow-hidden"
      data-active-tab={activeTab}
      onKeyDown={handleKeyDown}
    >
      {/* Tab Headers */}
      <div className="tabs-header bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-1">
            {tabItems.map((_: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTabClick(index)}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 border-r border-gray-200 transition-colors relative cursor-pointer ${
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
                    className="bg-transparent border-none outline-none text-center w-full"
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
                    className={`block w-full text-center ${
                      isEditable ? "cursor-text" : "cursor-pointer"
                    }`}
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
              type="button"
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
