import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from "expo-router";
import usePropertyNatureActions from '../../../../hooks/usePropertyNatureActions'; // ✅ hook

export default function PropertyNature() {
  const navigation = useNavigation();
  const [nature, setNature] = useState('');
  const [editId, setEditId] = useState(null); // ✅ for edit mode

  // ✅ our hook
  const { 
    propertyNatures, 
    loading, 
    addPropertyNature, 
    updatePropertyNature, 
    deletePropertyNature 
  } = usePropertyNatureActions();

  const handleSubmit = async () => {
    if (!nature.trim()) {
      Alert.alert('Validation', 'Please enter Property Nature');
      return;
    }

    try {
      if (editId) {
        await updatePropertyNature({ id: editId, propertyNature: nature });
        Alert.alert('Success', 'Property Nature updated successfully!');
      } else {
        await addPropertyNature({ propertyNature: nature });
        Alert.alert('Success', 'Property Nature added successfully!');
      }
      setNature('');
      setEditId(null);
    } catch (error) {
      console.error("Error saving property nature:", error);
      Alert.alert("Error", "Failed to save property nature");
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this property nature?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePropertyNature(id);
              Alert.alert("Success", "Property Nature deleted successfully!");
            } catch (error) {
              console.error("Delete Error:", error);
              Alert.alert("Error", "Failed to delete property nature");
            }
          },
        },
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
                Property <Text style={{ color: '#5aaf57' }}>Nature</Text>
              </Text>
            </View>
          </View>

          {/* Card 1: Configure Property Nature */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {editId ? "Update Property Nature" : "Configure Property Nature"}
            </Text>
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
              <Text style={styles.submitButtonText}>{editId ? "Update" : "Submit"}</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Existing Property Nature */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Property Nature</Text>
            {loading ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color="#5aaf57" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading property natures...</Text>
              </View>
            ) : (
              <>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
                  <Text style={[styles.tableHeaderText, { flex: 2 }]}>Property Nature</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
                </View>
                {propertyNatures && propertyNatures.length > 0 ? (
                  propertyNatures.map((item, idx) => (
                    <View key={item.id} style={styles.tableRow}>
                      <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.tableCell}>{idx + 1}</Text>
                      </View>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.tableCell}>{item.name}</Text>
                      </View>
                      <View style={[styles.actionCell, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                        <TouchableOpacity
                          style={styles.iconBtn}
                          onPress={() => {
                            setNature(item.name);
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
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: '#666' }}>No property natures found</Text>
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
