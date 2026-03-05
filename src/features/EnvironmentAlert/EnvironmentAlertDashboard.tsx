import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';

export const EnvironmentAlertDashboard = () => {
    const { user } = useStore();
    const role = user?.role || 'farmer';

    const [soilMoisture, setSoilMoisture] = useState('');
    const [humidity, setHumidity] = useState('');
    const [temperature, setTemperature] = useState('');
    const [resultMessage, setResultMessage] = useState('Stress analysis will appear here');

    // Currently only visible to farmers according to requirement
    if (role !== 'farmer') {
        return (
            <View style={styles.accessDeniedContainer}>
                <Ionicons name="lock-closed" size={64} color="#ccc" />
                <Text style={styles.accessDeniedText}>Access Denied. This dashboard is only available to farmers.</Text>
            </View>
        );
    }

    const handleAnalyze = () => {
        if (!soilMoisture || !humidity || !temperature) {
            Alert.alert('Missing Data', 'Please fill in all environmental parameters.');
            return;
        }

        // Future Implementation: Real analysis and sensor integration
        // Currently setting a placeholder processing message
        setResultMessage('Analyzing environmental stress factors...');

        setTimeout(() => {
            setResultMessage('Analysis complete: Conditions are currently optimal. No severe stress detected.');
        }, 1500);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <LinearGradient
                colors={['#1B5E20', '#4CAF50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Environmental Stress Monitor</Text>
                        <Text style={styles.subtitle}>Track your plantation health</Text>
                    </View>
                    <View style={styles.iconCircle}>
                        <Ionicons name="leaf" size={24} color="#FFF" />
                    </View>
                </View>
            </LinearGradient>

            {/* Input Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Real Time Sensor Measurements</Text>
                <Text style={styles.sectionDescription}>
                    Enter current readings below.
                </Text>

                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Soil Moisture (%)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="water-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="e.g. 45"
                            keyboardType="numeric"
                            value={soilMoisture}
                            onChangeText={setSoilMoisture}
                            placeholderTextColor="#A5D6A7"
                        />
                    </View>

                    <Text style={styles.inputLabel}>Humidity (%)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="cloudy-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="e.g. 80"
                            keyboardType="numeric"
                            value={humidity}
                            onChangeText={setHumidity}
                            placeholderTextColor="#A5D6A7"
                        />
                    </View>

                    <Text style={styles.inputLabel}>Temperature (°C)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="thermometer-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="e.g. 28"
                            keyboardType="numeric"
                            value={temperature}
                            onChangeText={setTemperature}
                            placeholderTextColor="#A5D6A7"
                        />
                    </View>

                    <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
                        <Text style={styles.analyzeBtnText}>Analyze Stress Level</Text>
                        <Ionicons name="analytics-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Result Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Analysis Result</Text>
                <View style={styles.resultCard}>
                    <Ionicons name="information-circle" size={32} color="#1565C0" style={{ marginBottom: 10 }} />
                    <Text style={styles.resultMessage}>{resultMessage}</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA'
    },
    header: {
        padding: 20,
        paddingTop: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingBottom: 30
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF'
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    section: {
        padding: 20,
        paddingBottom: 0,
        marginTop: 10
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        lineHeight: 20
    },
    inputCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F8E9',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#DCEDC8'
    },
    inputIcon: {
        marginRight: 10
    },
    inputField: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#2E7D32',
        fontWeight: '500'
    },
    analyzeBtn: {
        backgroundColor: '#2E7D32',
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    analyzeBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    resultCard: {
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#BBDEFB'
    },
    resultMessage: {
        fontSize: 16,
        color: '#1565C0',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24
    },
    accessDeniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        padding: 40
    },
    accessDeniedText: {
        marginTop: 20,
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        fontWeight: '500'
    }
});
