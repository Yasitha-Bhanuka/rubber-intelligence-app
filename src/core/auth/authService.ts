import apiClient from '../api/apiClient';
import { LoginCredentials, RegisterCredentials, AuthResponse } from './authTypes';
import { saveToken, removeToken } from './tokenStorage';

export const AuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        if (response.data && response.data.token) {
            await saveToken(response.data.token);
        }
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
        if (response.data && response.data.token) {
            await saveToken(response.data.token);
        }
        return response.data;
    },

    logout: async (): Promise<void> => {
        await removeToken();
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

