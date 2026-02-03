import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import useHr from '../../../../../hooks/useHr';
import useGeneral from '../../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
    loading: leaveLoading,
    error: leaveError,
    getAllLeaveTypes,
    getAllLeaveRules,
    saveLeaveType,
    deleteLeaveType,
    saveLeaveRule,
    deleteLeaveRule,
  } = useLeave();

  const {
    designations,
    employeeTypes,
    loading: hrLoading,
    getAllDesignations,
    getAllEmployeeTypes,
  } = useHr();

  const {
    usersCategories,
    loading: generalLoading,
    getAllUsersCategories,
  } = useGeneral();

  const loading = leaveLoading || hrLoading || generalLoading;
  const error = leaveError;

  // Memoized safe data arrays
  const safeLeaveTypes = useMemo(() => {
    return Array.isArray(leaveTypes) ? leaveTypes.filter(lt => lt && lt.id) : [];
  }, [leaveTypes]);

  const safeLeaveRules = useMemo(() => {
    return Array.isArray(leaveRules) ? leaveRules.filter(lr => lr && lr.id) : [];
  }, [leaveRules]);

  const safeDesignations = useMemo(() => {
    return Array.isArray(designations) ? designations.filter(d => d && d.id) : [];
  }, [designations]);

  const safeEmployeeTypes = useMemo(() => {
    return Array.isArray(employeeTypes) ? employeeTypes.filter(et => et && et.id) : [];
  }, [employeeTypes]);

  const safeUsersCategories = useMemo(() => {
    return Array.isArray(usersCategories) ? usersCategories.filter(uc => uc && uc.id) : [];
  }, [usersCategories]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('LeaveSetup: Loading initial data...');
        const results = await Promise.all([
          getAllLeaveTypes(),
          getAllLeaveRules(),
          getAllUsersCategories(),
          getAllDesignations(),
          getAllEmployeeTypes(),
        ]);
        console.log('LeaveSetup: Data loaded successfully', {
          leaveTypesCount: results[0]?.length || 0,
          leaveRulesCount: results[1]?.length || 0,
          usersCategoriesCount: results[2]?.length || 0,
          designationsCount: results[3]?.length || 0,
          employeeTypesCount: results[4]?.length || 0,
        });
      } catch (error) {
        console.error('Error loading initial data:', error);
        Alert.alert('Error', 'Failed to load initial data. Please try again.');
      }
    };

    loadInitialData();
  }, []);

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
        payload.id = editingLeaveType.id;
      }

      await saveLeaveType(payload);
      Alert.alert('Success', editingLeaveType ? 'Leave Type updated successfully' : 'Leave Type created successfully');

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
        Alert.alert('Validation Error', 'Job Title is required');
        return;
      }
      if (!leaveRulesForm.employeeTypeId) {
        Alert.alert('Validation Error', 'Employment Status is required');
        return;
      }
      if (!leaveRulesForm.maxLimitPerMonth) {
        Alert.alert('Validation Error', 'Max. Limit Per Month is required');
        return;
      }
      if (leaveRulesForm.maxLimitPerMonth === 'Yes' && !leaveRulesForm.maxLeavesPerMonth?.trim()) {
        Alert.alert('Validation Error', 'Max Leaves Per Month is required when Max Limit Per Month is Yes');
        return;
      }

      const payload = {
        leaveTypeId: leaveRulesForm.leaveTypeId,
        designationId: leaveRulesForm.designationId,
        employeeTypeId: leaveRulesForm.employeeTypeId,
        maxLimitPerMonth: leaveRulesForm.maxLimitPerMonth,
        maxLeavesPerMonth: leaveRulesForm.maxLimitPerMonth === 'Yes' ? leaveRulesForm.maxLeavesPerMonth : null,
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
    try {
      if (!rule || !rule.id) {
        console.error('Invalid rule data:', rule);
        Alert.alert('Error', 'Invalid leave rule data');
        return;
      }
      
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
    } catch (error) {
      console.error('Error in handleEditLeaveRule:', error);
      Alert.alert('Error', 'Failed to edit leave rule');
    }
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

  const getLeaveTypeName = useCallback((id) => {
    try {
      if (!id) return 'N/A';
      const leaveType = safeLeaveTypes.find((lt) => lt.id === id);
      return leaveType?.leaveName || 'N/A';
    } catch (error) {
      console.error('Error in getLeaveTypeName:', error);
      return 'N/A';
    }
  }, [safeLeaveTypes]);

  const getDesignationName = useCallback((id) => {
    try {
      if (!id) return 'N/A';
      const designation = safeDesignations.find((d) => d.id === id);
      return designation?.name || 'N/A';
    } catch (error) {
      console.error('Error in getDesignationName:', error);
      return 'N/A';
    }
  }, [safeDesignations]);

  const getEmployeeTypeName = useCallback((id) => {
    try {
      if (!id) return 'N/A';
      const employeeType = safeEmployeeTypes.find((et) => et.id === id);
      return employeeType?.employeeType || 'N/A';
    } catch (error) {
      console.error('Error in getEmployeeTypeName:', error);
      return 'N/A';
    }
  }, [safeEmployeeTypes]);

  if (loading && (safeLeaveTypes.length === 0 || safeLeaveRules.length === 0 || safeDesignations.length === 0 || safeEmployeeTypes.length === 0 || safeUsersCategories.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading Data...</Text>
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
                      {safeUsersCategories.map((category) => (
                        <Picker.Item
                          key={`user-category-${category.id}`}
                          label={category.usersCategory || category.categoryName || 'Unknown'}
                          value={category.id.toString()}
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
                    {safeLeaveTypes.length > 0 ? (
                      safeLeaveTypes.map((leaveType) => (
                        <View key={`leave-type-row-${leaveType.id}`} style={styles.tableRow}>
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
                      {safeLeaveTypes.map((leaveType) => (
                        <Picker.Item
                          key={`leave-type-picker-${leaveType.id}`}
                          label={leaveType.leaveName || 'Unknown'}
                          value={leaveType.id.toString()}
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
                      <Picker.Item label="---Select Job Title---" value="" />
                      {safeDesignations.map((designation) => (
                        <Picker.Item
                          key={`designation-picker-${designation.id}`}
                          label={designation.name || 'Unknown'}
                          value={designation.id.toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Employment Status */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Employment Status<Text style={styles.required}>*</Text>
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
                      <Picker.Item label="---Select Employment Status---" value="" />
                      {safeEmployeeTypes.map((employeeType) => (
                        <Picker.Item
                          key={`employee-type-picker-${employeeType.id}`}
                          label={employeeType.employeeType || 'Unknown'}
                          value={employeeType.id.toString()}
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

                {/* Max Leaves Per Month - Only show if Yes selected */}
                {leaveRulesForm.maxLimitPerMonth === 'Yes' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>
                      Max Leaves Per Month<Text style={styles.required}>*</Text>
                    </Text>
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
                )}

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
                <Text style={styles.cardTitle}>Previously Added Leave Rule(s)</Text>
                {safeDesignations.length === 0 || safeEmployeeTypes.length === 0 || safeLeaveTypes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ActivityIndicator size="small" color="#5aaf57" />
                    <Text style={styles.emptyStateText}>Loading reference data...</Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View>
                      {/* Table Header */}
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, { width: 140 }]}>Leave Type</Text>
                        <Text style={[styles.tableHeaderText, { width: 150 }]}>Job Title</Text>
                        <Text style={[styles.tableHeaderText, { width: 150 }]}>Employment Status</Text>
                        <Text style={[styles.tableHeaderText, { width: 140 }]}>Max Per Period</Text>
                        <Text style={[styles.tableHeaderText, { width: 120 }]}>Max Per Month</Text>
                        <Text style={[styles.tableHeaderText, { width: 120 }]}>Max Per Year</Text>
                        <Text style={[styles.tableHeaderText, { width: 100 }]}>Type Code</Text>
                        <Text style={[styles.tableHeaderText, { width: 100 }]}>Manage</Text>
                      </View>

                      {/* Table Body */}
                      {safeLeaveRules.length > 0 ? (
                        safeLeaveRules.map((rule, index) => (
                          <View key={`rule-row-${rule.id}-${index}`} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { width: 140 }]}>
                              {getLeaveTypeName(rule.leaveTypeId)}
                            </Text>
                            <Text style={[styles.tableCell, { width: 150 }]}>
                              {getDesignationName(rule.designationId)}
                            </Text>
                            <Text style={[styles.tableCell, { width: 150 }]}>
                              {getEmployeeTypeName(rule.employeeTypeId)}
                            </Text>
                            <Text style={[styles.tableCell, { width: 140 }]}>
                              {rule.maxLimitPerMonth || 'N/A'}
                            </Text>
                            <Text style={[styles.tableCell, { width: 120 }]}>
                              {rule.maxLeavesPerMonth || '-'}
                            </Text>
                            <Text style={[styles.tableCell, { width: 120 }]}>
                              {rule.maxLeavesPerYear || '-'}
                            </Text>
                            <Text style={[styles.tableCell, { width: 100 }]}>
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
                          <Text style={styles.emptyStateText}>No Records Found !</Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                )}
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
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: wp('5%') },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: hp('1%'),
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
  header: {
    paddingVertical: hp('2.2%'),
    marginBottom: hp('1%'),
  },
  title: {
    fontSize: wp('8%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: wp('4%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.5%'),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: hp('1.7%'),
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#5aaf57',
  },
  tabText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'PlusSB',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: wp('3%'),
    marginBottom: hp('2%'),
    borderRadius: wp('2%'),
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
  },
  formGroup: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1%'),
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    fontSize: wp('3.5%'),
    color: '#333',
    fontFamily: 'PlusR',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    overflow: 'hidden',
  },
  picker: {
    height: hp('5.5%'),
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginTop: hp('1%'),
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    minWidth: wp('25%'),
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    minWidth: wp('25%'),
  },
  resetButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('2%'),
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  tableHeaderText: {
    fontSize: wp('3.2%'),
    fontFamily: 'PlusSB',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
  },
  tableRow: {
    flexDirection: 'row',
    padding: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: wp('3%'),
    paddingHorizontal: wp('2%'),
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp('3%'),
  },
  iconBtn: {
    padding: wp('1%'),
  },
  emptyState: {
    padding: wp('5%'),
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#999',
    fontFamily: 'PlusR',
    fontSize: wp('3.5%'),
    fontStyle: 'italic',
  },
});

export default LeaveSetup;
