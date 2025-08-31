import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import { createLowlight } from "lowlight";
import {
  Accordion,
  AccordionItem,
} from "@/components/extentions/accordion/Accoridion";
import { Tabs, TabItem } from "@/components/extentions/tabs/Tabs";
import { Iframe } from "@/components/extentions/iframe";

const lowlight = createLowlight();
import("highlight.js/lib/languages/javascript").then((js) =>
  lowlight.register("javascript", js.default)
);
import("highlight.js/lib/languages/typescript").then((ts) =>
  lowlight.register("typescript", ts.default)
);
import("highlight.js/lib/languages/python").then((py) =>
  lowlight.register("python", py.default)
);
import("highlight.js/lib/languages/css").then((css) =>
  lowlight.register("css", css.default)
);
import("highlight.js/lib/languages/xml").then((xml) =>
  lowlight.register("html", xml.default)
);
import("highlight.js/lib/languages/json").then((json) =>
  lowlight.register("json", json.default)
);

const Tiptap = () => {
  const [, forceUpdate] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
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
        defaultLanguage: "javascript",
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
      <p>Welcome to the Advanced Tiptap Viewer! This viewer includes all the features you requested. Try them out!</p>
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
      <p>Select text to see formatting options in the bubble menu.</p>
    `,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
    onUpdate: () => {
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      forceUpdate({});
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="relative border border-gray-300 border-t-1 rounded-t-lg rounded-b-lg min-h-[400px]">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
};

export default Tiptap;
