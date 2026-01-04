export const ENV = {
    // Use 10.0.2.2 for Android Emulator to access localhost
    // Use localhost for iOS Simulator
    // Use 10.0.2.2 for Android Emulator to access localhost
    // Use localhost for iOS Simulator
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api',
    IS_DEV: __DEV__,
};

