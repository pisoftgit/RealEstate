import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function Prefix() {
  const navigation = useNavigation();

  const [prefix, setPrefix] = useState('');
  const [editing, setEditing] = useState(null);
  const [prefixes, setPrefixes] = useState([
    { id: 1, name: 'Mr.' },
    { id: 2, name: 'Mrs.' },
    { id: 3, name: 'Ms.' },
    { id: 4, name: 'Dr.' },
    { id: 5, name: 'Prof.' },
  ]);

  const handleSubmit = () => {
    if (!prefix.trim()) {
      Alert.alert('Validation Error', 'Please enter prefix!');
      return;
    }

    try {
      if (editing) {
        // Update existing prefix
        setPrefixes(prev =>
          prev.map(item =>
            item.id === editing.id
              ? { ...item, name: prefix }
              : item
          )
        );
        Alert.alert('Success', 'Prefix updated successfully!');
        setEditing(null);
      } else {
        // Add new prefix
        const newPrefix = {
          id: prefixes.length + 1,
          name: prefix,
        };
        setPrefixes(prev => [...prev, newPrefix]);
        Alert.alert('Success', 'Prefix added successfully!');
      }

      // Reset form
      setPrefix('');
    } catch (e) {
      Alert.alert('Error', 'Failed to save prefix');
    }
  };

  const handleEdit = (item) => {
    setPrefix(item.name);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Prefix', 'Are you sure you want to delete this prefix?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPrefixes(prev => prev.filter(item => item.id !== id));
          Alert.alert('Success', 'Prefix deleted successfully!');
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
            <Ionicons name="menu" size={28} color="BLACK" />
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
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
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
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Prefix</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {prefixes.map((item, idx) => (
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
});
