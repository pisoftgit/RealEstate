import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useHr from '../../../../../hooks/useHr';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Department() {
  const navigation = useNavigation();
  const { getAllDepartments, addDepartment, updateDepartment, deleteDepartment, departments, loading, error, success } = useHr();

  const [departmentName, setDepartmentName] = useState('');
  const [editing, setEditing] = useState(null);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        await getAllDepartments();
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      await getAllDepartments();
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) {
      Alert.alert('Validation Error', 'Please enter department name!');
      return;
    }

    try {
      if (editing) {
        // Update existing department
        await updateDepartment(editing.id, departmentName);
        Alert.alert('Success', 'Department updated successfully!');
        setEditing(null);
      } else {
        // Add new department
        await addDepartment(departmentName);
        Alert.alert('Success', 'Department added successfully!');
      }

      // Reset form and refresh department list
      setDepartmentName('');
      await fetchDepartments();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save department');
    }
  };

  const handleEdit = (item) => {
    setDepartmentName(item.department);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Department', 'Are you sure you want to delete this department?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDepartment(id);
            Alert.alert('Success', 'Department deleted successfully!');
            await fetchDepartments();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete department');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setDepartmentName('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Department</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Department Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Department' : 'Configure Department'}
            </Text>

            {/* Department Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Department Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={departmentName}
                onChangeText={setDepartmentName}
                placeholder="Enter department name"
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

          {/* Existing Departments Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Departments</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Department Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading departments...</Text>
              </View>
            ) : departments.length > 0 ? (
              departments.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.department}</Text>
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
                <Text style={styles.emptyStateText}>No departments found</Text>
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
