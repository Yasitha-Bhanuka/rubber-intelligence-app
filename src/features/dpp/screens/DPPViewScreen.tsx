/**
 * DPP View Screen
 * The core screen for the Exporter to view the Digital Product Passport
 * Displays all verified information, quality metrics, and AI verification results
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionHeader, StatusBadge, ProgressBar, InfoRow } from '../components';
import { DPPStackParamList, DPPData } from '../types/dpp.types';
import { mockDPPData } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'DPPView'>;
type RouteType = RouteProp<DPPStackParamList, 'DPPView'>;

/**
 * DPP View Screen Component
 * Detailed view of the Digital Product Passport
 */
const DPPViewScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteType>();

    // Use passed data or mock data as fallback
    const dppData: DPPData = route.params?.dppData || mockDPPData;

    // State for secure data unlocking
    const [isUnlocked, setIsUnlocked] = useState(false);

    /**
     * Handle unlock confidential data
     */
    const handleUnlock = () => {
        Alert.alert(
            'Authentication Required',
            'Please authenticate to access confidential pricing and supplier data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Authenticate',
                    onPress: () => {
                        setIsUnlocked(true);
                        Alert.alert('Success', 'Confidential data decrypted and unlocked.');
                    }
                }
            ]
        );
    };

    /**
     * Handle lot decision (Accept/Reject)
     */
    const handleDecision = (decision: 'accept' | 'reject') => {
        Alert.alert(
            decision === 'accept' ? 'Accept Lot' : 'Reject Lot',
            `Are you sure you want to ${decision} this lot? This action will be recorded in the blockchain.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: decision === 'reject' ? 'destructive' : 'default',
                    onPress: () => {
                        Alert.alert(
                            'Processed',
                            `Lot has been ${decision}ed successfully.`,
                            [{ text: 'OK', onPress: () => navigation.navigate('DPPHome') }]
                        );
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.navigate('DPPHome')}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Digital Product Passport</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Status Banner */}
                <View style={styles.statusBanner}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusBadgeContainer}>
                            <StatusBadge type={dppData.status} />
                        </View>
                        <Text style={styles.dppId}>ID: {dppData.dppId}</Text>
                    </View>
                </View>

                {/* Lot Information */}
                <SectionHeader title="Lot Information" />
                <Card>
                    <InfoRow label="Lot ID" value={dppData.lotId} />
                    <InfoRow label="Rubber Type" value={dppData.rubberType} />
                    <InfoRow label="Batch Date" value={dppData.batchDate} />
                    <InfoRow label="Origin" value={dppData.collectionLocation} />
                    <InfoRow label="Processing" value={dppData.processingMethod} />
                </Card>

                {/* Quality Summary */}
                <SectionHeader title="Quality Summary" />
                <Card>
                    <View style={styles.gradeContainer}>
                        <View style={styles.gradeCircle}>
                            <Text style={styles.gradeText}>{dppData.finalGrade.split(' ')[1]}</Text>
                            <Text style={styles.gradeLabel}>Grade</Text>
                        </View>
                        <View style={styles.gradeMetrics}>
                            <InfoRow label="Weight" value={`${dppData.finalWeight} kg`} />
                            <InfoRow label="Moisture" value={`${dppData.moisturePercentage}%`} />
                        </View>
                    </View>
                    <View style={styles.remarkBox}>
                        <Text style={styles.remarkLabel}>Grader's Remark:</Text>
                        <Text style={styles.remarkText}>"{dppData.qualityRemark}"</Text>
                    </View>
                </Card>

                {/* AI Verification Results */}
                <SectionHeader title="AI Verification Results" />
                <Card>
                    <View style={styles.verificationRow}>
                        <Text style={styles.verificationLabel}>Authenticity</Text>
                        <StatusBadge type={dppData.authenticityResult === 'authentic' ? 'verified' : 'suspicious'} text={dppData.authenticityResult.toUpperCase()} />
                    </View>

                    <View style={styles.scoreContainer}>
                        <ProgressBar
                            value={dppData.authenticityScore}
                            label="Authenticity Score"
                        />
                    </View>

                    <View style={styles.securityRow}>
                        <Ionicons name="lock-closed" size={16} color="#2E7D32" />
                        <Text style={styles.securityText}>
                            Blockchain Verified & Encrypted
                        </Text>
                    </View>
                </Card>

                {/* Secure Data Section */}
                <SectionHeader title="Secure Data" subtitle="Confidential information" />
                <Card>
                    {isUnlocked ? (
                        <>
                            <View style={styles.unlockedHeader}>
                                <Ionicons name="lock-open" size={20} color="#2E7D32" />
                                <Text style={styles.unlockedTitle}>Data Decrypted</Text>
                            </View>
                            <InfoRow label="Buyer Ref" value={dppData.buyerReferenceId} />
                            <InfoRow label="Bank Details" value="**** **** **** 4589" />
                            <InfoRow label="Contract Price" value="$2.45 / kg" valueColor="#2E7D32" />

                            <TouchableOpacity
                                style={styles.historyBtn}
                                onPress={() => navigation.navigate('BuyerHistory', {
                                    buyerReferenceId: dppData.buyerReferenceId
                                })}
                            >
                                <Text style={styles.historyBtnText}>View Buyer History</Text>
                                <Ionicons name="chevron-forward" size={16} color="#1565C0" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.lockedContainer}>
                            <View style={styles.lockedIcon}>
                                <Ionicons name="lock-closed" size={32} color="#666666" />
                            </View>
                            <Text style={styles.lockedTitle}>Restricted Access</Text>
                            <Text style={styles.lockedDesc}>
                                This section contains confidential buyer and pricing information.
                            </Text>
                            <TouchableOpacity
                                style={styles.unlockBtn}
                                onPress={handleUnlock}
                            >
                                <Text style={styles.unlockBtnText}>Unlock Confidential Data</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleDecision('reject')}
                    >
                        <Ionicons name="close-circle" size={24} color="#C62828" />
                        <Text style={[styles.actionBtnText, { color: '#C62828' }]}>Reject Lot</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => handleDecision('accept')}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Accept Lot</Text>
                    </TouchableOpacity>
                </View>

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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 20,
        backgroundColor: '#2E7D32',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statusBanner: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadgeContainer: {
        alignItems: 'flex-start',
    },
    dppId: {
        fontSize: 13,
        color: '#666666',
        fontFamily: 'monospace',
    },
    gradeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    gradeCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2E7D32',
        marginRight: 16,
    },
    gradeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2E7D32',
    },
    gradeLabel: {
        fontSize: 10,
        color: '#2E7D32',
        marginTop: -4,
    },
    gradeMetrics: {
        flex: 1,
    },
    remarkBox: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 6,
    },
    remarkLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 4,
    },
    remarkText: {
        fontSize: 13,
        color: '#333333',
        fontStyle: 'italic',
    },
    verificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    verificationLabel: {
        fontSize: 14,
        color: '#666666',
    },
    scoreContainer: {
        marginBottom: 16,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 4,
    },
    securityText: {
        fontSize: 12,
        color: '#2E7D32',
        marginLeft: 6,
        fontWeight: '500',
    },
    unlockedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    unlockedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
        marginLeft: 8,
    },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    historyBtnText: {
        fontSize: 14,
        color: '#1565C0',
        fontWeight: '500',
        marginRight: 4,
    },
    lockedContainer: {
        alignItems: 'center',
        padding: 16,
    },
    lockedIcon: {
        marginBottom: 12,
        opacity: 0.5,
    },
    lockedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 6,
    },
    lockedDesc: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 18,
    },
    unlockBtn: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    unlockBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    actionContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    rejectBtn: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
    },
    acceptBtn: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default DPPViewScreen;
