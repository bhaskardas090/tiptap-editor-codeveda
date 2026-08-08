import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageComponent from "./ImageComponent";

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
    };
  },

  /**
   * The node view exists to host the download button — it renders the same
   * `<img>` with the same classes, so `renderHTML` and the stored document are
   * otherwise untouched. Both the editor and the viewer import this object, so
   * they pick the button up together.
   */
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
