import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import IframeComponent from "./IframeComponent.tsx";

interface IframeAttributes {
  src: string;
  width: string;
  height: string;
  title: string;
  allow: string;
  sandbox: string;
  style: string;
}

export const Iframe = Node.create({
  name: "iframe",

  group: "block",
  atom: true,

  addOptions() {
    return {
      readOnly: false,
    };
  },

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("src") || "",
        renderHTML: (attributes) => {
          return {
            src: attributes.src,
          };
        },
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("width") || "100%",
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: "500px",
        parseHTML: (element) => element.getAttribute("height") || "500px",
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          };
        },
      },
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("title") || "",
        renderHTML: (attributes) => {
          return {
            title: attributes.title,
          };
        },
      },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        parseHTML: (element) =>
          element.getAttribute("allow") ||
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        renderHTML: (attributes) => {
          return {
            allow: attributes.allow,
          };
        },
      },
      sandbox: {
        default:
          "allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation",
        parseHTML: (element) =>
          element.getAttribute("sandbox") ||
          "allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation",
        renderHTML: (attributes) => {
          return {
            sandbox: attributes.sandbox,
          };
        },
      },
      style: {
        default: "",
        parseHTML: (element) => element.getAttribute("style") || "",
        renderHTML: (attributes) => {
          return {
            style: attributes.style,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IframeComponent);
  },

  addCommands() {
    return {
      insertIframe:
        (options: Partial<IframeAttributes> = {}) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src || "",
              width: options.width || "100%",
              height: options.height || "500px",
              title: options.title || "Embedded Content",
              allow:
                options.allow ||
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
              sandbox:
                options.sandbox ||
                "allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation",
              style: options.style || "",
            },
          });
        },
    } as any;
  },
});
