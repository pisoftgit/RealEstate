import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGeneral from '../../../../hooks/useGeneral';

export default function Bloodgroup() {
  const navigation = useNavigation();
  const { 
    getAllBloodGroups, 
    saveBloodGroup, 
    updateBloodGroup, 
    deleteBloodGroup,
    bloodGroups: apiBloodGroups,
    loading, 
    error 
  } = useGeneral();

  const [bloodgroup, setBloodgroup] = useState('');
  const [editing, setEditing] = useState(null);
  const [bloodgroups, setBloodgroups] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch blood groups on component mount
  useEffect(() => {
    fetchBloodgroups();
  }, []);

  const fetchBloodgroups = async () => {
    try {
      setIsLoadingData(true);
      const data = await getAllBloodGroups();
      setBloodgroups(data || []);
    } catch (err) {
      console.error('Error fetching blood groups:', err);
      Alert.alert('Error', 'Failed to fetch blood groups');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!bloodgroup.trim()) {
      Alert.alert('Validation Error', 'Please enter blood group!');
      return;
    }

    try {
      if (editing) {
        // Update existing blood group
        const result = await updateBloodGroup(editing.id, { bloodGroup: bloodgroup });
        console.log('Update result:', result);
        Alert.alert('Success', 'Blood group updated successfully!');
        setEditing(null);
      } else {
        // Add new blood group
        const result = await saveBloodGroup({ bloodGroup: bloodgroup });
        console.log('Save result:', result);
        Alert.alert('Success', 'Blood group added successfully!');
      }

      // Reset form and refresh list
      setBloodgroup('');
      
      // Refresh the list
      await fetchBloodgroups();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err?.message || error || 'Failed to save blood group';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (item) => {
    setBloodgroup(item.bloodGroup);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Blood Group', 'Are you sure you want to delete this blood group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteBloodGroup(id);
            console.log('Delete result:', result);
            Alert.alert('Success', 'Blood group deleted successfully!');
            // Refresh the list
            await fetchBloodgroups();
          } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err?.message || error || 'Failed to delete blood group';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setBloodgroup('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Blood Group</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Blood Group Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Blood Group' : 'Configure Blood Group'}
            </Text>

            {/* Blood Group Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Blood Group <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={bloodgroup}
                onChangeText={setBloodgroup}
                placeholder="Enter blood group"
              />
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

            {/* Cancel Button (shown only when editing) */}
            {editing && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Existing Blood Group Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Blood Group</Text>
            
            {isLoadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading blood groups...</Text>
              </View>
            ) : bloodgroups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No blood groups found</Text>
              </View>
            ) : (
              <>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Blood Group</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {bloodgroups.map((item, idx) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.bloodGroup}</Text>
                    <View style={[styles.actionCell, { flex: 1 }]}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={18} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash" size={18} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
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
  disabledButton: {
    backgroundColor: '#a0a0a0',
    opacity: 0.6,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontFamily: 'PlusR',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: 14,
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
});
