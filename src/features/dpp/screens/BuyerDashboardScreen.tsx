import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getBuyerDocuments } from '../services/dppService';
import { getMyTransactions, uploadInvoice } from '../services/marketplaceService';
import { DppDocument, MarketplaceTransaction } from '../types';
//ddd
export default function BuyerDashboardScreen() {
    const navigation = useNavigation<any>();
    const [selectedQr, setSelectedQr] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DppDocument[]>([]);
    const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [docs, trans] = await Promise.all([
                getBuyerDocuments(),
                getMyTransactions()
            ]);
            setDocuments(docs);
            setTransactions(trans);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleUploadInvoice = async (transactionId: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow all for now, or restrict to pdf/images
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setLoading(true);
            await uploadInvoice(transactionId, {
                uri: file.uri,
                name: file.name,
                mimeType: file.mimeType
            });
            Alert.alert('Success', 'Invoice uploaded securely!');
            loadData(); // Refresh to update status
        } catch (error) {
            Alert.alert('Error', 'Failed to upload invoice');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: DppDocument }) => (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <Text style={styles.fileName}>{item.originalFileName}</Text>
                <Text style={styles.date}>{new Date(item.uploadedAt).toLocaleDateString()}</Text>
                <View style={[
                    styles.tag,
                    { backgroundColor: item.classification === 'CONFIDENTIAL' ? '#FFE5E5' : '#E5FFE5' }
                ]}>
                    <Text style={{
                        color: item.classification === 'CONFIDENTIAL' ? '#D00' : '#008000',
                        fontSize: 10,
                        fontWeight: 'bold'
                    }}>
                        {item.classification}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.qrButton}
                onPress={() => setSelectedQr(item.id)}
            >
                <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Buyer Dashboard</Text>
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('CreateSellingPost')}
                >
                    <Ionicons name="pricetag" size={20} color="white" />
                    <Text style={styles.actionBtnText}>Create Selling Post</Text>
                </TouchableOpacity>
            </View>

            {/* Sales Section */}
            {transactions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Sales</Text>
                    {transactions.map(t => (
                        <View key={t.id} style={styles.reqCardContainer}>
                            <TouchableOpacity
                                style={styles.reqCard}
                                onPress={() => navigation.navigate('OrderReceipt', { transactionId: t.id })}
                            >
                                <View>
                                    <Text style={styles.reqTitle}>Sold for LKR {t.offerPrice}</Text>
                                    <Text style={[
                                        styles.reqStatus,
                                        { color: t.status === 'Completed' ? '#34C759' : '#FF9500' }
                                    ]}>
                                        {t.status === 'Completed' ? 'Payment Completed' : (t.status === 'PendingInvoice' ? 'Pending Invoice' : 'Invoice Uploaded')}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={t.status === 'Completed' ? "checkmark-circle" : "time-outline"}
                                    size={24}
                                    color={t.status === 'Completed' ? "#34C759" : "#FF9500"}
                                />
                            </TouchableOpacity>

                            {/* Upload Action for PendingInvoice */}
                            {t.status === 'PendingInvoice' && (
                                <TouchableOpacity
                                    style={styles.uploadBtn}
                                    onPress={() => handleUploadInvoice(t.id)}
                                >
                                    <Ionicons name="cloud-upload" size={16} color="white" />
                                    <Text style={styles.uploadBtnText}>Secure Upload Invoice</Text>
                                </TouchableOpacity>
                            )}

                            {/* Link DPP Action */}
                            {!t.dppDocumentId && (
                                <TouchableOpacity
                                    style={[styles.uploadBtn, { backgroundColor: '#5856D6', marginTop: 8 }]}
                                    onPress={() => navigation.navigate('DocumentUpload', { transactionId: t.id })}
                                >
                                    <Ionicons name="document-attach" size={16} color="white" />
                                    <Text style={styles.uploadBtnText}>Link DPP Document</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <Text style={[styles.sectionTitle, { marginHorizontal: 20, marginTop: 10 }]}>My Documents</Text>

            {loading && documents.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={documents}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No documents uploaded yet.</Text>
                            <Text style={styles.emptySubText}>Tap + to upload a rubber lot document.</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={loadData}
                />
            )}

            <Modal visible={!!selectedQr} transparent animationType="fade">
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>DPP QR Code</Text>
                        <Text style={styles.modalSubtitle}>Scan to access document</Text>

                        {selectedQr && (
                            <View style={styles.qrContainer}>
                                <QRCode
                                    value={selectedQr}
                                    size={200}
                                />
                            </View>
                        )}

                        <Text style={styles.idText}>ID: {selectedQr}</Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedQr(null)}
                        >
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 60 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20
    },
    title: { fontSize: 28, fontWeight: '800' },
    list: { padding: 20 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    cardInfo: { flex: 1 },
    fileName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    date: { fontSize: 12, color: '#888', marginBottom: 8 },
    tag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    qrButton: {
        padding: 10,
        backgroundColor: '#F0F8FF',
        borderRadius: 12
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center'
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
    qrContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20
    },
    idText: { fontFamily: 'monospace', color: '#888', marginBottom: 20 },
    closeButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#007AFF',
        borderRadius: 12
    },
    closeText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#555' },
    emptySubText: { fontSize: 14, color: '#999', marginTop: 8 },
    actionBtn: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12
    },
    actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    section: { paddingHorizontal: 20, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    reqCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    reqTitle: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
    reqStatus: { fontSize: 13, color: '#666', marginTop: 2 },
    reqCardContainer: { marginBottom: 12 },
    uploadBtn: {
        backgroundColor: '#FF9500',
        padding: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: -4,
        marginHorizontal: 4
    },
    uploadBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
