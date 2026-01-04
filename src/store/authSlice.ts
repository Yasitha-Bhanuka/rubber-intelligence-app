import { StateCreator } from 'zustand';
import { User, AuthResponse } from '../core/auth/authTypes';
import { AuthService } from '../core/auth/authService';

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
            const response: AuthResponse = await AuthService.login(credentials);
            set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const msg = error.response?.data || error.message || 'Login failed';
            set({ isLoading: false, error: typeof msg === 'string' ? msg : 'Login failed' });
            throw error;
        }
    },

    logout: async () => {
        await AuthService.logout();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const user = await AuthService.getCurrentUser();
            if (user) {
                set({ isAuthenticated: true, user, isLoading: false });
            } else {
                set({ isAuthenticated: false, user: null, isLoading: false });
            }
        } catch (e) {
            // Backend unavailable or user not authenticated
            console.log('Auth check failed (backend may be unavailable):', e);
            set({ isAuthenticated: false, user: null, isLoading: false });
        }
    },
});
