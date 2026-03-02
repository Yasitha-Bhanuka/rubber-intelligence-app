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

    const { classification, dppId, fields, fieldsExtracted } = result;
    const isConfidential = classification.classification === 'CONFIDENTIAL';
    const themeColor = isConfidential ? COLORS.red : COLORS.green;
    const confidentialFields = fields.filter(f => f.isConfidential);
    const publicFields = fields.filter(f => !f.isConfidential);

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

            {/* System Action */}
            <View style={styles.card}>
                <Text style={styles.cardLabel}>System Action</Text>
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
                    <Text style={styles.cardLabel}>Confidence Score</Text>
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
                            <View key={i} style={styles.fieldRow}>
                                <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.green} />
                                <Text style={styles.fieldName}>{f.fieldName}</Text>
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
});
