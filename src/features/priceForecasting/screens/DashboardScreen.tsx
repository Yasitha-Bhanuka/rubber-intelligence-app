
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../../shared/styles/colors';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; // Or use a service
import { Ionicons } from '@expo/vector-icons';

// You might want to move this to a shared config or service
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            // Adjust endpoint as needed
            const response = await axios.get(`${API_URL}/price/history`);
            setPriceHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: priceHistory.length > 0 ? priceHistory.slice(0, 6).map(item => new Date(item.date).getDate().toString()) : ["Now"],
        datasets: [
            {
                data: priceHistory.length > 0 ? priceHistory.slice(0, 6).map(item => item.price) : [0],
            }
        ]
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Rubber Price Trends</Text>
                <Text style={styles.subtext}>Market Overview</Text>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>RSS1 Price (LKR) - Last 30 Days</Text>
                <LineChart
                    data={chartData}
                    width={Dimensions.get("window").width - 40}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`, // Primary color
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#009688"
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>

            <View style={styles.summaryCards}>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Latest Price</Text>
                    <Text style={styles.cardValue}>{priceHistory.length > 0 ? `LKR ${priceHistory[0].price.toFixed(2)}` : 'Loading...'}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Trend</Text>
                    <Text style={styles.cardValue}><Ionicons name="trending-up" size={20} /> +2.5%</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('PredictionForm')}
                >
                    <Ionicons name="calculator-outline" size={24} color="#FFF" />
                    <Text style={styles.actionText}>New Price Prediction</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.secondaryBtn]}
                    onPress={() => navigation.navigate('Report')}
                >
                    <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                    <Text style={[styles.actionText, styles.secondaryText]}>View Reports</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
    subtext: { fontSize: 16, color: '#757575', marginTop: 4 },
    chartContainer: { margin: 20, padding: 10, backgroundColor: '#FFF', borderRadius: 16, elevation: 2 },
    chartTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginLeft: 10 },
    summaryCards: { flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between' },
    card: { flex: 0.48, backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 1 },
    cardLabel: { fontSize: 14, color: '#757575' },
    cardValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary, marginTop: 8 },
    actions: { padding: 20, marginTop: 10 },
    actionBtn: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        elevation: 2
    },
    actionText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    secondaryBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.primary },
    secondaryText: { color: colors.primary }
});
