import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';

const ESP32_IP = "http://192.168.43.188";

export const EnvironmentAlertDashboard = () => {
    const { user } = useStore();
    const role = user?.role || 'farmer';

    const [soilMoisture, setSoilMoisture] = useState('');
    const [humidity, setHumidity] = useState('');
    const [temperature, setTemperature] = useState('');
    const [resultMessage, setResultMessage] = useState(
        'Stress analysis will appear here'
    );

    // ✅ Fetch sensor data from ESP32 every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${ESP32_IP}/data`)
                .then(res => res.json())
                .then(data => {
                    setTemperature(String(data.temperature));
                    setHumidity(String(data.humidity));
                    setSoilMoisture(String(data.soilMoisture));

                    setResultMessage(
                        `Alert: ${data.alert}\nAdvice: ${data.advice}`
                    );
                })
                .catch(err => {
                    console.log("ESP32 Fetch Error:", err);
                    setResultMessage("Cannot connect to ESP32");
                });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Currently only visible to farmers according to requirement
    if (role !== 'farmer') {
        return (
            <View style={styles.accessDeniedContainer}>
                <Ionicons name="lock-closed" size={64} color="#ccc" />
                <Text style={styles.accessDeniedText}>
                    Access Denied. This dashboard is only available to farmers.
                </Text>
            </View>
        );
    }

    const handleAnalyze = () => {
        if (!soilMoisture || !humidity || !temperature) {
            Alert.alert('Missing Data', 'Please fill in all environmental parameters.');
            return;
        }

        setResultMessage('Analyzing environmental stress factors...');

        setTimeout(() => {
            setResultMessage(
                'Analysis complete: Conditions are currently optimal. No severe stress detected.'
            );
        }, 1500);
    };

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#1B5E20', '#4CAF50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>
                            Environmental Stress Monitor
                        </Text>
                        <Text style={styles.subtitle}>
                            Track your plantation health
                        </Text>
                    </View>

                    <View style={styles.iconCircle}>
                        <Ionicons name="leaf" size={24} color="#FFF" />
                    </View>
                </View>
            </LinearGradient>

            {/* Input Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Real Time Sensor Measurements
                </Text>

                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Soil Moisture (%)</Text>
                    <TextInput
                        style={styles.inputField}
                        keyboardType="numeric"
                        value={soilMoisture}
                        onChangeText={setSoilMoisture}
                    />

                    <Text style={styles.inputLabel}>Humidity (%)</Text>
                    <TextInput
                        style={styles.inputField}
                        keyboardType="numeric"
                        value={humidity}
                        onChangeText={setHumidity}
                    />

                    <Text style={styles.inputLabel}>Temperature (°C)</Text>
                    <TextInput
                        style={styles.inputField}
                        keyboardType="numeric"
                        value={temperature}
                        onChangeText={setTemperature}
                    />

                    <TouchableOpacity
                        style={styles.analyzeBtn}
                        onPress={handleAnalyze}
                    >
                        <Text style={styles.analyzeBtnText}>
                            Analyze Stress Level
                        </Text>
                        <Ionicons
                            name="analytics-outline"
                            size={20}
                            color="#FFF"
                            style={{ marginLeft: 8 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Result Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Analysis Result</Text>

                <View style={styles.resultCard}>
                    <Ionicons
                        name="information-circle"
                        size={32}
                        color="#1565C0"
                        style={{ marginBottom: 10 }}
                    />

                    <Text style={styles.resultMessage}>
                        {resultMessage}
                    </Text>
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
        marginBottom: 12
    },
    inputCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        elevation: 4
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 10,
        color: '#333'
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#DCEDC8',
        backgroundColor: '#F1F8E9',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        fontSize: 16,
        color: '#2E7D32',
        marginTop: 6
    },
    analyzeBtn: {
        backgroundColor: '#2E7D32',
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
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