import React, { useCallback, useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  LivePreviewDarkModeProvider,
  useResolvedDarkMode,
} from "./components/extentions/live-preview/dark-mode";
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
  CodeBlockColor,
  BlockquoteExtension,
  HorizontalRuleExtension,
  Accordion,
  AccordionItem,
  Tabs,
  TabItem,
  Iframe,
  LivePreview,
  Video,
  Toolbar,
  BubbleMenu,
  CodeBlockMenu,
  ImageMenu,
  FloatingMenu,
  TableMenu,
  DebugInfo,
  ControlPanel,
  logEditorContent,
  ColumnLayout,
  Column,
  ScopedClipboard,
} from "./components/extentions";
import { isYouTubeUrl } from "./components/extentions/video/videoUtils";
import { trackInsertPosition } from "./components/extentions/core-elements/trackInsertPosition";
import { useDeferredMediaCleanup } from "./components/extentions/core-elements/useDeferredMediaCleanup";
import { useDebouncedCallback } from "./components/extentions/core-elements/useDebouncedCallback";

interface TiptapProps {
  onImageUpload?: (file: File) => Promise<string>; // Function to upload image and return URL
  onVideoUpload?: (file: File) => Promise<string>; // Function to upload video and return URL
  onImageDelete?: (url: string) => Promise<void>; // Function to delete image by URL
  onVideoDelete?: (url: string) => Promise<void>; // Function to delete video by URL
  content?: string;
  setEditorContent?: (content: { html: string; json: any }) => void;
  /**
   * Milliseconds to coalesce `setEditorContent` calls over, so a burst of
   * typing reports once instead of per keystroke. Pass 0 to report every
   * change immediately.
   */
  contentUpdateDelay?: number;
  /**
   * Milliseconds to hold a removed image or video before calling
   * `onImageDelete` / `onVideoDelete`. Undo within this window cancels the
   * deletion. Pass 0 to delete as soon as the node is removed.
   */
  mediaDeleteDelay?: number;
  /** Force Live Preview dark mode. When omitted, the `darkMode` cookie is used. */
  darkMode?: boolean;
  /** Cookie consulted for dark mode when `darkMode` is not provided. */
  darkModeCookieName?: string;
}

const Tiptap: React.FC<TiptapProps> = ({
  onImageUpload,
  onVideoUpload,
  onImageDelete,
  onVideoDelete,
  content,
  setEditorContent,
  contentUpdateDelay = 300,
  mediaDeleteDelay = 5000,
  darkMode,
  darkModeCookieName,
}) => {
  const resolvedDarkMode = useResolvedDarkMode(darkMode, darkModeCookieName);
  // Local override so the in-editor toggle can flip the theme at runtime,
  // while still following the prop/cookie when those change.
  const [isDarkMode, setIsDarkMode] = useState(resolvedDarkMode);
  useEffect(() => {
    setIsDarkMode(resolvedDarkMode);
  }, [resolvedDarkMode]);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  // Whether newly inserted images carry a download button. The paste handlers
  // live inside the `useEditor` config, which is built once, so they read the
  // ref rather than closing over a stale state value.
  const [imageDownloadable, setImageDownloadable] = useState(false);
  const imageDownloadableRef = useRef(false);
  useEffect(() => {
    imageDownloadableRef.current = imageDownloadable;
  }, [imageDownloadable]);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
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

  // Removed images and videos are deleted after a grace period, so an undo can
  // take the file back before it is gone. See useDeferredMediaCleanup.
  const { reconcile: reconcileMedia } = useDeferredMediaCleanup({
    onImageDelete,
    onVideoDelete,
    delay: mediaDeleteDelay,
  });

  // Coalesce content reports: a burst of typing is one call, not one per key.
  const reportContent = useDebouncedCallback(
    (payload: { html: string; json: any }) => setEditorContent?.(payload),
    contentUpdateDelay
  );

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
      CodeBlockColor,
      BlockquoteExtension,
      HorizontalRuleExtension,
      Accordion,
      AccordionItem,
      Tabs,
      TabItem,
      Iframe,
      LivePreview,
      ColumnLayout,
      Column,
      ScopedClipboard,
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
      // @ts-ignore
      handlePaste: (view, event, slice) => {
        // Check if clipboard contains image files
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter(
          (item) => item.type.indexOf("image") !== -1,
        );

        // If there are image files in the clipboard and upload function is provided
        if (imageItems.length > 0 && onImageUpload && editorRef.current) {
          event.preventDefault();

          // Paste position, followed through any edits made while uploading.
          const target = trackInsertPosition(editorRef.current);

          // Process each image
          const uploadPromises = imageItems.map((item) => {
            const file = item.getAsFile();
            if (!file) return Promise.resolve(null);

            return onImageUpload(file)
              .then((imageUrl) => {
                if (imageUrl && editorRef.current) {
                  // Insert the uploaded image where it was pasted
                  editorRef.current
                    .chain()
                    .insertContentAt(
                      target.get(),
                      {
                        type: "image",
                        attrs: {
                          src: imageUrl,
                          downloadable: imageDownloadableRef.current,
                        },
                      },
                      { updateSelection: false }
                    )
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
            target.release();
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

              // Paste position, followed through any edits made while uploading.
              const target = trackInsertPosition(editorRef.current);

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
                          .insertContentAt(
                            target.get(),
                            {
                              type: "image",
                              attrs: {
                                src: imageUrl,
                                downloadable: imageDownloadableRef.current,
                              },
                            },
                            { updateSelection: false }
                          )
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
                target.release();
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

      // Schedules deletion of media dropped since the last update, and cancels
      // any pending deletion for media that came back.
      reconcileMedia(previousContent, currentJson);

      // Update previous content for next comparison
      setPreviousContent(currentJson);

      // Force component re-render when editor content changes
      reportContent({ html: editor.getHTML(), json: currentJson });
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Force component re-render when selection changes. The content itself is
      // unchanged, so the host is not notified — moving the cursor is not an
      // edit, and reporting it made every caret move look like one.
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".video-input-container")) {
        setShowVideoInput(false);
      }
    };

    if (showVideoInput) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVideoInput]);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload && editor) {
        // Where the cursor is *now* — the image lands here even if the author
        // keeps writing somewhere else while it uploads.
        const target = trackInsertPosition(editor);
        try {
          setIsImageUploading(true);
          const imageUrl = await onImageUpload(file);
          if (imageUrl) {
            editor
              .chain()
              .insertContentAt(
                target.get(),
                {
                  type: "image",
                  attrs: {
                    src: imageUrl,
                    downloadable: imageDownloadableRef.current,
                  },
                },
                { updateSelection: false }
              )
              .run();
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
          alert("Failed to upload image. Please try again.");
        } finally {
          target.release();
          setIsImageUploading(false);
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const handleImageUrlInsert = useCallback(() => {
    if (imageUrl.trim()) {
      // insertContent rather than setImage: the latter's signature only carries
      // src/alt/title, so it cannot pass the `downloadable` attribute through.
      editor
        ?.chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: imageUrl.trim(), downloadable: imageDownloadable },
        })
        .run();
      setImageUrl("");
      setShowImageInput(false);
    }
  }, [editor, imageUrl, imageDownloadable]);

  const handleVideoUrlInsert = useCallback(() => {
    const url = videoUrl.trim();
    if (!url) return;

    editor
      ?.chain()
      .focus()
      .setVideo({
        src: url,
        type: isYouTubeUrl(url) ? "youtube" : "video/mp4",
        title: "",
      })
      .run();

    setVideoUrl("");
    setShowVideoInput(false);
  }, [editor, videoUrl]);

  const handleVideoUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setShowVideoInput(false);
      }
      if (file && onVideoUpload && editor) {
        // Remember where the upload was started; the cursor may move on.
        const target = trackInsertPosition(editor);
        try {
          setIsVideoUploading(true);
          const videoUrl = await onVideoUpload(file);
          if (videoUrl) {
            try {
              editor
                .chain()
                .insertContentAt(
                  target.get(),
                  {
                    type: "video",
                    attrs: {
                      src: videoUrl,
                      type: file.type,
                      title: file.name,
                    },
                  },
                  { updateSelection: false }
                )
                .run();
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
            }`,
          );
        } finally {
          setIsVideoUploading(false);
        }
      } else if (file && !onVideoUpload && editor) {
        // Fallback to base64 if no upload function provided
        const target = trackInsertPosition(editor);
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;

          try {
            editor
              .chain()
              .insertContentAt(
                target.get(),
                {
                  type: "video",
                  attrs: { src, type: file.type, title: file.name },
                },
                { updateSelection: false }
              )
              .run();
          } catch (insertError) {
            console.error(
              "Error inserting base64 video into editor:",
              insertError,
            );
          } finally {
            target.release();
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
    <div
      className={`w-full max-w-6xl mx-auto p-4${
        isDarkMode ? " dark tiptap-dark" : ""
      }`}
    >
      {/* Debug Info - Remove this later */}
      {editor && <DebugInfo editor={editor} />}

      {/* Control Panel */}
      <ControlPanel
        editor={editor}
        isReadOnly={isReadOnly}
        setIsReadOnly={setIsReadOnly}
        onLogContent={handleLogContent}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
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
        imageDownloadable={imageDownloadable}
        setImageDownloadable={setImageDownloadable}
        showVideoInput={showVideoInput}
        setShowVideoInput={setShowVideoInput}
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        handleVideoUrlInsert={handleVideoUrlInsert}
        videoUploadFunction={onVideoUpload}
      />

      {/* Editor Content */}
      <div className="relative border border-gray-300 border-t-1 rounded-t-lg rounded-b-lg min-h-[400px]">
        <LivePreviewDarkModeProvider darkMode={isDarkMode}>
          <EditorContent editor={editor} className="tiptap-editor" />
        </LivePreviewDarkModeProvider>

        {/* Uploads show their progress on the toolbar button, like videos do —
            the editor stays usable while a file is on its way. */}

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

        {/* Image Menu */}
        <ImageMenu editor={editor} isReadOnly={isReadOnly} />

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
