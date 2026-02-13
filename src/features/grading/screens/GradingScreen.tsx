import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../../shared/styles/colors';
import { GradingService, GradingResponse } from '../services/gradingService';
import { ImageValidator } from '../services/ImageValidator';
import { ReportService } from '../../../core/services/ReportService';
import { ValidationAlert } from '../components/ValidationAlert';

export const GradingScreen = () => {
    const navigation = useNavigation<any>();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GradingResponse | null>(null);

    // New Fields
    const [testDate] = useState(new Date().toLocaleDateString());
    const [testTime] = useState(new Date().toLocaleTimeString());
    const [testerName, setTesterName] = useState('');
    const [batchId] = useState(`BATCH-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    const [rubberCategory] = useState('RSS Rubber'); // Not editable
    const [sheetCount, setSheetCount] = useState('');
    const [sheetWeight, setSheetWeight] = useState('');

    // Custom Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const pickImage = async () => {
        const currentPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (currentPermission.status !== 'granted') {
            Alert.alert("Permission Required", "Need gallery access to upload images.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1], // MobileNet expects square, helps framing
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null); // Reset previous result
        }
    };

    const takePhoto = async () => {
        const currentPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (currentPermission.status !== 'granted') {
            setAlertMessage("Need camera access to take photos.");
            setAlertVisible(true);
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setLoading(true);
        try {
            // 1. Frontend Validation
            const validation = await ImageValidator.validateImage(image);
            if (!validation.isValid) {
                // Show Custom Alert
                setAlertMessage(validation.reason || "Please re-take image.");
                setAlertVisible(true);

                setLoading(false);
                return;
            }

            // 2. Backend Analysis
            const data = await GradingService.analyzeImage(image);
            setResult(data);
        } catch (error) {
            Alert.alert("Analysis Failed", "Could not analyze the image. Ensure backend is running.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!result) return;

        try {
            const html = ReportService.generateGradingHTML({
                batchId,
                result,
                params: {
                    testerName,
                    sheetCount,
                    sheetWeight,
                    testDate,
                    testTime
                }
            });
            const filename = `Grading_${batchId}.pdf`;
            const pdfUri = await ReportService.generatePDF(html, filename);

            if (pdfUri) {
                navigation.navigate('TestReports', {
                    batchId,
                    result,
                    pdfUri,
                    params: {
                        testerName,
                        sheetCount,
                        sheetWeight,
                        testDate,
                        testTime
                    }
                });
            }
        } catch (error) {
            Alert.alert("Error", "Failed to generate report.");
        }
    };

    const renderResult = () => {
        if (!result) return null;

        const isGood = result.predictedClass.toLowerCase().includes("good");
        const statusColor = isGood ? colors.success : colors.error;

        return (
            <View style={styles.resultCard}>
                <View style={[styles.badge, { backgroundColor: statusColor }]}>
                    <Text style={styles.badgeText}>Severity: {result.severity}</Text>
                </View>

                <Text style={styles.resultTitle}>{result.predictedClass}</Text>
                <Text style={styles.confidence}>Confidence: {(result.confidence * 100).toFixed(1)}%</Text>

                {/* Grade Display */}
                <View style={[styles.gradeContainer, { backgroundColor: isGood ? '#E8F5E9' : '#FFF3E0' }]}>
                    <Text style={[styles.gradeLabel, { color: isGood ? '#2E7D32' : '#EF6C00' }]}>
                        Grading Result:
                    </Text>
                    <Text style={[styles.gradeValue, { color: isGood ? '#1B5E20' : '#E65100' }]}>
                        {(() => {
                            const prediction = result.predictedClass.toLowerCase();
                            if (prediction.includes("good")) return "RSS 1";
                            if (prediction.includes("pin")) return "RSS 2";
                            if (prediction.includes("reaper")) return "RSS 3";
                            return "Ungraded";
                        })()}
                    </Text>
                </View>

                <View style={styles.separator} />

                <Text style={styles.suggestionTitle}>Suggestion:</Text>
                <Text style={styles.suggestionText}>{result.suggestions}</Text>

                <TouchableOpacity style={styles.reportBtnContainer} onPress={handleGenerateReport}>
                    <LinearGradient
                        colors={[colors.primary, '#4CAF50']}
                        style={styles.reportBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="document-text-outline" size={20} color="#FFF" />
                        <Text style={styles.reportBtnText}>Generate Report</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <ScrollView
            contentContainerStyle={[styles.container, result && styles.containerResult]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <Animated.View entering={FadeInDown.duration(400)} style={{ width: '100%' }}>
                <LinearGradient
                    colors={[colors.primary, "#1B5E20"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerRow}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonMini}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleWrap}>
                        <MaterialCommunityIcons name="image-search" size={24} color="rgba(255,255,255,0.9)" />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.headerWhite}>Rubber Sheet Grading</Text>
                            {!result && <Text style={styles.subHeaderWhite}>Detect defects & check quality</Text>}
                        </View>
                    </View>

                    <View style={{ width: 34 }} />
                </LinearGradient>
            </Animated.View>

            {/* Form Section with Card */}
            <View style={styles.formCard}>
                <Text style={styles.formTitle}>Batch Information</Text>

                <View style={styles.formGrid}>
                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Batch ID</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.readOnlyText}>{batchId}</Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.readOnlyText}>{rubberCategory}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Test Date</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.readOnlyText}>{testDate}</Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Test Time</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.readOnlyText}>{testTime}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.fullWidthItem}>
                            <Text style={styles.label}>Tester Name</Text>
                            <TextInput
                                style={styles.input}
                                value={testerName}
                                onChangeText={setTesterName}
                                placeholder="Enter name"
                                placeholderTextColor={colors.gray}
                            />
                        </View>
                    </View>

                    <View style={styles.gridRow}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Sheet Count</Text>
                            <TextInput
                                style={styles.input}
                                value={sheetCount}
                                onChangeText={setSheetCount}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.gray}
                            />
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={sheetWeight}
                                onChangeText={setSheetWeight}
                                keyboardType="numeric"
                                placeholder="0.0"
                                placeholderTextColor={colors.gray}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Image Section */}
            <View style={result ? styles.topRow : styles.centerContent}>
                <View style={[styles.imageCard, result && styles.imageCardSmall]}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="image-outline" size={60} color={colors.gray} />
                            <Text style={styles.placeholderText}>No Image Selected</Text>
                            <Text style={styles.placeholderSubText}>Tap buttons below to add</Text>
                        </View>
                    )}
                </View>

                <View style={result ? styles.controlsRight : styles.controlsCenter}>
                    {/* Buttons Logic: Show smaller icons in result mode */}
                    <View style={result ? styles.buttonRowSmall : styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, result && styles.actionBtnSmall]}
                            onPress={pickImage}
                            activeOpacity={0.8}
                        >
                            <View style={styles.btnIconContainer}>
                                <Ionicons name="images" size={result ? 20 : 24} color="#FFF" />
                            </View>
                            {!result && <Text style={styles.btnText}>Gallery</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cameraBtn, result && styles.actionBtnSmall]}
                            onPress={takePhoto}
                            activeOpacity={0.8}
                        >
                            <View style={styles.btnIconContainer}>
                                <Ionicons name="camera" size={result ? 20 : 24} color="#FFF" />
                            </View>
                            {!result && <Text style={styles.btnText}>Camera</Text>}
                        </TouchableOpacity>
                    </View>

                    {image && (
                        <TouchableOpacity
                            style={[styles.analyzeBtn, result && styles.analyzeBtnSmall, loading && styles.disabledBtn]}
                            onPress={handleAnalyze}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="analytics"
                                        size={result ? 18 : 22}
                                        color="#FFF"
                                        style={styles.analyzeIcon}
                                    />
                                    <Text style={styles.analyzeText}>
                                        {result ? "Re-Analyze" : "Analyze Sheet"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Result Section */}
            {renderResult()}
            {/* Custom Validation Alert */}
            <ValidationAlert
                visible={alertVisible}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.lightGray,
        alignItems: 'center',
    },
    containerResult: {
        // Keeps center alignment consistent
    },

    headerContainer: {
        alignItems: 'center',
        marginBottom: 25,
        width: '100%',
    },
    header: {
        fontSize: 30,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 6,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    headerSmall: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 10,
        alignSelf: 'center',
        textAlign: 'center',
        width: '100%',
    },
    subHeader: {
        fontSize: 15,
        color: colors.gray,
        textAlign: 'center',
        marginTop: 4,
        letterSpacing: 0.2,
    },

    centerContent: {
        width: '90%',
        alignItems: 'center',
        marginTop: 10,
    },
    topRow: {
        flexDirection: 'row',
        width: '90%',
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 5,
    },

    // Form Styles
    formCard: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 22,
        marginBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 18,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.lightGray,
    },
    formGrid: {
        width: '100%',
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    gridItem: {
        width: '48%',
    },
    fullWidthItem: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 14,
        borderColor: '#E0E0E0',
        borderWidth: 1.5,
        color: colors.text,
        fontSize: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    inputContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 14,
        borderColor: '#E0E0E0',
        borderWidth: 1.5,
        justifyContent: 'center',
    },
    readOnlyText: {
        color: colors.gray,
        fontSize: 15,
        fontWeight: '500',
    },

    // Image Styles
    imageCard: {
        width: '100%',
        aspectRatio: 1,
        maxHeight: 350,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    imageCardSmall: {
        width: 100,
        height: 100,
        borderRadius: 14,
        marginBottom: 0,
        marginRight: 15,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 4,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    placeholder: {
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        marginTop: 12,
        color: colors.gray,
        fontSize: 15,
        fontWeight: '500',
    },
    placeholderSubText: {
        marginTop: 4,
        color: '#BBB',
        fontSize: 13,
    },

    // Controls Styles
    controlsCenter: {
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    controlsRight: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 25,
    },
    buttonRowSmall: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    actionBtnSmall: {
        height: 48,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    btnIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBtn: {
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
    },
    btnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.3,
    },
    analyzeBtn: {
        backgroundColor: colors.primary,
        height: 60,
        width: '100%',
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    analyzeBtnSmall: {
        height: 52,
        borderRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    analyzeIcon: {
        marginRight: 8,
    },
    disabledBtn: {
        backgroundColor: '#95A5A6',
        shadowColor: '#95A5A6',
    },
    analyzeText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    // Result Styles
    resultCard: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        borderLeftWidth: 6,
        borderLeftColor: colors.primary,
        marginTop: 10,
        marginBottom: 30,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    confidence: {
        fontSize: 15,
        color: '#7F8C8D',
        marginBottom: 10,
        fontWeight: '500',
    },
    gradeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    gradeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    gradeValue: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    separator: {
        height: 1.5,
        backgroundColor: '#F0F0F0',
        marginVertical: 16,
    },
    suggestionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    suggestionText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        marginBottom: 5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        width: '100%',
        marginBottom: 10,
    },
    backButtonMini: {
        padding: 5,
    },
    headerTitleWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerWhite: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
    },
    subHeaderWhite: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    reportBtnContainer: {
        marginTop: 22,
        borderRadius: 12,
        overflow: 'hidden',
    },
    reportBtnGradient: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    reportBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 18,
    }
});