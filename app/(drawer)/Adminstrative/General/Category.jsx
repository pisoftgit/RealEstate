import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGeneral from '../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Category() {
  const navigation = useNavigation();
  const {
    getAllCategories,
    saveCategory,
    updateCategory,
    deleteCategory,
    categories: apiCategories,
    loading,
    error
  } = useGeneral();

  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingData(true);
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter category name!');
      return;
    }

    try {
      if (editing) {
        // Update existing category
        const result = await updateCategory(editing.id, { category: category });
        console.log('Update result:', result);
        Alert.alert('Success', 'Category updated successfully!');
        setEditing(null);
      } else {
        // Add new category
        const result = await saveCategory({ category: category });
        console.log('Save result:', result);
        Alert.alert('Success', 'Category added successfully!');
      }

      // Reset form and refresh list
      setCategory('');

      // Refresh the list
      await fetchCategories();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err?.message || error || 'Failed to save category';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (item) => {
    setCategory(item.category);
    setEditing(item);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteCategory(id);
            console.log('Delete result:', result);
            Alert.alert('Success', 'Category deleted successfully!');
            // Refresh the list
            await fetchCategories();
          } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err?.message || error || 'Failed to delete category';
            Alert.alert('Error', errorMessage);
          }
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
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
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

          {/* Existing Category Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Category</Text>

            {isLoadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No categories found</Text>
              </View>
            ) : (
              <>
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
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.category}</Text>
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
  submitButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
    opacity: 0.6,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('5%'),
  },
  loadingText: {
    marginTop: hp('1.2%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('5%'),
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
