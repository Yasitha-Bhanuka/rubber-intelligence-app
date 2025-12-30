import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ActivityIndicator, View } from 'react-native';

export const RootNavigator = () => {
    const { isAuthenticated, isLoading, checkAuth } = useStore();

    React.useEffect(() => {
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};
