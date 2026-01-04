import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock Data - In real app, fetch from API
const MOCK_DOCS = [
    { id: '1', fileName: 'Rubber_Lot_A12.pdf', classification: 'CONFIDENTIAL', date: '2025-10-14' },
    { id: '2', fileName: 'Invoice_778.pdf', classification: 'CONFIDENTIAL', date: '2025-10-15' },
    { id: '3', fileName: 'Quality_Report_B.pdf', classification: 'NON_CONFIDENTIAL', date: '2025-10-15' }
];

export default function BuyerDashboardScreen() {
    const navigation = useNavigation<any>();
    const [selectedQr, setSelectedQr] = useState<string | null>(null);

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <Text style={styles.fileName}>{item.fileName}</Text>
                <Text style={styles.date}>{item.date}</Text>
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
                <TouchableOpacity onPress={() => navigation.navigate('DocumentUpload')}>
                    <Ionicons name="add-circle" size={32} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_DOCS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />

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
    closeText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
