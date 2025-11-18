import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function District() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    country: '',
    state: '',
    districtName: '',
    districtCode: '',
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

  // Sample states for dropdown
  const statesData = [
    { id: 1, name: 'Maharashtra', country: 'India' },
    { id: 2, name: 'Karnataka', country: 'India' },
    { id: 3, name: 'California', country: 'United States' },
    { id: 4, name: 'Texas', country: 'United States' },
    { id: 5, name: 'Ontario', country: 'Canada' },
  ];

  // Filter states based on selected country
  const filteredStates = formData.country
    ? statesData.filter(state => state.country === formData.country)
    : [];

  const [districts, setDistricts] = useState([
    { id: 1, name: 'Mumbai', code: 'MUM', state: 'Maharashtra', country: 'India' },
    { id: 2, name: 'Pune', code: 'PUN', state: 'Maharashtra', country: 'India' },
    { id: 3, name: 'Bangalore Urban', code: 'BLR', state: 'Karnataka', country: 'India' },
    { id: 4, name: 'Los Angeles', code: 'LA', state: 'California', country: 'United States' },
    { id: 5, name: 'Houston', code: 'HOU', state: 'Texas', country: 'United States' },
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset state when country changes
      if (field === 'country') {
        newData.state = '';
      }
      return newData;
    });
  };

  const handleSubmit = () => {
    if (!formData.country || !formData.state || !formData.districtName.trim() || !formData.districtCode.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing district
        setDistricts(prev =>
          prev.map(item =>
            item.id === editing.id
              ? {
                  ...item,
                  name: formData.districtName,
                  code: formData.districtCode,
                  state: formData.state,
                  country: formData.country,
                }
              : item
          )
        );
        Alert.alert('Success', 'District updated successfully!');
        setEditing(null);
      } else {
        // Add new district
        const newDistrict = {
          id: districts.length + 1,
          name: formData.districtName,
          code: formData.districtCode,
          state: formData.state,
          country: formData.country,
        };
        setDistricts(prev => [...prev, newDistrict]);
        Alert.alert('Success', 'District added successfully!');
      }

      // Reset form
      setFormData({
        country: '',
        state: '',
        districtName: '',
        districtCode: '',
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to save district');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      country: item.country,
      state: item.state,
      districtName: item.name,
      districtCode: item.code,
    });
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete District', 'Are you sure you want to delete this district?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setDistricts(prev => prev.filter(item => item.id !== id));
          Alert.alert('Success', 'District deleted successfully!');
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      country: '',
      state: '',
      districtName: '',
      districtCode: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>District</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure District Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit District' : 'Configure District'}
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

            {/* State Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                State <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.state}
                  onValueChange={(value) => handleInputChange('state', value)}
                  style={styles.picker}
                  enabled={!!formData.country}
                >
                  <Picker.Item label="Select State" value="" />
                  {filteredStates.map((state) => (
                    <Picker.Item key={state.id} label={state.name} value={state.name} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* District Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                District Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.districtName}
                onChangeText={(value) => handleInputChange('districtName', value)}
                placeholder="Enter district name"
              />
            </View>

            {/* District Code */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                District Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.districtCode}
                onChangeText={(value) => handleInputChange('districtCode', value)}
                placeholder="Enter district code"
                autoCapitalize="characters"
                maxLength={5}
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

          {/* Existing District Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing District</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { width: 140 }]}>District Name</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Code</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>State</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Country</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {districts.map((item, idx) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: 60 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { width: 140 }]}>{item.name}</Text>
                    <Text style={[styles.tableCell, { width: 80 }]}>{item.code}</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>{item.state}</Text>
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
