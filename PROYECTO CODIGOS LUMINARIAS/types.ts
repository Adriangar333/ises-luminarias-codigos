
export type ProcessingStatus = 'pending' | 'processing' | 'success' | 'error';

// This is what we'll store in IndexedDB
export interface StoredImage {
  id: string;
  file: File; // The original file with metadata
  status: ProcessingStatus;
  extractedCode: string | null;
}

// This is what we'll use in the React state, with a temporary URL for display
export interface ProcessedImage extends StoredImage {
  previewUrl: string;
}
