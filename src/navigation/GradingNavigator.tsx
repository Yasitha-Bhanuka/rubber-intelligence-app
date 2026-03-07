import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QcLabScreen from '../features/grading/screens/qclab-home-screen';
import { GradingScreen } from '../features/grading/screens/GradingScreen';
import LatexQualityStatus from '../features/grading/screens/latex-quality-screen';
import LatexQualityHomeScreen from '../features/grading/screens/latex-quality-home';
import RSSLogbook from '../features/grading/screens/sample-logbook-screen';
import { TestReportScreen } from '../features/grading/screens/TestReportScreen';
import ReportsDashboard from '../features/grading/screens/test-reports-screen';
import LatexQualityReports from '../features/grading/screens/latex-quality-reports';
import SensorStatusScreen from '../features/grading/screens/sensor-status-screen';
import ViewHistoryScreen from '../features/grading/screens/latex-process-screen';
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
            <Stack.Screen name="ViewHistory" component={ViewHistoryScreen} />
            <Stack.Screen name="TestReports" component={TestReportScreen} />
            <Stack.Screen name="ReportsDashboard" component={ReportsDashboard as any} />
            <Stack.Screen name="LatexQualityReports" component={LatexQualityReports as any} />
            <Stack.Screen name="LatexQualityResult" component={require('../features/grading/screens/latex-quality-result-screen').default} />
            <Stack.Screen name="LatexStorageGuide" component={require('../features/grading/screens/latex-storage-guide').default} />
            <Stack.Screen name="StorageSelection" component={require('../features/grading/screens/storage-selection-screen').default} />
            <Stack.Screen name="ExpertChat" component={require('../features/grading/screens/expert-chat-screen').default} />
            <Stack.Screen name="LatexQualityReportViewer" component={require('../features/grading/screens/latex-quality-report-viewer').default} />
        </Stack.Navigator>
    );
};