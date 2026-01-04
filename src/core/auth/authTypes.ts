export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'researcher' | 'farmer' | 'buyer' | 'exporter'; // standardized to farmer
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
