export interface VideoUploadService {
  uploadVideo: (file: File) => Promise<string>;
  insertVideo: (src: string, type: string, title: string) => void;
  deleteVideo: (url: string) => Promise<void>;
}

export const createVideoUploadService = (
  editor: any,
  onVideoUpload?: (file: File) => Promise<string>,
  onVideoDelete?: (url: string) => Promise<void>
): VideoUploadService => {
  const uploadVideo = async (file: File): Promise<string> => {
    if (!onVideoUpload) {
      throw new Error("Video upload function not provided");
    }
    return await onVideoUpload(file);
  };

  const insertVideo = (src: string, type: string, title: string) => {
    if (editor) {
      console.log("Attempting to insert video:", { src, type, title });

      try {
        const result = editor
          .chain()
          .focus()
          .setVideo({
            src,
            type,
            title,
          })
          .run();

        console.log("Video insertion result:", result);
      } catch (insertError) {
        console.error("Error inserting video into editor:", insertError);
        throw insertError;
      }
    }
  };

  const deleteVideo = async (url: string): Promise<void> => {
    if (!onVideoDelete) {
      console.warn("Video delete function not provided. Video URL:", url);
      return;
    }
    try {
      await onVideoDelete(url);
    } catch (error) {
      console.error("Failed to delete video:", error);
      throw error;
    }
  };

  return {
    uploadVideo,
    insertVideo,
    deleteVideo,
  };
};
