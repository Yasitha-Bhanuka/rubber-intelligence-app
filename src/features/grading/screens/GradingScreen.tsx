import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/styles/colors';
import { GradingService, GradingResponse } from '../services/gradingService';

export const GradingScreen = () => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GradingResponse | null>(null);

    const pickImage = async () => {
        const currentPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (currentPermission.status !== 'granted') {
            Alert.alert("Permission Required", "Need gallery access to upload images.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
            Alert.alert("Permission Required", "Need camera access to take photos.");
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
            const data = await GradingService.analyzeImage(image);
            setResult(data);
        } catch (error) {
            Alert.alert("Analysis Failed", "Could not analyze the image. Ensure backend is running.");
            console.error(error);
        } finally {
            setLoading(false);
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

                <View style={styles.separator} />

                <Text style={styles.suggestionTitle}>Suggestion:</Text>
                <Text style={styles.suggestionText}>{result.suggestions}</Text>
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, result && styles.containerResult]}>
            <Text style={result ? styles.headerSmall : styles.header}>Rubber Sheet Grading</Text>
            {!result && <Text style={styles.subHeader}>Detect defects like Bubbles or Marks</Text>}

            <View style={result ? styles.topRow : styles.centerContent}>
                <View style={[styles.imageContainer, result && styles.imageContainerSmall]}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="image-outline" size={60} color="#CCC" />
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>

                <View style={result ? styles.controlsRight : styles.controlsCenter}>
                    {/* Buttons Logic: Show smaller icons in result mode */}
                    <View style={result ? styles.buttonRowSmall : styles.buttonRow}>
                        <TouchableOpacity style={[styles.actionBtn, result && styles.actionBtnSmall]} onPress={pickImage}>
                            <Ionicons name="images" size={result ? 20 : 24} color="#FFF" />
                            {!result && <Text style={styles.btnText}>Gallery</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.cameraBtn, result && styles.actionBtnSmall]} onPress={takePhoto}>
                            <Ionicons name="camera" size={result ? 20 : 24} color="#FFF" />
                            {!result && <Text style={styles.btnText}>Camera</Text>}
                        </TouchableOpacity>
                    </View>

                    {image && (
                        <TouchableOpacity
                            style={[styles.analyzeBtn, result && styles.analyzeBtnSmall, loading && styles.disabledBtn]}
                            onPress={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.analyzeText}>{result ? "Re-Analyze" : "Analyze Sheet"}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {renderResult()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA', alignItems: 'center' },
    containerResult: { alignItems: 'flex-start', paddingTop: 40 }, // Move to top

    header: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 5, textAlign: 'center' },
    headerSmall: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10, alignSelf: 'center' },

    subHeader: { fontSize: 14, color: '#7F8C8D', marginBottom: 20 },

    centerContent: { width: '100%', alignItems: 'center' },
    topRow: { flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 20 },

    imageContainer: {
        width: 300, height: 300, borderRadius: 15, overflow: 'hidden',
        backgroundColor: '#FFF', elevation: 3, marginBottom: 20, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#EEE'
    },
    imageContainerSmall: {
        width: 100, height: 100, borderRadius: 10, marginBottom: 0, marginRight: 15
    },

    previewImage: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { marginTop: 10, color: '#AAA' },

    controlsCenter: { alignItems: 'center', width: '100%' },
    controlsRight: { flex: 1, alignItems: 'flex-start' },

    buttonRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    buttonRowSmall: { flexDirection: 'row', gap: 10, marginBottom: 10 },

    actionBtn: { flexDirection: 'row', backgroundColor: '#3498DB', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, alignItems: 'center', gap: 8 },
    actionBtnSmall: { paddingVertical: 8, paddingHorizontal: 12 },

    cameraBtn: { backgroundColor: '#E67E22' },
    btnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },

    analyzeBtn: { backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 60, borderRadius: 30, elevation: 5 },
    analyzeBtnSmall: { paddingVertical: 10, paddingHorizontal: 20, width: '100%', alignItems: 'center' },

    disabledBtn: { backgroundColor: '#95A5A6' },
    analyzeText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    resultCard: {
        width: '100%', backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 3,
        borderLeftWidth: 5, borderLeftColor: colors.primary
    },
    badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, marginBottom: 10 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
    confidence: { fontSize: 14, color: '#7F8C8D', marginBottom: 15 },
    separator: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
    suggestionTitle: { fontSize: 16, fontWeight: '600', color: '#2C3E50', marginBottom: 5 },
    suggestionText: { fontSize: 14, color: '#555', lineHeight: 20 }
});
