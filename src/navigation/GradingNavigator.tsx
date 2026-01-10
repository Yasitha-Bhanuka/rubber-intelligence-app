import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QcLabScreen from '../features/grading/screens/qclab-home-screen';
import { GradingScreen } from '../features/grading/screens/GradingScreen';
import LatexQualityStatus from '../features/grading/screens/latex-quality-screen';
import LatexQualityHomeScreen from '../features/grading/screens/latex-quality-home';
import RSSLogbook from '../features/grading/screens/sample-logbook-screen';
import { TestReportScreen } from '../features/grading/screens/TestReportScreen';
import ReportsDashboard from '../features/grading/screens/test-reports-screen';
import SensorStatusScreen from '../features/grading/screens/sensor-status-screen';
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
            <Stack.Screen name="LatexQualityHome" component={LatexQualityHomeScreen} />
            <Stack.Screen name="LatexTest" component={LatexQualityStatus} />
            <Stack.Screen name="SensorStatus" component={SensorStatusScreen} />
            <Stack.Screen name="TestReports" component={TestReportScreen} />
            <Stack.Screen name="ReportsDashboard" component={ReportsDashboard as any} />
        </Stack.Navigator>
    );
};
