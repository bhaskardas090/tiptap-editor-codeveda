// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Function to upload image to Firebase Storage
export const uploadImageToFirebase = async (file: File): Promise<string> => {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, `images/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image to Firebase");
  }
};

// Function to upload video to Firebase Storage
export const uploadVideoToFirebase = async (file: File): Promise<string> => {
  try {
    console.log("Starting video upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString(),
    });

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    console.log("Generated filename:", fileName);

    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, `videos/${fileName}`);
    console.log("Storage reference created:", `videos/${fileName}`);

    // Upload the file
    console.log("Starting upload...");
    const snapshot = await uploadBytes(storageRef, file);
    console.log("Upload completed:", snapshot);

    // Get the download URL
    console.log("Getting download URL...");
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Download URL obtained:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Detailed error uploading video:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : "No stack trace",
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("storage/unauthorized")) {
        throw new Error(
          "Video upload failed: Unauthorized. Please check Firebase Storage rules."
        );
      } else if (error.message.includes("storage/quota-exceeded")) {
        throw new Error("Video upload failed: Storage quota exceeded.");
      } else if (error.message.includes("storage/invalid-format")) {
        throw new Error("Video upload failed: Invalid file format.");
      } else {
        throw new Error(`Video upload failed: ${error.message}`);
      }
    } else {
      throw new Error("Video upload failed: Unknown error occurred.");
    }
  }
};
