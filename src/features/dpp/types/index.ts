// ── Upload response (POST /api/dpp/upload) ──────────────────────────
export interface DppUploadResponse {
  dppId: string;
  fieldsExtracted: number;
  fields: DppFieldSummary[];
  classification: DppClassification;
  supportedFormats: string[];
}

export interface DppFieldSummary {
  fieldName: string;
  isConfidential: boolean;
  confidenceScore: number;
  hasValue: boolean;
  /** Plain value for non-confidential fields; null/undefined for encrypted ones */
  extractedValue?: string | null;
}

export interface DppClassification {
  classification: 'CONFIDENTIAL' | 'NON_CONFIDENTIAL';
  confidenceScore: number;
  confidenceLevel: string;
  systemAction: string;
  explanation: string;
  influentialKeywords: string[];
  /** Total fields Gemini extracted from the document */
  geminiExtractedCount: number;
  publicFieldCount: number;
  confidentialFieldCount: number;
}

// ── Digital Product Passport (GET /api/dpp/passport/{dppId}) ─────────
export interface DigitalProductPassport {
  id: string;
  lotId: string;
  rubberGrade: string;
  quantity: number;
  dispatchDetails: string;
  confidentialDataExists: boolean;
  /** GENERATED | VERIFIED | REINSPECTION_REQUESTED | ACCEPTED | REJECTED */
  lifecycleState: string;
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
  status: 'Active' | 'Sold' | 'Archived' | 'AVAILABLE' | 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'REINSPECTION';
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

// ── Controlled Access ─────────────────────────────────────────────────
export interface AccessRequest {
  id: string;
  lotId: string;
  exporterId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export interface ConfidentialField {
  fieldName: string;
  decryptedValue: string;
}

export interface ConfidentialAccessResponse {
  lotId: string;
  accessGrantedAt: string;
  fields: ConfidentialField[];
}

// ── DPP Hash Verification (GET /api/dpp/verify/{lotId}) ───────────────
export interface DppVerificationResponse {
  isValid: boolean;
  recalculatedHash: string;
  storedHash: string;
}

// ── Exporter Context (GET /api/dpp/exporter-context/{exporterId}) ──────
export interface ExporterContext {
  name: string;
  country: string | null;
  organizationType: string | null;
  platformTenureMonths: number;
  totalCollaborationsWithBuyer: number;
  lastCollaborationDate: string | null;
  isVerified: boolean;
}

// ── Buyer History (GET /api/marketplace/buyer-history/{buyerId}) ────────
export interface BuyerHistory {
  buyerId: string;
  totalLots: number;
  accepted: number;
  rejected: number;
  reInspections: number;
  averageQuality: number;
  verificationConsistency: 'High' | 'Medium' | 'Low';
  lastActivityDate: string | null;
}

// ── Lot-Linked Messaging ───────────────────────────────────────────────
export interface MessageDto {
  id: string;
  lotId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  isConfidential: boolean;
}
