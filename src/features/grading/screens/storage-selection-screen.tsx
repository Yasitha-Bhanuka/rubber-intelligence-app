import React, { useState, useEffect, useRef } from 'react';
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
    airTemperature: number;
    recommendedLocations?: StorageLocation[];
}

interface LiveSensorData {
    humidity: number;
    airTemperature: number;
}

export default function StorageSelectionScreen() {
    const navigation = useNavigation();
    const [humidity, setHumidity] = useState('');
    const [airTemperature, setAirTemperature] = useState('');
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [storageType, setStorageType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Live data states
    const [liveData, setLiveData] = useState<LiveSensorData | null>(null);
    const [liveDataLoading, setLiveDataLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");
    const failCount = useRef(0);

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
                humidity: Number(data.hum ?? 0),
                airTemperature: Number(data.airtemp ?? 0),
            };

            failCount.current = 0;
            setLiveData(newData);
            setConnectionError(false);
            setLastUpdated(new Date().toLocaleTimeString());

            // Auto-fill inputs from live data
            setHumidity(newData.humidity.toString());
            setAirTemperature(newData.airTemperature.toString());

        } catch (err: any) {
            if (err.name === "AbortError") {
                console.warn("Fetch timed out. ESP32 might be slow or offline.");
            } else {
                console.error("Error fetching sensor data:", err);
            }
            failCount.current += 1;
            if (failCount.current >= 3) {
                setConnectionError(true);
            }
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
        if (!humidity.trim() || !airTemperature.trim()) {
            Alert.alert('Missing Information', 'Please enter humidity and air temperature values');
            return false;
        }

        const hum = parseFloat(humidity);
        const airTemp = parseFloat(airTemperature);

        if (isNaN(hum) || isNaN(airTemp)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers');
            return false;
        }

        if (hum < 0 || hum > 100) {
            Alert.alert('Invalid Humidity', 'Humidity must be between 0% and 100%');
            return false;
        }

        if (airTemp < -10 || airTemp > 50) {
            Alert.alert('Invalid Air Temperature', 'Air temperature must be between -10°C and 50°C');
            return false;
        }

        return true;
    };

    const getRecommendedLocations = (hum: number, airTemp: number): StorageLocation[] => {
        const locations: StorageLocation[] = [];

        // ==================== COLD STORAGE CONDITIONS (Below 15°C Air Temperature) ====================

        // Freezer Storage (Below 0°C Air Temperature) - Emergency Only
        if (airTemp < 0) {
            locations.push({
                name: 'Emergency Freezer Storage',
                type: 'Critical Storage',
                description: 'Below freezing air temperature - NOT recommended for standard latex',
                recommended: false,
                advantages: [
                    'Can preserve latex temporarily',
                    'Prevents bacterial growth',
                    'Emergency backup option'
                ],
                注意事项: 'Risk of freezing damage; ensure latex is properly preserved; test viscosity before use'
            });
        }

        // Cold Room Storage (0-5°C Air Temperature)
        if (airTemp >= 0 && airTemp < 5) {
            locations.push({
                name: 'Industrial Cold Room',
                type: 'Cold Storage',
                description: 'Refrigerated facility for short-term preservation',
                recommended: false,
                advantages: [
                    'Slows bacterial activity',
                    'Reduces ammonia evaporation',
                    'Good for concentrated latex'
                ],
                注意事项: 'Monitor for cold-induced thickening; warm before processing'
            });
        }

        // Chilled Storage (5-10°C Air Temperature)
        if (airTemp >= 5 && airTemp < 10) {
            locations.push({
                name: 'Chilled Latex Warehouse',
                type: 'Cold Storage',
                description: 'Temperature-controlled environment for extended preservation',
                recommended: airTemp >= 7 && airTemp <= 9,
                advantages: [
                    'Extended storage up to 8 months',
                    'Minimal coagulation risk',
                    'Energy efficient cooling'
                ],
                注意事项: 'Maintain consistent temperature; avoid temperature fluctuations'
            });
        }

        // Cool Cellar (10-15°C Air Temperature)
        if (airTemp >= 10 && airTemp < 15) {
            locations.push({
                name: 'Traditional Latex Cellar',
                type: 'Cool Storage',
                description: 'Underground or basement storage with natural cooling',
                recommended: airTemp >= 12 && airTemp <= 14,
                advantages: [
                    'Natural temperature stability',
                    'Low energy costs',
                    'Traditional preservation method',
                    'Good for field latex'
                ],
                注意事项: 'Ensure proper ventilation; monitor humidity levels'
            });
        }

        // ==================== MODERATE STORAGE CONDITIONS (15-25°C Air Temperature) ====================

        // Optimal Climate-Controlled (15-20°C Air Temperature)
        if (airTemp >= 15 && airTemp < 20) {
            locations.push({
                name: 'Premium Climate-Controlled Warehouse',
                type: 'Optimal Storage',
                description: 'State-of-the-art facility with precise environmental control',
                recommended: true,
                advantages: [
                    'Ideal for long-term storage',
                    'Automated monitoring systems',
                    'Backup power supply',
                    'Ammonia level automation'
                ],
                注意事项: 'Regular calibration of sensors required'
            });
        }

        // Standard Indoor Storage (20-25°C Air Temperature)
        if (airTemp >= 20 && airTemp <= 25) {
            locations.push({
                name: 'Standard Processing Facility Storage',
                type: 'Indoor Storage',
                description: 'Covered area within latex processing plant',
                recommended: airTemp >= 21 && airTemp <= 24,
                advantages: [
                    'Convenient for processing',
                    'Basic climate control',
                    'Security systems',
                    'Easy material handling'
                ],
                注意事项: 'Monitor afternoon temperature spikes'
            });
        }

        // High-End Premium Storage (18-22°C Air Temperature) - Best Conditions
        if (airTemp >= 18 && airTemp <= 22 && hum >= 60 && hum <= 70) {
            locations.push({
                name: 'Premium Latex Storage Vault',
                type: 'Elite Storage',
                description: 'Specialized facility with double-walled insulation and backup systems',
                recommended: true,
                advantages: [
                    'Precision temperature control (±0.5°C)',
                    'Humidity stabilization systems',
                    'Nitrogen blanketing option',
                    '24/7 monitoring with alerts',
                    'Earthquake-resistant construction'
                ],
                注意事项: 'Highest cost but best preservation; ideal for premium latex grades'
            });
        }

        // ==================== WARM STORAGE CONDITIONS (25-30°C Air Temperature) ====================

        // Tropical Storage (25-28°C Air Temperature)
        if (airTemp >= 25 && airTemp < 28) {
            locations.push({
                name: 'Tropical Climate Warehouse',
                type: 'Warm Storage',
                description: 'Designed for hot and humid tropical conditions',
                recommended: airTemp <= 27 && hum <= 75,
                advantages: [
                    'High-volume ventilation',
                    'Solar-reflective roofing',
                    'Shaded loading areas',
                    'Natural air circulation'
                ],
                注意事项: 'Increase preservation chemicals; avoid afternoon loading'
            });
        }

        // Ventilated Shed (28-30°C Air Temperature)
        if (airTemp >= 28 && airTemp <= 30) {
            locations.push({
                name: 'High-Ceiling Ventilated Shed',
                type: 'Warm Storage',
                description: 'Open structure with forced ventilation',
                recommended: false,
                advantages: [
                    'Good air circulation',
                    'Cost-effective construction',
                    'Quick access for short-term storage'
                ],
                注意事项: 'Limit storage to 1 month; use maximum ammonia levels'
            });
        }

        // ==================== HIGH TEMPERATURE CONDITIONS (Above 30°C Air Temperature) ====================

        // Hot Climate Storage (30-35°C Air Temperature)
        if (airTemp > 30 && airTemp <= 35) {
            locations.push({
                name: 'Hot Climate Storage Zone',
                type: 'High-Temperature Storage',
                description: 'Designated area with cooling fans and reflective barriers',
                recommended: false,
                advantages: [
                    'Emergency storage capability',
                    'Cooling fan systems',
                    'Heat-reflective coatings',
                    'Quick material turnover'
                ],
                注意事项: 'Absolute maximum 2 weeks storage; daily quality checks required'
            });
        }

        // Extreme Heat Storage (>35°C Air Temperature)
        if (airTemp > 35) {
            locations.push({
                name: 'Extreme Temperature Alert Zone',
                type: 'Emergency Only',
                description: 'CRITICAL: Unsafe for latex storage without immediate action',
                recommended: false,
                advantages: [
                    'Temporary holding only',
                    'Emergency cooling available',
                    'Immediate processing required'
                ],
                注意事项: 'DO NOT STORE LATEX HERE - Process immediately or use portable cooling'
            });
        }

        // ==================== HUMIDITY-SPECIFIC LOCATIONS ====================

        // Very Dry Conditions (Below 40%)
        if (hum < 40) {
            locations.push({
                name: 'Humidity-Controlled Dry Chamber',
                type: 'Specialized Storage',
                description: 'Sealed environment with humidification system',
                recommended: false,
                advantages: [
                    'Prevents surface skinning',
                    'Controlled moisture addition',
                    'Protects container seals'
                ],
                注意事项: 'Use humidifiers; consider sealed intermediate bulk containers (IBCs)'
            });
        }

        // Low Humidity (40-50%)
        if (hum >= 40 && hum < 50) {
            locations.push({
                name: 'Semi-Arid Storage Area',
                type: 'Low Humidity Storage',
                description: 'Covered storage with moisture retention systems',
                recommended: false,
                advantages: [
                    'Reduced bacterial growth',
                    'Lower ammonia loss',
                    'Good for short-term storage'
                ],
                注意事项: 'Monitor for surface evaporation; use floating lids if possible'
            });
        }

        // Moderate Humidity (50-60%)
        if (hum >= 50 && hum < 60) {
            locations.push({
                name: 'Standard Humidity Warehouse',
                type: 'General Storage',
                description: 'Typical storage conditions with basic humidity control',
                recommended: hum >= 55,
                advantages: [
                    'Balanced conditions',
                    'Suitable for most latex grades',
                    'Standard preservation effective'
                ],
                注意事项: 'Regular monitoring sufficient; standard ammonia levels'
            });
        }

        // Optimal Humidity (60-70%)
        if (hum >= 60 && hum <= 70) {
            locations.push({
                name: 'Optimal Humidity Storage Chamber',
                type: 'Premium Humidity Control',
                description: 'Ideal humidity range for long-term latex preservation',
                recommended: true,
                advantages: [
                    'Perfect for natural rubber latex',
                    'Minimal evaporation',
                    'Optimal bacterial control',
                    'Best preservation results'
                ],
                注意事项: 'Maintain this range for premium quality retention'
            });
        }

        // High Humidity (70-80%)
        if (hum > 70 && hum <= 80) {
            locations.push({
                name: 'High Humidity Storage Zone',
                type: 'Moisture-Controlled Storage',
                description: 'Area with enhanced antifungal measures',
                recommended: hum <= 75 && airTemp <= 25,
                advantages: [
                    'Good for concentrated latex',
                    'Reduces surface drying',
                    'Compatible with cold storage'
                ],
                注意事项: 'Increase antifungal agents; monitor for mold growth'
            });
        }

        // Very High Humidity (80-90%)
        if (hum > 80 && hum <= 90) {
            locations.push({
                name: 'High-Moisture Storage Facility',
                type: 'Special Handling Required',
                description: 'Controlled area with dehumidification backup',
                recommended: false,
                advantages: [
                    'Emergency storage capability',
                    'Dehumidifier equipped',
                    'Antifungal treatment ready'
                ],
                注意事项: 'Critical: Must use fungicides; limit storage to 2 weeks'
            });
        }

        // Extreme Humidity (>90%)
        if (hum > 90) {
            locations.push({
                name: 'Extreme Humidity Containment Zone',
                type: 'Crisis Management',
                description: 'ALERT: Extreme moisture risk - immediate action required',
                recommended: false,
                advantages: [
                    'Emergency containment only',
                    'Rapid response protocols',
                    'Immediate transfer capability'
                ],
                注意事项: 'DO NOT STORE - Risk of rapid bacterial growth and putrefaction'
            });
        }

        // ==================== COMBINATION CONDITIONS ====================

        // Perfect Storm Conditions (Optimal Air Temp + Optimal Humidity)
        if (airTemp >= 18 && airTemp <= 22 && hum >= 60 && hum <= 70) {
            locations.push({
                name: 'Perfect Storage Conditions Chamber',
                type: 'Reference Standard Storage',
                description: 'Theoretical ideal conditions for latex preservation',
                recommended: true,
                advantages: [
                    'Maximum storage life (12+ months)',
                    'Zero coagulation risk',
                    'Minimal preservation needed',
                    'Best quality retention'
                ],
                注意事项: 'These conditions represent the global standard for premium latex storage'
            });
        }

        // Hot and Humid (Tropical Storm Conditions)
        if (airTemp > 28 && hum > 80) {
            locations.push({
                name: 'Tropical Storm Storage Protocol Area',
                type: 'Emergency Response Storage',
                description: 'Critical conditions requiring immediate intervention',
                recommended: false,
                advantages: [
                    'Rapid cooling capability',
                    'Emergency chemical dosing',
                    'Quick transfer systems'
                ],
                注意事项: 'HIGHEST ALERT: Immediate action required - risk of complete coagulation'
            });
        }

        // Cool and Dry
        if (airTemp < 15 && hum < 50) {
            locations.push({
                name: 'Cool & Dry Storage Cellar',
                type: 'Extended Preservation Storage',
                description: 'Combination of cool temperature and low humidity',
                recommended: airTemp >= 10 && hum >= 40,
                advantages: [
                    'Extended preservation possible',
                    'Reduced chemical usage',
                    'Good for ammoniated latex'
                ],
                注意事项: 'Check for cold thickening; gradual warming before use'
            });
        }

        // Warm and Dry
        if (airTemp > 25 && airTemp <= 30 && hum < 50) {
            locations.push({
                name: 'Arid Warm Storage Facility',
                type: 'Desert Climate Storage',
                description: 'Specialized for hot, dry conditions',
                recommended: false,
                advantages: [
                    'Low bacterial risk',
                    'Good for short-term',
                    'Low corrosion risk'
                ],
                注意事项: 'Risk of surface skinning; use sealed containers'
            });
        }

        // ==================== SPECIALIZED STORAGE TYPES ====================

        // Mobile/Transport Storage
        if (airTemp >= 15 && airTemp <= 30) {
            locations.push({
                name: 'Mobile Storage Tank Farm',
                type: 'Transport/Transfer Storage',
                description: 'Modular tanks for temporary or transport storage',
                recommended: airTemp <= 25 && hum <= 75,
                advantages: [
                    'Flexible deployment',
                    'Ideal for harvest collection',
                    'Quick setup capability',
                    'Scalable capacity'
                ],
                注意事项: 'Ensure proper insulation; monitor during transport'
            });
        }

        // Underground Cave Storage (Constant Conditions)
        if (airTemp >= 16 && airTemp <= 20 && hum >= 65 && hum <= 75) {
            locations.push({
                name: 'Natural Cave Storage System',
                type: 'Geological Storage',
                description: 'Utilizing natural underground formations',
                recommended: true,
                advantages: [
                    'Naturally stable temperature',
                    'Minimal energy costs',
                    'Protected from external events',
                    'Large capacity possible'
                ],
                注意事项: 'Assess geological stability; ensure proper access and ventilation'
            });
        }

        // High-Altitude Storage
        if (airTemp <= 20 && hum <= 65) {
            locations.push({
                name: 'High-Altitude Storage Facility',
                type: 'Mountain Climate Storage',
                description: 'Located at elevation for natural cooling',
                recommended: airTemp >= 12 && airTemp <= 18,
                advantages: [
                    'Natural cool temperatures',
                    'Lower humidity typically',
                    'Energy efficient',
                    'Good air quality'
                ],
                注意事项: 'Consider transportation costs; monitor for temperature fluctuations'
            });
        }

        // Remove duplicates based on location name
        const uniqueLocations = locations.filter((location, index, self) =>
            index === self.findIndex((l) => l.name === location.name)
        );

        // Sort by recommended status first, then by name
        return uniqueLocations.sort((a, b) => {
            if (a.recommended && !b.recommended) return -1;
            if (!a.recommended && b.recommended) return 1;
            return a.name.localeCompare(b.name);
        });
    };

    const predictStorage = () => {
        if (!validateInputs()) return;

        setIsLoading(true);

        // Simulate loading for better UX
        setTimeout(() => {
            const hum = parseFloat(humidity);
            const airTemp = parseFloat(airTemperature);

            // Get recommended locations based on conditions
            const recommendedLocations = getRecommendedLocations(hum, airTemp);

            // Rubber Latex specific storage conditions based on air temperature and humidity
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

            // Optimal conditions for rubber latex storage based on air temperature
            if (airTemp >= 15 && airTemp <= 25 && hum >= 60 && hum <= 75) {
                type = 'Optimal Latex Storage';
                confidence = 'High';
                icon = 'check-circle';
                recommendation = 'Ideal air temperature and humidity for preserving natural rubber latex';
                details = {
                    suitability: 'Natural Rubber Latex - Field Grade, Concentrated Latex',
                    duration: '3-6 months with proper preservation',
                    tips: `Maintain ammonia levels at 0.6-0.7% for preservation. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
                    ammoniaLevel: '0.6% - 0.7% recommended',
                    coagulation: 'Low risk of coagulation',
                    locations: recommendedLocations
                };
            } else if (airTemp >= 10 && airTemp < 15 && hum >= 65 && hum <= 80) {
                type = 'Cool Air Storage';
                confidence = 'High';
                icon = 'thermometer-chevron-down';
                recommendation = 'Cool air conditions suitable for short-term latex storage';
                details = {
                    suitability: 'Preserved Latex Concentrate, Field Latex',
                    duration: '2-4 months',
                    tips: `Monitor viscosity regularly; consider gentle warming before use. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
                    ammoniaLevel: '0.7% - 0.8% recommended',
                    coagulation: 'Minimal coagulation risk',
                    locations: recommendedLocations
                };
            } else if (airTemp >= 25 && airTemp <= 30 && hum >= 55 && hum <= 70) {
                type = 'Warm Air Storage';
                confidence = 'Medium';
                icon = 'weather-sunny';
                recommendation = 'Higher air temperatures require additional preservation measures';
                details = {
                    suitability: 'Stabilized Latex with enhanced preservation',
                    duration: '1-2 months',
                    tips: `Increase ammonia to 0.8%; store in shaded area; avoid direct sunlight. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
                    ammoniaLevel: '0.8% - 0.9% recommended',
                    coagulation: 'Moderate coagulation risk',
                    locations: recommendedLocations
                };
            } else if (airTemp >= 2 && airTemp < 10 && hum >= 70 && hum <= 85) {
                type = 'Cold Air Storage';
                confidence = 'Medium';
                icon = 'snowflake';
                recommendation = 'Cold air suitable for extended preservation';
                details = {
                    suitability: 'Long-term latex concentrate storage',
                    duration: '6-8 months',
                    tips: `Prevent freezing; warm gradually before use; check for pre-coagulation. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
                    ammoniaLevel: '0.5% - 0.6% sufficient',
                    coagulation: 'Low risk but check for thickening',
                    locations: recommendedLocations
                };
            } else if (airTemp > 30 && airTemp <= 35 && hum >= 40 && hum <= 60) {
                type = 'High Air Temperature Storage';
                confidence = 'Low';
                icon = 'alert';
                recommendation = 'Elevated air temperatures accelerate latex degradation';
                details = {
                    suitability: 'Emergency/Short-term only',
                    duration: '< 2 weeks',
                    tips: `Use maximum preservation (1.0% ammonia); frequent quality checks; consider cooling. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
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
                        ? `Risk of surface skinning; increase humidity or use sealed containers. Air temperature: ${airTemp}°C, Humidity: ${hum}%`
                        : `Risk of bacterial growth; increase ammonia and antifungal agents. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
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
                    tips: `Consider immediate processing or enhanced preservation. Air temperature: ${airTemp}°C, Humidity: ${hum}%`,
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
        if (type.includes('Cold')) return 'snowflake';
        if (type.includes('High Air Temperature')) return 'thermometer-alert';
        if (type.includes('Humidity')) return 'water-alert';
        if (type.includes('Non-Standard')) return 'alert-circle';
        return 'barrel';
    };

    const clearInputs = () => {
        setHumidity('');
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
        if (locationName.includes('Freezer')) return 'snowflake';
        if (locationName.includes('Cold Room')) return 'fridge-industrial';
        if (locationName.includes('Cellar')) return 'stairs';
        if (locationName.includes('Ventilated')) return 'fan';
        if (locationName.includes('Mobile')) return 'truck';
        if (locationName.includes('Cave')) return 'excavator';
        if (locationName.includes('Altitude')) return 'mountain';
        if (locationName.includes('Perfect')) return 'star';
        if (locationName.includes('Tropical Storm')) return 'weather-hurricane';
        if (locationName.includes('Arid')) return 'sun-wireless';
        if (locationName.includes('Premium')) return 'crown';
        return 'warehouse';
    };

    const useLiveData = () => {
        if (liveData) {
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
                    {/* Live Data Display - Humidity and Air Temperature */}
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

                            <TouchableOpacity style={styles.useLiveButton} onPress={useLiveData}>
                                <MaterialCommunityIcons name="refresh" size={18} color="#FFF" />
                                <Text style={styles.useLiveButtonText}>Use Live Data</Text>
                            </TouchableOpacity>
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
                    <Text style={styles.sectionSubtitle}>Enter humidity and air temperature for rubber latex storage analysis</Text>

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
                                            {prediction.humidity}% / {prediction.airTemperature}°C
                                        </Text>
                                    </View>
                                </View>

                                {prediction.airTemperature && (
                                    <View style={styles.airTempContainer}>
                                        <MaterialCommunityIcons name="weather-sunny" size={18} color={colors.primary} />
                                        <Text style={styles.airTempText}>
                                            Air Temperature: {prediction.airTemperature}°C | Humidity: {prediction.humidity}%
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
        flex: 1,
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