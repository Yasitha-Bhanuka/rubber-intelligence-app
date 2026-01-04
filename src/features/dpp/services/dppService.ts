import apiClient from '../../../core/api/apiClient';
import { ConfidentialityResult } from '../types/dpp.types';

// Matching Backend DTO
interface BackendClassificationResult {
    fileName: string;
    classification: string;
    confidenceScore: number;
    influentialKeywords: string[]; // List<string>
    isEncrypted: boolean;
    explanation: string;
    extractedText: string;
}

export const uploadDppDocument = async (
    fileUri: string,
    fileName: string,
    fileType: string,
    lotId: string
): Promise<ConfidentialityResult> => {
    const formData = new FormData();

    // 'File' matches generic IFormFile in Controller
    formData.append('File', {
        uri: fileUri,
        name: fileName,
        type: fileType, // e.g. 'image/jpeg' or 'application/pdf'
    } as any);

    try {
        const response = await apiClient.post<BackendClassificationResult>('/Dpp/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = response.data;
        const keywords = (data.influentialKeywords || []).map(k => k.toLowerCase());

        // Map Backend Result to Frontend ConfidentialityResult
        return {
            documentName: data.fileName,
            lotId: lotId,
            classification: data.classification.toLowerCase() === 'confidential' ? 'confidential' : 'non-confidential',
            confidenceScore: data.confidenceScore,
            sensitiveIndicators: {
                bankDetails: keywords.some(k => ['bank', 'account', 'credit', 'debit', 'invoice'].includes(k)),
                pricingInformation: keywords.some(k => ['price', 'amount', 'usd', 'lkr', 'currency', 'total'].includes(k)),
                personalIdentifiers: false, // TODO: Enhance backend to detect names/addresses explicitly
                contractTerms: keywords.some(k => ['contract', 'terms', 'agreement'].includes(k)),
            },
            encryptionApplied: data.isEncrypted,
            extractedText: data.extractedText,
            processedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('DPP Upload Error:', error);
        throw error;
    }
};
