import apiClient from '../../../core/api/apiClient';
import { DppUploadResponse, DppDocument, DigitalProductPassport, AccessRequest, ConfidentialAccessResponse, DppVerificationResponse, ExporterContext } from '../types';

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

// ── CONTROLLED ACCESS ─────────────────────────────────────────────────

// POST /api/dpp/request-confidential/{lotId} (Exporter only)
export const requestConfidentialAccess = async (
    lotId: string
): Promise<{ requestId: string; status: string }> => {
    const response = await apiClient.post(`/dpp/request-confidential/${lotId}`);
    return response.data;
};

// GET /api/dpp/pending-requests (Buyer only)
export const getPendingAccessRequests = async (): Promise<AccessRequest[]> => {
    const response = await apiClient.get<AccessRequest[]>('/dpp/pending-requests');
    return response.data;
};

// POST /api/dpp/approve-confidential/{requestId} (Buyer only)
export const approveAccessRequest = async (
    requestId: string
): Promise<{ requestId: string; status: string }> => {
    const response = await apiClient.post(`/dpp/approve-confidential/${requestId}`);
    return response.data;
};

// POST /api/dpp/reject-confidential/{requestId} (Buyer only)
export const rejectAccessRequest = async (
    requestId: string
): Promise<{ requestId: string; status: string }> => {
    const response = await apiClient.post(`/dpp/reject-confidential/${requestId}`);
    return response.data;
};

// GET /api/dpp/confidential/{lotId} (Exporter only — requires approved request)
export const getConfidentialFields = async (
    lotId: string
): Promise<ConfidentialAccessResponse> => {
    const response = await apiClient.get<ConfidentialAccessResponse>(`/dpp/confidential/${lotId}`);
    return response.data;
};

// GET /api/dpp/my-requests (Exporter only — returns all access requests by this exporter)
export const getMyAccessRequests = async (): Promise<{ id: string; lotId: string; status: string; requestedAt: string; approvedAt?: string }[]> => {
    const response = await apiClient.get(`/dpp/my-requests`);
    return response.data;
};

// ── HASH VERIFICATION ─────────────────────────────────────────────────

// GET /api/dpp/verify/{lotId} (Buyer, Exporter)
export const verifyDpp = async (lotId: string): Promise<DppVerificationResponse> => {
    const response = await apiClient.get<DppVerificationResponse>(`/dpp/verify/${lotId}`);
    return response.data;
};

// ── EXPORTER CONTEXT ──────────────────────────────────────────────────

// GET /api/dpp/exporter-context/{exporterId} (Buyer only)
export const getExporterContext = async (exporterId: string): Promise<ExporterContext> => {
    const response = await apiClient.get<ExporterContext>(`/dpp/exporter-context/${exporterId}`);
    return response.data;
};
