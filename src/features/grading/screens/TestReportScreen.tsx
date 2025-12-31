import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../shared/styles/colors';
import { ReportService } from '../../../core/services/ReportService';

export const TestReportScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { batchId, result, params, pdfUri } = route.params || {} as any;

    const handleShare = async () => {
        if (pdfUri) {
            await ReportService.sharePDF(pdfUri);
        } else {
            // Fallback text share
            try {
                await Share.share({
                    message: `Rubber Grading Report\nBatch ID: ${batchId}\nResult: ${result?.predictedClass}\nConf: ${(result?.confidence * 100).toFixed(1)}%`,
                });
            } catch (error) {
                console.log(error);
            }
        }
    };

    const StatusBadge = ({ label, isGood }: { label: string, isGood: boolean }) => (
        <View style={[styles.badge, { backgroundColor: isGood ? colors.success : colors.error }]}>
            <Text style={styles.badgeText}>{label}</Text>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LinearGradient
                colors={[colors.primary, "#1B5E20"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerRow}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Test Report</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                    <Ionicons name="share-social-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.contentPadding}>

                <View style={styles.reportCard}>
                    <View style={styles.reportHeader}>
                        <Text style={styles.batchId}>Batch #{batchId || 'N/A'}</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.resultSection}>
                        <Text style={styles.sectionLabel}>Grading Result</Text>
                        {result ? (
                            <>
                                <Text style={styles.gradeDisplay}>{result.predictedClass}</Text>
                                <StatusBadge
                                    label={result.severity || 'Unknown'}
                                    isGood={result.predictedClass?.toLowerCase().includes('good')}
                                />
                                <Text style={styles.confidence}>
                                    AI Confidence: <Text style={{ fontWeight: 'bold' }}>{(result.confidence * 100).toFixed(1)}%</Text>
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.noData}>No result data available</Text>
                        )}
                    </View>

                    {result?.suggestions && (
                        <View style={styles.suggestionBox}>
                            <View style={styles.suggestionHeader}>
                                <Ionicons name="bulb-outline" size={20} color={colors.secondary} />
                                <Text style={styles.suggestionTitle}>AI Suggestion</Text>
                            </View>
                            <Text style={styles.suggestionText}>{result.suggestions}</Text>
                        </View>
                    )}

                    <View style={styles.metaContainer}>
                        <MetaRow label="Tester" value={params?.testerName || 'Unknown'} />
                        <MetaRow label="Sheet Count" value={params?.sheetCount || '-'} />
                        <MetaRow label="Weight" value={params?.sheetWeight ? `${params.sheetWeight} kg` : '-'} />
                    </View>

                    {pdfUri && (
                        <TouchableOpacity style={styles.pdfBtnContainer} onPress={handleShare}>
                            <LinearGradient
                                colors={[colors.secondary, '#FFA000']}
                                style={styles.pdfBtnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="share-social" size={20} color="#FFF" />
                                <Text style={styles.pdfBtnText}>Share / Save PDF</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.pdfBtnContainer}
                        onPress={() => navigation.navigate('ReportsDashboard' as never)}
                    >
                        <LinearGradient
                            colors={[colors.primary, '#4CAF50']}
                            style={styles.pdfBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="list" size={20} color="#FFF" />
                            <Text style={styles.pdfBtnText}>View All Reports</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>

                <View style={{ paddingBottom: 20 }}>
                    <TouchableOpacity
                        style={styles.doneBtnContainer}
                        onPress={() => navigation.navigate('QcLabHome' as never)}
                    >
                        <LinearGradient
                            colors={[colors.primary, '#1B5E20']}
                            style={styles.doneBtnGradient}
                        >
                            <Text style={styles.doneBtnText}>Done</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const MetaRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.lightGray,
    },
    contentPadding: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
    },
    backBtn: {
        padding: 8,
    },
    shareBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    reportCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 30,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    batchId: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    date: {
        fontSize: 14,
        color: colors.gray,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 15,
    },
    resultSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    sectionLabel: {
        fontSize: 13,
        color: colors.gray,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
    },
    gradeDisplay: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    badge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginBottom: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    confidence: {
        fontSize: 14,
        color: colors.gray,
    },
    noData: {
        color: colors.gray,
        fontStyle: 'italic',
    },
    suggestionBox: {
        backgroundColor: '#FFF9C4', // Light yellow for suggestion
        borderRadius: 12,
        padding: 15,
        marginBottom: 25,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    suggestionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FBC02D',
    },
    suggestionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    metaContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 15,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metaLabel: {
        fontSize: 14,
        color: colors.gray,
    },
    metaValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    pdfBtnContainer: {
        marginTop: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    pdfBtnGradient: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    pdfBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    doneBtnContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    doneBtnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    doneBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
