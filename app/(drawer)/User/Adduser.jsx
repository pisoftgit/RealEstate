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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';

export default function Adduser() {
  const navigation = useNavigation();

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

  const handleSubmit = () => {
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

    // Submit logic here
    console.log('Form Data:', formData);
    Alert.alert('Success', 'User added successfully!', [
      {
        text: 'OK',
        onPress: () => {
          // Reset form
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
        },
      },
    ]);
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
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Ionicons name="refresh-outline" size={20} color="#666" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
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
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 120,
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
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
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
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: '#333',
  },
  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
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
    fontSize: 14,
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
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'PlusSB',
    marginLeft: 6,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5aaf57',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
    marginLeft: 6,
  },
});
