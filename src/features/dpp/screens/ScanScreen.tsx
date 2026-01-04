/**
 * Scan Screen
 * Allows exporter to scan QR codes or read NFC tags
 * Entry point for verifyng incoming rubber lots
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
// import { Camera } from 'expo-camera'; // Removed for stability/mocking

import { DPPStackParamList } from '../types/dpp.types';
import { mockDPPData } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<DPPStackParamList, 'Scan'>;

const { width } = Dimensions.get('window');

/**
 * Scan Screen Component
 * Simulates camera scanning and NFC reading
 */
const ScanScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    // State
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [mode, setMode] = useState<'qr' | 'nfc'>('qr');

    useEffect(() => {
        // Mock permission grant
        setHasPermission(true);
    }, []);

    /**
     * Handle mock scan completion
     */
    const handleMockScan = () => {
        if (scanned) return;
        setScanned(true);

        // Simulate processing delay
        setTimeout(() => {
            Alert.alert(
                'Lot Found',
                `Successfully identified Lot ID: ${mockDPPData.lotId}`,
                [
                    {
                        text: 'View DPP',
                        onPress: () => {
                            setScanned(false);
                            navigation.replace('DPPView', { dppData: mockDPPData });
                        }
                    }
                ]
            );
        }, 800);
    };

    /**
     * Handle mock NFC read
     */
    const handleNFCRead = () => {
        Alert.alert('Ready to Scan', 'Hold your device near the NFC tag...');

        // Simulate reading
        setTimeout(() => {
            Alert.alert(
                'NFC Tag Read',
                `Successfully read tag for Lot ID: ${mockDPPData.lotId}`,
                [
                    {
                        text: 'View DPP',
                        onPress: () => navigation.replace('DPPView', { dppData: mockDPPData })
                    }
                ]
            );
        }, 2000);
    };

    if (hasPermission === null) {
        return <View style={styles.container} />;
    }
    if (hasPermission === false) {
        return (
            <View style={styles.centerContainer}>
                <Text>No access to camera</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Lot</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Mode Switcher */}
            <View style={styles.modeSwitcher}>
                <TouchableOpacity
                    style={[styles.modeBtn, mode === 'qr' && styles.modeBtnActive]}
                    onPress={() => setMode('qr')}
                >
                    <Ionicons
                        name="qr-code"
                        size={20}
                        color={mode === 'qr' ? '#2E7D32' : '#FFFFFF'}
                    />
                    <Text style={[styles.modeText, mode === 'qr' && styles.modeTextActive]}>
                        Scan QR
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeBtn, mode === 'nfc' && styles.modeBtnActive]}
                    onPress={() => setMode('nfc')}
                >
                    <Ionicons
                        name="hardware-chip"
                        size={20}
                        color={mode === 'nfc' ? '#2E7D32' : '#FFFFFF'}
                    />
                    <Text style={[styles.modeText, mode === 'nfc' && styles.modeTextActive]}>
                        Read NFC
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {mode === 'qr' ? (
                    <View style={styles.cameraContainer}>
                        {/* Mock Camera View */}
                        <View style={styles.camera}>
                            <View style={styles.overlay}>
                                <View style={styles.scanTarget} />
                                <Text style={styles.scanInstruction}>
                                    Align QR code within frame
                                </Text>
                            </View>
                        </View>

                        {/* Mock Scan Button (since we can't really scan in simulator) */}
                        <TouchableOpacity
                            style={styles.mockScanBtn}
                            onPress={handleMockScan}
                        >
                            <Text style={styles.mockScanText}>Simulate Scan</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.nfcContainer}>
                        <View style={styles.nfcCircle}>
                            <Ionicons name="radio" size={80} color="#FFFFFF" />
                        </View>
                        <Text style={styles.nfcTitle}>Ready to Read</Text>
                        <Text style={styles.nfcDesc}>
                            Hold the top of your device near the NFC tag attached to the rubber lot.
                        </Text>

                        <TouchableOpacity
                            style={styles.mockScanBtn}
                            onPress={handleNFCRead}
                        >
                            <Text style={styles.mockScanText}>Simulate NFC Tap</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 40,
        zIndex: 10,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    modeSwitcher: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 20,
    },
    modeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    modeBtnActive: {
        backgroundColor: '#FFFFFF',
    },
    modeText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontWeight: '600',
    },
    modeTextActive: {
        color: '#2E7D32',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
        backgroundColor: '#1a1a1a', // Mock camera background
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        alignItems: 'center',
    },
    scanTarget: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
        borderRadius: 20,
    },
    scanInstruction: {
        color: '#FFFFFF',
        marginTop: 20,
        fontSize: 16,
        opacity: 0.8,
    },
    mockScanBtn: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#2E7D32',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
        elevation: 5,
    },
    mockScanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    nfcContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    nfcCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    nfcTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    nfcDesc: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
});

export default ScanScreen;
