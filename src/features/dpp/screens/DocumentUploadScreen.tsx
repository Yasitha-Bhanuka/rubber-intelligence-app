import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { uploadDppDocument } from '../services/dppService';
import { DppResult } from '../types';

export default function DocumentUploadScreen() {
    const navigation = useNavigation<any>();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const processDocument = async () => {
        if (!image) return;

        setLoading(true);
        try {
            const fileName = image.split('/').pop() || 'document.jpg';
            const fileType = 'image/jpeg'; // Simply inferring for now

            const result = await uploadDppDocument(image, fileName, fileType);

            // Navigate to result
            navigation.navigate('ClassificationResult', { result });

        } catch (error) {
            Alert.alert('Error', 'Failed to process document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Secure DPP Upload</Text>
                <Text style={styles.subtitle}>Scan documents for confidential classification</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.previewContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="document-text-outline" size={64} color="#aaa" />
                            <Text style={styles.placeholderText}>No document selected</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.buttonSecondary} onPress={pickImage}>
                        <Ionicons name="images-outline" size={24} color="#007AFF" />
                        <Text style={styles.buttonTextSecondary}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonSecondary} onPress={takePhoto}>
                        <Ionicons name="camera-outline" size={24} color="#007AFF" />
                        <Text style={styles.buttonTextSecondary}>Camera</Text>
                    </TouchableOpacity>
                </View>

                {image && (
                    <TouchableOpacity
                        style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
                        onPress={processDocument}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="scan-circle-outline" size={24} color="white" />
                                <Text style={styles.buttonTextPrimary}>Analyze & Protect</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5ea',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    previewContainer: {
        width: '100%',
        height: 400,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 24,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 16,
        color: '#aaa',
        fontSize: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
        width: '100%',
    },
    buttonSecondary: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    buttonTextSecondary: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 16,
    },
    buttonPrimary: {
        width: '100%',
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonTextPrimary: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
