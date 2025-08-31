# Firebase Image & Video Upload

This module provides functionality to upload images and videos to Firebase Storage and retrieve their download URLs.

## Usage

### Basic Image Upload

```typescript
import { uploadImageToFirebase } from "./firebase/index";

const handleImageUpload = async (file: File): Promise<string> => {
  try {
    const imageUrl = await uploadImageToFirebase(file);
    return imageUrl;
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
};
```

### Basic Video Upload

```typescript
import { uploadVideoToFirebase } from "./firebase/index";

const handleVideoUpload = async (file: File): Promise<string> => {
  try {
    const videoUrl = await uploadVideoToFirebase(file);
    return videoUrl;
  } catch (error) {
    console.error("Failed to upload video:", error);
    throw error;
  }
};
```

### With Tiptap Editor

Both upload functions work seamlessly with the Tiptap editor:

```typescript
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
    <TiptapEditor 
      onImageUpload={handleImageUpload} 
      onVideoUpload={handleVideoUpload} 
    />
  );
}
```

## Loading States & User Experience

The implementation includes comprehensive loading states for both image and video uploads:

### 1. **Main Button Loading States**
- Shows spinning loaders instead of icons during upload
- Buttons become semi-transparent (opacity-50)
- Small pulsing blue dot indicators appear

### 2. **Upload Process Feedback**
- Button text changes to show upload progress
- All form inputs are disabled during upload
- Visual feedback with opacity changes and cursor updates

### 3. **Global Loading Indicators**
- Consistent blue theme for all loading states
- Smooth transitions and animations
- Professional appearance across all device sizes

## Function Details

### `uploadImageToFirebase(file: File): Promise<string>`

- **Parameters**:
  - `file`: A File object (typically from an input element or drag & drop)
- **Returns**: Promise that resolves to the download URL string
- **Storage Path**: Images are stored in `images/` folder with timestamp prefix
- **File Naming**: Format: `{timestamp}_{originalFileName}`

### `uploadVideoToFirebase(file: File): Promise<string>`

- **Parameters**:
  - `file`: A File object (typically from an input element or drag & drop)
- **Returns**: Promise that resolves to the download URL string
- **Storage Path**: Videos are stored in `videos/` folder with timestamp prefix
- **File Naming**: Format: `{timestamp}_{originalFileName}`

## Error Handling

Both functions throw an error if:

- File upload fails
- Firebase Storage is not accessible
- Network issues occur

Always wrap calls in try-catch blocks for proper error handling.

## Firebase Configuration

Make sure your environment variables are set:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
