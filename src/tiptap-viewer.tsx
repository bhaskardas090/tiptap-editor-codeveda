import React, { useState, useEffect } from "react";
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
} from "./components/extentions";

const Tiptap = () => {
  const [, forceUpdate] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKitExtension,
      TableExtension,
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      UnderlineExtension,
      StrikeExtension,
      TextStyleExtension,
      ColorExtension.configure({
        types: ["textStyle"],
      }),
      HighlightExtension.configure({
        multicolor: true,
      }),
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
      <div data-title="Output" data-open="false" data-type="accordion">
       <div data-type="accordion-item">
        <img class="max-w-full h-auto rounded-lg shadow-sm" src="https://firebasestorage.googleapis.com/v0/b/codeveda-dev.firebasestorage.app/o/images%2F1756639598586_img1.png?alt=media&amp;token=8b789260-df87-4ad7-ae5a-65c64f9850b2">
       </div>
      </div>
      <p>You can use:</p>
      <ul>
        <li><p>Headings (H1, H2, H3)</p></li>
        <li><p>Lists (bullet and numbered)</p></li>
        <li><p>Tables</p></li>
        <li><p>Block quotes</p></li>
        <li><p>Code blocks with syntax highlighting</p></li>
        <li><p>File uploads for images and videos</p></li>
        <li><p>Iframe embeds (CodeSandbox, YouTube, etc.)</p></li>
        <li><p>And much more...</p></li>
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
    <div className="w-full max-w-[710px] mx-auto p-4">
      <div className="relative border border-gray-300 border-t-1 rounded-t-lg rounded-b-lg min-h-[400px]">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
};

export default Tiptap;
