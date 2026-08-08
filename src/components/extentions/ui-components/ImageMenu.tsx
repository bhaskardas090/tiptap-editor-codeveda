import React from "react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import { Download } from "lucide-react";

interface ImageMenuProps {
  editor: Editor;
  isReadOnly: boolean;
}

/**
 * Controls for a selected image. Today that is just the download-button
 * toggle, which mirrors the one in the toolbar's Insert Image panel so a
 * choice made at insert time can be corrected without replacing the image.
 */
const ImageMenu: React.FC<ImageMenuProps> = ({ editor, isReadOnly }) => {
  if (isReadOnly) return null;

  const downloadable = !!editor.getAttributes("image").downloadable;

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("image")}
      className="bubble-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-50"
    >
      <div className="flex gap-1 items-center">
        <MenuButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .updateAttributes("image", { downloadable: !downloadable })
              .run()
          }
          isActive={downloadable}
          title={
            downloadable
              ? "Hide the download button on this image"
              : "Show a download button on this image"
          }
        >
          <Download className="h-4 w-4 cursor-pointer" />
        </MenuButton>
      </div>
    </TiptapBubbleMenu>
  );
};

export default ImageMenu;
