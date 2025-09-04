import React from "react";
import { Editor } from "@tiptap/react";
import MenuButton from "./MenuButton";
import {
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
  Minus,
  PanelTopOpen,
  Frame,
  Code,
} from "lucide-react";
import { Button } from "../../ui/button";

interface ToolbarProps {
  editor: Editor;
  isReadOnly: boolean;
  onImageUpload: () => void;
  onVideoUpload: () => void;
  isImageUploading: boolean;
  isVideoUploading: boolean;
  showImageInput: boolean;
  setShowImageInput: (show: boolean) => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  handleImageUrlInsert: () => void;
  imageUploadFunction?: (file: File) => Promise<string>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  isReadOnly,
  onImageUpload,
  onVideoUpload,
  isImageUploading,
  isVideoUploading,
  showImageInput,
  setShowImageInput,
  imageUrl,
  setImageUrl,
  handleImageUrlInsert,
  imageUploadFunction,
}) => {
  // Intentionally minimal state; remove unused link/color states to satisfy linter

  if (isReadOnly) return null;

  return (
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
        {/* Image Upload/URL */}
        <div className="relative">
          <MenuButton
            onClick={() => setShowImageInput(!showImageInput)}
            title="Insert Image"
            className={isImageUploading ? "opacity-50" : ""}
          >
            {isImageUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </MenuButton>
          {isImageUploading && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          )}
          {showImageInput && (
            <div
              className={`absolute top-full mt-1 z-10 bg-white border border-gray-300 rounded-lg p-2 shadow-lg min-w-80 image-input-container ${
                isImageUploading ? "opacity-75" : ""
              }`}
            >
              <div className="space-y-3">
                {/* Header with close button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Insert Image
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className={`text-gray-400 hover:text-gray-600 ${
                      isImageUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isImageUploading}
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isImageUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isImageUploading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleImageUrlInsert();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleImageUrlInsert}
                      size="sm"
                      className="px-4 py-2"
                      disabled={!imageUrl.trim() || isImageUploading}
                    >
                      Insert
                    </Button>
                  </div>

                  {/* Image Preview */}
                  {imageUrl.trim() && (
                    <div className="mt-2 p-2 border border-gray-200 rounded bg-gray-50">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imageUrl.trim()}
                        alt="Preview"
                        className="max-w-full h-auto max-h-32 rounded border"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = "none";
                          const errorMsg =
                            img.nextElementSibling as HTMLElement;
                          if (errorMsg) errorMsg.style.display = "block";
                        }}
                      />
                      <p className="text-xs text-red-500 hidden">
                        Invalid image URL
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Upload Image
                  </label>
                  <Button
                    type="button"
                    onClick={onImageUpload}
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={!imageUploadFunction || isImageUploading}
                  >
                    {isImageUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : imageUploadFunction ? (
                      "Choose File"
                    ) : (
                      "Upload not available"
                    )}
                  </Button>
                  {isImageUploading && (
                    <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                      <div className="animate-pulse">⏳</div>
                      <span>Please wait while your image uploads...</span>
                    </div>
                  )}
                  {!imageUploadFunction && (
                    <p className="text-xs text-gray-500 mt-1">
                      Upload function not provided
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <MenuButton
            onClick={onVideoUpload}
            title={
              isVideoUploading
                ? "Upload Video to Firebase"
                : "Upload Video (Base64)"
            }
            className={isVideoUploading ? "opacity-50" : ""}
          >
            {isVideoUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <VideoIcon className="h-4 w-4" />
            )}
          </MenuButton>
          {isVideoUploading && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          )}
          {!onVideoUpload && (
            <div className="absolute top-full mt-1 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
              Video upload not available
            </div>
          )}
        </div>
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
            (editor.chain().focus() as any).insertTabs({ tabCount: 2 }).run()
          }
          title="Insert 2 Tabs"
        >
          <span className="text-xs font-mono">2T</span>
        </MenuButton>
        <MenuButton
          onClick={() =>
            (editor.chain().focus() as any).insertTabs({ tabCount: 3 }).run()
          }
          title="Insert 3 Tabs"
        >
          <span className="text-xs font-mono">3T</span>
        </MenuButton>
        <MenuButton
          onClick={() =>
            (editor.chain().focus() as any).insertTabs({ tabCount: 4 }).run()
          }
          title="Insert 4 Tabs"
        >
          <span className="text-xs font-mono">4T</span>
        </MenuButton>
        <MenuButton
          onClick={() =>
            (editor.chain().focus() as any).insertTabs({ tabCount: 5 }).run()
          }
          title="Insert 5 Tabs"
        >
          <span className="text-xs font-mono">5T</span>
        </MenuButton>
        <MenuButton
          onClick={() =>
            (editor.chain().focus() as any).insertTabs({ tabCount: 6 }).run()
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
  );
};

export default Toolbar;
