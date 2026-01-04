import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../../store';
import { AppTextInput } from '../../../shared/components/AppTextInput';
import { AppButton } from '../../../shared/components/AppButton';
import { colors } from '../../../shared/styles/colors';

export const LoginScreen = () => {
    const { login, isLoading, error } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validate = () => {
        let isValid = true;
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }
        return isValid;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            await login({ email, password });
        } catch (err: any) {
            // Error is handled by store but good to alert or show toast
            Alert.alert("Login Failed", err.message || "An error occurred");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>RubberEX</Text>
                        <Text style={styles.subtitle}>Intelligence Platform</Text>
                    </View>

                    <View style={styles.form}>
                        <AppTextInput
                            label="Email Address"
                            placeholder="e.g. farmer@test.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={emailError}
                        />

                        <AppTextInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={passwordError}
                        />

                        {error ? <Text style={styles.serverError}>{error}</Text> : null}

                        <AppButton
                            title="Sign In"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            style={styles.button}
                        />

                        <View style={styles.helper}>
                            <Text style={styles.helperText}>Test Accounts:</Text>
                            <Text style={styles.helperText}>Farmer: farmer@test.com / pass123</Text>
                            <Text style={styles.helperText}>Admin: admin@test.com / pass123</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    serverError: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        marginTop: 8
    },
    helper: {
        marginTop: 32,
        padding: 16,
        backgroundColor: colors.lightGray,
        borderRadius: 8
    },
    helperText: {
        color: '#666',
        fontSize: 12
    }
});
