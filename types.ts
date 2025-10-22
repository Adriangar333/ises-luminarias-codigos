
export type ProcessingStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ProcessedImage {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string; // This will be the base64 data URL
  status: ProcessingStatus;
  extractedCode: string | null;
}
