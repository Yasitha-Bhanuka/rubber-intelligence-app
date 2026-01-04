import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../../core/api/apiClient';

export default function DppDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const [loading, setLoading] = useState(true);
    const [documentData, setDocumentData] = useState<any>(null); // This would represent the file stream or metadata

    // Mock fetch for demonstration if API isn't fully seeded with data matching the QR
    // In real implementation:
    // const fetchDocument = async () => { ... apiClient.get(`/Dpp/${id}/access`) ... }

    useEffect(() => {
        // Simulating secure decryption fetch
        setTimeout(() => {
            setLoading(false);
            setDocumentData({
                fileName: 'Rubber_Lot_A12.pdf',
                decryptedTimestamp: new Date().toLocaleTimeString(),
                status: 'VERIFIED',
                content: 'Confidential Batch Specification: \n\nLKR Grade: RSS1\nMoisture: 0.5%\nOrigin: Kalutara Estate\nPrice: CONFIDENTIAL',
                owner: 'Global Buyer Inc'
            });
        }, 2000);
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <Ionicons name="lock-closed-outline" size={64} color="#007AFF" />
                <Text style={styles.loadingText}>Verifying Credentials...</Text>
                <Text style={styles.loadingSubText}>Decrypting Secure DPP Report</Text>
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="shield-checkmark" size={48} color="#34C759" />
                <Text style={styles.headerTitle}>Access Granted</Text>
                <Text style={styles.headerSubtitle}>Exporter Verification Successful</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>DPP ID:</Text>
                    <Text style={styles.value}>{id}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>File Name:</Text>
                    <Text style={styles.value}>{documentData.fileName}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Decrypted At:</Text>
                    <Text style={styles.value}>{documentData.decryptedTimestamp}</Text>
                </View>
            </View>

            <View style={styles.contentCard}>
                <Text style={styles.contentTitle}>Decrypted Content Preview</Text>
                <Text style={styles.contentText}>{documentData.content}</Text>

                <TouchableOpacity style={styles.downloadBtn}>
                    <Ionicons name="download-outline" size={24} color="white" />
                    <Text style={styles.downloadText}>Download Full PDF</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.closeText}>Close Secure View</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1C1C1E' }, // Dark mode for "secure" feel
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
    loadingText: { marginTop: 16, fontSize: 18, fontWeight: '600' },
    loadingSubText: { marginTop: 8, fontSize: 14, color: '#666' },
    header: { alignItems: 'center', padding: 32, backgroundColor: '#000' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 16 },
    headerSubtitle: { fontSize: 14, color: '#4CD964', marginTop: 8, letterSpacing: 1 },
    card: {
        margin: 20,
        backgroundColor: '#2C2C2E',
        borderRadius: 16,
        padding: 20
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    label: { color: '#8E8E93', fontSize: 14 },
    value: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#3A3A3C' },
    contentCard: {
        margin: 20,
        marginTop: 0,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24
    },
    contentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#000' },
    contentText: { fontSize: 14, color: '#333', lineHeight: 22, fontFamily: 'monospace' },
    downloadBtn: {
        marginTop: 24,
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8
    },
    downloadText: { color: 'white', fontWeight: 'bold' },
    closeBtn: { margin: 20, alignItems: 'center', padding: 16 },
    closeText: { color: '#FF3B30', fontSize: 16 }
});
