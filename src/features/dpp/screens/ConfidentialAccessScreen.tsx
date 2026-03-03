/**
 * ConfidentialAccessScreen — EXPORTER ONLY
 *
 * Flow:
 *   1. On mount, checks GET /api/dpp/my-requests to see if a request already
 *      exists for this lot — auto-restores phase to 'requested' or 'viewing'.
 *   2. Exporter can submit a new request via POST /api/dpp/request-confidential/{lotId}.
 *   3. Once approved, GET /api/dpp/confidential/{lotId} decrypts and shows fields.
 */
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { requestConfidentialAccess, getConfidentialFields, getMyAccessRequests } from '../services/dppService';
import { ConfidentialField } from '../types';

export default function ConfidentialAccessScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { lotId } = route.params as { lotId: string };

    const [initializing, setInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState<'idle' | 'requested' | 'viewing'>('idle');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [existingStatus, setExistingStatus] = useState<string | null>(null);
    const [fields, setFields] = useState<ConfidentialField[]>([]);
    const [accessGrantedAt, setGrantedAt] = useState<string | null>(null);

    // ── On mount: auto-restore request state from the server ──────────
    useEffect(() => {
        (async () => {
            try {
                const allRequests = await getMyAccessRequests();
                const existing = allRequests.find(r => r.lotId === lotId);
                if (existing) {
                    setRequestId(existing.id);
                    setExistingStatus(existing.status);
                    if (existing.status === 'APPROVED') {
                        // Try to auto-load confidential fields
                        try {
                            const result = await getConfidentialFields(lotId);
                            setFields(result.fields);
                            setGrantedAt(result.accessGrantedAt);
                            setPhase('viewing');
                        } catch {
                            // Show as requested if decryption fails
                            setPhase('requested');
                        }
                    } else if (existing.status === 'PENDING') {
                        setPhase('requested');
                    }
                    // REJECTED stays 'idle' so exporter knows they can re-request
                }
            } catch {
                // Network error — start fresh from idle
            } finally {
                setInitializing(false);
            }
        })();
    }, [lotId]);

    const handleRequestAccess = async () => {
        try {
            setLoading(true);
            const result = await requestConfidentialAccess(lotId);
            setRequestId(result.requestId);
            setPhase('requested');
            Alert.alert(
                'Request Submitted',
                'Your access request is now PENDING. The buyer must approve it before you can view confidential fields.'
            );
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? 'Failed to submit request.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleViewConfidential = async () => {
        try {
            setLoading(true);
            const result = await getConfidentialFields(lotId);
            setFields(result.fields);
            setGrantedAt(result.accessGrantedAt);
            setPhase('viewing');
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 403) {
                Alert.alert(
                    'Access Pending',
                    'Your request has not been approved yet. Please wait for the buyer to approve your request.'
                );
            } else {
                Alert.alert('Error', e?.response?.data?.error ?? 'Failed to fetch confidential fields.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Ionicons name="lock-closed" size={36} color="#F59E0B" />
                    <Text style={styles.headerTitle}>Confidential Access</Text>
                    <Text style={styles.headerSub}>Lot ID: {lotId.substring(0, 12)}...</Text>
                </View>
            </LinearGradient>

            {/* Explanation */}
            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={22} color="#3B82F6" />
                <Text style={styles.infoText}>
                    Confidential fields (e.g. price, payment amount) are encrypted and require buyer approval before access.
                </Text>
            </View>

            {/* Initializing — check existing request status */}
            {initializing && (
                <View style={styles.section}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 12 }}>
                        Checking access status...
                    </Text>
                </View>
            )}

            {/* Phase: IDLE — show Request Access button */}
            {!initializing && phase === 'idle' && (
                <View style={styles.section}>
                    {/* Show rejection notice if a previous request was rejected */}
                    {existingStatus === 'REJECTED' && (
                        <View style={styles.statusBadgeRejected}>
                            <Ionicons name="close-circle" size={22} color="#EF4444" />
                            <Text style={styles.statusBadgeRejectedText}>
                                Previous request was REJECTED. You may submit a new request.
                            </Text>
                        </View>
                    )}
                    <Text style={styles.sectionTitle}>Step 1 — Request Access</Text>
                    <Text style={styles.sectionDesc}>
                        Submit a request to the buyer to view the encrypted financial fields in this DPP lot.
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={handleRequestAccess}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <>
                                <Ionicons name="send" size={20} color="white" />
                                <Text style={styles.primaryBtnText}>Request Confidential Access</Text>
                            </>
                        }
                    </TouchableOpacity>

                    {/* Also try to view directly (if previously approved) */}
                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleViewConfidential} disabled={loading}>
                        <Ionicons name="eye" size={18} color="#6366F1" />
                        <Text style={styles.secondaryBtnText}>Already Approved? View Fields</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Phase: REQUESTED — show pending notice */}
            {!initializing && phase === 'requested' && (
                <View style={styles.section}>
                    <View style={styles.statusBadgePending}>
                        <Ionicons name="time" size={24} color="#F59E0B" />
                        <Text style={styles.statusBadgeText}>PENDING APPROVAL</Text>
                    </View>
                    <Text style={styles.sectionDesc}>
                        Request ID: {requestId}{'\n\n'}
                        Waiting for the buyer to approve. Once approved, tap the button below to view decrypted fields.
                    </Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleViewConfidential} disabled={loading}>
                        {loading
                            ? <ActivityIndicator color="white" />
                            : <>
                                <Ionicons name="refresh" size={20} color="white" />
                                <Text style={styles.primaryBtnText}>Check Approval & View Fields</Text>
                            </>
                        }
                    </TouchableOpacity>
                </View>
            )}

            {/* Phase: VIEWING — show decrypted fields */}
            {!initializing && phase === 'viewing' && (
                <View style={styles.section}>
                    <View style={styles.statusBadgeApproved}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>ACCESS GRANTED</Text>
                    </View>
                    {accessGrantedAt && (
                        <Text style={styles.grantedAt}>
                            Approved: {new Date(accessGrantedAt).toLocaleString()}
                        </Text>
                    )}

                    <Text style={styles.sectionTitle}>Confidential Fields</Text>
                    {fields.length === 0
                        ? <Text style={styles.emptyText}>No confidential fields found for this lot.</Text>
                        : fields.map((f, i) => (
                            <View key={i} style={styles.fieldCard}>
                                <Text style={styles.fieldName}>{f.fieldName}</Text>
                                <Text style={styles.fieldValue}>{f.decryptedValue}</Text>
                            </View>
                        ))
                    }

                    <View style={styles.securityNote}>
                        <Ionicons name="shield-checkmark" size={16} color="#6B7280" />
                        <Text style={styles.securityNoteText}>
                            Values decrypted in backend service layer only. Not stored in database.
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 },
    backBtn: { marginBottom: 16 },
    headerContent: { alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 8 },
    headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

    infoCard: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: '#EFF6FF', margin: 16, padding: 14,
        borderRadius: 12, gap: 10, borderLeftWidth: 3, borderLeftColor: '#3B82F6'
    },
    infoText: { flex: 1, color: '#1E40AF', fontSize: 13, lineHeight: 20 },

    section: { margin: 16 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 8 },
    sectionDesc: { color: '#6B7280', fontSize: 14, lineHeight: 22, marginBottom: 20 },

    primaryBtn: {
        backgroundColor: '#4F46E5', borderRadius: 14, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginBottom: 12
    },
    primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },

    secondaryBtn: {
        borderWidth: 1.5, borderColor: '#6366F1', borderRadius: 14, padding: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    secondaryBtnText: { color: '#6366F1', fontWeight: '600', fontSize: 14 },

    statusBadgePending: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10, marginBottom: 16
    },
    statusBadgeApproved: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#D1FAE5', padding: 12, borderRadius: 10, marginBottom: 8
    },
    statusBadgeRejected: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10, marginBottom: 16,
    },
    statusBadgeRejectedText: { flex: 1, fontWeight: '600', color: '#EF4444', fontSize: 13 },
    statusBadgeText: { fontWeight: '700', color: '#F59E0B', fontSize: 14 },
    grantedAt: { color: '#6B7280', fontSize: 12, marginBottom: 16 },

    fieldCard: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4F46E5',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    fieldName: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 },
    fieldValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' },

    emptyText: { color: '#9CA3AF', textAlign: 'center', marginVertical: 20 },

    securityNote: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 20, padding: 10, backgroundColor: '#F9FAFB',
        borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB'
    },
    securityNoteText: { flex: 1, color: '#6B7280', fontSize: 12 },
});
