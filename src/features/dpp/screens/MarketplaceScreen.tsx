import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSellingPosts, buyItem, getMyTransactions } from '../services/marketplaceService';
import { SellingPost } from '../types';

export default function MarketplaceScreen() {
    const navigation = useNavigation<any>();
    const [posts, setPosts] = useState<SellingPost[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'marketplace' | 'orders'>('marketplace');
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (viewMode === 'marketplace') {
                const data = await getSellingPosts();
                setPosts(data);
            } else {
                const data = await getMyTransactions();
                setTransactions(data);
            }
        } finally {
            setLoading(false);
        }
    }, [viewMode]);

    // Cache guard: prevent redundant refetches on rapid tab switches
    const lastFetchRef = useRef(0);
    const CACHE_TTL = 30000;

    useFocusEffect(
        useCallback(() => {
            if (Date.now() - lastFetchRef.current > CACHE_TTL) {
                lastFetchRef.current = Date.now();
                loadData();
            }
        }, [loadData])
    );

    const handleBuy = (post: SellingPost) => {
        Alert.alert(
            'Confirm Purchase',
            `Buy ${post.grade} (${post.quantityKg}kg) for LKR ${post.pricePerKg}/kg?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Purchase',
                    onPress: async () => {
                        try {
                            const transaction = await buyItem(post.id);
                            Alert.alert('Request Sent', 'Seller notified. Please wait for the encrypted invoice to be uploaded.');
                            navigation.navigate('OrderReceipt', { transactionId: transaction.id });
                        } catch (e) {
                            Alert.alert('Error', 'Failed to complete purchase. Item might be unavailable.');
                            loadData();
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: SellingPost }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.grade}>{item.grade}</Text>
                    <Text style={styles.location}><Ionicons name="location-sharp" size={12} /> {item.location}</Text>
                </View>
                <View style={styles.priceTag}>
                    <Text style={styles.price}>LKR {item.pricePerKg}</Text>
                    <Text style={styles.unit}>/kg</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Quantity</Text>
                    <Text style={styles.detailValue}>{item.quantityKg} kg</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Seller</Text>
                    <Text style={styles.detailValue}>{item.buyerName}</Text>
                </View>
            </View>

            {item.dppDocumentId && (
                <View style={styles.verifiedTag}>
                    <Ionicons name="shield-checkmark" size={14} color="#34C759" />
                    <Text style={styles.verifiedText}>DPP Verified</Text>
                </View>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleBuy(item)}>
                <Text style={styles.actionBtnText}>Request Purchase</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTransaction = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderReceipt', { transactionId: item.id })}
        >
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.grade}>Order #{item.id.substring(0, 8)}</Text>
                    <Text style={[
                        styles.location,
                        { color: item.status === 'Completed' ? '#34C759' : '#FF9500', fontWeight: 'bold' }
                    ]}>
                        {item.status === 'Completed' ? 'Payment Completed' : (item.status === 'InvoiceUploaded' ? 'Invoice Ready' : 'Pending Invoice')}
                    </Text>
                </View>
                <View style={styles.priceTag}>
                    <Text style={styles.price}>LKR {item.offerPrice}</Text>
                    <Text style={styles.unit}>Total</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Seller</Text>
                    <Text style={styles.detailValue}>ID: {item.buyerId.substring(0, 6)}</Text>
                </View>
                {item.dppDocumentId && (
                    <View style={[styles.verifiedTag, { marginBottom: 0 }]}>
                        <Ionicons name="shield-checkmark" size={14} color="#34C759" />
                        <Text style={styles.verifiedText}>DPP Linked</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Rubber Marketplace</Text>
                <Text style={styles.subtitle}>Global Rubber Trade Platform</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'marketplace' && styles.activeTab]}
                    onPress={() => setViewMode('marketplace')}
                >
                    <Text style={[styles.tabText, viewMode === 'marketplace' && styles.activeTabText]}>Marketplace</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'orders' && styles.activeTab]}
                    onPress={() => setViewMode('orders')}
                >
                    <Text style={[styles.tabText, viewMode === 'orders' && styles.activeTabText]}>My Orders</Text>
                </TouchableOpacity>
            </View>

            {loading && (posts.length === 0 && transactions.length === 0) ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={viewMode === 'marketplace' ? posts : transactions}
                    renderItem={viewMode === 'marketplace' ? renderItem : renderTransaction}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={loadData}
                    ListEmptyComponent={<Text style={styles.empty}>
                        {viewMode === 'marketplace' ? 'No active posts available.' : 'No orders found.'}
                    </Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 60 },
    header: { paddingHorizontal: 20, marginBottom: 10 },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 14, color: '#666' },
    list: { padding: 20 },
    empty: { textAlign: 'center', color: '#888', marginTop: 40 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    grade: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    location: { fontSize: 13, color: '#888', marginTop: 4 },
    priceTag: { alignItems: 'flex-end' },
    price: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
    unit: { fontSize: 12, color: '#888' },
    detailsRow: { flexDirection: 'row', gap: 24, marginBottom: 16 },
    detailItem: {},
    detailLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
    detailValue: { fontSize: 15, fontWeight: '600' },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#E8FAE8',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 16
    },
    verifiedText: { color: '#34C759', fontSize: 12, fontWeight: 'bold' },
    actionBtn: {
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e5e5ea', height: 40, justifyContent: 'center', alignItems: 'center' },
    activeTab: { backgroundColor: '#007AFF' },
    tabText: { color: '#666', fontWeight: '600' },
    activeTabText: { color: 'white' }
});
