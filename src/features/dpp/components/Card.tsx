/**
 * Reusable Card Component for DPP System
 * Clean, academic UI design
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

/**
 * Card component with optional title
 * Used throughout the DPP module for consistent styling
 */
export const Card: React.FC<CardProps> = ({ title, children, style, titleStyle }) => {
    return (
        <View style={[styles.card, style]}>
            {title && <Text style={[styles.cardTitle, titleStyle]}>{title}</Text>}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
    },
});
