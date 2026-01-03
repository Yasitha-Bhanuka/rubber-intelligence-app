/**
 * Buyer History Screen
 * Displays historical performance and risk indicators for a buyer
 * Helps exporters make informed decisions
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionHeader, StatusBadge, ProgressBar, InfoRow } from '../components';
import { DPPStackParamList } from '../types/dpp.types';
import { mockBuyerHistory } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'BuyerHistory'>;
type RouteType = RouteProp<DPPStackParamList, 'BuyerHistory'>;

/**
 * Buyer History Screen Component
 */
const BuyerHistoryScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteType>();

    // In real app, fetch by ID. Here we use mock data.
    const history = mockBuyerHistory;

    /**
     * Handle flagging a buyer
     */
    const handleFlagBuyer = () => {
        Alert.alert(
            'Flag Buyer',
            'Are you sure you want to flag this buyer for suspicious activity?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Flag Buyer',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Flagged', 'Buyer has been flagged for review.');
                    }
                }
            ]
        );
    };

    /**
     * Calculate acceptance rate
     */
    const acceptanceRate = (history.acceptedCount / history.totalLotsSubmitted) * 100;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Buyer Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Buyer ID Card */}
                <Card>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={32} color="#FFFFFF" />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.buyerId}>{history.buyerReferenceId}</Text>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Risk Level:</Text>
                                <StatusBadge type={history.riskIndicator} />
                            </View>
                        </View>
                    </View>
                </Card>

                <SectionHeader title="Performance Metrics" subtitle="Based on historical lots" />

                {/* Stats Grid */}
                <Card>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{history.totalLotsSubmitted}</Text>
                            <Text style={styles.statLabel}>Total Lots</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
                                {history.acceptedCount}
                            </Text>
                            <Text style={styles.statLabel}>Accepted</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#C62828' }]}>
                                {history.rejectedCount}
                            </Text>
                            <Text style={styles.statLabel}>Rejected</Text>
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Acceptance Rate</Text>
                            <ProgressBar value={acceptanceRate} showPercentage={true} />
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Avg. Authenticity Score</Text>
                            <ProgressBar value={history.averageAuthenticityScore} showPercentage={true} color="#1565C0" />
                        </View>
                    </View>
                </Card>

                <SectionHeader title="Recent Activity" />

                <Card>
                    <InfoRow label="Last Transaction" value={history.lastTransactionDate} />
                    <InfoRow label="Status" value="Active" valueColor="#2E7D32" />
                    <InfoRow label="Member Since" value="2023-05-12" />
                </Card>

                {/* Action Section */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.flagBtn}
                        onPress={handleFlagBuyer}
                    >
                        <Ionicons name="flag" size={20} color="#C62828" />
                        <Text style={styles.flagBtnText}>Flag Suspicious Activity</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1565C0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    buyerId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 13,
        color: '#666666',
        marginRight: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0',
    },
    summaryRow: {
        marginBottom: 12,
    },
    summaryItem: {
        width: '100%',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 4,
    },
    actionSection: {
        padding: 16,
        alignItems: 'center',
    },
    flagBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    flagBtnText: {
        color: '#C62828',
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default BuyerHistoryScreen;
