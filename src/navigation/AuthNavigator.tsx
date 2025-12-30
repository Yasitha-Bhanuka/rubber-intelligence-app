import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { View, Text, Button } from 'react-native';

const Stack = createNativeStackNavigator();

const RegisterScreen = () => (
    // Placeholder - not in scope for this task
    <></>
);

export const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};
