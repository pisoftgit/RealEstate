import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import useGeneral from '../../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function District() {
  const navigation = useNavigation();
  const {
    getAllCountries,
    getStatesByCountryId,
    getAllDistricts,
    saveDistrict,
    updateDistrict,
    deleteDistrict,
    countries,
    states: statesData,
    districts: apiDistricts,
    loading,
    error,
    success,
  } = useGeneral();

  const [formData, setFormData] = useState({
    countryId: '',
    stateId: '',
    districtName: '',
    districtCode: '',
  });

  const [editing, setEditing] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);

  // Fetch countries and districts on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update local districts when apiDistricts changes
  useEffect(() => {
    if (apiDistricts && Array.isArray(apiDistricts)) {
      setDistricts(apiDistricts);
    }
  }, [apiDistricts]);

  // Update filtered states when country changes or statesData changes
  useEffect(() => {
    if (statesData && Array.isArray(statesData)) {
      setFilteredStates(statesData);
    }
  }, [statesData]);

  const loadInitialData = async () => {
    try {
      await getAllCountries();
      await getAllDistricts();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load data');
    }
  };

  const handleInputChange = async (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset state when country changes
      if (field === 'countryId') {
        newData.stateId = '';
        // Fetch states for the selected country
        if (value) {
          getStatesByCountryId(value).catch(err => {
            console.error('Error fetching states:', err);
          });
        } else {
          setFilteredStates([]);
        }
      }
      return newData;
    });
  };

  const handleSubmit = async () => {
    if (!formData.countryId || !formData.stateId || !formData.districtName.trim() || !formData.districtCode.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing district
        await updateDistrict(editing.id, formData);
        Alert.alert('Success', 'District updated successfully!');
        setEditing(null);
      } else {
        // Add new district
        await saveDistrict(formData);
        Alert.alert('Success', 'District added successfully!');
      }

      // Reset form and reload data
      setFormData({
        countryId: '',
        stateId: '',
        districtName: '',
        districtCode: '',
      });
      setFilteredStates([]);
      await getAllDistricts();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save district');
    }
  };

  const handleEdit = async (item) => {
    // First load states for the country
    if (item.state?.country?.id) {
      try {
        await getStatesByCountryId(item.state.country.id);
      } catch (err) {
        console.error('Error loading states:', err);
      }
    }

    setFormData({
      countryId: item.state?.country?.id || '',
      stateId: item.state?.id || '',
      districtName: item.district || '',
      districtCode: item.districtCode || '',
    });
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete District', 'Are you sure you want to delete this district?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDistrict(id);
            Alert.alert('Success', 'District deleted successfully!');
            await getAllDistricts();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete district');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      countryId: '',
      stateId: '',
      districtName: '',
      districtCode: '',
    });
    setFilteredStates([]);
  };

  // Helper functions to get names by ID
  const getCountryName = (countryId) => {
    const country = countries?.find(c => c.id === countryId);
    return country?.country || 'N/A';
  };

  const getStateName = (stateId) => {
    const state = statesData?.find(s => s.id === stateId);
    return state?.state || 'N/A';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>District</Text>
        </View>

        {loading && (
          <View style={[styles.loadingContainer, { padding: wp('5%') }]}>
            <ActivityIndicator size="large" color="#5aaf57" />
          </View>
        )}

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

            {/* State Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                State <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.stateId}
                  onValueChange={(value) => handleInputChange('stateId', value)}
                  style={styles.picker}
                  enabled={!!formData.countryId}
                >
                  <Picker.Item label="Select State" value="" />
                  {filteredStates && filteredStates.map((state) => (
                    <Picker.Item key={state.id} label={state.state} value={state.id} />
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
                  <Text style={[styles.tableHeaderText, { width: wp('15%') }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { width: wp('35%') }]}>District Name</Text>
                  <Text style={[styles.tableHeaderText, { width: wp('20%') }]}>Code</Text>
                  <Text style={[styles.tableHeaderText, { width: wp('29%') }]}>State</Text>
                  <Text style={[styles.tableHeaderText, { width: wp('29%') }]}>Country</Text>
                  <Text style={[styles.tableHeaderText, { width: wp('25%') }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {districts && districts.length > 0 ? (
                  districts.map((item, idx) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: wp('15%') }]}>{idx + 1}</Text>
                      <Text style={[styles.tableCell, { width: wp('35%') }]}>{item.district || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: wp('20%') }]}>{item.districtCode || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: wp('29%') }]}>{item.state?.state || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: wp('29%') }]}>{item.state?.country?.country || 'N/A'}</Text>
                      <View style={[styles.actionCell, { width: wp('25%') }]}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                          <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                          <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No districts found</Text>
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
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: wp('5%') },
  header: {
    paddingVertical: hp('2%'),
    marginBottom: hp('1%'),
  },
  title: {
    fontSize: hp('4%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: wp('4%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: hp('2.2%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.5%'),
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  label: {
    width: wp('30%'),
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
    padding: wp('2%'),
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
    height: hp('5.5%'),
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: hp('1.2%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: wp('2%'),
    borderRadius: 8,
    marginBottom: hp('0.5%'),
  },
  tableHeaderText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'PlusSB',
    fontSize: hp('1.7%'),
  },
  tableRow: {
    flexDirection: 'row',
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: hp('1.6%'),
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp('3%'),
  },
  iconBtn: {
    padding: wp('1%'),
  },
  emptyRow: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
});
