// Import CSS to ensure it's included in the build
import "./index.css";

export { default as TiptapEditor } from "./tiptap-editor";
export { default as TiptapViewer } from "./tiptap-viewer";

export type { EditorContentPayload } from "./types";
export { useEditorContent } from "./useEditorContent";
