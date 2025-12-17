import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import useLeave from '../../../../../hooks/useLeave';

export default function LeaveStatus() {
  const navigation = useNavigation();
  const { getAllLeaveStatuses, saveLeaveStatus, updateLeaveStatus, deleteLeaveStatus, leaveStatuses, loading } = useLeave();

  const [leaveStatusName, setLeaveStatusName] = useState('');
  const [initialStatus, setInitialStatus] = useState(true);
  const [editing, setEditing] = useState(null);

  // Fetch leave statuses on component mount
  useEffect(() => {
    fetchLeaveStatuses();
  }, []);

  const fetchLeaveStatuses = async () => {
    try {
      await getAllLeaveStatuses();
    } catch (error) {
      console.error('Error fetching leave statuses:', error);
    }
  };

  const handleSubmit = async () => {
    if (!leaveStatusName.trim()) {
      Alert.alert('Validation Error', 'Please enter leave status!');
      return;
    }

    try {
      if (editing) {
        // Update existing leave status
        const payload = {
          id: editing.id,
          name: leaveStatusName,
          initialStatus: initialStatus
        };
        await updateLeaveStatus(payload);
        Alert.alert('Success', 'Leave status updated successfully!');
        setEditing(null);
      } else {
        // Add new leave status
        const payload = {
          name: leaveStatusName,
          initialStatus: initialStatus
        };
        await saveLeaveStatus(payload);
        Alert.alert('Success', 'Leave status added successfully!');
      }

      // Reset form and refresh list
      setLeaveStatusName('');
      setInitialStatus(true);
      await fetchLeaveStatuses();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save leave status');
    }
  };

  const handleEdit = (item) => {
    setLeaveStatusName(item.name);
    setInitialStatus(item.initialStatus);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Leave Status', 'Are you sure you want to delete this leave status?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLeaveStatus(id);
            Alert.alert('Success', 'Leave status deleted successfully!');
            await fetchLeaveStatuses();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete leave status');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setLeaveStatusName('');
    setInitialStatus(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Leave Status</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Leave Status Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Leave Status' : 'Configure Leave Status'}
            </Text>

            {/* Leave Status */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Leave Status <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={leaveStatusName}
                onChangeText={setLeaveStatusName}
                placeholder="Enter leave status"
              />
            </View>

            {/* Initial Status Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Initial Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={initialStatus}
                  onValueChange={(itemValue) => setInitialStatus(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Yes" value={true} />
                  <Picker.Item label="No" value={false} />
                </Picker>
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

          {/* Existing Leave Statuses Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Leave Statuses</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Leave Status</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Initial Status</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading leave statuses...</Text>
              </View>
            ) : leaveStatuses && leaveStatuses.length > 0 ? (
              leaveStatuses.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.initialStatus ? 'Yes' : 'No'}</Text>
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
                <Text style={styles.emptyStateText}>No leave statuses found</Text>
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
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
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
