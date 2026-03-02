import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DocumentUploadScreen from '../features/dpp/screens/DocumentUploadScreen';
import ClassificationResultScreen from '../features/dpp/screens/ClassificationResultScreen';
import BuyerDashboardScreen from '../features/dpp/screens/BuyerDashboardScreen';
import ExporterScannerScreen from '../features/dpp/screens/ExporterScannerScreen';
import DppDetailScreen from '../features/dpp/screens/DppDetailScreen';
import DppPassportScreen from '../features/dpp/screens/DppPassportScreen';
import CreateSellingPostScreen from '../features/dpp/screens/CreateSellingPostScreen';
import MarketplaceScreen from '../features/dpp/screens/MarketplaceScreen';
import OrderReceiptScreen from '../features/dpp/screens/OrderReceiptScreen';

const Stack = createNativeStackNavigator();

export default function DppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F2F2F7' }
            }}
        >
            {/* Logic to determine initial route based on Role could be handled here or in MainNavigator. 
                For now we register all, and entry point can be decided by role. */}
            <Stack.Screen name="BuyerDashboard" component={BuyerDashboardScreen} />
            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
            <Stack.Screen name="ClassificationResult" component={ClassificationResultScreen} />

            <Stack.Screen name="ExporterScanner" component={ExporterScannerScreen} />
            <Stack.Screen name="DppDetail" component={DppDetailScreen} />
            <Stack.Screen name="DppPassport" component={DppPassportScreen} />

            <Stack.Screen name="CreateSellingPost" component={CreateSellingPostScreen} />
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="OrderReceipt" component={OrderReceiptScreen} />
        </Stack.Navigator>
    );
}
