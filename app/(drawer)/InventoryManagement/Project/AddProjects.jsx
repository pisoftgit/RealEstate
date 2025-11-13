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
import { useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions } from '@react-navigation/native';

import useDropdownData from '../../../../hooks/useDropdownData';
import useReraActions from '../../../../hooks/useReraActions';
import useSaveProject from '../../../../hooks/useSaveProject';
import useMeasurementUnits from '../../../../hooks/useMeasurements';
import { getAllPlc, getAllbuilderbyid } from '../../../../services/api';

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
  menuButton: {
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
    <TouchableOpacity 
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
      style={STYLES.menuButton}
    >
      <Ionicons name="menu" size={24} color={COLORS.card} />
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

  const [image, setImage] = useState(null);
  const [imageBytes, setImageBytes] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [loading, setLoading] = useState(false);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState(null);
  const [builderItems, setBuilderItems] = useState([]);

  const [possessionOpen, setPossessionOpen] = useState(false);
  const [possessionValue, setPossessionValue] = useState(null);
  const [possessionItems, setPossessionItems] = useState([
    { label: 'READY_TO_MOVE', value: 'READY_TO_MOVE' },
    { label: 'UNDER_CONSTRUCTION', value: 'UNDER_CONSTRUCTION' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState(null);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [measurementUnitOpen, setMeasurementUnitOpen] = useState(false);
  const [measurementUnitValue, setMeasurementUnitValue] = useState(null);
  const [measurementUnitItems, setMeasurementUnitItems] = useState([
    { label: 'Square Feet', value: 'sq_ft' },
    { label: 'Square Meters', value: 'sq_m' },
    { label: 'Acres', value: 'acres' },
    { label: 'Hectares', value: 'hectares' },
  ]);

  const [plcOpen, setPlcOpen] = useState(false);
  const [plcValue, setPlcValue] = useState(null);
  const [plcItems, setPlcItems] = useState([]);

  const [reraDropdownOpen, setReraDropdownOpen] = useState(false);
  const [reraDropdownValue, setReraDropdownValue] = useState(null);
  const { reras, loading: reraLoading } = useReraActions();

  const [form, setForm] = useState({
    projectName: '',
    startDate: '',
    completionDate: '',
    description: '',
    isGated: false,
    reraApproved: false,
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    area: '',
    addressType: 'COMMERCIAL',
  });

  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showReraCard, setShowReraCard] = useState(form.reraApproved);
  const [reraDetails, setReraDetails] = useState({ reraNo: '', reraDesc: '' });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showCompletionDatePicker, setShowCompletionDatePicker] = useState(false);
  const [addressTypeOpen, setAddressTypeOpen] = useState(false);
  const [addressTypeValue, setAddressTypeValue] = useState('COMMERCIAL');
  const [addressTypeItems] = useState([
    { label: 'Commercial', value: 'COMMERCIAL' },
    { label: 'Residential', value: 'RESIDENTIAL' },
  ]);

  // Dropdown data hook for country, state, district
  const {
    countries,
    states,
    districts,
    loading: dropdownLoading
  } = useDropdownData(null, countryValue, stateValue, null);

  // Fetch PLC and Builder options
  useEffect(() => {
    const fetchPlcAndBuilders = async () => {
      // Fetch PLCs
      const plcList = await getAllPlc();
      setPlcItems(Array.isArray(plcList) ? plcList.map(p => ({ label: p.name, value: p.id?.toString() })) : []);
      // Fetch Builders
      const builderList = await getAllbuilderbyid();
      setBuilderItems(Array.isArray(builderList) ? builderList.map(b => ({ label: b.name, value: b.id?.toString() })) : []);
    };
    fetchPlcAndBuilders();
  }, []);

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

  // Helper to format date as yyyy-MM-dd
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.projectName) newErrors.projectName = 'Project name is required.';
    if (!builderValue) newErrors.builder = 'Builder is required.';
    if (!possessionValue) newErrors.possession = 'Possession status is required.';
    if (!form.startDate) newErrors.startDate = 'Start date is required.';
    if (showReraCard) {
      if (!reraDetails.reraNo) newErrors.reraNo = 'RERA number is required.';
    }
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
    setCountryValue(null);
    setStateValue(null);
    setDistrictValue(null);
    setMeasurementUnitValue(null);
    setPlcValue(null);
    setReraDropdownValue(null);
    setAddressTypeValue('COMMERCIAL');
    setForm({
      projectName: '',
      startDate: '',
      completionDate: '',
      description: '',
      isGated: false,
      reraApproved: false,
      addressLine1: '',
      addressLine2: '',
      city: '',
      pincode: '',
      area: '',
      addressType: 'COMMERCIAL',
    });
    setErrors({});
    setShowReraCard(false);
    setReraDetails({ reraNo: '', reraDesc: '' });
    setMediaFiles([]);
  };

  const saveProject = useSaveProject();

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    
    // Prepare mediaDTOs from media files
    const mediaDTOs = mediaFiles.map(file => ({
      mediaLabel: file.name || 'Project Media',
      contentType: file.type || 'image/png',
      mediaBase64: file.base64 || '',
    }));

    // Prepare payload for saveProject hook according to API requirements
    const payload = {
      builderId: builderValue,
      projectName: form.projectName,
      isGated: form.isGated,
      isReraApproved: form.reraApproved,
      reraId: reraDropdownValue,
      reraNumber: reraDetails.reraNo,
      possessionStatus: possessionValue,
      projectStartDate: form.startDate,
      projectCompletionDate: form.completionDate,
      totalArea: form.area ? parseFloat(form.area) : null,
      areaUnitId: measurementUnitValue,
      description: form.description,
      addressType: addressTypeValue || 'COMMERCIAL',
      address1: form.addressLine1,
      address2: form.addressLine2,
      city: form.city,
      pincode: form.pincode,
      districtId: districtValue,
      stateId: stateValue,
      countryId: countryValue,
      plcIds: plcValue ? (Array.isArray(plcValue) ? plcValue : [plcValue]) : [],
      mediaDTOs: mediaDTOs,
    };

    try {
      await saveProject(payload);
      resetForm();
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  // Fetch measurement units
  const { units: measurementUnits, loading: measurementUnitsLoading } = useMeasurementUnits();

  return (
    <SafeAreaView style={STYLES.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <CustomHeader navigation={navigation} title="Add New Project" />
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
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              style={[STYLES.input, { justifyContent: 'center' }]}
              activeOpacity={0.7}
            >
              <Text style={{ color: form.startDate ? COLORS.text : COLORS.placeholder }}>
                {form.startDate || 'Select Start Date'}
              </Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={form.startDate ? new Date(form.startDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    handleChange('startDate', formatDate(selectedDate));
                  }
                }}
              />
            )}
            {errors.startDate && <Text style={STYLES.errorText}>{errors.startDate}</Text>}

            <RequiredLabel text="Completion Date" isRequired={false} />
            <TouchableOpacity
              onPress={() => setShowCompletionDatePicker(true)}
              style={[STYLES.input, { justifyContent: 'center' }]}
              activeOpacity={0.7}
            >
              <Text style={{ color: form.completionDate ? COLORS.text : COLORS.placeholder }}>
                {form.completionDate || 'Select Completion Date'}
              </Text>
            </TouchableOpacity>
            {showCompletionDatePicker && (
              <DateTimePicker
                value={form.completionDate ? new Date(form.completionDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowCompletionDatePicker(false);
                  if (event.type === 'set' && selectedDate) {
                    handleChange('completionDate', formatDate(selectedDate));
                  }
                }}
              />
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <RequiredLabel text="Area" isRequired={false} />
                <TextInput
                  placeholder="Enter area"
                  value={form.area}
                  onChangeText={text => handleChange('area', text)}
                  style={STYLES.input}
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>
              <View style={{ flex: 1 }}>
                <RequiredLabel text="Measurement Unit" isRequired={false} />
                <DropDownPicker
                  open={measurementUnitOpen}
                  value={measurementUnitValue}
                  items={measurementUnits.map(u => ({ label: u.name, value: u.id }))}
                  setOpen={setMeasurementUnitOpen}
                  setValue={setMeasurementUnitValue}
                  setItems={() => {}}
                  placeholder="Select Unit"
                  style={STYLES.dropdown}
                  dropDownContainerStyle={STYLES.dropdownContainer}
                  listMode="SCROLLVIEW"
                  zIndex={700}
                  loading={measurementUnitsLoading}
                />
              </View>
            </View>

            <RequiredLabel text="PLC" isRequired={false} />
            <DropDownPicker
              open={plcOpen}
              value={plcValue}
              items={plcItems}
              setOpen={setPlcOpen}
              setValue={setPlcValue}
              setItems={setPlcItems}
              placeholder="Select PLC"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={600}
            />

            <RequiredLabel text="Description" isRequired={false} />
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

              <RequiredLabel text="RERA" isRequired={false} />
              <DropDownPicker
                open={reraDropdownOpen}
                value={reraDropdownValue}
                items={reras.map(r => ({ label: r.name, value: r.id }))}
                setOpen={setReraDropdownOpen}
                setValue={setReraDropdownValue}
                setItems={() => {}}
                placeholder="Select RERA"
                style={STYLES.dropdown}
                dropDownContainerStyle={STYLES.dropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={500}
                loading={reraLoading}
              />
            </View>
          )}
          {/* Address Details Section */}
          <View style={STYLES.card}>
            <View style={STYLES.cardHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={STYLES.cardTitle}>Address Details</Text>
            </View>

            <RequiredLabel text="Address Type" isRequired={false} />
            <DropDownPicker
              open={addressTypeOpen}
              value={addressTypeValue}
              items={addressTypeItems}
              setOpen={setAddressTypeOpen}
              setValue={setAddressTypeValue}
              setItems={() => {}}
              placeholder="Select Address Type"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={1100}
            />

            <RequiredLabel text="Country" isRequired={true} />
            <DropDownPicker
              open={countryOpen}
              value={countryValue}
              items={countries}
              setOpen={setCountryOpen}
              setValue={setCountryValue}
              setItems={() => {}}
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
              loading={dropdownLoading}
            />
            {errors.country && <Text style={STYLES.errorText}>{errors.country}</Text>}

            <RequiredLabel text="State" isRequired={true} />
            <DropDownPicker
              open={stateOpen}
              value={stateValue}
              items={states}
              setOpen={setStateOpen}
              setValue={setStateValue}
              setItems={() => {}}
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
              loading={dropdownLoading}
            />
            {errors.state && <Text style={STYLES.errorText}>{errors.state}</Text>}

            <RequiredLabel text="District" isRequired={true} />
            <DropDownPicker
              open={districtOpen}
              value={districtValue}
              items={districts}
              setOpen={setDistrictOpen}
              setValue={setDistrictValue}
              setItems={() => {}}
              placeholder="Select District"
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={800}
              disabled={!stateValue}
              loading={dropdownLoading}
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

            <RequiredLabel text="Pincode" isRequired={false} />
            <TextInput
              placeholder="Enter pincode"
              value={form.pincode}
              onChangeText={text => handleChange('pincode', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
              keyboardType="numeric"
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
                      name="add-circle-outline"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={STYLES.submitButtonText}>
                      Add Project
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