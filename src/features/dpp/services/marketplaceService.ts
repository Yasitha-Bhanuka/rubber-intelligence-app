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
