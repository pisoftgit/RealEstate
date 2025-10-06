import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

const initialStructureTypes = [
  { label: 'High Rise', value: 'High Rise' },
  { label: 'Low Rise', value: 'Low Rise' },
  { label: 'Villa', value: 'Villa' },
];

const initialStructures = [
  { id: 1, type: 'High Rise', name: 'Tower A' },
  { id: 2, type: 'Villa', name: 'Villa 101' },
];

export default function Structure() {
  const navigation = useNavigation();
  const [structureTypeOpen, setStructureTypeOpen] = useState(false);
  const [structureType, setStructureType] = useState(null);
  const [structureTypeItems, setStructureTypeItems] = useState(initialStructureTypes);
  const [structureName, setStructureName] = useState('');
  const [structures, setStructures] = useState(initialStructures);

  const handleSubmit = () => {
    if (structureType && structureName.trim()) {
      setStructures([
        ...structures,
        { id: structures.length + 1, type: structureType, name: structureName },
      ]);
      setStructureType(null);
      setStructureName('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Structure</Text>
        </View>
        {/* Card 1: Input Fields */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Structure</Text>
          <View style={styles.formRow}>
            <Text style={styles.label}>Structure Type</Text>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={structureTypeOpen}
                value={structureType}
                items={structureTypeItems}
                setOpen={setStructureTypeOpen}
                setValue={setStructureType}
                setItems={setStructureTypeItems}
                placeholder="Select Structure Type"
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: '#f5f5f5' }}
                dropDownContainerStyle={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8 }}
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Structure Name</Text>
            <TextInput
              style={styles.input}
              value={structureName}
              onChangeText={setStructureName}
              placeholder="Enter Structure Name"
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
        {/* Card 2: Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Structure List</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Structure Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Structure Name</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>
          {structures.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.type}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
              <View style={[styles.actionCell, { flex: 1 }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {/* edit logic */ }}>
                  <Feather name="edit" size={18} color="#5aaf57" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => {/* delete logic */ }}>
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
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
