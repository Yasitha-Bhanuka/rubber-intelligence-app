import apiClient from '../api/apiClient';
import { LoginCredentials, AuthResponse } from './authTypes';
import { saveToken, removeToken } from './tokenStorage';

export const AuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        console.log('Login response status:', response.status);
        if (response.data && response.data.token) {
            console.log('Token received from backend:', response.data.token.substring(0, 10) + '...');
            await saveToken(response.data.token);
        } else {
            console.error('No token in login response!', response.data);
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
