import React, { useState, useEffect } from 'react';
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

const ESP32_IP = "http://10.148.43.34"; // Replace with your ESP32 IP

interface StorageDetails {
    suitability: string;
    duration: string;
    tips: string;
    ammoniaLevel?: string;
    coagulation?: string;
    locations?: StorageLocation[];
}

interface StorageLocation {
    name: string;
    type: string;
    description: string;
    recommended: boolean;
    注意事项?: string;
    advantages?: string[];
}

interface Prediction {
    type: string;
    confidence: string;
    recommendation: string;
    icon: string;
    details: StorageDetails;
    humidity: number;
    temperature: number;
    airTemperature?: number;
    recommendedLocations?: StorageLocation[];
}

interface LiveSensorData {
    temperature: number;
    humidity: number;
    airTemperature: number;
}

export default function StorageSelectionScreen() {
    const navigation = useNavigation();
    const [humidity, setHumidity] = useState('');
    const [temperature, setTemperature] = useState('');
    const [airTemperature, setAirTemperature] = useState('');
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [storageType, setStorageType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Live data states
    const [liveData, setLiveData] = useState<LiveSensorData | null>(null);
    const [liveDataLoading, setLiveDataLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    // Animation value for fade-in effect
    const fadeAnim = useState(new Animated.Value(0))[0];

    // Fetch live data from ESP32
    const fetchLiveData = async () => {
        try {
            setLiveDataLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(`${ESP32_IP}/data`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const newData = {
                temperature: Number(data.temp ?? 0),
                humidity: Number(data.hum ?? 0),
                airTemperature: Number(data.airtemp ?? 0),
            };

            setLiveData(newData);
            setConnectionError(false);
            setLastUpdated(new Date().toLocaleTimeString());

            // Auto-fill inputs from live data
            setHumidity(newData.humidity.toString());
            setTemperature(newData.temperature.toString());
            setAirTemperature(newData.airTemperature.toString());

        } catch (err: any) {
            if (err.name === "AbortError") {
                console.warn("Fetch timed out. ESP32 might be slow or offline.");
            } else {
                console.error("Error fetching sensor data:", err);
            }
            setConnectionError(true);
        } finally {
            setLiveDataLoading(false);
        }
    };

    // Initial fetch and interval setup
    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 5000); // update every 5s
        return () => clearInterval(interval);
    }, []);

    // Animation effect for predictions
    useEffect(() => {
        if (prediction) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }
    }, [prediction]);

    const validateInputs = () => {
        if (!humidity.trim() || !temperature.trim() || !airTemperature.trim()) {
            Alert.alert('Missing Information', 'Please enter humidity, temperature, and air temperature values');
            return false;
        }

        const hum = parseFloat(humidity);
        const temp = parseFloat(temperature);
        const airTemp = parseFloat(airTemperature);

        if (isNaN(hum) || isNaN(temp) || isNaN(airTemp)) {
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

        if (airTemp < -10 || airTemp > 50) {
            Alert.alert('Invalid Air Temperature', 'Air temperature must be between -10°C and 50°C');
            return false;
        }

        return true;
    };

    const getRecommendedLocations = (hum: number, temp: number): StorageLocation[] => {
        const locations: StorageLocation[] = [];

        // Temperature-Controlled Storage Facilities
        if (temp >= 15 && temp <= 25 && hum >= 60 && hum <= 75) {
            locations.push({
                name: 'Climate-Controlled Latex Warehouse',
                type: 'Premium Storage',
                description: 'Specialized facility with precise temperature and humidity control',
                recommended: true,
                advantages: [
                    'Automated temperature regulation (±1°C)',
                    'Humidity control systems',
                    'Ammonia monitoring equipment',
                    'Emergency backup systems'
                ],
                注意事项: 'Regular maintenance of HVAC systems required'
            });
        }

        // Underground Storage
        if (temp >= 18 && temp <= 22 && hum >= 65 && hum <= 70) {
            locations.push({
                name: 'Underground Latex Cellar',
                type: 'Natural Climate Storage',
                description: 'Below-ground storage with natural temperature stability',
                recommended: temp >= 18 && temp <= 22,
                advantages: [
                    'Natural temperature insulation',
                    'Minimal temperature fluctuation',
                    'Energy efficient',
                    'Protection from external elements'
                ],
                注意事项: 'Ensure proper ventilation and moisture control'
            });
        }

        // Indoor Storage Areas
        if (temp >= 20 && temp <= 28 && hum >= 50 && hum <= 70) {
            locations.push({
                name: 'Indoor Processing Facility Storage',
                type: 'Standard Indoor Storage',
                description: 'Covered storage area within processing facility',
                recommended: temp >= 20 && temp <= 25,
                advantages: [
                    'Easy access for processing',
                    'Basic climate control',
                    'Security monitoring',
                    'Quick material transfer'
                ],
                注意事项: 'Monitor for temperature spikes during peak hours'
            });
        }

        // Cold Storage
        if (temp >= 2 && temp <= 10 && hum >= 70 && hum <= 85) {
            locations.push({
                name: 'Refrigerated Latex Storage Unit',
                type: 'Cold Storage',
                description: 'Temperature-controlled cold room for extended preservation',
                recommended: temp >= 4 && temp <= 8,
                advantages: [
                    'Extended storage duration',
                    'Reduced bacterial growth',
                    'Minimal coagulation risk',
                    'Ideal for concentrated latex'
                ],
                注意事项: 'Prevent freezing; allow gradual warming before use'
            });
        }

        // Tropical Climate Storage
        if (temp >= 25 && temp <= 32 && hum >= 60 && hum <= 80) {
            locations.push({
                name: 'Tropical Climate Storage Shed',
                type: 'Ventilated Storage',
                description: 'Well-ventilated structure designed for warm climates',
                recommended: temp <= 30 && hum <= 75,
                advantages: [
                    'Natural ventilation',
                    'Shaded from direct sunlight',
                    'Cost-effective for tropical regions',
                    'Adapted to local conditions'
                ],
                注意事项: 'Increase ammonia levels; avoid afternoon heat'
            });
        }

        // High-Temperature Storage
        if (temp > 30 && temp <= 35) {
            locations.push({
                name: 'High-Temperature Storage Zone',
                type: 'Emergency/Short-term Storage',
                description: 'Designated area with enhanced cooling measures',
                recommended: false,
                advantages: [
                    'Quick access for emergency storage',
                    'Equipped with cooling fans',
                    'Regular monitoring protocols'
                ],
                注意事项: 'Limit storage to maximum 2 weeks; use maximum preservation'
            });
        }

        // Humidity-Controlled Areas
        if (hum < 40 || hum > 90) {
            locations.push({
                name: 'Humidity-Contained Storage Chamber',
                type: 'Specialized Storage',
                description: 'Sealed environment with humidity control',
                recommended: false,
                advantages: [
                    'Prevents extreme humidity effects',
                    'Protected from external moisture',
                    'Ideal for sensitive latex grades'
                ],
                注意事项: hum < 40 ? 'Use humidifiers to prevent skinning' : 'Install dehumidifiers and antifungal systems'
            });
        }

        // Open Storage Areas (with protection)
        if (temp >= 22 && temp <= 28 && hum >= 55 && hum <= 75) {
            locations.push({
                name: 'Covered Open-Air Storage',
                type: 'Basic Protection Storage',
                description: 'Roofed area with open sides for ventilation',
                recommended: false,
                advantages: [
                    'Low infrastructure cost',
                    'Good natural ventilation',
                    'Easy access for large containers'
                ],
                注意事项: 'Ensure roof protection from rain; monitor for pest infiltration'
            });
        }

        return locations;
    };

    const predictStorage = () => {
        if (!validateInputs()) return;

        setIsLoading(true);

        // Simulate loading for better UX
        setTimeout(() => {
            const hum = parseFloat(humidity);
            const temp = parseFloat(temperature);
            const airTemp = parseFloat(airTemperature);

            // Get recommended locations based on conditions
            const recommendedLocations = getRecommendedLocations(hum, temp);

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
                coagulation: '',
                locations: recommendedLocations
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
                    tips: `Maintain ammonia levels at 0.6-0.7% for preservation. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: '0.6% - 0.7% recommended',
                    coagulation: 'Low risk of coagulation',
                    locations: recommendedLocations
                };
            } else if (temp >= 10 && temp < 15 && hum >= 65 && hum <= 80) {
                type = 'Cool Latex Storage';
                confidence = 'High';
                icon = 'thermometer-chevron-down';
                recommendation = 'Cool conditions suitable for short-term latex storage';
                details = {
                    suitability: 'Preserved Latex Concentrate, Field Latex',
                    duration: '2-4 months',
                    tips: `Monitor viscosity regularly; consider gentle warming before use. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: '0.7% - 0.8% recommended',
                    coagulation: 'Minimal coagulation risk',
                    locations: recommendedLocations
                };
            } else if (temp >= 25 && temp <= 30 && hum >= 55 && hum <= 70) {
                type = 'Warm Climate Storage';
                confidence = 'Medium';
                icon = 'weather-sunny';
                recommendation = 'Higher temperatures require additional preservation measures';
                details = {
                    suitability: 'Stabilized Latex with enhanced preservation',
                    duration: '1-2 months',
                    tips: `Increase ammonia to 0.8%; store in shaded area; avoid direct sunlight. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: '0.8% - 0.9% recommended',
                    coagulation: 'Moderate coagulation risk',
                    locations: recommendedLocations
                };
            } else if (temp >= 2 && temp < 10 && hum >= 70 && hum <= 85) {
                type = 'Chilled Latex Storage';
                confidence = 'Medium';
                icon = 'snowflake';
                recommendation = 'Cold storage suitable for extended preservation';
                details = {
                    suitability: 'Long-term latex concentrate storage',
                    duration: '6-8 months',
                    tips: `Prevent freezing; warm gradually before use; check for pre-coagulation. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: '0.5% - 0.6% sufficient',
                    coagulation: 'Low risk but check for thickening',
                    locations: recommendedLocations
                };
            } else if (temp > 30 && temp <= 35 && hum >= 40 && hum <= 60) {
                type = 'High Temperature Storage';
                confidence = 'Low';
                icon = 'alert';
                recommendation = 'Elevated temperatures accelerate latex degradation';
                details = {
                    suitability: 'Emergency/Short-term only',
                    duration: '< 2 weeks',
                    tips: `Use maximum preservation (1.0% ammonia); frequent quality checks; consider cooling. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: '0.9% - 1.0% required',
                    coagulation: 'High coagulation risk',
                    locations: recommendedLocations
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
                        ? `Risk of surface skinning; increase humidity or use sealed containers. Air temperature: ${airTemp}°C`
                        : `Risk of bacterial growth; increase ammonia and antifungal agents. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: hum < 40 ? '0.6% minimum' : '0.8% - 1.0% recommended',
                    coagulation: hum < 40 ? 'Surface coagulation risk' : 'Bacterial coagulation risk',
                    locations: recommendedLocations
                };
            } else {
                type = 'Non-Standard Conditions';
                confidence = 'Low';
                icon = 'alert-circle';
                recommendation = 'Conditions outside optimal range for latex storage';
                details = {
                    suitability: 'Consult latex technical specialist',
                    duration: 'Not recommended for long-term',
                    tips: `Consider immediate processing or enhanced preservation. Air temperature: ${airTemp}°C`,
                    ammoniaLevel: 'Consult preservation guidelines',
                    coagulation: 'High risk - monitor closely',
                    locations: recommendedLocations
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
                temperature: temp,
                airTemperature: airTemp,
                recommendedLocations
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
        setAirTemperature('');
        setPrediction(null);
        setStorageType(null);
    };

    const getLocationIcon = (locationName: string): string => {
        if (locationName.includes('Climate-Controlled')) return 'air-conditioner';
        if (locationName.includes('Underground')) return 'mine';
        if (locationName.includes('Indoor')) return 'factory';
        if (locationName.includes('Refrigerated')) return 'fridge-industrial';
        if (locationName.includes('Tropical')) return 'palm-tree';
        if (locationName.includes('High-Temperature')) return 'thermometer-alert';
        if (locationName.includes('Humidity')) return 'water-circle';
        if (locationName.includes('Open-Air')) return 'tent';
        return 'warehouse';
    };

    const useLiveData = () => {
        if (liveData) {
            setTemperature(liveData.temperature.toString());
            setHumidity(liveData.humidity.toString());
            setAirTemperature(liveData.airTemperature.toString());
        } else {
            Alert.alert('No Live Data', 'Please wait for sensor data to load or check connection.');
        }
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
                    {/* Live Data Display - Temperature, Humidity, and Air Temperature */}
                    {liveData && !connectionError && (
                        <View style={styles.liveDataContainer}>
                            <View style={styles.liveDataHeader}>
                                <View style={styles.liveDataTitleContainer}>
                                    <MaterialCommunityIcons name="access-point" size={20} color="#10B981" />
                                    <Text style={styles.liveDataTitle}>Live Sensor Readings</Text>
                                </View>
                                {lastUpdated && (
                                    <Text style={styles.lastUpdated}>Updated: {lastUpdated}</Text>
                                )}
                            </View>

                            <View style={styles.liveDataGrid}>
                                {/* Latex Temperature Display */}
                                {/* <View style={styles.liveDataItem}>
                                    <MaterialCommunityIcons name="thermometer" size={24} color={colors.primary} />
                                    <Text style={styles.liveDataLabel}>Latex Temp</Text>
                                    <Text style={styles.liveDataValue}>{liveData.temperature.toFixed(1)}°C</Text>
                                </View> */}

                                {/* Humidity Display */}
                                <View style={styles.liveDataItem}>
                                    <MaterialCommunityIcons name="water-percent" size={24} color={colors.primary} />
                                    <Text style={styles.liveDataLabel}>Humidity</Text>
                                    <Text style={styles.liveDataValue}>{liveData.humidity.toFixed(0)}%</Text>
                                </View>

                                {/* Air Temperature Display */}
                                <View style={styles.liveDataItem}>
                                    <MaterialCommunityIcons name="weather-sunny" size={24} color={colors.primary} />
                                    <Text style={styles.liveDataLabel}>Air Temp</Text>
                                    <Text style={styles.liveDataValue}>{liveData.airTemperature.toFixed(1)}°C</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Connection Error Message */}
                    {connectionError && (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons name="wifi-off" size={24} color="#EF4444" />
                            <Text style={styles.errorText}>
                                Cannot connect to ESP32. Please enter values manually.
                            </Text>
                            <TouchableOpacity style={styles.retryButton} onPress={fetchLiveData}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
                    <Text style={styles.sectionSubtitle}>Enter humidity, temperature, and air temperature for rubber latex</Text>

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
                                editable={false}
                            />
                        </View>

                        {/* <View style={styles.inputContainer}>
                            <View style={styles.inputIconContainer}>
                                <MaterialCommunityIcons name="thermometer" size={24} color={colors.primary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Latex Temperature (°C)"
                                value={temperature}
                                onChangeText={setTemperature}
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                                maxLength={6}
                                editable={false}
                            />
                        </View> */}

                        {/* Air Temperature Input Field */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputIconContainer}>
                                <MaterialCommunityIcons name="weather-sunny" size={24} color={colors.primary} />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Air Temperature (°C)"
                                value={airTemperature}
                                onChangeText={setAirTemperature}
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                                maxLength={6}
                                editable={false}
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

                                {prediction.airTemperature && (
                                    <View style={styles.airTempContainer}>
                                        <MaterialCommunityIcons name="weather-sunny" size={18} color={colors.primary} />
                                        <Text style={styles.airTempText}>
                                            Air Temperature: {prediction.airTemperature}°C
                                        </Text>
                                    </View>
                                )}

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

                                {prediction.recommendedLocations && prediction.recommendedLocations.length > 0 && (
                                    <View style={styles.locationsSection}>
                                        <Text style={styles.locationsTitle}>
                                            <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                                            {' '}Recommended Storage Locations
                                        </Text>

                                        {prediction.recommendedLocations.map((location, index) => (
                                            <View key={index} style={[
                                                styles.locationCard,
                                                location.recommended && styles.recommendedLocationCard
                                            ]}>
                                                <View style={styles.locationHeader}>
                                                    <MaterialCommunityIcons
                                                        name={getLocationIcon(location.name) as any}
                                                        size={24}
                                                        color={location.recommended ? colors.primary : '#6B7280'}
                                                    />
                                                    <View style={styles.locationTitleContainer}>
                                                        <Text style={styles.locationName}>{location.name}</Text>
                                                        <View style={[
                                                            styles.locationTypeBadge,
                                                            location.recommended && styles.recommendedBadge
                                                        ]}>
                                                            <Text style={[
                                                                styles.locationTypeText,
                                                                location.recommended && styles.recommendedBadgeText
                                                            ]}>
                                                                {location.type}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {location.recommended && (
                                                        <MaterialCommunityIcons
                                                            name="star"
                                                            size={20}
                                                            color="#F59E0B"
                                                        />
                                                    )}
                                                </View>

                                                <Text style={styles.locationDescription}>
                                                    {location.description}
                                                </Text>

                                                {location.advantages && location.advantages.length > 0 && (
                                                    <View style={styles.advantagesContainer}>
                                                        <Text style={styles.advantagesTitle}>Advantages:</Text>
                                                        {location.advantages.map((advantage, idx) => (
                                                            <View key={idx} style={styles.advantageItem}>
                                                                <MaterialCommunityIcons
                                                                    name="check-circle"
                                                                    size={16}
                                                                    color="#10B981"
                                                                />
                                                                <Text style={styles.advantageText}>{advantage}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}

                                                {location.注意事项 && (
                                                    <View style={styles.noteContainer}>
                                                        <MaterialCommunityIcons
                                                            name="alert-circle"
                                                            size={16}
                                                            color="#F59E0B"
                                                        />
                                                        <Text style={styles.noteText}>
                                                            {location.注意事项}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}

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
    // Live Data Styles
    liveDataContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        width: '100%',
    },
    liveDataHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    liveDataTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveDataTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 8,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    liveDataGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 16,
    },
    liveDataItem: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    liveDataLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 6,
        marginBottom: 4,
    },
    liveDataValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    useLiveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    useLiveButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    errorContainer: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
        width: '100%',
    },
    errorText: {
        flex: 1,
        marginLeft: 12,
        color: '#991B1B',
        fontSize: 14,
        fontWeight: '500',
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#EF4444',
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
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
    airTempContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    airTempText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0369A1',
        marginLeft: 8,
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
    locationsSection: {
        marginTop: 16,
        marginBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    locationsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    locationCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    recommendedLocationCard: {
        backgroundColor: '#F0F9FF',
        borderColor: colors.primary,
        borderWidth: 2,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    locationTypeBadge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    recommendedBadge: {
        backgroundColor: colors.primary,
    },
    locationTypeText: {
        fontSize: 11,
        color: '#4B5563',
        fontWeight: '500',
    },
    recommendedBadgeText: {
        color: '#FFF',
    },
    locationDescription: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
        lineHeight: 20,
    },
    advantagesContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    advantagesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    advantageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    advantageText: {
        fontSize: 13,
        color: '#4B5563',
        marginLeft: 8,
        flex: 1,
    },
    noteContainer: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        alignItems: 'center',
    },
    noteText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#92400E',
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