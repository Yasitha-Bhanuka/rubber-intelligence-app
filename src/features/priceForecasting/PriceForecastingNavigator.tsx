
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from './screens/DashboardScreen';
import { PriceForecastingScreen } from './screens/PriceForecastingScreen';
import { ReportScreen } from './screens/ReportScreen';
import { AuctionBiddingScreen } from './screens/AuctionBiddingScreen';
import { PlaceBidConfirmScreen } from './screens/PlaceBidConfirmScreen';
import { CreateLotScreen } from './screens/CreateLotScreen';
import { TraceabilityScreen } from './screens/TraceabilityScreen';
import { MyAuctionsScreen } from './screens/MyAuctionsScreen';

const Stack = createNativeStackNavigator();

export const PriceForecastingNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="PredictionForm" component={PriceForecastingScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="AuctionBidding" component={AuctionBiddingScreen} />
            <Stack.Screen name="PlaceBid" component={PlaceBidConfirmScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
            <Stack.Screen name="CreateLot" component={CreateLotScreen} />
            <Stack.Screen name="Traceability" component={TraceabilityScreen} />
            <Stack.Screen name="MyAuctions" component={MyAuctionsScreen} />
        </Stack.Navigator>
    );
};
