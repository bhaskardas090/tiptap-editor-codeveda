import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AccordionComponent from "./AccordionComponent"; // we'll define this as a React component

export const Accordion = Node.create({
  name: "accordion",

  group: "block",
  content: "accordionItem+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: "Output",
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            "data-title": attributes.title,
          };
        },
      },
      open: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-open") === "true",
        renderHTML: (attributes) => {
          return {
            "data-open": attributes.open,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="accordion"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "accordion" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AccordionComponent);
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // If we're right after the accordion node (outside it), prevent backspace
        if ($anchor.nodeBefore?.type.name === "accordion") {
          return true;
        }

        // If we're inside an accordion and it's effectively empty, prevent deletion
        if ($anchor.parent.type.name === "accordion") {
          const accordion = $anchor.parent;
          // Check if all accordion items are empty (only empty paragraphs)
          const hasAnyContent = accordion.content.content.some((item: any) => {
            if (item.type.name === "accordionItem") {
              return item.content.content.some((node: any) => {
                if (node.type.name === "paragraph") {
                  return node.content.size > 0;
                }
                return true; // Non-paragraph nodes are considered content
              });
            }
            return true;
          });

          // If accordion has no content, prevent deletion
          if (!hasAnyContent) {
            return true;
          }
        }

        return false;
      },
      Delete: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // If we're right before the accordion node (outside it), prevent delete
        if ($anchor.nodeAfter?.type.name === "accordion") {
          return true;
        }

        // If we're inside an accordion and it's effectively empty, prevent deletion
        if ($anchor.parent.type.name === "accordion") {
          const accordion = $anchor.parent;
          // Check if all accordion items are empty (only empty paragraphs)
          const hasAnyContent = accordion.content.content.some((item: any) => {
            if (item.type.name === "accordionItem") {
              return item.content.content.some((node: any) => {
                if (node.type.name === "paragraph") {
                  return node.content.size > 0;
                }
                return true; // Non-paragraph nodes are considered content
              });
            }
            return true;
          });

          // If accordion has no content, prevent deletion
          if (!hasAnyContent) {
            return true;
          }
        }

        return false;
      },
    };
  },

  addCommands() {
    return {
      insertAccordion:
        () =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "accordionItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Accordion Item 1" }],
                  },
                ],
              },
            ],
          });
        },
    } as any;
  },
});

export const AccordionItem = Node.create({
  name: "accordionItem",

  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="accordion-item"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "accordion-item" }),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Prevent Enter from splitting accordion items
      Enter: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // If we're inside an accordion item, allow Enter to create new paragraphs
        // The isolating property will prevent splitting the accordion item
        if ($anchor.parent.type.name === "accordionItem") {
          return false; // Allow normal Enter behavior within accordion item
        }

        return false;
      },
      Backspace: ({ editor }: any) => {
        const { selection } = editor.state;
        const { $anchor } = selection;

        // Prevent Backspace from splitting accordion items at the very start
        if ($anchor.parent.type.name === "accordionItem") {
          // If we're at the absolute start of the accordion item
          if ($anchor.parentOffset === 0 && $anchor.depth > 0) {
            const accordionItemStart = $anchor.start($anchor.depth);
            if ($anchor.pos <= accordionItemStart + 1) {
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
