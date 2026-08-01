import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import LivePreviewComponent from "./LivePreviewComponent";
import { DEFAULT_HTML } from "./utils";

export interface LivePreviewAttributes {
  html: string;
  /** @deprecated Only kept so documents saved with separate CSS/JS still render. */
  css: string;
  /** @deprecated Only kept so documents saved with separate CSS/JS still render. */
  js: string;
  height: string;
  title: string;
  pendingEdit?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    livePreview: {
      insertLivePreview: (
        options?: Partial<LivePreviewAttributes>,
      ) => ReturnType;
    };
  }
}

function readPart(element: Element, part: string): string {
  return element.querySelector(`[data-part="${part}"]`)?.textContent ?? "";
}

export const LivePreview = Node.create({
  name: "livePreview",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      html: {
        default: DEFAULT_HTML,
        parseHTML: (element) => readPart(element, "html"),
      },
      css: {
        default: "",
        parseHTML: (element) => readPart(element, "css"),
      },
      js: {
        default: "",
        parseHTML: (element) => readPart(element, "js"),
      },
      height: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("data-height") || "auto",
        renderHTML: (attributes) => ({
          "data-height": attributes.height,
        }),
      },
      title: {
        default: "Interactive view",
        parseHTML: (element) =>
          element.getAttribute("data-title") || "Interactive view",
        renderHTML: (attributes) => ({
          "data-title": attributes.title,
        }),
      },
      pendingEdit: {
        default: false,
        parseHTML: () => false,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="live-preview"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const parts: any[] = [
      ["pre", { "data-part": "html", hidden: "hidden" }, node.attrs.html || ""],
    ];

    // Only written back for documents that still carry the legacy fields.
    if (node.attrs.css) {
      parts.push(["pre", { "data-part": "css", hidden: "hidden" }, node.attrs.css]);
    }
    if (node.attrs.js) {
      parts.push(["pre", { "data-part": "js", hidden: "hidden" }, node.attrs.js]);
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "live-preview",
        "data-height": node.attrs.height,
        "data-title": node.attrs.title,
      }),
      ...parts,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LivePreviewComponent);
  },

  addCommands() {
    return {
      insertLivePreview:
        (options: Partial<LivePreviewAttributes> = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              html: options.html ?? DEFAULT_HTML,
              css: options.css ?? "",
              js: options.js ?? "",
              height: options.height ?? "auto",
              title: options.title ?? "Interactive view",
              pendingEdit: options.pendingEdit ?? false,
            },
          });
        },
    };
  },
});
