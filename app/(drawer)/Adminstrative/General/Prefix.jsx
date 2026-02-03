import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGeneral from '../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Prefix() {
  const navigation = useNavigation();
  const {
    getAllPrefixes,
    savePrefix,
    updatePrefix,
    deletePrefix,
    prefixes,
    loading,
    error,
  } = useGeneral();

  const [prefix, setPrefix] = useState('');
  const [editing, setEditing] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Fetch prefixes on component mount
  useEffect(() => {
    fetchPrefixes();
  }, []);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const fetchPrefixes = async () => {
    try {
      await getAllPrefixes();
    } catch (err) {
      console.error('Error fetching prefixes:', err);
    }
  };

  const handleSubmit = async () => {
    if (!prefix.trim()) {
      Alert.alert('Validation Error', 'Please enter prefix!');
      return;
    }

    setLocalLoading(true);
    try {
      if (editing) {
        // Update existing prefix
        // Use id or prefixId, whichever is available
        const prefixId = editing.prefixId || editing.id;
        if (!prefixId) {
          throw new Error('Prefix ID is missing');
        }
        console.log('Updating prefix with ID:', prefixId);
        await updatePrefix(prefixId, { prefixName: prefix });
        Alert.alert('Success', 'Prefix updated successfully!');
        setEditing(null);
      } else {
        // Add new prefix
        await savePrefix({ prefixName: prefix });
        Alert.alert('Success', 'Prefix added successfully!');
      }

      // Reset form
      setPrefix('');
      // Refresh the list
      await fetchPrefixes();
    } catch (err) {
      console.error('Error saving prefix:', err);
      Alert.alert('Error', err.message || 'Failed to save prefix');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEdit = (item) => {
    console.log('Edit item:', JSON.stringify(item)); // Debug log
    setPrefix(item.prefixName);
    setEditing(item);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Prefix', 'Are you sure you want to delete this prefix?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLocalLoading(true);
          try {
            // Use id or prefixId, whichever is available
            const prefixId = item.prefixId || item.id;
            if (!prefixId) {
              throw new Error('Prefix ID is missing');
            }
            console.log('Deleting prefix with ID:', prefixId);
            await deletePrefix(prefixId);
            Alert.alert('Success', 'Prefix deleted successfully!');
            // Refresh the list
            await fetchPrefixes();
          } catch (err) {
            console.error('Error deleting prefix:', err);
            Alert.alert('Error', err.message || 'Failed to delete prefix');
          } finally {
            setLocalLoading(false);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setPrefix('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Name Prefix</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Prefix Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Prefix' : 'Configure Prefix'}
            </Text>

            {/* Prefix Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Prefix <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={prefix}
                onChangeText={setPrefix}
                placeholder="Enter name prefix (e.g., Mr., Mrs.)"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (loading || localLoading) && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading || localLoading}
            >
              {(loading || localLoading) ? (
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

          {/* Existing Prefix Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Prefix</Text>

            {loading && !localLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading prefixes...</Text>
              </View>
            ) : !prefixes || prefixes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No prefixes found</Text>
              </View>
            ) : (
              <View>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Prefix</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {prefixes.map((item, idx) => (
                  <View key={item.prefixId || item.id || idx} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.prefixName}</Text>
                    <View style={[styles.actionCell, { flex: 1 }]}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={hp('2.2%')} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
                        <Ionicons name="trash" size={hp('2.2%')} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
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
  disabledButton: {
    backgroundColor: '#a5d6a3',
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
  loadingContainer: {
    padding: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: hp('1%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
  emptyContainer: {
    padding: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: hp('1.7%'),
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
});
