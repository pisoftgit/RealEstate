import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useLeave } from '../../../../../hooks/useLeave';
import useHr from '../../../../../hooks/useHr';

const EarnedLeaves = () => {
  const navigation = useNavigation();
  
  // Earned Leave State
  const [earnedLeaveForm, setEarnedLeaveForm] = useState({
    designationId: '',
    employeeTypeId: '',
    eligibilityAfterDays: '',
    workingDays: '',
    numberOfLeaves: '',
  });
  const [editingEarnedLeave, setEditingEarnedLeave] = useState(null);

  const {
    earnedLeaves,
    loading: leaveLoading,
    error: leaveError,
    getAllEarnedLeaves,
    saveEarnedLeave,
    deleteEarnedLeave,
  } = useLeave();

  const {
    designations,
    employeeTypes,
    loading: hrLoading,
    getAllDesignations,
    getAllEmployeeTypes,
  } = useHr();

  const loading = leaveLoading || hrLoading;
  const error = leaveError;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          getAllEarnedLeaves(),
          getAllDesignations(),
          getAllEmployeeTypes(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Earned Leave Functions
  const handleEarnedLeaveSubmit = async () => {
    try {
      if (!earnedLeaveForm.designationId) {
        Alert.alert('Validation Error', 'Job Title is required');
        return;
      }
      if (!earnedLeaveForm.employeeTypeId) {
        Alert.alert('Validation Error', 'Employment Status is required');
        return;
      }
      if (!earnedLeaveForm.eligibilityAfterDays?.trim()) {
        Alert.alert('Validation Error', 'Eligibility After Days is required');
        return;
      }
      if (!earnedLeaveForm.workingDays?.trim()) {
        Alert.alert('Validation Error', 'Working Days is required');
        return;
      }
      if (!earnedLeaveForm.numberOfLeaves?.trim()) {
        Alert.alert('Validation Error', 'Number of Leaves is required');
        return;
      }

      const payload = {
        designationId: earnedLeaveForm.designationId,
        employeeTypeId: earnedLeaveForm.employeeTypeId,
        eligibilityAfterDays: earnedLeaveForm.eligibilityAfterDays.trim(),
        workingDays: earnedLeaveForm.workingDays.trim(),
        numberOfLeaves: earnedLeaveForm.numberOfLeaves.trim(),
      };

      if (editingEarnedLeave) {
        payload.id = editingEarnedLeave.id;
        await saveEarnedLeave(payload);
        Alert.alert('Success', 'Earned Leave updated successfully');
      } else {
        await saveEarnedLeave(payload);
        Alert.alert('Success', 'Earned Leave created successfully');
      }

      resetForm();
      await getAllEarnedLeaves();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save Earned Leave');
    }
  };

  const handleEditEarnedLeave = (earnedLeave) => {
    setEditingEarnedLeave(earnedLeave);
    setEarnedLeaveForm({
      designationId: earnedLeave.designationId?.toString() || '',
      employeeTypeId: earnedLeave.employeeTypeId?.toString() || '',
      eligibilityAfterDays: earnedLeave.eligibilityAfterDays?.toString() || '',
      workingDays: earnedLeave.workingDays?.toString() || '',
      numberOfLeaves: earnedLeave.numberOfLeaves?.toString() || '',
    });
  };

  const handleDeleteEarnedLeave = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Earned Leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEarnedLeave(id);
              Alert.alert('Success', 'Earned Leave deleted successfully');
              await getAllEarnedLeaves();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete Earned Leave');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setEarnedLeaveForm({
      designationId: '',
      employeeTypeId: '',
      eligibilityAfterDays: '',
      workingDays: '',
      numberOfLeaves: '',
    });
    setEditingEarnedLeave(null);
  };

  const getDesignationName = (id) => {
    const designation = designations?.find((d) => d.id === id);
    return designation?.name || 'N/A';
  };

  const getEmployeeTypeName = (id) => {
    const employeeType = employeeTypes?.find((et) => et.id === id);
    return employeeType?.employeeType || 'N/A';
  };

  if (loading && !earnedLeaves) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Menu Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Configure Earned Leave</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editingEarnedLeave ? 'Edit Earned Leave' : 'Configure Earned Leave'}
            </Text>

            {/* Job Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Job Title<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={earnedLeaveForm.designationId}
                  onValueChange={(value) =>
                    setEarnedLeaveForm({ ...earnedLeaveForm, designationId: value })
                  }
                  enabled={!loading}
                  style={styles.picker}
                >
                  <Picker.Item label="---Select Job Title---" value="" />
                  {designations?.map((designation) => (
                    <Picker.Item
                      key={designation.id}
                      label={designation.name || 'Unknown'}
                      value={designation.id?.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Employment Status */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Employment Status<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={earnedLeaveForm.employeeTypeId}
                  onValueChange={(value) =>
                    setEarnedLeaveForm({ ...earnedLeaveForm, employeeTypeId: value })
                  }
                  enabled={!loading}
                  style={styles.picker}
                >
                  <Picker.Item label="--- Select Employment Status ---" value="" />
                  {employeeTypes?.map((employeeType) => (
                    <Picker.Item
                      key={employeeType.id}
                      label={employeeType.employeeType || 'Unknown'}
                      value={employeeType.id?.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Eligibility After Days */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Eligibility After Days<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={earnedLeaveForm.eligibilityAfterDays}
                onChangeText={(text) =>
                  setEarnedLeaveForm({ ...earnedLeaveForm, eligibilityAfterDays: text })
                }
                placeholder="Enter Eligibility After Days"
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            {/* Working Days */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Working Days(for leave(s))<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={earnedLeaveForm.workingDays}
                onChangeText={(text) =>
                  setEarnedLeaveForm({ ...earnedLeaveForm, workingDays: text })
                }
                placeholder="Enter Working Days"
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Number of Leaves */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                No. of Leaves (after working days)<Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={earnedLeaveForm.numberOfLeaves}
                onChangeText={(text) =>
                  setEarnedLeaveForm({ ...earnedLeaveForm, numberOfLeaves: text })
                }
                placeholder="Enter Number of Leaves"
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleEarnedLeaveSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingEarnedLeave ? 'Update' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetForm}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Existing Earned Leaves Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Previously Earned Leave Added Data</Text>
            <ScrollView horizontal>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Designation</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Employment Status</Text>
                  <Text style={[styles.tableHeaderText, { width: 140 }]}>Eligibility</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Working days</Text>
                  <Text style={[styles.tableHeaderText, { width: 150 }]}>Leaves after working days</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Manage</Text>
                </View>

                {/* Table Body */}
                {earnedLeaves && earnedLeaves.length > 0 ? (
                  earnedLeaves.map((earnedLeave) => (
                    <View key={earnedLeave.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { width: 150 }]}>
                        {earnedLeave.designation || getDesignationName(earnedLeave.designationId)}
                      </Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>
                        {earnedLeave.employeeType || getEmployeeTypeName(earnedLeave.employeeTypeId)}
                      </Text>
                      <Text style={[styles.tableCell, { width: 140 }]}>
                        {earnedLeave.eligibilityAfterDays || 'N/A'}
                      </Text>
                      <Text style={[styles.tableCell, { width: 120 }]}>
                        {earnedLeave.workingDays || 'N/A'}
                      </Text>
                      <Text style={[styles.tableCell, { width: 150 }]}>
                        {earnedLeave.numberOfLeaves || 'N/A'}
                      </Text>
                      <View style={[styles.actionCell, { width: 100 }]}>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => handleEditEarnedLeave(earnedLeave)}
                            disabled={loading}
                          >
                            <Feather name="edit" size={18} color="#5aaf57" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => handleDeleteEarnedLeave(earnedLeave.id)}
                            disabled={loading}
                          >
                            <Ionicons name="trash" size={18} color="#d32f2f" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No Records Found !</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusR',
  },
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
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontFamily: 'PlusR',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    fontFamily: 'PlusR',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 13,
    fontFamily: 'PlusSB',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
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
    color: '#d32f2f',
    fontFamily: 'PlusSB',
    fontSize: 14,
  },
});

export default EarnedLeaves;
