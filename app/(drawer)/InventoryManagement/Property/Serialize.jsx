import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, StyleSheet } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";

/* --------------------------------- THEME COLORS --------------------------------- */
const COLORS = {
  primary: "#004d40",
  primaryLight: "#218373ff",
  secondary: "#198170ff",
  background: "#fff",
  card: "#f4fcf4",
  input: "#f0f8f0",
  border: "#c8e6c9",
  text: "#202020ff",
  placeholder: "#13773dff",
  error: "#d32f2f",
  success: "#22c55e",
  warning: "#eab308",
};

/* ----------------------------- Main Component ---------------------------- */
const Serialize = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [projects, setProjects] = useState([
    {
      id: 1,
      builder: "Ansal API",
      projectName: "Ansal API Golf Links II",
      startDate: "10-01-2015",
      completionDate: "14-10-2020",
      possessionStatus: "Ready To Move",
      reraApproved: true,
      address: "Sector 18, City A"
    },
    {
      id: 2,
      builder: "Ansal API",
      projectName: "Sunshine Residency",
      startDate: "10-01-2024",
      completionDate: "30-06-2026",
      possessionStatus: "Under Construction",
      reraApproved: true,
      address: "Phase 1, City B"
    },
    {
      id: 3,
      builder: "Akshay Builders",
      projectName: "Anand Tower",
      startDate: "01-01-2022",
      completionDate: "30-06-2025",
      possessionStatus: "Ready To Move",
      reraApproved: true,
      address: "Near Bypass, City C"
    },
  ]);

  const handleDeleteProject = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this project? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => setProjects(projects.filter((p) => p.id !== id)),
          style: "destructive",
        },
      ]
    );
  };

  const handleProjectClick = (project) => {
    router.push({
      pathname: "/(drawer)/InventoryManagement/Property/PropertyDetails",
      params: { project: JSON.stringify(project) }, 
    });
  };

  const renderProjectItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProjectClick(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.projectName}>{item.projectName}</Text>
          <Text style={styles.projectText}>Builder: {item.builder}</Text>
          <Text style={styles.projectText}>Status: <Text style={{ fontWeight: '600', color: item.possessionStatus === 'Ready To Move' ? COLORS.secondary : COLORS.warning }}>{item.possessionStatus}</Text></Text>
          <Text style={styles.dateText}>Starts: {item.startDate} | Ends: {item.completionDate}</Text>

          <View style={styles.reraContainer}>
            <Feather
              name={item.reraApproved ? "check-circle" : "x-circle"}
              size={16}
              color={item.reraApproved ? COLORS.success : COLORS.error}
            />
            <Text style={[styles.reraText, { color: item.reraApproved ? COLORS.success : COLORS.error }]}>
              RERA {item.reraApproved ? "Approved" : "Not Approved"}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleProjectClick(item)}>
            <Feather name="move" size={18} color="#eab308" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProject(item.id)}>
            <Feather name="trash-2" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Projects</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/path-to-add-new-project')}>
          <Ionicons name="add" size={24} color={COLORS.card} />
        </TouchableOpacity>
      </View>

      {/* Project List */}
      {projects.length > 0 ? (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProjectItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No projects available</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const actionButtonBase = {
  padding: 10,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  elevation: 1,
};

/* -------------------------- Stylesheet (Themed) --------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: 'space-between', paddingHorizontal: 20,
    paddingVertical: 15, paddingTop: 40, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 5,
  },
  title: { flex: 1, fontSize: 26, fontWeight: "800", marginLeft: 15, color: COLORS.primary },
  addButton: { backgroundColor: COLORS.secondary, padding: 8, borderRadius: 50, elevation: 3 },
  cardContainer: { paddingHorizontal: 20, paddingVertical: 8 },
  card: {
    flexDirection: "row", justifyContent: 'space-between', alignItems: "center", backgroundColor: COLORS.card, padding: 18,
    borderRadius: 15, borderLeftWidth: 6, borderLeftColor: COLORS.secondary, elevation: 3, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3,
  },
  projectName: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 5 },
  projectText: { fontSize: 14, color: COLORS.text, marginTop: 2, opacity: 0.8 },
  dateText: { fontSize: 12, color: COLORS.placeholder, marginTop: 5, fontStyle: 'italic' },
  reraContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, paddingTop: 5, borderTopWidth: 1, borderTopColor: COLORS.border },
  reraText: { marginLeft: 8, fontSize: 14, fontWeight: '600' },
  actionButtons: { flexDirection: "column", marginLeft: 15, gap: 10 },
  editButton: { ...actionButtonBase, backgroundColor: "#fff3cd", borderWidth: 1, borderColor: COLORS.warning },
  deleteButton: { ...actionButtonBase, backgroundColor: "#fbe8e8", borderWidth: 1, borderColor: COLORS.error },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: COLORS.placeholder, fontWeight: '500' },
});

export default Serialize;