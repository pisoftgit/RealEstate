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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../../../services/api';

const AddProperties = () => {
  const [image, setImage] = useState(null);
  const [imageBytes, setImageBytes] = useState(null);
  const [imageType, setImageType] = useState(null);
  const Navigation = useNavigation();

  // Dropdown states
  const [builderNatureOpen, setBuilderNatureOpen] = useState(false);
  const [builderNatureValue, setBuilderNatureValue] = useState(null);
  const [builderNatureItems, setBuilderNatureItems] = useState([
    { label: 'Other', value: 'other' },
    { label: 'Self', value: 'self' },
    { label: 'Builder', value: 'builder' },
  ]);

  const [propertyNatureOpen, setPropertyNatureOpen] = useState(false);
  const [propertyNatureValue, setPropertyNatureValue] = useState(null);
  const [propertyNatureItems, setPropertyNatureItems] = useState([
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
  ]);

  const [residentialPropertyOpen, setResidentialPropertyOpen] = useState(false);
  const [residentialPropertyValue, setResidentialPropertyValue] = useState(null);
  const [residentialPropertyItems, setResidentialPropertyItems] = useState([
    { label: 'Housing Group', value: 'housing_group' },
    { label: 'Farmhouse', value: 'farmhouse' },
    { label: 'House Villa', value: 'house_villa' },
    { label: 'Apartments', value: 'apartments' },
  ]);

  const [commercialPropertyOpen, setCommercialPropertyOpen] = useState(false);
  const [commercialPropertyValue, setCommercialPropertyValue] = useState(null);
  const [commercialPropertyItems, setCommercialPropertyItems] = useState([
    { label: 'Office Space', value: 'office_space' },
    { label: 'Showroom', value: 'showroom' },
    { label: 'Shop', value: 'shop' },
    { label: 'Plot', value: 'plot' },
    { label: 'Hospitality (Hotel)', value: 'hospitality' },
    { label: 'Warehouse', value: 'warehouse' },
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

  const [gated, setGated] = useState(null);

  // Form state - 'propertyId' is removed
  const [form, setForm] = useState({
    projectName: '',
    builderName: '',
    housingGroupName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
  });

  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Restored: Fetching countries from API
  const fetchInitialData = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const countryRes = await fetch(`${API_BASE_URL}/employee/countries`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'secret_key': secretKey },
      });
      const countryData = await countryRes.json();
      const formattedCountries = countryData.map(country => ({
        label: country.country,
        value: country.id,
      }));
      setCountryItems(formattedCountries);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Restored: Fetching states from API based on country
  useEffect(() => {
    const fetchStates = async () => {
      if (!countryValue) return;
      try {
        const secretKey = await SecureStore.getItemAsync('auth_token');
        const res = await fetch(`${API_BASE_URL}/employee/getStatesByCountryId/${countryValue}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'secret_key': secretKey },
        });
        const data = await res.json();
        const formatted = data.map(state => ({
          label: state.state,
          value: state.id,
        }));
        setStateItems(formatted);
        setStateValue(null);
      } catch (err) {
        console.error('Error fetching states:', err);
      }
    };
    fetchStates();
  }, [countryValue]);

  // Restored: Fetching districts from API based on state
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!stateValue) return;
      try {
        const secretKey = await SecureStore.getItemAsync('auth_token');
        const res = await fetch(`${API_BASE_URL}/employee/getDistrictByStateId/${stateValue}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'secret_key': secretKey },
        });
        const data = await res.json();
        const formatted = data.map(district => ({
          label: district.district,
          value: district.id,
        }));
        setDistrictItems(formatted);
        setDistrictValue(null);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistricts();
  }, [stateValue]);

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
      const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg'
        : fileExtension === 'png' ? 'image/png'
          : fileExtension === 'webp' ? 'image/webp'
            : 'image/*';
      setImageType(mimeType);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    // 'propertyId' validation removed as per your request
    if (!builderNatureValue) newErrors.builderNature = 'Builder nature is required';
    if (!propertyNatureValue) newErrors.propertyNature = 'Property nature is required';
    if (propertyNatureValue === 'residential' && !residentialPropertyValue) {
      newErrors.residentialProperty = 'Residential property type is required';
    }
    if (propertyNatureValue === 'commercial' && !commercialPropertyValue) {
      newErrors.commercialProperty = 'Commercial property type is required';
    }
    if (!countryValue) newErrors.country = 'Country is required';
    if (!stateValue) newErrors.state = 'State is required';
    if (!districtValue) newErrors.district = 'District is required';
    if (gated === null) newErrors.gated = 'Gated status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setImage(null);
    setImageBytes(null);
    setImageType(null);
    setBuilderNatureValue(null);
    setPropertyNatureValue(null);
    setResidentialPropertyValue(null);
    setCommercialPropertyValue(null);
    setCountryValue(null);
    setStateValue(null);
    setDistrictValue(null);
    setGated(null);
    setForm({
      projectName: '',
      builderName: '',
      housingGroupName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
    });
    setErrors({});
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    resetForm();
    setRefreshing(false);
  };

  // const handleSubmit = async () => {
  //   if (!validateForm()) {
  //     Alert.alert('Validation Error', 'Please correct the errors in the form');
  //     return;
  //   }

  //   try {
  //     const secretKey = await SecureStore.getItemAsync('auth_token');
  //     const payload = {
  //       dp: imageBytes,
  //       dpDocumentType: imageType,
  //       builderNature: builderNatureValue,
  //       propertyNature: propertyNatureValue,
  //       project: form.projectName,
  //       builder: form.builderName,
  //       residentialPropertyType: residentialPropertyValue,
  //       commercialPropertyType: commercialPropertyValue,
  //       housingGroupName: form.housingGroupName,
  //       isGated: gated,
  //       addressDetails: {
  //         addressType: 'property',
  //         address1: form.addressLine1,
  //         address2: form.addressLine2,
  //         city: form.city,
  //         district: {
  //           id: districtValue,
  //           state: {
  //             id: stateValue,
  //             country: {
  //               id: countryValue,
  //             },
  //           },
  //         },
  //       },
  //     };

  //     const response = await axios.post(
  //       `${API_BASE_URL}/realestateProperty/addRealestateProperty`,
  //       payload,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'secret_key': secretKey,
  //         },
  //       }
  //     );

  //     if (response.status === 200 || response.status === 201) {
  //       Alert.alert('Success', 'Property added successfully!');
  //       resetForm();
  //     }
  //   } catch (error) {
  //     console.error('Error submitting property:', error);
  //     Alert.alert('Error', 'Failed to add property. Please try again.');
  //   }
  // };



  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    // Create the payload with the form data
    const payload = {
      dp: imageBytes,
      dpDocumentType: imageType,
      builderNature: builderNatureValue,
      propertyNature: propertyNatureValue,
      project: form.projectName,
      builder: form.builderName,
      residentialPropertyType: residentialPropertyValue,
      commercialPropertyType: commercialPropertyValue,
      housingGroupName: form.housingGroupName,
      isGated: gated,
      addressDetails: {
        addressType: 'property',
        address1: form.addressLine1,
        address2: form.addressLine2,
        city: form.city,
        district: {
          id: districtValue,
          state: {
            id: stateValue,
            country: {
              id: countryValue,
            },
          },
        },
      },
    };

    console.log('Submitting the following data:', payload);
    const alertMessage = `
    Form Submitted! 
    
    Builder Nature: ${builderNatureValue || 'N/A'}
    Property Nature: ${propertyNatureValue || 'N/A'}
    Project Name: ${form.projectName || 'N/A'}
    Builder Name: ${form.builderName || 'N/A'}
    Is Gated: ${gated !== null ? (gated ? 'Yes' : 'No') : 'N/A'}
    Address: ${form.addressLine1 || 'N/A'}, ${form.city || 'N/A'}
    `;
    Alert.alert('Form Data Submitted', alertMessage);
    resetForm();
  };


  const RequiredLabel = ({ text, isRequired }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.label}>{text}</Text>
      {isRequired && <Text style={styles.requiredMark}>*</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => Navigation.openDrawer()}>
              <Ionicons name="menu" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              Add <Text style={styles.headerHighlight}>Property</Text>
            </Text>
          </View>

          {/* Image Picker */}
          {/* <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.propertyImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color="#888" />
                <Text style={styles.imagePlaceholderText}>Upload Property Image</Text>
              </View>
            )}
          </TouchableOpacity> */}

          {/* Property Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>

            <RequiredLabel text="Property Nature" isRequired={true} />
            <DropDownPicker
              open={propertyNatureOpen}
              value={propertyNatureValue}
              items={propertyNatureItems}
              setOpen={setPropertyNatureOpen}
              setValue={value => {
                setPropertyNatureValue(value);
                setErrors(prev => ({ ...prev, propertyNature: '' }));
              }}
              setItems={setPropertyNatureItems}
              placeholder="Select Property Nature"
              listMode="SCROLLVIEW"
              style={[styles.input, { padding: 12 }]}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={5000}
            />
            {errors.propertyNature && <Text style={styles.errorText}>{errors.propertyNature}</Text>}

            {propertyNatureValue === 'residential' && (
              <>
                <RequiredLabel text="Residential Property Type" isRequired={true} />
                <DropDownPicker
                  open={residentialPropertyOpen}
                  value={residentialPropertyValue}
                  items={residentialPropertyItems}
                  setOpen={setResidentialPropertyOpen}
                  setValue={value => {
                    setResidentialPropertyValue(value);
                    setErrors(prev => ({ ...prev, residentialProperty: '' }));
                  }}
                  setItems={setResidentialPropertyItems}
                  placeholder="Select Type"
                  listMode="SCROLLVIEW"
                  style={[styles.input, { padding: 12 }]}
                  dropDownContainerStyle={styles.dropDownContainer}
                  zIndex={4000}
                />
                {errors.residentialProperty && <Text style={styles.errorText}>{errors.residentialProperty}</Text>}

                {residentialPropertyValue && (
                  <>
                    <RequiredLabel text={`${residentialPropertyValue.replace(/_/g, ' ')} Name`} isRequired={false} />
                    <TextInput
                      placeholder={`Enter ${residentialPropertyValue.replace(/_/g, ' ')} Name`}
                      value={form.housingGroupName}
                      onChangeText={text => handleChange('housingGroupName', text)}
                      style={styles.input}
                    />
                  </>
                )}
              </>
            )}

            {propertyNatureValue === 'commercial' && (
              <>
                <RequiredLabel text="Commercial Property Type" isRequired={true} />
                <DropDownPicker
                  open={commercialPropertyOpen}
                  value={commercialPropertyValue}
                  items={commercialPropertyItems}
                  setOpen={setCommercialPropertyOpen}
                  setValue={value => {
                    setCommercialPropertyValue(value);
                    setErrors(prev => ({ ...prev, commercialProperty: '' }));
                  }}
                  setItems={setCommercialPropertyItems}
                  placeholder="Select Type"
                  listMode="SCROLLVIEW"
                  style={[styles.input, { padding: 12 }]}
                  dropDownContainerStyle={styles.dropDownContainer}
                  zIndex={4000}
                />
                {errors.commercialProperty && <Text style={styles.errorText}>{errors.commercialProperty}</Text>}
              </>
            )}

            <RequiredLabel text="Builder Nature" isRequired={true} />
            <DropDownPicker
              open={builderNatureOpen}
              value={builderNatureValue}
              items={builderNatureItems}
              setOpen={setBuilderNatureOpen}
              setValue={value => {
                setBuilderNatureValue(value);
                setErrors(prev => ({ ...prev, builderNature: '' }));
              }}
              setItems={setBuilderNatureItems}
              placeholder="Select Builder Nature"
              listMode="SCROLLVIEW"
              style={[styles.input, { padding: 12 }]}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={3000}
            />
            {errors.builderNature && <Text style={styles.errorText}>{errors.builderNature}</Text>}

            <RequiredLabel text="Project Name" isRequired={false} />
            <TextInput
              placeholder="Enter Project Name"
              value={form.projectName}
              onChangeText={text => handleChange('projectName', text)}
              style={styles.input}
            />

            <RequiredLabel text="Builder Name" isRequired={false} />
            <TextInput
              placeholder="Enter Builder Name"
              value={form.builderName}
              onChangeText={text => handleChange('builderName', text)}
              style={styles.input}
            />

            <RequiredLabel text="Gated Community" isRequired={true} />
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioBtn, gated === true && styles.radioBtnSelected]}
                onPress={() => {
                  setGated(true);
                  setErrors(prev => ({ ...prev, gated: '' }));
                }}
              >
                <Text style={gated === true ? styles.radioBtnTextSelected : styles.radioBtnText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioBtn, gated === false && styles.radioBtnSelected]}
                onPress={() => {
                  setGated(false);
                  setErrors(prev => ({ ...prev, gated: '' }));
                }}
              >
                <Text style={gated === false ? styles.radioBtnTextSelected : styles.radioBtnText}>No</Text>
              </TouchableOpacity>
            </View>
            {errors.gated && <Text style={styles.errorText}>{errors.gated}</Text>}
          </View>

          {/* Address Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            <RequiredLabel text="Country" isRequired={true} />
            <DropDownPicker
              open={countryOpen}
              value={countryValue}
              items={countryItems}
              setOpen={setCountryOpen}
              setValue={value => {
                setCountryValue(value);
                setErrors(prev => ({ ...prev, country: '' }));
              }}
              setItems={setCountryItems}
              placeholder="Select Country"
              listMode="SCROLLVIEW"
              style={[styles.input, { padding: 12 }]}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={2000}
            />
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

            <RequiredLabel text="State" isRequired={true} />
            <DropDownPicker
              open={stateOpen}
              value={stateValue}
              items={stateItems}
              setOpen={setStateOpen}
              setValue={value => {
                setStateValue(value);
                setErrors(prev => ({ ...prev, state: '' }));
              }}
              setItems={setStateItems}
              placeholder="Select State"
              listMode="SCROLLVIEW"
              style={[styles.input, { padding: 12 }]}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={1000}
            />
            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

            <RequiredLabel text="District" isRequired={true} />
            <DropDownPicker
              open={districtOpen}
              value={districtValue}
              items={districtItems}
              setOpen={setDistrictOpen}
              setValue={value => {
                setDistrictValue(value);
                setErrors(prev => ({ ...prev, district: '' }));
              }}
              setItems={setDistrictItems}
              placeholder="Select District"
              listMode="SCROLLVIEW"
              style={[styles.input, { padding: 12 }]}
              dropDownContainerStyle={styles.dropDownContainer}
              zIndex={500}
            />
            {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

            <RequiredLabel text="City" isRequired={false} />
            <TextInput
              placeholder="Enter City"
              value={form.city}
              onChangeText={text => handleChange('city', text)}
              style={styles.input}
            />
            <RequiredLabel text="Address Line 1" isRequired={false} />
            <TextInput
              placeholder="Enter Address Line 1"
              value={form.addressLine1}
              onChangeText={text => handleChange('addressLine1', text)}
              style={styles.input}
            />
            <RequiredLabel text="Address Line 2" isRequired={false} />
            <TextInput
              placeholder="Enter Address Line 2"
              value={form.addressLine2}
              onChangeText={text => handleChange('addressLine2', text)}
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Add Property</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  scrollViewContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 32,
    // fontFamily: 'PlusSB',
    marginLeft: 16,
    color: '#333',
  },
  headerHighlight: {
    color: '#5aaf57',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 30,
  },
  propertyImage: {
    width: 150,
    height: 150,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#eef2f6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#888',
    marginTop: 5,
    fontSize: 12,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff',
    // fontFamily: 'PlusR',
    color: '#333',
  },
  inputError: {
    borderColor: 'red',
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    color: '#555',
    // fontFamily: 'PlusR',
  },
  requiredMark: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    marginLeft: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 10,
  },
  radioBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  radioBtnSelected: {
    backgroundColor: '#5aaf57',
    borderColor: '#5aaf57',
  },
  radioBtnText: {
    color: '#555',
  },
  radioBtnTextSelected: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#5aaf57',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    // fontFamily: 'PlusSB',
  },
  dropDownContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
};

export default AddProperties;