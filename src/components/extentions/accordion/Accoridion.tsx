import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AccordionComponent from "./AccordionComponent"; // we'll define this as a React component

export const Accordion = Node.create({
  name: "accordion",

  group: "block",
  content: "accordionItem+",
  defining: true,

  addAttributes() {
    return {
      title: {
        default: "Accordion Title",
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
});
