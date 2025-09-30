import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from "expo-router"; 

const nodeTableData = [
  { id: 1, nature: 'Builder', userCode: '1' },
  { id: 2, nature: 'Channel Partner', userCode: '2' },
  { id: 3, nature: 'Dealer', userCode: '3' },
];

const existingBusinessNature = [
  { id: 1, nature: 'Builder', natureCode: '1' },
  { id: 2, nature: 'Channel Partner', natureCode: '2' },
  { id: 3, nature: 'Dealer', natureCode: '3' },
];

export default function Businessnature() {
    const navigation = useNavigation();
  const [nature, setNature] = useState('');
  const [natureCode, setNatureCode] = useState('');

  const handleSubmit = () => {
    // Submit logic here
    setNature('');
    setNatureCode('');
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
                Business <Text style={{ color: '#5aaf57' }}>Nature</Text>
              </Text>
            </View>
          </View>
          {/* Card 1: Configure Business Nature */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configure Business Nature</Text>
            <View style={styles.formRow}>
              <Text style={styles.label}>Nature</Text>
              <TextInput
                style={styles.input}
                value={nature}
                onChangeText={setNature}
                placeholder="Enter Nature"
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>Nature Code</Text>
              <TextInput
                style={styles.input}
                value={natureCode}
                onChangeText={setNatureCode}
                placeholder="Enter Nature Code"
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Node Table */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}><Text style={{ color: 'red' }}>Note:-</Text>Please use the following codes for the respective business nature:</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>S. No</Text>
              <Text style={styles.tableHeaderText}>Nature</Text>
              <Text style={styles.tableHeaderText}>User Code</Text>
            </View>
            {nodeTableData.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.id}</Text>
                <Text style={styles.tableCell}>{item.nature}</Text>
                <Text style={styles.tableCell}>{item.userCode}</Text>
              </View>
            ))}
          </View>

          {/* Card 3: Existing Business Nature */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Business Nature</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>S. No</Text>
              <Text style={styles.tableHeaderText}>Nature</Text>
              <Text style={styles.tableHeaderText}>Nature Code</Text>
              <Text style={styles.tableHeaderText}>Actions</Text>
            </View>
            {existingBusinessNature.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.id}</Text>
                <Text style={styles.tableCell}>{item.nature}</Text>
                <Text style={styles.tableCell}>{item.natureCode}</Text>
                <View style={styles.actionCell}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => {/* edit logic */}}>
                    <Feather name="edit" size={18} color="#5aaf57" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => {/* delete logic */}}>
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
    fontFamily: 'PlusR',
    color: '#333',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 100,
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
  nodeCodes: {
    marginTop: 8,
  },
  nodeCodeText: {
    color: '#666',
    fontSize: 14,
    marginVertical: 2,
    fontFamily: 'PlusR',
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