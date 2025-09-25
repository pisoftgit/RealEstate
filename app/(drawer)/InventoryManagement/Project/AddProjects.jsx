import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const BANNER_IMAGE_URL = 'https://images.pexels.com/photos/17693722/pexels-photo-17693722.jpeg';

// --- ADVANCED COLOR PALETTE ---
const COLORS = {
  primary: '#2e7d32',
  primaryLight: '#58b26e',
  secondary: '#8bc34a',
  background: '#e8f5e9',
  card: '#f4fcf4',
  input: '#f0f8f0',
  border: '#c8e6c9',
  text: '#333333',
  placeholder: '#66bb6a',
  error: '#d32f2f',
};

const STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  bannerContainer: {
    height: 250,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, // Increased shadow opacity for a thicker effect
    shadowRadius: 15, // Increased shadow radius for a thicker effect
    elevation: 15, // Increased elevation for a thicker effect
  },

  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontFamily: 'PlusSB',
    color: COLORS.card,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    
   
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'PlusSB',
    color: COLORS.primary,
    marginLeft: 10,
  },

  // Form element styles
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  label: {
    fontFamily: 'PlusR',
    color: COLORS.text,
  },
  requiredMark: {
    color: COLORS.error,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: COLORS.input,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: 'PlusL',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: 'PlusR',
    marginTop: -10,
    marginBottom: 10,
  },
  dropdown: {
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.input,
    marginBottom: 15,
    fontFamily: 'PlusR', // Added font family for dropdown
  },
  dropdownContainer: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    fontFamily: 'PlusR', // Added font family for dropdown container
  },

  // Image picker styles
  imagePicker: {
    height: 180,
    backgroundColor: COLORS.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: COLORS.primary,
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'PlusR',
  },

  // Submit button styles
  submitButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  submitButtonGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PlusSB',
    textTransform: 'uppercase',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'PlusR',
    color: COLORS.text,
    flex: 1,
  },
});

// Custom Header Component
const CustomHeader = ({ navigation, title }) => (
  <View style={STYLES.bannerContainer}>
    <Image
      source={{ uri: BANNER_IMAGE_URL }}
      style={STYLES.bannerImage}
    />
    <LinearGradient
      colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
      style={STYLES.headerOverlay}
    >
      <Text style={STYLES.headerText}>{title}</Text>
    </LinearGradient>
    <TouchableOpacity onPress={() => navigation.goBack()} style={STYLES.backButton}>
      <Ionicons name="arrow-back" size={24} color={COLORS.card} />
    </TouchableOpacity>
  </View>
);

// Custom Required Label Component
const RequiredLabel = ({ text, isRequired }) => (
  <View style={STYLES.labelContainer}>
    <Text style={STYLES.label}>{text}</Text>
    {isRequired && <Text style={STYLES.requiredMark}>*</Text>}
  </View>
);

const AddProject = () => {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Check if we're in edit mode
  const isEditMode = params.editMode === 'true';
  const editingProperty = isEditMode && params.propertyData ? JSON.parse(params.propertyData) : null;

  const [image, setImage] = useState(isEditMode && editingProperty ? editingProperty.pic : null);
  const [imageBytes, setImageBytes] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [loading, setLoading] = useState(false);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState(isEditMode && editingProperty ? editingProperty.builderName : null);
  const [builderItems, setBuilderItems] = useState([
    { label: 'Builder A', value: 'builder_a' },
    { label: 'Builder B', value: 'builder_b' },
    { label: 'Eco Builders', value: 'Eco Builders' },
    { label: 'Urban Homes Inc.', value: 'Urban Homes Inc.' },
    { label: 'Luxury Estates Co.', value: 'Luxury Estates Co.' },
    { label: 'Country Living Ltd.', value: 'Country Living Ltd.' },
    { label: 'Corporate Devs', value: 'Corporate Devs' },
    { label: 'Other', value: 'other' },
  ]);

  const [possessionOpen, setPossessionOpen] = useState(false);
  const [possessionValue, setPossessionValue] = useState(isEditMode && editingProperty ? editingProperty.possessionStatus : null);
  const [possessionItems, setPossessionItems] = useState([
    { label: 'Ready to Move', value: 'Ready to Move' },
    { label: 'Under Construction', value: 'Under Construction' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Planning Phase', value: 'Planning Phase' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [countryItems, setCountryItems] = useState([]);

  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState(null);
  const [stateItems, setStateItems] = useState([]);

  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);
  const [districtItems, setDistrictItems] = useState([]);

  const [form, setForm] = useState({
    projectName: isEditMode && editingProperty ? editingProperty.projectName : '',
    startDate: isEditMode && editingProperty ? editingProperty.startDate : '',
    completionDate: isEditMode && editingProperty ? editingProperty.completionDate : '',
    cost: '',
    description: isEditMode && editingProperty ? editingProperty.description : '',
    address: isEditMode && editingProperty ? editingProperty.address : '',
    propertyNature: isEditMode && editingProperty ? editingProperty.propertyNature : '',
    isGated: isEditMode && editingProperty ? editingProperty.isGated : false,
    reraApproved: isEditMode && editingProperty ? editingProperty.reraApproved : false,
    addressLine1: '',
    addressLine2: '',
    city: '',
  });

  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showReraCard, setShowReraCard] = useState(form.reraApproved);
  const [reraDetails, setReraDetails] = useState({ reraNo: '', reraDesc: '' });
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const mockCountryData = [{ id: 1, country: 'USA' }, { id: 2, country: 'India' }];
        const formatted = mockCountryData.map(item => ({
          label: item.country,
          value: item.id,
        }));
        setCountryItems(formatted);
      } catch (err) {
        console.error('Error loading countries', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!countryValue) return;
      try {
        const mockStateData = countryValue === 1
          ? [{ id: 101, state: 'California' }, { id: 102, state: 'Texas' }]
          : [{ id: 201, state: 'Maharashtra' }, { id: 202, state: 'Delhi' }];
        setStateItems(mockStateData.map(state => ({ label: state.state, value: state.id })));
        setStateValue(null);
      } catch (err) {
        console.error('Error loading states', err);
      }
    };
    fetchStates();
  }, [countryValue]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!stateValue) return;
      try {
        const mockDistrictData = stateValue === 201
          ? [{ id: 2001, district: 'Mumbai' }, { id: 2002, district: 'Pune' }]
          : stateValue === 202
            ? [{ id: 2003, district: 'New Delhi' }, { id: 2004, district: 'North Delhi' }]
            : [];
        setDistrictItems(mockDistrictData.map(d => ({ label: d.district, value: d.id })));
        setDistrictValue(null);
      } catch (err) {
        console.error('Error loading districts', err);
      }
    };
    fetchDistricts();
  }, [stateValue]);

  const onRefresh = () => {
    setRefreshing(true);
    resetForm();
    setRefreshing(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setImage(selectedAsset.uri);
      setImageBytes(selectedAsset.base64);
      const fileExtension = selectedAsset.uri.split('.').pop().toLowerCase();
      const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' :
        fileExtension === 'png' ? 'image/png' :
          fileExtension === 'webp' ? 'image/webp' : 'image/*';
      setImageType(mimeType);
    }
  };

  const pickPdfFiles = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
    });
    if (result.type === 'success') {
      setMediaFiles(prev => [
        ...prev,
        {
          uri: result.uri,
          type: 'application/pdf',
          name: result.name,
        },
      ]);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'reraApproved') {
      setShowReraCard(value);
    }
  };

  const handleReraDetailsChange = (field, value) => {
    setReraDetails(prev => ({ ...prev, [field]: value }));
  };

  const pickMediaFiles = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (!result.canceled) {
      const selectedAssets = result.assets;
      setMediaFiles(selectedAssets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64,
        type: asset.type || (asset.uri.endsWith('.pdf') ? 'application/pdf' : 'image/*'),
        name: asset.fileName || asset.uri.split('/').pop(),
      })));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.projectName) newErrors.projectName = 'Project name is required.';
    if (!builderValue) newErrors.builder = 'Builder is required.';
    if (!possessionValue) newErrors.possession = 'Possession status is required.';
    if (!form.startDate) newErrors.startDate = 'Start date is required.';
    // Cost is not required for edit mode if not present in original data
    if (!isEditMode && !form.cost) newErrors.cost = 'Cost is required.';
    if (!image) newErrors.image = 'Project image is required.';
    if (showReraCard) {
      if (!reraDetails.reraNo) newErrors.reraNo = 'RERA number is required.';
    }
    if (mediaFiles.length === 0) newErrors.mediaFiles = 'At least one media file is required.';
    if (!countryValue) newErrors.country = 'Country is required.';
    if (!stateValue) newErrors.state = 'State is required.';
    if (!districtValue) newErrors.district = 'District is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setImage(null);
    setImageBytes(null);
    setImageType(null);
    setBuilderValue(null);
    setPossessionValue(null);
    setForm({
      projectName: '',
      startDate: '',
      completionDate: '',
      cost: '',
      description: '',
      address: '',
      propertyNature: '',
      isGated: false,
      reraApproved: false,
    });
    setErrors({});
    setShowReraCard(false);
    setReraDetails({ reraNo: '', reraDesc: '' });
    setMediaFiles([]);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    setLoading(true);

    const payload = {
      id: isEditMode ? editingProperty.id : null,
      image: imageBytes,
      imageType: imageType,
      builder: builderValue,
      possessionStatus: possessionValue,
      projectName: form.projectName,
      startDate: form.startDate,
      completionDate: form.completionDate,
      cost: form.cost,
      description: form.description,
      address: form.address,
      propertyNature: form.propertyNature,
      isGated: form.isGated,
      reraApproved: form.reraApproved,
      reraNo: reraDetails.reraNo,
      reraDesc: reraDetails.reraDesc,
      mediaFiles: mediaFiles,
    };

    console.log(`${isEditMode ? 'Updating' : 'Submitting'} the following data:`, payload);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success!', `Project ${isEditMode ? 'updated' : 'added'} successfully.`);
      if (!isEditMode) {
        resetForm();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} project. Please try again.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={STYLES.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <CustomHeader navigation={navigation} title={isEditMode ? "Edit Project" : "Add New Project"} />
        <ScrollView
          contentContainerStyle={STYLES.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {/* Project Details Card */}
          <View style={STYLES.card}>
            <View style={STYLES.cardHeader}>
              <Text style={STYLES.cardTitle}>Project Information</Text>
            </View>

            <RequiredLabel text="Project Name" isRequired={true} />
            <TextInput
              placeholder="Enter project name"
              value={form.projectName}
              onChangeText={text => handleChange('projectName', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.projectName && <Text style={STYLES.errorText}>{errors.projectName}</Text>}

            <RequiredLabel text="Builder" isRequired={true} />
            <DropDownPicker
              open={builderOpen}
              value={builderValue}
              items={builderItems}
              setOpen={setBuilderOpen}
              setValue={setBuilderValue}
              setItems={setBuilderItems}
              placeholder="Select Builder"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={3000}
            />
            {errors.builder && <Text style={STYLES.errorText}>{errors.builder}</Text>}

            <RequiredLabel text="Possession Status" isRequired={true} />
            <DropDownPicker
              open={possessionOpen}
              value={possessionValue}
              items={possessionItems}
              setOpen={setPossessionOpen}
              setValue={setPossessionValue}
              setItems={setPossessionItems}
              placeholder="Select Possession Status"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={2000}
            />
            {errors.possession && <Text style={STYLES.errorText}>{errors.possession}</Text>}

            <RequiredLabel text="Start Date" isRequired={true} />
            <TextInput
              placeholder="e.g., 2023-01-01"
              value={form.startDate}
              onChangeText={text => handleChange('startDate', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.startDate && <Text style={STYLES.errorText}>{errors.startDate}</Text>}

            
            

            <RequiredLabel text="Completion Date" isRequired={false} />
            <TextInput
              placeholder="e.g., 2025-12-31"
              value={form.completionDate}
              onChangeText={text => handleChange('completionDate', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />

            <RequiredLabel text="Property Nature" isRequired={false} />
            <TextInput
              placeholder="e.g., residential, commercial"
              value={form.propertyNature}
              onChangeText={text => handleChange('propertyNature', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />
             <Text style={STYLES.label}>Description</Text>
            <TextInput
              placeholder="Enter a detailed description of the project"
              value={form.description}
              onChangeText={text => handleChange('description', text)}
              style={[STYLES.input, STYLES.textArea]}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.placeholder}
            />

            <View style={STYLES.switchContainer}>
              <Text style={STYLES.switchLabel}>Is Gated Community?</Text>
              <Switch
                value={form.isGated}
                onValueChange={(value) => handleChange('isGated', value)}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={form.isGated ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={STYLES.switchContainer}>
              <Text style={STYLES.switchLabel}>RERA Approved?</Text>
              <Switch
                value={form.reraApproved}
                onValueChange={(value) => handleChange('reraApproved', value)}
                trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                thumbColor={form.reraApproved ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>
         
          
          {/* RERA Card (conditional) */}
          {showReraCard && (
            <View style={STYLES.card}>
              <View style={STYLES.cardHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                <Text style={STYLES.cardTitle}>RERA Details</Text>
              </View>
              <RequiredLabel text="RERA No." isRequired={true} />
              <TextInput
                placeholder="Enter RERA Number"
                value={reraDetails.reraNo}
                onChangeText={text => handleReraDetailsChange('reraNo', text)}
                style={STYLES.input}
                placeholderTextColor={COLORS.placeholder}
              />
              {errors.reraNo && <Text style={STYLES.errorText}>{errors.reraNo}</Text>}

              <RequiredLabel text="Description" isRequired={false} />
              <TextInput
                placeholder="Enter RERA Description"
                value={reraDetails.reraDesc}
                onChangeText={text => handleReraDetailsChange('reraDesc', text)}
                style={STYLES.input}
                placeholderTextColor={COLORS.placeholder}
              />
            </View>
          )}
          {/* Address Details Section */}
          <View style={STYLES.card}>
            <View style={STYLES.cardHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={STYLES.cardTitle}>Address Details</Text>
            </View>

           

            <RequiredLabel text="Country" isRequired={true} />
            <DropDownPicker
              open={countryOpen}
              value={countryValue}
              items={countryItems}
              setOpen={setCountryOpen}
              setValue={setCountryValue}
              setItems={setCountryItems}
              placeholder="Select Country"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={1000}
              onChangeValue={(value) => {
                setCountryValue(value);
                setStateValue(null);
                setDistrictValue(null);
              }}
            />
            {errors.country && <Text style={STYLES.errorText}>{errors.country}</Text>}

            <RequiredLabel text="State" isRequired={true} />
            <DropDownPicker
              open={stateOpen}
              value={stateValue}
              items={stateItems}
              setOpen={setStateOpen}
              setValue={setStateValue}
              setItems={setStateItems}
              placeholder="Select State"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={900}
              disabled={!countryValue}
              onChangeValue={(value) => {
                setStateValue(value);
                setDistrictValue(null);
              }}
            />
            {errors.state && <Text style={STYLES.errorText}>{errors.state}</Text>}

            <RequiredLabel text="District" isRequired={true} />
            <DropDownPicker
              open={districtOpen}
              value={districtValue}
              items={districtItems}
              setOpen={setDistrictOpen}
              setValue={setDistrictValue}
              setItems={setDistrictItems}
              placeholder="Select District"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={800}
              disabled={!stateValue}
            />
            {errors.district && <Text style={STYLES.errorText}>{errors.district}</Text>}
           <RequiredLabel text="City" isRequired={false} />
            <TextInput
              placeholder="Enter city"
              value={form.city}
              onChangeText={text => handleChange('city', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />

            <RequiredLabel text="Address Line 1" isRequired={false} />
            <TextInput
              placeholder="Enter address line 1"
              value={form.addressLine1}
              onChangeText={text => handleChange('addressLine1', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />

            <RequiredLabel text="Address Line 2" isRequired={false} />
            <TextInput
              placeholder="Enter address line 2"
              value={form.addressLine2}
              onChangeText={text => handleChange('addressLine2', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />
          
          </View>


          {/* Media Files Card */}
          <View style={STYLES.card}>
            <View style={STYLES.cardHeader}>
              <Ionicons name="folder-outline" size={20} color={COLORS.primary} />
              <Text style={STYLES.cardTitle}>Media Files</Text>
            </View>
            <RequiredLabel text="Media Files (Images/PDFs)" isRequired={true} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <TouchableOpacity onPress={pickMediaFiles} style={[STYLES.imagePicker, { flex: 1, marginRight: 5 }]}> 
                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                <Text style={STYLES.imagePlaceholderText}>Pick Images</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickPdfFiles} style={[STYLES.imagePicker, { flex: 1, marginLeft: 5 }]}> 
                <Ionicons name="document-outline" size={24} color={COLORS.primary} />
                <Text style={STYLES.imagePlaceholderText}>Pick PDFs</Text>
              </TouchableOpacity>
            </View>
            {mediaFiles.length > 0 ? (
              <ScrollView horizontal>
                {mediaFiles.map((file, idx) => (
                  file.type.startsWith('image') ? (
                    <Image key={idx} source={{ uri: file.uri }} style={{ width: 80, height: 80, margin: 5, borderRadius: 8 }} />
                  ) : (
                    <View key={idx} style={{ margin: 5, alignItems: 'center' }}>
                      <Ionicons name="document-outline" size={32} color={COLORS.primary} />
                      <Text style={{ fontSize: 12, color: COLORS.text }}>{file.name}</Text>
                    </View>
                  )
                ))}
              </ScrollView>
            ) : (
              <View style={STYLES.imagePlaceholder}>
                <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                <Text style={STYLES.imagePlaceholderText}>Tap to Upload Media Files</Text>
              </View>
            )}
            {errors.mediaFiles && <Text style={STYLES.errorText}>{errors.mediaFiles}</Text>}
          </View>

          {/* Submit Button */}
          <View style={STYLES.submitButton}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={STYLES.submitButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons 
                      name={isEditMode ? "checkmark-circle-outline" : "add-circle-outline"} 
                      size={20} 
                      color="#fff" 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={STYLES.submitButtonText}>
                      {isEditMode ? 'Update Project' : 'Add Project'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddProject;