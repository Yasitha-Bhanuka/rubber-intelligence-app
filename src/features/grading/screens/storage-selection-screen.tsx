import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../shared/styles/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StorageDetails {
    suitability: string;
    duration: string;
    tips: string;
    ammoniaLevel?: string;
    coagulation?: string;
}

interface Prediction {
    type: string;
    confidence: string;
    recommendation: string;
    icon: string;
    details: StorageDetails;
    humidity: number;
    temperature: number;
}

export default function StorageSelectionScreen() {
    const navigation = useNavigation();
    const [humidity, setHumidity] = useState('');
    const [temperature, setTemperature] = useState('');
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [storageType, setStorageType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Animation value for fade-in effect
    const fadeAnim = useState(new Animated.Value(0))[0];

    React.useEffect(() => {
        if (prediction) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }
    }, [prediction]);

    const validateInputs = () => {
        if (!humidity.trim() || !temperature.trim()) {
            Alert.alert('Missing Information', 'Please enter both humidity and temperature values');
            return false;
        }

        const hum = parseFloat(humidity);
        const temp = parseFloat(temperature);

        if (isNaN(hum) || isNaN(temp)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers');
            return false;
        }

        if (hum < 0 || hum > 100) {
            Alert.alert('Invalid Humidity', 'Humidity must be between 0% and 100%');
            return false;
        }

        if (temp < 0 || temp > 40) {
            Alert.alert('Invalid Temperature', 'Rubber latex temperature must be between 0°C and 40°C');
            return false;
        }

        return true;
    };

    const predictStorage = () => {
        if (!validateInputs()) return;

        setIsLoading(true);

        // Simulate loading for better UX
        setTimeout(() => {
            const hum = parseFloat(humidity);
            const temp = parseFloat(temperature);

            // Rubber Latex specific storage conditions
            let type = '';
            let confidence = '';
            let recommendation = '';
            let icon = '';
            let details: StorageDetails = {
                suitability: '',
                duration: '',
                tips: '',
                ammoniaLevel: '',
                coagulation: ''
            };

            // Optimal conditions for rubber latex storage
            if (temp >= 15 && temp <= 25 && hum >= 60 && hum <= 75) {
                type = 'Optimal Latex Storage';
                confidence = 'High';
                icon = 'check-circle';
                recommendation = 'Ideal conditions for preserving natural rubber latex';
                details = {
                    suitability: 'Natural Rubber Latex - Field Grade, Concentrated Latex',
                    duration: '3-6 months with proper preservation',
                    tips: 'Maintain ammonia levels at 0.6-0.7% for preservation',
                    ammoniaLevel: '0.6% - 0.7% recommended',
                    coagulation: 'Low risk of coagulation'
                };
            } else if (temp >= 10 && temp < 15 && hum >= 65 && hum <= 80) {
                type = 'Cool Latex Storage';
                confidence = 'High';
                icon = 'thermometer-chevron-down';
                recommendation = 'Cool conditions suitable for short-term latex storage';
                details = {
                    suitability: 'Preserved Latex Concentrate, Field Latex',
                    duration: '2-4 months',
                    tips: 'Monitor viscosity regularly; consider gentle warming before use',
                    ammoniaLevel: '0.7% - 0.8% recommended',
                    coagulation: 'Minimal coagulation risk'
                };
            } else if (temp >= 25 && temp <= 30 && hum >= 55 && hum <= 70) {
                type = 'Warm Climate Storage';
                confidence = 'Medium';
                icon = 'weather-sunny';
                recommendation = 'Higher temperatures require additional preservation measures';
                details = {
                    suitability: 'Stabilized Latex with enhanced preservation',
                    duration: '1-2 months',
                    tips: 'Increase ammonia to 0.8%; store in shaded area; avoid direct sunlight',
                    ammoniaLevel: '0.8% - 0.9% recommended',
                    coagulation: 'Moderate coagulation risk'
                };
            } else if (temp >= 2 && temp < 10 && hum >= 70 && hum <= 85) {
                type = 'Chilled Latex Storage';
                confidence = 'Medium';
                icon = 'snowflake';
                recommendation = 'Cold storage suitable for extended preservation';
                details = {
                    suitability: 'Long-term latex concentrate storage',
                    duration: '6-8 months',
                    tips: 'Prevent freezing; warm gradually before use; check for pre-coagulation',
                    ammoniaLevel: '0.5% - 0.6% sufficient',
                    coagulation: 'Low risk but check for thickening'
                };
            } else if (temp > 30 && temp <= 35 && hum >= 40 && hum <= 60) {
                type = 'High Temperature Storage';
                confidence = 'Low';
                icon = 'alert';
                recommendation = 'Elevated temperatures accelerate latex degradation';
                details = {
                    suitability: 'Emergency/Short-term only',
                    duration: '< 2 weeks',
                    tips: 'Use maximum preservation (1.0% ammonia); frequent quality checks; consider cooling',
                    ammoniaLevel: '0.9% - 1.0% required',
                    coagulation: 'High coagulation risk'
                };
            } else if (hum < 40 || hum > 90) {
                type = 'Humidity Warning';
                confidence = 'Low';
                icon = 'water-alert';
                recommendation = 'Extreme humidity levels affect latex stability';
                details = {
                    suitability: 'Not recommended for standard latex',
                    duration: 'Temporary only',
                    tips: hum < 40 
                        ? 'Risk of surface skinning; increase humidity or use sealed containers'
                        : 'Risk of bacterial growth; increase ammonia and antifungal agents',
                    ammoniaLevel: hum < 40 ? '0.6% minimum' : '0.8% - 1.0% recommended',
                    coagulation: hum < 40 ? 'Surface coagulation risk' : 'Bacterial coagulation risk'
                };
            } else {
                type = 'Non-Standard Conditions';
                confidence = 'Low';
                icon = 'alert-circle';
                recommendation = 'Conditions outside optimal range for latex storage';
                details = {
                    suitability: 'Consult latex technical specialist',
                    duration: 'Not recommended for long-term',
                    tips: 'Consider immediate processing or enhanced preservation',
                    ammoniaLevel: 'Consult preservation guidelines',
                    coagulation: 'High risk - monitor closely'
                };
            }

            setStorageType(type);
            setPrediction({
                type,
                confidence,
                recommendation,
                icon,
                details,
                humidity: hum,
                temperature: temp
            });
            setIsLoading(false);
        }, 1000);
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'High': return '#10B981';
            case 'Medium': return '#F59E0B';
            case 'Low': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStorageIcon = (type: string | null) => {
        if (!type) return 'barrel';
        if (type.includes('Optimal')) return 'check-decagram';
        if (type.includes('Cool')) return 'thermometer-chevron-down';
        if (type.includes('Warm')) return 'weather-sunny';
        if (type.includes('Chilled')) return 'snowflake';
        if (type.includes('High Temperature')) return 'thermometer-alert';
        if (type.includes('Humidity')) return 'water-alert';
        if (type.includes('Non-Standard')) return 'alert-circle';
        return 'barrel';
    };

    const clearInputs = () => {
        setHumidity('');
        setTemperature('');
        setPrediction(null);
        setStorageType(null);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rubber Latex Storage</Text>
                {prediction && (
                    <TouchableOpacity onPress={clearInputs} style={styles.clearButton}>
                        <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconBackground}>
                            <MaterialCommunityIcons
                                name={getStorageIcon(storageType) as any}
                                size={80}
                                color={colors.primary}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Storage Conditions</Text>
                    <Text style={styles.sectionSubtitle}>Enter temperature and humidity for rubber latex</Text>

                    <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconContainer}>
                                <MaterialCommunityIcons name="water-percent" size={24} color={colors.primary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Humidity (%)"
                                value={humidity}
                                onChangeText={setHumidity}
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                                maxLength={5}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconContainer}>
                                <MaterialCommunityIcons name="thermometer" size={24} color={colors.primary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Temperature (°C)"
                                value={temperature}
                                onChangeText={setTemperature}
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                                maxLength={6}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.predictButton, isLoading && styles.predictButtonDisabled]}
                        onPress={predictStorage}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <MaterialCommunityIcons name="loading" size={20} color="#FFF" />
                                <Text style={styles.predictButtonText}> Analyzing...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <MaterialCommunityIcons name="flash" size={20} color="#FFF" />
                                <Text style={styles.predictButtonText}> Analyze Latex Storage</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {prediction && (
                        <Animated.View style={[styles.predictionContainer, { opacity: fadeAnim }]}>
                            <View style={styles.predictionHeader}>
                                <MaterialCommunityIcons
                                    name={(prediction.icon || 'check-circle') as any}
                                    size={32}
                                    color={colors.primary}
                                />
                                <Text style={styles.predictionTitle}>Storage Analysis</Text>
                            </View>

                            <View style={styles.predictionCard}>
                                <View style={styles.resultBadge}>
                                    <Text style={styles.resultBadgeText}>{prediction.type}</Text>
                                </View>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Confidence</Text>
                                        <Text style={[
                                            styles.statValue,
                                            { color: getConfidenceColor(prediction.confidence) }
                                        ]}>
                                            {prediction.confidence}
                                        </Text>
                                    </View>

                                    <View style={styles.statDivider} />

                                    <View style={styles.statItem}>
                                        <Text style={styles.statLabel}>Conditions</Text>
                                        <Text style={styles.statValue}>
                                            {prediction.humidity}% / {prediction.temperature}°C
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailsSection}>
                                    <Text style={styles.detailsTitle}>Latex Storage Details</Text>
                                    <Text style={styles.detailsText}>{prediction.details.suitability}</Text>

                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                                            <View style={styles.detailTextContainer}>
                                                <Text style={styles.detailLabel}>Storage Duration</Text>
                                                <Text style={styles.detailValue}>{prediction.details.duration}</Text>
                                            </View>
                                        </View>

                                        {prediction.details.ammoniaLevel && (
                                            <View style={styles.detailItem}>
                                                <MaterialCommunityIcons name="flask" size={20} color={colors.primary} />
                                                <View style={styles.detailTextContainer}>
                                                    <Text style={styles.detailLabel}>Ammonia Level</Text>
                                                    <Text style={styles.detailValue}>{prediction.details.ammoniaLevel}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {prediction.details.coagulation && (
                                            <View style={styles.detailItem}>
                                                <MaterialCommunityIcons name="test-tube" size={20} color={colors.primary} />
                                                <View style={styles.detailTextContainer}>
                                                    <Text style={styles.detailLabel}>Coagulation Risk</Text>
                                                    <Text style={styles.detailValue}>{prediction.details.coagulation}</Text>
                                                </View>
                                            </View>
                                        )}

                                        <View style={styles.detailItem}>
                                            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.primary} />
                                            <View style={styles.detailTextContainer}>
                                                <Text style={styles.detailLabel}>Storage Tips</Text>
                                                <Text style={styles.detailValue}>{prediction.details.tips}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.recommendationContainer}>
                                    <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
                                    <Text style={styles.recommendationText}>
                                        {prediction.recommendation}
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        height: 100,
        backgroundColor: colors.primary,
        paddingTop: 40,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    clearButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: 0.5,
        textAlign: 'center',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    iconBackground: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    inputIconContainer: {
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 16,
    },
    predictButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        marginTop: 8,
        width: '100%',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    predictButtonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    predictButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    predictionContainer: {
        marginTop: 32,
        width: '100%',
    },
    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    predictionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
    },
    predictionCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    resultBadge: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    resultBadgeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingVertical: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
    },
    detailsSection: {
        marginBottom: 16,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    detailsText: {
        fontSize: 15,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 22,
    },
    detailsGrid: {
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 15,
        color: '#1F2937',
        lineHeight: 20,
    },
    recommendationContainer: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        marginTop: 8,
    },
    recommendationText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
});