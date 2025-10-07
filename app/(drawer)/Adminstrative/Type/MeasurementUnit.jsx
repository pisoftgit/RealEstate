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
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import useFlatHouseStructures from "../../../../hooks/useStructure"

export default function Structure() {
  const navigation = useNavigation();

  const {
    structures,
    structureTypes,
    loading,
    error,
    addStructure,
    deleteStructure,
    fetchStructures,
  } = useFlatHouseStructures();

  // Dropdown state for open/close and selected value
  const [structureTypeOpen, setStructureTypeOpen] = useState(false);
  const [structureType, setStructureType] = useState(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async () => {
    if (!structureType) {
      Alert.alert('Validation', 'Please select a structure type.');
      return;
    }

    try {
      setSubmitLoading(true);
      await addStructure(structureType);
      setStructureType(null);
      fetchStructures(); // refresh list
    } catch (err) {
      Alert.alert('Error', 'Failed to add structure.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this structure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await deleteStructure(id);
            fetchStructures(); // refresh after delete
          } catch (err) {
            Alert.alert('Error', 'Failed to delete structure.');
          }
        },
      },
    ]);
  };

  // Transform structureTypes for DropDownPicker: {label, value}
  const dropdownItems = structureTypes.map((item) => ({
    label: item.structureType,
    value: item.structureType,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Structure</Text>
        </View>

        {loading && <ActivityIndicator size="small" color="#5aaf57" />}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}

        {/* Card 1: Input Fields */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Structure</Text>

          <View style={styles.formRow}>
            <Text style={styles.label}>Structure Type</Text>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={structureTypeOpen}
                value={structureType}
                items={dropdownItems}
                setOpen={setStructureTypeOpen}
                setValue={setStructureType}
                setItems={() => {}}
                placeholder="Select Structure Type"
                style={{
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  borderRadius: 8,
                  backgroundColor: '#f5f5f5',
                }}
                dropDownContainerStyle={{
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                  borderRadius: 8,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitLoading}
          >
            {submitLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Card 2: Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Structure List</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>

          {structures.length === 0 && !loading && (
            <Text style={{ textAlign: 'center', padding: 16, color: '#666' }}>
              No structures found.
            </Text>
          )}

          {structures.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.type}</Text>
              <View style={[styles.actionCell, { flex: 1 }]}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => {
                    // Edit logic can be added here later
                  }}
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
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  iconBtn: {
    padding: 4,
    marginHorizontal: 6,
  },
});
