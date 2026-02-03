import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGeneral from '../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function UserCategory() {
  const navigation = useNavigation();
  const {
    getAllUsersCategories,
    saveUserCategory,
    updateUserCategory,
    deleteUserCategory,
    usersCategories: apiUsersCategories,
    loading,
    error
  } = useGeneral();

  const [formData, setFormData] = useState({
    categoryName: '',
    categoryCode: '',
  });

  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch users categories on component mount
  useEffect(() => {
    fetchUsersCategories();
  }, []);

  const fetchUsersCategories = async () => {
    try {
      setIsLoadingData(true);
      const data = await getAllUsersCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching users categories:', err);
      Alert.alert('Error', 'Failed to fetch users categories');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.categoryName.trim() || !formData.categoryCode.trim()) {
      Alert.alert('Validation Error', 'Please fill all required fields!');
      return;
    }

    try {
      if (editing) {
        // Update existing category
        const result = await updateUserCategory(editing.id, formData);
        console.log('Update result:', result);
        Alert.alert('Success', 'User category updated successfully!');
        setEditing(null);
      } else {
        // Add new category
        const result = await saveUserCategory(formData);
        console.log('Save result:', result);
        Alert.alert('Success', 'User category added successfully!');
      }

      // Reset form and refresh list
      setFormData({
        categoryName: '',
        categoryCode: '',
      });

      // Refresh the list
      await fetchUsersCategories();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err?.message || error || 'Failed to save user category';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      categoryName: item.categoryName,
      categoryCode: item.categoryCode,
    });
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
            const result = await deleteUserCategory(id);
            console.log('Delete result:', result);
            Alert.alert('Success', 'User category deleted successfully!');
            // Refresh the list
            await fetchUsersCategories();
          } catch (err) {
            console.error('Delete error:', err);
            const errorMessage = err?.message || error || 'Failed to delete user category';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      categoryName: '',
      categoryCode: '',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>User Category</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Configure Category Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editing ? 'Edit User Category' : 'Configure Category'}
            </Text>

            {/* Category Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Category Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.categoryName}
                onChangeText={(value) => handleInputChange('categoryName', value)}
                placeholder="Enter category name"
              />
            </View>

            {/* Category Code */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Category Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.categoryCode}
                onChangeText={(value) => handleInputChange('categoryCode', value)}
                placeholder="Enter category code"
                autoCapitalize="characters"
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

          {/* Existing Added Category Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Added Category</Text>

            {isLoadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : categories.length === 0 ? (
              <Text style={styles.emptyText}>No categories found</Text>
            ) : (
              <>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Category Name</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Code</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                </View>

                {/* Table Rows */}
                {categories.map((item, idx) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.categoryName}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.categoryCode}</Text>
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
