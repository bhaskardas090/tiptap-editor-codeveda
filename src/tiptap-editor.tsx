import React, { useCallback, useState, useEffect, useRef } from "react";
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
  CodeBlockBg,
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
  CodeBlockMenu,
  FloatingMenu,
  TableMenu,
  DebugInfo,
  ControlPanel,
  logEditorContent,
  ColumnLayout,
  Column,
} from "./components/extentions";

interface TiptapProps {
  onImageUpload?: (file: File) => Promise<string>; // Function to upload image and return URL
  onVideoUpload?: (file: File) => Promise<string>; // Function to upload video and return URL
  onImageDelete?: (url: string) => Promise<void>; // Function to delete image by URL
  onVideoDelete?: (url: string) => Promise<void>; // Function to delete video by URL
  content?: string;
  setEditorContent?: (content: { html: string; json: any }) => void;
}

const Tiptap: React.FC<TiptapProps> = ({
  onImageUpload,
  onVideoUpload,
  onImageDelete,
  onVideoDelete,
  content,
  setEditorContent,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [, forceUpdate] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [previousContent, setPreviousContent] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const [tableMenuPosition, setTableMenuPosition] = useState<{
    top: number;
    left: number;
    show: boolean;
  }>({ top: 0, left: 0, show: false });

  // Helper function to extract image URLs from editor content
  const extractImageUrls = (json: any): Set<string> => {
    const urls = new Set<string>();
    const traverse = (node: any) => {
      if (node.type === "image" && node.attrs?.src) {
        urls.add(node.attrs.src);
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };
    traverse(json);
    return urls;
  };

  // Helper function to extract video URLs from editor content
  const extractVideoUrls = (json: any): Set<string> => {
    const urls = new Set<string>();
    const traverse = (node: any) => {
      if (node.type === "video" && node.attrs?.src) {
        urls.add(node.attrs.src);
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };
    traverse(json);
    return urls;
  };

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
      CodeBlockBg,
      BlockquoteExtension,
      HorizontalRuleExtension,
      Accordion,
      AccordionItem,
      Tabs,
      TabItem,
      Iframe,
      ColumnLayout,
      Column,
      Video.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
    ],
    content:
      content ||
      `
      <p>Hello World. Create your own content here.</p>
    `,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
      handlePaste: (view, event, slice) => {
        // Check if clipboard contains image files
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter(
          (item) => item.type.indexOf("image") !== -1
        );

        // If there are image files in the clipboard and upload function is provided
        if (imageItems.length > 0 && onImageUpload && editorRef.current) {
          event.preventDefault();

          // Process each image
          const uploadPromises = imageItems.map((item) => {
            const file = item.getAsFile();
            if (!file) return Promise.resolve(null);

            return onImageUpload(file)
              .then((imageUrl) => {
                if (imageUrl && editorRef.current) {
                  // Insert the uploaded image
                  editorRef.current
                    .chain()
                    .focus()
                    .setImage({ src: imageUrl })
                    .run();
                }
                return imageUrl;
              })
              .catch((error) => {
                console.error("Failed to upload pasted image:", error);
                alert("Failed to upload pasted image. Please try again.");
                return null;
              });
          });

          // Set uploading state
          setIsImageUploading(true);

          Promise.all(uploadPromises).finally(() => {
            setIsImageUploading(false);
          });

          return true; // Indicate that we handled the paste event
        }

        // Also check for HTML content with image data URLs (when copying images from web pages)
        const htmlData = event.clipboardData?.getData("text/html");
        if (htmlData && onImageUpload && editorRef.current) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlData, "text/html");
          const images = doc.querySelectorAll("img");

          if (images.length > 0) {
            // Check if any images have data URLs or external URLs that we should upload
            const imagesToUpload = Array.from(images).filter((img) => {
              const src = img.getAttribute("src");
              return (
                src &&
                (src.startsWith("data:") ||
                  src.startsWith("http://") ||
                  src.startsWith("https://"))
              );
            });

            if (imagesToUpload.length > 0) {
              event.preventDefault();

              const imagePromises = imagesToUpload.map((img) => {
                const src = img.getAttribute("src");
                if (!src) return Promise.resolve(null);

                // Helper function to convert blob to file and upload
                const uploadBlob = (blob: Blob, filename: string) => {
                  const file = new File([blob], filename, {
                    type: blob.type || "image/png",
                  });
                  return onImageUpload(file)
                    .then((imageUrl) => {
                      if (imageUrl && editorRef.current) {
                        editorRef.current
                          .chain()
                          .focus()
                          .setImage({ src: imageUrl })
                          .run();
                      }
                      return imageUrl;
                    })
                    .catch((error) => {
                      console.error("Failed to upload pasted image:", error);
                      alert("Failed to upload pasted image. Please try again.");
                      return null;
                    });
                };

                // Check if it's a data URL or external URL
                if (src.startsWith("data:")) {
                  // Convert data URL to File
                  return fetch(src)
                    .then((res) => res.blob())
                    .then((blob) => uploadBlob(blob, "pasted-image.png"));
                } else if (
                  src.startsWith("http://") ||
                  src.startsWith("https://")
                ) {
                  // For external URLs, fetch and upload
                  return fetch(src)
                    .then((res) => res.blob())
                    .then((blob) => uploadBlob(blob, "pasted-image.png"));
                }
                return Promise.resolve(null);
              });

              setIsImageUploading(true);
              Promise.all(imagePromises).finally(() => {
                setIsImageUploading(false);
              });
              return true;
            }
          }
        }

        // For non-image pastes or when no upload function, use default behavior
        return false;
      },
    },
    onUpdate: () => {
      const currentJson = editor.getJSON();

      // Detect deleted images and videos by comparing with previous content
      if (previousContent) {
        const previousImageUrls = extractImageUrls(previousContent);
        const currentImageUrls = extractImageUrls(currentJson);
        const deletedImageUrls = [...previousImageUrls].filter(
          (url) => !currentImageUrls.has(url)
        );

        const previousVideoUrls = extractVideoUrls(previousContent);
        const currentVideoUrls = extractVideoUrls(currentJson);
        const deletedVideoUrls = [...previousVideoUrls].filter(
          (url) => !currentVideoUrls.has(url)
        );

        // Handle deleted images
        deletedImageUrls.forEach((url) => {
          if (onImageDelete) {
            onImageDelete(url).catch((error) => {
              console.error("Failed to delete image:", error);
            });
          }
        });

        // Handle deleted videos
        deletedVideoUrls.forEach((url) => {
          if (onVideoDelete) {
            onVideoDelete(url).catch((error) => {
              console.error("Failed to delete video:", error);
            });
          }
        });
      }

      // Update previous content for next comparison
      setPreviousContent(currentJson);

      // Force component re-render when editor content changes
      setEditorContent?.({ html: editor.getHTML(), json: currentJson });
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force component re-render when selection changes
      setEditorContent?.({ html: editor.getHTML(), json: editor.getJSON() });
      forceUpdate({});
    },
  });

  // Initialize previous content when editor is ready
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
      setPreviousContent(editor.getJSON());
    }
  }, [editor]);

  // Update previous content when content prop changes externally
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentJson = editor.getJSON();
      setPreviousContent(currentJson);
    }
  }, [content, editor]);

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
            top: rect.bottom - editorRect.top + 10,
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

        {/* Image Upload Loader Overlay */}
        {isImageUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Uploading image...
              </p>
            </div>
          </div>
        )}

        {/* Floating Menu */}
        <FloatingMenu
          editor={editor}
          isReadOnly={isReadOnly}
          onImageClick={() => setShowImageInput(!showImageInput)}
        />

        {/* Bubble Menu */}
        <BubbleMenu editor={editor} isReadOnly={isReadOnly} />

        {/* Code Block Menu */}
        <CodeBlockMenu editor={editor} isReadOnly={isReadOnly} />

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
