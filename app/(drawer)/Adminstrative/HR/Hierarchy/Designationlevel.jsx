import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import useHr from '../../../../../hooks/useHr';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Designationlevel() {
  const navigation = useNavigation();
  const {
    getAllDesignationLevels,
    addDesignationLevel,
    updateDesignationLevel,
    deleteDesignationLevel,
    getAllLevels,
    getAllDesignations,
    getAllDepartments,
    designationLevels,
    levels,
    designations,
    departments,
    loading,
    error,
    success
  } = useHr();

  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [availableDesignations, setAvailableDesignations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          getAllDesignationLevels(),
          getAllLevels(),
          getAllDesignations(),
          getAllDepartments()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, []);

  // Update available designations when designations change
  useEffect(() => {
    if (designations && designations.length > 0) {
      setAvailableDesignations(designations);
    }
  }, [designations]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        getAllDesignationLevels(),
        getAllLevels(),
        getAllDesignations(),
        getAllDepartments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddDesignation = (designationId) => {
    if (!designationId || designationId === '') return;

    const designation = availableDesignations.find(d => d.id === parseInt(designationId));
    if (!designation) return;

    // Check if already added
    if (selectedDesignations.some(d => d.id === designation.id)) {
      Alert.alert('Info', 'This designation is already added');
      return;
    }

    setSelectedDesignations([...selectedDesignations, designation]);
  };

  const handleRemoveDesignation = (designationId) => {
    setSelectedDesignations(selectedDesignations.filter(d => d.id !== designationId));
  };

  const handleSubmit = async () => {
    if (!selectedLevel || selectedLevel === '') {
      Alert.alert('Validation Error', 'Please select a level!');
      return;
    }

    if (selectedDesignations.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one designation!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        levelsConfigId: parseInt(selectedLevel),
        designationIds: selectedDesignations.map(d => d.id)
      };

      if (editing) {
        // For update: Since API doesn't support PUT/PATCH, we delete and recreate
        await deleteDesignationLevel(editing.id);
        await addDesignationLevel(payload);
        Alert.alert('Success', 'Designation level updated successfully!');
        setEditing(null);
      } else {
        // Add new designation level
        await addDesignationLevel(payload);
        Alert.alert('Success', 'Designation level added successfully!');
      }

      // Reset form and refresh list
      setSelectedLevel('');
      setSelectedDesignations([]);
      await fetchAllData();
    } catch (error) {
      console.error('Error saving designation level:', error);
      Alert.alert('Error', error.message || 'Failed to save designation level');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedLevel(item.levelsConfig.id.toString());
    setSelectedDesignations(item.designations || []);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Designation Level', 'Are you sure you want to delete this designation level?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDesignationLevel(id);
            Alert.alert('Success', 'Designation level deleted successfully!');
            await fetchAllData();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete designation level');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setSelectedLevel('');
    setSelectedDesignations([]);
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments?.find(d => d.departmentId === departmentId);
    return dept ? dept.departmentName : 'Unknown';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Designation-Levels</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Designation Level Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Level-Designation' : 'Configure Level-Designation'}
            </Text>

            {/* Max Levels Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Max Levels <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedLevel}
                  onValueChange={(itemValue) => setSelectedLevel(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="--- Select Level ---" value="" />
                  {levels && levels.map((level) => (
                    <Picker.Item
                      key={level.id}
                      label={`${level.maximumLevels} - ${level.levelName}`}
                      value={level.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Designation Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Designation <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue=""
                  onValueChange={(itemValue) => handleAddDesignation(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="--- Choose Designation ---" value="" />
                  {availableDesignations && availableDesignations.map((designation) => (
                    <Picker.Item
                      key={designation.id}
                      label={designation.name}
                      value={designation.id.toString()}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Selected Designations List */}
            {selectedDesignations.length > 0 && (
              <View style={styles.selectedDesignationsContainer}>
                <Text style={styles.selectedTitle}>Selected Designations:</Text>
                {selectedDesignations.map((designation) => (
                  <View key={designation.id} style={styles.selectedItem}>
                    <View style={styles.selectedItemContent}>
                      <Text style={styles.selectedItemText}>{designation.name}</Text>
                      <Text style={styles.selectedItemDept}>
                        {designation.department?.departmentName || 'N/A'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveDesignation(designation.id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="close-circle" size={24} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
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

            {/* Cancel Button (shown only when editing) */}
            {editing && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing Designation Levels Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Level-Designation (s)</Text>

            {(loading || isSubmitting) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading designation levels...</Text>
              </View>
            ) : designationLevels && designationLevels.length > 0 ? (
              designationLevels.map((item) => (
                <View key={item.id} style={styles.levelCard}>
                  {/* Level Header */}
                  <View style={styles.levelHeader}>
                    <View style={styles.levelHeaderLeft}>
                      <Text style={styles.levelNumber}>
                        {item.levelsConfig?.maximumLevels || 'N/A'} - {item.levelsConfig?.levelName || 'N/A'}
                      </Text>
                      <View style={styles.levelActions}>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => handleEdit(item)}
                          disabled={isSubmitting}
                        >
                          <Feather name="edit" size={18} color="#5aaf57" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => handleDelete(item.id)}
                          disabled={isSubmitting}
                        >
                          <Ionicons name="trash" size={18} color="#d32f2f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Designations Table */}
                  <View style={styles.designationsTable}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Sr.No</Text>
                      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Department</Text>
                      <Text style={[styles.tableHeaderText, { flex: 2 }]}>Designation</Text>
                      <Text style={[styles.tableHeaderText, { flex: 1 }]}>Remove</Text>
                    </View>

                    {item.designations && item.designations.length > 0 ? (
                      item.designations.map((designation, index) => (
                        <View key={designation.id} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { flex: 0.8 }]}>{index + 1}</Text>
                          <Text style={[styles.tableCell, { flex: 2 }]}>
                            {designation.department?.departmentName || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { flex: 2 }]}>
                            {designation.name}
                          </Text>
                          <View style={[styles.actionCell, { flex: 1 }]}>
                            <TouchableOpacity
                              style={styles.iconBtn}
                              onPress={() => {
                                // Remove this designation from the level
                                Alert.alert(
                                  'Remove Designation',
                                  'Are you sure you want to remove this designation from this level?',
                                  [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                      text: 'Remove',
                                      style: 'destructive',
                                      onPress: async () => {
                                        try {
                                          const updatedDesignations = item.designations
                                            .filter(d => d.id !== designation.id)
                                            .map(d => d.id);

                                          if (updatedDesignations.length === 0) {
                                            Alert.alert('Error', 'Cannot remove all designations. Delete the level instead.');
                                            return;
                                          }

                                          const payload = {
                                            levelsConfigId: item.levelsConfig.id,
                                            designationIds: updatedDesignations
                                          };

                                          // API doesn't support update, so delete and recreate
                                          await deleteDesignationLevel(item.id);
                                          await addDesignationLevel(payload);
                                          Alert.alert('Success', 'Designation removed successfully!');

                                          await fetchAllData();
                                        } catch (error) {
                                          console.error('Error removing designation:', error);
                                          Alert.alert('Error', error.message || 'Failed to remove designation');
                                        }
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <Ionicons name="close-circle" size={18} color="#d32f2f" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No designations in this level</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No designation levels found</Text>
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
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    color: '#333',
  },
  selectedDesignationsContainer: {
    marginTop: hp('1.5%'),
    marginBottom: hp('1.5%'),
    padding: wp('3%'),
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTitle: {
    fontSize: hp('1.8%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1%'),
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: wp('2%'),
    marginBottom: hp('0.8%'),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItemContent: {
    flex: 1,
  },
  selectedItemText: {
    fontSize: hp('1.8%'),
    fontFamily: 'PlusSB',
    color: '#333',
  },
  selectedItemDept: {
    fontSize: hp('1.5%'),
    fontFamily: 'PlusR',
    color: '#666',
    marginTop: hp('0.3%'),
  },
  removeBtn: {
    padding: wp('1%'),
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
  levelCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: wp('3%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    paddingBottom: hp('1.5%'),
    borderBottomWidth: 2,
    borderBottomColor: '#5aaf57',
  },
  levelHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
    color: '#5aaf57',
  },
  levelActions: {
    flexDirection: 'row',
    gap: wp('3%'),
  },
  designationsTable: {
    marginTop: hp('1%'),
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
    fontSize: hp('1.5%'),
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: hp('1.8%'),
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
    fontSize: hp('1.8%'),
  },
});
