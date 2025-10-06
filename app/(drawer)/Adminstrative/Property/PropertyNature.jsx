import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from "expo-router";


const initialPropertyNature = [
  { id: 1, nature: 'Residential' },
  { id: 2, nature: 'Commercial' },
  { id: 3, nature: 'Industrial' },
];

export default function PropertyNature() {
  const navigation = useNavigation();
  const [nature, setNature] = useState('');
  const [propertyNatureList, setPropertyNatureList] = useState(initialPropertyNature);

  const handleSubmit = () => {
    if (nature.trim()) {
      setPropertyNatureList([...propertyNatureList, { id: propertyNatureList.length + 1, nature }]);
      setNature('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="BLACK" />
              </TouchableOpacity>
              <Text style={styles.title}>
                Property <Text style={{ color: '#5aaf57' }}>Nature</Text>
              </Text>
            </View>
          </View>
          {/* Card 1: Configure Property Nature */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configure Property Nature</Text>
            <View style={styles.formRow}>
              <Text style={styles.label}>Property Nature</Text>
              <TextInput
                style={styles.input}
                value={nature}
                onChangeText={setNature}
                placeholder="Enter Property Nature"
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Existing Property Nature */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Property Nature</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Property Nature</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>
            {propertyNatureList.map((item, idx) => (
              <View key={item.id} style={styles.tableRow}>
                <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.tableCell}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.tableCell}>{item.nature}</Text>
                </View>
                <View style={[styles.actionCell, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 24 },
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
