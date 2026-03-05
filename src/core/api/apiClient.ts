import axios from 'axios';
import { ENV } from '../config/environment';
import { getToken } from '../auth/tokenStorage';

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const url: string = error.config?.url ?? '';
            // Suppress warning for auth endpoints — 401 there is expected
            // (no session, expired token, wrong credentials)
            if (!url.includes('/auth/')) {
                console.warn('Session expired - please log in again');
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
