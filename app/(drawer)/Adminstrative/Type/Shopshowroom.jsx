import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useShopShowroomCategories from '../../../../hooks/useShowRoomCategory';

export default function Shopshowroom() {
  const navigation = useNavigation();
  const [shopShowroom, setShopShowroom] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Modal state for editing only
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalName, setEditModalName] = useState('');

  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useShopShowroomCategories();

  const handleSubmit = async () => {
    if (!shopShowroom.trim()) return;

    try {
      if (editingId) {
        await updateCategory(editingId, shopShowroom);
        setEditingId(null);
      } else {
        await addCategory(shopShowroom);
      }
      setShopShowroom('');
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  // Open modal with selected category data
  const openEditModal = (item) => {
    setEditModalName(item.name);
    setEditingId(item.id);
    setEditModalVisible(true);
  };

  const handleEditModalSave = async () => {
    if (!editModalName.trim()) return;

    try {
      await updateCategory(editingId, editModalName);
      setEditModalVisible(false);
      setEditingId(null);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while updating.');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteCategory(id);
            } catch {
              Alert.alert('Error', 'Failed to delete category.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Shop/ <Text style={{ color: '#5aaf57' }}>Showroom</Text>
          </Text>
        </View>

        {/* Original input form for add/edit stays intact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingId ? 'Edit' : 'Add'} Shop/Showroom
          </Text>
          <View style={styles.formRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={shopShowroom}
              onChangeText={setShopShowroom}
              placeholder="Enter Shop/Showroom Name"
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {editingId ? 'Update' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of categories */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shop/Showroom List</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#5aaf57" />
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Name</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
              </View>

              {categories.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                  <View style={[styles.actionCell, { flex: 1 }]}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => openEditModal(item)} // Open modal here
                    >
                      <Feather name="edit" size={18} color="#5aaf57" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Ionicons name="trash" size={18} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.cardTitle}>Edit Shop/Showroom</Text>
            <TextInput
              style={styles.modalInput}
              value={editModalName}
              onChangeText={setEditModalName}
              placeholder="Enter Shop/Showroom Name"
              autoFocus
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[styles.submitButton, { flex: 0.45, backgroundColor: '#5aaf57' }]}
                onPress={handleEditModalSave}
              >
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { flex: 0.45, backgroundColor: '#888' }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.submitButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  submitButtonText: {
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
    flex: 1,
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
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: 16,
    marginBottom: 16,
  },
});
