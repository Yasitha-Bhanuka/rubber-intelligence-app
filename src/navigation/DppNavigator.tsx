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
import PendingRequestsScreen from '../features/dpp/screens/PendingRequestsScreen';
import ConfidentialAccessScreen from '../features/dpp/screens/ConfidentialAccessScreen';
import LotMessagingScreen from '../features/dpp/screens/LotMessagingScreen';
import InvoiceExtractedFieldsScreen from '../features/dpp/screens/InvoiceExtractedFieldsScreen';

const Stack = createNativeStackNavigator();

export default function DppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F2F2F7' }
            }}
        >
            {/* Core buyer screens */}
            <Stack.Screen name="BuyerDashboard" component={BuyerDashboardScreen} />
            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
            <Stack.Screen name="ClassificationResult" component={ClassificationResultScreen} />

            {/* DPP passport & detail */}
            <Stack.Screen name="DppPassport" component={DppPassportScreen} />
            <Stack.Screen name="DppDetail" component={DppDetailScreen} />

            {/* Exporter QR scanner — now includes hash verification result */}
            <Stack.Screen name="ExporterScanner" component={ExporterScannerScreen} />

            {/* Confidential field access */}
            <Stack.Screen name="ConfidentialAccess" component={ConfidentialAccessScreen} />

            {/* Pending access requests (Buyer) — includes ExporterContext panel */}
            <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />

            {/* Marketplace — includes BuyerHistory modal per post */}
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="CreateSellingPost" component={CreateSellingPostScreen} />
            <Stack.Screen name="OrderReceipt" component={OrderReceiptScreen} />

            {/* Buyer: on-demand decryption of extracted invoice fields */}
            <Stack.Screen name="InvoiceExtractedFields" component={InvoiceExtractedFieldsScreen} />

            {/* Secure Lot-Linked Messaging */}
            <Stack.Screen name="LotMessaging" component={LotMessagingScreen} />
        </Stack.Navigator>
    );
}
