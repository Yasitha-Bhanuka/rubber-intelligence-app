import apiClient from '../api/apiClient';
import { LoginCredentials, AuthResponse } from './authTypes';
import { saveToken, removeToken } from './tokenStorage';

export const AuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        if (response.data && response.data.token) {
            await saveToken(response.data.token);
        }
        return response.data;
    },

    logout: async (): Promise<void> => {
        await removeToken();
        // Optional: Call backend to invalidate token
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
