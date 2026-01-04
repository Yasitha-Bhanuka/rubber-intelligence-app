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
  extractedTextSummary?: string;
}

export interface SellingPost {
  id: string;
  buyerId: string;
  buyerName: string;
  grade: string;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  dppDocumentId?: string; // Links to DppDocument.id
  status: 'Active' | 'Sold' | 'Archived';
  soldToExporterId?: string;
  createdAt: string;
}

export interface MarketplaceTransaction {
  id: string;
  postId: string;
  exporterId: string;
  exporterName: string; // Helpful for summary
  buyerId: string;
  status: 'Completed';
  offerPrice: number;
  lastUpdatedAt: string; // Kept for sorting
}



export interface UploadState {
  isLoading: boolean;
  error: string | null;
  result: DppResult | null;
}
