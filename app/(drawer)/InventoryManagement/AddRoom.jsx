import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AddRoom = () => {
    const { propertyData } = useLocalSearchParams();
    const [property, setProperty] = useState(null);
    const [roomNumber, setRoomNumber] = useState('');
    const [roomType, setRoomType] = useState('');
    const navigation = useNavigation();

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
        if (!roomNumber || !roomType) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        const payload = {
            parentProperty: property,
            roomNumber,
            roomType,
        };

        console.log('Submitting Room Data:', payload);
        Alert.alert('Success', 'Room data submitted! Check the console for details.');

        setRoomNumber('');
        setRoomType('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Add New Room</Text>
                {property && (
                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailTitle}>Parent Property Details:</Text>
                        <Text style={styles.detailText}>Project: {property.projectName}</Text>
                        <Text style={styles.detailText}>Builder: {property.builderName}</Text>
                        <Text style={styles.detailText}>Address: {property.address}</Text>
                    </View>
                )}
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Room Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={roomNumber}
                        onChangeText={setRoomNumber}
                        placeholder="e.g., 1, 2"
                    />
                    <Text style={styles.label}>Room Type *</Text>
                    <TextInput
                        style={styles.input}
                        value={roomType}
                        onChangeText={setRoomType}
                        placeholder="e.g., Bedroom, Living Room"
                    />
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>Save Room</Text>
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
        padding: wp('5%')
    },
    header:
    {
        paddingHorizontal: wp('0.5%'),
        paddingTop: hp('1.2%'),
        paddingBottom: hp('2.5%')
    },
    content:
    {
        flex: 1
    },
    title:
    {
        fontSize: wp('6.8%'),
        fontWeight: 'bold',
        color: '#333', marginBottom: hp('2.5%'),
        textAlign: 'center'
    },
    detailsContainer:
    {
        backgroundColor: '#fff',
        padding: wp('4%'),
        borderRadius: wp('2.5%'),
        marginBottom: hp('2.5%'),
        borderLeftWidth: wp('1%'),
        borderLeftColor: '#5aaf57',
        elevation: 2
    },
    detailTitle:
    {
        fontSize: wp('4.5%'),
        fontWeight: 'bold',
        marginBottom: hp('0.6%'),
        color: '#555'
    },
    detailText:
    {
        fontSize: wp('3.5%'),
        color: '#777',
        lineHeight: hp('2.5%')
    },
    formContainer:
    {
        backgroundColor: '#fff',
        padding: wp('5%'),
        borderRadius: wp('2.5%'),
        elevation: 2
    },
    label:
    {
        fontSize: wp('4%'),
        fontWeight: '600',
        color: '#333',
        marginBottom: hp('0.6%'),
        marginTop: hp('1.2%')
    },
    input:
    {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: wp('2%'),
        padding: wp('2.5%'),
        fontSize: wp('4%'),
        color: '#333'
    },
    saveButton:
    {
        marginTop: hp('3.7%'),
        backgroundColor: '#5aaf57',
        padding: hp('2%'),
        borderRadius: wp('2.5%'),
        alignItems: 'center'
    },
    saveButtonText:
    {
        color: '#fff',
        fontSize: wp('4.8%'),
        fontWeight: 'bold'
    },
});



export default AddRoom;