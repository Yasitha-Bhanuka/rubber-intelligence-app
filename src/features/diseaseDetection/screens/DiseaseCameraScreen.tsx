import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../shared/styles/colors';
import { DiseaseService } from '../services/diseaseService';

export const DiseaseCameraScreen = ({ navigation, route }: any) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef<any>(null);

    // Default to Leaf Disease (0) if not passed
    const diseaseType = route.params?.type ?? 0;
    const diseaseTypeName = ['Leaf Disease', 'Pest', 'Weed'][diseaseType];

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.btn}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setImage(photo.uri);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const analyzeImage = async () => {
        if (!image) return;

        setLoading(true);
        try {
            const result = await DiseaseService.detect(image, diseaseType);
            navigation.navigate('DiseaseResult', { result, imageUri: image });
        } catch (error) {
            Alert.alert("Error", "Failed to analyze image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {image ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.previewParams} />
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => setImage(null)}>
                            <Text style={styles.secondaryBtnText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.primaryBtn]} onPress={analyzeImage} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Analyze</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <CameraView style={styles.camera} ref={cameraRef}>
                    <View style={styles.overlay}>
                        <Text style={styles.headerText}>Detecting: {diseaseTypeName}</Text>
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
                                <Ionicons name="images-outline" size={30} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>
                            <View style={{ width: 30 }} />
                        </View>
                    </View>
                </CameraView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
    headerText: { color: '#FFF', fontSize: 18, textAlign: 'center', marginTop: 40, fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
    controls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 30 },
    captureBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#000' },
    iconBtn: { padding: 10 },
    previewContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    previewParams: { width: '100%', height: '80%', resizeMode: 'contain' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', padding: 20 },
    btn: { padding: 15, borderRadius: 8, width: '40%', alignItems: 'center' },
    primaryBtn: { backgroundColor: colors.primary },
    secondaryBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.primary },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    secondaryBtnText: { color: colors.primary, fontWeight: 'bold' }
});
