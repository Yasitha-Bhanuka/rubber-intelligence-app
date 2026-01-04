import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DocumentUploadScreen from '../features/dpp/screens/DocumentUploadScreen';
import ClassificationResultScreen from '../features/dpp/screens/ClassificationResultScreen';

const Stack = createNativeStackNavigator();

export default function DppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F2F2F7' }
            }}
        >
            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
            <Stack.Screen name="ClassificationResult" component={ClassificationResultScreen} />
        </Stack.Navigator>
    );
}
