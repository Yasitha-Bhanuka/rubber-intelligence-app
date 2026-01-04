/**
 * DPP Home Dashboard Screen
 * Central hub for both Buyer and Exporter roles
 * Provides navigation to all DPP features
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';


import { Card, SectionHeader, StatusBadge } from '../components';
import { DPPStackParamList, UserRole } from '../types/dpp.types';
import { mockRecentLots, mockDashboardStats, mockDPPData } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'DPPHome'>;

/**
 * DPP Home Screen - Main Dashboard
 * Acts as the central navigation point for the DPP system
 */
const DPPHomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // Mock role - can be 'buyer' or 'exporter'
    // In real app, this would come from auth context
    const [role, setRole] = useState<UserRole>('buyer');

    const stats = role === 'buyer' ? mockDashboardStats.buyer : mockDashboardStats.exporter;

    /**
     * Toggle between buyer and exporter roles for demo purposes
     */
    const toggleRole = () => {
        setRole(prev => prev === 'buyer' ? 'exporter' : 'buyer');
    };

    /**
     * Generate and download PDF for a lot
     * Creates a mock PDF content and saves to device
     */
    /**
     * Generate and download PDF for a lot
     * Creates a mock PDF content and saves to device
     */
    const handleDownloadPDF = async (lotId: string) => {
        try {
            // Mock PDF generation delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            Alert.alert(
                'Download Complete',
                `DPP document for ${lotId} has been saved to your device.`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Alert.alert('Error', 'Failed to generate PDF. Please try again.');
        }
    };

    /**
     * Render statistics card based on role
     */
    const renderStatsCard = () => {
        if (role === 'buyer') {
            const buyerStats = mockDashboardStats.buyer;
            return (
                <Card title="Your Statistics">
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{buyerStats.totalLots}</Text>
                            <Text style={styles.statLabel}>Total Lots</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#E65100' }]}>
                                {buyerStats.pendingVerification}
                            </Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
                                {buyerStats.verified}
                            </Text>
                            <Text style={styles.statLabel}>Verified</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: '#C62828' }]}>
                                {buyerStats.rejected}
                            </Text>
                            <Text style={styles.statLabel}>Rejected</Text>
                        </View>
                    </View>
                </Card>
            );
        }

        const exporterStats = mockDashboardStats.exporter;
        return (
            <Card title="Exporter Dashboard">
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#E65100' }]}>
                            {exporterStats.pendingReview}
                        </Text>
                        <Text style={styles.statLabel}>Pending Review</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
                            {exporterStats.accepted}
                        </Text>
                        <Text style={styles.statLabel}>Accepted</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#C62828' }]}>
                            {exporterStats.rejected}
                        </Text>
                        <Text style={styles.statLabel}>Rejected</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#9E9E9E' }]}>
                            {exporterStats.flaggedBuyers}
                        </Text>
                        <Text style={styles.statLabel}>Flagged</Text>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Digital Product Passport</Text>
                        <Text style={styles.subtitle}>Secure Rubber Supply Chain</Text>
                    </View>
                    <TouchableOpacity style={styles.roleToggle} onPress={toggleRole}>
                        <Ionicons
                            name={role === 'buyer' ? 'cart' : 'airplane'}
                            size={20}
                            color="#FFFFFF"
                        />
                        <Text style={styles.roleText}>
                            {role === 'buyer' ? 'Buyer' : 'Exporter'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Statistics */}
                {renderStatsCard()}

                {/* Quick Actions */}
                <SectionHeader
                    title="Quick Actions"
                    subtitle={role === 'buyer' ? 'Create and manage your lots' : 'Review incoming lots'}
                />

                <View style={styles.actionsContainer}>
                    {role === 'buyer' ? (
                        <>
                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('CreateLot')}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="add-circle" size={28} color="#2E7D32" />
                                </View>
                                <Text style={styles.actionTitle}>Create New Lot</Text>
                                <Text style={styles.actionDesc}>Start a new rubber lot</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('UploadDocuments', {
                                    lotInfo: {
                                        lotId: 'LOT-2024-001',
                                        quantity: 500,
                                        rubberType: 'RSS1',
                                        collectionDate: new Date().toISOString().split('T')[0],
                                        collectionLocation: 'Sample Location',
                                        createdAt: new Date().toISOString(),
                                    }
                                })}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="document-attach" size={28} color="#1565C0" />
                                </View>
                                <Text style={styles.actionTitle}>Upload Documents</Text>
                                <Text style={styles.actionDesc}>Add certificates</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('Scan')}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="qr-code" size={28} color="#2E7D32" />
                                </View>
                                <Text style={styles.actionTitle}>Scan QR/NFC</Text>
                                <Text style={styles.actionDesc}>Verify rubber lot</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionCard}
                                onPress={() => navigation.navigate('DPPView', { dppData: mockDPPData })}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="document-text" size={28} color="#1565C0" />
                                </View>
                                <Text style={styles.actionTitle}>View DPP</Text>
                                <Text style={styles.actionDesc}>Review passport</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Recent Lots */}
                <SectionHeader
                    title="Recent Lots"
                    subtitle="Your latest submissions"
                />

                {mockRecentLots.map((lot, index) => (
                    <Card key={lot.lotId}>
                        <View style={styles.lotHeader}>
                            <View>
                                <Text style={styles.lotId}>{lot.lotId}</Text>
                                <Text style={styles.lotMeta}>
                                    {lot.rubberType} • {lot.quantity} units
                                </Text>
                            </View>
                            <StatusBadge type={lot.status as any} />
                        </View>
                        <View style={styles.lotDetails}>
                            <Text style={styles.lotLocation}>
                                <Ionicons name="location" size={14} color="#666" /> {lot.collectionLocation}
                            </Text>
                            <Text style={styles.lotDate}>
                                <Ionicons name="calendar" size={14} color="#666" /> {lot.collectionDate}
                            </Text>
                        </View>
                        {role === 'buyer' && lot.status === 'verified' && (
                            <TouchableOpacity
                                style={styles.downloadBtn}
                                onPress={() => handleDownloadPDF(lot.lotId)}
                            >
                                <Ionicons name="download" size={18} color="#2E7D32" />
                                <Text style={styles.downloadBtnText}>Download DPP</Text>
                            </TouchableOpacity>
                        )}
                    </Card>
                ))}

                {/* Bottom spacing */}
                <View style={{ height: 30 }} />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
        backgroundColor: '#2E7D32',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#C8E6C9',
        marginTop: 2,
    },
    roleToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
    },
    actionDesc: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
    },
    lotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    lotId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    lotMeta: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    lotDetails: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    lotLocation: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 4,
    },
    lotDate: {
        fontSize: 13,
        color: '#666666',
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 12,
    },
    downloadBtnText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default DPPHomeScreen;
