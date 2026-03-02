// ── Upload response (POST /api/dpp/upload) ──────────────────────────
export interface DppUploadResponse {
  dppId: string;
  fieldsExtracted: number;
  fields: DppFieldSummary[];
  classification: DppClassification;
}

export interface DppFieldSummary {
  fieldName: string;
  isConfidential: boolean;
  confidenceScore: number;
  hasValue: boolean;
}

export interface DppClassification {
  classification: 'CONFIDENTIAL' | 'NON_CONFIDENTIAL';
  confidenceScore: number;
  confidenceLevel: string;
  systemAction: string;
  explanation: string;
  influentialKeywords: string[];
  // extractedText intentionally excluded — may contain confidential values
}

// ── Digital Product Passport (GET /api/dpp/passport/{dppId}) ─────────
export interface DigitalProductPassport {
  id: string;
  lotId: string;
  rubberGrade: string;
  quantity: number;
  dispatchDetails: string;
  confidentialDataExists: boolean;
  dppHash: string;
  createdAt: string;
}

// ── DppDocument (GET /api/dpp/my-uploads) ────────────────────────────
export interface DppDocument {
  id: string;
  originalFileName: string;
  classification: string;
  confidenceScore: number;
  uploadedAt: string;
  uploadedBy: string;
  extractedTextSummary?: string;
  detectedKeywords: string[];
  contentType: string;
}

// ── Marketplace ───────────────────────────────────────────────────────
export interface SellingPost {
  id: string;
  buyerId: string;
  buyerName: string;
  grade: string;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  dppDocumentId?: string;
  status: 'Active' | 'Sold' | 'Archived';
  soldToExporterId?: string;
  createdAt: string;
}

export interface MarketplaceTransaction {
  id: string;
  postId: string;
  exporterId: string;
  exporterName: string;
  buyerId: string;
  status: 'PendingInvoice' | 'InvoiceUploaded' | 'Completed';
  offerPrice: number;
  lastUpdatedAt: string;
  dppInvoicePath?: string;
  dppClassification?: string;
  encryptionMetadata?: string;
  dppDocumentId?: string;
}

export interface UploadState {
  isLoading: boolean;
  error: string | null;
  result: DppUploadResponse | null;
}
