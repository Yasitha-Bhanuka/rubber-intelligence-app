import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_auth_token';

export const saveToken = async (token: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        console.log('Token saved securely.');
    } catch (e) {
        console.error('Failed to save token:', e);
    }
};

export const getToken = async (): Promise<string | null> => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        console.log('Token retrieval attempt. Found:', !!token);
        return token;
    } catch (e) {
        console.error('Failed to get token:', e);
        return null;
    }
};

export const removeToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
};
