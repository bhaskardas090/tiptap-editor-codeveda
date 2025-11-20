import { Mark } from "@tiptap/core";

export interface CodeBlockBgOptions {
  multicolor: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeBlockBg: {
      /**
       * Set a background color mark
       */
      setCodeBlockBg: (color: string) => ReturnType;
      /**
       * Toggle a background color mark
       */
      toggleCodeBlockBg: (color: string) => ReturnType;
      /**
       * Unset a background color mark
       */
      unsetCodeBlockBg: () => ReturnType;
    };
  }
}

export const CodeBlockBg = Mark.create<CodeBlockBgOptions>({
  name: "codeBlockBg",

  addOptions() {
    return {
      multicolor: true,
      HTMLAttributes: {},
    };
  },

  // Allow this mark in code blocks
  inclusive: false,

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-background-color") ||
          element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }

          return {
            "data-background-color": attributes.color,
            style: `background-color: ${attributes.color}; color: inherit`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-background-color]",
        getAttrs: (element) => {
          if (typeof element === "string") {
            return false;
          }
          return {
            color: element.getAttribute("data-background-color"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const color = mark.attrs?.color || HTMLAttributes["data-background-color"];
    if (!color) {
      return ["span", {}, 0];
    }
    return [
      "span",
      {
        "data-background-color": color,
        style: `background-color: ${color}; color: inherit`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setCodeBlockBg:
        (color: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color });
        },
      toggleCodeBlockBg:
        (color: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { color });
        },
      unsetCodeBlockBg:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
