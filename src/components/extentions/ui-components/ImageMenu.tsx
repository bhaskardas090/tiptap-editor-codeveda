import React from "react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import {
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
} from "lucide-react";
import type { ImageAlign } from "../image/constants";

interface ImageMenuProps {
  editor: Editor;
  isReadOnly: boolean;
}

const ALIGNMENTS: {
  value: ImageAlign;
  title: string;
  Icon: typeof AlignLeft;
}[] = [
  { value: "left", title: "Align left", Icon: AlignLeft },
  { value: "center", title: "Align center", Icon: AlignCenter },
  { value: "right", title: "Align right", Icon: AlignRight },
];

/**
 * Controls for a selected image: where it sits in the column, whether readers
 * get a download button, and an escape hatch back to its natural size after a
 * drag. Resizing itself lives on the image's own handle.
 */
const ImageMenu: React.FC<ImageMenuProps> = ({ editor, isReadOnly }) => {
  if (isReadOnly) return null;

  const attrs = editor.getAttributes("image");
  const align: ImageAlign = attrs.align || "left";
  const downloadable = !!attrs.downloadable;
  const hasCustomWidth = attrs.width != null;

  const update = (changes: Record<string, unknown>) =>
    editor.chain().focus().updateAttributes("image", changes).run();

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("image")}
      className="bubble-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-50"
    >
      <div className="flex gap-1 items-center">
        {ALIGNMENTS.map(({ value, title, Icon }) => (
          <MenuButton
            key={value}
            onClick={() => update({ align: value })}
            isActive={align === value}
            title={title}
          >
            <Icon className="h-4 w-4 cursor-pointer" />
          </MenuButton>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <MenuButton
          onClick={() => update({ width: null })}
          title={
            hasCustomWidth
              ? "Reset to original size"
              : "Already at original size"
          }
        >
          <Maximize2 className="h-4 w-4 cursor-pointer" />
        </MenuButton>

        <MenuButton
          onClick={() => update({ downloadable: !downloadable })}
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
