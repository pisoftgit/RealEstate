import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useHoliday from '../../../../../hooks/useHoliday';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function HolidayType() {
  const navigation = useNavigation();
  const { getAllHolidayTypes, saveHolidayType, updateHolidayType, deleteHolidayType, holidayTypes, loading } = useHoliday();

  const [holidayName, setHolidayName] = useState('');
  const [editing, setEditing] = useState(null);

  // Fetch holiday types on component mount
  useEffect(() => {
    fetchHolidayTypes();
  }, []);

  const fetchHolidayTypes = async () => {
    try {
      await getAllHolidayTypes();
    } catch (error) {
      console.error('Error fetching holiday types:', error);
    }
  };

  const handleSubmit = async () => {
    if (!holidayName.trim()) {
      Alert.alert('Validation Error', 'Please enter holiday type!');
      return;
    }

    try {
      if (editing) {
        // Update existing holiday type
        const payload = {
          id: editing.id,
          holidayName: holidayName
        };
        await updateHolidayType(payload);
        Alert.alert('Success', 'Holiday type updated successfully!');
        setEditing(null);
      } else {
        // Add new holiday type
        const payload = {
          holidayName: holidayName
        };
        await saveHolidayType(payload);
        Alert.alert('Success', 'Holiday type added successfully!');
      }

      // Reset form and refresh list
      setHolidayName('');
      await fetchHolidayTypes();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save holiday type');
    }
  };

  const handleEdit = (item) => {
    setHolidayName(item.holidayName);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Holiday Type', 'Are you sure you want to delete this holiday type?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHolidayType(id);
            Alert.alert('Success', 'Holiday type deleted successfully!');
            await fetchHolidayTypes();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete holiday type');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setHolidayName('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Holiday Type</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Holiday Type Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Holiday Type' : 'Configure Holiday Type'}
            </Text>

            {/* Holiday Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Holiday Type <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={holidayName}
                onChangeText={setHolidayName}
                placeholder="Enter holiday type"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button (shown only when editing) */}
            {editing && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing Holiday Types Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Holiday Types</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Holiday Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            <ScrollView style={styles.tableBody}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#5aaf57" />
                  <Text style={styles.loadingText}>Loading holiday types...</Text>
                </View>
              ) : holidayTypes && holidayTypes.length > 0 ? (
                holidayTypes.map((item, index) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.holidayName}</Text>
                    <View style={[styles.actionCell, { flex: 1 }]}>
                      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                        <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                        <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No holiday types found</Text>
                </View>
              )}
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
    marginBottom: hp('1.5%'),
  },
  label: {
    color: '#333',
    fontFamily: 'PlusR',
    marginBottom: hp('0.8%'),
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: wp('3%'),
    fontSize: hp('1.7%'),
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
  disabledButton: {
    opacity: 0.6,
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
  tableBody: {
    maxHeight: hp('50%'),
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
    gap: wp('2%'),
  },
  actionButton: {
    padding: wp('1%'),
  },
  loadingContainer: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('1%'),
    color: '#666',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
  emptyContainer: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
});
