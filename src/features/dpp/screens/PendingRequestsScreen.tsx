/**
 * PendingRequestsScreen — BUYER ONLY
 *
 * Shows all PENDING access requests from exporters.
 * Buyer can tap "View Exporter Profile" to see ExporterContext before approving.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getPendingAccessRequests, approveAccessRequest, getExporterContext } from '../services/dppService';
import { AccessRequest, ExporterContext } from '../types';

export default function PendingRequestsScreen() {
    const navigation = useNavigation<any>();

    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [approving, setApproving] = useState<string | null>(null);

    // ExporterContext modal state
    const [contextModal, setContextModal] = useState(false);
    const [contextLoading, setContextLoading] = useState(false);
    const [exporterContext, setExporterContext] = useState<ExporterContext | null>(null);

    const load = useCallback(async () => {
        try {
            const data = await getPendingAccessRequests();
            setRequests(data);
        } catch (e) {
            console.error('Failed to load requests', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleViewContext = async (exporterId: string) => {
        setExporterContext(null);
        setContextModal(true);
        setContextLoading(true);
        try {
            const ctx = await getExporterContext(exporterId);
            setExporterContext(ctx);
        } catch {
            setExporterContext(null);
        } finally {
            setContextLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        Alert.alert(
            'Approve Access',
            'Grant this exporter access to view the confidential fields for this lot? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        try {
                            setApproving(requestId);
                            await approveAccessRequest(requestId);
                            setRequests(prev => prev.filter(r => r.id !== requestId));
                            Alert.alert('Approved', 'The exporter can now view confidential fields for this lot.');
                        } catch (e: any) {
                            Alert.alert('Error', e?.response?.data?.error ?? 'Failed to approve request.');
                        } finally {
                            setApproving(null);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: AccessRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                    <Ionicons name="person" size={20} color="#4F46E5" />
                </View>
                <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>Exporter Request</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                        ID: {item.exporterId.substring(0, 16)}…
                    </Text>
                </View>
                <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>PENDING</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
                <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
                <Text style={styles.cardDetail} numberOfLines={1}>Lot: {item.lotId}</Text>
            </View>
            <View style={styles.cardRow}>
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text style={styles.cardDetail}>
                    Requested: {new Date(item.requestedAt).toLocaleString()}
                </Text>
            </View>

            {/* Exporter profile context button */}
            <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => handleViewContext(item.exporterId)}
            >
                <Ionicons name="information-circle-outline" size={16} color="#4F46E5" />
                <Text style={styles.profileBtnText}>View Exporter Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(item.id)}
                disabled={approving === item.id}
            >
                {approving === item.id
                    ? <ActivityIndicator color="white" />
                    : <>
                        <Ionicons name="checkmark-circle" size={18} color="white" />
                        <Text style={styles.approveBtnText}>Approve Access</Text>
                    </>
                }
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Ionicons name="shield-checkmark" size={34} color="#10B981" />
                    <Text style={styles.headerTitle}>Access Requests</Text>
                    <Text style={styles.headerSub}>
                        {requests.length} pending approval{requests.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : requests.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="checkmark-done-circle" size={64} color="#D1FAE5" />
                    <Text style={styles.emptyTitle}>All Clear</Text>
                    <Text style={styles.emptyDesc}>No pending access requests from exporters.</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            tintColor="#4F46E5"
                        />
                    }
                />
            )}

            {/* Exporter Context Modal */}
            <Modal visible={contextModal} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.contextCard}>
                        <View style={styles.ctxHeader}>
                            <Ionicons name="person-circle-outline" size={36} color="#4F46E5" />
                            <Text style={styles.contextTitle}>Exporter Profile</Text>
                            <TouchableOpacity onPress={() => setContextModal(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={22} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {contextLoading ? (
                            <ActivityIndicator size="large" color="#4F46E5" style={{ marginVertical: 32 }} />
                        ) : exporterContext ? (
                            <ScrollView>
                                <ContextRow icon="person-outline" label="Name" value={exporterContext.name} />
                                <ContextRow icon="location-outline" label="Country" value={exporterContext.country ?? 'Not specified'} />
                                <ContextRow icon="business-outline" label="Organization" value={exporterContext.organizationType ?? 'Not specified'} />
                                <ContextRow icon="calendar-outline" label="On Platform" value={`${exporterContext.platformTenureMonths} months`} />
                                <ContextRow
                                    icon="people-outline"
                                    label="Collaborations with you"
                                    value={exporterContext.totalCollaborationsWithBuyer.toString()}
                                />
                                {exporterContext.lastCollaborationDate && (
                                    <ContextRow
                                        icon="time-outline"
                                        label="Last Collaboration"
                                        value={new Date(exporterContext.lastCollaborationDate).toLocaleDateString()}
                                    />
                                )}
                                <View style={[
                                    styles.verifiedBadge,
                                    { backgroundColor: exporterContext.isVerified ? '#ECFDF5' : '#FEF2F2' }
                                ]}>
                                    <Ionicons
                                        name={exporterContext.isVerified ? 'shield-checkmark' : 'shield-outline'}
                                        size={16}
                                        color={exporterContext.isVerified ? '#10B981' : '#EF4444'}
                                    />
                                    <Text style={[
                                        styles.verifiedText,
                                        { color: exporterContext.isVerified ? '#10B981' : '#EF4444' }
                                    ]}>
                                        {exporterContext.isVerified ? 'Verified on Platform' : 'Not Yet Verified'}
                                    </Text>
                                </View>
                            </ScrollView>
                        ) : (
                            <Text style={styles.contextError}>Could not load exporter profile.</Text>
                        )}

                        <TouchableOpacity style={styles.closeFullBtn} onPress={() => setContextModal(false)}>
                            <Text style={styles.closeFullBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function ContextRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.ctxRow}>
            <Ionicons name={icon as any} size={16} color="#6B7280" />
            <View style={styles.ctxRowText}>
                <Text style={styles.ctxLabel}>{label}</Text>
                <Text style={styles.ctxValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
    backBtn: { marginBottom: 16 },
    headerContent: { alignItems: 'center', gap: 6 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 8 },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

    card: {
        backgroundColor: 'white', borderRadius: 16, padding: 16,
        marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06,
        shadowRadius: 8, elevation: 3
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    iconWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center'
    },
    cardMeta: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
    cardSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    pendingBadge: {
        backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
    },
    pendingBadgeText: { fontSize: 10, fontWeight: '800', color: '#D97706' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    cardDetail: { flex: 1, fontSize: 12, color: '#6B7280' },

    profileBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
        borderWidth: 1, borderColor: '#4F46E5', borderRadius: 10, padding: 10, marginTop: 10
    },
    profileBtnText: { color: '#4F46E5', fontWeight: '600', fontSize: 13 },
    approveBtn: {
        backgroundColor: '#10B981', borderRadius: 12, padding: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 10
    },
    approveBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
    emptyDesc: { color: '#9CA3AF', textAlign: 'center', marginTop: 8, lineHeight: 20 },

    // Modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    contextCard: {
        backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, maxHeight: '72%'
    },
    ctxHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    contextTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
    closeBtn: { padding: 4 },
    ctxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
    ctxRowText: { flex: 1 },
    ctxLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
    ctxValue: { fontSize: 15, color: '#111827', fontWeight: '600', marginTop: 2 },
    verifiedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        padding: 12, borderRadius: 12, marginTop: 6, marginBottom: 10
    },
    verifiedText: { fontWeight: '700', fontSize: 14 },
    contextError: { color: '#9CA3AF', textAlign: 'center', marginVertical: 24 },
    closeFullBtn: {
        backgroundColor: '#4F46E5', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8
    },
    closeFullBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
