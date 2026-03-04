import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, ActivityIndicator, Alert, RefreshControl, StatusBar
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getBuyerDocuments, getPendingAccessRequests } from '../services/dppService';
import { getMyTransactions, uploadInvoice } from '../services/marketplaceService';
import { DppDocument, MarketplaceTransaction } from '../types';
import { useStore } from '../../../store';

/* ─── Colors ─────────────────────────────────────────────────────── */
const C = {
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryPale: '#E8F5E9',
    primaryDark: '#1B5E20',
    bg: '#F4F6F3',
    card: '#FFFFFF',
    accent: '#5856D6',
    accentLight: '#EDEDFC',
    blue: '#007AFF',
    green: '#34C759',
    orange: '#FF9500',
    red: '#FF3B30',
    text: '#1C1C1E',
    sub: '#8E8E93',
    border: '#E8EDE8',
};

/* ─── Reusable Section Card ─────────────────────────────────────────── */
function SectionCard({ children, style }: { children: React.ReactNode; style?: object }) {
    return <View style={[s.sectionCard, style]}>{children}</View>;
}

/* ─── Stat Indicator Card ───────────────────────────────────────────── */
function StatCard({
    icon, label, value, color, bgColor, onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string; value: number; color: string; bgColor: string;
    onPress?: () => void;
}) {
    const content = (
        <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
        </View>
    );
    if (onPress) {
        return <TouchableOpacity activeOpacity={0.7} onPress={onPress}>{content}</TouchableOpacity>;
    }
    return content;
}

/* ─── Workflow Step Row ─────────────────────────────────────────────── */
function StepRow({
    step, label, sublabel, icon, iconBg, onPress, trailing,
}: {
    step?: string; label: string; sublabel: string;
    icon: keyof typeof Ionicons.glyphMap; iconBg: string;
    onPress?: () => void; trailing?: React.ReactNode;
}) {
    const inner = (
        <View style={s.stepRow}>
            <View style={[s.stepIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color="#FFF" />
            </View>
            <View style={s.stepContent}>
                <Text style={s.stepLabel}>{label}</Text>
                <Text style={s.stepSub}>{sublabel}</Text>
            </View>
            {trailing ?? <Ionicons name="chevron-forward" size={18} color={C.sub} />}
        </View>
    );
    return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.65}>{inner}</TouchableOpacity> : inner;
}

/* ─── Divider ───────────────────────────────────────────────────────── */
const Divider = () => <View style={s.divider} />;

/* ═══════════════════════════════════════════════════════════════════════
   BuyerDashboardScreen
   ═══════════════════════════════════════════════════════════════════════ */
export default function BuyerDashboardScreen() {
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const scrollRef = useRef<ScrollView>(null);
    const docSectionY = useRef(0);
    const [selectedQr, setSelectedQr] = useState<string | null>(null);
    const [documents, setDocuments] = useState<DppDocument[]>([]);
    const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [showAllSales, setShowAllSales] = useState(false);
    const [showAllDocs, setShowAllDocs] = useState(false);

    /* ── Derived stats ──────────────────── */
    const stats = useMemo(() => {
        const completedCount = transactions.filter(t => t.status === 'Completed').length;
        const pendingInvoice = transactions.filter(t => t.status === 'PendingInvoice').length;
        const uniqueExporters = new Set(transactions.map(t => t.exporterId)).size;
        return { completedCount, pendingInvoice, uniqueExporters };
    }, [transactions]);

    /* ── Data fetch ─────────────────────── */
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [docs, trans, pending] = await Promise.all([
                getBuyerDocuments(),
                getMyTransactions(),
                getPendingAccessRequests().catch(() => [] as any[]),
            ]);
            setDocuments(docs);
            setTransactions(trans);
            setPendingCount(pending.length);
        } finally {
            setLoading(false);
        }
    }, []);

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

    /* ── Invoice upload ─────────────────── */
    const handleUploadInvoice = async (transactionId: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
            if (result.canceled) return;
            const file = result.assets[0];
            setLoading(true);
            const response = await uploadInvoice(transactionId, { uri: file.uri, name: file.name, mimeType: file.mimeType });
            loadData();
            // Navigate to ClassificationResultScreen with isInvoice=true to show invoice-specific UI
            navigation.navigate('ClassificationResult', { result: response, isInvoice: true });
        } catch {
            Alert.alert('Error', 'Failed to upload invoice');
        } finally {
            setLoading(false);
        }
    };

    /* ── Helpers ─────────────────────────── */
    const statusColor = (status: string) =>
        status === 'Completed' ? C.green : status === 'InvoiceUploaded' ? C.blue : C.orange;

    const statusLabel = (status: string) =>
        status === 'Completed' ? 'Payment Completed'
            : status === 'PendingInvoice' ? 'Pending Invoice' : 'Invoice Uploaded';

    const getInitials = (name?: string) => {
        if (!name) return 'B';
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    /* ════════════════════════════════════════════════════════════════════ */
    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

            {/* ── Header ───────────────────────────────────── */}
            <View style={s.header}>
                <View style={s.headerTop}>
                    <TouchableOpacity
                        style={s.profileSection}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={s.avatarWrap}>
                            <View style={s.avatar}>
                                <Text style={s.avatarText}>{getInitials(user?.name)}</Text>
                            </View>
                            <View style={s.onlineDot} />
                        </View>
                        <View style={s.profileInfo}>
                            <Text style={s.profileGreeting}>{getGreeting()}</Text>
                            <Text style={s.profileName}>{user?.name || 'Buyer'}</Text>
                            <View style={s.roleBadge}>
                                <Ionicons name="shield-checkmark" size={10} color="#fff" />
                                <Text style={s.roleText}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Buyer'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={s.notifBtnWrap}>
                        <TouchableOpacity
                            style={s.notifBtn}
                            onPress={() => navigation.navigate('PendingRequests')}
                        >
                            <Ionicons name="notifications-outline" size={22} color="#fff" />
                            {pendingCount > 0 && (
                                <View style={s.notifBadge}>
                                    <Text style={s.notifBadgeText}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={C.primary} />}
            >
                {/* ═══ Stat Indicators ══════════════════════════ */}
                <View style={s.statsRow}>
                    <StatCard
                        icon="document-text"
                        label="Documents"
                        value={documents.length}
                        color={C.primary}
                        bgColor={C.primaryPale}
                        onPress={() => scrollRef.current?.scrollTo({ y: docSectionY.current, animated: true })}
                    />
                    <StatCard
                        icon="people"
                        label="Exporters"
                        value={stats.uniqueExporters}
                        color={C.blue}
                        bgColor="#E3F2FD"
                    />
                    <StatCard
                        icon="checkmark-circle"
                        label="Completed"
                        value={stats.completedCount}
                        color={C.green}
                        bgColor="#E8F5E9"
                    />
                    <StatCard
                        icon="time"
                        label="Pending"
                        value={stats.pendingInvoice}
                        color={C.orange}
                        bgColor="#FFF3E0"
                    />
                </View>

                {/* ═══ Quick Actions ═══════════════════════════ */}
                <Text style={s.sectionTitle}>Quick Actions</Text>
                <View style={s.quickRow}>
                    <TouchableOpacity
                        style={s.quickCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('CreateSellingPost')}
                    >
                        <View style={[s.quickIcon, { backgroundColor: C.primary }]}>
                            <Ionicons name="pricetag" size={22} color="#FFF" />
                        </View>
                        <Text style={s.quickLabel}>Create{'\n'}Rubber Lot</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.quickCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('DocumentUpload')}
                    >
                        <View style={[s.quickIcon, { backgroundColor: C.primaryLight }]}>
                            <Ionicons name="cloud-upload" size={22} color="#FFF" />
                        </View>
                        <Text style={s.quickLabel}>Upload{'\n'}Document</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={s.quickCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('PendingRequests')}
                    >
                        <View style={[s.quickIcon, { backgroundColor: '#66BB6A' }]}>
                            <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                        </View>
                        <Text style={s.quickLabel}>Access{'\n'}Requests</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══ Recent Sales / Transactions ═════════════ */}
                {transactions.length > 0 && (
                    <>
                        <View style={s.sectionTitleRow}>
                            <Text style={s.sectionTitle}>Recent Sales</Text>
                            <View style={s.countBadge}>
                                <Text style={s.countBadgeText}>{transactions.length}</Text>
                            </View>
                        </View>

                        {(showAllSales ? transactions : transactions.slice(0, 2)).map(t => (
                            <SectionCard key={t.id} style={{ marginBottom: 12 }}>
                                <TouchableOpacity
                                    style={s.txHeader}
                                    activeOpacity={0.7}
                                    onPress={() => navigation.navigate('OrderReceipt', { transactionId: t.id })}
                                >
                                    <View style={s.txLeft}>
                                        <Text style={s.txPrice}>LKR {t.offerPrice.toLocaleString()}</Text>
                                        <Text style={s.txExporter}>{t.exporterName || 'Exporter'}</Text>
                                    </View>
                                    <View style={[s.txBadge, { backgroundColor: statusColor(t.status) + '18' }]}>
                                        <View style={[s.txDot, { backgroundColor: statusColor(t.status) }]} />
                                        <Text style={[s.txBadgeText, { color: statusColor(t.status) }]}>
                                            {statusLabel(t.status)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <Divider />

                                <View style={s.txActions}>
                                    {t.status === 'PendingInvoice' && (
                                        <TouchableOpacity
                                            style={[s.txBtn, { backgroundColor: C.orange }]}
                                            onPress={() => handleUploadInvoice(t.id)}
                                        >
                                            <Ionicons name="cloud-upload" size={14} color="#FFF" />
                                            <Text style={s.txBtnText}>Upload Invoice</Text>
                                        </TouchableOpacity>
                                    )}

                                    {!t.dppDocumentId && (
                                        <TouchableOpacity
                                            style={[s.txBtn, { backgroundColor: C.primary }]}
                                            onPress={() => navigation.navigate('DocumentUpload', { transactionId: t.id })}
                                        >
                                            <Ionicons name="document-attach" size={14} color="#FFF" />
                                            <Text style={s.txBtnText}>Link DPP</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={[s.txBtn, { backgroundColor: '#FF375F' }]}
                                        onPress={() => navigation.navigate('LotMessaging', {
                                            lotId: t.id,
                                            receiverId: t.exporterId,
                                            lotLabel: `Order ${t.id.substring(0, 8)} · ${t.exporterName}`
                                        })}
                                    >
                                        <Ionicons name="chatbubbles" size={14} color="#FFF" />
                                        <Text style={s.txBtnText}>Message</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[s.txBtn, { backgroundColor: C.sub }]}
                                        onPress={() => navigation.navigate('OrderReceipt', { transactionId: t.id })}
                                    >
                                        <Ionicons name="receipt-outline" size={14} color="#FFF" />
                                        <Text style={s.txBtnText}>Receipt</Text>
                                    </TouchableOpacity>
                                </View>
                            </SectionCard>
                        ))}

                        {transactions.length > 2 && (
                            <TouchableOpacity style={s.seeMoreBtn} onPress={() => setShowAllSales(!showAllSales)}>
                                <Text style={s.seeMoreText}>{showAllSales ? 'Show Less' : `See More (${transactions.length - 2})`}</Text>
                                <Ionicons name={showAllSales ? 'chevron-up' : 'chevron-down'} size={16} color={C.primary} />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ═══ My Documents ════════════════════════════ */}
                <View style={s.sectionTitleRow} onLayout={(e) => { docSectionY.current = e.nativeEvent.layout.y; }}>
                    <Text style={s.sectionTitle}>My Documents</Text>
                    {documents.length > 0 && (
                        <View style={s.countBadge}>
                            <Text style={s.countBadgeText}>{documents.length}</Text>
                        </View>
                    )}
                </View>

                {loading && documents.length === 0 ? (
                    <View style={s.emptyWrap}>
                        <ActivityIndicator size="large" color={C.primary} />
                    </View>
                ) : documents.length === 0 ? (
                    <SectionCard>
                        <View style={s.emptyWrap}>
                            <Ionicons name="document-outline" size={40} color={C.sub} />
                            <Text style={s.emptyTitle}>No documents yet</Text>
                            <Text style={s.emptySub}>Upload a rubber lot document to begin the DPP pipeline.</Text>
                            <TouchableOpacity
                                style={s.emptyBtn}
                                onPress={() => navigation.navigate('DocumentUpload')}
                            >
                                <Ionicons name="add" size={18} color="#FFF" />
                                <Text style={s.emptyBtnText}>Upload Document</Text>
                            </TouchableOpacity>
                        </View>
                    </SectionCard>
                ) : (
                    <>
                        {(showAllDocs ? documents : documents.slice(0, 2)).map(doc => (
                            <SectionCard key={doc.id} style={{ marginBottom: 10 }}>
                                <View style={s.docRow}>
                                    <View style={[s.docIconWrap, {
                                        backgroundColor: doc.classification === 'CONFIDENTIAL' ? '#FFEBEE' : C.primaryPale
                                    }]}>
                                        <Ionicons
                                            name={doc.classification === 'CONFIDENTIAL' ? 'lock-closed' : 'document-text'}
                                            size={22}
                                            color={doc.classification === 'CONFIDENTIAL' ? C.red : C.primary}
                                        />
                                    </View>
                                    <View style={s.docInfo}>
                                        <Text style={s.docName} numberOfLines={1}>{doc.originalFileName}</Text>
                                        <Text style={s.docDate}>{new Date(doc.uploadedAt).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={[
                                        s.docTag,
                                        { backgroundColor: doc.classification === 'CONFIDENTIAL' ? '#FFEBEE' : C.primaryPale }
                                    ]}>
                                        <Text style={{
                                            color: doc.classification === 'CONFIDENTIAL' ? C.red : C.primary,
                                            fontSize: 10, fontWeight: '700',
                                        }}>
                                            {doc.classification}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={s.qrBtn}
                                        onPress={() => navigation.navigate('DppPassport', { dppId: doc.id })}
                                    >
                                        <Ionicons name="qr-code-outline" size={20} color={C.primary} />
                                    </TouchableOpacity>
                                </View>
                            </SectionCard>
                        ))}

                        {documents.length > 2 && (
                            <TouchableOpacity style={s.seeMoreBtn} onPress={() => setShowAllDocs(!showAllDocs)}>
                                <Text style={s.seeMoreText}>{showAllDocs ? 'Show Less' : `See More (${documents.length - 2})`}</Text>
                                <Ionicons name={showAllDocs ? 'chevron-up' : 'chevron-down'} size={16} color={C.primary} />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ═══ DPP Pipeline Workflow ═══════════════════ */}
                <Text style={s.sectionTitle}>DPP Pipeline Workflow</Text>
                <SectionCard>
                    <StepRow
                        step="1"
                        icon="pricetag-outline"
                        iconBg={C.primary}
                        label="Create Rubber Lot"
                        sublabel="Post grade, quantity & asking price"
                        onPress={() => navigation.navigate('CreateSellingPost')}
                    />
                    <Divider />
                    <StepRow
                        step="2"
                        icon="document-text-outline"
                        iconBg={C.primaryLight}
                        label="Upload & Secure Document"
                        sublabel="Step A — Gemini extracts, classifies & encrypts"
                        onPress={() => navigation.navigate('DocumentUpload')}
                    />
                    <Divider />
                    <StepRow
                        step="3"
                        icon="eye-outline"
                        iconBg="#FF9F0A"
                        label="Review Classification"
                        sublabel="Verify confidential (red) vs public (green) fields"
                    />
                    <Divider />
                    <StepRow
                        step="4"
                        icon="shield-checkmark-outline"
                        iconBg={C.green}
                        label="Generate DPP Passport"
                        sublabel="Step B — Strips financials, mints SHA-256 hash"
                    />
                    <Divider />
                    <StepRow
                        step="5"
                        icon="reader-outline"
                        iconBg="#AF52DE"
                        label="View Digital Passport"
                        sublabel="Privacy-preserving DPP with integrity hash"
                    />
                    <Divider />
                    <StepRow
                        step="6"
                        icon="chatbubbles-outline"
                        iconBg="#FF375F"
                        label="Secure Lot Messaging"
                        sublabel="AES-256 encrypted confidential messages"
                    />
                </SectionCard>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* ── QR Modal ──────────────────────────────────── */}
            <Modal visible={!!selectedQr} transparent animationType="fade">
                <View style={s.modalBg}>
                    <View style={s.modalCard}>
                        <View style={s.modalHandle} />
                        <Text style={s.modalTitle}>DPP QR Code</Text>
                        <Text style={s.modalSub}>Scan with exporter device to access passport</Text>
                        {selectedQr && (
                            <View style={s.qrWrap}>
                                <QRCode value={selectedQr} size={200} />
                            </View>
                        )}
                        <Text style={s.qrId}>ID: {selectedQr}</Text>
                        <TouchableOpacity style={s.modalClose} onPress={() => setSelectedQr(null)}>
                            <Text style={s.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    /* ── Top bar ────── */
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 58, paddingBottom: 12, paddingHorizontal: 20,
        backgroundColor: C.card,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    greeting: { fontSize: 24, fontWeight: '800', color: C.text },
    greetingSub: { fontSize: 13, color: C.sub, marginTop: 2 },
    profileBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center',
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute', top: 0, right: 0,
        backgroundColor: C.red, borderRadius: 10,
        minWidth: 18, height: 18,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5, borderColor: C.card,
    },
    notifBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

    /* ── Section titles ────── */
    sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginTop: 22, marginBottom: 10 },
    sectionBadge: { fontSize: 15, fontWeight: '600', color: C.sub },

    /* ── Section card ────── */
    sectionCard: {
        backgroundColor: C.card, borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    /* ── Quick actions ────── */
    quickRow: { flexDirection: 'row', gap: 12 },
    quickCard: {
        flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    quickIcon: {
        width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    quickLabel: { fontSize: 12, fontWeight: '600', color: C.text, textAlign: 'center', lineHeight: 16 },

    /* ── Step rows (workflow) ────── */
    stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
    stepIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    stepContent: { flex: 1 },
    stepLabel: { fontSize: 15, fontWeight: '600', color: C.text },
    stepSub: { fontSize: 12, color: C.sub, marginTop: 1 },

    /* ── Divider ────── */
    divider: { height: 1, backgroundColor: C.border, marginVertical: 2 },

    /* ── Transaction cards ────── */
    txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 },
    txLeft: {},
    txPrice: { fontSize: 18, fontWeight: '700', color: C.text },
    txExporter: { fontSize: 13, color: C.sub, marginTop: 2 },
    txBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    txDot: { width: 7, height: 7, borderRadius: 4 },
    txBadgeText: { fontSize: 12, fontWeight: '600' },
    txActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 10 },
    txBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    },
    txBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    /* ── Document rows ────── */
    docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    docIconWrap: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: C.bg,
        justifyContent: 'center', alignItems: 'center',
    },
    docInfo: { flex: 1 },
    docName: { fontSize: 14, fontWeight: '600', color: C.text },
    docDate: { fontSize: 11, color: C.sub, marginTop: 2 },
    docTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    qrBtn: { padding: 8, backgroundColor: '#F0F8FF', borderRadius: 10 },

    /* ── Empty state ────── */
    emptyWrap: { alignItems: 'center', paddingVertical: 28, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text },
    emptySub: { fontSize: 13, color: C.sub, textAlign: 'center', paddingHorizontal: 20 },
    emptyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: C.accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 8,
    },
    emptyBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

    /* ── QR Modal ────── */
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { backgroundColor: C.card, width: '82%', padding: 28, borderRadius: 24, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 4 },
    modalSub: { fontSize: 13, color: C.sub, marginBottom: 20 },
    qrWrap: {
        padding: 16, borderRadius: 16, backgroundColor: C.card,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, marginBottom: 16,
    },
    qrId: { fontFamily: 'monospace', fontSize: 11, color: C.sub, marginBottom: 16 },
    modalClose: { paddingVertical: 12, paddingHorizontal: 36, backgroundColor: C.blue, borderRadius: 12 },
    modalCloseText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
