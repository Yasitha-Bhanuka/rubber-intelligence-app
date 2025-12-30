import { AuthResponse, LoginCredentials, User } from './authTypes';
import { saveToken, removeToken } from './tokenStorage';

// Mock Users
const MOCK_USERS: Record<string, User> = {
    'farmer@test.com': {
        id: 'u_001',
        email: 'farmer@test.com',
        name: 'John Planter',
        role: 'grower',
    },
    'admin@test.com': {
        id: 'u_002',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
    },
    'researcher@test.com': {
        id: 'u_003',
        email: 'researcher@test.com',
        name: 'Dr. Researcher',
        role: 'researcher'
    }
};

export const MockAuthService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const user = MOCK_USERS[credentials.email];

                if (user && credentials.password === 'pass123') {
                    const fakeToken = `mock_token_${Date.now()}_${user.role}`;
                    await saveToken(fakeToken);
                    resolve({
                        token: fakeToken,
                        user: user,
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000); // Simulate 1s network delay
        });
    },

    logout: async (): Promise<void> => {
        await removeToken();
    },

    getCurrentUser: async (): Promise<User | null> => {
        // In a real app, we'd validate the token with the backend. 
        // Here we just return null to force re-login on app restart for testing, 
        // or we could mock persistence if needed.
        return null;
    }
};
