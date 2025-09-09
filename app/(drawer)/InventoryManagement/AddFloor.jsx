import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // <-- Import useNavigation
import { Ionicons } from '@expo/vector-icons'; // <-- Import Ionicons

const AddFloor = () => {
    const { propertyData } = useLocalSearchParams();
    const [property, setProperty] = useState(null);
    const [floorNumber, setFloorNumber] = useState('');
    const [blockName, setBlockName] = useState('');
    const [amenities, setAmenities] = useState('');
    const navigation = useNavigation(); // <-- Initialize navigation

    useEffect(() => {
        if (propertyData) {
            try {
                const parsedData = JSON.parse(propertyData);
                setProperty(parsedData);
            } catch (e) {
                console.error("Failed to parse property data:", e);
            }
        }
    }, [propertyData]);

    const handleSubmit = () => {
        if (!floorNumber || !blockName) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        const payload = {
            parentProperty: property,
            floorNumber,
            blockName,
            amenities,
        };

        console.log('Submitting Floor Data:', payload);
        Alert.alert('Success', 'Floor data submitted! Check the console for details.');

        setFloorNumber('');
        setBlockName('');
        setAmenities('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Add New Floor</Text>
                {property ? (
                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailTitle}>Parent Property Details:</Text>
                        <Text style={styles.detailText}>Project: {property.projectName}</Text>
                        <Text style={styles.detailText}>Builder: {property.builderName}</Text>
                        <Text style={styles.detailText}>Address: {property.address}</Text>
                    </View>
                ) : (
                    <Text>Loading property details...</Text>
                )}
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Floor Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={floorNumber}
                        onChangeText={setFloorNumber}
                        keyboardType="numeric"
                        placeholder="e.g., 1, 2, 3"
                    />
                    <Text style={styles.label}>Block Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={blockName}
                        onChangeText={setBlockName}
                        placeholder="e.g., Block A, Phase 1"
                    />
                    <Text style={styles.label}>Amenities</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={amenities}
                        onChangeText={setAmenities}
                        multiline
                        numberOfLines={4}
                        placeholder="List amenities available on this floor (e.g., gym, lounge)"
                    />
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>Save Floor</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20
    },
    header:
    {
        paddingHorizontal: 1,
        paddingTop: 10,
        paddingBottom: 20
    },
    content:
    {
        flex: 1
    },
    title:
    {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333', marginBottom: 20,
        textAlign: 'center'
    },
    detailsContainer:
    {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#5aaf57',
        elevation: 2
    },
    detailTitle:
    {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#555'
    },
    detailText:
    {
        fontSize: 14,
        color: '#777',
        lineHeight: 20
    },
    formContainer:
    {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 2
    },
    label:
    {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        marginTop: 10
    },
    input:
    {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: '#333'
    },
    saveButton:
    {
        marginTop: 30,
        backgroundColor: '#5aaf57',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    saveButtonText:
    {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
});


export default AddFloor;