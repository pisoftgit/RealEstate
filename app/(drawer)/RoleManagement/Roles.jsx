import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { getAllActiveOrInactiveEmployees } from "../../../services/api";
import useRoleAssignment from "../../../hooks/useRoleAssignment";

const Roles = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Role assignment hook
  const {
    roles,
    userRoleIds,
    user,
    loading: rolesLoading,
    assignRoles,
    flattenRoles,
    hasRole,
  } = useRoleAssignment(selectedEmployee?.id);

  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.usercode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  // Update selected roles when userRoleIds change
  useEffect(() => {
    if (userRoleIds.length > 0) {
      setSelectedRoleIds(userRoleIds);
    } else {
      setSelectedRoleIds([]);
    }
  }, [userRoleIds]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllActiveOrInactiveEmployees();

      const employeesWithPhotos = data.map((emp) => ({
        id: emp.id.toString(),
        usercode: emp.usercode,
        name: emp.name,
        department: emp.designation?.department?.department || "N/A",
        designation: emp.designation?.name || "N/A",
        email: emp.officialEmail || "N/A",
        phone: emp.officialContact || "N/A",
        pic:
          emp.employeePic || "https://randomuser.me/api/portraits/lego/1.jpg",
      }));

      setEmployees(employeesWithPhotos);
      setFilteredEmployees(employeesWithPhotos);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Alert.alert("Error", "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPress = (employee) => {
    setSelectedEmployee(employee);
    setModalVisible(true);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSaveRoles = async () => {
    try {
      if (!selectedEmployee) return;

      await assignRoles(parseInt(selectedEmployee.id), selectedRoleIds);
      Alert.alert("Success", "Roles assigned successfully!");
      setModalVisible(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error assigning roles:", error);
      Alert.alert("Error", "Failed to assign roles");
    }
  };

  const renderRoleItem = (role, level = 0) => {
    const isSelected = selectedRoleIds.includes(role.id);

    return (
      <View key={role.id}>
        <TouchableOpacity
          style={level === 0 ? styles.moduleItem : level === 1 ? styles.subModuleItem : styles.nestedModuleItem}
          onPress={() => handleRoleToggle(role.id)}
        >
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={level === 0 ? styles.moduleName : level === 1 ? styles.subModuleName : styles.nestedModuleName}>
              {role.name}
            </Text>
          </View>
        </TouchableOpacity>
        {role.children && role.children.length > 0 &&
          role.children.map((child) => renderRoleItem(child, level + 1))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header Row with Title and Animation */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Role</Text>
          <Text style={styles.headerSubTitle}>Assignment</Text>
          <Text style={styles.headerDesc}>
            Assign roles to employees from the list!
          </Text>
        </View>
        <LottieView
          source={require("../../../assets/svg/EMP.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#5aaf57"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name, department..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AntDesign name="closecircle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Employee List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleAssignPress(item)}
            >
              <Text style={styles.index}>{index + 1}</Text>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: item.pic }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.nameDeptWrapper}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.department} numberOfLines={1}>
                  {item.department}
                </Text>
              </View>
              <Ionicons
                name="person-add"
                size={22}
                color="#5aaf57"
                style={styles.icon}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No employees found</Text>
            </View>
          }
        />
      )}

      {/* Role Assignment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Roles</Text>
                {selectedEmployee && (
                  <Text style={styles.modalSubtitle}>
                    User: {selectedEmployee.name} ({selectedEmployee.usercode})
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Roles List */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {rolesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#5aaf57" />
                  <Text style={styles.loadingText}>Loading roles...</Text>
                </View>
              ) : roles.length > 0 ? (
                roles.map((role) => renderRoleItem(role))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No roles available</Text>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.selectedCount}>
                {selectedRoleIds.length} role(s) selected
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedEmployee(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveRoles}
                  disabled={rolesLoading}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.modalSaveText}>Save Roles</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 60 : 70,
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 35,
    fontFamily: "PlusSB",
    marginTop: -89,
  },
  headerSubTitle: {
    fontSize: 30,
    fontFamily: "PlusSB",
    color: "#5aaf57",
    marginTop: -5,
  },
  headerDesc: {
    fontSize: 12,
    fontFamily: "PlusR",
    marginTop: 5,
  },
  lottie: {
    width: 80,
    height: 50,
    transform: [{ scale: 2 }],
    bottom: 15,
    top: -45,
    marginRight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    shadowColor: "#32cd32",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: -20,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontFamily: "PlusR",
    fontWeight: "600",
    color: "#333",
    paddingLeft: 8,
  },
  searchIcon: {
    marginRight: 5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  index: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 30,
  },
  nameDeptWrapper: {
    flex: 1,
    alignItems: "center",
  },
  name: {
    width: 200,
    fontSize: 16,
    color: "#111",
    fontFamily: "PlusR",
    textAlign: "center",
    marginRight: 92,
  },
  department: {
    width: 52,
    fontSize: 11,
    color: "#5aaf57",
    fontFamily: "PlusR",
    textAlign: "center",
    marginRight: 92,
  },
  icon: {
    marginLeft: "auto",
    paddingLeft: 10,
    marginTop: -10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "PlusR",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#999",
    fontFamily: "PlusR",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 40,
  },
  modalContent: {
    width: "100%",
    height: "95%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "PlusSB",
    color: "#222",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
    marginTop: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  moduleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  subModuleItem: {
    paddingVertical: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  nestedModuleItem: {
    paddingVertical: 8,
    paddingLeft: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#5aaf57",
    borderColor: "#5aaf57",
  },
  moduleName: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#222",
  },
  subModuleName: {
    fontSize: 15,
    fontFamily: "PlusR",
    color: "#444",
  },
  nestedModuleName: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: "PlusSB",
    color: "#666",
  },
  modalSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#5aaf57",
    gap: 6,
  },
  modalSaveText: {
    fontSize: 15,
    fontFamily: "PlusSB",
    color: "#fff",
  },
});

export default Roles;
