import React from "react";
import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import {
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

interface FloatingMenuProps {
  editor: Editor;
  isReadOnly: boolean;
  onImageClick: () => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  editor,
  isReadOnly,
  onImageClick,
}) => {
  if (isReadOnly) return null;

  return (
    <TiptapFloatingMenu
      editor={editor}
      className="floating-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg flex gap-1 z-50"
    >
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        title="Paragraph"
      >
        <FileText className="h-4 w-4" />
      </MenuButton>
      <MenuButton onClick={onImageClick} title="Insert Image">
        <ImageIcon className="h-4 w-4" />
      </MenuButton>
    </TiptapFloatingMenu>
  );
};

export default FloatingMenu;
