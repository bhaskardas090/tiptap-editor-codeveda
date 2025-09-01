import { useCallback, useState } from "react";
import type { EditorContentPayload } from "./types";

export function useEditorContent(initial?: EditorContentPayload) {
  const [content, setContent] = useState<EditorContentPayload>(
    initial ?? { html: "", json: null }
  );

  const updateContent = useCallback((next: EditorContentPayload) => {
    setContent(next);
  }, []);

  return {
    content,
    html: content.html,
    json: content.json,
    setContent: updateContent,
  };
}
