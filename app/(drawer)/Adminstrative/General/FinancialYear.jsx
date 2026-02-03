import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import useGeneral from '../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function FinancialYear() {
  const navigation = useNavigation();
  const {
    getAllFinancialYears,
    saveFinancialYear,
    updateFinancialYear,
    deleteFinancialYear,
    financialYears: apiFinancialYears,
    loading,
    error
  } = useGeneral();

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    currentYear: false,
  });

  const [editing, setEditing] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  // Fetch financial years on component mount
  useEffect(() => {
    fetchFinancialYears();
  }, []);

  const fetchFinancialYears = async () => {
    try {
      setIsLoadingData(true);
      const data = await getAllFinancialYears();
      setFinancialYears(data || []);
    } catch (err) {
      console.error('Error fetching financial years:', err);
      Alert.alert('Error', 'Failed to fetch financial years');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.startDate.trim() || !formData.endDate.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing financial year
        const result = await updateFinancialYear(editing.id, formData);
        console.log('Update result:', result);
        Alert.alert('Success', 'Financial year updated successfully!');
        setEditing(null);
      } else {
        // Add new financial year
        const result = await saveFinancialYear(formData);
        console.log('Save result:', result);
        Alert.alert('Success', 'Financial year added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        currentYear: false,
      });
      setStartDateObj(new Date());
      setEndDateObj(new Date());

      // Refresh the list
      await fetchFinancialYears();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err?.message || error || 'Failed to save financial year';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      startDate: item.startDate,
      endDate: item.endDate,
      currentYear: item.currentYear,
    });

    // Set date objects for pickers
    if (item.startDate) {
      setStartDateObj(new Date(item.startDate));
    }
    if (item.endDate) {
      setEndDateObj(new Date(item.endDate));
    }

    setEditing(item);
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setStartDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('startDate', formattedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setEndDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('endDate', formattedDate);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Financial Year', 'Are you sure you want to delete this financial year?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteFinancialYear(id);
            console.log('Delete result:', result);
            Alert.alert('Success', 'Financial year deleted successfully!');
            // Refresh the list
            await fetchFinancialYears();
          } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err?.message || error || 'Failed to delete financial year';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Financial Year</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Financial Year Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Financial Year' : 'Configure Financial Year'}
            </Text>

            {/* Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="e.g. FY 2024-25"
              />
            </View>

            {/* Start Date */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Start Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={[styles.dateText, !formData.startDate && styles.placeholderText]}>
                  {formData.startDate || 'YYYY-MM-DD'}
                </Text>
                <Ionicons name="calendar-outline" size={hp('2.5%')} color="#666" />
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
              />
            )}

            {/* End Date */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                End Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={[styles.dateText, !formData.endDate && styles.placeholderText]}>
                  {formData.endDate || 'YYYY-MM-DD'}
                </Text>
                <Ionicons name="calendar-outline" size={hp('2.5%')} color="#666" />
              </TouchableOpacity>
            </View>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
              />
            )}

            {/* Is Current */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Current Year</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.currentYear ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => handleInputChange('currentYear', true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.currentYear ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !formData.currentYear ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => handleInputChange('currentYear', false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !formData.currentYear ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : editing ? 'Update' : 'Submit'}
              </Text>
            </TouchableOpacity>

            {editing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(null);
                  setFormData({
                    name: '',
                    startDate: '',
                    endDate: '',
                    currentYear: false,
                  });
                  setStartDateObj(new Date());
                  setEndDateObj(new Date());
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing Financial Year Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Financial Year</Text>

            {isLoadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading financial years...</Text>
              </View>
            ) : financialYears.length === 0 ? (
              <Text style={styles.emptyText}>No financial years found</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { width: wp('15%') }]}>S. No</Text>
                    <Text style={[styles.tableHeaderText, { width: wp('30%') }]}>Name</Text>
                    <Text style={[styles.tableHeaderText, { width: wp('30%') }]}>Start Date</Text>
                    <Text style={[styles.tableHeaderText, { width: wp('30%') }]}>End Date</Text>
                    <Text style={[styles.tableHeaderText, { width: wp('20%') }]}>Active</Text>
                    <Text style={[styles.tableHeaderText, { width: wp('25%') }]}>Action</Text>
                  </View>

                  {/* Table Rows */}
                  {financialYears.map((item, idx) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: wp('15%') }]}>{idx + 1}</Text>
                      <Text style={[styles.tableCell, { width: wp('30%') }]}>{item.name}</Text>
                      <Text style={[styles.tableCell, { width: wp('30%') }]}>{item.startDate}</Text>
                      <Text style={[styles.tableCell, { width: wp('30%') }]}>{item.endDate}</Text>
                      <View style={[styles.tableCell, { width: wp('20%') }]}>
                        <View
                          style={[
                            styles.statusBadge,
                            item.currentYear ? styles.statusBadgeActive : styles.statusBadgeInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              item.currentYear ? styles.statusTextActive : styles.statusTextInactive,
                            ]}
                          >
                            {item.currentYear ? 'Yes' : 'No'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.actionCell, { width: wp('25%') }]}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                          <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                          <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
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
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
  },
  dateText: {
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
  placeholderText: {
    color: '#999',
  },
  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#5aaf57',
  },
  toggleButtonInactive: {
    backgroundColor: '#f5f5f5',
  },
  toggleText: {
    fontFamily: 'PlusSB',
    fontSize: hp('1.7%'),
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleTextInactive: {
    color: '#666',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('3%'),
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusBadgeActive: {
    backgroundColor: '#d4edda',
  },
  statusBadgeInactive: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: hp('1.5%'),
    fontFamily: 'PlusSB',
  },
  statusTextActive: {
    color: '#155724',
  },
  statusTextInactive: {
    color: '#721c24',
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
  loadingContainer: {
    paddingVertical: hp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('1.5%'),
    fontSize: hp('2%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
  emptyText: {
    textAlign: 'center',
    padding: wp('5%'),
    fontSize: hp('2%'),
    color: '#999',
    fontFamily: 'PlusR',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
