import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../shared/styles/colors';

const SCREEN_WIDTH = Dimensions.get("window").width;

export const AuctionBiddingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || { id: '1' };

    // Mock data based on provided image
    const auctionData = id === '1' ? {
        title: "Premium RSS1 Rubber - Kalutara District",
        subtitle: "Ribbed Smoked Sheet Grade 1 - Premium Quality",
        grade: "RSS1",
        currentPrice: 485,
        quantity: "2,500 kg",
        seller: "Kamal Perera (via Broker: Silva & Co)",
        highestBidder: "Export Lanka Ltd",
        totalBids: 12,
        minIncrement: 5,
        timeRemaining: "23m 18s",
        progress: 0.6
    } : {
        title: "RSS3 Standard Grade - Ratnapura",
        subtitle: "Ribbed Smoked Sheet Grade 3 - Standard Quality",
        grade: "RSS3",
        currentPrice: 410,
        quantity: "1,800 kg",
        seller: "Nimal Fernando",
        highestBidder: "Rubber Tech Manufacturing",
        totalBids: 8,
        minIncrement: 5,
        timeRemaining: "38m 18s",
        progress: 0.4
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header / Back */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Auction Details</Text>
            </View>

            {/* Auction Info Card */}
            <View style={styles.mainCard}>
                <View style={styles.tagSection}>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>Live</Text>
                    </View>
                    <View style={styles.gradeBadge}>
                        <Text style={styles.gradeText}>{auctionData.grade}</Text>
                    </View>
                    <View style={styles.nftBadge}>
                        <Ionicons name="shield-checkmark" size={12} color="#2E7D32" />
                        <Text style={styles.nftBadgeText}>NFT Secured</Text>
                    </View>
                </View>

                <Text style={styles.title}>{auctionData.title}</Text>
                <Text style={styles.subtitle}>{auctionData.subtitle}</Text>

                {/* Timer Section */}
                <View style={styles.timerSection}>
                    <View style={styles.timerHeader}>
                        <Text style={styles.timerLabel}>Time Remaining</Text>
                        <View style={styles.timerValueRow}>
                            <Ionicons name="time-outline" size={16} color="#FF6D00" />
                            <Text style={styles.timerValue}>{auctionData.timeRemaining}</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${auctionData.progress * 100}%` }]} />
                    </View>
                </View>

                {/* Price & Quantity Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Current Price</Text>
                        <Text style={styles.currentPriceText}>LKR {auctionData.currentPrice}/kg</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Quantity</Text>
                        <Text style={styles.statValueText}>{auctionData.quantity}</Text>
                    </View>
                </View>

                {/* Detailed Info */}
                <View style={styles.infoList}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Seller:</Text>
                        <Text style={styles.infoValue}>{auctionData.seller}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Highest Bidder:</Text>
                        <Text style={styles.infoValue}>{auctionData.highestBidder}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Bids:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.infoValue}>{auctionData.totalBids} </Text>
                            <TouchableOpacity>
                                <Text style={styles.viewHistoryText}>View History</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Minimum Increment:</Text>
                        <Text style={styles.infoValue}>LKR {auctionData.minIncrement}/kg</Text>
                    </View>
                </View>

                {/* NFT Passport Section */}
                <View style={styles.nftSection}>
                    <Text style={styles.nftTitle}>Digital Passport (NFT)</Text>
                    <View style={styles.nftRow}>
                        <Ionicons name="cube-outline" size={32} color="#333" />
                        <View style={styles.nftDetails}>
                            <Text style={styles.nftLabel}>Token ID</Text>
                            <Text style={styles.nftValue}>0x7b...82a</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.traceBtn}
                            onPress={() => navigation.navigate('Traceability', { lotId: id })}
                        >
                            <Text style={styles.traceBtnText}>Traceability</Text>
                            <Ionicons name="chevron-forward" size={16} color="#2962FF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bid Actions */}
                <View style={styles.bidActions}>
                    <View style={styles.incrementRow}>
                        <TouchableOpacity style={styles.incrementBtn}>
                            <Ionicons name="flash-outline" size={18} color="#333" />
                            <Text style={styles.incrementText}>+5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.incrementBtn}>
                            <Ionicons name="flash-outline" size={18} color="#333" />
                            <Text style={styles.incrementText}>+10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.incrementBtn}>
                            <Ionicons name="flash-outline" size={18} color="#333" />
                            <Text style={styles.incrementText}>+25</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.placeBidBtn}
                        onPress={() => navigation.navigate('PlaceBid', {
                            title: auctionData.title,
                            currentPrice: auctionData.currentPrice,
                            quantityKg: parseInt(auctionData.quantity.replace(/[^0-9]/g, ''))
                        })}
                    >
                        <Ionicons name="hammer-outline" size={20} color="#FFF" />
                        <Text style={styles.placeBidText}>Place Custom Bid</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
    backBtn: { padding: 8, marginRight: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    mainCard: { backgroundColor: '#FFF', margin: 15, borderRadius: 20, padding: 20, elevation: 2 },
    tagSection: { flexDirection: 'row', marginBottom: 15 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
    liveText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
    gradeBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
    gradeText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
    nftBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    nftBadgeText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

    title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 25 },

    timerSection: { marginBottom: 25 },
    timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    timerLabel: { fontSize: 14, color: '#888' },
    timerValueRow: { flexDirection: 'row', alignItems: 'center' },
    timerValue: { color: '#FF6D00', fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
    progressBarBg: { height: 8, backgroundColor: '#EEEEEE', borderRadius: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#333', borderRadius: 4 },

    statsGrid: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 15, marginBottom: 25 },
    statBox: { flex: 1 },
    statLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
    currentPriceText: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
    statValueText: { fontSize: 20, fontWeight: 'bold', color: '#333' },

    infoList: { marginBottom: 30 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    infoLabel: { color: '#888', fontSize: 14 },
    infoValue: { color: '#333', fontSize: 14, fontWeight: '500' },
    viewHistoryText: { color: '#2962FF', fontSize: 12, fontWeight: 'bold' },

    nftSection: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 15, marginBottom: 25, borderLeftWidth: 4, borderLeftColor: '#2E7D32' },
    nftTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    nftRow: { flexDirection: 'row', alignItems: 'center' },
    nftDetails: { flex: 1, marginLeft: 12 },
    nftLabel: { fontSize: 11, color: '#888' },
    nftValue: { fontSize: 13, color: '#333', fontWeight: 'bold' },
    traceBtn: { flexDirection: 'row', alignItems: 'center' },
    traceBtnText: { color: '#2962FF', fontWeight: 'bold', fontSize: 13, marginRight: 4 },

    bidActions: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
    incrementRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    incrementBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', paddingVertical: 10, borderRadius: 8, marginHorizontal: 4 },
    incrementText: { marginLeft: 4, fontWeight: 'bold', color: '#333' },
    placeBidBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2962FF', paddingVertical: 15, borderRadius: 12 },
    placeBidText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});
