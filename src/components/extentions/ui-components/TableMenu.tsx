import React from "react";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import { Plus, Minus, Trash2 } from "lucide-react";

interface TableMenuProps {
  editor: Editor;
  isReadOnly: boolean;
  position: { top: number; left: number; show: boolean };
}

const TableMenu: React.FC<TableMenuProps> = ({
  editor,
  isReadOnly,
  position,
}) => {
  if (!position.show || isReadOnly) return null;

  return (
    <div
      className="table-bubble-menu bg-white border-2 border-blue-500 rounded-lg p-2 shadow-lg"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
        backdropFilter: "blur(8px)",
        background: "rgba(255, 255, 255, 0.95)",
      }}
    >
      <div className="flex gap-1 items-center">
        <MenuButton
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="Add Row Before"
          className="h-8 w-auto px-2"
        >
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span className="text-xs">↑ Row</span>
          </div>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Add Row After"
          className="h-8 w-auto px-2"
        >
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span className="text-xs">Row ↓</span>
          </div>
        </MenuButton>
        <div className="h-6 w-px bg-gray-300 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="Add Column Before"
          className="h-8 w-auto px-2"
        >
          <div className="flex items-center gap-1">
            ß
            <Plus className="h-3 w-3" />
            <span className="text-xs">← Col</span>
          </div>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Add Column After"
          className="h-8 w-auto px-2"
        >
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span className="text-xs">Col →</span>
          </div>
        </MenuButton>
        <div className="h-6 w-px bg-gray-300 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title="Delete Column"
          className="text-red-600 hover:bg-red-50 h-8 w-auto px-2"
        >
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3" />
            <span className="text-xs">Col</span>
          </div>
        </MenuButton>
        <div className="h-6 w-px bg-gray-300 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          title="Delete Row"
          className="text-red-600 hover:bg-red-50 h-8 w-auto px-2"
        >
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3" />
            <span className="text-xs">Row</span>
          </div>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Delete Table"
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </MenuButton>
      </div>
      {/* Arrow pointing to table */}
      <div className="absolute top-full left-5 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-blue-500"></div>
    </div>
  );
};

export default TableMenu;
