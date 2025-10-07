import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import usePropertyItemActions from '../../../../hooks/usePropertyItemActions'; // adjust path

export default function PropertyItem() {
  const navigation = useNavigation();

  const {
    propertyItems,
    loading,
    addPropertyItem,
    updatePropertyItem,
    deletePropertyItem,
  } = usePropertyItemActions();

  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [propertyType, setPropertyType] = useState(null);
  const [propertyTypeItems, setPropertyTypeItems] = useState([
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
  ]);

  const [propertyItem, setPropertyItem] = useState('');
  const [propertyCode, setPropertyCode] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);

  // Handle Add / Update
  const handleSubmit = async () => {
    if (!propertyType || !propertyItem.trim() || !propertyCode.trim()) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    try {
      const payload = {
        realEstatePropertyType: { id: propertyType === 'Residential' ? 1 : 2 }, // map your type to id accordingly
        name: propertyItem,
        code: propertyCode,
      };

      if (editingItemId) {
        await updatePropertyItem({ id: editingItemId, ...payload });
        Alert.alert('Success', 'Property item updated successfully');
        setEditingItemId(null);
      } else {
        await addPropertyItem(payload);
        Alert.alert('Success', 'Property item added successfully');
      }

      // Clear form
      setPropertyType(null);
      setPropertyItem('');
      setPropertyCode('');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setEditingItemId(item.id);
    setPropertyType(item.realEstatePropertyType === 1 ? 'Residential' : 'Commercial'); // map back
    setPropertyItem(item.name);
    setPropertyCode(item.code);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePropertyItem(id);
              Alert.alert('Deleted', 'Property item deleted');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
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

        {/* Card: Configure Property Item */}
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
            <Text style={styles.submitButtonText}>{editingItemId ? 'Update' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Card: Existing Property Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Existing Property Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Property Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Property Item</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#5aaf57" style={{ marginTop: 20 }} />
          ) : propertyItems.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 10 }}>No property items found</Text>
          ) : (
            propertyItems.map((item, idx) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.realEstatePropertyType === 1 ? 'Residential' : 'Commercial'}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.name}</Text>
                <View style={[styles.actionCell, { flex: 1 }]}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                    <Feather name="edit" size={18} color="#5aaf57" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash" size={18} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Your styles remain unchanged
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { paddingVertical: 18 },
  title: { fontSize: 32, fontFamily: 'PlusSB', color: '#333', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontFamily: 'PlusSB', color: '#333', marginBottom: 12 },
  formRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { width: 120, color: '#333', fontFamily: 'PlusR' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, backgroundColor: '#f5f5f5', color: '#333', fontFamily: 'PlusR' },
  submitButton: { backgroundColor: '#5aaf57', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'PlusSB' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#5aaf57', padding: 8, borderRadius: 8, marginBottom: 4 },
  tableHeaderText: { flex: 1, color: '#fff', textAlign: 'center', fontFamily: 'PlusSB', fontSize: 14 },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  tableCell: { flex: 1, textAlign: 'center', color: '#333', fontFamily: 'PlusR', fontSize: 13 },
  actionCell: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
});
