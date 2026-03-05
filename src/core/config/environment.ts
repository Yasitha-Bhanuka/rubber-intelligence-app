import { Platform } from 'react-native';

// Your machine's current WiFi IP — update this if you change networks.
// Find it with: ipconfig (Windows) → look for "Wireless LAN adapter WiFi" → IPv4 Address.

const MACHINE_IP = '10.148.43.12';

function getApiUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (Platform.OS === 'android') {
        // On Android, 'localhost' resolves to the device itself — must use the machine's LAN IP.
        if (envUrl) return envUrl.replace('localhost', MACHINE_IP);
        return `http://${MACHINE_IP}:5001/api`;
    }
    // iOS simulator: 'localhost' correctly reaches the host machine.
    return envUrl || `http://localhost:5001/api`;
}

export const ENV = {
    API_URL: getApiUrl(),
    IS_DEV: __DEV__,
};
