import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Plus, Trash2, X } from "lucide-react";
import { MAX_TABS, MIN_TABS } from "./constants";

export default function TabsComponent({
  node,
  updateAttributes,
  editor,
  getPos,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
  editor: any;
  getPos: () => number | undefined;
}) {
  const [activeTab, setActiveTab] = useState(node.attrs?.activeTab ?? 0);
  const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const tabItems = node.content?.content || [];
  const [isEditable, setIsEditable] = useState(editor?.isEditable ?? false);

  // Drop the editing chrome as soon as the editor is switched to read-only
  useEffect(() => {
    if (!editor) return;
    const sync = () => setIsEditable(editor.isEditable);
    sync();
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor]);

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

  // Keep the active tab visible when the header strip is scrollable
  useEffect(() => {
    const strip = headerScrollRef.current;
    const button = strip?.children?.[activeTab] as HTMLElement | undefined;
    if (!strip || !button) return;
    if (button.offsetLeft < strip.scrollLeft) {
      strip.scrollLeft = button.offsetLeft;
    } else if (
      button.offsetLeft + button.offsetWidth >
      strip.scrollLeft + strip.clientWidth
    ) {
      strip.scrollLeft =
        button.offsetLeft + button.offsetWidth - strip.clientWidth;
    }
  }, [activeTab, tabItems.length]);

  /**
   * Position of *this* tabs node. Everything that edits tab items resolves
   * positions from here — searching the whole document by `tabIndex` would
   * hit the first matching tab of the first tabs component in the document.
   */
  const getTabsPos = (): number | null => {
    if (typeof getPos !== "function") return null;
    const pos = getPos();
    return typeof pos === "number" ? pos : null;
  };

  /** Document positions of this tabs node's direct tab item children. */
  const getTabItemPositions = (doc: any, tabsPos: number) => {
    const tabsNode = doc.nodeAt(tabsPos);
    if (!tabsNode || tabsNode.type.name !== "tabs") return null;

    const positions: number[] = [];
    let offset = tabsPos + 1;
    tabsNode.forEach((child: any) => {
      positions.push(offset);
      offset += child.nodeSize;
    });

    return { tabsNode, positions };
  };

  /** Renumber tab indexes and refresh tabCount/activeTab after add/remove. */
  const normalizeTabs = (tr: any, tabsPos: number, nextActiveTab: number) => {
    const info = getTabItemPositions(tr.doc, tabsPos);
    if (!info) return;
    const { tabsNode, positions } = info;

    tabsNode.forEach((child: any, _offset: number, index: number) => {
      if (child.attrs.tabIndex !== index) {
        tr.setNodeMarkup(positions[index], undefined, {
          ...child.attrs,
          tabIndex: index,
        });
      }
    });

    tr.setNodeMarkup(tabsPos, undefined, {
      ...tabsNode.attrs,
      tabCount: tabsNode.childCount,
      activeTab: Math.min(
        Math.max(nextActiveTab, 0),
        Math.max(tabsNode.childCount - 1, 0)
      ),
    });
  };

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

  const handleAddTab = () => {
    if (!isEditable || !editor) return;
    const tabsPos = getTabsPos();
    if (tabsPos === null) return;

    const info = getTabItemPositions(editor.state.doc, tabsPos);
    if (!info || info.tabsNode.childCount >= MAX_TABS) return;

    const newIndex = info.tabsNode.childCount;
    // End of the tabs node's content, i.e. right after the last tab item
    const insertPos = tabsPos + info.tabsNode.nodeSize - 1;

    editor
      .chain()
      .focus()
      .command(({ tr, state, dispatch }: any) => {
        if (!dispatch) return true;

        const newTabItem = state.schema.nodes.tabItem.create(
          { tabIndex: newIndex, title: `Tab ${newIndex + 1}` },
          state.schema.nodes.paragraph.create()
        );

        tr.insert(insertPos, newTabItem);
        normalizeTabs(tr, tabsPos, newIndex);
        return true;
      })
      // Land the cursor inside the new (empty) tab's first paragraph
      .setTextSelection(insertPos + 2)
      .run();
  };

  const handleRemoveTab = (index: number) => {
    if (!isEditable || !editor) return;
    if (tabItems.length <= MIN_TABS) return; // schema requires at least one tab item
    const tabsPos = getTabsPos();
    if (tabsPos === null) return;

    const hasContent = (tabItems[index]?.textContent || "").trim().length > 0;
    if (
      hasContent &&
      !confirm(
        `Delete "${getTabTitle(index)}"? Its content will be removed as well.`
      )
    ) {
      return;
    }

    editor
      .chain()
      .command(({ tr, dispatch }: any) => {
        const info = getTabItemPositions(tr.doc, tabsPos);
        if (!info || info.tabsNode.childCount <= MIN_TABS) return false;

        const { tabsNode, positions } = info;
        const tabItem = tabsNode.child(index);
        if (!tabItem) return false;
        if (!dispatch) return true;

        tr.delete(positions[index], positions[index] + tabItem.nodeSize);

        const nextActiveTab = activeTab > index ? activeTab - 1 : activeTab;
        normalizeTabs(tr, tabsPos, nextActiveTab);
        return true;
      })
      .run();
  };

  const handleTitleSave = () => {
    const tabsPos = getTabsPos();

    if (editingTabIndex !== null && editor && tabsPos !== null) {
      editor
        .chain()
        .focus()
        .command(({ tr, dispatch }: any) => {
          const info = getTabItemPositions(tr.doc, tabsPos);
          if (!info) return false;

          const { tabsNode, positions } = info;
          const tabItem = tabsNode.child(editingTabIndex);
          if (!tabItem) return false;
          if (!dispatch) return true;

          tr.setNodeMarkup(positions[editingTabIndex], undefined, {
            ...tabItem.attrs,
            title: editingTitle,
          });
          return true;
        })
        .run();
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
        // Move cursor to the end of this tabs node's last tab item
        const tabsPos = $anchor.pos - $anchor.nodeBefore.nodeSize;
        const info = getTabItemPositions(editor.state.doc, tabsPos);
        if (info && info.positions.length > 0) {
          const lastIndex = info.positions.length - 1;
          const lastTabItem = info.tabsNode.child(lastIndex);
          const endPos = info.positions[lastIndex] + lastTabItem.nodeSize - 2;
          editor.chain().focus().setTextSelection(endPos).run();
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
      className="tabs-container border border-gray-200 dark:border-[#2d2d2d] rounded-lg mb-4 overflow-hidden"
      data-active-tab={activeTab}
      onKeyDown={handleKeyDown}
    >
      {/* Tab Headers */}
      <div className="tabs-header bg-gray-50 border-b border-gray-200 dark:bg-[#1e1e1e] dark:border-[#2d2d2d]">
        <div className="flex items-stretch">
          <div ref={headerScrollRef} className="tabs-header-scroll">
            {tabItems.map((_: any, index: number) => (
              <div
                key={index}
                data-active={activeTab === index}
                className={`tab-header-item relative flex items-stretch border-b-2 border-r border-gray-200 dark:border-r-[#2d2d2d] transition-colors ${
                  activeTab === index
                    ? "border-blue-500 border-r-gray-200 dark:border-r-[#2d2d2d] bg-white dark:bg-[#13171F]"
                    : "border-transparent border-r-gray-200 dark:border-r-[#2d2d2d] hover:border-gray-300"
                } ${index === tabItems.length - 1 ? "border-r-0" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleTabClick(index)}
                  onDoubleClick={
                    isEditable
                      ? () => handleTitleEdit(index, getTabTitle(index))
                      : undefined
                  }
                  className={`flex-1 min-w-0 px-4 py-2 text-sm font-medium cursor-pointer ${
                    isEditable ? "pr-7" : ""
                  } ${
                    activeTab === index
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                  title={isEditable ? "Double-click to rename" : undefined}
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
                      onDoubleClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="block w-full text-center truncate cursor-pointer">
                      {getTabTitle(index)}
                    </span>
                  )}
                </button>

                {/* Remove this tab */}
                {isEditable && tabItems.length > MIN_TABS && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTab(index);
                    }}
                    className="tab-remove-button absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                    title={`Remove ${getTabTitle(index)}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tabs actions */}
          {isEditable && (
            <div className="flex items-center flex-shrink-0 border-l border-gray-200 dark:border-[#2d2d2d]">
              <button
                type="button"
                onClick={handleAddTab}
                disabled={tabItems.length >= MAX_TABS}
                className="tab-add-button px-2 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  tabItems.length >= MAX_TABS
                    ? `Maximum of ${MAX_TABS} tabs`
                    : "Add tab"
                }
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteTabs}
                className="tabs-delete-button px-2 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                title="Delete tabs"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
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
