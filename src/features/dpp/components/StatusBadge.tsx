/**
 * Status Badge Component
 * Displays verification status with appropriate colors
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeType = 'verified' | 'suspicious' | 'pending' | 'confidential' | 'non-confidential' | 'low' | 'medium' | 'high';

interface StatusBadgeProps {
    type: BadgeType;
    text?: string;
}

/**
 * Status badge with color-coded backgrounds
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, text }) => {
    const getStyles = () => {
        switch (type) {
            case 'verified':
            case 'low':
            case 'non-confidential':
                return { bg: '#E8F5E9', text: '#2E7D32' };
            case 'suspicious':
            case 'medium':
            case 'confidential':
                return { bg: '#FFF3E0', text: '#E65100' };
            case 'high':
                return { bg: '#FFEBEE', text: '#C62828' };
            case 'pending':
            default:
                return { bg: '#E3F2FD', text: '#1565C0' };
        }
    };

    const colorStyles = getStyles();
    const displayText = text || type.charAt(0).toUpperCase() + type.slice(1).replace('_', '-');

    return (
        <View style={[styles.badge, { backgroundColor: colorStyles.bg }]}>
            <Text style={[styles.badgeText, { color: colorStyles.text }]}>{displayText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
