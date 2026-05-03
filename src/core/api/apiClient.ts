import axios from 'axios';
import { ENV } from '../config/environment';
import { getToken } from '../auth/tokenStorage';

type RetryState = {
    count: number;
    maxRetries: number;
    delay: number;
    triedFallbackUrls: string[];
};

const apiClient = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config as any;

        if (error.response?.status === 401) {
            const url: string = config?.url ?? '';
            if (!url.includes('/auth/')) {
                console.warn('Session expired - please log in again');
            }
            return Promise.reject(error);
        }

        if (!config) {
            return Promise.reject(error);
        }

        if (!config.retry) {
            config.retry = {
                count: 0,
                maxRetries: 2,
                delay: 1000,
                triedFallbackUrls: [],
            } satisfies RetryState;
        }

        const retry = config.retry as RetryState;
        const isNetworkError =
            !error.response || (error.response.status >= 500 && error.response.status <= 599);

        if (isNetworkError) {
            const currentBaseUrl = config.baseURL || apiClient.defaults.baseURL || ENV.API_URL;
            const fallbackUrl = ENV.API_FALLBACK_URLS.find(
                (url) => url !== currentBaseUrl && !retry.triedFallbackUrls.includes(url)
            );

            if (fallbackUrl) {
                retry.triedFallbackUrls.push(fallbackUrl);
                config.baseURL = fallbackUrl;
                apiClient.defaults.baseURL = fallbackUrl;

                console.warn(`[Axios] Network error. Switching API base URL to ${fallbackUrl} and retrying...`);

                await new Promise((resolve) => setTimeout(resolve, retry.delay));
                return apiClient(config);
            }
        }

        if (isNetworkError && retry.count < retry.maxRetries) {
            retry.count += 1;
            console.log(
                `[Axios] Transient error detected. Retrying request (${retry.count}/${retry.maxRetries})...`
            );

            await new Promise((resolve) => setTimeout(resolve, retry.delay));
            return apiClient(config);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
