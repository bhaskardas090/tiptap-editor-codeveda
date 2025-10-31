export interface ImageUploadService {
  uploadImage: (file: File) => Promise<string>;
  insertImageByUrl: (url: string) => void;
  deleteImage: (url: string) => Promise<void>;
}

export const createImageUploadService = (
  editor: any,
  onImageUpload?: (file: File) => Promise<string>,
  onImageDelete?: (url: string) => Promise<void>
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

  const deleteImage = async (url: string): Promise<void> => {
    if (!onImageDelete) {
      console.warn("Image delete function not provided. Image URL:", url);
      return;
    }
    try {
      await onImageDelete(url);
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  };

  return {
    uploadImage,
    insertImageByUrl,
    deleteImage,
  };
};
