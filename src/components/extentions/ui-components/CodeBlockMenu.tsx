import React, { useState, useEffect, useRef } from "react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import PresetCodeBlockBg from "./PresetCodeBlockBg";
import { Palette, ChevronDown, Code } from "lucide-react";
import { Button } from "../../ui/button";

interface CodeBlockMenuProps {
  editor: Editor;
  isReadOnly: boolean;
}

// Available languages for code blocks
const LANGUAGES = [
  { value: "", label: "Plain Text" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "sql", label: "SQL" },
];

const CodeBlockMenu: React.FC<CodeBlockMenuProps> = ({
  editor,
  isReadOnly,
}) => {
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Get current language from code block
  const currentLanguage = editor.getAttributes("codeBlock").language || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLanguageDropdown]);

  if (isReadOnly) return null;

  const handleLanguageChange = (language: string) => {
    editor
      .chain()
      .focus()
      .updateAttributes("codeBlock", { language: language || null })
      .run();
    setShowLanguageDropdown(false);
  };

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        // Show when code block is active (even without text selection)
        return editor.isActive("codeBlock");
      }}
      className="bubble-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-50"
    >
      <div className="flex gap-1 items-center">
        {/* Language Selector */}
        <div className="relative" ref={languageDropdownRef}>
          <MenuButton
            onClick={() => {
              setShowLanguageDropdown(!showLanguageDropdown);
              setShowBgColorPicker(false);
            }}
            title="Select Language"
            className="px-2 min-w-[120px]"
          >
            <div className="flex items-center gap-1 w-full justify-between">
              <div className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                <span className="text-xs">
                  {LANGUAGES.find((lang) => lang.value === currentLanguage)
                    ?.label || "Plain Text"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3" />
            </div>
          </MenuButton>
          {showLanguageDropdown && (
            <div className="absolute top-full mt-1 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[140px] max-h-[300px] overflow-y-auto">
              <div className="p-1 space-y-1">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.value}
                    type="button"
                    variant={
                      currentLanguage === lang.value ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => handleLanguageChange(lang.value)}
                    className={`w-full justify-start text-xs hover:bg-gray-100 ${
                      currentLanguage === lang.value
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative">
          <MenuButton
            onClick={() => {
              setShowBgColorPicker(!showBgColorPicker);
              setShowLanguageDropdown(false);
            }}
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
