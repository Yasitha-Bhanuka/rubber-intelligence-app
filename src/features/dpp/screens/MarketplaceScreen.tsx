import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSellingPosts, buyItem, getMyTransactions, getBuyerHistory } from '../services/marketplaceService';
import { SellingPost, BuyerHistory } from '../types';

export default function MarketplaceScreen() {
    const navigation = useNavigation<any>();
    const [posts, setPosts] = useState<SellingPost[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'marketplace' | 'orders'>('marketplace');
    const [loading, setLoading] = useState(false);

    // Buyer History modal
    const [historyModal, setHistoryModal] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [buyerHistory, setBuyerHistory] = useState<BuyerHistory | null>(null);

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

    const handleViewBuyerHistory = async (buyerId: string) => {
        setBuyerHistory(null);
        setHistoryModal(true);
        setHistoryLoading(true);
        try {
            const history = await getBuyerHistory(buyerId);
            setBuyerHistory(history);
        } catch {
            setBuyerHistory(null);
        } finally {
            setHistoryLoading(false);
        }
    };

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
                        } catch {
                            Alert.alert('Error', 'Failed to complete purchase. Item might be unavailable.');
                            loadData();
                        }
                    }
                }
            ]
        );
    };

    const consistencyColor = (c: BuyerHistory['verificationConsistency']) =>
        c === 'High' ? '#34C759' : c === 'Medium' ? '#FF9500' : '#FF3B30';

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

            {/* Seller history button for exporters */}
            <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => handleViewBuyerHistory(item.buyerId)}
            >
                <Ionicons name="stats-chart-outline" size={14} color="#5856D6" />
                <Text style={styles.historyBtnText}>View Seller History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleBuy(item)}>
                <Text style={styles.actionBtnText}>Request Purchase</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={styles.card}>
            {/* Tappable header row — navigates to order receipt */}
            <TouchableOpacity
                onPress={() => navigation.navigate('OrderReceipt', { transactionId: item.id })}
                activeOpacity={0.7}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.grade}>Order #{item.id.substring(0, 8)}</Text>
                        <Text style={[
                            styles.location,
                            { color: item.status === 'Completed' ? '#34C759' : '#FF9500', fontWeight: 'bold' }
                        ]}>
                            {item.status === 'Completed' ? 'Payment Completed'
                                : item.status === 'InvoiceUploaded' ? 'Invoice Ready'
                                    : 'Pending Invoice'}
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

            {/* ── DPP Access Panel (shown only when DPP is linked to this lot) ── */}
            {item.dppDocumentId && (
                <View style={styles.dppPanel}>
                    <View style={styles.dppPanelHeader}>
                        <Ionicons name="document-lock" size={14} color="#5856D6" />
                        <Text style={styles.dppPanelTitle}>Digital Product Passport</Text>
                    </View>
                    <View style={styles.dppPanelActions}>
                        {/* View DPP public summary — allows generating/viewing the passport */}
                        <TouchableOpacity
                            style={styles.dppSummaryBtn}
                            onPress={() => navigation.navigate('DppPassport', { dppId: item.dppDocumentId })}
                        >
                            <Ionicons name="eye-outline" size={14} color="#5856D6" />
                            <Text style={styles.dppSummaryBtnText}>View DPP Summary</Text>
                        </TouchableOpacity>
                        {/* Request or view confidential field access */}
                        <TouchableOpacity
                            style={styles.dppConfidBtn}
                            onPress={() => navigation.navigate('ConfidentialAccess', { lotId: item.dppDocumentId })}
                        >
                            <Ionicons name="lock-open-outline" size={14} color="#FF9500" />
                            <Text style={styles.dppConfidBtnText}>Confidential Fields</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
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

            {/* Buyer/Seller History Modal */}
            <Modal visible={historyModal} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.historyCard}>
                        <View style={styles.historyHeader}>
                            <Ionicons name="stats-chart" size={28} color="#5856D6" />
                            <Text style={styles.historyTitle}>Seller History</Text>
                            <TouchableOpacity onPress={() => setHistoryModal(false)}>
                                <Ionicons name="close" size={22} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {historyLoading ? (
                            <ActivityIndicator size="large" color="#5856D6" style={{ marginVertical: 32 }} />
                        ) : buyerHistory ? (
                            <ScrollView>
                                <View style={styles.statsGrid}>
                                    <StatBox label="Total Lots" value={buyerHistory.totalLots.toString()} color="#007AFF" />
                                    <StatBox label="Accepted" value={buyerHistory.accepted.toString()} color="#34C759" />
                                    <StatBox label="Rejected" value={buyerHistory.rejected.toString()} color="#FF3B30" />
                                    <StatBox label="Re-Inspections" value={buyerHistory.reInspections.toString()} color="#FF9500" />
                                </View>
                                <View style={styles.qualityRow}>
                                    <Text style={styles.qualityLabel}>Avg Quality Score</Text>
                                    <Text style={styles.qualityValue}>{buyerHistory.averageQuality}/100</Text>
                                </View>
                                <View style={styles.consistencyRow}>
                                    <Text style={styles.consistencyLabel}>DPP Verification</Text>
                                    <View style={[
                                        styles.consistencyBadge,
                                        { backgroundColor: consistencyColor(buyerHistory.verificationConsistency) + '22' }
                                    ]}>
                                        <Text style={[
                                            styles.consistencyText,
                                            { color: consistencyColor(buyerHistory.verificationConsistency) }
                                        ]}>
                                            {buyerHistory.verificationConsistency}
                                        </Text>
                                    </View>
                                </View>
                                {buyerHistory.lastActivityDate && (
                                    <Text style={styles.lastActivity}>
                                        Last active: {new Date(buyerHistory.lastActivityDate).toLocaleDateString()}
                                    </Text>
                                )}
                            </ScrollView>
                        ) : (
                            <Text style={styles.historyError}>Could not load seller history.</Text>
                        )}

                        <TouchableOpacity style={styles.closeHistoryBtn} onPress={() => setHistoryModal(false)}>
                            <Text style={styles.closeHistoryBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View style={[statStyles.box, { borderColor: color + '44' }]}>
            <Text style={[statStyles.value, { color }]}>{value}</Text>
            <Text style={statStyles.label}>{label}</Text>
        </View>
    );
}

const statStyles = StyleSheet.create({
    box: {
        flex: 1, alignItems: 'center', padding: 14,
        borderRadius: 14, borderWidth: 1.5, margin: 4, backgroundColor: 'white'
    },
    value: { fontSize: 22, fontWeight: '800' },
    label: { fontSize: 11, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 60 },
    header: { paddingHorizontal: 20, marginBottom: 10 },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 14, color: '#666' },
    list: { padding: 20 },
    empty: { textAlign: 'center', color: '#888', marginTop: 40 },
    card: {
        backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
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
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8FAE8',
        alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12
    },
    verifiedText: { color: '#34C759', fontSize: 12, fontWeight: 'bold' },
    historyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
        borderWidth: 1.5, borderColor: '#5856D6', borderRadius: 10, padding: 10, marginBottom: 10
    },
    historyBtnText: { color: '#5856D6', fontWeight: '600', fontSize: 13 },
    actionBtn: { backgroundColor: '#007AFF', padding: 14, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
    tab: {
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
        backgroundColor: '#e5e5ea', height: 40, justifyContent: 'center', alignItems: 'center'
    },
    activeTab: { backgroundColor: '#007AFF' },
    tabText: { color: '#666', fontWeight: '600' },
    activeTabText: { color: 'white' },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    historyCard: {
        backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, maxHeight: '65%'
    },
    historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    historyTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    qualityRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F2F2F7'
    },
    qualityLabel: { fontSize: 14, color: '#636366', fontWeight: '600' },
    qualityValue: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
    consistencyRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F2F2F7'
    },
    consistencyLabel: { fontSize: 14, color: '#636366', fontWeight: '600' },
    consistencyBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
    consistencyText: { fontWeight: '800', fontSize: 13 },
    lastActivity: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 4 },
    historyError: { color: '#9CA3AF', textAlign: 'center', marginVertical: 24 },
    closeHistoryBtn: {
        backgroundColor: '#5856D6', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 12
    },
    closeHistoryBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    // ── DPP Panel (exporter My Orders view) ──────────────────────────
    dppPanel: {
        borderTopWidth: 1, borderTopColor: '#F2F2F7',
        paddingTop: 12, marginTop: 4,
    },
    dppPanelHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
    },
    dppPanelTitle: { fontSize: 12, fontWeight: '700', color: '#5856D6', textTransform: 'uppercase', letterSpacing: 0.5 },
    dppPanelActions: { flexDirection: 'row', gap: 8 },
    dppSummaryBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderWidth: 1.5, borderColor: '#5856D6', borderRadius: 10,
        paddingVertical: 10, backgroundColor: '#EEF0FF',
    },
    dppSummaryBtnText: { color: '#5856D6', fontWeight: '700', fontSize: 13 },
    dppConfidBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderWidth: 1.5, borderColor: '#FF9500', borderRadius: 10,
        paddingVertical: 10, backgroundColor: '#FFF5E5',
    },
    dppConfidBtnText: { color: '#FF9500', fontWeight: '700', fontSize: 13 },
});
