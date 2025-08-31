import TiptapViewer from "./tiptap-viewer";
import TiptapEditor from "./tiptap-editor";
import { uploadImageToFirebase, uploadVideoToFirebase } from "./firebase/index";

function App() {
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImageToFirebase(file);
      return imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw error;
    }
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    try {
      const videoUrl = await uploadVideoToFirebase(file);
      return videoUrl;
    } catch (error) {
      console.error("Failed to upload video:", error);
      throw error;
    }
  };

  return (
    <>
      {/* <TiptapViewer /> */}
      <TiptapEditor
        onImageUpload={handleImageUpload}
        onVideoUpload={handleVideoUpload}
      />
    </>
  );
}

export default App;
