import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getBuyerDocuments } from '../services/dppService';
import { createSellingPost } from '../services/marketplaceService';
import { DppDocument } from '../types';

export default function CreateSellingPostScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);

    // Form State
    const [grade, setGrade] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    // Data for Selector
    const [myDocs, setMyDocs] = useState<DppDocument[]>([]);

    // Data
    const GRADE_OPTIONS = ['RSS1', 'RSS2', 'RSS3', 'RSS4', 'RSS5'];
    const [showGradePicker, setShowGradePicker] = useState(false);

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        const docs = await getBuyerDocuments();
        setMyDocs(docs);
    };

    const handleSubmit = async () => {
        if (!grade || !quantity || !price || !location) {
            Alert.alert('Missing Fields', 'Please fill all details');
            return;
        }

        setLoading(true);
        try {
            await createSellingPost({
                grade,
                quantityKg: parseFloat(quantity),
                pricePerKg: parseFloat(price),
                location,
                dppDocumentId: selectedDocId || undefined
            });
            Alert.alert('Success', 'Selling Post Created!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>New Selling Post</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Rubber Grade</Text>
                <TouchableOpacity
                    style={styles.pickerTrigger}
                    onPress={() => setShowGradePicker(true)}
                >
                    <Text style={grade ? styles.pickerValue : styles.pickerPlaceholder}>
                        {grade || "Select Grade"}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                <Text style={styles.label}>Quantity (Kg)</Text>
                <TextInput style={styles.input} placeholder="1000" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

                <Text style={styles.label}>Price per Kg (LKR)</Text>
                <TextInput style={styles.input} placeholder="500" keyboardType="numeric" value={price} onChangeText={setPrice} />

                <Text style={styles.label}>Dispatched Address</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="e.g. 123 Rubber Estate, Kalutara, Sri Lanka"
                    value={location}
                    onChangeText={setLocation}
                    multiline
                    numberOfLines={3}
                />

                <Text style={styles.label}>Attach Proof (DPP Document)</Text>
                <Text style={styles.helperText}>
                    Select the **Certified Digital Product Passport** that corresponds to this physical rubber lot.
                    This proves the origin and quality to the buyer.
                </Text>

                <ScrollView horizontal style={styles.docSelector} showsHorizontalScrollIndicator={false}>
                    {myDocs.map((doc) => (
                        <TouchableOpacity
                            key={doc.id}
                            style={[styles.docChip, selectedDocId === doc.id && styles.docChipSelected]}
                            onPress={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
                        >
                            <Ionicons name="shield-checkmark" size={16} color={selectedDocId === doc.id ? 'white' : '#555'} />
                            <View>
                                <Text style={[styles.docText, selectedDocId === doc.id && { color: 'white' }]}>
                                    {doc.originalFileName}
                                </Text>
                                <Text style={[styles.docDate, selectedDocId === doc.id && { color: 'rgba(255,255,255,0.8)' }]}>
                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    {myDocs.length === 0 && (
                        <View style={styles.noDocs}>
                            <Text style={styles.noDocsText}>No certified documents found.</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('DocumentUpload')}>
                                <Text style={styles.uploadLink}>Upload & Certify a Document first</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={[styles.btn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Publish Post</Text>}
                </TouchableOpacity>
            </View>

            {/* Grade Picker Modal */}
            <Modal visible={showGradePicker} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGradePicker(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Rubber Grade</Text>
                        {GRADE_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={styles.modalOption}
                                onPress={() => { setGrade(opt); setShowGradePicker(false); }}
                            >
                                <Text style={[styles.modalOptionText, grade === opt && { color: '#007AFF', fontWeight: 'bold' }]}>
                                    {opt}
                                </Text>
                                {grade === opt && <Ionicons name="checkmark" size={20} color="#007AFF" />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGradePicker(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { padding: 20, paddingTop: 60, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', gap: 16 },
    title: { fontSize: 24, fontWeight: 'bold' },
    form: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: 'white', padding: 16, borderRadius: 12, fontSize: 16 },
    pickerTrigger: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    pickerValue: { fontSize: 16, color: '#000' },
    pickerPlaceholder: { fontSize: 16, color: '#ccc' },

    helperText: { fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 18 },

    btn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 32 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    docSelector: { flexDirection: 'row', gap: 10, paddingBottom: 8 },
    docChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
        maxWidth: 200
    },
    docChipSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    docText: { fontSize: 14, fontWeight: '600', color: '#333' },
    docDate: { fontSize: 10, color: '#888', marginTop: 2 },

    noDocs: { padding: 10 },
    noDocsText: { color: '#999', fontStyle: 'italic', marginBottom: 4 },
    uploadLink: { color: '#007AFF', fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
    modalOptionText: { fontSize: 16, color: '#333' },
    cancelBtn: { marginTop: 16, alignItems: 'center', padding: 12 },
    cancelText: { color: 'red', fontSize: 16, fontWeight: '600' }
});
