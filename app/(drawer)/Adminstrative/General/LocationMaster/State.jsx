import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import useGeneral from '../../../../../hooks/useGeneral';

export default function State() {
  const navigation = useNavigation();
  const {
    getAllCountries,
    getAllStates,
    saveState,
    updateState,
    deleteState,
    countries,
    states: apiStates,
    loading,
    error,
    success,
  } = useGeneral();

  const [formData, setFormData] = useState({
    stateName: '',
    stateCode: '',
    countryId: '',
  });

  const [editing, setEditing] = useState(null);
  const [states, setStates] = useState([]);

  // Fetch countries and states on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update local states when apiStates changes
  useEffect(() => {
    if (apiStates && Array.isArray(apiStates)) {
      setStates(apiStates);
    }
  }, [apiStates]);

  const loadInitialData = async () => {
    try {
      await getAllCountries();
      await getAllStates();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.stateName.trim() || !formData.stateCode.trim() || !formData.countryId) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing state
        await updateState(editing.id, formData);
        Alert.alert('Success', 'State updated successfully!');
        setEditing(null);
      } else {
        // Add new state
        await saveState(formData);
        Alert.alert('Success', 'State added successfully!');
      }

      // Reset form and reload data
      setFormData({
        stateName: '',
        stateCode: '',
        countryId: '',
      });
      await getAllStates();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save state');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      stateName: item.state || '',
      stateCode: item.stateCode || '',
      countryId: item.country?.id || '',
    });
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete State', 'Are you sure you want to delete this state?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteState(id);
            Alert.alert('Success', 'State deleted successfully!');
            await getAllStates();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete state');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      stateName: '',
      stateCode: '',
      countryId: '',
    });
  };

  // Helper function to get country name by ID
  const getCountryName = (countryId) => {
    const country = countries?.find(c => c.id === countryId);
    return country?.country || 'N/A';
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

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5aaf57" />
          </View>
        )}

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
                  selectedValue={formData.countryId}
                  onValueChange={(value) => handleInputChange('countryId', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Country" value="" />
                  {countries && countries.map((country) => (
                    <Picker.Item key={country.id} label={country.country} value={country.id} />
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
                {states && states.length > 0 ? (
                  states.map((item, idx) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: 60 }]}>{idx + 1}</Text>
                      <Text style={[styles.tableCell, { width: 140 }]}>{item.state || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: 80 }]}>{item.stateCode || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: 120 }]}>{getCountryName(item.country?.id)}</Text>
                      <View style={[styles.actionCell, { width: 100 }]}>
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
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No states found</Text>
                  </View>
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyRow: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: 14,
  },
});
