/**
 * Info Row Component
 * Displays label-value pairs in a consistent format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InfoRowProps {
    label: string;
    value: string | number;
    valueColor?: string;
}

/**
 * Single row displaying a label and value
 */
export const InfoRow: React.FC<InfoRowProps> = ({ label, value, valueColor }) => {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>
                {value}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    label: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
        flex: 1,
        textAlign: 'right',
    },
});
