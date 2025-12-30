import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DiseaseCameraScreen } from './screens/DiseaseCameraScreen';
import { DiseaseResultScreen } from './screens/DiseaseResultScreen';
import { DiseaseHistoryScreen } from './screens/DiseaseHistoryScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../shared/styles/colors';

const Stack = createNativeStackNavigator();

// Simple Selection Screen
const DiseaseHomeScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Detection Type</Text>

            <MenuButton
                title="Leaf Disease"
                icon="leaf"
                color="#4CAF50"
                onPress={() => navigation.navigate('DiseaseCamera', { type: 0 })}
            />
            <MenuButton
                title="Pest Detection"
                icon="bug"
                color="#E91E63"
                onPress={() => navigation.navigate('DiseaseCamera', { type: 1 })}
            />
            <MenuButton
                title="Weed Identification"
                icon="flower"
                color="#FF9800"
                onPress={() => navigation.navigate('DiseaseCamera', { type: 2 })}
            />

            <View style={{ height: 20 }} />
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 10 }}>Records</Text>
            <MenuButton
                title="Recent History"
                icon="time"
                color="#607D8B"
                onPress={() => navigation.navigate('DiseaseHistory')}
            />
        </View>
    );
};

const MenuButton = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
            <Ionicons name={icon} size={32} color="#FFF" />
        </View>
        <Text style={styles.cardText}>{title}</Text>
        <Ionicons name="chevron-forward" size={24} color="gray" />
    </TouchableOpacity>
);

export const DiseaseNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DiseaseHome" component={DiseaseHomeScreen} />
            <Stack.Screen name="DiseaseCamera" component={DiseaseCameraScreen} />
            <Stack.Screen name="DiseaseResult" component={DiseaseResultScreen} />
            <Stack.Screen name="DiseaseHistory" component={DiseaseHistoryScreen} options={{ headerShown: true, title: 'History' }} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
    iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardText: { flex: 1, fontSize: 18, fontWeight: '600', color: '#333' }
});
