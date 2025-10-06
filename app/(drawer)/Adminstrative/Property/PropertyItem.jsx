import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

const initialPropertyTable = [
  { id: 1, propertyType: 'Residential', propertyItem: 'Flat', propertyCode: 'R1' },
  { id: 2, propertyType: 'Commercial', propertyItem: 'Shop', propertyCode: 'C1' },
];

const initialUnits = [
  { id: 1, unit: 'Flat', code: 'F1' },
  { id: 2, unit: 'Shop', code: 'S1' },
];

const initialExistingItems = [
  { id: 1, propertyType: 'Residential', propertyItem: 'Flat', code: 'R1' },
  { id: 2, propertyType: 'Commercial', propertyItem: 'Shop', code: 'C1' },
];

export default function PropertyItem() {
  const navigation = useNavigation();
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [propertyType, setPropertyType] = useState(null);
  const [propertyTypeItems, setPropertyTypeItems] = useState([
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
  ]);
  const [propertyItem, setPropertyItem] = useState('');
  const [propertyCode, setPropertyCode] = useState('');
  const [unit, setUnit] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [existingItems, setExistingItems] = useState(initialExistingItems);

  const handleSubmit = () => {
    if (propertyType && propertyItem.trim() && propertyCode.trim()) {
      setExistingItems([
        ...existingItems,
        { id: existingItems.length + 1, propertyType, propertyItem, code: propertyCode },
      ]);
      setPropertyType(null);
      setPropertyItem('');
      setPropertyCode('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu" size={28} color="BLACK" />
            </TouchableOpacity>
            <Text style={styles.title}>
              Property <Text style={{ color: '#5aaf57' }}>Item</Text>
            </Text>
          </View>
        </View>
        {/* Card 1: Configure Property Item */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configure Property Item</Text>
          <View style={styles.formRow}>
            <Text style={styles.label}>Property Type</Text>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={propertyTypeOpen}
                value={propertyType}
                items={propertyTypeItems}
                setOpen={setPropertyTypeOpen}
                setValue={setPropertyType}
                setItems={setPropertyTypeItems}
                placeholder="Select Property Type"
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: '#f5f5f5' }}
                dropDownContainerStyle={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8 }}
              />
            </View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Property Item</Text>
            <TextInput
              style={styles.input}
              value={propertyItem}
              onChangeText={setPropertyItem}
              placeholder="Enter Property Item"
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Property Code</Text>
            <TextInput
              style={styles.input}
              value={propertyCode}
              onChangeText={setPropertyCode}
              placeholder="Enter Property Code"
            />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Unit and Code */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}><Text style={{ color: 'red' }}>Note:-</Text>Please follow these codes</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Unit</Text>
            <Text style={styles.tableHeaderText}>Code</Text>
          </View>
          {initialUnits.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.unit}</Text>
              <Text style={styles.tableCell}>{item.code}</Text>
            </View>
          ))}
        </View>

        {/* Card 3: Existing Property Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Existing Property Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Property Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Property Item</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>
          {existingItems.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.propertyType}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.propertyItem}</Text>
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
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusSB',
    color: '#333',
    marginTop: 8,
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
