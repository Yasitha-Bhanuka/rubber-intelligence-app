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

import LotMessagingScreen from '../features/dpp/screens/LotMessagingScreen';
import InvoiceExtractedFieldsScreen from '../features/dpp/screens/InvoiceExtractedFieldsScreen';
import QirExtractedFieldsScreen from '../features/dpp/screens/QirExtractedFieldsScreen';
import ExporterDppViewScreen from '../features/dpp/screens/ExporterDppViewScreen';
import LotBiddersScreen from '../features/dpp/screens/LotBiddersScreen';
import DualLayerDppScreen from '../features/dpp/screens/DualLayerDppScreen';

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
           

            {/* Marketplace — includes BuyerHistory modal per post */}
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="CreateSellingPost" component={CreateSellingPostScreen} />
            <Stack.Screen name="OrderReceipt" component={OrderReceiptScreen} />

            {/* Buyer: on-demand decryption of extracted invoice fields */}
            <Stack.Screen name="InvoiceExtractedFields" component={InvoiceExtractedFieldsScreen} />

            {/* Buyer: on-demand decryption of extracted QIR fields */}
            <Stack.Screen name="QirExtractedFields" component={QirExtractedFieldsScreen} />

            {/* Exporter: combined DPP view (invoice + QIR) — only accessible to the lot's exporter */}
            <Stack.Screen name="ExporterDppView" component={ExporterDppViewScreen} />

            {/* Secure Lot-Linked Messaging */}
            <Stack.Screen name="LotMessaging" component={LotMessagingScreen} />

            {/* Trust-Scored Interested Exporters Leaderboard (Buyer) */}
            <Stack.Screen name="LotBidders" component={LotBiddersScreen} />

            {/* Zero-Knowledge Dual-Layer DPP — client-side RSA+AES decryption */}
            <Stack.Screen name="DualLayerDpp" component={DualLayerDppScreen} />
        </Stack.Navigator>
    );
}
