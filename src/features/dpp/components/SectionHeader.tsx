/**
 * Section Header Component
 * Used for grouping related content in screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

/**
 * Section header with title and optional subtitle
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 13,
        color: '#666666',
        marginTop: 4,
    },
});
