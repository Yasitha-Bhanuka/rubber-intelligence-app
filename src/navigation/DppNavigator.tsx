import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DPPStackParamList } from '../features/dpp/types/dpp.types';

// Import Screens
import DPPHomeScreen from '../features/dpp/screens/DPPHomeScreen';
import CreateLotScreen from '../features/dpp/screens/CreateLotScreen';
import UploadDocumentsScreen from '../features/dpp/screens/UploadDocumentsScreen';
import ConfidentialityResultScreen from '../features/dpp/screens/ConfidentialityResultScreen';
import TagAssignmentScreen from '../features/dpp/screens/TagAssignmentScreen';
import ScanScreen from '../features/dpp/screens/ScanScreen';
import DPPViewScreen from '../features/dpp/screens/DPPViewScreen';
import BuyerHistoryScreen from '../features/dpp/screens/BuyerHistoryScreen';

const Stack = createNativeStackNavigator<DPPStackParamList>();

export default function DppNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="DPPHome"
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F2F2F7' }
            }}
        >
            <Stack.Screen name="DPPHome" component={DPPHomeScreen} />

            {/* Buyer Flow */}
            <Stack.Screen name="CreateLot" component={CreateLotScreen} />
            <Stack.Screen name="UploadDocuments" component={UploadDocumentsScreen} />
            <Stack.Screen name="ConfidentialityResult" component={ConfidentialityResultScreen} />
            <Stack.Screen name="TagAssignment" component={TagAssignmentScreen} />

            {/* Exporter Flow */}
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="DPPView" component={DPPViewScreen} />
            <Stack.Screen name="BuyerHistory" component={BuyerHistoryScreen} />
        </Stack.Navigator>
    );
}
