export interface VideoUploadService {
  uploadVideo: (file: File) => Promise<string>;
  insertVideo: (src: string, type: string, title: string) => void;
}

export const createVideoUploadService = (
  editor: any,
  onVideoUpload?: (file: File) => Promise<string>
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

  return {
    uploadVideo,
    insertVideo,
  };
};
