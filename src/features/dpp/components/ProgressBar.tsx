/**
 * Progress Bar Component
 * Used for displaying scores and percentages
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    color?: string;
}

/**
 * Horizontal progress bar with optional label
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    label,
    showPercentage = true,
    color = '#2E7D32',
}) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <View style={styles.container}>
            {label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {showPercentage && (
                        <Text style={styles.percentage}>{clampedValue.toFixed(1)}%</Text>
                    )}
                </View>
            )}
            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
                        { width: `${clampedValue}%`, backgroundColor: color },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        color: '#666666',
    },
    percentage: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333333',
    },
    track: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
});
