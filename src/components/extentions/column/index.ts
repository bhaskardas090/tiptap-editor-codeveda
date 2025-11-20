import { Node, mergeAttributes, findParentNode } from "@tiptap/core";

export interface ColumnLayoutOptions {
  HTMLAttributes: Record<string, any>;
  defaultColumns: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columnLayout: {
      /**
       * Insert a column layout with the provided number of columns.
       */
      insertColumnLayout: (options?: { columns?: number }) => ReturnType;
      /**
       * Update the number of columns on the currently selected column layout node.
       */
      setColumnLayoutColumns: (columns: number) => ReturnType;
    };
  }
}

const createColumnContent = () => ({
  type: "column",
  content: [
    {
      type: "paragraph",
    },
  ],
});

export const ColumnLayout = Node.create<ColumnLayoutOptions>({
  name: "columnLayout",
  group: "block",
  content: "column+",
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      defaultColumns: 2,
    };
  },

  addAttributes() {
    return {
      columns: {
        default: this.options.defaultColumns,
        parseHTML: (element) => {
          const columns = Number(element.getAttribute("data-columns"));
          return Number.isNaN(columns) ? this.options.defaultColumns : columns;
        },
        renderHTML: (attributes) => ({
          "data-columns": attributes.columns,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column-layout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "column-layout",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertColumnLayout:
        (options) =>
        ({ commands }) => {
          const columns = options?.columns ?? this.options.defaultColumns;
          const columnContent = Array.from(
            { length: Math.max(columns, 1) },
            () => createColumnContent()
          );

          return commands.insertContent({
            type: this.name,
            attrs: { columns },
            content: columnContent,
          });
        },
      setColumnLayoutColumns:
        (columns) =>
        ({ state, dispatch }) => {
          const parent = findParentNode((node) => node.type === this.type)(
            state.selection
          );

          if (!parent) {
            return false;
          }

          if (dispatch) {
            const transaction = state.tr.setNodeMarkup(
              parent.pos,
              this.type,
              {
                ...parent.node.attrs,
                columns,
              },
              parent.node.marks
            );
            dispatch(transaction);
          }

          return true;
        },
    };
  },
});

export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column",
      }),
      0,
    ];
  },
});
