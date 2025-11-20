import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
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

// Extend CodeBlockLowlight to allow codeBlockBg mark
export const CodeBlockExtension = CodeBlockLowlight.extend({
  marks() {
    return "codeBlockBg";
  },
}).configure({
  lowlight,
});

export { CodeBlockBg } from "./code-block-bg";
