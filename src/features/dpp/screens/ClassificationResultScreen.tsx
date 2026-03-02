import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DppUploadResponse } from '../types';
import { generatePassport } from '../services/dppService';

const COLORS = {
    primary: '#007AFF',
    bg: '#F2F2F7',
    white: '#FFFFFF',
    text: '#1C1C1E',
    sub: '#636366',
    border: '#E5E5EA',
    green: '#34C759',
    red: '#FF3B30',
    purple: '#5856D6',
    orange: '#FF9500',
};

export default function ClassificationResultScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const result: DppUploadResponse = route.params?.result;
    const [generating, setGenerating] = useState(false);

    if (!result) return (
        <View style={styles.fallback}>
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.red} />
            <Text style={styles.fallbackText}>No result available</Text>
        </View>
    );

    const { classification, dppId, fields, fieldsExtracted, supportedFormats } = result;
    const isConfidential = classification.classification === 'CONFIDENTIAL';
    const themeColor = isConfidential ? COLORS.red : COLORS.green;
    const confidentialFields = fields.filter(f => f.isConfidential);
    const publicFields = fields.filter(f => !f.isConfidential);
    const geminiCount   = classification.geminiExtractedCount ?? fieldsExtracted;
    const pubCount      = classification.publicFieldCount     ?? publicFields.length;
    const encCount      = classification.confidentialFieldCount ?? confidentialFields.length;

    const handleGeneratePassport = async () => {
        setGenerating(true);
        try {
            const passport = await generatePassport(dppId);
            navigation.navigate('DppPassport', { passport, dppId });
        } catch (err: any) {
            Alert.alert(
                'Passport Error',
                err.response?.data?.error || 'Failed to generate Digital Product Passport.'
            );
        } finally {
            setGenerating(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            {/* Status Header */}
            <View style={[styles.header, { backgroundColor: themeColor }]}>
                <View style={styles.headerIconRing}>
                    <Ionicons
                        name={isConfidential ? 'lock-closed' : 'lock-open'}
                        size={40}
                        color={themeColor}
                    />
                </View>
                <Text style={styles.statusTitle}>
                    {isConfidential ? 'CONFIDENTIAL' : 'NON-CONFIDENTIAL'}
                </Text>
                <Text style={styles.statusSubtitle}>
                    {fieldsExtracted} fields extracted · {confidentialFields.length} encrypted
                </Text>
            </View>

            {/* ── Gemini AI OCR Extraction ── */}
            <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="sparkles" size={16} color="#FF9F0A" />
                    <Text style={[styles.cardLabel, { color: '#FF9F0A', marginBottom: 0 }]}>Gemini AI · Extracted Content</Text>
                </View>

                {/* Stats row */}
                <View style={styles.statRow}>
                    <View style={[styles.statBox, { backgroundColor: '#FFF9EE' }]}>
                        <Text style={[styles.statNum, { color: '#FF9F0A' }]}>{geminiCount}</Text>
                        <Text style={styles.statLbl}>Total Fields</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#F0FFF4' }]}>
                        <Text style={[styles.statNum, { color: COLORS.green }]}>{pubCount}</Text>
                        <Text style={styles.statLbl}>Public</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: '#FFF0F0' }]}>
                        <Text style={[styles.statNum, { color: COLORS.red }]}>{encCount}</Text>
                        <Text style={styles.statLbl}>Encrypted</Text>
                    </View>
                </View>

                {/* Field-value list */}
                {fields.map((f, i) => (
                    <View key={i} style={[
                        styles.extractedRow,
                        i < fields.length - 1 && styles.extractedRowBorder
                    ]}>
                        <View style={styles.extractedLeft}>
                            <Text style={styles.extractedFieldName}>{f.fieldName}</Text>
                            {f.isConfidential ? (
                                <View style={styles.encryptedBadge}>
                                    <Ionicons name="lock-closed" size={10} color={COLORS.red} />
                                    <Text style={styles.encryptedBadgeText}>AES-256 Encrypted</Text>
                                </View>
                            ) : (
                                <Text style={styles.extractedValue} numberOfLines={2}>
                                    {f.extractedValue && f.extractedValue.trim() ? f.extractedValue : '—'}
                                </Text>
                            )}
                        </View>
                        <View style={[
                            styles.fieldConfBadge,
                            { backgroundColor: f.isConfidential ? '#FFE5E5' : '#E5FFE5' }
                        ]}>
                            <Text style={[
                                styles.fieldConfBadgeText,
                                { color: f.isConfidential ? COLORS.red : COLORS.green }
                            ]}>
                                {(f.confidenceScore * 100).toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* ── Supported File Formats ── */}
            <View style={[styles.card, styles.formatsCard]}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="document-attach-outline" size={16} color={COLORS.purple} />
                    <Text style={[styles.cardLabel, { color: COLORS.purple, marginBottom: 0 }]}>Supported Formats</Text>
                </View>
                <View style={styles.formatsRow}>
                    {(supportedFormats ?? ['JPEG', 'PNG', 'WEBP', 'GIF', 'PDF']).map((fmt, i) => {
                        const label = fmt.includes('/') ? fmt.split('/')[1].toUpperCase() : fmt.toUpperCase();
                        const isPdf = label === 'PDF';
                        return (
                            <View key={i} style={[styles.formatChip, { borderColor: isPdf ? COLORS.orange : COLORS.purple }]}>
                                <Ionicons
                                    name={isPdf ? 'document-outline' : 'image-outline'}
                                    size={12}
                                    color={isPdf ? COLORS.orange : COLORS.purple}
                                />
                                <Text style={[styles.formatChipText, { color: isPdf ? COLORS.orange : COLORS.purple }]}>
                                    {label}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* ── ONNX Model Classification ── */}
            {/* System Action */}
            <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                    <Ionicons name="hardware-chip-outline" size={14} color={COLORS.purple} />
                    <Text style={[styles.cardLabel, { color: COLORS.purple, marginBottom: 0 }]}>ONNX Model · System Action</Text>
                </View>
                <View style={styles.actionRow}>
                    <Ionicons
                        name={isConfidential ? 'shield-checkmark' : 'eye-outline'}
                        size={22}
                        color={themeColor}
                    />
                    <Text style={[styles.actionText, { color: themeColor }]}>
                        {classification.systemAction}
                    </Text>
                </View>
            </View>

            {/* Confidence */}
            <View style={styles.card}>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardLabel}>ONNX Model · Confidence Score</Text>
                    <Text style={[styles.confidenceValue, { color: themeColor }]}>
                        {(classification.confidenceScore * 100).toFixed(1)}% · {classification.confidenceLevel}
                    </Text>
                </View>
                <View style={styles.progressBg}>
                    <View style={[
                        styles.progressFill,
                        { width: `${classification.confidenceScore * 100}%` as any, backgroundColor: themeColor }
                    ]} />
                </View>
            </View>

            {/* Explanation */}
            <View style={styles.card}>
                <Text style={styles.cardLabel}>AI Explanation</Text>
                <Text style={styles.explanationText}>{classification.explanation}</Text>
                {classification.influentialKeywords.length > 0 && (
                    <>
                        <Text style={[styles.cardLabel, { marginTop: 16 }]}>Influential Keywords</Text>
                        <View style={styles.keywordRow}>
                            {classification.influentialKeywords.map((kw, i) => (
                                <View key={i} style={[styles.keyword, { borderColor: themeColor }]}>
                                    <Text style={[styles.keywordText, { color: themeColor }]}>{kw}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>

            {/* Field breakdown */}
            <View style={styles.card}>
                <Text style={styles.cardLabel}>Field Classification</Text>

                {confidentialFields.length > 0 && (
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldGroupHeader, { backgroundColor: '#FFF0F0' }]}>
                            <Ionicons name="lock-closed" size={14} color={COLORS.red} />
                            <Text style={[styles.fieldGroupTitle, { color: COLORS.red }]}>
                                Encrypted Fields ({confidentialFields.length})
                            </Text>
                        </View>
                        {confidentialFields.map((f, i) => (
                            <View key={i} style={styles.fieldRow}>
                                <Ionicons name="key-outline" size={14} color={COLORS.red} />
                                <Text style={styles.fieldName}>{f.fieldName}</Text>
                                <View style={[styles.fieldTag, { backgroundColor: '#FFE5E5' }]}>
                                    <Text style={[styles.fieldTagText, { color: COLORS.red }]}>
                                        {(f.confidenceScore * 100).toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {publicFields.length > 0 && (
                    <View style={styles.fieldGroup}>
                        <View style={[styles.fieldGroupHeader, { backgroundColor: '#F0FFF4' }]}>
                            <Ionicons name="eye-outline" size={14} color={COLORS.green} />
                            <Text style={[styles.fieldGroupTitle, { color: COLORS.green }]}>
                                Public Fields ({publicFields.length})
                            </Text>
                        </View>
                        {publicFields.map((f, i) => (
                            <View key={i} style={[styles.fieldRow, { alignItems: 'flex-start' }]}>
                                <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.green} style={{ marginTop: 3 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fieldName}>{f.fieldName}</Text>
                                    {f.extractedValue ? (
                                        <Text style={styles.fieldExtractedVal} numberOfLines={2}>
                                            {f.extractedValue}
                                        </Text>
                                    ) : null}
                                </View>
                                <View style={[styles.fieldTag, { backgroundColor: '#E5FFE5' }]}>
                                    <Text style={[styles.fieldTagText, { color: COLORS.green }]}>Public</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* DPP ID */}
            <View style={styles.idCard}>
                <Ionicons name="finger-print-outline" size={18} color={COLORS.purple} />
                <Text style={styles.idLabel}>DPP ID</Text>
                <Text style={styles.idValue} numberOfLines={1}>{dppId}</Text>
            </View>

            {/* Actions */}
            <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: COLORS.purple }, generating && styles.disabled]}
                onPress={handleGeneratePassport}
                disabled={generating}
            >
                {generating ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Ionicons name="document-lock-outline" size={22} color="white" />
                )}
                <Text style={styles.primaryBtnText}>
                    {generating ? 'Generating...' : 'Generate Digital Product Passport'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('DocumentUpload')}
            >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryBtnText}>Process Another Document</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    inner: { paddingBottom: 40 },
    fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    fallbackText: { fontSize: 16, color: COLORS.sub },
    header: {
        paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24,
        alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        marginBottom: 20,
    },
    headerIconRing: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    statusTitle: { color: 'white', fontSize: 22, fontWeight: '800', letterSpacing: 1.5 },
    statusSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6 },
    card: {
        backgroundColor: COLORS.white, borderRadius: 16,
        padding: 18, marginHorizontal: 16, marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardLabel: {
        fontSize: 11, color: '#8E8E93', fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
    },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    actionText: { fontSize: 17, fontWeight: '700' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    confidenceValue: { fontWeight: '700', fontSize: 14 },
    progressBg: { height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    explanationText: { fontSize: 15, color: '#333', lineHeight: 22 },
    keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    keyword: { borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    keywordText: { fontSize: 12, fontWeight: '700' },
    fieldGroup: { marginBottom: 10 },
    fieldGroupHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginBottom: 8,
    },
    fieldGroupTitle: { fontSize: 12, fontWeight: '700' },
    fieldRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    fieldName: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
    fieldTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    fieldTagText: { fontSize: 11, fontWeight: '700' },
    idCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: 16, marginBottom: 20,
        backgroundColor: '#EEF0FF', padding: 14, borderRadius: 12,
    },
    idLabel: { color: COLORS.purple, fontWeight: '700', fontSize: 13 },
    idValue: { flex: 1, fontSize: 11, color: COLORS.sub, fontFamily: 'monospace' },
    primaryBtn: {
        marginHorizontal: 16, marginBottom: 12,
        padding: 18, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
    disabled: { opacity: 0.7 },
    secondaryBtn: {
        marginHorizontal: 16,
        padding: 14, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.white,
    },
    secondaryBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
    // ── Gemini extraction card ──
    sectionHeaderRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
    },
    statRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statBox: {
        flex: 1, borderRadius: 10, padding: 10, alignItems: 'center',
    },
    statNum: { fontSize: 22, fontWeight: '800' },
    statLbl: { fontSize: 10, color: COLORS.sub, fontWeight: '600', marginTop: 2 },
    extractedRow: {
        flexDirection: 'row', alignItems: 'flex-start',
        paddingVertical: 9, gap: 8,
    },
    extractedRowBorder: {
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    extractedLeft: { flex: 1 },
    extractedFieldName: {
        fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 3,
    },
    extractedValue: {
        fontSize: 12, color: COLORS.sub, lineHeight: 16,
    },
    encryptedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFE5E5', paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, alignSelf: 'flex-start',
    },
    encryptedBadgeText: { fontSize: 10, color: COLORS.red, fontWeight: '700' },
    fieldConfBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 40, alignItems: 'center',
    },
    fieldConfBadgeText: { fontSize: 11, fontWeight: '800' },
    // ── Supported formats card ──
    formatsCard: {},
    formatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    formatChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
    },
    formatChipText: { fontSize: 11, fontWeight: '700' },
    // ── Field breakdown extras ──
    fieldExtractedVal: {
        fontSize: 11, color: COLORS.sub, marginTop: 2, lineHeight: 16,
    },
});
