import apiClient from '../../../core/api/apiClient';
import { SellingPost, MarketplaceTransaction } from '../types';

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

export const requestPurchase = async (postId: string, offerPrice: number, message: string): Promise<MarketplaceTransaction> => {
    try {
        const payload = {
            offerPrice,
            messages: message ? [{ text: message }] : []
        };
        const response = await apiClient.post<MarketplaceTransaction>(`/Marketplace/posts/${postId}/request`, payload);
        return response.data;
    } catch (error) {
        console.error('Request Purchase Error:', error);
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

export const updateTransactionStatus = async (transactionId: string, status: string, message?: string): Promise<MarketplaceTransaction> => {
    try {
        const payload = {
            status,
            messages: message ? [{ text: message }] : undefined
        };
        const response = await apiClient.put<MarketplaceTransaction>(`/Marketplace/transactions/${transactionId}`, payload);
        return response.data;
    } catch (error) {
        console.error('Update Transaction Error:', error);
        throw error;
    }
};
