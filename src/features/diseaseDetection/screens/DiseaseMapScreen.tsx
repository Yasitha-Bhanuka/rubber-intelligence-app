import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../../store';
import { DiseaseService, MapDataPoint } from '../services/diseaseService';
import { colors } from '../../../shared/styles/colors';

export const DiseaseMapScreen = () => {
    const { user } = useStore();
    const [mapData, setMapData] = useState<MapDataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    // Default to Sri Lanka center, or user's plantation location
    const defaultLat = user?.latitude ?? 7.8731;
    const defaultLng = user?.longitude ?? 80.7718;

    useEffect(() => {
        loadMapData();
    }, []);

    const loadMapData = async () => {
        try {
            const data = await DiseaseService.getMapData(30);
            setMapData(data);
        } catch (error) {
            console.error('Failed to load map data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDiseaseColor = (diseaseType: string) => {
        switch (diseaseType) {
            case 'Leaf': return '#D32F2F';   // Red for leaf diseases
            case 'Pest': return '#E91E63';   // Pink for pests
            case 'Weed': return '#FF9800';   // Orange for weeds
            default: return '#9C27B0';       // Purple for unknown
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading disease map...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="map" size={28} color={colors.primary} />
                <Text style={styles.headerTitle}>Disease Map</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{mapData.length} detections</Text>
                </View>
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: defaultLat,
                        longitude: defaultLng,
                        latitudeDelta: 0.15,
                        longitudeDelta: 0.15,
                    }}
                >
                    {/* Farmer's Plantation Marker */}
                    {user?.latitude && user?.longitude && (
                        <>
                            <Marker
                                coordinate={{
                                    latitude: user.latitude,
                                    longitude: user.longitude,
                                }}
                                title={user.plantationName || 'My Plantation'}
                                description="Your plantation location"
                                pinColor="blue"
                            />
                            <Circle
                                center={{
                                    latitude: user.latitude,
                                    longitude: user.longitude,
                                }}
                                radius={5000}
                                strokeColor="rgba(46, 125, 50, 0.5)"
                                fillColor="rgba(46, 125, 50, 0.08)"
                                strokeWidth={2}
                            />
                        </>
                    )}

                    {/* Disease Detection Markers */}
                    {mapData.map((point) => (
                        <Marker
                            key={point.id}
                            coordinate={{
                                latitude: point.latitude,
                                longitude: point.longitude,
                            }}
                            pinColor={getDiseaseColor(point.diseaseType)}
                            title={point.disease}
                            description={`Confidence: ${(point.confidence * 100).toFixed(1)}% | ${new Date(point.detectedAt).toLocaleDateString()}`}
                        />
                    ))}
                </MapView>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: 'blue' }]} />
                    <Text style={styles.legendText}>Your Plantation</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#D32F2F' }]} />
                    <Text style={styles.legendText}>Leaf Disease</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#E91E63' }]} />
                    <Text style={styles.legendText}>Pest</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.legendText}>Weed</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendCircle]} />
                    <Text style={styles.legendText}>5km Alert Zone</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
        gap: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    badge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    mapContainer: {
        flex: 1,
        margin: 12,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    map: {
        flex: 1,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        paddingTop: 4,
        gap: 12,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(46, 125, 50, 0.5)',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
    },
    legendText: {
        fontSize: 11,
        color: '#666',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
});
