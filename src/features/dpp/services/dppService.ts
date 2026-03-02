import apiClient from '../../../core/api/apiClient';
import { DppUploadResponse, DppDocument, DigitalProductPassport } from '../types';

// ── POST /api/dpp/upload ─────────────────────────────────────────────
export const uploadDppDocument = async (
    fileUri: string,
    fileName: string,
    fileType: string
): Promise<DppUploadResponse> => {
    const formData = new FormData();
    formData.append('File', { uri: fileUri, name: fileName, type: fileType } as any);

    const response = await apiClient.post<DppUploadResponse>('/dpp/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// ── POST /api/dpp/{dppId}/generate-passport ──────────────────────────
export const generatePassport = async (dppId: string): Promise<DigitalProductPassport> => {
    const response = await apiClient.post<DigitalProductPassport>(
        `/dpp/${dppId}/generate-passport`
    );
    return response.data;
};

// ── GET /api/dpp/passport/{dppId} ────────────────────────────────────
export const getPassport = async (dppId: string): Promise<DigitalProductPassport> => {
    const response = await apiClient.get<DigitalProductPassport>(`/dpp/passport/${dppId}`);
    return response.data;
};

// ── GET /api/dpp/my-uploads ──────────────────────────────────────────
export const getBuyerDocuments = async (): Promise<DppDocument[]> => {
    try {
        const response = await apiClient.get<DppDocument[]>('/dpp/my-uploads');
        return response.data;
    } catch {
        return [];
    }
};

// ── GET /api/dpp/{id} ────────────────────────────────────────────────
export const getDppMetadata = async (id: string): Promise<DppDocument> => {
    const response = await apiClient.get<DppDocument>(`/dpp/${id}`);
    return response.data;
};

// ── GET /api/dpp/{id}/access (file download URL) ─────────────────────
export const getDppFileUrl = (id: string): string =>
    `${apiClient.defaults.baseURL}/dpp/${id}/access`;
