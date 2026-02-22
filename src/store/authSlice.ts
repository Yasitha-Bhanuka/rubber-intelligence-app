import { StateCreator } from 'zustand';
import { User, AuthResponse, RegisterCredentials } from '../core/auth/authTypes';
import { AuthService } from '../core/auth/authService';

export interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: any) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
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

    register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
            const response: AuthResponse = await AuthService.register(credentials);
            set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const msg = error.response?.data || error.message || 'Registration failed';
            set({ isLoading: false, error: typeof msg === 'string' ? msg : 'Registration failed' });
            throw error;
        }
    },

    logout: async () => {
        await AuthService.logout();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        try {
            const user = await AuthService.getCurrentUser();
            if (user) {
                set({ isAuthenticated: true, user });
            }
        } catch (e) {
            set({ isAuthenticated: false, user: null });
        }
    },
});

