import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useLeave } from '../../../../../hooks/useLeave';

const LeaveSetup = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('leaveType');
  
  // Leave Type State
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    leaveName: '',
    usersCategory: '',
    leavesEncashment: '',
    gender: '',
    leaveCarriedForward: '',
    maxCarryForward: '',
  });
  const [editingLeaveType, setEditingLeaveType] = useState(null);

  // Leave Rules State
  const [leaveRulesForm, setLeaveRulesForm] = useState({
    leaveTypeId: '',
    designationId: '',
    employeeTypeId: '',
    maxLimitPerMonth: '',
    maxLeavesPerMonth: '',
    maxLeavesPerYear: '',
    leaveTypeCode: '',
  });
  const [editingLeaveRule, setEditingLeaveRule] = useState(null);

  const {
    leaveTypes,
    leaveRules,
    userCategories,
    designations,
    employeeTypes,
    loading,
    error,
    getAllLeaveTypes,
    getAllLeaveRules,
    fetchUserCategories,
    fetchDesignations,
    fetchEmployeeTypes,
    saveLeaveType,
    updateLeaveType,
    deleteLeaveType,
    saveLeaveRule,
    deleteLeaveRule,
  } = useLeave();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      getAllLeaveTypes(),
      getAllLeaveRules(),
      fetchUserCategories(),
      fetchDesignations(),
      fetchEmployeeTypes(),
    ]);
  };

  // Leave Type Functions
  const handleLeaveTypeSubmit = async () => {
    try {
      if (!leaveTypeForm.leaveName?.trim()) {
        Alert.alert('Validation Error', 'Leave Name is required');
        return;
      }
      if (!leaveTypeForm.leavesEncashment) {
        Alert.alert('Validation Error', 'Leave Encashment is required');
        return;
      }
      if (!leaveTypeForm.gender) {
        Alert.alert('Validation Error', 'Gender Restriction is required');
        return;
      }
      if (!leaveTypeForm.leaveCarriedForward) {
        Alert.alert('Validation Error', 'Leave Carried Forward is required');
        return;
      }

      const payload = {
        leaveName: leaveTypeForm.leaveName.trim(),
        usersCategoryId: leaveTypeForm.usersCategory || null,
        leavesEncashment: leaveTypeForm.leavesEncashment,
        gender: leaveTypeForm.gender,
        leaveCarriedForward: leaveTypeForm.leaveCarriedForward,
        maxCarryForward:
          leaveTypeForm.leaveCarriedForward === 'yes' &&
          leaveTypeForm.maxCarryForward
            ? leaveTypeForm.maxCarryForward
            : null,
      };

      if (editingLeaveType) {
        await updateLeaveType(editingLeaveType.id, payload);
        Alert.alert('Success', 'Leave Type updated successfully');
      } else {
        await saveLeaveType(payload);
        Alert.alert('Success', 'Leave Type created successfully');
      }

      resetLeaveTypeForm();
      await getAllLeaveTypes();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save Leave Type');
    }
  };

  const handleEditLeaveType = (leaveType) => {
    setEditingLeaveType(leaveType);
    setLeaveTypeForm({
      leaveName: leaveType.leaveName || '',
      usersCategory: leaveType.usersCategory?.id?.toString() || '',
      leavesEncashment: leaveType.leavesEncashment || '',
      gender: leaveType.gender || '',
      leaveCarriedForward: leaveType.leaveCarriedForward || '',
      maxCarryForward: leaveType.maxCarryForward?.toString() || '',
    });
    setActiveTab('leaveType');
  };

  const handleDeleteLeaveType = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Leave Type?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLeaveType(id);
              Alert.alert('Success', 'Leave Type deleted successfully');
              await getAllLeaveTypes();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete Leave Type');
            }
          },
        },
      ]
    );
  };

  const resetLeaveTypeForm = () => {
    setLeaveTypeForm({
      leaveName: '',
      usersCategory: '',
      leavesEncashment: '',
      gender: '',
      leaveCarriedForward: '',
      maxCarryForward: '',
    });
    setEditingLeaveType(null);
  };

  // Leave Rules Functions
  const handleLeaveRulesSubmit = async () => {
    try {
      if (!leaveRulesForm.leaveTypeId) {
        Alert.alert('Validation Error', 'Leave Type is required');
        return;
      }
      if (!leaveRulesForm.designationId) {
        Alert.alert('Validation Error', 'Designation is required');
        return;
      }
      if (!leaveRulesForm.employeeTypeId) {
        Alert.alert('Validation Error', 'Employment Type is required');
        return;
      }
      if (!leaveRulesForm.maxLimitPerMonth) {
        Alert.alert('Validation Error', 'Max. Limit Per Month is required');
        return;
      }

      const payload = {
        leaveTypeId: leaveRulesForm.leaveTypeId,
        designationId: leaveRulesForm.designationId,
        employeeTypeId: leaveRulesForm.employeeTypeId,
        maxLimitPerMonth: leaveRulesForm.maxLimitPerMonth,
        maxLeavesPerMonth: leaveRulesForm.maxLeavesPerMonth || null,
        maxLeavesPerYear: leaveRulesForm.maxLeavesPerYear || null,
        leaveTypeCode: leaveRulesForm.leaveTypeCode || null,
      };

      if (editingLeaveRule) {
        payload.id = editingLeaveRule.id;
      }

      await saveLeaveRule(payload);
      Alert.alert(
        'Success',
        editingLeaveRule ? 'Leave Rule updated successfully' : 'Leave Rule created successfully'
      );

      resetLeaveRulesForm();
      await getAllLeaveRules();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save Leave Rule');
    }
  };

  const handleEditLeaveRule = (rule) => {
    setEditingLeaveRule(rule);
    setLeaveRulesForm({
      leaveTypeId: rule.leaveTypeId?.toString() || '',
      designationId: rule.designationId?.toString() || '',
      employeeTypeId: rule.employeeTypeId?.toString() || '',
      maxLimitPerMonth: rule.maxLimitPerMonth || '',
      maxLeavesPerMonth: rule.maxLeavesPerMonth?.toString() || '',
      maxLeavesPerYear: rule.maxLeavesPerYear?.toString() || '',
      leaveTypeCode: rule.leaveTypeCode?.toString() || '',
    });
    setActiveTab('leaveRules');
  };

  const handleDeleteLeaveRule = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Leave Rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLeaveRule(id);
              Alert.alert('Success', 'Leave Rule deleted successfully');
              await getAllLeaveRules();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete Leave Rule');
            }
          },
        },
      ]
    );
  };

  const resetLeaveRulesForm = () => {
    setLeaveRulesForm({
      leaveTypeId: '',
      designationId: '',
      employeeTypeId: '',
      maxLimitPerMonth: '',
      maxLeavesPerMonth: '',
      maxLeavesPerYear: '',
      leaveTypeCode: '',
    });
    setEditingLeaveRule(null);
  };

  const getLeaveTypeName = (id) => {
    const leaveType = leaveTypes?.find((lt) => lt.id === id);
    return leaveType?.leaveName || 'N/A';
  };

  if (loading && !leaveTypes && !leaveRules) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Menu Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Leave Setup</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaveType' && styles.activeTab]}
              onPress={() => setActiveTab('leaveType')}
            >
              <Text style={[styles.tabText, activeTab === 'leaveType' && styles.activeTabText]}>
                Leave Type
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'leaveRules' && styles.activeTab]}
              onPress={() => setActiveTab('leaveRules')}
            >
              <Text style={[styles.tabText, activeTab === 'leaveRules' && styles.activeTabText]}>
                Leave Rules
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Leave Type Tab */}
          {activeTab === 'leaveType' && (
            <>
              {/* Form Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {editingLeaveType ? 'Edit Leave Type' : 'Configure Leave Type'}
                </Text>

                {/* Leave Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Leave Name<Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={leaveTypeForm.leaveName}
                    onChangeText={(text) =>
                      setLeaveTypeForm({ ...leaveTypeForm, leaveName: text })
                    }
                    placeholder="Enter Leave Name"
                    editable={!loading}
                  />
                </View>

                {/* Leave For */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Leave For<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveTypeForm.usersCategory}
                      onValueChange={(value) =>
                        setLeaveTypeForm({ ...leaveTypeForm, usersCategory: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select User Type---" value="" />
                      {userCategories?.map((category) => (
                        <Picker.Item
                          key={category.id}
                          label={category.categoryName || 'Unknown'}
                          value={category.id?.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Leaves Encashment */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Leaves Encashment<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveTypeForm.leavesEncashment}
                      onValueChange={(value) =>
                        setLeaveTypeForm({ ...leaveTypeForm, leavesEncashment: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Encashment---" value="" />
                      <Picker.Item label="Yes" value="Yes" />
                      <Picker.Item label="No" value="No" />
                    </Picker>
                  </View>
                </View>

                {/* Gender Restriction */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Gender Restriction<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveTypeForm.gender}
                      onValueChange={(value) =>
                        setLeaveTypeForm({ ...leaveTypeForm, gender: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Gender---" value="" />
                      <Picker.Item label="Any" value="Any" />
                      <Picker.Item label="Male" value="Male" />
                      <Picker.Item label="Female" value="Female" />
                    </Picker>
                  </View>
                </View>

                {/* Leave Carried Forward */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Leave Carried Forward<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveTypeForm.leaveCarriedForward}
                      onValueChange={(value) =>
                        setLeaveTypeForm({
                          ...leaveTypeForm,
                          leaveCarriedForward: value,
                        })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Leave Carried---" value="" />
                      <Picker.Item label="Yes" value="yes" />
                      <Picker.Item label="No" value="No" />
                    </Picker>
                  </View>
                </View>

                {/* Max Carry Forward */}
                {leaveTypeForm.leaveCarriedForward === 'yes' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Max Carry Forward</Text>
                    <TextInput
                      style={styles.input}
                      value={leaveTypeForm.maxCarryForward}
                      onChangeText={(text) =>
                        setLeaveTypeForm({ ...leaveTypeForm, maxCarryForward: text })
                      }
                      placeholder="Enter Max Carry Forward"
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                )}

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleLeaveTypeSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {editingLeaveType ? 'Update' : 'Submit'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetLeaveTypeForm}
                    disabled={loading}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Existing Leave Types Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Existing Leave Type(s)</Text>
                <ScrollView horizontal>
                  <View>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, { width: 150 }]}>Leave Name</Text>
                      <Text style={[styles.tableHeaderText, { width: 150 }]}>Encashment</Text>
                      <Text style={[styles.tableHeaderText, { width: 150 }]}>Gender</Text>
                      <Text style={[styles.tableHeaderText, { width: 150 }]}>Carried Forward</Text>
                      <Text style={[styles.tableHeaderText, { width: 100 }]}>Manage</Text>
                    </View>

                    {/* Table Body */}
                    {leaveTypes && leaveTypes.length > 0 ? (
                      leaveTypes.map((leaveType) => (
                        <View key={leaveType.id} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { width: 150 }]}>
                            {leaveType.leaveName || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 150 }]}>
                            {leaveType.leavesEncashment || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 150 }]}>
                            {leaveType.gender || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 150 }]}>
                            {leaveType.leaveCarriedForward || 'N/A'}
                          </Text>
                          <View style={[styles.actionCell, { width: 100 }]}>
                            <View style={styles.actionButtons}>
                              <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => handleEditLeaveType(leaveType)}
                                disabled={loading}
                              >
                                <Feather name="edit" size={18} color="#5aaf57" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => handleDeleteLeaveType(leaveType.id)}
                                disabled={loading}
                              >
                                <Ionicons name="trash" size={18} color="#d32f2f" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No Leave Types added yet</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </>
          )}

          {/* Leave Rules Tab */}
          {activeTab === 'leaveRules' && (
            <>
              {/* Form Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {editingLeaveRule ? 'Edit Leave Rule' : 'Configure Leave Rule'}
                </Text>

                {/* Leave Type */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Leave Type<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveRulesForm.leaveTypeId}
                      onValueChange={(value) =>
                        setLeaveRulesForm({ ...leaveRulesForm, leaveTypeId: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Leave Type---" value="" />
                      {leaveTypes?.map((leaveType) => (
                        <Picker.Item
                          key={leaveType.id}
                          label={leaveType.leaveName || 'Unknown'}
                          value={leaveType.id?.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Job Title */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Job Title<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveRulesForm.designationId}
                      onValueChange={(value) =>
                        setLeaveRulesForm({ ...leaveRulesForm, designationId: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Designation---" value="" />
                      {designations?.map((designation) => (
                        <Picker.Item
                          key={designation.id}
                          label={designation.designation || 'Unknown'}
                          value={designation.id?.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Employment Type */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Employment Type<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveRulesForm.employeeTypeId}
                      onValueChange={(value) =>
                        setLeaveRulesForm({ ...leaveRulesForm, employeeTypeId: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Employee Type---" value="" />
                      {employeeTypes?.map((employeeType) => (
                        <Picker.Item
                          key={employeeType.id}
                          label={employeeType.employeeType || 'Unknown'}
                          value={employeeType.id?.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Max. Limit Per Month */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Max. Limit Per Month?<Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={leaveRulesForm.maxLimitPerMonth}
                      onValueChange={(value) =>
                        setLeaveRulesForm({ ...leaveRulesForm, maxLimitPerMonth: value })
                      }
                      enabled={!loading}
                      style={styles.picker}
                    >
                      <Picker.Item label="---Select Status---" value="" />
                      <Picker.Item label="Yes" value="Yes" />
                      <Picker.Item label="No" value="No" />
                    </Picker>
                  </View>
                </View>

                {/* Max Leaves Per Month */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Max Leaves Per Month</Text>
                  <TextInput
                    style={styles.input}
                    value={leaveRulesForm.maxLeavesPerMonth}
                    onChangeText={(text) =>
                      setLeaveRulesForm({ ...leaveRulesForm, maxLeavesPerMonth: text })
                    }
                    placeholder="Enter Max Leaves Per Month"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>

                {/* Max Leaves Per Year */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Max Leaves Per Year</Text>
                  <TextInput
                    style={styles.input}
                    value={leaveRulesForm.maxLeavesPerYear}
                    onChangeText={(text) =>
                      setLeaveRulesForm({ ...leaveRulesForm, maxLeavesPerYear: text })
                    }
                    placeholder="Enter Max Leaves Per Year"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>

                {/* Leave Type Code */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Leave Type Code</Text>
                  <TextInput
                    style={styles.input}
                    value={leaveRulesForm.leaveTypeCode}
                    onChangeText={(text) =>
                      setLeaveRulesForm({ ...leaveRulesForm, leaveTypeCode: text })
                    }
                    placeholder="Enter Leave Type Code"
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleLeaveRulesSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {editingLeaveRule ? 'Update' : 'Submit'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetLeaveRulesForm}
                    disabled={loading}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Existing Leave Rules Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Existing Leave Rule(s)</Text>
                <ScrollView horizontal>
                  <View>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderText, { width: 120 }]}>Leave Type</Text>
                      <Text style={[styles.tableHeaderText, { width: 150 }]}>Designation</Text>
                      <Text style={[styles.tableHeaderText, { width: 150 }]}>Employment Status</Text>
                      <Text style={[styles.tableHeaderText, { width: 120 }]}>Max Per Period</Text>
                      <Text style={[styles.tableHeaderText, { width: 120 }]}>Max Per Month</Text>
                      <Text style={[styles.tableHeaderText, { width: 120 }]}>Max Per Year</Text>
                      <Text style={[styles.tableHeaderText, { width: 120 }]}>Type Code</Text>
                      <Text style={[styles.tableHeaderText, { width: 100 }]}>Manage</Text>
                    </View>

                    {/* Table Body */}
                    {leaveRules && leaveRules.length > 0 ? (
                      leaveRules.map((rule) => (
                        <View key={rule.id} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { width: 120 }]}>
                            {getLeaveTypeName(rule.leaveTypeId)}
                          </Text>
                          <Text style={[styles.tableCell, { width: 150 }]}>
                            {rule.designation || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 150 }]}>
                            {rule.employeeType || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 120 }]}>
                            {rule.maxLimitPerMonth || 'N/A'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 120 }]}>
                            {rule.maxLeavesPerMonth || '-'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 120 }]}>
                            {rule.maxLeavesPerYear || '-'}
                          </Text>
                          <Text style={[styles.tableCell, { width: 120 }]}>
                            {rule.leaveTypeCode || '-'}
                          </Text>
                          <View style={[styles.actionCell, { width: 100 }]}>
                            <View style={styles.actionButtons}>
                              <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => handleEditLeaveRule(rule)}
                                disabled={loading}
                              >
                                <Feather name="edit" size={18} color="#5aaf57" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={() => handleDeleteLeaveRule(rule.id)}
                                disabled={loading}
                              >
                                <Ionicons name="trash" size={18} color="#d32f2f" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No Leave Rules added yet</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusR',
  },
  header: {
    paddingVertical: 18,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: 16,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#5aaf57',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusR',
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'PlusSB',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontFamily: 'PlusR',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    fontFamily: 'PlusR',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 13,
    fontFamily: 'PlusSB',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default LeaveSetup;
