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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
    paddingTop: Platform.OS === "android" ? hp('3%') : 0,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('1.2%'),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp('5%'),
    marginTop: Platform.OS === "ios" ? hp('7.5%') : hp('8.5%'),
    marginBottom: hp('2.5%'),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: wp('9%'),
    fontFamily: "PlusSB",
    marginTop: -hp('11.5%'),
  },
  headerSubTitle: {
    fontSize: wp('7.5%'),
    fontFamily: "PlusSB",
    color: "#5aaf57",
    marginTop: -hp('0.6%'),
  },
  headerDesc: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusR",
    marginTop: hp('0.6%'),
  },
  lottie: {
    width: wp('20%'),
    height: hp('6%'),
    transform: [{ scale: 2 }],
    bottom: hp('1.8%'),
    top: -hp('5.6%'),
    marginRight: wp('5%'),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: wp('4%'),
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('2.5%'),
    marginVertical: hp('1.2%'),
    shadowColor: "#32cd32",
    elevation: 3,
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('0.8%'),
    marginTop: -hp('2.5%'),
  },
  searchBar: {
    flex: 1,
    height: hp('5%'),
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    fontWeight: "600",
    color: "#333",
    paddingLeft: wp('2%'),
  },
  searchIcon: {
    marginRight: wp('1.2%'),
  },
  list: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2.5%'),
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp('3.5%'),
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  index: {
    fontSize: wp('3.2%'),
    color: "#888",
    textAlign: "center",
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    marginRight: wp('8%'),
  },
  nameDeptWrapper: {
    flex: 1,
    alignItems: "center",
  },
  name: {
    width: wp('52%'),
    fontSize: wp('4.2%'),
    color: "#111",
    fontFamily: "PlusR",
    textAlign: "center",
    marginRight: wp('23%'),
  },
  department: {
    width: wp('13%'),
    fontSize: wp('2.8%'),
    color: "#5aaf57",
    fontFamily: "PlusR",
    textAlign: "center",
    marginRight: wp('23%'),
  },
  icon: {
    marginLeft: "auto",
    paddingLeft: wp('2.5%'),
    marginTop: -hp('1.2%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp('5%'),
  },
  loadingText: {
    marginTop: hp('1.2%'),
    fontSize: wp('4%'),
    fontFamily: "PlusR",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp('10%'),
  },
  emptyText: {
    marginTop: hp('1.8%'),
    fontSize: wp('4%'),
    color: "#999",
    fontFamily: "PlusR",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: hp('5%'),
  },
  modalContent: {
    width: "100%",
    height: "95%",
    backgroundColor: "#fff",
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    overflow: "hidden",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontFamily: "PlusSB",
    color: "#222",
  },
  modalSubtitle: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    color: "#666",
    marginTop: hp('0.5%'),
  },
  modalBody: {
    flex: 1,
    padding: wp('5%'),
  },
  moduleItem: {
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  subModuleItem: {
    paddingVertical: hp('1.2%'),
    paddingLeft: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  nestedModuleItem: {
    paddingVertical: hp('1%'),
    paddingLeft: wp('10%'),
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('1.5%'),
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp('3%'),
  },
  checkboxChecked: {
    backgroundColor: "#5aaf57",
    borderColor: "#5aaf57",
  },
  moduleName: {
    fontSize: wp('4.2%'),
    fontFamily: "PlusSB",
    color: "#222",
  },
  subModuleName: {
    fontSize: wp('3.8%'),
    fontFamily: "PlusR",
    color: "#444",
  },
  nestedModuleName: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    color: "#666",
  },
  modalFooter: {
    padding: wp('5%'),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  selectedCount: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    color: "#666",
    marginBottom: hp('1.2%'),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp('2.5%'),
  },
  modalCancelButton: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    backgroundColor: "#f5f5f5",
  },
  modalCancelText: {
    fontSize: wp('3.8%'),
    fontFamily: "PlusSB",
    color: "#666",
  },
  modalSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    backgroundColor: "#5aaf57",
    gap: wp('1.5%'),
  },
  modalSaveText: {
    fontSize: wp('3.8%'),
    fontFamily: "PlusSB",
    color: "#fff",
  },
});

export default Roles;
