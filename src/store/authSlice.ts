import { StateCreator } from 'zustand';
import { User, AuthResponse } from '../core/auth/authTypes';
import { MockAuthService } from '../core/auth/mockAuthService'; // Use Mock Service

export interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response: AuthResponse = await MockAuthService.login(credentials);
            set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Login failed' });
            throw error;
        }
    },

    logout: async () => {
        await MockAuthService.logout();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        // Logic to check token validity and fetch user profile
        try {
            const token = await MockAuthService.getCurrentUser();
            //   if (token) {
            //      set({ isAuthenticated: true });
            // Fetch user details if needed
            //   }
        } catch (e) {
            set({ isAuthenticated: false, user: null });
        }
    },
});
