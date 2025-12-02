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
            <Ionicons name="menu" size={28} color="BLACK" />
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
                    <Ionicons name="image-outline" size={40} color="#999" />
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
                <Ionicons name="refresh-outline" size={20} color="#666" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]} 
                onPress={handleSave}
                disabled={loading}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
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
    padding: 20 
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
  logoWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoContainer: {
    width: 150,
    height: 150,
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
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    fontFamily: 'PlusR',
  },
  removeLogoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fee',
    borderRadius: 6,
  },
  removeLogoText: {
    color: '#e74c3c',
    fontSize: 14,
    fontFamily: 'PlusSB',
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
  saveButton: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusR',
  },
});

export default Organization;
