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
  FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import useMeasurementUnits from '../../../../hooks/useMeasurements';

export default function MeasurementUnitsScreen() {
  const {
    units,
    loading,
    error,
    fetchUnits,
    addUnit,
    updateUnit,
    deleteUnit,
  } = useMeasurementUnits();

  const [unitName, setUnitName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(null);

  const resetForm = () => {
    setUnitName('');
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!unitName.trim()) {
      Alert.alert('Validation', 'Please enter a unit name.');
      return;
    }
    setSubmitLoading(true);
    try {
      if (editingId) {
        await updateUnit(editingId, unitName.trim());
      } else {
        await addUnit(unitName.trim());
      }
      resetForm();
      await fetchUnits();
    } catch (err) {
      Alert.alert('Error', 'Failed to save unit.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleEdit = (unit) => {
    setUnitName(unit.name);
    setEditingId(unit.id);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this unit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await deleteUnit(id);
            await fetchUnits();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete unit.');
          }
        },
      },
    ]);
  };

  // Render unit item for FlatList
  const renderItem = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 0.7 }]}>{index + 1}</Text>
      <Text style={[styles.tableCell, { flex: 3 }]}>{item.name}</Text>
      <View style={[styles.actionCell, { flex: 1 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
          <Feather name="edit" size={18} color="#5aaf57" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={18} color="#d32f2f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Measurement Units</Text>

        {loading && <ActivityIndicator size="small" color="#5aaf57" />}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{editingId ? 'Edit Unit' : 'Add Unit'}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter unit name"
            value={unitName}
            onChangeText={setUnitName}
          />
          <TouchableOpacity
            style={[styles.submitButton, submitLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{editingId ? 'Update' : 'Add'}</Text>
            )}
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Units List</Text>

          {units.length === 0 && !loading && (
            <Text style={{ textAlign: 'center', padding: 16, color: '#666' }}>
              No units found.
            </Text>
          )}

          <FlatList
            data={units}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#aaa',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginHorizontal: 6,
  },
});
