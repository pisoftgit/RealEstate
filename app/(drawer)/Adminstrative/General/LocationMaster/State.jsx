import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function State() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    stateName: '',
    stateCode: '',
    country: '',
  });

  const [editing, setEditing] = useState(null);

  // Sample countries for dropdown
  const countries = [
    { id: 1, name: 'India' },
    { id: 2, name: 'United States' },
    { id: 3, name: 'United Kingdom' },
    { id: 4, name: 'Canada' },
    { id: 5, name: 'Australia' },
  ];

  const [states, setStates] = useState([
    { id: 1, name: 'Maharashtra', code: 'MH', country: 'India' },
    { id: 2, name: 'Karnataka', code: 'KA', country: 'India' },
    { id: 3, name: 'California', code: 'CA', country: 'United States' },
    { id: 4, name: 'Texas', code: 'TX', country: 'United States' },
    { id: 5, name: 'Ontario', code: 'ON', country: 'Canada' },
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.stateName.trim() || !formData.stateCode.trim() || !formData.country) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing state
        setStates(prev =>
          prev.map(item =>
            item.id === editing.id
              ? {
                  ...item,
                  name: formData.stateName,
                  code: formData.stateCode,
                  country: formData.country,
                }
              : item
          )
        );
        Alert.alert('Success', 'State updated successfully!');
        setEditing(null);
      } else {
        // Add new state
        const newState = {
          id: states.length + 1,
          name: formData.stateName,
          code: formData.stateCode,
          country: formData.country,
        };
        setStates(prev => [...prev, newState]);
        Alert.alert('Success', 'State added successfully!');
      }

      // Reset form
      setFormData({
        stateName: '',
        stateCode: '',
        country: '',
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to save state');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      stateName: item.name,
      stateCode: item.code,
      country: item.country,
    });
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete State', 'Are you sure you want to delete this state?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setStates(prev => prev.filter(item => item.id !== id));
          Alert.alert('Success', 'State deleted successfully!');
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      stateName: '',
      stateCode: '',
      country: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>State</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure State Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit State' : 'Configure State'}
            </Text>

            {/* Country Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Country <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Country" value="" />
                  {countries.map((country) => (
                    <Picker.Item key={country.id} label={country.name} value={country.name} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* State Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                State Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.stateName}
                onChangeText={(value) => handleInputChange('stateName', value)}
                placeholder="Enter state name"
              />
            </View>

            {/* State Code */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                State Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.stateCode}
                onChangeText={(value) => handleInputChange('stateCode', value)}
                placeholder="Enter state code (e.g., MH, CA)"
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
            </TouchableOpacity>

            {/* Cancel Button (shown only when editing) */}
            {editing && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing State Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing State</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { width: 140 }]}>State Name</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Code</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Country</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {states.map((item, idx) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: 60 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { width: 140 }]}>{item.name}</Text>
                    <Text style={[styles.tableCell, { width: 80 }]}>{item.code}</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>{item.country}</Text>
                    <View style={[styles.actionCell, { width: 100 }]}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={18} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash" size={18} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: {
    paddingVertical: 18,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: 16,
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
    width: 120,
    color: '#333',
    fontFamily: 'PlusR',
  },
  required: {
    color: '#e74c3c',
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
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: '#333',
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
  cancelButton: {
    backgroundColor: '#666',
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderText: {
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
    alignItems: 'center',
  },
  tableCell: {
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
