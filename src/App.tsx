import TiptapViewer from "./tiptap-viewer";
import TiptapEditor from "./tiptap-editor";
import { useState } from "react";

function App() {
  const [, setEditorContent] = useState({ html: "", json: null });

  return (
    <>
      <TiptapViewer />
      <TiptapEditor setEditorContent={setEditorContent} />
    </>
  );
}

export default App;
