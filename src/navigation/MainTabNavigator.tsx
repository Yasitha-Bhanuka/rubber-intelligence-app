import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../shared/styles/colors';

const Tab = createBottomTabNavigator();

import { DiseaseNavigator } from '../features/diseaseDetection/DiseaseNavigator';
import { PriceForecastingNavigator } from '../features/priceForecasting/PriceForecastingNavigator';
import { GradingNavigator } from './GradingNavigator';

// Placeholder screens for features
const MonitoringScreen = () => <View style={styles.center}><Text>Monitoring Dashboard</Text></View>;
const DPPScreen = () => <View style={styles.center}><Text>Digital Product Passport</Text></View>;
const ChatbotScreen = () => <View style={styles.center}><Text>AI Chatbot</Text></View>;

export const MainTabNavigator = () => {
    const { user, logout } = useStore();
    const role = user?.role;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Grading') iconName = focused ? 'leaf' : 'leaf-outline';
                    else if (route.name === 'Disease') iconName = focused ? 'medkit' : 'medkit-outline';
                    else if (route.name === 'Price') iconName = focused ? 'cash' : 'cash-outline';
                    else if (route.name === 'Monitoring') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    else if (route.name === 'DPP') iconName = focused ? 'qr-code' : 'qr-code-outline';
                    else if (route.name === 'Chatbot') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerRight: () => (
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color={colors.error}
                        style={{ marginRight: 15 }}
                        onPress={() => logout()}
                    />
                )
            })}
        >
            {/* Farmer Routes */}
            {role === 'farmer' && (
                <>
                    <Tab.Screen name="Grading" component={GradingNavigator} />
                    <Tab.Screen name="Disease" component={DiseaseNavigator} />
                    <Tab.Screen name="Price" component={PriceForecastingNavigator} options={{ headerShown: false }} />
                </>
            )}

            {/* Admin / Researcher Routes */}
            {(role === 'admin' || role === 'researcher') && (
                <>
                    <Tab.Screen name="Monitoring" component={MonitoringScreen} />
                    <Tab.Screen name="DPP" component={DPPScreen} />
                </>
            )}

            {/* Common Routes */}
            <Tab.Screen name="Chatbot" component={ChatbotScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
