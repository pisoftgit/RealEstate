import React, { useState, useEffect } from 'react';
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
import RNPickerSelect from 'react-native-picker-select';

import useFlatHouseStructures from '../../../../hooks/useStructure';

export default function FlatHouseStructures() {
  const navigation = useNavigation();

  const {
    structures,
    loading,
    error,
    structureTypes,
    addStructure,
    updateStructure,
    deleteStructure,
    fetchStructures,
  } = useFlatHouseStructures();

  const [structureName, setStructureName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editStructureName, setEditStructureName] = useState('');
  const [editSelectedTypeId, setEditSelectedTypeId] = useState(null);

  useEffect(() => {
    fetchStructures();
  }, []);
  const handleAddSubmit = async () => {
    if (!structureName.trim() || !selectedTypeId) {
      Alert.alert('Validation', 'Please enter structure name and select type.');
      return;
    }

    try {
      await addStructure(structureName.trim(), selectedTypeId);
      setStructureName('');
      setSelectedTypeId(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to add structure.');
    }
  };


  const openEditModal = (item) => {
    setEditId(item.id);
    setEditStructureName(item.structureName);
    setEditSelectedTypeId(item.flatHouseStructureType?.id || null);
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!editStructureName.trim() || !editSelectedTypeId) {
      Alert.alert('Validation', 'Please enter structure name and select type.');
      return;
    }
    try {
      await updateStructure(editId, editStructureName.trim(), editSelectedTypeId);
      setEditModalVisible(false);
      setEditId(null);
      setEditStructureName('');
      setEditSelectedTypeId(null);
    } catch {
      Alert.alert('Error', 'Failed to update structure.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Structure',
      'Are you sure you want to delete this structure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteStructure(id);
            } catch {
              Alert.alert('Error', 'Failed to delete structure.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const pickerItems = structureTypes.map((type) => ({
    label: type.structureType,
    value: type.id,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>
            Flat House <Text style={{ color: '#5aaf57' }}>Structures</Text>
          </Text>
        </View>

        {/* Add Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Flat House Structure</Text>

          <View style={styles.formRow}>
            <Text style={styles.label}>Structure Name</Text>
            <TextInput
              style={styles.input}
              value={structureName}
              onChangeText={setStructureName}
              placeholder="Enter Structure Name"
            />
          </View>

          <View style={[styles.formRow, { zIndex: 10 }]}>
            <Text style={styles.label}>Structure Type</Text>
            <RNPickerSelect
              placeholder={{ label: 'Select Structure Type', value: null }}
              onValueChange={setSelectedTypeId}
              items={pickerItems}
              value={selectedTypeId}
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Structure List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flat House Structures List</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#5aaf57" />
          ) : error ? (
            <Text style={{ color: 'red' }}>{error}</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>S. No</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Name</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Type</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Actions</Text>
              </View>

              {structures.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{idx + 1}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.structureName}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {item.flatHouseStructureType?.structureType || 'N/A'}
                  </Text>
                  <View style={[styles.actionCell, { flex: 1 }]}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => openEditModal(item)}
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
            <Text style={styles.cardTitle}>Edit Flat House Structure</Text>

            <TextInput
              style={styles.modalInput}
              value={editStructureName}
              onChangeText={setEditStructureName}
              placeholder="Enter Structure Name"
              autoFocus
            />

            <View style={{ zIndex: 10, marginBottom: 12 }}>
              <RNPickerSelect
                placeholder={{ label: 'Select Structure Type', value: null }}
                onValueChange={setEditSelectedTypeId}
                items={pickerItems}
                value={editSelectedTypeId}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[styles.submitButton, { flex: 0.45, backgroundColor: '#5aaf57' }]}
                onPress={handleEditSave}
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

// Styling
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: {
    paddingVertical: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 130,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    color: '#333',
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
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontSize: 16,
    marginBottom: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    color: '#000',
    backgroundColor: '#f5f5f5',
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    color: '#000',
    paddingRight: 30,
    backgroundColor: '#f5f5f5',
  },
});
