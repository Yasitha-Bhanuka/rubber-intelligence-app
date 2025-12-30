import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Placeholder screens for features
const HomeScreen = () => <View><Text>Home / Grading</Text></View>;
const DiseaseScreen = () => <View><Text>Disease Detection</Text></View>;
const MonitoringScreen = () => <View><Text>Monitoring</Text></View>;
const DPPScreen = () => <View><Text>DPP</Text></View>;
const ChatbotScreen = () => <View><Text>AI Chatbot</Text></View>;

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Grading" component={HomeScreen} />
            <Tab.Screen name="Disease" component={DiseaseScreen} />
            <Tab.Screen name="Monitoring" component={MonitoringScreen} />
            <Tab.Screen name="DPP" component={DPPScreen} />
            <Tab.Screen name="Chatbot" component={ChatbotScreen} />
        </Tab.Navigator>
    );
};
