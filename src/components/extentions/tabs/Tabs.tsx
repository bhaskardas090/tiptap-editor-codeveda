import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TabsComponent from "./TabsComponent";
import TabItemComponent from "./TabItemComponent";

export const Tabs = Node.create({
  name: "tabs",

  group: "block",
  content: "tabItem+",
  defining: true,

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
    return ReactNodeViewRenderer(TabsComponent);
  },

  addCommands() {
    return {
      insertTabs:
        (options = { tabCount: 2 }) =>
        ({ commands }: any) => {
          const tabCount = Math.min(Math.max(options.tabCount || 2, 2), 6);
          const tabItems = Array.from({ length: tabCount }, (_, index) => ({
            type: "tabItem",
            attrs: { tabIndex: index, title: `Tab ${index + 1}` },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: `Content for Tab ${index + 1}. This is unique content for this tab.`,
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
    return ReactNodeViewRenderer(TabItemComponent);
  },
});
