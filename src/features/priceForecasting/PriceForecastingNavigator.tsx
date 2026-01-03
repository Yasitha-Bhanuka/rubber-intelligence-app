
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from './screens/DashboardScreen';
import { PriceForecastingScreen } from './screens/PriceForecastingScreen';
import { ReportScreen } from './screens/ReportScreen';
import { AuctionBiddingScreen } from './screens/AuctionBiddingScreen';
import { PlaceBidConfirmScreen } from './screens/PlaceBidConfirmScreen';

const Stack = createNativeStackNavigator();

export const PriceForecastingNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="PredictionForm" component={PriceForecastingScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="AuctionBidding" component={AuctionBiddingScreen} />
            <Stack.Screen name="PlaceBid" component={PlaceBidConfirmScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
        </Stack.Navigator>
    );
};
