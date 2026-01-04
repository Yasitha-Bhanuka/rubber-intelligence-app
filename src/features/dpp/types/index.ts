export interface DppResult {
  id?: string; // Optional because legacy results might not have it immediately
  fileName: string;
  classification: 'CONFIDENTIAL' | 'NON_CONFIDENTIAL';
  confidenceScore: number;
  confidenceLevel: string;
  systemAction: string;
  explanation: string;
  influentialKeywords: string[];
  isEncrypted: boolean;
  extractedText?: string;
  qrCodeData?: string; // For frontend generation
}

export interface DppDocument {
  id: string;
  originalFileName: string;
  classification: string;
  isEncrypted: boolean;
  uploadedAt: string;
}

export interface UploadState {
  isLoading: boolean;
  error: string | null;
  result: DppResult | null;
}
