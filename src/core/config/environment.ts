import { Platform } from 'react-native';

// For Android EMULATOR: 10.0.2.2 always maps to the host machine's localhost (no adb reverse needed).
// For Android PHYSICAL DEVICE via USB (adb reverse): use 127.0.0.1 — adb reverse tcp:5001 tcp:5001
//   forwards device localhost:5001 → host localhost:5001, so IP never needs to change.
//   Run before starting: adb reverse tcp:5001 tcp:5001 && adb reverse tcp:8081 tcp:8081
const EMULATOR_IP = '10.0.2.2';
const PHYSICAL_DEVICE_IP = '10.167.153.253'; // Works with adb reverse — no WiFi IP needed.

// Set to true when testing on a physical device via USB (adb reverse), false for emulator.
const USE_PHYSICAL_DEVICE = true;

const MACHINE_IP = USE_PHYSICAL_DEVICE ? PHYSICAL_DEVICE_IP : EMULATOR_IP;

function getApiUrl(): string {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (Platform.OS === 'android') {
        // On Android, 'localhost' resolves to the device itself — must use the machine's IP.
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
