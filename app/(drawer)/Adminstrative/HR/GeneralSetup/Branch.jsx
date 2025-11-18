import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Branch() {
  const navigation = useNavigation();

  // View state: 'form' or 'list'
  const [activeView, setActiveView] = useState('form');

  // Form states
  const [organization, setOrganization] = useState('');
  const [branchName, setBranchName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstApplied, setGstApplied] = useState('No');
  const [gstNumber, setGstNumber] = useState('');
  const [authorizedPersonName, setAuthorizedPersonName] = useState('');
  const [authorizedPersonContact, setAuthorizedPersonContact] = useState('');
  const [authorizedPersonEmail, setAuthorizedPersonEmail] = useState('');
  const [authorizedPersonDesignation, setAuthorizedPersonDesignation] = useState('');
  const [signatureImage, setSignatureImage] = useState(null);
  
  const [editing, setEditing] = useState(null);
  const [branches, setBranches] = useState([
    {
      id: 1,
      code: 'BR001',
      organization: 'ABC Corp',
      branchName: 'Main Branch',
      country: 'India',
      state: 'Maharashtra',
      district: 'Mumbai',
      address1: '123 Main Street',
      address2: 'Near City Center',
      city: 'Mumbai',
      pincode: '400001',
      gstApplied: 'Yes',
      gstNumber: '27AABCU9603R1ZM',
      authorizedPersonName: 'John Doe',
      authorizedPersonContact: '9876543210',
      authorizedPersonEmail: 'john@example.com',
      authorizedPersonDesignation: 'Manager',
      signatureImage: null,
    },
  ]);

  // Dropdown data
  const organizations = ['ABC Corp', 'XYZ Ltd', 'PQR Industries'];
  const countries = ['India', 'USA', 'UK'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka'];
  const districts = ['Mumbai', 'Pune', 'Thane'];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSignatureImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!organization.trim()) {
      Alert.alert('Validation Error', 'Please select organization!');
      return;
    }
    if (!branchName.trim()) {
      Alert.alert('Validation Error', 'Please enter branch name!');
      return;
    }
    if (!country.trim()) {
      Alert.alert('Validation Error', 'Please select country!');
      return;
    }
    if (!state.trim()) {
      Alert.alert('Validation Error', 'Please select state!');
      return;
    }
    if (!district.trim()) {
      Alert.alert('Validation Error', 'Please select district!');
      return;
    }

    try {
      if (editing) {
        // Update existing branch
        setBranches(prev =>
          prev.map(item =>
            item.id === editing.id
              ? {
                  ...item,
                  organization,
                  branchName,
                  country,
                  state,
                  district,
                  address1,
                  address2,
                  city,
                  pincode,
                  gstApplied,
                  gstNumber,
                  authorizedPersonName,
                  authorizedPersonContact,
                  authorizedPersonEmail,
                  authorizedPersonDesignation,
                  signatureImage,
                }
              : item
          )
        );
        Alert.alert('Success', 'Branch updated successfully!');
        setEditing(null);
      } else {
        // Add new branch
        const newBranch = {
          id: branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1,
          code: `BR${String(branches.length + 1).padStart(3, '0')}`,
          organization,
          branchName,
          country,
          state,
          district,
          address1,
          address2,
          city,
          pincode,
          gstApplied,
          gstNumber,
          authorizedPersonName,
          authorizedPersonContact,
          authorizedPersonEmail,
          authorizedPersonDesignation,
          signatureImage,
        };
        setBranches(prev => [...prev, newBranch]);
        Alert.alert('Success', 'Branch added successfully!');
      }

      // Reset form
      resetForm();
    } catch (e) {
      Alert.alert('Error', 'Failed to save branch');
    }
  };

  const resetForm = () => {
    setOrganization('');
    setBranchName('');
    setCountry('');
    setState('');
    setDistrict('');
    setAddress1('');
    setAddress2('');
    setCity('');
    setPincode('');
    setGstApplied('No');
    setGstNumber('');
    setAuthorizedPersonName('');
    setAuthorizedPersonContact('');
    setAuthorizedPersonEmail('');
    setAuthorizedPersonDesignation('');
    setSignatureImage(null);
  };

  const handleEdit = (item) => {
    setOrganization(item.organization);
    setBranchName(item.branchName);
    setCountry(item.country);
    setState(item.state);
    setDistrict(item.district);
    setAddress1(item.address1);
    setAddress2(item.address2);
    setCity(item.city);
    setPincode(item.pincode);
    setGstApplied(item.gstApplied);
    setGstNumber(item.gstNumber);
    setAuthorizedPersonName(item.authorizedPersonName);
    setAuthorizedPersonContact(item.authorizedPersonContact);
    setAuthorizedPersonEmail(item.authorizedPersonEmail);
    setAuthorizedPersonDesignation(item.authorizedPersonDesignation);
    setSignatureImage(item.signatureImage);
    setEditing(item);
    setActiveView('form');
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Branch', 'Are you sure you want to delete this branch?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setBranches(prev => prev.filter(item => item.id !== id));
          Alert.alert('Success', 'Branch deleted successfully!');
        },
      },
    ]);
  };

  const handleView = (item) => {
    Alert.alert(
      'Branch Details',
      `Organization: ${item.organization}\nBranch: ${item.branchName}\nCity: ${item.city}\nAuthorized Person: ${item.authorizedPersonName}`
    );
  };

  const handleCancel = () => {
    setEditing(null);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Branch Management</Text>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeView === 'form' && styles.activeToggleButton]}
            onPress={() => setActiveView('form')}
          >
            <Text style={[styles.toggleButtonText, activeView === 'form' && styles.activeToggleButtonText]}>
              Configure Branch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeView === 'list' && styles.activeToggleButton]}
            onPress={() => setActiveView('list')}
          >
            <Text style={[styles.toggleButtonText, activeView === 'list' && styles.activeToggleButtonText]}>
              Existing Branches
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeView === 'form' ? (
            /* Configure Branch Form */
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {editing ? 'Edit Branch' : 'Configure Branch'}
              </Text>

              {/* Organization */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  Organization <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.input}>
                  <TextInput
                    style={styles.dropdownInput}
                    value={organization}
                    onChangeText={setOrganization}
                    placeholder="Select organization"
                  />
                </View>
              </View>

              {/* Branch Name */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  Branch Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={branchName}
                  onChangeText={setBranchName}
                  placeholder="Enter branch name"
                />
              </View>

              {/* Country */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  Country <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.input}>
                  <TextInput
                    style={styles.dropdownInput}
                    value={country}
                    onChangeText={setCountry}
                    placeholder="Select country"
                  />
                </View>
              </View>

              {/* State */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  State <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.input}>
                  <TextInput
                    style={styles.dropdownInput}
                    value={state}
                    onChangeText={setState}
                    placeholder="Select state"
                  />
                </View>
              </View>

              {/* District */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  District <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.input}>
                  <TextInput
                    style={styles.dropdownInput}
                    value={district}
                    onChangeText={setDistrict}
                    placeholder="Select district"
                  />
                </View>
              </View>

              {/* Address 1 */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Address 1</Text>
                <TextInput
                  style={styles.input}
                  value={address1}
                  onChangeText={setAddress1}
                  placeholder="Enter address line 1"
                />
              </View>

              {/* Address 2 */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Address 2</Text>
                <TextInput
                  style={styles.input}
                  value={address2}
                  onChangeText={setAddress2}
                  placeholder="Enter address line 2"
                />
              </View>

              {/* City */}
              <View style={styles.formRow}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                />
              </View>

              {/* Pincode */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="Enter pincode"
                  keyboardType="numeric"
                />
              </View>

              {/* GST Applied */}
              <View style={styles.formRow}>
                <Text style={styles.label}>GST Applied</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setGstApplied('Yes')}
                  >
                    <View style={styles.radioCircle}>
                      {gstApplied === 'Yes' && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.radioText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setGstApplied('No')}
                  >
                    <View style={styles.radioCircle}>
                      {gstApplied === 'No' && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.radioText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* GST Number */}
              {gstApplied === 'Yes' && (
                <View style={styles.formRow}>
                  <Text style={styles.label}>GST Number</Text>
                  <TextInput
                    style={styles.input}
                    value={gstNumber}
                    onChangeText={setGstNumber}
                    placeholder="Enter GST number"
                  />
                </View>
              )}

              {/* Authorized Person Name */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Authorized Person Name</Text>
                <TextInput
                  style={styles.input}
                  value={authorizedPersonName}
                  onChangeText={setAuthorizedPersonName}
                  placeholder="Enter authorized person name"
                />
              </View>

              {/* Authorized Person Contact */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Authorized Person Contact</Text>
                <TextInput
                  style={styles.input}
                  value={authorizedPersonContact}
                  onChangeText={setAuthorizedPersonContact}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Authorized Person Email */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Authorized Person Email</Text>
                <TextInput
                  style={styles.input}
                  value={authorizedPersonEmail}
                  onChangeText={setAuthorizedPersonEmail}
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
              </View>

              {/* Authorized Person Designation */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Authorized Person Designation</Text>
                <TextInput
                  style={styles.input}
                  value={authorizedPersonDesignation}
                  onChangeText={setAuthorizedPersonDesignation}
                  placeholder="Enter designation"
                />
              </View>

              {/* Authorized Signature Photo */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Authorized Signature</Text>
                <View style={styles.photoContainer}>
                  <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                    <Ionicons name="camera" size={24} color="#5aaf57" />
                    <Text style={styles.photoButtonText}>Pick Signature</Text>
                  </TouchableOpacity>
                  {signatureImage && (
                    <Image source={{ uri: signatureImage }} style={styles.imagePreview} />
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
              </TouchableOpacity>

              {/* Cancel Button (shown only when editing) */}
              {editing && (
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* Existing Branches List */
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Existing Branches</Text>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Signature</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Code</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Name</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Action</Text>
              </View>

              {/* Table Rows */}
              {branches.length > 0 ? (
                branches.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      {item.signatureImage ? (
                        <Image source={{ uri: item.signatureImage }} style={styles.thumbnailImage} />
                      ) : (
                        <View style={styles.noImagePlaceholder}>
                          <Ionicons name="image-outline" size={20} color="#999" />
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{item.code}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.branchName}</Text>
                    <View style={[styles.actionCell, { flex: 1.5 }]}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                        <Feather name="edit" size={18} color="#5aaf57" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                        <Ionicons name="trash" size={18} color="#d32f2f" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleView(item)}>
                        <Feather name="eye" size={18} color="#2196F3" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No branches found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#5aaf57',
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'PlusSB',
    color: '#666',
  },
  activeToggleButtonText: {
    color: '#fff',
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
    width: 140,
    color: '#333',
    fontFamily: 'PlusR',
    fontSize: 13,
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
  dropdownInput: {
    color: '#333',
    fontFamily: 'PlusR',
  },
  radioContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5aaf57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5aaf57',
  },
  radioText: {
    color: '#333',
    fontFamily: 'PlusR',
  },
  photoContainer: {
    flex: 1,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#5aaf57',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#5aaf57',
    fontFamily: 'PlusR',
  },
  imagePreview: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
    resizeMode: 'contain',
  },
  submitButton: {
    backgroundColor: '#5aaf57',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5aaf57',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableHeaderText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'PlusSB',
    fontSize: 14,
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
    fontSize: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    width: 40,
    height: 30,
    borderRadius: 4,
    resizeMode: 'contain',
  },
  noImagePlaceholder: {
    width: 40,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
