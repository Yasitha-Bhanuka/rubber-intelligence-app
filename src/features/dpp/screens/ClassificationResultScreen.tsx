import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DppResult } from '../types';

export default function ClassificationResultScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const result: DppResult = route.params?.result;

    if (!result) return <View><Text>No Result</Text></View>;

    const isConfidential = result.classification === 'CONFIDENTIAL';
    const themeColor = isConfidential ? '#FF3B30' : '#34C759'; // Red for secret, Green for public

    return (
        <ScrollView style={styles.container}>
            {/* Status Header */}
            <View style={[styles.header, { backgroundColor: themeColor }]}>
                <Ionicons
                    name={isConfidential ? "lock-closed" : "lock-open"}
                    size={48}
                    color="white"
                />
                <Text style={styles.statusTitle}>
                    {isConfidential ? 'CONFIDENTIAL' : 'NON-CONFIDENTIAL'}
                </Text>
                <Text style={styles.statusSubtitle}>{result.fileName}</Text>
            </View>

            <View style={styles.content}>
                {/* Action Card */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>System Action</Text>
                    <View style={styles.actionRow}>
                        <Ionicons
                            name={isConfidential ? "shield-checkmark" : "eye-outline"}
                            size={24}
                            color={themeColor}
                        />
                        <Text style={[styles.actionText, { color: themeColor }]}>
                            {result.systemAction}
                        </Text>
                    </View>
                    {isConfidential && (
                        <Text style={styles.encryptionNote}>
                            This file has been encrypted using AES-256 and access is restricted.
                        </Text>
                    )}
                </View>

                {/* Confidence Card */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardLabel}> Confidence Score :</Text>
                        <Text style={[styles.confidenceValue, { color: themeColor }]}>
                            {(result.confidenceScore * 100).toFixed(1)}% ({result.confidenceLevel})
                        </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${result.confidenceScore * 100}%`, backgroundColor: themeColor }
                            ]}
                        />
                    </View>
                </View>

                {/* Explanation Card */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Explanation/Reasoning</Text>
                    <Text style={styles.explanationText}>
                        {result.explanation}
                    </Text>

                    <Text style={[styles.cardLabel, { marginTop: 16 }]}>Influential Keywords</Text>
                    <View style={styles.keywordContainer}>
                        {result.influentialKeywords.map((kw, i) => (
                            <View key={i} style={[styles.keywordTag, { borderColor: themeColor }]}>
                                <Text style={[styles.keywordText, { color: themeColor }]}>{kw}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Extracted Text (Optional/Debug) */}
                {result.extractedText && (
                    <View style={[styles.card, { backgroundColor: '#f0f0f0' }]}>
                        <Text style={styles.cardLabel}>Extracted Scanned Text (Snippet)</Text>
                        <Text style={styles.debugText}>
                            {result.extractedText}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: themeColor }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Process Another Document</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 32,
        paddingTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    statusTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
        marginTop: 16,
        letterSpacing: 1,
    },
    statusSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardLabel: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionText: {
        fontSize: 18,
        fontWeight: '700',
    },
    encryptionNote: {
        marginTop: 8,
        color: '#666',
        fontStyle: 'italic',
        fontSize: 12,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    confidenceValue: {
        fontWeight: '700',
        fontSize: 16,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E5E5EA',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    explanationText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    keywordContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    keywordTag: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'white',
    },
    keywordText: {
        fontSize: 12,
        fontWeight: '600',
    },
    debugText: {
        color: '#666',
        fontFamily: 'monospace',
        fontSize: 11,
    },
    button: {
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
