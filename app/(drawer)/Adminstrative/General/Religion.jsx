import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGeneral from '../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Religion() {
  const navigation = useNavigation();
  const {
    getAllReligions,
    saveReligion,
    updateReligion,
    deleteReligion,
    religions: apiReligions,
    loading,
    error
  } = useGeneral();

  const [religion, setReligion] = useState('');
  const [editing, setEditing] = useState(null);
  const [religions, setReligions] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch religions on component mount
  useEffect(() => {
    fetchReligions();
  }, []);

  const fetchReligions = async () => {
    try {
      setIsLoadingData(true);
      const data = await getAllReligions();
      setReligions(data || []);
    } catch (err) {
      console.error('Error fetching religions:', err);
      Alert.alert('Error', 'Failed to fetch religions');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!religion.trim()) {
      Alert.alert('Validation Error', 'Please enter religion name!');
      return;
    }

    try {
      if (editing) {
        // Update existing religion
        const result = await updateReligion(editing.id, { name: religion });
        console.log('Update result:', result);
        Alert.alert('Success', 'Religion updated successfully!');
        setEditing(null);
      } else {
        // Add new religion
        const result = await saveReligion({ name: religion });
        console.log('Save result:', result);
        Alert.alert('Success', 'Religion added successfully!');
      }

      // Reset form and refresh list
      setReligion('');

      // Refresh the list
      await fetchReligions();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err?.message || error || 'Failed to save religion';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (item) => {
    setReligion(item.name);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Religion', 'Are you sure you want to delete this religion?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteReligion(id);
            console.log('Delete result:', result);
            Alert.alert('Success', 'Religion deleted successfully!');
            // Refresh the list
            await fetchReligions();
          } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err?.message || error || 'Failed to delete religion';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setReligion('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Religion</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Religion Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Religion' : 'Configure Religion'}
            </Text>

            {/* Religion Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Religion <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={religion}
                onChangeText={setReligion}
                placeholder="Enter religion name"
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

          {/* Existing Religion Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Religion</Text>

            {isLoadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading religions...</Text>
              </View>
            ) : religions.length === 0 ? (
              <Text style={styles.emptyText}>No religions found</Text>
            ) : (
              <>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Religion</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {religions.map((item, idx) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                    <View style={[styles.actionCell, { flex: 1 }]}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
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
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusR',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: '#999',
    fontFamily: 'PlusR',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
