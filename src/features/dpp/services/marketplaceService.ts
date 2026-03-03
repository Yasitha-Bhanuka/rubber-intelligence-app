import apiClient from '../../../core/api/apiClient';
import { SellingPost, MarketplaceTransaction, BuyerHistory, InvoiceUploadResponse } from '../types';

export const createSellingPost = async (postData: Partial<SellingPost>): Promise<SellingPost> => {
    try {
        const response = await apiClient.post<SellingPost>('/Marketplace/posts', postData);
        return response.data;
    } catch (error) {
        console.error('Create Post Error:', error);
        throw error;
    }
};

export const getSellingPosts = async (buyerId?: string): Promise<SellingPost[]> => {
    try {
        const url = buyerId ? `/Marketplace/posts?buyerId=${buyerId}` : '/Marketplace/posts';
        const response = await apiClient.get<SellingPost[]>(url);
        return response.data;
    } catch (error) {
        console.error('Fetch Posts Error:', error);
        return [];
    }
};

export const buyItem = async (postId: string): Promise<MarketplaceTransaction> => {
    try {
        const response = await apiClient.post<MarketplaceTransaction>(`/Marketplace/posts/${postId}/buy`, {});
        return response.data;
    } catch (error) {
        console.error('Buy Item Error:', error);
        throw error;
    }
};

export const getMyTransactions = async (): Promise<MarketplaceTransaction[]> => {
    try {
        const response = await apiClient.get<MarketplaceTransaction[]>('/Marketplace/transactions');
        return response.data;
    } catch (error) {
        console.error('Fetch Transactions Error:', error);
        return [];
    }
};

export const uploadInvoice = async (transactionId: string, file: any): Promise<InvoiceUploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf'
        } as any);

        const response = await apiClient.post<InvoiceUploadResponse>(
            `/Marketplace/transactions/${transactionId}/invoice`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Upload Invoice Error:', error);
        throw error;
    }
};

export const linkDppToTransaction = async (transactionId: string, dppId: string): Promise<any> => {
    try {
        const response = await apiClient.post(`/Marketplace/transactions/${transactionId}/dpp`, { dppId });
        return response.data;
    } catch (error) {
        console.error('Link DPP Error:', error);
        throw error;
    }
};

// ── BUYER HISTORY ─────────────────────────────────────────────────────

// GET /api/marketplace/buyer-history/{buyerId} (Exporter only)
export const getBuyerHistory = async (buyerId: string): Promise<BuyerHistory> => {
    const response = await apiClient.get<BuyerHistory>(`/Marketplace/buyer-history/${buyerId}`);
    return response.data;
};

export const getInvoice = async (transactionId: string): Promise<string> => {
    try {
        // We get the file as a blob/stream, but in React Native with Axios, handling binary can be tricky.
        // For simple display/download, valid URL approach or FileSystem download is better.
        // Here we assume we fetch the Blob and return a local URI or base64.
        // Simplified: Return the Direct URL if auth is handled via headers in WebView or similar.
        // BUT authenticated download often needs specific handling. 
        // Let's implement basic fetch to check access or return the endpoint for use with a Download Manager.

        // For this prototype: Assume we use expo-file-system in the UI component to download.
        // This service method might just construct the URL.
        const baseURL = apiClient.defaults.baseURL;
        return `${baseURL}/Marketplace/transactions/${transactionId}/invoice`;
    } catch (error) {
        console.error('Get Invoice Error:', error);
        throw error;
    }
};
