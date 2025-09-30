import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const propertyTypeOptions = [
    { label: 'Flat', value: 'Flat' },
    { label: 'Plot', value: 'Plot' },
    { label: 'Shop', value: 'Shop' },
];

const initialNatureTable = [
    { id: 1, nature: 'Gropu Tower', natureCode: '1' },
    { id: 2, nature: 'House/Villa', natureCode: '2' },
    { id: 3, nature: 'Plot', natureCode: '3' },
    { id: 4, nature: 'Commercial Unit', natureCode: '4' },
];

const initialExistingSubTypes = [
    { id: 1, natureCode: '1', propertyType: 'Flat', name: 'Luxury Flat' },
    { id: 2, natureCode: '2', propertyType: 'Shop', name: 'Retail Shop' },
    { id: 3, natureCode: '3', propertyType: 'Plot', name: 'Factory Plot' },
];

export default function SubPropertyType() {
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState(propertyTypeOptions[0].value);
    const [name, setName] = useState('');
    const [natureCode, setNatureCode] = useState('');
    const [existingSubTypes, setExistingSubTypes] = useState(initialExistingSubTypes);

    const handleSubmit = () => {
        if (name.trim() && natureCode.trim() && selectedType) {
            setExistingSubTypes([
                ...existingSubTypes,
                { id: existingSubTypes.length + 1, natureCode, propertyType: selectedType, name },
            ]);
            setName('');
            setNatureCode('');
            setSelectedType(propertyTypeOptions[0].value);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Ionicons name="menu" size={28} color="BLACK" />
                            </TouchableOpacity>
                            <Text style={styles.title}>
                                Sub Property <Text style={{ color: '#5aaf57' }}>Nature</Text>
                            </Text>
                        </View>
                    </View>
                    {/* Card 1: Configure Sub Property Type */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Configure Sub Property Type</Text>
                        <View style={styles.formRow}>
                            <Text style={styles.label}>Property Type</Text>
                            <View style={styles.dropdownContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={selectedType}
                                    onFocus={() => { }}
                                    onChangeText={setSelectedType}
                                    placeholder="Select Property Type"
                                />
                            </View>
                        </View>
                        <View style={styles.formRow}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter Name"
                            />
                        </View>
                        <View style={styles.formRow}>
                            <Text style={styles.label}></Text>
                            <TextInput
                                style={styles.input}
                                value={natureCode}
                                onChangeText={setNatureCode}
                                placeholder="Enter Nature Code"
                            />
                        </View>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Card 2: Nature Table */}
                    <View style={styles.card}>
                         <Text style={styles.cardTitle}><Text style={{ color: 'red' }}>Note:-</Text>Please follow this codes</Text>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Nature</Text>
                            <Text style={styles.tableHeaderText}>Nature Code</Text>
                        </View>
                        {initialNatureTable.map((item) => (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{item.nature}</Text>
                                <Text style={styles.tableCell}>{item.natureCode}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Card 3: Existing Sub Property Types */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Existing Sub Property Types</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Nature Code</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Property Type</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Name</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                        </View>
                        {existingSubTypes.map((item, idx) => (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                                <Text style={[styles.tableCell, { flex: 1 }]}>{item.natureCode}</Text>
                                <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.propertyType}</Text>
                                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
                                <View style={[styles.actionCell, { flex: 1 }]}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => {/* edit logic */ }}>
                                        <Feather name="edit" size={18} color="#5aaf57" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => {/* delete logic */ }}>
                                        <Ionicons name="trash" size={18} color="#d32f2f" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { paddingBottom: 24 },
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
    header: {
        paddingVertical: 18,
    },
    title: {
        fontSize: 32,
        fontFamily: 'PlusSB',
        color: '#333',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'PlusSB',
        color: '#333',
        marginBottom: 12,
    },
    formRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        width: 110,
        color: '#333',
        fontFamily: 'PlusR',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 8,
        backgroundColor: '#f5f5f5',
        color: '#333',
        fontFamily: 'PlusR',
    },
    dropdownContainer: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#5aaf57',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'PlusSB',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#5aaf57',
        padding: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    tableHeaderText: {
        flex: 1,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'PlusSB',
        fontSize: 14,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        color: '#333',
        fontFamily: 'PlusR',
        fontSize: 13,
    },
    actionCell: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 4,
    },
});
