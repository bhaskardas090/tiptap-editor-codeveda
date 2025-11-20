import React, { useState } from "react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import PresetCodeBlockBg from "./PresetCodeBlockBg";
import { Palette } from "lucide-react";

interface CodeBlockMenuProps {
  editor: Editor;
  isReadOnly: boolean;
}

const CodeBlockMenu: React.FC<CodeBlockMenuProps> = ({
  editor,
  isReadOnly,
}) => {
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  if (isReadOnly) return null;

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor, state }) => {
        // Show only when selecting code text within a code block
        return editor.isActive("codeBlock") && !state.selection.empty;
      }}
      className="bubble-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-50"
    >
      <div className="flex gap-1 items-center">
        {/* Background Color */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            title="Background Color"
            isActive={editor.isActive("codeBlockBg")}
          >
            <Palette className="h-4 w-4 cursor-pointer" />
          </MenuButton>
          {showBgColorPicker && (
            <div className="absolute top-full mt-1 z-10 bg-white border border-gray-300 rounded-lg p-2 shadow-lg">
              <PresetCodeBlockBg
                onColorChange={(color) => {
                  editor.chain().focus().toggleCodeBlockBg(color).run();
                  setShowBgColorPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </TiptapBubbleMenu>
  );
};

export default CodeBlockMenu;
