import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { getMyTransactions, getInvoice } from '../services/marketplaceService';
import { MarketplaceTransaction } from '../types';
//add
export default function OrderReceiptScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { transactionId } = route.params;

    const [transaction, setTransaction] = useState<MarketplaceTransaction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransaction();
    }, []);

    const loadTransaction = async () => {
        const all = await getMyTransactions();
        const found = all.find((t: MarketplaceTransaction) => t.id === transactionId);
        if (found) setTransaction(found);
        setLoading(false);
    };

    const handleViewInvoice = async () => {
        if (!transaction) return;
        try {
            const url = await getInvoice(transaction.id);

            // Fetch the invoice from the server
            const response = await fetch(url);
            if (!response.ok) {
                alert('Download failed: ' + response.statusText);
                return;
            }

            // Convert response to base64 string
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Write to cache using the new File API
            const cacheDir = Paths.cache;
            const file = new File(cacheDir, `invoice_${transaction.id}.pdf`);
            await file.write(base64, 'base64');

            // Share the saved file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
            } else {
                alert('Sharing not available on this device');
            }
        } catch (e) {
            console.error(e);
            alert('Error viewing invoice');
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
    if (!transaction) return <View style={styles.center}><Text>Transaction Not Found</Text></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="checkmark-circle" size={80} color="#34C759" />
                <Text style={styles.title}>Purchase Confirmed!</Text>
                <Text style={styles.subtitle}>Order ID: {transaction.id.substring(0, 8)}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount Paid:</Text>
                    <Text style={styles.price}>LKR {transaction.offerPrice}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.status}>{transaction.status}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Seller:</Text>
                    <Text style={styles.value}>Verified Buyer (ID: {transaction.buyerId.substring(0, 6)})</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Digital Assets</Text>

            {transaction.dppDocumentId && (
                <TouchableOpacity
                    style={styles.dppBtn}
                    onPress={() => navigation.navigate('DppDetail', { id: transaction.dppDocumentId })}
                >
                    <Ionicons name="lock-closed" size={24} color="white" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.dppBtnTitle}>Acess Secure DPP</Text>
                        <Text style={styles.dppBtnSub}>You now have owner access to the digital passport.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
            )}

            {transaction.status === 'InvoiceUploaded' && (
                <TouchableOpacity
                    style={[styles.dppBtn, { backgroundColor: '#FF9500' }]}
                    onPress={handleViewInvoice}
                >
                    <Ionicons name="document-text" size={24} color="white" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.dppBtnTitle}>View Encrypted Invoice</Text>
                        <Text style={styles.dppBtnSub}>Decrypted securely on your device.</Text>
                    </View>
                    <Ionicons name="download-outline" size={24} color="white" />
                </TouchableOpacity>
            )}



            <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Marketplace')}>
                <Text style={styles.homeBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7', padding: 20, paddingTop: 60 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
    subtitle: { color: '#666', marginTop: 8 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    label: { fontSize: 16, color: '#666' },
    value: { fontSize: 16, fontWeight: '600' },
    price: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
    status: { fontSize: 16, fontWeight: 'bold', color: '#34C759' },
    divider: { height: 1, backgroundColor: '#eee' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
    dppBtn: {
        backgroundColor: '#5856D6',
        padding: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20
    },
    dppBtnTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    dppBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
    homeBtn: { padding: 16, alignItems: 'center' },
    homeBtnText: { color: '#007AFF', fontSize: 16, fontWeight: '600' }
});
