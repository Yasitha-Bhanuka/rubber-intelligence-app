import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Dimensions } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { useNavigation } from '@react-navigation/native';

export default function ExporterScannerScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        const getPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        setScanned(true);
        // Navigate to DppDetail with the ID scanned
        navigation.navigate('DppDetail', { id: data });
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Requesting camera permission</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>No access to camera</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
                <Text style={styles.scanText}>Scan DPP QR Code</Text>
                <View style={styles.scanFrame} />
            </View>

            {scanned && (
                <View style={styles.rescanContainer}>
                    <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    scanText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 40,
        textShadowColor: 'black',
        textShadowRadius: 10
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00E0FF',
        backgroundColor: 'transparent',
        borderRadius: 20
    },
    rescanContainer: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center'
    }
});
