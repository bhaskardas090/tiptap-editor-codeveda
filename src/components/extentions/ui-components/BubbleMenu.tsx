import React, { useState } from "react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import ColorPickerFont from "./ColorPickerFont";
import ColorPickerBg from "./ColorPickerBg";
import { Button } from "../../ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Type,
  Palette,
  Link as LinkIcon,
} from "lucide-react";

interface BubbleMenuProps {
  editor: Editor;
  isReadOnly: boolean;
}

const BubbleMenu: React.FC<BubbleMenuProps> = ({ editor, isReadOnly }) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  if (isReadOnly) return null;

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor, state }) => {
        const { from, to } = state.selection;
        const hasSelection = from !== to;
        // Only show when text is selected and we're not inside a code block
        return hasSelection && !editor.isActive("codeBlock");
      }}
      className="bubble-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-50"
    >
      <div className="flex gap-1 items-center">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4 cursor-pointer" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4 cursor-pointer" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4 cursor-pointer" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4 cursor-pointer" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="h-4 w-4 cursor-pointer" />
        </MenuButton>

        {/* Text Color */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
            title="Text Color"
          >
            <Type className="h-4 w-4 cursor-pointer" />
          </MenuButton>
          {showTextColorPicker && (
            <div className="absolute top-full mt-1 z-10 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
              <ColorPickerFont
                onColorChange={(color) => {
                  editor.chain().focus().setColor(color).run();
                  setShowTextColorPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            title="Background Color"
          >
            <Palette className="h-4 w-4 cursor-pointer" />
          </MenuButton>
          {showBgColorPicker && (
            <div className="absolute top-full mt-1 z-10 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
              <ColorPickerBg
                onColorChange={(color) => {
                  editor.chain().focus().toggleHighlight({ color }).run();
                  setShowBgColorPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Link */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            isActive={editor.isActive("link")}
            title="Add/Edit Link"
          >
            <LinkIcon className="h-4 w-4 cursor-pointer" />
          </MenuButton>
          {showLinkInput && (
            <div className="absolute top-full mt-1 z-10 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSetLink();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleSetLink}
                  size="sm"
                  className="h-8 cursor-pointer"
                >
                  Set
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TiptapBubbleMenu>
  );
};

export default BubbleMenu;
