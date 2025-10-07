import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

import useFurnishingStatusActions from '../../../../hooks/useFurnishingStatusActions'; // Adjust path as needed

export default function FurnishingStatus() {
  const navigation = useNavigation();
  const { statuses, loading, addFurnishingStatus, updateFurnishingStatus, deleteFurnishingStatus } = useFurnishingStatusActions();

  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);

  const handleSubmit = async () => {
    if (!status.trim()) return;
    try {
      if (editing) {
        await updateFurnishingStatus({ id: editing.id, status });
        setEditing(null);
      } else {
        await addFurnishingStatus({ status });
      }
      setStatus('');
    } catch (e) {
      Alert.alert('Error', 'Failed to save furnishing status.');
    }
  };

  const handleEdit = (item) => {
    setStatus(item.name);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Status', 'Are you sure you want to delete?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => await deleteFurnishingStatus(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Furnishing <Text style={{ color: '#5aaf57' }}>Status</Text>
          </Text>
        </View>
        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editing ? 'Edit Furnishing Status' : 'Add Furnishing Status'}</Text>
          <View style={styles.formRow}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={status}
              onChangeText={setStatus}
              placeholder="Enter Status Name"
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
        {/* List Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status List</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Status</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>
          {statuses.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { paddingVertical: 18, marginBottom: 8 },
  title: { fontSize: 32, fontFamily: 'PlusSB', color: '#333', marginLeft: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontFamily: 'PlusSB', color: '#333', marginBottom: 12 },
  formRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { width: 120, color: '#333', fontFamily: 'PlusR' },
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
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'PlusSB' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderText: { flex: 1, color: '#fff', textAlign: 'center', fontFamily: 'PlusSB', fontSize: 14 },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tableCell: { flex: 1, textAlign: 'center', color: '#333', fontFamily: 'PlusR', fontSize: 13 },
  actionCell: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
});
