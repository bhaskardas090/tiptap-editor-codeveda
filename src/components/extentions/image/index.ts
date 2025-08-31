import Image from "@tiptap/extension-image";

export const ImageExtension = Image.configure({
  inline: false,
  allowBase64: false, // Disable base64 to force URL usage
  HTMLAttributes: {
    class: "max-w-full h-auto rounded-lg shadow-sm",
  },
});
