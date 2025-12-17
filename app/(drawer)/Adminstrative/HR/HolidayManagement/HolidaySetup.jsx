import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import useHoliday from '../../../../../hooks/useHoliday';

export default function HolidaySetup() {
  const navigation = useNavigation();
  const { 
    getAllHolidayTypes, 
    getAllDurations, 
    getAllHolidays,
    saveHoliday,
    updateHoliday,
    deleteHoliday,
    holidayTypes, 
    durations, 
    holidays,
    loading 
  } = useHoliday();

  const [holidayType, setHolidayType] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState(new Date());
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        getAllHolidayTypes(),
        getAllDurations(),
        getAllHolidays()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!holidayType || holidayType === '') {
      Alert.alert('Validation Error', 'Please select holiday type!');
      return;
    }

    if (!holidayName.trim()) {
      Alert.alert('Validation Error', 'Please enter holiday name!');
      return;
    }

    if (!status || status === '') {
      Alert.alert('Validation Error', 'Please select status!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        holidayName: holidayName.trim(),
        holidayTypeId: parseInt(holidayType),
        durationId: parseInt(status),
        holidayDate: date.toISOString().split('T')[0],
        day: day ? parseInt(day) : null,
        month: month || ""
      };

      if (editing) {
        await updateHoliday(editing.id, payload);
        Alert.alert('Success', 'Holiday updated successfully!');
        setEditing(null);
      } else {
        await saveHoliday(payload);
        Alert.alert('Success', 'Holiday added successfully!');
      }

      // Reset form and refresh list
      setHolidayType('');
      setHolidayName('');
      setStatus('');
      setDate(new Date());
      setDay('');
      setMonth('');
      await fetchAllData();
    } catch (error) {
      console.error('Error saving holiday:', error);
      Alert.alert('Error', error.message || 'Failed to save holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setHolidayType(item.holidayTypeId?.toString() || '');
    setHolidayName(item.holidayName);
    setStatus(item.durationId?.toString() || '');
    setDay(item.day?.toString() || '');
    setMonth(item.month || '');
    if (item.holidayDate) {
      setDate(new Date(item.holidayDate));
    }
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Holiday', 'Are you sure you want to delete this holiday?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHoliday(id);
            Alert.alert('Success', 'Holiday deleted successfully!');
            await fetchAllData();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete holiday');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setHolidayType('');
    setHolidayName('');
    setStatus('');
    setDate(new Date());
    setDay('');
    setMonth('');
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getHolidayTypeName = (typeId) => {
    const type = holidayTypes?.find(t => t.id === typeId);
    return type ? type.holidayName : 'Unknown';
  };

  const getStatusName = (statusId) => {
    const duration = durations?.find(d => d.id === parseInt(statusId));
    return duration ? duration.status : 'Unknown';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Holiday Setup</Text>
        </View>

        {initialLoading ? (
          <View style={styles.fullScreenLoading}>
            <ActivityIndicator size="large" color="#5aaf57" />
            <Text style={styles.loadingText}>Loading holiday data...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Configure Holiday Setup Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {editing ? 'Edit Holiday Setup' : 'Configure Holiday Setup'}
              </Text>

              {/* Holiday Type Dropdown */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  Holiday Type <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={holidayType}
                    onValueChange={(itemValue) => setHolidayType(itemValue)}                  style={styles.picker}
                >
                  <Picker.Item label="--- Select Holiday Type ---" value="" />
                  {holidayTypes && Array.isArray(holidayTypes) && holidayTypes.length > 0 ? (
                    holidayTypes.map((type) => (
                      <Picker.Item 
                        key={type.id} 
                        label={type.holidayName} 
                        value={type.id.toString()} 
                      />
                    ))
                  ) : null}
                </Picker>
                </View>
              </View>

            {/* Holiday Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Holiday Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={holidayName}
                onChangeText={setHolidayName}
                placeholder="Enter holiday name"
              />
            </View>

            {/* Status Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={status}
                  onValueChange={(itemValue) => setStatus(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="--- Select Status ---" value="" />
                  {durations && Array.isArray(durations) && durations.length > 0 ? (
                    durations.map((duration) => (
                      <Picker.Item 
                        key={duration.id} 
                        label={`${duration.status} (${duration.salaryDeduction}%)`}
                        value={duration.id.toString()} 
                      />
                    ))
                  ) : null}
                </Picker>
              </View>
            </View>

            {/* Date Picker */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-GB')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, (loading || isSubmitting) && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={loading || isSubmitting}
            >
              {(loading || isSubmitting) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
              )}
            </TouchableOpacity>

            {/* Reset/Cancel Button */}
            {editing ? (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.resetButton} onPress={handleCancel}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Previously Holidays Added Data Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Previously Holidays Added Data</Text>
            
            {/* Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>S.No</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Holiday Type</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Holiday Name</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Status</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Date</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>National Holiday</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Manage</Text>
                </View>

                {/* Table Rows */}
                {(loading || isSubmitting) ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#5aaf57" />
                    <Text style={styles.loadingText}>Loading holidays...</Text>
                  </View>
                ) : holidays && Array.isArray(holidays) && holidays.length > 0 ? (
                  holidays.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: 60 }]}>{index + 1}</Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>{item.holidayType || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>{item.holidayName}</Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>{item.duration || 'N/A'}</Text>
                      <Text style={[styles.tableCell, { width: 120 }]}>
                        {item.holidayDate ? formatDate(item.holidayDate) : ''}
                      </Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>
                        {item.day && item.month ? `${item.day}-${item.month}` : ''}
                      </Text>
                      <View style={[styles.actionCell, { width: 100 }]}>
                        <TouchableOpacity 
                          onPress={() => handleEdit(item)} 
                          style={styles.actionButton}
                          disabled={isSubmitting}
                        >
                          <Feather name="edit" size={18} color="#5aaf57" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDelete(item.id)} 
                          style={styles.actionButton}
                          disabled={isSubmitting}
                        >
                          <Ionicons name="trash" size={18} color="#d32f2f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No holidays found</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
        )}
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
  fullScreenLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
    marginBottom: 12,
  },
  label: {
    color: '#333',
    fontFamily: 'PlusR',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  dateText: {
    fontSize: 14,
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
  resetButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  disabledButton: {
    opacity: 0.6,
  },
  table: {
    minWidth: '100%',
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
    fontSize: 13,
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
    fontSize: 12,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontFamily: 'PlusR',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: 14,
  },
});
