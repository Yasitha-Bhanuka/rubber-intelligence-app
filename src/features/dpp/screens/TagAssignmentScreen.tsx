/**
 * Tag Assignment Screen
 * Allows buyer to assign physical QR/NFC tags to the rubber lot
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { Card, SectionHeader, InfoRow } from '../components';
import { DPPStackParamList, TagAssignment } from '../types/dpp.types';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'TagAssignment'>;
type RouteType = RouteProp<DPPStackParamList, 'TagAssignment'>;

/**
 * Tag Assignment Screen
 * Simulates writing data to physical tags
 */
const TagAssignmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteType>();
    const { lotInfo } = route.params;

    // Simulation states
    const [qrGenerated, setQrGenerated] = useState(false);
    const [nfcWriting, setNfcWriting] = useState(false);
    const [nfcWritten, setNfcWritten] = useState(false);

    useEffect(() => {
        // Simulate QR generation delay
        const timer = setTimeout(() => {
            setQrGenerated(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Simulate NFC writing process
     */
    const handleWriteNFC = () => {
        setNfcWriting(true);

        // Mock writing delay
        setTimeout(() => {
            setNfcWriting(false);
            setNfcWritten(true);
            Alert.alert('Success', 'NFC Tag written successfully');
        }, 2000);
    };

    /**
     * Complete the process and return to home
     */
    const handleConfirm = () => {
        if (!nfcWritten) {
            Alert.alert('Requirement', 'Please write the NFC tag before confirming.');
            return;
        }

        Alert.alert(
            'Lot Created',
            `Lot ${lotInfo.lotId} has been successfully created and tagged.`,
            [
                {
                    text: 'Done',
                    onPress: () => navigation.navigate('DPPHome'),
                }
            ]
        );
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
                    <Text style={styles.headerTitle}>Tag Assignment</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Instruction */}
                <View style={styles.instructionBox}>
                    <Text style={styles.instructionText}>
                        Attach the physical tags to the rubber lot and assign them to the digital record.
                    </Text>
                </View>

                <SectionHeader title="Digital Identity" />

                {/* QR Code Section */}
                <Card title="QR Code">
                    <View style={styles.qrContainer}>
                        {qrGenerated ? (
                            <View style={styles.qrWrapper}>
                                <QRCode
                                    value={`DPP:${lotInfo.lotId}`}
                                    size={180}
                                    color="black"
                                    backgroundColor="white"
                                />
                                <Text style={styles.qrLabel}>{lotInfo.lotId}</Text>
                            </View>
                        ) : (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="large" color="#2E7D32" />
                                <Text style={styles.loadingText}>Generating QR Code...</Text>
                            </View>
                        )}
                    </View>
                    <InfoRow label="Lot ID" value={lotInfo.lotId} />
                    <InfoRow label="Rubber Type" value={lotInfo.rubberType} />
                </Card>

                {/* NFC Section */}
                <Card title="NFC Tag">
                    <View style={styles.nfcContainer}>
                        <View style={[
                            styles.nfcIconCircle,
                            nfcWritten && { backgroundColor: '#E8F5E9' }
                        ]}>
                            <Ionicons
                                name={nfcWritten ? "hardware-chip" : "radio"}
                                size={40}
                                color={nfcWritten ? "#2E7D32" : "#666666"}
                            />
                        </View>

                        {nfcWritten ? (
                            <View style={styles.nfcStatus}>
                                <Text style={styles.nfcSuccessTitle}>Tag Assigned</Text>
                                <Text style={styles.nfcId}>NFC-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
                            </View>
                        ) : (
                            <View style={styles.nfcAction}>
                                <Text style={styles.nfcPrompt}>Ready to write</Text>
                                <TouchableOpacity
                                    style={[styles.writeBtn, nfcWriting && styles.writeBtnDisabled]}
                                    onPress={handleWriteNFC}
                                    disabled={nfcWriting}
                                >
                                    {nfcWriting ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.writeBtnText}>Write NFC Tag</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Confirm Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            !nfcWritten && styles.confirmButtonDisabled
                        ]}
                        onPress={handleConfirm}
                        disabled={!nfcWritten}
                    >
                        <Ionicons
                            name="checkmark-done-circle"
                            size={22}
                            color={nfcWritten ? "#FFFFFF" : "#999999"}
                        />
                        <Text style={[
                            styles.confirmButtonText,
                            !nfcWritten && styles.confirmButtonTextDisabled
                        ]}>
                            Confirm Assignment
                        </Text>
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
    instructionBox: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#1565C0',
        lineHeight: 20,
        textAlign: 'center',
    },
    qrContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    qrWrapper: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    qrLabel: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    loadingBox: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666666',
        fontSize: 14,
    },
    nfcContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    nfcIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    nfcStatus: {
        flex: 1,
    },
    nfcSuccessTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
    },
    nfcId: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    nfcAction: {
        flex: 1,
    },
    nfcPrompt: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    writeBtn: {
        backgroundColor: '#2E7D32',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
        minWidth: 120,
        alignItems: 'center',
    },
    writeBtnDisabled: {
        opacity: 0.7,
    },
    writeBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    confirmButton: {
        backgroundColor: '#2E7D32',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    confirmButtonTextDisabled: {
        color: '#999999',
    },
});

export default TagAssignmentScreen;
