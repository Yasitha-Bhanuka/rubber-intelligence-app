
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../../shared/styles/colors';
import { Ionicons } from '@expo/vector-icons';

export const ReportScreen = ({ navigation }: any) => {
    // Mock data for reports
    const recentPredictions = [
        { id: 1, date: '2025-01-01', grade: 'RSS1', price: 540.50, quality: 'Excellent' },
        { id: 2, date: '2024-12-28', grade: 'RSS3', price: 480.00, quality: 'Average' },
        { id: 3, date: '2024-12-25', grade: 'RSS1', price: 535.20, quality: 'Good' },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Prediction Reports</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quality Analysis</Text>
                <View style={styles.card}>
                    <Text style={styles.text}>Based on your recent inputs, the average quality of your rubber sheets is <Text style={{ fontWeight: 'bold', color: colors.primary }}>Excellent</Text>.</Text>
                    <Text style={[styles.text, { marginTop: 10 }]}>Suggestion: Maintain current drying process to ensure high tensile strength.</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Predictions</Text>
                {recentPredictions.map((item) => (
                    <View key={item.id} style={styles.historyItem}>
                        <View>
                            <Text style={styles.historyGrade}>{item.grade}</Text>
                            <Text style={styles.historyDate}>{item.date}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.historyPrice}>LKR {item.price.toFixed(2)}</Text>
                            <Text style={[styles.qualityBadge, { color: item.quality === 'Excellent' ? 'green' : 'orange' }]}>{item.quality}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.downloadBtn}>
                <Ionicons name="download-outline" size={20} color="#FFF" />
                <Text style={styles.downloadText}>Download Full Report (PDF)</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backBtn: { padding: 5, marginRight: 15 },
    title: { fontSize: 20, fontWeight: 'bold' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#333' },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 1 },
    text: { fontSize: 15, lineHeight: 22, color: '#555' },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
    historyGrade: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    historyDate: { fontSize: 13, color: '#999', marginTop: 4 },
    historyPrice: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    qualityBadge: { fontSize: 12, marginTop: 4 },
    downloadBtn: { flexDirection: 'row', backgroundColor: '#333', margin: 20, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    downloadText: { color: '#FFF', fontWeight: '600', marginLeft: 10 }
});
