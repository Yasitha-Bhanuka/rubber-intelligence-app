/**
 * Confidentiality Result Screen
 * Displays AI/ML analysis results for document confidentiality
 * Buyer can view but cannot edit or override results
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionHeader, StatusBadge, ProgressBar, InfoRow } from '../components';
import { DPPStackParamList, ConfidentialityResult } from '../types/dpp.types';
import { mockConfidentialityResult } from '../data/mockData';

// Enable layout animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    if (!(global as any).nativeFabricUIManager) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'ConfidentialityResult'>;
type RouteType = RouteProp<DPPStackParamList, 'ConfidentialityResult'>;

/**
 * Confidentiality Result Screen Component
 * Shows document analysis results from AI/ML backend
 */
const ConfidentialityResultScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteType>();
    const { lotInfo, analysisResults } = route.params;

    // Use passed results or fallback to mock (for dev testing)
    const resultsToDisplay = analysisResults && analysisResults.length > 0
        ? analysisResults
        : [{ ...mockConfidentialityResult, lotId: lotInfo.lotId, documentName: 'Mock Document.pdf' }];

    /**
     * Handle continue to DPP generation
     */
    const handleContinue = () => {
        // Collect all results for next step
        const combinedResult = resultsToDisplay[0]; // Logic to combine?
        // Ideally pass all results, but for now passing the primary/first one to satisfy type
        navigation.navigate('TagAssignment', {
            lotInfo,
            confidentialityResult: combinedResult,
        });
    };

    /**
     * Render sensitive indicator item
     */
    const renderIndicator = (label: string, detected: boolean) => (
        <View style={styles.indicatorRow} key={label}>
            <View style={styles.indicatorLeft}>
                <Ionicons
                    name={detected ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={detected ? "#E65100" : "#4CAF50"}
                />
                <Text style={styles.indicatorLabel}>{label}</Text>
            </View>
            <Text style={[
                styles.indicatorStatus,
                { color: detected ? '#E65100' : '#4CAF50' }
            ]}>
                {detected ? 'Detected' : 'Not Found'}
            </Text>
        </View>
    );

    /**
     * Render a single analysis result card
     */
    const renderAnalysisCard = (result: ConfidentialityResult, index: number) => {
        return (
            <View key={index} style={{ marginBottom: 20 }}>
                <SectionHeader
                    title={result.documentName || `Document ${index + 1}`}
                    subtitle="Analysis Breakdown"
                />

                <Card>
                    <View style={styles.classificationHeader}>
                        <Text style={styles.classificationLabel}>Classification</Text>
                        <StatusBadge
                            type={result.classification}
                            text={result.classification === 'confidential' ? 'CONFIDENTIAL' : 'Non-Confidential'}
                        />
                    </View>

                    <View style={styles.confidenceSection}>
                        <ProgressBar
                            value={result.confidenceScore}
                            label="Confidence Score"
                            color={result.classification === 'confidential' ? '#E65100' : '#4CAF50'}
                        />
                    </View>

                    {result.classification === 'confidential' && (
                        <View style={styles.warningBox}>
                            <Ionicons name="warning" size={20} color="#E65100" />
                            <Text style={styles.warningText}>
                                Sensitive content detected. Encryption protocols activated.
                            </Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitleSmall}>Sensitive Indicators</Text>
                    {renderIndicator('Bank Details', result.sensitiveIndicators.bankDetails)}
                    {renderIndicator('Pricing Data', result.sensitiveIndicators.pricingInformation)}
                    {renderIndicator('Personal ID', result.sensitiveIndicators.personalIdentifiers)}
                    {renderIndicator('Contracts', result.sensitiveIndicators.contractTerms)}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitleSmall}>Encryption Status</Text>
                    <View style={styles.encryptionStatus}>
                        <Ionicons
                            name={result.encryptionApplied ? "lock-closed" : "lock-open-outline"}
                            size={24}
                            color={result.encryptionApplied ? '#2E7D32' : '#757575'}
                        />
                        <Text style={styles.encryptionText}>
                            {result.encryptionApplied
                                ? 'Encrypted (AES-256)'
                                : 'Not Required'}
                        </Text>
                    </View>

                    {result.extractedText && (
                        <View style={styles.extractedTextContainer}>
                            <Text style={styles.extractedTextLabel}>Gemini OCR Extraction:</Text>
                            <Text style={styles.extractedTextContent} numberOfLines={4} ellipsizeMode="tail">
                                {result.extractedText}
                            </Text>
                        </View>
                    )}
                </Card>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confidentiality Analysis</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Analysis Complete Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerIcon}>
                        <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                    </View>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>Analysis Complete</Text>
                        <Text style={styles.bannerText}>
                            Processed {resultsToDisplay.length} document(s) via Gemini & Onnx
                        </Text>
                    </View>
                </View>

                {/* Render All Results */}
                {resultsToDisplay.map((res, idx) => renderAnalysisCard(res, idx))}

                {/* Common Notice */}
                <Card>
                    <View style={styles.noticeBox}>
                        <Ionicons name="information-circle" size={20} color="#1565C0" />
                        <Text style={styles.noticeText}>
                            Results generated by RubberIntelligence AI/ML Core.
                        </Text>
                    </View>
                </Card>

                {/* Continue Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                    >
                        <Ionicons name="arrow-forward-circle" size={22} color="#FFFFFF" />
                        <Text style={styles.continueButtonText}>Continue to DPP Generation</Text>
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E7D32',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
    },
    bannerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bannerText: {
        fontSize: 13,
        color: '#C8E6C9',
        marginTop: 2,
    },
    classificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    classificationLabel: {
        fontSize: 14,
        color: '#666666',
    },
    confidenceSection: {
        marginTop: 8,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF3E0',
        borderRadius: 6,
        padding: 12,
        marginTop: 12,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#E65100',
        marginLeft: 8,
        lineHeight: 18,
    },
    indicatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    indicatorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicatorLabel: {
        fontSize: 14,
        color: '#333333',
        marginLeft: 10,
    },
    indicatorStatus: {
        fontSize: 13,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    sectionTitleSmall: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 4,
    },
    encryptionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
    },
    encryptionText: {
        marginLeft: 10,
        color: '#333',
        fontWeight: '500',
    },
    extractedTextContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F3E5F5', // Light purple for AI magic feel
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    extractedTextLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7B1FA2',
        marginBottom: 4,
    },
    extractedTextContent: {
        fontSize: 12,
        color: '#4A148C',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    noticeBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E3F2FD',
        borderRadius: 6,
        padding: 12,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: '#1565C0',
        marginLeft: 8,
        lineHeight: 18,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    continueButton: {
        backgroundColor: '#2E7D32',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ConfidentialityResultScreen;
