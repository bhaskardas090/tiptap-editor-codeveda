import React, { useCallback, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import {
  Accordion,
  AccordionItem,
} from "./components/extentions/accordion/Accoridion";
import { Tabs, TabItem } from "./components/extentions/tabs/Tabs";
import { Iframe } from "./components/extentions/iframe";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./components/tiptap-ui-primitive/tooltip";

import { Button } from "./components/ui/button";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Lock,
  LockOpen,
  Terminal,
  Link as LinkIcon,
  Palette,
  Type,
  Plus,
  Minus,
  Trash2,
  PanelTopOpen,
  Frame,
} from "lucide-react";

import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
// load all languages with "all" or common languages with "common"
import { all, createLowlight } from "lowlight";

// Configure lowlight with common languages
const lowlight = createLowlight(all);

// This is only an example, all supported languages are already loaded above
// but you can also register only specific languages to reduce bundle-size
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

const MenuButton = ({
  onClick,
  isActive = false,
  children,
  title,
  className = "",
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) => {
  const button = (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={`h-8 w-8 p-0 transition-all cursor-pointer ${
        isActive
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          : "bg-white hover:bg-gray-50"
      } ${className}`}
    >
      {children}
    </Button>
  );

  if (title) {
    return (
      <Tooltip delay={500} closeDelay={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

const ColorPicker = ({
  onColorChange,
}: {
  onColorChange: (color: string) => void;
}) => {
  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#000080",
    "#800000",
    "#808000",
    "#FFC0CB",
  ];

  return (
    <div className="flex flex-wrap gap-1 w-32">
      {colors.map((color) => (
        <Tooltip key={color} delay={300} closeDelay={0}>
          <TooltipTrigger asChild>
            <button
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          </TooltipTrigger>
          <TooltipContent>Set color to {color}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

const Tiptap = () => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [, forceUpdate] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [tableMenuPosition, setTableMenuPosition] = useState<{
    top: number;
    left: number;
    show: boolean;
  }>({ top: 0, left: 0, show: false });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use our own code block with syntax highlighting
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Underline,
      Strike,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Blockquote,
      HorizontalRule,
      Accordion,
      AccordionItem,
      Tabs,
      TabItem,
      Iframe,
    ],
    content: `
      <p>Welcome to the Advanced Tiptap Editor! This editor includes all the features you requested. Try them out!</p>
      <p>You can use:</p>
      <ul>
        <li>Headings (H1, H2, H3)</li>
        <li>Lists (bullet and numbered)</li>
        <li>Tables</li>
        <li>Block quotes</li>
        <li>Code blocks with syntax highlighting</li>
        <li>File uploads for images and videos</li>
        <li>Iframe embeds (CodeSandbox, YouTube, etc.)</li>

        <li>And much more...</li>
      </ul>
      <p>Place your cursor at an empty line to see the floating menu, or select text to see formatting options in the bubble menu.</p>
    `,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
    onUpdate: () => {
      // Force component re-render when editor content changes
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force component re-render when selection changes
      forceUpdate({});
    },
  });

  // Update editor editable state when readonly changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  // Update table menu position when inside a table
  useEffect(() => {
    if (!editor) return;

    const updateTableMenuPosition = () => {
      if (editor.isActive("table")) {
        const tableElement = editor.view.dom.querySelector("table");
        if (tableElement) {
          const rect = tableElement.getBoundingClientRect();
          const editorRect = editor.view.dom.getBoundingClientRect();

          setTableMenuPosition({
            top: rect.top - editorRect.top - 60,
            left: rect.left - editorRect.left,
            show: true,
          });
        }
      } else {
        setTableMenuPosition((prev) => ({ ...prev, show: false }));
      }
    };

    // Listen for selection changes
    const handleUpdate = () => {
      updateTableMenuPosition();
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          editor?.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const handleVideoUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          const videoHtml = `<video controls style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;"><source src="${src}" type="${file.type}">Your browser does not support the video tag.</video>`;
          editor?.commands.insertContent(videoHtml);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const handleSetLink = useCallback(() => {
    if (linkUrl) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const handleLogContent = useCallback(() => {
    if (!editor) return;

    const content = {
      html: editor.getHTML(),
      json: editor.getJSON(),
      text: editor.getText(),
      isEmpty: editor.isEmpty,
      characterCount:
        editor.storage.characterCount?.characters() || editor.getText().length,
      wordCount:
        editor.storage.characterCount?.words() ||
        editor
          .getText()
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
      timestamp: new Date().toISOString(),
    };

    console.log("📄 Tiptap Editor Content for Backend Storage:");
    console.log("================================================");
    console.log("📋 HTML Output (for rendering):", content.html);
    console.log("📋 JSON Output (for editing):", content.json);
    console.log("📋 Plain Text:", content.text);
    console.log("📊 Stats:", {
      isEmpty: content.isEmpty,
      characters: content.characterCount,
      words: content.wordCount,
      timestamp: content.timestamp,
    });
    console.log("================================================");

    return content;
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Debug Info - Remove this later */}
      {editor && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Current position - H1:{" "}
          {editor.isActive("heading", { level: 1 }) ? "✅" : "❌"} | H2:{" "}
          {editor.isActive("heading", { level: 2 }) ? "✅" : "❌"} | H3:{" "}
          {editor.isActive("heading", { level: 3 }) ? "✅" : "❌"} | P:{" "}
          {editor.isActive("paragraph") ? "✅" : "❌"} | Bold:{" "}
          {editor.isActive("bold") ? "✅" : "❌"} | List:{" "}
          {editor.isActive("bulletList") ? "✅" : "❌"} | Table:{" "}
          {editor.isActive("table") ? "✅" : "❌"}
        </div>
      )}

      {/* Read-Only Toggle & Log Button */}
      <div className="mb-4 flex justify-end gap-2">
        <Button
          onClick={handleLogContent}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          title="Log content to console for backend storage"
        >
          <Terminal className="h-4 w-4" />
          Log Content
        </Button>
        <Button
          onClick={() => setIsReadOnly(!isReadOnly)}
          variant={isReadOnly ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isReadOnly ? (
            <>
              <Lock className="h-4 w-4" />
              Read Only
            </>
          ) : (
            <>
              <LockOpen className="h-4 w-4" />
              Editable
            </>
          )}
        </Button>
      </div>

      {/* Sticky Toolbar */}
      {!isReadOnly && (
        <div className="sticky top-0 z-40 border border-gray-300 mb-4 p-4 bg-gray-50/95 flex flex-wrap gap-2 shadow-sm backdrop-blur-sm">
          {/* Text Format Buttons */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive("paragraph")}
              title="Paragraph"
            >
              <FileText className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Table */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              title="Insert Table (3x3)"
            >
              <TableIcon className="h-4 w-4" />
            </MenuButton>

            {/* Table Controls - Only show when inside a table */}
            {editor.isActive("table") && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-1" />

                <MenuButton
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  title="Add Row Before"
                  className="h-8 w-auto px-2"
                >
                  <div className="flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    <span className="text-xs">Row</span>
                  </div>
                </MenuButton>

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
              </>
            )}
          </div>

          {/* Block Elements */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Block Quote"
            >
              <Quote className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* File Upload */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton onClick={handleImageUpload} title="Upload Image">
              <ImageIcon className="h-4 w-4" />
            </MenuButton>
            <MenuButton onClick={handleVideoUpload} title="Upload Video">
              <VideoIcon className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Code Blocks */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                (editor.chain().focus() as any).insertAccordion().run()
              }
              title="Insert Accordion"
            >
              <PanelTopOpen className="h-4 w-4 cursor-pointer" />
            </MenuButton>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() =>
                (editor.chain().focus() as any)
                  .insertTabs({ tabCount: 2 })
                  .run()
              }
              title="Insert 2 Tabs"
            >
              <span className="text-xs font-mono">2T</span>
            </MenuButton>
            <MenuButton
              onClick={() =>
                (editor.chain().focus() as any)
                  .insertTabs({ tabCount: 3 })
                  .run()
              }
              title="Insert 3 Tabs"
            >
              <span className="text-xs font-mono">3T</span>
            </MenuButton>
            <MenuButton
              onClick={() =>
                (editor.chain().focus() as any)
                  .insertTabs({ tabCount: 4 })
                  .run()
              }
              title="Insert 4 Tabs"
            >
              <span className="text-xs font-mono">4T</span>
            </MenuButton>
            <MenuButton
              onClick={() =>
                (editor.chain().focus() as any)
                  .insertTabs({ tabCount: 5 })
                  .run()
              }
              title="Insert 5 Tabs"
            >
              <span className="text-xs font-mono">5T</span>
            </MenuButton>
            <MenuButton
              onClick={() =>
                (editor.chain().focus() as any)
                  .insertTabs({ tabCount: 6 })
                  .run()
              }
              title="Insert 6 Tabs"
            >
              <span className="text-xs font-mono">6T</span>
            </MenuButton>
          </div>

          {/* Iframe */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <MenuButton
              onClick={() => {
                const url = prompt(
                  "Enter the URL for your iframe:",
                  "https://example.com/embed"
                );
                if (url) {
                  (editor.chain().focus() as any)
                    .insertIframe({
                      src: url,
                      width: "100%",
                      height: "500px",
                      title: "Embedded Content",
                    })
                    .run();
                }
              }}
              title="Insert iframe"
            >
              <Frame className="h-4 w-4" />
            </MenuButton>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative border border-gray-300 border-t-1 rounded-t-lg rounded-b-lg min-h-[400px]">
        <EditorContent editor={editor} className="tiptap-editor" />

        {/* Floating Menu */}
        {!isReadOnly && (
          <FloatingMenu
            editor={editor}
            className="floating-menu bg-white border border-gray-300 rounded-lg p-2 shadow-lg flex gap-1 z-50"
          >
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
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
          </FloatingMenu>
        )}

        {/* Bubble Menu */}
        {!isReadOnly && (
          <BubbleMenu
            editor={editor}
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
                    <ColorPicker
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
                    <ColorPicker
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
                      <Tooltip delay={300} closeDelay={0}>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleSetLink}
                            size="sm"
                            className="h-8 cursor-pointer"
                          >
                            Set
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set link URL</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </BubbleMenu>
        )}

        {/* Custom Table Menu positioned above table */}
        {tableMenuPosition.show && (
          <div
            className="table-bubble-menu bg-white border-2 border-blue-500 rounded-lg p-2 shadow-lg"
            style={{
              position: "absolute",
              top: `${tableMenuPosition.top}px`,
              left: `${tableMenuPosition.left}px`,
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
        )}
      </div>
    </div>
  );
};

export default Tiptap;
