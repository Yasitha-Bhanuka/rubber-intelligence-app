/**
 * DualLayerDppScreen — EXPORTER ONLY
 *
 * Zero-Knowledge Client-Side Decryption:
 *   1. Fetches the dual-layer payload from GET /api/Marketplace/transactions/{id}/dual-layer-dpp
 *   2. Displays the public summary (LotId, RubberGrade, Quantity, DppHash) immediately.
 *   3. Renders a "Locked Vault" section with a TextInput for the exporter's RSA Private Key.
 *   4. On submit, uses node-forge to:
 *        a) RSA-OAEP-SHA256 decrypt the EncryptedAesKeyBase64 → raw AES key
 *        b) AES-256-CBC decrypt the encryptedVault using the unwrapped key + IV
 *   5. Displays the decrypted plaintext or file content, with graceful error handling.
 *
 * The backend NEVER sees the RSA private key — true zero-knowledge.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import forge from 'node-forge';
import { Buffer } from 'buffer';
import { getDualLayerDpp } from '../services/marketplaceService';
import { DualLayerDppResponse } from '../types';

// ── Palette ───────────────────────────────────────────────────────────
const C = {
    primary:     '#2E7D32',
    primaryDark: '#1B5E20',
    primaryPale: '#E8F5E9',
    teal:        '#00BCD4',
    amber:       '#FF9500',
    green:       '#34C759',
    red:         '#FF3B30',
    blue:        '#2196F3',
    purple:      '#7E57C2',
    gold:        '#F59E0B',
    bg:          '#F1F8E9',
    white:       '#FFFFFF',
    textPrimary: '#1C1C1E',
    textSub:     '#6B7B6E',
    border:      '#C8E6C9',
    vaultBg:     '#1a1a2e',
    vaultCard:   '#16213e',
};

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Convert an RSA private key from XML format (C# RSA.ToXmlString) to a
 * forge RSA private key object.
 *
 * XML format:   <RSAKeyValue><Modulus>...</Modulus><Exponent>...</Exponent>
 *               <P>...</P><Q>...</Q><DP>...</DP><DQ>...</DQ>
 *               <InverseQ>...</InverseQ><D>...</D></RSAKeyValue>
 *
 * PEM format:   -----BEGIN RSA PRIVATE KEY-----  ...  -----END RSA PRIVATE KEY-----
 */
function parsePrivateKey(input: string): forge.pki.rsa.PrivateKey {
    const trimmed = input.trim();

    // ── PEM format ────────────────────────────────────────────────────
    if (trimmed.includes('-----BEGIN')) {
        return forge.pki.privateKeyFromPem(trimmed);
    }

    // ── XML format (.NET RSA.ToXmlString(true)) ───────────────────────
    const getTag = (xml: string, tag: string): string => {
        const rx = new RegExp(`<${tag}>([^<]+)</${tag}>`);
        const m = xml.match(rx);
        if (!m) throw new Error(`Missing <${tag}> in XML key`);
        return m[1];
    };

    const b64ToBn = (b64: string) =>
        new forge.jsbn.BigInteger(Buffer.from(b64, 'base64').toString('hex'), 16);

    const n  = b64ToBn(getTag(trimmed, 'Modulus'));
    const e  = b64ToBn(getTag(trimmed, 'Exponent'));
    const d  = b64ToBn(getTag(trimmed, 'D'));
    const p  = b64ToBn(getTag(trimmed, 'P'));
    const q  = b64ToBn(getTag(trimmed, 'Q'));
    const dP = b64ToBn(getTag(trimmed, 'DP'));
    const dQ = b64ToBn(getTag(trimmed, 'DQ'));
    const qI = b64ToBn(getTag(trimmed, 'InverseQ'));

    return forge.pki.setRsaPrivateKey(n, e, d, p, q, dP, dQ, qI);
}

/**
 * RSA-OAEP-SHA256 decrypt the AES key, then AES-256-CBC decrypt the vault.
 * Returns the decrypted plaintext as a UTF-8 string.
 */
function decryptHybridPayload(
    encryptedVaultB64: string,
    encryptedAesKeyB64: string,
    ivB64: string,
    privateKey: forge.pki.rsa.PrivateKey,
): string {
    // 1. RSA-OAEP-SHA256 unwrap the AES key
    const wrappedKeyBytes = Buffer.from(encryptedAesKeyB64, 'base64').toString('binary');
    const rawAesKey = privateKey.decrypt(wrappedKeyBytes, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: { md: forge.md.sha256.create() },
    });

    // 2. AES-256-CBC decrypt the vault
    const ivBytes    = Buffer.from(ivB64, 'base64').toString('binary');
    const cipherBytes = Buffer.from(encryptedVaultB64, 'base64').toString('binary');

    const decipher = forge.cipher.createDecipher('AES-CBC', rawAesKey);
    decipher.start({ iv: ivBytes });
    decipher.update(forge.util.createBuffer(cipherBytes));
    const ok = decipher.finish();

    if (!ok) {
        throw new Error('AES decryption failed — wrong key or corrupted data.');
    }

    return decipher.output.toString();
}

// ── Component ─────────────────────────────────────────────────────────

export default function DualLayerDppScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { transactionId } = route.params as { transactionId: string };

    // Payload from backend
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [payload, setPayload]       = useState<DualLayerDppResponse | null>(null);

    // Decryption
    const [privateKeyText, setPrivateKeyText] = useState('');
    const [decrypting, setDecrypting]         = useState(false);
    const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
    const [decryptError, setDecryptError]     = useState<string | null>(null);

    // ── Fetch dual-layer payload ──────────────────────────────────────
    const fetchPayload = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDualLayerDpp(transactionId);
            setPayload(data);
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 403)
                setError('Access denied — you are not the purchasing exporter for this lot.');
            else if (status === 404)
                setError(e?.response?.data?.error || 'Transaction or invoice not found.');
            else
                setError(e?.response?.data?.error || 'Failed to fetch dual-layer DPP payload.');
        } finally {
            setLoading(false);
        }
    }, [transactionId]);

    useEffect(() => { fetchPayload(); }, [fetchPayload]);

    // ── Client-side decryption ────────────────────────────────────────
    const handleDecrypt = () => {
        if (!payload) return;
        if (!privateKeyText.trim()) {
            Alert.alert('Missing Key', 'Please paste your RSA private key (PEM or XML format).');
            return;
        }

        setDecrypting(true);
        setDecryptError(null);
        setDecryptedContent(null);

        // Run in a microtask to let the UI update to show the spinner
        setTimeout(() => {
            try {
                const pk = parsePrivateKey(privateKeyText);
                const plaintext = decryptHybridPayload(
                    payload.encryptedVault,
                    payload.encryptionMetadata.EncryptedAesKeyBase64,
                    payload.encryptionMetadata.IvBase64,
                    pk,
                );
                setDecryptedContent(plaintext);
            } catch (err: any) {
                const msg = err?.message || 'Decryption failed.';
                setDecryptError(msg);
                Alert.alert('Decryption Failed', msg);
            } finally {
                setDecrypting(false);
            }
        }, 100);
    };

    // ── Render ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={st.center}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={st.loadingText}>Fetching encrypted DPP payload…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={st.center}>
                <Ionicons name="alert-circle" size={48} color={C.red} />
                <Text style={st.errorText}>{error}</Text>
                <TouchableOpacity style={st.retryBtn} onPress={fetchPayload}>
                    <Ionicons name="refresh" size={18} color={C.white} />
                    <Text style={st.retryBtnText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!payload) return null;

    const { publicSummary, encryptionMetadata } = payload;

    return (
        <ScrollView style={st.container} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* ── Header ─────────────────────────────────────────────── */}
            <LinearGradient colors={[C.vaultBg, C.vaultCard]} style={st.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={C.white} />
                </TouchableOpacity>
                <View style={st.headerContent}>
                    <Ionicons name="shield-checkmark" size={40} color={C.gold} />
                    <Text style={st.headerTitle}>Zero-Knowledge DPP</Text>
                    <Text style={st.headerSub}>Hybrid RSA + AES Encrypted Vault</Text>
                </View>
            </LinearGradient>

            {/* ── Layer 1: Public Summary ─────────────────────────────── */}
            <View style={st.section}>
                <View style={st.sectionHeader}>
                    <Ionicons name="globe-outline" size={20} color={C.primary} />
                    <Text style={st.sectionTitle}>Public Summary</Text>
                    <View style={st.badge}>
                        <Text style={st.badgeText}>Layer 1 — Cleartext</Text>
                    </View>
                </View>

                <View style={st.summaryGrid}>
                    <SummaryItem icon="cube-outline" label="Lot ID" value={publicSummary.LotId} />
                    <SummaryItem icon="leaf-outline" label="Rubber Grade" value={publicSummary.RubberGrade} />
                    <SummaryItem icon="scale-outline" label="Quantity" value={`${publicSummary.Quantity} kg`} />
                    <SummaryItem icon="finger-print" label="DPP Hash" value={publicSummary.DppHash} mono />
                </View>
            </View>

            {/* ── Layer 2: Encrypted Vault ────────────────────────────── */}
            <View style={st.vaultSection}>
                <View style={st.sectionHeader}>
                    <Ionicons name="lock-closed" size={20} color={C.gold} />
                    <Text style={[st.sectionTitle, { color: C.gold }]}>Encrypted Vault</Text>
                    <View style={[st.badge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[st.badgeText, { color: '#92400E' }]}>Layer 2 — RSA + AES</Text>
                    </View>
                </View>

                {/* Info card */}
                <View style={st.infoCard}>
                    <Ionicons name="information-circle" size={18} color={C.blue} />
                    <Text style={st.infoText}>
                        This invoice is encrypted with a random AES-256 key. That key is wrapped with your RSA public key.{' '}
                        Only your RSA private key can unwrap it. The server <Text style={{ fontWeight: '700' }}>cannot</Text> decrypt this data.
                    </Text>
                </View>

                {/* Encryption metadata */}
                <View style={st.metadataCard}>
                    <MetaRow label="AES Key (RSA-wrapped)" value={encryptionMetadata.EncryptedAesKeyBase64} />
                    <MetaRow label="AES IV" value={encryptionMetadata.IvBase64} />
                    <MetaRow label="Vault size" value={`${Math.round(payload.encryptedVault.length * 0.75 / 1024)} KB (ciphertext)`} />
                </View>

                {/* ── Decryption Panel ────────────────────────────────── */}
                {!decryptedContent && (
                    <View style={st.decryptPanel}>
                        <Text style={st.decryptLabel}>
                            <Ionicons name="key" size={14} color={C.gold} />{'  '}
                            Paste your RSA Private Key (PEM or XML)
                        </Text>
                        <TextInput
                            style={st.keyInput}
                            multiline
                            numberOfLines={6}
                            placeholder={'-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n\nor\n\n<RSAKeyValue>...</RSAKeyValue>'}
                            placeholderTextColor="#666"
                            value={privateKeyText}
                            onChangeText={setPrivateKeyText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            spellCheck={false}
                            textAlignVertical="top"
                        />
                        {decryptError && (
                            <View style={st.errorBanner}>
                                <Ionicons name="close-circle" size={16} color={C.red} />
                                <Text style={st.errorBannerText}>{decryptError}</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={[st.decryptBtn, decrypting && { opacity: 0.6 }]}
                            onPress={handleDecrypt}
                            disabled={decrypting}
                        >
                            {decrypting ? (
                                <ActivityIndicator color={C.white} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="lock-open" size={20} color={C.white} />
                                    <Text style={st.decryptBtnText}>Decrypt Vault</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Decrypted Content ───────────────────────────────── */}
                {decryptedContent && (
                    <View style={st.decryptedSection}>
                        <View style={st.decryptedHeader}>
                            <Ionicons name="checkmark-circle" size={24} color={C.green} />
                            <Text style={st.decryptedTitle}>Vault Decrypted Successfully</Text>
                        </View>
                        <Text style={st.decryptedHint}>
                            Decrypted locally on your device. The server never saw this data.
                        </Text>
                        <ScrollView horizontal style={st.decryptedScroll}>
                            <Text style={st.decryptedText} selectable>
                                {decryptedContent}
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={st.resetBtn}
                            onPress={() => {
                                setDecryptedContent(null);
                                setPrivateKeyText('');
                                setDecryptError(null);
                            }}
                        >
                            <Ionicons name="refresh" size={16} color={C.primary} />
                            <Text style={st.resetBtnText}>Clear & Re-decrypt</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

// ── Sub-components ────────────────────────────────────────────────────

function SummaryItem({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) {
    return (
        <View style={st.summaryItem}>
            <View style={st.summaryIcon}>
                <Ionicons name={icon as any} size={18} color={C.primary} />
            </View>
            <Text style={st.summaryLabel}>{label}</Text>
            <Text style={[st.summaryValue, mono && st.monoText]} numberOfLines={2}>
                {value || '—'}
            </Text>
        </View>
    );
}

function MetaRow({ label, value }: { label: string; value: string }) {
    const display = value.length > 40 ? value.substring(0, 20) + '…' + value.substring(value.length - 12) : value;
    return (
        <View style={st.metaRow}>
            <Text style={st.metaLabel}>{label}</Text>
            <Text style={st.metaValue} numberOfLines={1}>{display}</Text>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    container:     { flex: 1, backgroundColor: C.bg },
    center:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: C.bg },
    loadingText:   { marginTop: 12, color: C.textSub, fontSize: 14 },
    errorText:     { marginTop: 12, color: C.red, fontSize: 15, textAlign: 'center', lineHeight: 22 },
    retryBtn:      { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, gap: 6 },
    retryBtnText:  { color: C.white, fontWeight: '600', fontSize: 14 },

    // Header
    header:        { paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20 },
    backBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    headerContent: { alignItems: 'center', gap: 8 },
    headerTitle:   { fontSize: 22, fontWeight: '800', color: C.white, letterSpacing: 0.3 },
    headerSub:     { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

    // Section
    section:       { margin: 16, backgroundColor: C.white, borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionTitle:  { fontSize: 16, fontWeight: '700', color: C.textPrimary, flex: 1 },
    badge:         { backgroundColor: C.primaryPale, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    badgeText:     { fontSize: 10, fontWeight: '700', color: C.primary },

    // Summary grid
    summaryGrid:   { gap: 10 },
    summaryItem:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FBF5', borderRadius: 10, padding: 12, gap: 10 },
    summaryIcon:   { width: 34, height: 34, borderRadius: 17, backgroundColor: C.primaryPale, justifyContent: 'center', alignItems: 'center' },
    summaryLabel:  { fontSize: 12, color: C.textSub, width: 90 },
    summaryValue:  { flex: 1, fontSize: 14, fontWeight: '600', color: C.textPrimary },
    monoText:      { fontFamily: 'monospace', fontSize: 11 },

    // Vault section
    vaultSection:  { margin: 16, backgroundColor: C.white, borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: '#FDE68A' },

    // Info card
    infoCard:      { flexDirection: 'row', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 12 },
    infoText:      { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },

    // Metadata
    metadataCard:  { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, gap: 8, marginBottom: 16 },
    metaRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaLabel:     { fontSize: 11, color: C.textSub, fontWeight: '600' },
    metaValue:     { fontSize: 11, color: C.textPrimary, fontFamily: 'monospace', maxWidth: '55%' },

    // Decrypt panel
    decryptPanel:  { gap: 12 },
    decryptLabel:  { fontSize: 13, fontWeight: '600', color: C.textPrimary },
    keyInput:      { backgroundColor: '#1E1E2E', color: '#E2E8F0', fontFamily: 'monospace', fontSize: 11, borderRadius: 10, padding: 12, minHeight: 120, borderWidth: 1, borderColor: '#334155', textAlignVertical: 'top' },
    decryptBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.gold, paddingVertical: 14, borderRadius: 12 },
    decryptBtnText:{ color: C.white, fontWeight: '700', fontSize: 15 },

    // Error banner
    errorBanner:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8 },
    errorBannerText: { flex: 1, color: C.red, fontSize: 12 },

    // Decrypted section
    decryptedSection: { gap: 12, marginTop: 8 },
    decryptedHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
    decryptedTitle:   { fontSize: 16, fontWeight: '700', color: C.green },
    decryptedHint:    { fontSize: 12, color: C.textSub, fontStyle: 'italic' },
    decryptedScroll:  { backgroundColor: '#F0FFF4', borderRadius: 10, padding: 12, maxHeight: 300, borderWidth: 1, borderColor: C.border },
    decryptedText:    { fontFamily: 'monospace', fontSize: 12, color: C.textPrimary, lineHeight: 18 },
    resetBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    resetBtnText:     { color: C.primary, fontWeight: '600', fontSize: 13 },
});
