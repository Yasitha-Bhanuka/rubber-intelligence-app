import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../shared/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { PriceForecastingService, PriceRequest } from '../services/priceForecastingService';

const Grades = ['RSS1', 'RSS2', 'RSS3', 'RSS4', 'RSS5'];
const VisualQualities = [
    { label: 'Excellent', value: 5 },
    { label: 'Good', value: 4 },
    { label: 'Average', value: 3 },
    { label: 'Fair', value: 2 },
    { label: 'Poor', value: 1 }
];
const MarketAvailability = ['Immediately', 'In 1 week', 'In 2 weeks'];
const Districts = ['Colombo', 'Galle', 'Matara', 'Kalutara', 'Ratnapura', 'Kegalle'];

export const PriceForecastingScreen = ({ navigation }: any) => {
    const [grade, setGrade] = useState(Grades[0]);
    const [quantity, setQuantity] = useState('');
    const [moisture, setMoisture] = useState('');
    const [dirt, setDirt] = useState('');
    const [visualQuality, setVisualQuality] = useState(VisualQualities[0]);
    const [availability, setAvailability] = useState(MarketAvailability[0]);
    const [district, setDistrict] = useState(Districts[0]);

    const [loading, setLoading] = useState(false);
    const [predictedPrice, setPredictedPrice] = useState<number | null>(null);

    const handlePredict = async () => {
        if (!quantity || !moisture || !dirt) {
            Alert.alert("Missing Input", "Please fill in all numeric fields (Quantity, Moisture, Dirt).");
            return;
        }

        setLoading(true);
        setPredictedPrice(null);

        const request: PriceRequest = {
            rubberSheetGrade: grade,
            quantityKg: parseFloat(quantity),
            moistureContentPct: parseFloat(moisture),
            dirtContentPct: parseFloat(dirt),
            visualQualityScore: visualQuality.value,
            district: district
        };

        try {
            const result = await PriceForecastingService.predictPrice(request);
            setPredictedPrice(result.predictedPriceLkr);
        } catch (error) {
            Alert.alert("Error", "Failed to predict price. ensure backend is running.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderButtonGroup = (label: string, items: any[], selectedValue: any, onSelect: (val: any) => void, isObject = false) => (
        <View style={styles.section}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.buttonGroup}>
                {items.map((item) => {
                    const val = isObject ? item : item;
                    const displayLabel = isObject ? item.label : item;
                    const isSelected = isObject ? selectedValue.value === item.value : selectedValue === item;

                    return (
                        <TouchableOpacity
                            key={displayLabel}
                            style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                            onPress={() => onSelect(val)}
                        >
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                {displayLabel}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10, marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={[styles.header, { marginBottom: 0 }]}>Rubber Price Calculator</Text>
            </View>

            {/* Grade */}
            {renderButtonGroup("Rubber Sheet Grade", Grades, grade, setGrade)}

            {/* Quantity */}
            <View style={styles.section}>
                <Text style={styles.label}>Quantity (Kg)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="e.g. 100"
                />
            </View>

            {/* Quality Factors */}
            <View style={styles.row}>
                <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Moisture (%)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={moisture}
                        onChangeText={setMoisture}
                        placeholder="0-100"
                    />
                </View>
                <View style={[styles.section, { flex: 1 }]}>
                    <Text style={styles.label}>Dirt (%)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={dirt}
                        onChangeText={setDirt}
                        placeholder="0-100"
                    />
                </View>
            </View>

            {/* Visual Quality */}
            {renderButtonGroup("Visual Quality", VisualQualities, visualQuality, setVisualQuality, true)}

            {/* Market Availability (Visual Only) */}
            {renderButtonGroup("Market Availability", MarketAvailability, availability, setAvailability)}

            {/* District */}
            {renderButtonGroup("Location (District)", Districts, district, setDistrict)}

            {/* Predict Button */}
            <TouchableOpacity style={styles.predictBtn} onPress={handlePredict} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.predictBtnText}>Calculate Price</Text>
                )}
            </TouchableOpacity>

            {/* Result */}
            {predictedPrice !== null && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Estimated Auction Price:</Text>
                    <Text style={styles.resultValue}>LKR {predictedPrice.toFixed(2)}</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
    section: { marginBottom: 15 },
    row: { flexDirection: 'row' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#555' },
    input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
    buttonGroup: { flexDirection: 'row', flexWrap: 'wrap' },
    optionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#999', marginRight: 8, marginBottom: 8, backgroundColor: '#FFF' },
    optionBtnSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    optionText: { color: '#555', fontWeight: '500' },
    optionTextSelected: { color: '#FFF' },
    predictBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    predictBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    resultContainer: { marginTop: 30, padding: 20, backgroundColor: '#E8F5E9', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
    resultLabel: { fontSize: 18, color: '#555' },
    resultValue: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginTop: 5 }
});
