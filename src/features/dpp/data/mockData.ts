/**
 * Mock Data for DPP System
 * Used for frontend visualization without backend calls
 */

import {
    ConfidentialityResult,
    DPPData,
    BuyerHistory,
    LotInfo,
} from '../types/dpp.types';

// Mock Confidentiality Result
export const mockConfidentialityResult: ConfidentialityResult = {
    documentName: 'Grading_Certificate_LOT2024001.pdf',
    lotId: 'LOT-2024-001',
    classification: 'confidential',
    confidenceScore: 94.5,
    sensitiveIndicators: {
        bankDetails: true,
        pricingInformation: true,
        personalIdentifiers: false,
        contractTerms: true,
    },
    encryptionApplied: true,
    processedAt: new Date().toISOString(),
};

// Mock DPP Data
export const mockDPPData: DPPData = {
    dppId: 'DPP-SL-2024-00147',
    lotId: 'LOT-2024-001',
    status: 'verified',

    // Lot Information
    rubberType: 'RSS1',
    batchDate: '2024-01-03',

    // Origin & Processing
    buyerReferenceId: 'BYR-***-892',
    collectionLocation: 'Kalutara, Sri Lanka',
    processingMethod: 'Traditional Smoking',

    // Quality Summary
    finalGrade: 'Grade A',
    finalWeight: 1250.5,
    moisturePercentage: 0.45,
    qualityRemark: 'Premium quality rubber sheet with excellent elasticity',

    // AI Verification Results
    confidentialityStatus: 'confidential',
    encryptionStatus: true,
    authenticityResult: 'authentic',
    authenticityScore: 96.8,

    // Timestamps
    createdAt: '2024-01-03T10:30:00Z',
    lastVerifiedAt: '2024-01-03T14:45:00Z',
};

// Mock Buyer History
export const mockBuyerHistory: BuyerHistory = {
    buyerReferenceId: 'BYR-***-892',
    totalLotsSubmitted: 47,
    acceptedCount: 43,
    rejectedCount: 4,
    averageAuthenticityScore: 92.3,
    riskIndicator: 'low',
    flagged: false,
    lastTransactionDate: '2024-01-03',
};

// Mock Recent Lots for Dashboard
export const mockRecentLots: Array<LotInfo & { status: string }> = [
    {
        lotId: 'LOT-2024-001',
        quantity: 500,
        rubberType: 'RSS1',
        collectionDate: '2024-01-03',
        collectionLocation: 'Kalutara, Sri Lanka',
        createdAt: '2024-01-03T08:00:00Z',
        status: 'verified',
    },
    {
        lotId: 'LOT-2024-002',
        quantity: 320,
        rubberType: 'RSS2',
        collectionDate: '2024-01-02',
        collectionLocation: 'Ratnapura, Sri Lanka',
        createdAt: '2024-01-02T14:30:00Z',
        status: 'pending',
    },
    {
        lotId: 'LOT-2024-003',
        quantity: 780,
        rubberType: 'RSS1',
        collectionDate: '2024-01-01',
        collectionLocation: 'Galle, Sri Lanka',
        createdAt: '2024-01-01T09:15:00Z',
        status: 'in_transit',
    },
];

// Mock Statistics for Dashboard
export const mockDashboardStats = {
    buyer: {
        totalLots: 12,
        pendingVerification: 3,
        verified: 8,
        rejected: 1,
    },
    exporter: {
        pendingReview: 5,
        accepted: 42,
        rejected: 3,
        flaggedBuyers: 1,
    },
};
