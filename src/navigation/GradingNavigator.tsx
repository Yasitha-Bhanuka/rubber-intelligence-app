import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QcLabScreen from '../features/grading/screens/qclab-home-screen';
import { GradingScreen } from '../features/grading/screens/GradingScreen';
import LatexQualityStatus from '../features/grading/screens/latex-quality-screen';
import RSSLogbook from '../features/grading/screens/sample-logbook-screen';
import { colors } from '../shared/styles/colors';

const Stack = createNativeStackNavigator();

export const GradingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown: false // Custom headers are used in screens
            }}
            initialRouteName="QcLabHome"
        >
            <Stack.Screen name="QcLabHome" component={QcLabScreen} />
            <Stack.Screen name="NewTest" component={GradingScreen} />
            <Stack.Screen name="SampleLogbook" component={RSSLogbook} />
            <Stack.Screen name="LatexQuality" component={LatexQualityStatus} />
        </Stack.Navigator>
    );
};
