
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from './screens/DashboardScreen';
import { PriceForecastingScreen } from './screens/PriceForecastingScreen';
import { ReportScreen } from './screens/ReportScreen';

const Stack = createNativeStackNavigator();

export const PriceForecastingNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="PredictionForm" component={PriceForecastingScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
        </Stack.Navigator>
    );
};
