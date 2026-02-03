import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import useGeneral from '../../../../hooks/useGeneral';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Organization = () => {
  const navigation = useNavigation();
  const { saveOrganization, getOrganization, organizationData, loading, error, success } = useGeneral();
  const [formData, setFormData] = useState({
    name: '',
    gstNo: '',
    officeNo: '',
    contactNo: '',
    email: '',
    website: '',
    organizationCode: '',
    logo: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch organization data on component mount
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoadingData(true);
        const data = await getOrganization();

        console.log('Fetched organization data:', data);

        // If data exists, populate the form
        if (data) {
          // Format logo string if it exists and doesn't have data URI prefix
          let logoUri = data.logoString || null;
          if (logoUri && !logoUri.startsWith('data:') && !logoUri.startsWith('file:') && !logoUri.startsWith('http')) {
            logoUri = `data:image/png;base64,${logoUri}`;
          }

          setFormData({
            name: data.name || '',
            gstNo: data.gstNo || '',
            officeNo: data.officeNo || '',
            contactNo: data.contactNo || '',
            email: data.email || '',
            website: data.webSite || '',
            organizationCode: data.organizationCode || '',
            logo: logoUri,
          });
        }
      } catch (err) {
        console.log('Error fetching organization data:', err);
        // Keep form empty if no data exists
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchOrganizationData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload logo!');
      return;
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      handleInputChange('logo', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name) {
      Alert.alert('Validation Error', 'Organization name is required!');
      return;
    }

    try {
      let logoString = '';

      if (formData.logo) {
        // If it's a file URI (newly picked image), convert to base64
        if (formData.logo.startsWith('file://')) {
          try {
            const base64 = await FileSystem.readAsStringAsync(formData.logo, {
              encoding: FileSystem.EncodingType.Base64,
            });
            logoString = base64; // Send only the base64 string without prefix
          } catch (error) {
            console.error('Error converting image to base64:', error);
            Alert.alert('Error', 'Failed to process image');
            return;
          }
        }
        // If it's already a data URI (existing logo from server), extract base64
        else if (formData.logo.startsWith('data:image')) {
          const base64Data = formData.logo.split(',')[1];
          logoString = base64Data;
        }
        // If it's already plain base64, use as is
        else {
          logoString = formData.logo;
        }
      }

      const organizationData = {
        ...formData,
        logoString,
      };

      await saveOrganization(organizationData);
      Alert.alert('Success', 'Organization details saved successfully!');
    } catch (err) {
      Alert.alert('Error', error || 'Failed to save organization details');
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      gstNo: '',
      officeNo: '',
      contactNo: '',
      email: '',
      website: '',
      organizationCode: '',
      logo: null,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={hp('3.5%')} color="BLACK" />
          </TouchableOpacity>
          <Text style={styles.title}>Config Organization</Text>
        </View>

        {isLoadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5aaf57" />
            <Text style={styles.loadingText}>Loading organization data...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Logo Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Organization Logo</Text>
              <View style={styles.logoWrapper}>
                <TouchableOpacity style={styles.logoContainer} onPress={pickImage}>
                  {formData.logo ? (
                    <Image source={{ uri: formData.logo }} style={styles.logoImage} />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Ionicons name="image-outline" size={hp('5%')} color="#999" />
                      <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {formData.logo && (
                  <TouchableOpacity
                    style={styles.removeLogoButton}
                    onPress={() => handleInputChange('logo', null)}
                  >
                    <Text style={styles.removeLogoText}>Remove Logo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Organization Details</Text>

              {/* Organization Name */}
              <View style={styles.formRow}>
                <Text style={styles.label}>
                  Organization Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter organization name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>

              {/* GST Number */}
              <View style={styles.formRow}>
                <Text style={styles.label}>GST Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter GST number"
                  value={formData.gstNo}
                  onChangeText={(value) => handleInputChange('gstNo', value)}
                  autoCapitalize="characters"
                />
              </View>

              {/* Office Number */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Office Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter office number"
                  value={formData.officeNo}
                  onChangeText={(value) => handleInputChange('officeNo', value)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Contact Number */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter contact number"
                  value={formData.contactNo}
                  onChangeText={(value) => handleInputChange('contactNo', value)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Email */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Website */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter website URL"
                  value={formData.website}
                  onChangeText={(value) => handleInputChange('website', value)}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Organization Code */}
              <View style={styles.formRow}>
                <Text style={styles.label}>Organization Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter organization code"
                  value={formData.organizationCode}
                  onChangeText={(value) => handleInputChange('organizationCode', value)}
                  autoCapitalize="characters"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  disabled={loading}
                >
                  <Ionicons name="refresh-outline" size={hp('2.5%')} color="#666" />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Ionicons name="checkmark-circle-outline" size={hp('2.5%')} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: wp('5%')
  },
  header: {
    paddingVertical: hp('2%'),
    marginBottom: hp('1%'),
  },
  title: {
    fontSize: hp('4%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginLeft: wp('4%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 3,
  },
  cardTitle: {
    fontSize: hp('2.2%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.5%'),
  },
  logoWrapper: {
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
  },
  logoContainer: {
    width: wp('35%'),
    height: wp('35%'),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  logoPlaceholderText: {
    marginTop: hp('1%'),
    fontSize: hp('1.5%'),
    color: '#999',
    fontFamily: 'PlusR',
  },
  removeLogoButton: {
    marginTop: hp('1.5%'),
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fee',
    borderRadius: 6,
  },
  removeLogoText: {
    color: '#e74c3c',
    fontSize: hp('1.7%'),
    fontFamily: 'PlusSB',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  label: {
    width: wp('30%'),
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
    padding: wp('2%'),
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontFamily: 'PlusR',
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
    borderRadius: 8,
    marginRight: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  resetButtonText: {
    color: '#666',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
    marginLeft: wp('1.5%'),
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5aaf57',
    paddingVertical: hp('1.2%'),
    borderRadius: 8,
    marginLeft: wp('2%'),
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontFamily: 'PlusSB',
    marginLeft: wp('1.5%'),
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('5%'),
  },
  loadingText: {
    marginTop: hp('1.5%'),
    fontSize: hp('2%'),
    color: '#666',
    fontFamily: 'PlusR',
  },
});

export default Organization;
