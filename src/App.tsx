// import TiptapViewer from "./tiptap-viewer";
// import TiptapEditor from "./tiptap-editor";
import { useState } from "react";
import { TiptapEditor, useEditorContent } from "tiptap-editor-codeveda";

function App() {
  // const [content, setEditorContent] = useState({ html: "", json: null });
  const { setContent } = useEditorContent();

  return (
    <>
      {/* <TiptapEditor setEditorContent={setEditorContent} />
      <TiptapViewer editorContent={content.html} /> */}
      <TiptapEditor setEditorContent={setContent} />
    </>
  );
}

export default App;
