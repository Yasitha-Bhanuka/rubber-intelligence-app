import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../shared/styles/colors';
import { NotificationBell } from '../shared/components/NotificationBell';
import { NotificationPanel } from '../shared/components/NotificationPanel';
import { AlertItem } from '../features/diseaseDetection/services/alertService';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

import { DiseaseNavigator } from '../features/diseaseDetection/DiseaseNavigator';
import { PriceForecastingNavigator } from '../features/priceForecasting/PriceForecastingNavigator';
import { GradingNavigator } from './GradingNavigator';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { UserManagementScreen } from '../features/admin/UserManagementScreen';

import DppNavigator from './DppNavigator';

// Placeholder screens for features
const MonitoringScreen = () => <View style={styles.center}><Text>Monitoring Dashboard</Text></View>;
const ChatbotScreen = () => <View style={styles.center}><Text>AI Chatbot</Text></View>;

export const MainTabNavigator = () => {
    const { user } = useStore();
    const role = user?.role;
    const [notifVisible, setNotifVisible] = useState(false);
    const navigation = useNavigation<any>();

    const handleViewOnMap = (alert: AlertItem) => {
        // Navigate to Disease tab → DiseaseMap with coordinates
        navigation.navigate('Disease', {
            screen: 'DiseaseMap',
            params: {
                latitude: alert.latitude,
                longitude: alert.longitude,
                diseaseName: alert.diseaseName,
            },
        });
    };

    const HeaderBell = () => (
        <NotificationBell onPress={() => setNotifVisible(true)} />
    );

    return (
        <>
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
                        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                        else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: 'gray',
                    // Show notification bell in header for farmer screens
                    headerRight: role === 'farmer' ? () => <HeaderBell /> : undefined,
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

                {/* Admin / Researcher / DPP Roles */}
                {(role === 'admin' || role === 'researcher' || role === 'buyer' || role === 'exporter') && (
                    <>
                        {(role === 'admin' || role === 'researcher') && (
                            <Tab.Screen name="Monitoring" component={MonitoringScreen} />
                        )}
                        <Tab.Screen
                            name="DPP"
                            component={DppNavigator}
                            options={{ headerShown: false }}
                            initialParams={role === 'exporter' ? { screen: 'Marketplace' } : undefined}
                        />
                    </>
                )}

                {/* Admin-only: User Management */}
                {role === 'admin' && (
                    <Tab.Screen
                        name="Users"
                        component={UserManagementScreen}
                        options={{ headerShown: false }}
                    />
                )}

                {/* Common Routes */}
                <Tab.Screen name="Chatbot" component={ChatbotScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            </Tab.Navigator>

            {/* Notification Panel Overlay (renders above everything) */}
            <NotificationPanel
                visible={notifVisible}
                onClose={() => setNotifVisible(false)}
                onViewOnMap={handleViewOnMap}
            />
        </>
    );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});


