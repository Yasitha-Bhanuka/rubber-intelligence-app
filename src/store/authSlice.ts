import { StateCreator } from 'zustand';
import { User, AuthResponse } from '../core/auth/authTypes';
import { AuthService } from '../core/auth/authService';

export interface AuthSlice {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (credentials) => {
        set({ isLoading: true });
        try {
            const response: AuthResponse = await AuthService.login(credentials);
            set({ user: response.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        await AuthService.logout();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        // Logic to check token validity and fetch user profile
        try {
            const token = await AuthService.getCurrentUser();
            //   if (token) {
            //      set({ isAuthenticated: true });
            // Fetch user details if needed
            //   }
        } catch (e) {
            set({ isAuthenticated: false, user: null });
        }
    },
});
