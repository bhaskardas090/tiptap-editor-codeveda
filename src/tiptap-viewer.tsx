import { useState, useEffect } from "react";
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
} from "./components/extentions";

const Tiptap = ({
  styles,
  editorContent,
  immediatelyRender = false,
}: {
  styles?: string;
  editorContent?: string;
  immediatelyRender?: boolean;
}) => {
  const [, forceUpdate] = useState({});
  const [isReadOnly] = useState(true);

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
      CodeBlockBg,
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
    content: editorContent || `<h1>Nothing on Canvas :(</h1>`,
    editable: !isReadOnly,
    immediatelyRender,
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 ${styles}`,
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
      {/* <div className="relative border border-gray-300 rounded-lg"> */}
      <EditorContent editor={editor} className="tiptap-editor" />
      {/* </div> */}
    </div>
  );
};

export default Tiptap;
