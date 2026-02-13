import { Platform } from 'react-native';

const localhost = Platform.OS === 'android' ? '192.168.4.113' : 'localhost';

export const ENV = {
    // 192.168.4.113 is your local machine IP. 
    // This allows both Emulator AND Physical Device to connect.
    API_URL: process.env.EXPO_PUBLIC_API_URL || `http://${localhost}:5001/api`,
    IS_DEV: __DEV__,
};
