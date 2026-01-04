import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updateTransactionStatus, getMyTransactions } from '../services/marketplaceService';
import { MarketplaceTransaction, TransactionMessage } from '../types';
import { useStore } from '../../../store';

export default function NegotiationScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { transactionId } = route.params;
    const { user } = useStore();

    const [transaction, setTransaction] = useState<MarketplaceTransaction | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadTransaction();
        const interval = setInterval(loadTransaction, 5000); // Polling for demo
        return () => clearInterval(interval);
    }, []);

    const loadTransaction = async () => {
        // In real app we'd fetch specific ID, here we filter from list for simplicity or add getById endpoint
        const all = await getMyTransactions();
        const found = all.find(t => t.id === transactionId);
        if (found) setTransaction(found);
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            await updateTransactionStatus(transactionId, transaction?.status || 'Negotiating', newMessage);
            setNewMessage('');
            loadTransaction();
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateTransactionStatus(transactionId, newStatus);
            loadTransaction();
        } catch (e) {
            console.error(e);
        }
    };

    if (!transaction) return <View style={styles.center}><ActivityIndicator /></View>;

    const isBuyer = user?.id === transaction.buyerId;
    const otherPartyName = isBuyer ? transaction.exporterId : transaction.buyerId; // Should fetch name ideally

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={{ marginLeft: 16 }}>
                    <Text style={styles.title}>Negotiation</Text>
                    <Text style={styles.subtitle}>Status: {transaction.status}</Text>
                </View>
                <View style={{ flex: 1 }} />

                {/* Action Buttons based on Role & Status */}
                {transaction.status === 'Pending' && isBuyer && (
                    <TouchableOpacity onPress={() => handleStatusChange('Accepted')} style={styles.acceptBtn}>
                        <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                )}
                {transaction.status === 'Accepted' && !isBuyer && (
                    <TouchableOpacity onPress={() => handleStatusChange('Completed')} style={styles.completeBtn}>
                        <Text style={styles.completeText}>Pay & Finalize</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.offerBanner}>
                <Text style={styles.offerText}>Current Offer: LKR {transaction.offerPrice}</Text>
            </View>

            <FlatList
                data={transaction.messages}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.chatList}
                renderItem={({ item }) => {
                    const isMe = item.senderId === user?.id; // Note: user.id handling might vary depending on auth structure
                    return (
                        <View style={[styles.msgBubble, isMe ? styles.msgMe : styles.msgOther]}>
                            <Text style={[styles.msgText, isMe ? { color: 'white' } : { color: '#000' }]}>{item.text}</Text>
                            <Text style={[styles.msgTime, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: '#888' }]}>
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
            />

            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                />
                <TouchableOpacity onPress={handleSend} disabled={sending}>
                    <Ionicons name="send" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    title: { fontSize: 18, fontWeight: 'bold' },
    subtitle: { fontSize: 12, color: '#666' },
    offerBanner: { backgroundColor: '#E8F2FF', padding: 12, alignItems: 'center' },
    offerText: { color: '#007AFF', fontWeight: 'bold' },
    chatList: { padding: 16 },
    msgBubble: { padding: 12, borderRadius: 16, maxWidth: '80%', marginBottom: 12 },
    msgMe: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
    msgOther: { alignSelf: 'flex-start', backgroundColor: 'white', borderBottomLeftRadius: 4 },
    msgText: { fontSize: 16 },
    msgTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    inputBar: { flexDirection: 'row', padding: 12, backgroundColor: 'white', alignItems: 'center', gap: 12 },
    input: { flex: 1, backgroundColor: '#F2F2F7', padding: 10, borderRadius: 20 },
    acceptBtn: { backgroundColor: '#34C759', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    acceptText: { color: 'white', fontWeight: 'bold' },
    completeBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    completeText: { color: 'white', fontWeight: 'bold' }
});
