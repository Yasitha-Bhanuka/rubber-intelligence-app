import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDppMetadata, getDppFileUrl } from '../services/dppService';
import { DppDocument } from '../types';

export default function DppDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const [loading, setLoading] = useState(true);
    const [documentData, setDocumentData] = useState<DppDocument | null>(null);

    useEffect(() => {
        fetchMetadata();
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const doc = await getDppMetadata(id);
            setDocumentData(doc);
        } catch (error) {
            Alert.alert('Access Denied', 'Could not verify document access or document does not exist.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const url = getDppFileUrl(id);
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert('Error', 'Cannot download file');
        }
    };

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

    if (!documentData) return null;

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
                    <Text style={styles.value}>{id.substring(0, 18)}...</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>File Name:</Text>
                    <Text style={styles.value}>{documentData.originalFileName}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Uploaded At:</Text>
                    <Text style={styles.value}>{new Date(documentData.uploadedAt).toLocaleString()}</Text>
                </View>
            </View>

            <View style={styles.contentCard}>
                <Text style={styles.contentTitle}>Verified Content Summary</Text>
                <Text style={styles.contentText}>
                    {documentData.extractedTextSummary || "No text summary available."}
                </Text>

                <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
                    <Ionicons name="download-outline" size={24} color="white" />
                    <Text style={styles.downloadText}>Download Full Document</Text>
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
