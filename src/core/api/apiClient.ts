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
        // Handle global errors (e.g., 401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // Trigger logout action or refresh token flow here
            console.warn('Unauthorized access - Redirecting to login');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
