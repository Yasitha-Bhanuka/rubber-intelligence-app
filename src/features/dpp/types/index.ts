export interface DppResult {
  fileName: string;
  classification: 'CONFIDENTIAL' | 'NON_CONFIDENTIAL';
  confidenceScore: number;
  confidenceLevel: string;
  systemAction: string;
  explanation: string;
  influentialKeywords: string[];
  isEncrypted: boolean;
  extractedText?: string;
}

export interface UploadState {
  isLoading: boolean;
  error: string | null;
  result: DppResult | null;
}
