import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSellingPosts, requestPurchase } from '../services/marketplaceService';
import { SellingPost } from '../types';

export default function MarketplaceScreen() {
    const navigation = useNavigation<any>();
    const [posts, setPosts] = useState<SellingPost[]>([]);
    const [loading, setLoading] = useState(false);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await getSellingPosts();
            setPosts(data);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPosts();
        }, [])
    );

    const handleRequest = (post: SellingPost) => {
        Alert.alert(
            'Request Quote',
            `Send purchase request for ${post.grade} (${post.quantityKg}kg)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Request',
                    onPress: async () => {
                        try {
                            const transaction = await requestPurchase(post.id, post.pricePerKg, "I am interested in this lot.");
                            Alert.alert('Success', 'Request Sent! Check Transactions tab.');
                            // Navigate to Negotiation?
                            navigation.navigate('Negotiation', { transactionId: transaction.id });
                        } catch (e) {
                            Alert.alert('Error', 'Failed to send request');
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

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleRequest(item)}>
                <Text style={styles.actionBtnText}>Request Quote</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Rubber Marketplace</Text>
                <Text style={styles.subtitle}>Available Export Lots</Text>
            </View>

            {loading && posts.length === 0 ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={loadPosts}
                    ListEmptyComponent={<Text style={styles.empty}>No active posts available.</Text>}
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
    actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
