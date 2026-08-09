import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageComponent from "./ImageComponent";
import type { ImageAlign } from "./constants";

export type { ImageAlign } from "./constants";
export { MIN_IMAGE_WIDTH_PERCENT } from "./constants";

/** Reads a percentage width off an element's inline style, if it has one. */
function parseWidthPercent(element: HTMLElement): number | null {
  const raw = element.style.width;
  if (!raw || !raw.trim().endsWith("%")) return null;

  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

/** The margins that place a block-level image within its column. */
function alignStyle(align: ImageAlign): string {
  if (align === "center") return "margin-left:auto;margin-right:auto;";
  if (align === "right") return "margin-left:auto;margin-right:0;";
  return "margin-left:0;margin-right:auto;";
}

export const ImageExtension = Image.configure({
  inline: false,
  allowBase64: false, // Disable base64 to force URL usage
  HTMLAttributes: {
    class: "max-w-full h-auto rounded-lg shadow-sm",
  },
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      /**
       * Whether readers get a download button on this image.
       *
       * Set from the toolbar's Insert Image panel, and flippable afterwards
       * from the image bubble menu. Serialised as `data-downloadable` so it
       * survives a getHTML/setContent round trip into the viewer.
       */
      downloadable: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-downloadable") === "true",
        renderHTML: (attributes) =>
          attributes.downloadable ? { "data-downloadable": "true" } : {},
      },

      /**
       * Width as a percentage of the column, or null for the image's natural
       * size. Stored as a percentage rather than pixels so an image keeps its
       * proportions when the same document is rendered at a different width.
       */
      width: {
        default: null,
        parseHTML: (element) => parseWidthPercent(element as HTMLElement),
        renderHTML: (attributes) =>
          attributes.width ? { style: `width:${attributes.width}%;` } : {},
      },

      /** Placement within the column. */
      align: {
        default: "left" as ImageAlign,
        parseHTML: (element) =>
          (element.getAttribute("data-align") as ImageAlign) || "left",
        renderHTML: (attributes) => {
          const align: ImageAlign = attributes.align || "left";
          // The margins ride along so the alignment survives into plain HTML,
          // where there is no node view to apply it.
          return {
            "data-align": align,
            style: `display:block;${alignStyle(align)}`,
          };
        },
      },
    };
  },

  /**
   * The node view hosts the download button and the resize handle — it renders
   * the same `<img>` with the same classes, so the stored document is
   * otherwise untouched. Both the editor and the viewer import this object, so
   * they pick up width and alignment together; only the editor gets the handle.
   */
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
