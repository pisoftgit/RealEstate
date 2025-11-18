import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function Category() {
  const navigation = useNavigation();

  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([
    { id: 1, name: 'General' },
    { id: 2, name: 'OBC' },
    { id: 3, name: 'SC' },
    { id: 4, name: 'ST' },
    { id: 5, name: 'EWS' },
  ]);

  const handleSubmit = () => {
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter category name!');
      return;
    }

    try {
      if (editing) {
        // Update existing category
        setCategories(prev =>
          prev.map(item =>
            item.id === editing.id
              ? { ...item, name: category }
              : item
          )
        );
        Alert.alert('Success', 'Category updated successfully!');
        setEditing(null);
      } else {
        // Add new category
        const newCategory = {
          id: categories.length + 1,
          name: category,
        };
        setCategories(prev => [...prev, newCategory]);
        Alert.alert('Success', 'Category added successfully!');
      }

      // Reset form
      setCategory('');
    } catch (e) {
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleEdit = (item) => {
    setCategory(item.name);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setCategories(prev => prev.filter(item => item.id !== id));
          Alert.alert('Success', 'Category deleted successfully!');
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setCategory('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Category</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Category Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit Category' : 'Configure Category'}
            </Text>

            {/* Category Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Enter category name"
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

          {/* Existing Category Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Category</Text>
            
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Category</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>

            {/* Table Rows */}
            {categories.map((item, idx) => (
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
