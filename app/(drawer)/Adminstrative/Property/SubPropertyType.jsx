import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import useRealEstatePropertyTypeActions from '../../../../hooks/useRealEstatePropertyTypeActions';
import useSubPropertyTypes from '../../../../hooks/useSubPropertyTypes';

const initialNatureTable = [
    { id: 1, nature: 'Group Tower', natureCode: '1' },
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
    const { propertyTypes, loading: propertyTypesLoading } = useRealEstatePropertyTypeActions();
    const { 
        subPropertyTypes, 
        loading: subPropertyTypesLoading, 
        addSubPropertyType, 
        updateSubPropertyType,
        deleteSubPropertyType 
    } = useSubPropertyTypes();
    
    const [selectedType, setSelectedType] = useState(null);
    const [name, setName] = useState('');
    const [natureCode, setNatureCode] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Convert fetched property types to dropdown format
    const propertyTypeOptions = useMemo(() => {
        return propertyTypes.map(type => ({
            label: type.name || type.realEstatePropertyTypeName,
            value: type.id
        }));
    }, [propertyTypes]);

    const handleSubmit = async () => {
        if (name.trim() && natureCode.trim() && selectedType) {
            try {
                const payload = {
                    natureCode: parseInt(natureCode.trim()),
                    realEstatePropertyType: {
                        id: selectedType
                    },
                    name: name.trim()
                };
                
                if (isEditing && editingId) {
                    // Update existing sub property type
                    await updateSubPropertyType(editingId, payload);
                    Alert.alert('Success', 'Sub Property Type updated successfully!');
                } else {
                    // Add new sub property type
                    await addSubPropertyType(payload);
                    Alert.alert('Success', 'Sub Property Type added successfully!');
                }
                
                // Reset form
                resetForm();
                
            } catch (error) {
                Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} Sub Property Type`);
                console.error(`Error ${isEditing ? 'updating' : 'adding'} sub property type:`, error);
            }
        } else {
            Alert.alert('Validation Error', 'Please fill all fields');
        }
    };

    const resetForm = () => {
        setName('');
        setNatureCode('');
        setSelectedType(null);
        setEditingId(null);
        setIsEditing(false);
    };

    const handleEdit = (item) => {
        setName(item.name);
        setNatureCode(item.natureCode.toString());
        setSelectedType(item.realEstatePropertyType?.id);
        setEditingId(item.id);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDelete = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this sub property type?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSubPropertyType(id);
                            Alert.alert('Success', 'Sub Property Type deleted successfully!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete Sub Property Type');
                            console.error('Error deleting sub property type:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Ionicons name="menu" size={28} color="BLACK" />
                            </TouchableOpacity>
                            <Text style={styles.title}>
                                Sub Property <Text style={{ color: '#5aaf57' }}>Type</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Card 1: Configure Sub Property Type */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            {isEditing ? 'Edit Sub Property Type' : 'Configure Sub Property Type'}
                        </Text>

                        {/* Property Type Dropdown */}
                        <View style={styles.formRow}>
                            <Text style={styles.label}>Property Type</Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={propertyTypeOptions}
                                labelField="label"
                                valueField="value"
                                placeholder={propertyTypesLoading ? "Loading..." : "Select Property Type"}
                                value={selectedType}
                                onChange={item => setSelectedType(item.value)}
                                disable={propertyTypesLoading}
                            />
                        </View>

                        {/* Name Input */}
                        <View style={styles.formRow}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter Name"
                            />
                        </View>

                        {/* Nature Code Input */}
                        <View style={styles.formRow}>
                            <Text style={styles.label}>Nature Code</Text>
                            <TextInput
                                style={styles.input}
                                value={natureCode}
                                onChangeText={setNatureCode}
                                placeholder="Enter Nature Code"
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.submitButton, subPropertyTypesLoading && styles.disabledButton]} 
                            onPress={handleSubmit}
                            disabled={subPropertyTypesLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {subPropertyTypesLoading ? 
                                    (isEditing ? 'Updating...' : 'Saving...') : 
                                    (isEditing ? 'Update' : 'Submit')
                                }
                            </Text>
                        </TouchableOpacity>

                        {isEditing && (
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={handleCancelEdit}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Card 2: Nature Table */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}><Text style={{ color: 'red' }}>Note:-</Text> Please follow this codes</Text>
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
                        {subPropertyTypesLoading ? (
                            <Text style={styles.loadingText}>Loading sub property types...</Text>
                        ) : (
                            <>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Nature Code</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Property Type</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Name</Text>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                                </View>
                                {subPropertyTypes.length > 0 ? (
                                    subPropertyTypes.map((item, idx) => (
                                        <View key={item.id} style={styles.tableRow}>
                                            <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                                            <Text style={[styles.tableCell, { flex: 1 }]}>{item.natureCode}</Text>
                                            <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.realEstatePropertyType?.name || 'N/A'}</Text>
                                            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
                                            <View style={[styles.actionCell, { flex: 1 }]}>
                                                <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                                                    <Feather name="edit" size={18} color="#5aaf57" />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                                                    <Ionicons name="trash" size={18} color="#d32f2f" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.noDataText}>No sub property types found</Text>
                                )}
                            </>
                        )}
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
    header: { paddingVertical: 18 },
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
    dropdown: {
        flex: 1,
        borderWidth: 1,
        height: 45,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#f5f5f5',
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
    iconBtn: { padding: 4 },
    disabledButton: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        fontFamily: 'PlusR',
        padding: 20,
    },
    noDataText: {
        textAlign: 'center',
        color: '#666',
        fontFamily: 'PlusR',
        padding: 20,
    },
    cancelButton: {
        backgroundColor: '#f44336',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'PlusSB',
    },
});

