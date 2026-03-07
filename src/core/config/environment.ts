import { Platform } from 'react-native';

// For Android EMULATOR: 10.0.2.2 always maps to the host machine's localhost (no adb reverse needed).
// For Android PHYSICAL DEVICE via USB (adb reverse): use 127.0.0.1 — adb reverse tcp:5001 tcp:5001
//   forwards device localhost:5001 → host localhost:5001, so IP never needs to change.
//   Run before starting: adb reverse tcp:5001 tcp:5001 && adb reverse tcp:8081 tcp:8081
const EMULATOR_IP = '10.0.2.2';

// With `adb reverse`, physical Android device must call 127.0.0.1 (forwarded to host machine).
const ADB_REVERSE_HOST = '127.0.0.1';

// Optional override for direct LAN testing without adb reverse.
// Example: EXPO_PUBLIC_DEVICE_API_HOST=192.168.1.50
const DEVICE_API_HOST = process.env.EXPO_PUBLIC_DEVICE_API_HOST;

// Set EXPO_PUBLIC_USE_PHYSICAL_DEVICE=true for USB-connected real device testing.
const USE_PHYSICAL_DEVICE = process.env.EXPO_PUBLIC_USE_PHYSICAL_DEVICE === 'true';

function getAndroidHost(): string {
    if (!USE_PHYSICAL_DEVICE) return EMULATOR_IP;
    return DEVICE_API_HOST || ADB_REVERSE_HOST;
}

function getApiUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (Platform.OS === 'android') {
        const host = getAndroidHost();
        // On Android, 'localhost' resolves to the device itself. Replace it with resolved host.
        if (envUrl) return envUrl.replace('localhost', host).replace('127.0.0.1', host);
        return `http://${host}:5001/api`;
    }
    // iOS simulator: 'localhost' correctly reaches the host machine.
    return envUrl || `http://localhost:5001/api`;
}

export const ENV = {
    API_URL: getApiUrl(),
    IS_DEV: __DEV__,
};
