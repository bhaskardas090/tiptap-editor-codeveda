export interface ImageUploadService {
  uploadImage: (file: File) => Promise<string>;
  insertImageByUrl: (url: string) => void;
}

export const createImageUploadService = (
  editor: any,
  onImageUpload?: (file: File) => Promise<string>
): ImageUploadService => {
  const uploadImage = async (file: File): Promise<string> => {
    if (!onImageUpload) {
      throw new Error("Image upload function not provided");
    }
    return await onImageUpload(file);
  };

  const insertImageByUrl = (url: string) => {
    if (editor && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  return {
    uploadImage,
    insertImageByUrl,
  };
};
