/**
 * Upload Documents Screen
 * Allows buyer to upload required documents for verification (Images/PDF/Docs)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { Card, SectionHeader } from '../components';
import { DPPStackParamList, DocumentInfo, ConfidentialityResult } from '../types/dpp.types';
import { uploadDppDocument } from '../services/dppService';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'UploadDocuments'>;
type RouteType = RouteProp<DPPStackParamList, 'UploadDocuments'>;

// Document types configuration
const DOCUMENT_TYPES = [
    {
        key: 'grading_certificate',
        title: 'Grading Certificate',
        description: 'Official rubber grading certificate from authorized grader',
        icon: 'ribbon',
    },
    {
        key: 'weighbridge_receipt',
        title: 'Weighbridge Receipt',
        description: 'Weight verification receipt from certified weighbridge',
        icon: 'scale',
    },
    {
        key: 'buying_receipt',
        title: 'Buying Receipt',
        description: 'Purchase receipt from rubber buying center',
        icon: 'receipt',
    },
] as const;

/**
 * Upload Documents Screen Component
 */
const UploadDocumentsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteType>();
    const { lotInfo } = route.params;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for uploaded documents
    const [documents, setDocuments] = useState<{
        grading_certificate: DocumentInfo | null;
        weighbridge_receipt: DocumentInfo | null;
        buying_receipt: DocumentInfo | null;
    }>({
        grading_certificate: null,
        weighbridge_receipt: null,
        buying_receipt: null,
    });

    /**
     * Helper to determine mime type
     */
    const getMimeType = (fileName: string, type?: string) => {
        if (type) return type;
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.pdf')) return 'application/pdf';
        if (lower.endsWith('.doc')) return 'application/msword';
        if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (lower.endsWith('.png')) return 'image/png';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
        return 'application/octet-stream';
    };

    /**
     * Pick Image from Gallery
     */
    const pickImage = async (docType: keyof typeof documents) => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Permission Required", "Camera roll permission is needed.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const mimeType = getMimeType(asset.fileName || 'image.jpg', asset.mimeType);
                saveDocument(docType, asset.fileName || `image_${Date.now()}.jpg`, asset.uri, mimeType);
            }
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    /**
     * Pick Document from File System
     */
    const pickDocument = async (docType: keyof typeof documents) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/*'
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const mimeType = getMimeType(asset.name, asset.mimeType);
                saveDocument(docType, asset.name, asset.uri, mimeType);
            }
        } catch (error) {
            console.error('Document upload error:', error);
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    /**
     * Save document to state
     */
    const saveDocument = (docType: keyof typeof documents, fileName: string, uri: string, mimeType: string) => {
        const docInfo: DocumentInfo = {
            id: `DOC-${Date.now()}`,
            name: DOCUMENT_TYPES.find(d => d.key === docType)?.title || docType,
            type: docType as DocumentInfo['type'],
            fileName: fileName,
            uri: uri,
            mimeType: mimeType,
            uploadedAt: new Date().toISOString(),
        };

        setDocuments(prev => ({
            ...prev,
            [docType]: docInfo,
        }));
    };

    /**
     * Handle Upload Action - Present Choice
     */
    const handleUpload = (docType: keyof typeof documents) => {
        Alert.alert(
            'Select File Source',
            'Choose how you want to upload the document',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Image Gallery',
                    onPress: () => pickImage(docType)
                },
                {
                    text: 'Files (PDF, Doc)',
                    onPress: () => pickDocument(docType)
                },
            ]
        );
    };

    /**
     * Remove uploaded document
     */
    const handleRemove = (docType: keyof typeof documents) => {
        setDocuments(prev => ({
            ...prev,
            [docType]: null,
        }));
    };

    /**
     * Check if all documents are uploaded
     */
    const allDocumentsUploaded = (): boolean => {
        return Object.values(documents).every(doc => doc !== null);
    };

    /**
     * Get count of uploaded documents
     */
    const getUploadedCount = (): number => {
        return Object.values(documents).filter(doc => doc !== null).length;
    };

    /**
     * Handle submit for verification
     */
    const handleSubmit = async () => {
        if (!allDocumentsUploaded()) {
            Alert.alert(
                'Missing Documents',
                'Please upload all required documents before submitting.',
                [{ text: 'OK' }]
            );
            return;
        }

        const uploadedDocs = Object.values(documents).filter(
            (doc): doc is DocumentInfo => doc !== null
        );

        setIsSubmitting(true);
        try {
            // Process all documents with Backend
            // We use Promise.all to upload in parallel (or sequential if needed)
            const analysisPromises = uploadedDocs.map(doc => {
                if (!doc.uri) throw new Error("Document URI missing");
                return uploadDppDocument(
                    doc.uri,
                    doc.fileName,
                    doc.mimeType || 'application/octet-stream',
                    lotInfo.lotId
                );
            });

            const results = await Promise.all(analysisPromises);

            navigation.navigate('ConfidentialityResult', {
                lotInfo,
                documents: uploadedDocs,
                analysisResults: results
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Upload Failed', 'There was an error processing your documents. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Upload Documents</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Summaries & Cards */}
                <Card>
                    <View style={styles.lotSummary}>
                        <View style={styles.lotIcon}>
                            <Ionicons name="cube" size={24} color="#2E7D32" />
                        </View>
                        <View style={styles.lotDetails}>
                            <Text style={styles.lotId}>{lotInfo.lotId}</Text>
                            <Text style={styles.lotMeta}>
                                {lotInfo.rubberType} • {lotInfo.quantity} units • {lotInfo.collectionLocation}
                            </Text>
                        </View>
                    </View>
                </Card>

                <Card>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Upload Progress</Text>
                        <Text style={styles.progressCount}>
                            {getUploadedCount()} / {DOCUMENT_TYPES.length}
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(getUploadedCount() / DOCUMENT_TYPES.length) * 100}%` }
                            ]}
                        />
                    </View>
                </Card>

                <SectionHeader
                    title="Required Documents"
                    subtitle="Upload PDF, Doc, or Image files"
                />

                {DOCUMENT_TYPES.map((docType) => {
                    const uploadedDoc = documents[docType.key];
                    const isUploaded = uploadedDoc !== null;

                    return (
                        <Card key={docType.key}>
                            <View style={styles.docHeader}>
                                <View style={[
                                    styles.docIcon,
                                    { backgroundColor: isUploaded ? '#E8F5E9' : '#F5F5F5' }
                                ]}>
                                    <Ionicons
                                        name={docType.icon as any}
                                        size={22}
                                        color={isUploaded ? '#2E7D32' : '#666666'}
                                    />
                                </View>
                                <View style={styles.docInfo}>
                                    <Text style={styles.docTitle}>{docType.title}</Text>
                                    <Text style={styles.docDesc}>{docType.description}</Text>
                                </View>
                            </View>

                            {isUploaded ? (
                                <View style={styles.uploadedSection}>
                                    <View style={styles.fileInfo}>
                                        <Ionicons name="document-text" size={18} color="#2E7D32" />
                                        <Text style={styles.fileName} numberOfLines={1}>
                                            {uploadedDoc.fileName}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => handleRemove(docType.key)}
                                    >
                                        <Ionicons name="close-circle" size={22} color="#C62828" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.uploadBtn}
                                    onPress={() => handleUpload(docType.key)}
                                >
                                    <Ionicons name="cloud-upload" size={20} color="#2E7D32" />
                                    <Text style={styles.uploadBtnText}>Select File</Text>
                                </TouchableOpacity>
                            )}
                        </Card>
                    );
                })}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!allDocumentsUploaded() || isSubmitting) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!allDocumentsUploaded() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name="shield-checkmark"
                                    size={22}
                                    color={allDocumentsUploaded() ? '#FFFFFF' : '#999999'}
                                />
                                <Text style={[
                                    styles.submitButtonText,
                                    (!allDocumentsUploaded()) && styles.submitButtonTextDisabled,
                                ]}>
                                    {isSubmitting ? 'Processing...' : 'Submit / Verify'}
                                </Text>
                            </>
                        )}
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
    lotSummary: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lotIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    lotDetails: {
        flex: 1,
    },
    lotId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    lotMeta: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: '#666666',
    },
    progressCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2E7D32',
        borderRadius: 4,
    },
    docHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    docIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    docInfo: {
        flex: 1,
    },
    docTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333333',
    },
    docDesc: {
        fontSize: 13,
        color: '#666666',
        marginTop: 2,
    },
    uploadedSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F5E9',
        borderRadius: 6,
        padding: 10,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fileName: {
        fontSize: 13,
        color: '#2E7D32',
        marginLeft: 8,
        flex: 1,
    },
    removeBtn: {
        padding: 4,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#2E7D32',
        borderStyle: 'dashed',
    },
    uploadBtnText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    submitButton: {
        backgroundColor: '#2E7D32',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    submitButtonTextDisabled: {
        color: '#999999',
    },
});

export default UploadDocumentsScreen;
