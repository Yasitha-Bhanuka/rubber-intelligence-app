/**
 * DPP (Digital Product Passport) Type Definitions
 * For Secure Rubber Supply Chain System
 */

// User Role Types
export type UserRole = 'buyer' | 'exporter';

// Rubber Type Options
export type RubberType = 'RSS1' | 'RSS2' | 'RSS3';

// Lot Status
export type LotStatus = 'pending' | 'verified' | 'rejected' | 'in_transit' | 'delivered';

// Confidentiality Classification
export type ConfidentialityLevel = 'confidential' | 'non-confidential';

// Risk Level for Buyer History
export type RiskLevel = 'low' | 'medium' | 'high';

// DPP Verification Status
export type VerificationStatus = 'verified' | 'suspicious' | 'pending';

// Lot Information Interface
export interface LotInfo {
    lotId: string;
    quantity: number;
    rubberType: RubberType;
    collectionDate: string;
    collectionLocation: string;
    createdAt: string;
}

// Document Information
export interface DocumentInfo {
    id: string;
    name: string;
    type: 'grading_certificate' | 'weighbridge_receipt' | 'buying_receipt';
    fileName: string;
    uri?: string;
    mimeType?: string;
    uploadedAt: string;
}

// Confidentiality Result
export interface ConfidentialityResult {
    documentName: string;
    lotId: string;
    classification: ConfidentialityLevel;
    confidenceScore: number;
    sensitiveIndicators: {
        bankDetails: boolean;
        pricingInformation: boolean;
        personalIdentifiers: boolean;
        contractTerms: boolean;
    };
    encryptionApplied: boolean;
    extractedText?: string;
    processedAt: string;
}

// QR/NFC Tag Assignment
export interface TagAssignment {
    lotId: string;
    qrCodeData: string;
    nfcTagId: string;
    assignedAt: string;
}

// Digital Product Passport Data
export interface DPPData {
    dppId: string;
    lotId: string;
    status: VerificationStatus;

    // Lot Information
    rubberType: RubberType;
    batchDate: string;

    // Origin & Processing
    buyerReferenceId: string;
    collectionLocation: string;
    processingMethod: string;

    // Quality Summary
    finalGrade: string;
    finalWeight: number;
    moisturePercentage: number;
    qualityRemark: string;

    // AI Verification Results
    confidentialityStatus: ConfidentialityLevel;
    encryptionStatus: boolean;
    authenticityResult: 'authentic' | 'suspicious' | 'fraudulent';
    authenticityScore: number;

    // Timestamps
    createdAt: string;
    lastVerifiedAt: string;
}

// Buyer History
export interface BuyerHistory {
    buyerReferenceId: string;
    totalLotsSubmitted: number;
    acceptedCount: number;
    rejectedCount: number;
    averageAuthenticityScore: number;
    riskIndicator: RiskLevel;
    flagged: boolean;
    lastTransactionDate: string;
}

// Decision Action Types
export type DecisionAction = 'accept' | 'reject' | 'request_reinspection';

// Navigation Param List for DPP Stack
export type DPPStackParamList = {
    DPPHome: undefined;
    CreateLot: undefined;
    UploadDocuments: { lotInfo: LotInfo };
    ConfidentialityResult: { lotInfo: LotInfo; documents: DocumentInfo[]; analysisResults?: ConfidentialityResult[] };
    TagAssignment: { lotInfo: LotInfo; confidentialityResult: ConfidentialityResult };
    Scan: undefined;
    DPPView: { dppData?: DPPData };
    BuyerHistory: { buyerReferenceId: string };
};
