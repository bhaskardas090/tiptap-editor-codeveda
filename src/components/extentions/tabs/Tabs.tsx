import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TabsComponent from "./TabsComponent";
import TabItemComponent from "./TabItemComponent";
import { MAX_TABS, MIN_TABS } from "./constants";

export const Tabs = Node.create({
  name: "tabs",

  group: "block",
  content: "tabItem+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      activeTab: {
        default: 0,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-active-tab") || "0"),
        renderHTML: (attributes) => {
          return {
            "data-active-tab": attributes.activeTab,
          };
        },
      },
      tabCount: {
        default: 2,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-tab-count") || "2"),
        renderHTML: (attributes) => {
          return {
            "data-tab-count": attributes.tabCount,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="tabs"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "tabs" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TabsComponent, {
      contentDOMElementTag: "div",
    });
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // If we're right after the tabs node (outside it), prevent backspace
        // This prevents creating new tab items when clicking outside and pressing backspace
        if ($anchor.nodeBefore?.type.name === "tabs") {
          return true;
        }

        return false;
      },
      Delete: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // If we're right before the tabs node (outside it), prevent delete
        // This prevents creating new tab items when clicking outside and pressing delete
        if ($anchor.nodeAfter?.type.name === "tabs") {
          return true;
        }

        return false;
      },
    };
  },

  addCommands() {
    return {
      insertTabs:
        (options = { tabCount: 2 }) =>
        ({ commands }: any) => {
          const tabCount = Math.min(
            Math.max(options.tabCount || 2, MIN_TABS),
            MAX_TABS
          );
          const tabItems = Array.from({ length: tabCount }, (_, index) => ({
            type: "tabItem",
            attrs: { tabIndex: index, title: `Tab ${index + 1}` },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: `Content for Tab ${
                      index + 1
                    }. This is unique content for this tab.`,
                  },
                ],
              },
            ],
          }));

          return commands.insertContent({
            type: this.name,
            attrs: { activeTab: 0, tabCount },
            content: tabItems,
          });
        },
    } as any;
  },
});

export const TabItem = Node.create({
  name: "tabItem",

  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      tabIndex: {
        default: 0,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-tab-index") || "0"),
        renderHTML: (attributes) => {
          return {
            "data-tab-index": attributes.tabIndex,
          };
        },
      },
      title: {
        default: "Tab",
        parseHTML: (element) => element.getAttribute("data-title") || "Tab",
        renderHTML: (attributes) => {
          return {
            "data-title": attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="tab-item"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "tab-item" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TabItemComponent, {
      contentDOMElementTag: "div",
    });
  },

  addKeyboardShortcuts() {
    return {
      // Keep "select all" inside the tab the cursor is in, instead of
      // selecting the whole document.
      "Mod-a": ({ editor }: any) => {
        const { state } = editor;
        const { $from } = state.selection;

        // Innermost enclosing tab item (tabs can be nested inside a tab)
        let depth = -1;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === "tabItem") {
            depth = d;
            break;
          }
        }
        if (depth === -1) return false;

        // First/last text positions inside the tab item. Using the tab item's
        // own boundaries would land the selection on block positions, which
        // cannot hold a text selection.
        let from = -1;
        let to = -1;
        state.doc.nodesBetween(
          $from.start(depth),
          $from.end(depth),
          (child: any, pos: number) => {
            if (child.isTextblock) {
              if (from === -1) from = pos + 1;
              to = pos + child.nodeSize - 1;
            }
          }
        );
        if (from === -1) return false;

        return editor.commands.setTextSelection({ from, to });
      },

      // The isolating property should handle most splitting prevention
      // These shortcuts provide additional protection
      Enter: () => {
        // Allow Enter to work normally - isolating will prevent splitting
        return false;
      },
      Backspace: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // Prevent Backspace from splitting tab items at the very start
        if ($anchor.parent.type.name === "tabItem") {
          // If we're at the absolute start of the tab item
          if ($anchor.parentOffset === 0 && $anchor.depth > 0) {
            const tabItemStart = $anchor.start($anchor.depth);
            if ($anchor.pos <= tabItemStart + 1) {
              // We're at the very start, prevent deletion that might cause issues
              return true;
            }
          }
        }

        return false;
      },
    };
  },
});
