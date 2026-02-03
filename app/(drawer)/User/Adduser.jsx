import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import useAddUser from '../../../hooks/useAddUser';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Adduser() {
  const navigation = useNavigation();
  const { addUser, loading } = useAddUser();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('dob', selectedDate);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Name is required!');
      return;
    }
    if (!formData.userName.trim()) {
      Alert.alert('Validation Error', 'User Name is required!');
      return;
    }
    if (!formData.mobileNo.trim()) {
      Alert.alert('Validation Error', 'Mobile Number is required!');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required!');
      return;
    }
    if (!formData.password.trim()) {
      Alert.alert('Validation Error', 'Password is required!');
      return;
    }
    if (!formData.gender) {
      Alert.alert('Validation Error', 'Gender is required!');
      return;
    }

    try {
      setSubmitting(true);
      // Call the API hook
      await addUser(formData);
      
      // Success alert is handled by the hook
      // Reset form after successful submission
      handleReset();
    } catch (err) {
      // Error alert is handled by the hook
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header with Drawer Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header Row with Title and Lottie */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Add</Text>
          <Text style={styles.headerSubTitle}>User</Text>
        </View>
        <LottieView
          source={require("../../../assets/svg/EMP.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
          {/* Add User Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Details</Text>

            {/* Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter full name"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(formData.dob)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.dob}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Father Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Father Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fatherName}
                onChangeText={(value) => handleInputChange('fatherName', value)}
                placeholder="Enter father's name"
              />
            </View>

            {/* Mother Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>Mother Name</Text>
              <TextInput
                style={styles.input}
                value={formData.motherName}
                onChangeText={(value) => handleInputChange('motherName', value)}
                placeholder="Enter mother's name"
              />
            </View>

            {/* Mobile Number */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Mobile No <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.mobileNo}
                onChangeText={(value) => handleInputChange('mobileNo', value)}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Email */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* User Name */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                User Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.userName}
                onChangeText={(value) => handleInputChange('userName', value)}
                placeholder="Enter username"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Enter password"
                secureTextEntry
              />
            </View>

            {/* Gender Dropdown */}
            <View style={styles.formRow}>
              <Text style={styles.label}>
                Gender <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
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
              <Text style={styles.label}>Active</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.isActive ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => handleInputChange('isActive', true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.isActive ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !formData.isActive ? styles.toggleButtonActive : styles.toggleButtonInactive,
                  ]}
                  onPress={() => handleInputChange('isActive', false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !formData.isActive ? styles.toggleTextActive : styles.toggleTextInactive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleReset}
                disabled={submitting}
              >
                <Ionicons name="refresh-outline" size={20} color="#666" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? hp('6.5%') : hp('5%'),
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('1.2%'),
    backgroundColor: '#fff',
  },
  menuButton: {
    width: wp('10%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#fff',
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: wp('8%'),
    fontFamily: 'PlusR',
    color: '#222',
    lineHeight: wp('9.5%'),
  },
  headerSubTitle: {
    fontSize: wp('8%'),
    fontFamily: 'PlusSB',
    color: '#5aaf57',
    lineHeight: wp('9.5%'),
  },
  lottie: {
    width: wp('32%'),
    height: wp('32%'),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: wp('5%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: wp('4%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.2%'),
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.2%'),
  },
  label: {
    width: wp('32%'),
    color: '#333',
    fontFamily: 'PlusR',
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: wp('4%'),
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
  },
  dateText: {
    color: '#333',
    fontFamily: 'PlusR',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: wp('2%'),
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    height: hp('5%'),
    color: '#333',
  },
  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: wp('2%'),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp('1%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#5aaf57',
  },
  toggleButtonInactive: {
    backgroundColor: '#f5f5f5',
  },
  toggleText: {
    fontFamily: 'PlusSB',
    fontSize: wp('3.5%'),
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleTextInactive: {
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  resetButtonText: {
    color: '#666',
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    marginLeft: wp('1.5%'),
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    marginLeft: wp('2%'),
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#a8d5a6',
    elevation: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    marginLeft: wp('1.5%'),
  },
});
