export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'researcher' | 'grower';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
