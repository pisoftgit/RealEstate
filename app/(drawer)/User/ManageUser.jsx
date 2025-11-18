import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import LottieView from 'lottie-react-native';
import { defaultModules } from '../../../constants/modules';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ManageUser() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    dob: new Date(),
    fatherName: '',
    motherName: '',
    mobileNo: '',
    email: '',
    password: '',
    userName: '',
    gender: '',
    isActive: true,
  });

  // Sample user data - Replace with API data
  const [users, setUsers] = useState([
    {
      id: 'EMP001',
      name: 'John Doe',
      category: 'Admin',
      password: '********',
      contact: '+91 9876543210',
      email: 'john@example.com',
      isActive: true,
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      category: 'Manager',
      password: '********',
      contact: '+91 9876543211',
      email: 'jane@example.com',
      isActive: true,
    },
    {
      id: 'EMP003',
      name: 'Mike Johnson',
      category: 'Employee',
      password: '********',
      contact: '+91 9876543212',
      email: 'mike@example.com',
      isActive: false,
    },
  ]);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setSelectedModules([]); // Reset selections
    setShowAssignModal(true);
  };

  const toggleModule = (moduleName) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleName)) {
        return prev.filter(m => m !== moduleName);
      } else {
        return [...prev, moduleName];
      }
    });
  };

  const handleSaveAssignment = () => {
    if (selectedModules.length === 0) {
      Alert.alert('Warning', 'Please select at least one module to assign.');
      return;
    }
    
    Alert.alert(
      'Success', 
      `Assigned ${selectedModules.length} module(s) to ${selectedUser.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowAssignModal(false);
            setSelectedUser(null);
            setSelectedModules([]);
          }
        }
      ]
    );
  };

  const handleEdit = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    // Populate form with user data
    setEditFormData({
      name: user.name,
      dob: new Date(), // You can parse from user data if available
      fatherName: '',
      motherName: '',
      mobileNo: user.contact,
      email: user.email,
      password: user.password,
      userName: user.id,
      gender: '',
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleEditInputChange('dob', selectedDate);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSaveEdit = () => {
    // Validation
    if (!editFormData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required!');
      return;
    }
    if (!editFormData.userName.trim()) {
      Alert.alert('Validation Error', 'User Name is required!');
      return;
    }
    if (!editFormData.mobileNo.trim()) {
      Alert.alert('Validation Error', 'Mobile Number is required!');
      return;
    }
    if (!editFormData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required!');
      return;
    }

    // Update user in the list
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            name: editFormData.name,
            contact: editFormData.mobileNo,
            email: editFormData.email,
            isActive: editFormData.isActive,
          }
        : user
    ));

    Alert.alert('Success', 'User updated successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setShowEditModal(false);
          setSelectedUser(null);
        }
      }
    ]);
  };

  const handleDelete = (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter((user) => user.id !== userId));
            Alert.alert('Success', 'User deleted successfully');
          },
        },
      ]
    );
  };

  const renderUserCard = (user) => (
    <View key={user.id} style={styles.card}>
      {/* User Header */}
      <View style={styles.cardHeader}>
        <View style={styles.userHeaderLeft}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color="#5aaf57" />
          </View>
          <View style={styles.userHeaderInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userId}>ID: {user.id}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, user.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, user.isActive ? styles.activeText : styles.inactiveText]}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* User Details */}
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Category:</Text>
          </View>
          <Text style={styles.detailValue}>{user.category}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="lock-closed-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Password:</Text>
          </View>
          <Text style={styles.detailValue}>{user.password}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Contact:</Text>
          </View>
          <Text style={styles.detailValue}>{user.contact}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.detailLabel}>Email:</Text>
          </View>
          <Text style={styles.detailValue} numberOfLines={1}>{user.email}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.assignButton]}
          onPress={() => handleAssign(user.id)}
        >
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Assign</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(user.id)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(user.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Drawer Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header Row with Title and Lottie */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Manage</Text>
          <Text style={styles.headerSubTitle}>User</Text>
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
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name or ID..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => renderUserCard(user))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Try a different search term' : 'Add users to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Assign Modules Modal */}
      <Modal
        visible={showAssignModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Modules</Text>
                {selectedUser && (
                  <Text style={styles.modalSubtitle}>
                    User: {selectedUser.name} ({selectedUser.id})
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Modules List */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {defaultModules.map((module, index) => (
                <View key={index}>
                  {/* Main Module */}
                  <TouchableOpacity
                    style={styles.moduleItem}
                    onPress={() => toggleModule(module.name)}
                  >
                    <View style={styles.checkboxContainer}>
                      <View style={[
                        styles.checkbox,
                        selectedModules.includes(module.name) && styles.checkboxChecked
                      ]}>
                        {selectedModules.includes(module.name) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.moduleName}>{module.title}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Sub Modules */}
                  {module.children && module.children.map((subModule, subIndex) => (
                    <View key={`${index}-${subIndex}`}>
                      <TouchableOpacity
                        style={styles.subModuleItem}
                        onPress={() => toggleModule(subModule.name)}
                      >
                        <View style={styles.checkboxContainer}>
                          <View style={[
                            styles.checkbox,
                            selectedModules.includes(subModule.name) && styles.checkboxChecked
                          ]}>
                            {selectedModules.includes(subModule.name) && (
                              <Ionicons name="checkmark" size={16} color="#fff" />
                            )}
                          </View>
                          <Text style={styles.subModuleName}>{subModule.title}</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Nested Sub Modules */}
                      {subModule.children && subModule.children.map((nestedModule, nestedIndex) => (
                        <TouchableOpacity
                          key={`${index}-${subIndex}-${nestedIndex}`}
                          style={styles.nestedModuleItem}
                          onPress={() => toggleModule(nestedModule.name)}
                        >
                          <View style={styles.checkboxContainer}>
                            <View style={[
                              styles.checkbox,
                              selectedModules.includes(nestedModule.name) && styles.checkboxChecked
                            ]}>
                              {selectedModules.includes(nestedModule.name) && (
                                <Ionicons name="checkmark" size={16} color="#fff" />
                              )}
                            </View>
                            <Text style={styles.nestedModuleName}>{nestedModule.title}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.selectedCount}>
                {selectedModules.length} module(s) selected
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowAssignModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveAssignment}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.modalSaveText}>Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit User</Text>
                {selectedUser && (
                  <Text style={styles.modalSubtitle}>
                    User ID: {selectedUser.id}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Edit Form */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.name}
                  onChangeText={(value) => handleEditInputChange('name', value)}
                  placeholder="Enter full name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Date of Birth */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  Date of Birth <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(editFormData.dob)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={editFormData.dob}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              {/* Father Name */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Father Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.fatherName}
                  onChangeText={(value) => handleEditInputChange('fatherName', value)}
                  placeholder="Enter father's name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Mother Name */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Mother Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.motherName}
                  onChangeText={(value) => handleEditInputChange('motherName', value)}
                  placeholder="Enter mother's name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Mobile Number */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  Mobile No <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.mobileNo}
                  onChangeText={(value) => handleEditInputChange('mobileNo', value)}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {/* Email */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.email}
                  onChangeText={(value) => handleEditInputChange('email', value)}
                  placeholder="Enter email address"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* User Name */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  User Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.userName}
                  onChangeText={(value) => handleEditInputChange('userName', value)}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  Password <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.password}
                  onChangeText={(value) => handleEditInputChange('password', value)}
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              {/* Gender Dropdown */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editFormData.gender}
                    onValueChange={(value) => handleEditInputChange('gender', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              </View>

              {/* Active Status */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Active</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      editFormData.isActive ? styles.toggleButtonActive : styles.toggleButtonInactive,
                    ]}
                    onPress={() => handleEditInputChange('isActive', true)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        editFormData.isActive ? styles.toggleTextActive : styles.toggleTextInactive,
                      ]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !editFormData.isActive ? styles.toggleButtonActive : styles.toggleButtonInactive,
                    ]}
                    onPress={() => handleEditInputChange('isActive', false)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        !editFormData.isActive ? styles.toggleTextActive : styles.toggleTextInactive,
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveEdit}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  menuButton: {
    width: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'PlusR',
    color: '#222',
    lineHeight: 38,
  },
  headerSubTitle: {
    fontSize: 32,
    fontFamily: 'PlusSB',
    color: '#5aaf57',
    lineHeight: 38,
  },
  lottie: {
    width: 120,
    height: 120,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PlusR',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'PlusSB',
    color: '#222',
    marginBottom: 2,
  },
  userId: {
    fontSize: 13,
    fontFamily: 'PlusR',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#e8f5e9',
  },
  inactiveBadge: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'PlusSB',
  },
  activeText: {
    color: '#5aaf57',
  },
  inactiveText: {
    color: '#e74c3c',
  },
  cardBody: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#666',
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'PlusSB',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  assignButton: {
    backgroundColor: '#5aaf57',
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'PlusSB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'PlusSB',
    color: '#999',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#bbb',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 40,
  },
  modalContent: {
    width: '100%',
    height: '95%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'PlusSB',
    color: '#222',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#666',
    marginTop: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  moduleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  subModuleItem: {
    paddingVertical: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  nestedModuleItem: {
    paddingVertical: 8,
    paddingLeft: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#fafafa',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#5aaf57',
    borderColor: '#5aaf57',
  },
  moduleName: {
    fontSize: 16,
    fontFamily: 'PlusSB',
    color: '#222',
  },
  subModuleName: {
    fontSize: 15,
    fontFamily: 'PlusR',
    color: '#444',
  },
  nestedModuleName: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#666',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#666',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'PlusSB',
    color: '#666',
  },
  modalSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#5aaf57',
    gap: 6,
  },
  modalSaveText: {
    fontSize: 15,
    fontFamily: 'PlusSB',
    color: '#fff',
  },
  formRow: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  formInput: {
    height: 48,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'PlusR',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    color: '#333',
  },
  dateInput: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'PlusR',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#5aaf57',
  },
  toggleButtonInactive: {
    backgroundColor: '#f9f9f9',
  },
  toggleText: {
    fontFamily: 'PlusSB',
    fontSize: 15,
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleTextInactive: {
    color: '#666',
  },
});
