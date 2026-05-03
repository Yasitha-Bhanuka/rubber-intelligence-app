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

const ESP32_IP = "http://10.148.43.161";

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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            fetch(`${ESP32_IP}/data`, { signal: controller.signal })
                .then(res => res.json())
                .then(data => {
                    clearTimeout(timeoutId);
                    setTemperature(String(data.temperature));
                    setHumidity(String(data.humidity));
                    setSoilMoisture(String(data.soilMoisture));

                    setResultMessage(
                        `Alert: ${data.alert}\nAdvice: ${data.advice}`
                    );
                })
                .catch(err => {
                    clearTimeout(timeoutId);
                    console.log("ESP32 Fetch Error:", err);
                    setTemperature("");
                    setHumidity("");
                    setSoilMoisture("");
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

    const isConnected = Number(temperature) > 0 || Number(humidity) > 0 || Number(soilMoisture) > 0;

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
                    {isConnected ? (
                        <View style={styles.readingsContainer}>
                            <View style={styles.readingRow}>
                                <Text style={styles.readingLabel}>Soil Moisture</Text>
                                <Text style={styles.readingValue}>{soilMoisture}%</Text>
                            </View>
                            <View style={styles.readingRow}>
                                <Text style={styles.readingLabel}>Humidity</Text>
                                <Text style={styles.readingValue}>{humidity}%</Text>
                            </View>
                            <View style={styles.readingRow}>
                                <Text style={styles.readingLabel}>Temperature</Text>
                                <Text style={styles.readingValue}>{temperature}°C</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={48} color="#D32F2F" />
                            <Text style={styles.errorText}>ESP32 Device Offline</Text>
                            <Text style={styles.errorSubText}>Please check the connection</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Result Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Analysis Result</Text>

                <View style={styles.resultCard}>
                    <Ionicons
                        name={resultMessage.includes("Cannot connect") ? "alert-circle" : "information-circle"}
                        size={32}
                        color={resultMessage.includes("Cannot connect") ? "#D32F2F" : "#1565C0"}
                        style={{ marginBottom: 10 }}
                    />

                    <Text style={[styles.resultMessage, resultMessage.includes("Cannot connect") && { color: "#D32F2F" }]}>
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
    readingsContainer: {
        width: '100%'
    },
    readingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    readingLabel: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500'
    },
    readingValue: {
        fontSize: 18,
        color: '#2E7D32',
        fontWeight: 'bold'
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginTop: 10
    },
    errorSubText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5
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