import { Platform } from 'react-native';

const MACHINE_IP = '192.168.4.92';
const LOCALHOST_REGEX = /\b(localhost|127\.0\.0\.1)\b/i;
const ANDROID_EMULATOR_HOST = '10.0.2.2';

function buildApiConfig() {
    const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

    const primaryUrl =
        envUrl ||
        (Platform.OS === 'android'
            ? `http://${MACHINE_IP}:5001/api`
            : 'http://localhost:5001/api');

    const fallbackUrls = new Set<string>();

    if (Platform.OS === 'android') {
        if (LOCALHOST_REGEX.test(primaryUrl)) {
            fallbackUrls.add(primaryUrl.replace(LOCALHOST_REGEX, ANDROID_EMULATOR_HOST));
            fallbackUrls.add(primaryUrl.replace(LOCALHOST_REGEX, MACHINE_IP));
        }

        if (primaryUrl.includes(ANDROID_EMULATOR_HOST)) {
            fallbackUrls.add(primaryUrl.replace(ANDROID_EMULATOR_HOST, 'localhost'));
            fallbackUrls.add(primaryUrl.replace(ANDROID_EMULATOR_HOST, MACHINE_IP));
        }

        if (primaryUrl.includes(MACHINE_IP)) {
            fallbackUrls.add(primaryUrl.replace(MACHINE_IP, 'localhost'));
            fallbackUrls.add(primaryUrl.replace(MACHINE_IP, ANDROID_EMULATOR_HOST));
        }
    }

    fallbackUrls.delete(primaryUrl);

    return {
        apiUrl: primaryUrl,
        fallbackUrls: Array.from(fallbackUrls),
    };
}

const { apiUrl, fallbackUrls } = buildApiConfig();

export const ENV = {
    API_URL: apiUrl,
    API_FALLBACK_URLS: fallbackUrls,
    IS_DEV: __DEV__,
};
