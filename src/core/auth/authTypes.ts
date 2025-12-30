export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'researcher' | 'grower'; // 'grower' = farmer
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}
