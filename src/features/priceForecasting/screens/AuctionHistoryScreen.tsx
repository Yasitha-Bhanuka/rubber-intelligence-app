import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../shared/styles/colors';

// Helper component for Stat Cards
const StatCard = ({ title, value, subtitle, icon, iconColor }: any) => (
    <View style={styles.statCard}>
        <View style={styles.statContent}>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.iconWrapper}>
            <Ionicons name={icon} size={24} color={iconColor} />
        </View>
    </View>
);

export const AuctionHistoryScreen = () => {
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState('');

    const historyData = [
        {
            id: '1',
            title: 'TSR20 Technical Grade Rubber',
            seller: 'Central Rubber Estates',
            grade: 'TSR20',
            date: '03/03/2026',
            finalPrice: 435,
            priceIncrement: '+35',
            quantity: '5,000 kg',
            totalValue: '2,175,000',
            winner: 'Global Rubber Exports',
            bids: 24,
            statusColor: '#48BB78'
        },
        {
            id: '2',
            title: 'RSS1 Premium Quality - Galle District',
            seller: 'Perera Rubber Estates',
            grade: 'RSS1',
            date: '07/11/2025',
            finalPrice: 478,
            priceIncrement: '+33',
            quantity: '3,500 kg',
            totalValue: '1,673,000',
            winner: 'Rubber Tech Manufacturing',
            bids: 18,
            statusColor: '#48BB78'
        },
        {
            id: '3',
            title: 'RSS2 High Quality Rubber',
            seller: 'Silva & Sons Plantation',
            grade: 'RSS2',
            date: '06/11/2025',
            finalPrice: 442,
            priceIncrement: '+27',
            quantity: '2,800 kg',
            totalValue: '1,237,600',
            winner: 'Export Lanka Ltd',
            bids: 15,
            statusColor: '#48BB78'
        }
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Auction History</Text>
                    <Text style={styles.headerSubtitle}>Browse past auctions, analyze historical pricing trends, and download reports</Text>
                </View>
            </View>

            {/* Stat Cards Row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContainer}>
                <StatCard title="Total Auctions" value="3" subtitle="completed" icon="ribbon-outline" iconColor="#2962FF" />
                <StatCard title="Total Volume" value="11.3t" subtitle="rubber traded" icon="ribbon-outline" iconColor="#4CAF50" />
                <StatCard title="Average Price" value="LKR 452" subtitle="per kg" icon="ribbon-outline" iconColor="#9C27B0" />
                <StatCard title="Your Wins" value="8" subtitle="auctions won" icon="ribbon-outline" iconColor="#FF9800" />
            </ScrollView>

            {/* Main Content Area */}
            <View style={styles.mainCard}>

                {/* Search & Filters */}
                <View style={styles.filterRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={20} color="#888" style={{ marginLeft: 10 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by title or seller..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownLabel}>Filter by Grade</Text>
                        <TouchableOpacity style={styles.dropdownBtn}>
                            <Text style={styles.dropdownText}>All Grades</Text>
                            <Ionicons name="chevron-down" size={16} color="#888" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownLabel}>Sort By</Text>
                        <TouchableOpacity style={styles.dropdownBtn}>
                            <Text style={styles.dropdownText}>Date (Newest)</Text>
                            <Ionicons name="chevron-down" size={16} color="#888" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Table Header Wrapper (Simulated) */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.thText, { flex: 2 }]}>Auction Details</Text>
                    <Text style={[styles.thText, { flex: 0.8 }]}>Grade</Text>
                    <Text style={[styles.thText, { flex: 1 }]}>Date</Text>
                    <Text style={[styles.thText, { flex: 1.2 }]}>Final Price</Text>
                    <Text style={[styles.thText, { flex: 1.2 }]}>Quantity</Text>
                    <Text style={[styles.thText, { flex: 1.5 }]}>Winner</Text>
                    <Text style={[styles.thText, { flex: 0.8, textAlign: 'center' }]}>Bids</Text>
                    <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Actions</Text>
                </View>

                {/* List Items */}
                {historyData.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                        {/* Details */}
                        <View style={{ flex: 2, paddingRight: 10 }}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemSeller}>{item.seller}</Text>
                        </View>

                        {/* Grade */}
                        <View style={{ flex: 0.8 }}>
                            <View style={styles.gradeBadge}>
                                <Text style={styles.gradeText}>{item.grade}</Text>
                            </View>
                        </View>

                        {/* Date */}
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="calendar-outline" size={14} color="#888" style={{ marginRight: 4 }} />
                            <Text style={styles.tdText}>{item.date}</Text>
                        </View>

                        {/* Price */}
                        <View style={{ flex: 1.2 }}>
                            <Text style={[styles.itemPrice, { color: item.statusColor }]}>LKR {item.finalPrice}/kg</Text>
                            <Text style={styles.itemIncrement}>{item.priceIncrement} from start</Text>
                        </View>

                        {/* Quantity */}
                        <View style={{ flex: 1.2 }}>
                            <Text style={styles.itemQuantity}>{item.quantity}</Text>
                            <Text style={styles.itemTotalVal}>LKR {item.totalValue}</Text>
                        </View>

                        {/* Winner */}
                        <View style={{ flex: 1.5 }}>
                            <Text style={styles.itemWinner}>{item.winner}</Text>
                        </View>

                        {/* Bids */}
                        <View style={{ flex: 0.8, alignItems: 'center' }}>
                            <View style={styles.bidBadge}>
                                <Text style={styles.bidText}>{item.bids}</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Ionicons name="download-outline" size={16} color="#333" />
                                <Text style={styles.actionText}>Report</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

            </View>

            {/* Bottom Export Section */}
            <View style={styles.exportSection}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.exportTitle}>Export Historical Data</Text>
                    <Text style={styles.exportSubtitle}>Download auction history reports for analysis and record-keeping</Text>
                </View>
                <View style={styles.exportBtnsContainer}>
                    <TouchableOpacity style={styles.exportBtn}>
                        <Ionicons name="download-outline" size={16} color="#333" />
                        <Text style={styles.exportBtnText}>Export to CSV</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exportBtn}>
                        <Ionicons name="download-outline" size={16} color="#333" />
                        <Text style={styles.exportBtnText}>Export to PDF</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Analytics Insights */}
            <View style={styles.analyticsSection}>
                <Text style={styles.analyticsTitle}>Historical Price Insights</Text>
                <View style={styles.analyticsGrid}>
                    <View style={styles.analyticsBox}>
                        <Text style={styles.anLabel}>Highest Price (RSS1)</Text>
                        <Text style={[styles.anValue, { color: '#4CAF50' }]}>LKR 485/kg</Text>
                        <Text style={styles.anSub}>November 7, 2025</Text>
                    </View>
                    <View style={styles.analyticsBox}>
                        <Text style={styles.anLabel}>Average Winning Margin</Text>
                        <Text style={[styles.anValue, { color: '#2962FF' }]}>LKR 28/kg</Text>
                        <Text style={styles.anSub}>above starting price</Text>
                    </View>
                    <View style={styles.analyticsBox}>
                        <Text style={styles.anLabel}>Most Competitive</Text>
                        <Text style={[styles.anValue, { color: '#9C27B0' }]}>24 bids</Text>
                        <Text style={styles.anSub}>TSR20 auction</Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#FFF', flexDirection: 'column' },
    backBtn: { marginBottom: 15, alignSelf: 'flex-start' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    headerSubtitle: { fontSize: 14, color: '#666' },

    statsScroll: { paddingLeft: 15, marginVertical: 20 },
    statsContainer: { paddingRight: 30 },
    statCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, width: 220, marginRight: 15, flexDirection: 'row', justifyContent: 'space-between', elevation: 1 },
    statContent: { flex: 1 },
    statTitle: { fontSize: 13, color: '#888', marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    statSubtitle: { fontSize: 12, color: '#888' },
    iconWrapper: { justifyContent: 'flex-start' },

    mainCard: { backgroundColor: '#FFF', margin: 15, borderRadius: 12, elevation: 1, padding: 20 },
    filterRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 30, gap: 15 },
    searchContainer: { flex: 2, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 8, height: 40 },
    searchInput: { flex: 1, height: '100%', paddingHorizontal: 10, fontSize: 14 },
    dropdownContainer: { flex: 1 },
    dropdownLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
    dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 8, height: 40, paddingHorizontal: 12 },
    dropdownText: { fontSize: 13, color: '#333' },

    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 12, marginBottom: 15 },
    thText: { fontSize: 13, fontWeight: 'bold', color: '#333' },

    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    itemTitle: { fontSize: 14, color: '#333', marginBottom: 4 },
    itemSeller: { fontSize: 12, color: '#888' },
    gradeBadge: { alignSelf: 'flex-start', backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
    gradeText: { fontSize: 11, fontWeight: 'bold', color: '#555' },
    tdText: { fontSize: 13, color: '#666' },
    itemPrice: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    itemIncrement: { fontSize: 12, color: '#888' },
    itemQuantity: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    itemTotalVal: { fontSize: 12, color: '#888' },
    itemWinner: { fontSize: 13, color: '#444' },
    bidBadge: { backgroundColor: '#F0F4F8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    bidText: { fontSize: 12, fontWeight: 'bold', color: '#555' },
    actionBtn: { flexDirection: 'row', alignItems: 'center' },
    actionText: { fontSize: 12, fontWeight: 'bold', color: '#333', marginLeft: 4 },

    exportSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 12, elevation: 1 },
    exportTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    exportSubtitle: { fontSize: 12, color: '#666' },
    exportBtnsContainer: { flexDirection: 'row', gap: 10 },
    exportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#DDD' },
    exportBtnText: { fontSize: 13, fontWeight: 'bold', color: '#333', marginLeft: 6 },

    analyticsSection: { backgroundColor: '#F0F7FF', marginHorizontal: 15, borderRadius: 12, padding: 20 },
    analyticsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    analyticsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    analyticsBox: { flex: 1 },
    anLabel: { fontSize: 12, color: '#666', marginBottom: 10 },
    anValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    anSub: { fontSize: 12, color: '#888' }
});
