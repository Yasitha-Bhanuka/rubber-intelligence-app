import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMyTransactions } from '../services/marketplaceService';
import { MarketplaceTransaction } from '../types';

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

            <TouchableOpacity
                style={styles.dppBtn}
                onPress={() => navigation.navigate('DppDetail', { id: transaction.postId })} // Note: PostId != DppDocumentId. This needs fixing in logic, but UI wise let's fix icon first.
            >
                <Ionicons name="lock-closed" size={24} color="white" />
                <View style={{ flex: 1 }}>
                    <Text style={styles.dppBtnTitle}>Acess Secure DPP</Text>
                    <Text style={styles.dppBtnSub}>You now have owner access to the digital passport.</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>

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
