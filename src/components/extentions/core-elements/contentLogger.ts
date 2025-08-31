import { Editor } from "@tiptap/react";

export interface ContentLog {
  html: string;
  json: any;
  text: string;
  isEmpty: boolean;
  characterCount: number;
  wordCount: number;
  timestamp: string;
}

export const logEditorContent = (editor: Editor): ContentLog => {
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
};
