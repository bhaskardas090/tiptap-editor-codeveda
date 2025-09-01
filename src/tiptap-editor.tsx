import React, { useCallback, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  StarterKitExtension,
  TableExtension,
  TableRow,
  TableHeader,
  TableCell,
  ImageExtension,
  LinkExtension,
  UnderlineExtension,
  StrikeExtension,
  TextStyleExtension,
  ColorExtension,
  HighlightExtension,
  CodeBlockExtension,
  BlockquoteExtension,
  HorizontalRuleExtension,
  Accordion,
  AccordionItem,
  Tabs,
  TabItem,
  Iframe,
  Video,
  Toolbar,
  BubbleMenu,
  FloatingMenu,
  TableMenu,
  DebugInfo,
  ControlPanel,
  logEditorContent,
} from "./components/extentions";

interface TiptapProps {
  onImageUpload?: (file: File) => Promise<string>; // Function to upload image and return URL
  onVideoUpload?: (file: File) => Promise<string>; // Function to upload video and return URL
  setEditorContent?: (content: { html: string; json: any }) => void;
}

const Tiptap: React.FC<TiptapProps> = ({
  onImageUpload,
  onVideoUpload,
  setEditorContent,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [, forceUpdate] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [tableMenuPosition, setTableMenuPosition] = useState<{
    top: number;
    left: number;
    show: boolean;
  }>({ top: 0, left: 0, show: false });

  const editor = useEditor({
    extensions: [
      StarterKitExtension,
      TableExtension,
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension,
      LinkExtension,
      UnderlineExtension,
      StrikeExtension,
      TextStyleExtension,
      ColorExtension,
      HighlightExtension,
      CodeBlockExtension,
      BlockquoteExtension,
      HorizontalRuleExtension,
      Accordion,
      AccordionItem,
      Tabs,
      TabItem,
      Iframe,
      Video.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
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
      setEditorContent?.({ html: editor.getHTML(), json: editor.getJSON() });
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force component re-render when selection changes
      setEditorContent?.({ html: editor.getHTML(), json: editor.getJSON() });
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
      if (editor.isActive("table") && !isReadOnly) {
        // Find the table that contains the current cursor position
        const { from } = editor.state.selection;

        // Find the table element at the cursor position by looking for the closest table ancestor
        let tableElement: HTMLElement | null = null;

        // Get the DOM element at the cursor position
        const domAtPos = editor.view.domAtPos(from);
        if (domAtPos.node && domAtPos.node.parentElement) {
          // Traverse up to find the table element
          let currentElement: HTMLElement | null = domAtPos.node.parentElement;
          while (currentElement && currentElement !== editor.view.dom) {
            if (currentElement.tagName === "TABLE") {
              tableElement = currentElement;
              break;
            }
            currentElement = currentElement.parentElement;
          }
        }

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

  // Close image input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".image-input-container")) {
        setShowImageInput(false);
      }
    };

    if (showImageInput) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showImageInput]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload) {
        try {
          setIsImageUploading(true);
          const imageUrl = await onImageUpload(file);
          if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl }).run();
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
          alert("Failed to upload image. Please try again.");
        } finally {
          setIsImageUploading(false);
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const handleImageUrlInsert = useCallback(() => {
    if (imageUrl.trim()) {
      editor?.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
      setShowImageInput(false);
    }
  }, [editor, imageUrl]);

  const handleVideoUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onVideoUpload) {
        try {
          setIsVideoUploading(true);
          const videoUrl = await onVideoUpload(file);
          if (videoUrl) {
            console.log("Attempting to insert video:", {
              src: videoUrl,
              type: file.type,
              title: file.name,
            });

            try {
              const result = editor
                ?.chain()
                .focus()
                .setVideo({
                  src: videoUrl,
                  type: file.type,
                  title: file.name,
                })
                .run();

              console.log("Video insertion result:", result);
            } catch (insertError) {
              console.error("Error inserting video into editor:", insertError);
              throw insertError;
            }
          }
        } catch (error) {
          console.error("Failed to upload video:", error);
          console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
          });
          alert(
            `Failed to upload video: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        } finally {
          setIsVideoUploading(false);
        }
      } else if (file && !onVideoUpload) {
        // Fallback to base64 if no upload function provided
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          console.log("Attempting to insert base64 video:", {
            src: src.substring(0, 100) + "...",
            type: file.type,
            title: file.name,
          });

          try {
            const result = editor
              ?.chain()
              .focus()
              .setVideo({
                src: src,
                type: file.type,
                title: file.name,
              })
              .run();

            console.log("Base64 video insertion result:", result);
          } catch (insertError) {
            console.error(
              "Error inserting base64 video into editor:",
              insertError
            );
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor, onVideoUpload]);

  const handleLogContent = useCallback(() => {
    if (!editor) return;
    return logEditorContent(editor);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Debug Info - Remove this later */}
      {editor && <DebugInfo editor={editor} />}

      {/* Control Panel */}
      <ControlPanel
        editor={editor}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
        onLogContent={handleLogContent}
      />

      {/* Toolbar */}
      <Toolbar
        editor={editor}
        isReadOnly={isReadOnly}
        onImageUpload={handleImageUpload}
        onVideoUpload={handleVideoUpload}
        isImageUploading={isImageUploading}
        isVideoUploading={isVideoUploading}
        showImageInput={showImageInput}
        setShowImageInput={setShowImageInput}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        handleImageUrlInsert={handleImageUrlInsert}
        imageUploadFunction={onImageUpload}
      />

      {/* Editor Content */}
      <div className="relative border border-gray-300 border-t-1 rounded-t-lg rounded-b-lg min-h-[400px]">
        <EditorContent editor={editor} className="tiptap-editor" />

        {/* Floating Menu */}
        <FloatingMenu
          editor={editor}
          isReadOnly={isReadOnly}
          onImageClick={() => setShowImageInput(!showImageInput)}
        />

        {/* Bubble Menu */}
        <BubbleMenu editor={editor} isReadOnly={isReadOnly} />

        {/* Table Menu */}
        <TableMenu
          editor={editor}
          isReadOnly={isReadOnly}
          position={tableMenuPosition}
        />
      </div>
    </div>
  );
};

export default Tiptap;
