import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useHr from '../../../../../hooks/useHr';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function EmployeeType() {
  const navigation = useNavigation();
  const {
    getAllEmployeeTypes,
    getEmployeeTypeById,
    addEmployeeType,
    updateEmployeeType,
    deleteEmployeeType,
    employeeTypes,
    loading
  } = useHr();

  const [employeeTypeName, setEmployeeTypeName] = useState('');
  const [codeApplicable, setCodeApplicable] = useState(false);
  const [editing, setEditing] = useState(null);

  // Fetch employee types on component mount
  useEffect(() => {
    const fetchEmployeeTypes = async () => {
      try {
        await getAllEmployeeTypes();
      } catch (error) {
        console.error('Error fetching employee types:', error);
      }
    };

    fetchEmployeeTypes();
  }, []);

  const fetchEmployeeTypes = async () => {
    try {
      await getAllEmployeeTypes();
    } catch (error) {
      console.error('Error fetching employee types:', error);
    }
  };

  const handleSubmit = async () => {
    if (!employeeTypeName.trim()) {
      Alert.alert('Validation Error', 'Please enter employee type name!');
      return;
    }

    try {
      if (editing) {
        // Update existing employee type
        await updateEmployeeType(editing.id, employeeTypeName, codeApplicable);
        Alert.alert('Success', 'Employee type updated successfully!');
        setEditing(null);
      } else {
        // Add new employee type
        await addEmployeeType(employeeTypeName, codeApplicable);
        Alert.alert('Success', 'Employee type added successfully!');
      }

      // Reset form and refresh list
      setEmployeeTypeName('');
      setCodeApplicable(false);
      await fetchEmployeeTypes();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save employee type');
    }
  };

  const handleEdit = (item) => {
    // Use data from the list instead of fetching by ID to avoid Hibernate proxy issues
    setEmployeeTypeName(item.employeeType);
    setCodeApplicable(item.employeeCodeGenerate);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Employee Type', 'Are you sure you want to delete this employee type?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEmployeeType(id);
            Alert.alert('Success', 'Employee type deleted successfully!');
            await fetchEmployeeTypes();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete employee type');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setEmployeeTypeName('');
    setCodeApplicable(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Employee Type</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Employee Type Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Employee Type' : 'Configure Employee Type'}
            </Text>

            {/* Employee Type Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Employee Type Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={employeeTypeName}
                onChangeText={setEmployeeTypeName}
                placeholder="Enter employee type name"
              />
            </View>

            {/* Code Applicable */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Code Applicable</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setCodeApplicable(true)}
                >
                  <View style={styles.radioCircle}>
                    {codeApplicable === true && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => setCodeApplicable(false)}
                >
                  <View style={styles.radioCircle}>
                    {codeApplicable === false && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
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

          {/* Existing Employee Types Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Employee Types</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Employee Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Code Applicable</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading employee types...</Text>
              </View>
            ) : employeeTypes.length > 0 ? (
              employeeTypes.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{idx + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.employeeType}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{item.employeeCodeGenerate ? 'Yes' : 'No'}</Text>
                  <View style={[styles.actionCell, { flex: 1 }]}>
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
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No employee types found</Text>
              </View>
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
    width: wp('35%'),
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
  radioContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: wp('5%'),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  radioCircle: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    borderWidth: 2,
    borderColor: '#5aaf57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#5aaf57',
  },
  radioText: {
    color: '#333',
    fontFamily: 'PlusR',
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
  emptyState: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
  },
  disabledButton: {
    opacity: 0.6,
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
});
