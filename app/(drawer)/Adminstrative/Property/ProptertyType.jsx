import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import useRealEstatePropertyTypeActions from "../../../../hooks/useRealEstatePropertyTypeActions";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const initialTypeTable = [
  { id: 1, type: "Residential", natureCode: "1" },
  { id: 2, type: "Commercial", natureCode: "2" },
];

export default function ProptertyType() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  // ✅ use hook
  const {
    propertyTypes,
    loading,
    savePropertyType,
    deletePropertyType,
  } = useRealEstatePropertyTypeActions();

  // ✅ handle submit
  const handleSubmit = async () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert("Validation", "Both Name and Code are required.");
      return;
    }
    try {
      await savePropertyType({ name, code: Number(code) });
      setName("");
      setCode("");
    } catch (err) {
      Alert.alert("Error", "Failed to save property type");
    }
  };

  // ✅ handle delete
  const handleDelete = async (id) => {
    Alert.alert("Confirm", "Are you sure you want to delete this type?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePropertyType(id);
          } catch (err) {
            Alert.alert("Error", "Failed to delete property type");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="BLACK" />
              </TouchableOpacity>
              <Text style={styles.title}>
                Property <Text style={{ color: "#5aaf57" }}>Type</Text>
              </Text>
            </View>
          </View>

          {/* Card 1: Configure Property Type */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Configure Property Type</Text>
            <View style={styles.formRow}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter Type Name"
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.label}>Code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Enter Type Code"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Saving..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Type Table */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Text style={{ color: "red" }}>Note:- </Text>Please follow this
              codes
            </Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Type</Text>
              <Text style={styles.tableHeaderText}>Nature Code</Text>
            </View>
            {initialTypeTable.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.type}</Text>
                <Text style={styles.tableCell}>{item.natureCode}</Text>
              </View>
            ))}
          </View>

          {/* Card 3: Existing Property Types */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Existing Property Types</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>S. No</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Code</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Action</Text>
            </View>
            {propertyTypes.map((item, idx) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.7 }]}>{idx + 1}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{item.code}</Text>
                <View style={[styles.actionCell, { flex: 1 }]}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => Alert.alert("Edit", "Edit logic here")}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { paddingBottom: hp('3%') },
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: wp('5%') },
  header: { paddingVertical: hp('2.2%') },
  title: {
    fontSize: wp('8%'),
    fontFamily: "PlusSB",
    color: "#333",
    marginTop: hp('1%'),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: hp('1.5%'),
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp('1.5%'),
  },
  label: { width: wp('25%'), color: "#333", fontFamily: "PlusR", fontSize: wp('3.5%') },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: "#f5f5f5",
    color: "#333",
    fontFamily: "PlusR",
    fontSize: wp('3.5%'),
  },
  submitButton: {
    backgroundColor: "#5aaf57",
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignItems: "center",
    marginTop: hp('1%'),
  },
  submitButtonText: {
    color: "#fff",
    fontSize: wp('4%'),
    fontFamily: "PlusSB",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#5aaf57",
    padding: wp('2%'),
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  tableHeaderText: {
    flex: 1,
    color: "#fff",
    textAlign: "center",
    fontFamily: "PlusSB",
    fontSize: wp('3.2%'),
  },
  tableRow: {
    flexDirection: "row",
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    color: "#333",
    fontFamily: "PlusR",
    fontSize: wp('3%'),
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: wp('3%'),
  },
  iconBtn: { padding: wp('1%') },
});
