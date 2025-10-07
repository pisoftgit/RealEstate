import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import useBusinessNatureActions from '../../../../hooks/useAddBusinessNature'; // ✅ one hook for all
import { StyleSheet } from 'react-native';

const nodeTableData = [
  { id: 1, nature: 'Builder', userCode: '1' },
  { id: 2, nature: 'Channel Partner', userCode: '2' },
  { id: 3, nature: 'Dealer', userCode: '3' },
];

export default function Businessnature() {
  const navigation = useNavigation();
  const [nature, setNature] = useState('');
  const [natureCode, setNatureCode] = useState('');
  const [editId, setEditId] = useState(null); // ✅ for edit mode

  // ✅ Single hook
  const { businessNatures, loading, addBusinessNature, updateBusinessNature, deleteBusinessNature } = useBusinessNatureActions();

  const handleSubmit = async () => {
    if (!nature || !natureCode) {
      Alert.alert('Validation', 'Please enter both Nature and Nature Code');
      return;
    }

    try {
      if (editId) {
        await updateBusinessNature({ id: editId, nature, code: natureCode });
        Alert.alert('Success', 'Business Nature updated successfully!');
      } else {
        await addBusinessNature({ nature, code: natureCode });
        Alert.alert('Success', 'Business Nature added successfully!');
      }

      setNature('');
      setNatureCode('');
      setEditId(null);
    } catch (error) {
      console.log('Error saving Business Nature:', error);

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Unknown error occurred';

        switch (statusCode) {
          case 409:
            Alert.alert('Conflict', 'This business nature already exists.');
            break;
          case 400:
            Alert.alert('Validation Error', errorMessage);
            break;
          case 401:
            Alert.alert('Authentication Error', 'Please login again.');
            break;
          case 500:
            Alert.alert('Server Error', 'Internal server error.');
            break;
          default:
            Alert.alert('Error', `Failed to save business nature: ${errorMessage}`);
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'Unable to connect to server.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this Business Nature?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBusinessNature(id);
              Alert.alert("Deleted", "Business nature deleted successfully.");
            } catch (error) {
              console.log("Error deleting Business Nature:", error);
              Alert.alert("Error", "Failed to delete business nature.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
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
            <Text style={styles.cardTitle}>
              {editId ? "Update Business Nature" : "Configure Business Nature"}
            </Text>
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
              <Text style={styles.submitButtonText}>{editId ? "Update" : "Submit"}</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Node Table */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Text style={{ color: 'red' }}>Note:-</Text>
              Please use the following codes for the respective business nature:
            </Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>S. No</Text>
              <Text style={styles.tableHeaderText}>Nature</Text>
              <Text style={styles.tableHeaderText}>User Code</Text>
            </View>
            {nodeTableData.map(item => (
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
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={styles.loadingText}>Loading business natures...</Text>
              </View>
            ) : (
              <>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>S. No</Text>
                  <Text style={styles.tableHeaderText}>Nature</Text>
                  <Text style={styles.tableHeaderText}>Nature Code</Text>
                  <Text style={styles.tableHeaderText}>Actions</Text>
                </View>
                {businessNatures && businessNatures.length > 0 ? (
                  businessNatures.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{index + 1}</Text>
                      <Text style={styles.tableCell}>{item.name}</Text>
                      <Text style={styles.tableCell}>{item.code}</Text>
                      <View style={styles.actionCell}>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => {
                            setNature(item.name);
                            setNatureCode(String(item.code));
                            setEditId(item.id);
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
                  ))
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No business natures found</Text>
                  </View>
                )}
              </>
            )}
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
  header: { paddingVertical: 18 },
  title: { fontSize: 32, fontFamily: 'PlusSB', color: '#333', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
  cardTitle: { fontSize: 18, fontFamily: 'PlusR', color: '#333', marginBottom: 12 },
  formRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { width: 100, color: '#333', fontFamily: 'PlusR' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 8, backgroundColor: '#f5f5f5', color: '#333', fontFamily: 'PlusR' },
  submitButton: { backgroundColor: '#5aaf57', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'PlusSB' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#5aaf57', padding: 8, borderRadius: 8, marginBottom: 4 },
  tableHeaderText: { flex: 1, color: '#fff', textAlign: 'center', fontFamily: 'PlusSB', fontSize: 14 },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  tableCell: { flex: 1, textAlign: 'center', color: '#333', fontFamily: 'PlusR', fontSize: 13 },
  actionCell: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
  loadingContainer: { alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#666', fontFamily: 'PlusR' },
  noDataContainer: { alignItems: 'center', padding: 20 },
  noDataText: { color: '#666', fontFamily: 'PlusR', fontSize: 16 },
});
