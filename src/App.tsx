import TiptapViewer from "./tiptap-viewer";
import TiptapEditor from "./tiptap-editor";
import { useState } from "react";

function App() {
  const [content, setEditorContent] = useState({ html: "", json: null });

  return (
    <>
      <TiptapEditor
        setEditorContent={setEditorContent}
        content="<p>Hello World</p>"
      />
      {/* <TiptapViewer editorContent={content.html} /> */}
    </>
  );
}

export default App;
