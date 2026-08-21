import { Mark } from "@tiptap/core";

/**
 * Text colour for a run of code inside a code block — the counterpart to
 * `codeBlockBg`, which colours the background of the same kind of run.
 *
 * Serialised as `data-text-color` alongside an inline `style`, so the colour
 * survives a getHTML/setContent round trip into the viewer and still renders
 * for consumers who display the stored HTML without the editor. The inline
 * style is also what keeps a coloured run from being overridden by the
 * syntax-highlight and plain-text rules in code-block.scss: an inline
 * declaration outranks any selector those rules can use.
 */

export interface CodeBlockColorOptions {
  multicolor: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeBlockColor: {
      /**
       * Set a text color mark
       */
      setCodeBlockColor: (color: string) => ReturnType;
      /**
       * Toggle a text color mark
       */
      toggleCodeBlockColor: (color: string) => ReturnType;
      /**
       * Unset a text color mark
       */
      unsetCodeBlockColor: () => ReturnType;
    };
  }
}

export const CodeBlockColor = Mark.create<CodeBlockColorOptions>({
  name: "codeBlockColor",

  addOptions() {
    return {
      multicolor: true,
      HTMLAttributes: {},
    };
  },

  // Matches codeBlockBg: typing on from the end of a coloured run should not
  // pick the colour up.
  inclusive: false,

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-text-color") || element.style.color,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }

          return {
            "data-text-color": attributes.color,
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-text-color]",
        getAttrs: (element) => {
          if (typeof element === "string") {
            return false;
          }
          return {
            color: element.getAttribute("data-text-color"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, mark }) {
    const color = mark.attrs?.color || HTMLAttributes["data-text-color"];
    if (!color) {
      return ["span", {}, 0];
    }
    return [
      "span",
      {
        "data-text-color": color,
        style: `color: ${color}`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setCodeBlockColor:
        (color: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { color });
        },
      toggleCodeBlockColor:
        (color: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { color });
        },
      unsetCodeBlockColor:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
