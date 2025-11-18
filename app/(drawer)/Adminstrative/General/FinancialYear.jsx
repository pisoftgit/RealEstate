import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function FinancialYear() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const [editing, setEditing] = useState(null);
  const [financialYears, setFinancialYears] = useState([
    {
      id: 1,
      name: 'FY 2023-24',
      startDate: '2023-04-01',
      endDate: '2024-03-31',
      isActive: true,
    },
    {
      id: 2,
      name: 'FY 2022-23',
      startDate: '2022-04-01',
      endDate: '2023-03-31',
      isActive: false,
    },
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.startDate.trim() || !formData.endDate.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing financial year
        setFinancialYears(prev =>
          prev.map(fy =>
            fy.id === editing.id
              ? {
                  ...fy,
                  name: formData.name,
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  isActive: formData.isCurrent,
                }
              : fy
          )
        );
        Alert.alert('Success', 'Financial year updated successfully!');
        setEditing(null);
      } else {
        // Add new financial year
        const newFY = {
          id: financialYears.length + 1,
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isCurrent,
        };
        setFinancialYears(prev => [...prev, newFY]);
        Alert.alert('Success', 'Financial year added successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to save financial year');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      startDate: item.startDate,
      endDate: item.endDate,
      isCurrent: item.isActive,
    });
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Financial Year', 'Are you sure you want to delete this financial year?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setFinancialYears(prev => prev.filter(fy => fy.id !== id));
          Alert.alert('Success', 'Financial year deleted successfully!');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
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
              <TextInput
                style={styles.input}
                value={formData.startDate}
                onChangeText={(value) => handleInputChange('startDate', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* End Date */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                End Date <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.endDate}
                onChangeText={(value) => handleInputChange('endDate', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* Is Current */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Current Year</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.isCurrent ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => handleInputChange('isCurrent', true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.isCurrent ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !formData.isCurrent ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => handleInputChange('isCurrent', false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !formData.isCurrent ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
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
                    isCurrent: false,
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing Financial Year Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Financial Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: 60 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Name</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>Start Date</Text>
                  <Text style={[styles.tableHeaderText, { width: 120 }]}>End Date</Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>Active</Text>
                  <Text style={[styles.tableHeaderText, { width: 100 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {financialYears.map((item, idx) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: 60 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>{item.name}</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>{item.startDate}</Text>
                    <Text style={[styles.tableCell, { width: 120 }]}>{item.endDate}</Text>
                    <View style={[styles.tableCell, { width: 80 }]}>
                      <View
                        style={[
                          styles.statusBadge,
                          item.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            item.isActive ? styles.statusTextActive : styles.statusTextInactive,
                          ]}
                        >
                          {item.isActive ? 'Yes' : 'No'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.actionCell, { width: 100 }]}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={18} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash" size={18} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
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
    paddingVertical: 8,
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
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleTextInactive: {
    color: '#666',
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
    alignItems: 'center',
  },
  tableCell: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
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
    fontSize: 12,
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
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
