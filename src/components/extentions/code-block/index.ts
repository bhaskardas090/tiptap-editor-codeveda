import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { selectAllWithin } from "../core-elements/selectAllWithin";
import CodeBlockComponent from "./CodeBlockComponent";
import { all, createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import python3 from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cplusplus from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
// Configure lowlight with common languages
const lowlight = createLowlight(all);

// Register specific languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
lowlight.register("java", java);
lowlight.register("c", c);
lowlight.register("cpp", cplusplus);
lowlight.register("python", python3);
lowlight.register("sql", sql);
lowlight.register("json", json);
// "plaintext" is a real, empty grammar: highlighting with it yields zero spans,
// so a plain-text block keeps the <pre> colour instead of being auto-detected
// and coloured as whatever language it happens to resemble.
lowlight.register("plaintext", plaintext);

// Extend CodeBlockLowlight to allow codeBlockBg mark
export const CodeBlockExtension = CodeBlockLowlight.extend({
  // Marks allowed inside a code block. CodeBlock sets `marks: ""` by default,
  // so anything usable in here has to be named explicitly.
  marks() {
    return "codeBlockBg codeBlockColor";
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Keep "select all" inside the code block the cursor is in, instead of
      // selecting the whole document.
      "Mod-a": ({ editor }: any) => selectAllWithin(editor),
    };
  },
}).configure({
  lowlight,
  // Code blocks that arrive without a language (typed, pasted, or loaded from
  // stored HTML) default to plain text rather than being auto-highlighted.
  defaultLanguage: "plaintext",
});

export { CodeBlockBg } from "./code-block-bg";
export { CodeBlockColor } from "./code-block-color";
