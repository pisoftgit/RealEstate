import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useHr from '../../../../../hooks/useHr';
import { Picker } from '@react-native-picker/picker';

export default function Designation() {
  const navigation = useNavigation();
  const { 
    getAllDepartments, 
    getAllDesignations, 
    addDesignation, 
    updateDesignation, 
    deleteDesignation, 
    departments, 
    designations, 
    loading 
  } = useHr();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [designationName, setDesignationName] = useState('');
  const [editing, setEditing] = useState(null);

  // Fetch departments and designations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllDepartments();
        await getAllDesignations();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await getAllDepartments();
      await getAllDesignations();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDepartmentId) {
      Alert.alert('Validation Error', 'Please select department!');
      return;
    }

    if (!designationName.trim()) {
      Alert.alert('Validation Error', 'Please enter designation name!');
      return;
    }

    try {
      if (editing) {
        // Update existing designation
        await updateDesignation(editing.id, selectedDepartmentId, designationName);
        Alert.alert('Success', 'Designation updated successfully!');
        setEditing(null);
      } else {
        // Add new designation
        await addDesignation(selectedDepartmentId, designationName);
        Alert.alert('Success', 'Designation added successfully!');
      }

      // Reset form and refresh list
      setSelectedDepartmentId('');
      setDesignationName('');
      await fetchData();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save designation');
    }
  };

  const handleEdit = (item) => {
    setSelectedDepartmentId(item.department.id);
    setDesignationName(item.name);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Designation', 'Are you sure you want to delete this designation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDesignation(id);
            Alert.alert('Success', 'Designation deleted successfully!');
            await fetchData();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete designation');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setSelectedDepartmentId('');
    setDesignationName('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Designation</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Designation Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Designation' : 'Configure Designation'}
            </Text>

            {/* Department Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Department <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedDepartmentId}
                  onValueChange={(itemValue) => setSelectedDepartmentId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Department" value="" />
                  {departments.map((dept) => (
                    <Picker.Item key={dept.id} label={dept.department} value={dept.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Designation Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Designation Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={designationName}
                onChangeText={setDesignationName}
                placeholder="Enter designation name"
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

          {/* Existing Designations Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Designations</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Department</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Designation</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading designations...</Text>
              </View>
            ) : designations.length > 0 ? (
              designations.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{idx + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.department.department}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
                  <View style={[styles.actionCell, { flex: 1 }]}>
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
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No designations found</Text>
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
  dropdownInput: {
    color: '#333',
    fontFamily: 'PlusR',
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
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: 14,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  picker: {
    color: '#333',
    fontFamily: 'PlusR',
  },
  disabledButton: {
    opacity: 0.6,
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
});
