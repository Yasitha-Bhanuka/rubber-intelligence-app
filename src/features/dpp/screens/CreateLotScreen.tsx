/**
 * Create Lot Screen
 * Allows buyer to create a new rubber lot with all required information
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Card, SectionHeader } from '../components';
import { DPPStackParamList, RubberType, LotInfo } from '../types/dpp.types';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'CreateLot'>;

// Rubber type options
const RUBBER_TYPES: RubberType[] = ['RSS1', 'RSS2', 'RSS3'];

/**
 * Create Lot Screen Component
 * Form for creating new rubber lot
 */
const CreateLotScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // Form state
    const [lotId, setLotId] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [rubberType, setRubberType] = useState<RubberType>('RSS1');
    const [collectionDate, setCollectionDate] = useState<Date>(new Date());
    const [collectionLocation, setCollectionLocation] = useState<string>('');
    const [showRubberTypePicker, setShowRubberTypePicker] = useState<boolean>(false);

    /**
     * Validate form fields
     */
    const validateForm = (): boolean => {
        if (!lotId.trim()) {
            Alert.alert('Validation Error', 'Please enter a Lot ID');
            return false;
        }
        if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid quantity');
            return false;
        }
        if (!collectionLocation.trim()) {
            Alert.alert('Validation Error', 'Please enter collection location');
            return false;
        }
        return true;
    };

    /**
     * Generate PDF Receipt
     */
    const generatePdf = async (info: LotInfo) => {
        try {
            const html = `
                <html>
                    <body style="font-family: Helvetica, sans-serif; padding: 40px; color: #333;">
                        <div style="border-bottom: 2px solid #2E7D32; padding-bottom: 20px; margin-bottom: 20px;">
                            <h1 style="color: #2E7D32; margin: 0;">Rubber Lot Receipt</h1>
                            <p style="margin: 5px 0 0; color: #666;">created via Rubber Intelligence</p>
                        </div>
                        
                        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px;">
                            <p style="margin: 10px 0;"><strong>Lot ID:</strong> ${info.lotId}</p>
                            <p style="margin: 10px 0;"><strong>Date:</strong> ${info.collectionDate}</p>
                            <p style="margin: 10px 0;"><strong>Rubber Type:</strong> ${info.rubberType}</p>
                            <p style="margin: 10px 0;"><strong>Quantity:</strong> ${info.quantity} units</p>
                            <p style="margin: 10px 0;"><strong>Location:</strong> ${info.collectionLocation}</p>
                        </div>

                        <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
                            <p>This document verifies the creation of the lot in the digital system.</p>
                            <p>${new Date().toLocaleString()}</p>
                        </div>
                    </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            Alert.alert('Error', 'Failed to generate or share PDF. Please try again or check permissions.');
        }
    };

    /**
     * Handle lot creation
     */
    const handleCreateLot = async () => {
        if (!validateForm()) return;

        const lotInfo: LotInfo = {
            lotId: lotId.trim(),
            quantity: Number(quantity),
            rubberType,
            collectionDate: collectionDate.toISOString().split('T')[0],
            collectionLocation: collectionLocation.trim(),
            createdAt: new Date().toISOString(),
        };

        Alert.alert(
            'Lot Created Successfully',
            'Would you like to download the receipt PDF?',
            [
                {
                    text: 'Skip',
                    onPress: () => navigation.navigate('UploadDocuments', { lotInfo }),
                    style: 'cancel',
                },
                {
                    text: 'Download PDF',
                    onPress: async () => {
                        await generatePdf(lotInfo);
                        navigation.navigate('UploadDocuments', { lotInfo });
                    },
                }
            ]
        );
    };

    /**
     * Format date for display
     */
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    /**
     * Generate auto lot ID
     */
    const generateLotId = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setLotId(`LOT-${year}-${random}`);
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
                    <Text style={styles.headerTitle}>Create New Lot</Text>
                    <View style={{ width: 24 }} />
                </View>

                <SectionHeader
                    title="Lot Information"
                    subtitle="Enter details about the rubber lot"
                />

                {/* Lot ID Input */}
                <Card>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lot ID *</Text>
                        <View style={styles.lotIdRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                value={lotId}
                                onChangeText={setLotId}
                                placeholder="e.g., LOT-2024-001"
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                style={styles.generateBtn}
                                onPress={generateLotId}
                            >
                                <Ionicons name="refresh" size={20} color="#2E7D32" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quantity Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Quantity (units) *</Text>
                        <TextInput
                            style={styles.input}
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="Enter quantity"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Rubber Type Dropdown */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Rubber Type *</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowRubberTypePicker(!showRubberTypePicker)}
                        >
                            <Text style={styles.dropdownText}>{rubberType}</Text>
                            <Ionicons
                                name={showRubberTypePicker ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                        {showRubberTypePicker && (
                            <View style={styles.dropdownOptions}>
                                {RUBBER_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.dropdownOption,
                                            rubberType === type && styles.dropdownOptionSelected,
                                        ]}
                                        onPress={() => {
                                            setRubberType(type);
                                            setShowRubberTypePicker(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownOptionText,
                                                rubberType === type && styles.dropdownOptionTextSelected,
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                        {rubberType === type && (
                                            <Ionicons name="checkmark" size={18} color="#2E7D32" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Mock Date Picker */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Collection Date *</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => {
                                Alert.alert('Select Date', 'Using current date for demo', [
                                    { text: 'OK', onPress: () => setCollectionDate(new Date()) }
                                ]);
                            }}
                        >
                            <Ionicons name="calendar" size={20} color="#666" />
                            <Text style={[styles.dropdownText, { marginLeft: 8 }]}>
                                {formatDate(collectionDate)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Collection Location */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Collection Location *</Text>
                        <TextInput
                            style={styles.input}
                            value={collectionLocation}
                            onChangeText={setCollectionLocation}
                            placeholder="e.g., Kalutara, Sri Lanka"
                            placeholderTextColor="#999"
                        />
                    </View>
                </Card>

                {/* Rubber Type Info */}
                <Card title="Rubber Type Information">
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Selected: {rubberType}</Text>
                        <Text style={styles.infoText}>
                            {rubberType === 'RSS1' && 'Ribbed Smoked Sheet Grade 1 - Premium quality, light color, no blemishes.'}
                            {rubberType === 'RSS2' && 'Ribbed Smoked Sheet Grade 2 - Good quality, minor color variations allowed.'}
                            {rubberType === 'RSS3' && 'Ribbed Smoked Sheet Grade 3 - Standard quality, some imperfections acceptable.'}
                        </Text>
                    </View>
                </Card>

                {/* Create Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateLot}
                    >
                        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Create & Download</Text>
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
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    lotIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    generateBtn: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
    },
    dropdown: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dropdownText: {
        fontSize: 15,
        color: '#333333',
    },
    dropdownOptions: {
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionSelected: {
        backgroundColor: '#E8F5E9',
    },
    dropdownOptionText: {
        fontSize: 15,
        color: '#333333',
    },
    dropdownOptionTextSelected: {
        color: '#2E7D32',
        fontWeight: '500',
    },
    infoBox: {
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        padding: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    createButton: {
        backgroundColor: '#2E7D32',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default CreateLotScreen;
