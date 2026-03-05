import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../shared/styles/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PriceForecastingService } from '../services/priceForecastingService';
import { BiddingService, BiddingAuction } from '../services/biddingService';
import { useStore } from '../../../store';

const SCREEN_WIDTH = Dimensions.get("window").width;

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const role = user?.role || 'buyer'; // default fallback
    const [priceHistory, setPriceHistory] = useState<any[]>([]);
    const [auctions, setAuctions] = useState<BiddingAuction[]>([]);
    const [wonAuctions, setWonAuctions] = useState<BiddingAuction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [trend, setTrend] = useState({ value: 0, isPositive: true });
    const [tick, setTick] = useState(0); // For live countdowns

    // UI Tick for countdowns
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Polling loop for active and won auctions
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [activeData, closedData] = await Promise.all([
                    BiddingService.getActiveAuctions(),
                    BiddingService.getClosedAuctions()
                ]);
                setAuctions(activeData);
                if (user?.name) {
                    setWonAuctions(closedData.filter(a => a.status === 'Closed' && a.highestBidder === user.name));
                }
            } catch (error) {
                // fail silently in background poll
            }
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadData = useCallback(async () => {
        try {
            const [historyData, auctionData, closedData] = await Promise.all([
                PriceForecastingService.getPriceHistory(),
                BiddingService.getActiveAuctions(),
                BiddingService.getClosedAuctions()
            ]);
            setPriceHistory(historyData);
            setAuctions(auctionData);
            if (user?.name) {
                setWonAuctions(closedData.filter(a => a.status === 'Closed' && a.highestBidder === user.name));
            }
            calculateTrend(historyData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Cache guard: only refetch if data is stale (30 seconds)
    const lastFetchRef = useRef(0);
    const CACHE_TTL = 30000;

    // Load data when screen comes into focus (with cache guard)
    useFocusEffect(
        useCallback(() => {
            if (Date.now() - lastFetchRef.current > CACHE_TTL) {
                lastFetchRef.current = Date.now();
                loadData();
            }
        }, [loadData])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        lastFetchRef.current = Date.now(); // Reset cache on manual refresh
        loadData();
    }, [loadData]);

    const calculateTrend = (data: any[]) => {
        if (data.length < 2) return;
        const current = data[0].price; // Newest
        const previous = data[1].price; // Second newest
        const change = ((current - previous) / previous) * 100;
        setTrend({
            value: Math.abs(change),
            isPositive: change >= 0
        });
    };

    // Memoize chart data — only recompute when priceHistory changes
    const chartData = useMemo(() => ({
        labels: priceHistory.length > 0
            ? priceHistory.slice(0, 6).reverse().map(item => {
                const d = new Date(item.date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            })
            : ["Now"],
        datasets: [
            {
                data: priceHistory.length > 0
                    ? priceHistory.slice(0, 6).reverse().map(item => item.price)
                    : [0],
            }
        ]
    }), [priceHistory]);

    const latestPrice = useMemo(() =>
        priceHistory.length > 0 ? priceHistory[0].price : 0,
        [priceHistory]);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header Section */}
            <LinearGradient
                colors={['#1B5E20', '#4CAF50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Market Overview</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn}>
                        <Ionicons name="notifications-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Main Stats Card */}
                <View style={styles.mainStatsContainer}>
                    <View>
                        <Text style={styles.mainStatsLabel}>Latest RSS1 Price</Text>
                        <Text style={styles.mainStatsValue}>
                            {loading ? '...' : `LKR ${latestPrice.toFixed(2)}`}
                        </Text>
                    </View>
                    <View style={[styles.trendBadge, { backgroundColor: trend.isPositive ? 'rgba(255,255,255,0.2)' : 'rgba(255,0,0,0.2)' }]}>
                        <Ionicons name={trend.isPositive ? "arrow-up" : "arrow-down"} size={16} color="#FFF" />
                        <Text style={styles.trendText}>{trend.value.toFixed(1)}%</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Chart Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Price Trend (Last 7 Days)</Text>
                <View style={styles.chartCard}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ height: 220 }} />
                    ) : (
                        <LineChart
                            data={chartData}
                            width={SCREEN_WIDTH - 40}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, 0.5)`,
                                style: { borderRadius: 16 },
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "2",
                                    stroke: "#2E7D32"
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: "" // Solid lines
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    )}
                </View>
            </View>

            {/* Active Auctions Section */}
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Active Auctions</Text>
                    <TouchableOpacity>
                        <Text style={{ color: '#666', fontWeight: '500' }}>View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ margin: 20 }} />
                    ) : auctions.length === 0 ? (
                        <Text style={{ margin: 20, color: '#666' }}>No active auctions at the moment.</Text>
                    ) : auctions.map((auction) => {
                        let timeBlock = 'Ended';
                        if (auction.endTime && auction.status !== 'Closed') {
                            // Safely extract just the YYYY-MM-DDTHH:mm:ss part to avoid Hermes NaN issues with fractional seconds
                            const cleanStr = auction.endTime.substring(0, 19);
                            let diffS = Math.max(0, Math.floor((new Date(cleanStr + "Z").getTime() - new Date().getTime()) / 1000));
                            if (diffS > 0) {
                                let m = Math.floor(diffS / 60);
                                let s = diffS % 60;
                                timeBlock = `${m}min ${s < 10 ? '0' : ''}${s}s`;
                            } else {
                                timeBlock = 'Closed';
                            }
                        } else if (auction.status === 'Closed') {
                            timeBlock = 'Closed';
                        }

                        return (
                            <View key={auction.id} style={styles.auctionCard}>
                                <View style={styles.auctionHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.auctionTitle}>{auction.title}</Text>
                                        <Text style={styles.auctionSubtitle}>{auction.subtitle}</Text>
                                    </View>
                                    <View style={[styles.activeBadge, timeBlock === 'Ended' && { backgroundColor: '#FFCDD2' }]}>
                                        <Text style={[styles.activeBadgeText, timeBlock === 'Ended' && { color: '#B71C1C' }]}>
                                            {timeBlock}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.auctionDetails}>
                                    <View>
                                        <Text style={styles.detailLabel}>Current Price</Text>
                                        <Text style={styles.detailValuePrice}>LKR {auction.currentPrice}/kg</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.detailLabel}>Quantity</Text>
                                        <Text style={styles.detailValue}>{auction.quantity}</Text>
                                    </View>
                                </View>

                                <View style={styles.bidderSection}>
                                    <Text style={styles.detailLabel}>Highest Bidder</Text>
                                    <Text style={styles.detailValue}>{auction.highestBidder}</Text>
                                </View>

                                {role !== 'farmer' && (
                                    <TouchableOpacity
                                        style={styles.placeBidBtn}
                                        onPress={() => navigation.navigate('AuctionBidding', { id: auction.id })}
                                    >
                                        <Text style={styles.placeBidText}>Place Bid</Text>
                                    </TouchableOpacity>
                                )}
                                {role === 'farmer' && (
                                    <TouchableOpacity
                                        style={[styles.placeBidBtn, { backgroundColor: '#E0E0E0' }]}
                                        onPress={() => navigation.navigate('AuctionBidding', { id: auction.id })}
                                    >
                                        <Text style={[styles.placeBidText, { color: '#666' }]}>View Auction</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )
                    })}
                </ScrollView>
            </View>

            {/* Won Auctions Section (Buyer only) */}
            {role !== 'farmer' && wonAuctions.length > 0 && (
                <View style={[styles.section, { paddingTop: 0 }]}>
                    <Text style={styles.sectionTitle}>My Won Auctions</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                        {wonAuctions.map((auction) => (
                            <View key={auction.id} style={[styles.auctionCard, { borderColor: '#4CAF50', borderWidth: 1.5 }]}>
                                <View style={styles.auctionHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.auctionTitle}>{auction.title}</Text>
                                        <Text style={styles.auctionSubtitle}>{auction.subtitle}</Text>
                                    </View>
                                    <View style={[styles.activeBadge, { backgroundColor: '#E8F5E9' }]}>
                                        <Ionicons name="trophy" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
                                        <Text style={[styles.activeBadgeText, { color: '#2E7D32' }]}>
                                            Won
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.auctionDetails}>
                                    <View>
                                        <Text style={styles.detailLabel}>Winning Bid</Text>
                                        <Text style={styles.detailValuePrice}>LKR {auction.currentPrice}/kg</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.detailLabel}>Quantity</Text>
                                        <Text style={styles.detailValue}>{auction.quantity}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.placeBidBtn, { backgroundColor: '#2E7D32' }]}
                                    onPress={() => navigation.navigate('Traceability', { lotId: auction.id })}
                                >
                                    <Text style={styles.placeBidText}>View Blockchain Details</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#E8F5E9' }]}
                        onPress={() => navigation.navigate('PredictionForm')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#2E7D32' }]}>
                            <Ionicons name="calculator" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.actionLabel}>New Prediction</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#E3F2FD' }]}
                        onPress={() => navigation.navigate('Report')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#1565C0' }]}>
                            <Ionicons name="bar-chart" size={24} color="#FFF" />
                        </View>
                        <Text style={styles.actionLabel}>View Reports</Text>
                    </TouchableOpacity>
                </View>

                {role === 'farmer' && (
                    <TouchableOpacity
                        style={styles.portalActionCard}
                        onPress={() => navigation.navigate('MyAuctions')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#7B1FA2', marginBottom: 0, marginRight: 15 }]}>
                            <Ionicons name="business" size={24} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.portalActionLabel}>Farmer Portal</Text>
                            <Text style={styles.portalActionSub}>Manage NFT Bidding & Lots</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#7B1FA2" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.portalActionCard, { backgroundColor: '#E8EAF6' }]}
                    onPress={() => navigation.navigate('AuctionHistory')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: '#3F51B5', marginBottom: 0, marginRight: 15 }]}>
                        <Ionicons name="time" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.portalActionLabel, { color: '#1A237E' }]}>Auction History</Text>
                        <Text style={[styles.portalActionSub, { color: '#3F51B5' }]}>View past auctions and statistics</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#3F51B5" />
                </TouchableOpacity>
            </View>

            {/* Recent Activity List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    priceHistory.slice(0, 3).map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                            <View style={styles.historyIcon}>
                                <Ionicons name="time-outline" size={20} color="#666" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.historyGrade}>{item.grade} Grade</Text>
                                <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.historyPrice}>LKR {item.price.toFixed(2)}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 30 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    date: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    profileBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

    mainStatsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mainStatsLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 5 },
    mainStatsValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
    trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    trendText: { color: '#FFF', fontWeight: 'bold', marginLeft: 4, fontSize: 14 },

    section: { padding: 20, paddingBottom: 0 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },

    chartCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },

    actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    actionCard: { width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionLabel: { fontSize: 15, fontWeight: '600', color: '#333' },

    portalActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E5F5',
        padding: 20,
        borderRadius: 20,
        marginTop: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    portalActionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    portalActionSub: { fontSize: 12, color: '#7B1FA2', marginTop: 2 },

    historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10, elevation: 1 },
    historyIcon: { width: 40, height: 40, backgroundColor: '#F5F5F5', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    historyGrade: { fontSize: 16, fontWeight: '600', color: '#333' },
    historyDate: { fontSize: 12, color: '#999', marginTop: 2 },
    historyPrice: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },

    // Auction Styles
    auctionCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        width: SCREEN_WIDTH * 0.85,
        marginRight: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE'
    },
    auctionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15
    },
    auctionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        maxWidth: '80%'
    },
    auctionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 4
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15
    },
    activeBadgeText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: 'bold'
    },
    auctionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15
    },
    detailLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    detailValuePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32'
    },
    bidderSection: {
        marginBottom: 20
    },
    placeBidBtn: {
        backgroundColor: '#2962FF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center'
    },
    placeBidText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    }
});
