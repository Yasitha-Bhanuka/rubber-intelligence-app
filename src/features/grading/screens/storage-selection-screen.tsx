import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../shared/styles/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StorageSelectionScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Storage Selection</Text>
            </View>
            <View style={styles.content}>
                <MaterialCommunityIcons name="warehouse" size={64} color={colors.primary} />
                <Text style={styles.message}>Storage Selection Module Coming Soon</Text>
                <Text style={styles.subMessage}>This feature is currently under development.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        height: 100,
        backgroundColor: colors.primary,
        paddingTop: 40,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    message: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 24,
        textAlign: 'center',
    },
    subMessage: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
});
