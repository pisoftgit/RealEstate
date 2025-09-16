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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
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
    fontWeight: 'bold',
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
    borderLeftColor: COLORS.primary,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 2,
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
    fontWeight: 'bold',
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
    fontWeight: '600',
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  dropdown: {
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.input,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: COLORS.card,
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
    fontWeight: '700',
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
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  const [image, setImage] = useState(null);
  const [imageBytes, setImageBytes] = useState(null);
  const [imageType, setImageType] = useState(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState(null);
  const [builderItems, setBuilderItems] = useState([
    { label: 'Builder A', value: 'builder_a' },
    { label: 'Builder B', value: 'builder_b' },
    { label: 'Other', value: 'other' },
  ]);

  const [possessionOpen, setPossessionOpen] = useState(false);
  const [possessionValue, setPossessionValue] = useState(null);
  const [possessionItems, setPossessionItems] = useState([
    { label: 'Ready to Move', value: 'ready_to_move' },
    { label: 'Under Construction', value: 'under_construction' },
  ]);

  const [form, setForm] = useState({
    projectName: '',
    startDate: '',
    cost: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.projectName) newErrors.projectName = 'Project name is required.';
    if (!builderValue) newErrors.builder = 'Builder is required.';
    if (!possessionValue) newErrors.possession = 'Possession status is required.';
    if (!form.startDate) newErrors.startDate = 'Start date is required.';
    if (!form.cost) newErrors.cost = 'Cost is required.';
    if (!image) newErrors.image = 'Project image is required.';
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
      cost: '',
      description: '',
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form.');
      return;
    }
    setLoading(true);

    const payload = {
      image: imageBytes,
      imageType: imageType,
      builder: builderValue,
      possessionStatus: possessionValue,
      projectName: form.projectName,
      startDate: form.startDate,
      cost: form.cost,
      description: form.description,
    };

    console.log('Submitting the following data:', payload);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success!', 'Project added successfully.');
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add project. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            <TextInput
              placeholder="e.g., 2023-01-01"
              value={form.startDate}
              onChangeText={text => handleChange('startDate', text)}
              style={STYLES.input}
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.startDate && <Text style={STYLES.errorText}>{errors.startDate}</Text>}

            <RequiredLabel text="Estimated Cost" isRequired={true} />
            <TextInput
              placeholder="Enter total cost"
              value={form.cost}
              onChangeText={text => handleChange('cost', text)}
              style={STYLES.input}
              keyboardType="numeric"
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.cost && <Text style={STYLES.errorText}>{errors.cost}</Text>}
          </View>

          {/* Description Card */}
          <View style={STYLES.card}>
            <View style={STYLES.cardHeader}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              <Text style={STYLES.cardTitle}>More Details</Text>
            </View>
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
          </View>

          {/* Image Upload Card */}
          <View style={STYLES.card}>
            <View style={STYLES.cardHeader}>
              <Ionicons name="image-outline" size={20} color={COLORS.primary} />
              <Text style={STYLES.cardTitle}>Project Image</Text>
            </View>
            <RequiredLabel text="Project Image" isRequired={true} />
            <TouchableOpacity onPress={pickImage} style={STYLES.imagePicker}>
              {image ? (
                <Image source={{ uri: image }} style={STYLES.projectImage} />
              ) : (
                <View style={STYLES.imagePlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
                  <Text style={STYLES.imagePlaceholderText}>Tap to Upload Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.image && <Text style={STYLES.errorText}>{errors.image}</Text>}
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
                    <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={STYLES.submitButtonText}>Add Project</Text>
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




// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   RefreshControl,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from 'expo-router';
// import * as SecureStore from 'expo-secure-store';
// import axios from 'axios';
// import { API_BASE_URL } from '../../../services/api';
// import { LinearGradient } from 'expo-linear-gradient';

// const BANNER_IMAGE_URL = 'https://images.pexels.com/photos/17693722/pexels-photo-17693722.jpeg';

// // --- ADVANCED COLOR PALETTE ---
// const COLORS = {
//   primary: '#2e7d32',    
//   primaryLight: '#58b26e',  
//   secondary: '#8bc34a',     
//   background: '#e8f5e9',  
//   card: '#f4fcf4',         
//   input: '#f0f8f0',          
//   border: '#c8e6c9',         
//   text: '#333333',         
//   placeholder: '#66bb6a',   
//   error: '#d32f2f',         
// };

// const AddProject = () => {
//   const [image, setImage] = useState(null);
//   const [imageBytes, setImageBytes] = useState(null);
//   const [imageType, setImageType] = useState(null);
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

//   const [builderOpen, setBuilderOpen] = useState(false);
//   const [builderValue, setBuilderValue] = useState(null);
//   const [builderItems, setBuilderItems] = useState([
//     { label: 'Builder A', value: 'builder_a' },
//     { label: 'Builder B', value: 'builder_b' },
//     { label: 'Other', value: 'other' },
//   ]);

//   const [possessionOpen, setPossessionOpen] = useState(false);
//   const [possessionValue, setPossessionValue] = useState(null);
//   const [possessionItems, setPossessionItems] = useState([
//     { label: 'Ready to Move', value: 'ready_to_move' },
//     { label: 'Under Construction', value: 'under_construction' },
//   ]);

//   const [form, setForm] = useState({
//     projectName: '',
//     startDate: '',
//     cost: '',
//     description: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [refreshing, setRefreshing] = useState(false);

//   const onRefresh = () => {
//     setRefreshing(true);
//     resetForm();
//     setRefreshing(false);
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       base64: true,
//       quality: 0.5,
//     });
//     if (!result.canceled) {
//       const selectedAsset = result.assets[0];
//       setImage(selectedAsset.uri);
//       setImageBytes(selectedAsset.base64);
//       const fileExtension = selectedAsset.uri.split('.').pop().toLowerCase();
//       const mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' :
//         fileExtension === 'png' ? 'image/png' :
//         fileExtension === 'webp' ? 'image/webp' : 'image/*';
//       setImageType(mimeType);
//     }
//   };

//   const handleChange = (field, value) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
//   };

//   const validateForm = () => {
//     let newErrors = {};
//     if (!form.projectName) newErrors.projectName = 'Project name is required.';
//     if (!builderValue) newErrors.builder = 'Builder is required.';
//     if (!possessionValue) newErrors.possession = 'Possession status is required.';
//     if (!form.startDate) newErrors.startDate = 'Start date is required.';
//     if (!form.cost) newErrors.cost = 'Cost is required.';
//     if (!image) newErrors.image = 'Project image is required.';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const resetForm = () => {
//     setImage(null);
//     setImageBytes(null);
//     setImageType(null);
//     setBuilderValue(null);
//     setPossessionValue(null);
//     setForm({
//       projectName: '',
//       startDate: '',
//       cost: '',
//       description: '',
//     });
//     setErrors({});
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       Alert.alert('Validation Error ', 'Please correct the errors in the form.');
//       return;
//     }
//     setLoading(true);

//     const payload = {
//       image: imageBytes,
//       imageType: imageType,
//       builder: builderValue,
//       possessionStatus: possessionValue,
//       projectName: form.projectName,
//       startDate: form.startDate,
//       cost: form.cost,
//       description: form.description,
//     };

//     console.log('Submitting the following data:', payload);

//     // Simulate API call
//     try {
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         Alert.alert('Success!', 'Project added successfully.');
//         resetForm();
//     } catch (error) {
//         Alert.alert('Error', 'Failed to add project. Please try again.');
//         console.error(error);
//     } finally {
//         setLoading(false);
//     }
//   };

//   const RequiredLabel = ({ text, isRequired }) => (
//     <View style={styles.labelContainer}>
//       <Text style={styles.label}>{text}</Text>
//       {isRequired && <Text style={styles.requiredMark}>*</Text>}
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
//         <ScrollView
//           contentContainerStyle={styles.scrollViewContent}
//           keyboardShouldPersistTaps="handled"
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         >
//           {/* Header/Banner Section */}
//           <View style={styles.bannerContainer}>
//             <Image
//               source={{ uri: BANNER_IMAGE_URL }}
//               style={styles.bannerImage}
//             />
//             <LinearGradient
//               colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
//               style={styles.bannerOverlay}
//             />
//             <View style={styles.headerContent}>
//               <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                 <Ionicons name="arrow-back" size={24} color="#fff" />
//               </TouchableOpacity>
//               <Text style={styles.headerText}>Add New Project</Text>
//             </View>
//           </View>

//           {/* Project Details Card */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Project Information</Text>
//             </View>

//             <RequiredLabel text="Project Name" isRequired={true} />
//             <TextInput
//               placeholder="Enter project name"
//               value={form.projectName}
//               onChangeText={text => handleChange('projectName', text)}
//               style={styles.input}
//               placeholderTextColor={COLORS.placeholder}
//             />
//             {errors.projectName && <Text style={styles.errorText}>{errors.projectName}</Text>}

//             <RequiredLabel text="Builder" isRequired={true} />
//             <DropDownPicker
//               open={builderOpen}
//               value={builderValue}
//               items={builderItems}
//               setOpen={setBuilderOpen}
//               setValue={setBuilderValue}
//               setItems={setBuilderItems}
//               placeholder="Select Builder"
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               listMode="SCROLLVIEW"
//               zIndex={3000}
//             />
//             {errors.builder && <Text style={styles.errorText}>{errors.builder}</Text>}

//             <RequiredLabel text="Possession Status" isRequired={true} />
//             <DropDownPicker
//               open={possessionOpen}
//               value={possessionValue}
//               items={possessionItems}
//               setOpen={setPossessionOpen}
//               setValue={setPossessionValue}
//               setItems={setPossessionItems}
//               placeholder="Select Possession Status"
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               listMode="SCROLLVIEW"
//               zIndex={2000}
//             />
//             {errors.possession && <Text style={styles.errorText}>{errors.possession}</Text>}

//             <RequiredLabel text="Start Date" isRequired={true} />
//             <TextInput
//               placeholder="e.g., 2023-01-01"
//               value={form.startDate}
//               onChangeText={text => handleChange('startDate', text)}
//               style={styles.input}
//               placeholderTextColor={COLORS.placeholder}
//             />
//             {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}

//             <RequiredLabel text="Estimated Cost" isRequired={true} />
//             <TextInput
//               placeholder="Enter total cost"
//               value={form.cost}
//               onChangeText={text => handleChange('cost', text)}
//               style={styles.input}
//               keyboardType="numeric"
//               placeholderTextColor={COLORS.placeholder}
//             />
//             {errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}
//           </View>
          
//           {/* Description Card */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
//               <Text style={styles.cardTitle}>More Details</Text>
//             </View>
            
//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               placeholder="Enter a detailed description of the project"
//               value={form.description}
//               onChangeText={text => handleChange('description', text)}
//               style={[styles.input, styles.textArea]}
//               multiline
//               numberOfLines={4}
//               placeholderTextColor={COLORS.placeholder}
//             />
//           </View>

//           {/* Image Upload Card */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Ionicons name="image-outline" size={20} color={COLORS.primary} />
//               <Text style={styles.cardTitle}>Project Image</Text>
//             </View>
//             <RequiredLabel text="Project Image" isRequired={true} />
//             <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
//               {image ? (
//                 <Image source={{ uri: image }} style={styles.projectImage} />
//               ) : (
//                 <View style={styles.imagePlaceholder}>
//                   <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} />
//                   <Text style={styles.imagePlaceholderText}>Tap to Upload Image</Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//             {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
//           </View>

//           <TouchableOpacity 
//             style={styles.submitButton} 
//             onPress={handleSubmit}
//             disabled={loading}
//           >
//             <LinearGradient
//               colors={[COLORS.primary, COLORS.secondary]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={styles.submitButtonGradient}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Add Project</Text>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>

//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//     paddingBottom: 20,
//   },
//   bannerContainer: {
//     width: '100%',
//     height: 300,
//     marginBottom: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     overflow: 'hidden',
//     position: 'relative',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   bannerImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   bannerOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   headerContent: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//     paddingTop: 120,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     top: 40,
//     zIndex: 1,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   headerText: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   card: {
//     backgroundColor: COLORS.card,
//     borderRadius: 15,
//     padding: 20,
//     marginHorizontal: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   cardTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: COLORS.primary,
//     marginLeft: 10,
//   },
//   labelContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//     marginTop: 10,
//   },
//   label: {
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   requiredMark: {
//     color: COLORS.error,
//     marginLeft: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: COLORS.input,
//     color: COLORS.text,
//     fontSize: 16,
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   dropdown: {
//     borderColor: COLORS.border,
//     marginBottom: 15,
//     backgroundColor: COLORS.input,
//   },
//   dropdownContainer: {
//     borderColor: COLORS.border,
//     borderWidth: 1,
//     borderRadius: 8,
//     backgroundColor: COLORS.card,
//   },
//   errorText: {
//     color: COLORS.error,
//     fontSize: 12,
//     marginBottom: 10,
//     marginTop: -10,
//   },
//   imagePicker: {
//     height: 180,
//     backgroundColor: COLORS.input,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 15,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: COLORS.secondary,
//     borderStyle: 'dashed',
//     overflow: 'hidden',
//   },
//   projectImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   imagePlaceholder: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imagePlaceholderText: {
//     color: COLORS.primary,
//     marginTop: 10,
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   submitButton: {
//     marginHorizontal: 16,
//     borderRadius: 10,
//     overflow: 'hidden',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     elevation: 12,
//   },
//   submitButtonGradient: {
//     padding: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//   },
// });

// export default AddProject;