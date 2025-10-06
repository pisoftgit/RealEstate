// ... आपके ऊपर वाले imports वही रहेंगे
import React, { useState, useEffect } from "react";
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
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL } from "../../../../services/api";
import useBusinessNature from '../../../../hooks/useBusinessNature';
import useDropdownData from '../../../../hooks/useDropdownData';

const COLORS = {
  primary: "#2e7d32",
  primaryLight: "#58b26e",
  secondary: "#8bc34a",
  background: "#e8f5e9",
  card: "#f4fcf4",
  input: "#f0f8f0",
  border: "#c8e6c9",
  text: "#202020ff",
  placeholder: "#66bb6a",
  error: "#d32f2f",
};

const CustomHeader = ({ navigation, title }) => (
  <View style={STYLES.bannerContainer}>
    <Image
      source={{
        uri: "https://images.pexels.com/photos/1546168/pexels-photo-1546168.jpeg",
      }}
      style={STYLES.bannerImage}
    />
    <LinearGradient
      colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
      style={STYLES.headerOverlay}
    >
      <Text style={STYLES.headerText}>{title}</Text>
    </LinearGradient>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={STYLES.backButton}
    >
      <Ionicons name="arrow-back" size={24} color={COLORS.card} />
    </TouchableOpacity>
  </View>
);

const CustomCard = ({ children, title, icon }) => (
  <View style={STYLES.card}>
    <View style={STYLES.cardHeader}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <Text style={[STYLES.cardTitle, { marginLeft: 10 }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const RequiredLabel = ({ text }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
    <Text style={STYLES.label}>{text}</Text>
    <Text style={STYLES.requiredMark}>*</Text>
  </View>
);

const AddBuilder = () => {
  const navigation = useNavigation();

  const [builderLogo, setBuilderLogo] = useState(null);
  const [logoBytes, setLogoBytes] = useState(null);
  const [logoType, setLogoType] = useState(null);
  const [loading, setLoading] = useState(false);

  // 👉 Address toggle radio
  const [hasAddress, setHasAddress] = useState(true);

  const [form, setForm] = useState({
    builderNature: null,
    name: "",
    mobile: "",
    email: "",
    website: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    isHeadOffice: false,
  });

  const [errors, setErrors] = useState({});

  // Builder Nature dropdown
  const [natureOpen, setNatureOpen] = useState(false);
  const { businessNatures, loading: natureLoading } = useBusinessNature();
  const natureItems = businessNatures.map((item) => ({
    label: item.name,
    value: item.code,
  }));

  // Country dropdown
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);

  // State dropdown
  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState(null);

  // District dropdown
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  // Use the same data fetching logic as AddressDetailsForm
  const { countries, states, districts } = useDropdownData(
    null, // Pass null for selectedDepartmentId (not used in this form)
    countryValue,
    stateValue,
    null // Pass null for selectedDesignationId (not used in this form)
  );

  // Handle value change for country, state, district with proper reset logic
  const handleLocationChange = (key, value) => {
    console.log(`handleLocationChange: key=${key}, value=${value}`); // Debug log
    if (key === 'country') {
      setCountryValue(value);
      setStateValue(null); // Reset state when country changes
      setDistrictValue(null); // Reset district when country changes
    } else if (key === 'state') {
      setStateValue(value);
      setDistrictValue(null); // Reset district when state changes
    } else if (key === 'district') {
      setDistrictValue(value);
    }
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setBuilderLogo(asset.uri);
      setLogoBytes(asset.base64);
      const ext = asset.uri.split(".").pop().toLowerCase();
      const type =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : "image/*";
      setLogoType(type);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.builderNature) newErrors.builderNature = "Builder Nature is required";
    if (!form.name) newErrors.name = "Builder Name is required";
    if (!form.mobile) newErrors.mobile = "Mobile number is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!logoBytes) newErrors.logo = "Logo is required";
    if (hasAddress) {
      if (!countryValue) newErrors.country = "Country is required";
      if (!stateValue) newErrors.state = "State is required";
      if (!districtValue) newErrors.district = "District is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error 😕", "Please fix form errors.");
      return;
    }
    setLoading(true);

    const payload = {
      builderNature: form.builderNature,
      name: form.name,
      mobileNo: form.mobile,
      email: form.email,
      website: form.website,
      description: form.description,
      isHeadOffice: form.isHeadOffice,
      builderLogo: logoBytes,
      builderLogoType: logoType,
      ...(hasAddress && {
        addressDetails: {
          address1: form.addressLine1,
          address2: form.addressLine2,
          city: form.city,
          district: {
            id: districtValue,
            state: {
              id: stateValue,
              country: { id: countryValue },
            },
          },
        },
      }),
    };

    console.log("Payload:", payload);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert(
        "Success! 🎉",
        "Realtor data submitted successfully! Check console for payload."
      );
    } catch (err) {
      Alert.alert("Error", "Failed to submit Realtor data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={STYLES.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <CustomHeader navigation={navigation} title="Add New Realtor" />
        <ScrollView
          contentContainerStyle={STYLES.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information Card */}
          <CustomCard title="Basic Information" icon="person-add-outline">
            <RequiredLabel text="Builder Nature" />
            <DropDownPicker
              open={natureOpen}
              value={form.builderNature}
              items={natureItems}
              setOpen={setNatureOpen}
              setValue={(callback) =>
                handleChange("builderNature", callback(form.builderNature))
              }
              setItems={() => {}}
              placeholder={natureLoading ? "Loading..." : "Select Builder Nature"}
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              labelStyle={{ fontFamily: 'PlusR', fontSize: 16, color: COLORS.text }}
              zIndex={4000}
              listMode="SCROLLVIEW"
              disabled={natureLoading}
            />
            {errors.builderNature && (
              <Text style={STYLES.errorText}>{errors.builderNature}</Text>
            )}

            <RequiredLabel text="Builder Name" />
            <TextInput
              style={STYLES.input}
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter Builder Name"
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.name && <Text style={STYLES.errorText}>{errors.name}</Text>}

            <RequiredLabel text="Mobile Number" />
            <TextInput
              style={STYLES.input}
              value={form.mobile}
              keyboardType="phone-pad"
              onChangeText={(text) => handleChange("mobile", text)}
              placeholder="Enter Mobile Number"
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.mobile && (
              <Text style={STYLES.errorText}>{errors.mobile}</Text>
            )}

            <RequiredLabel text="Email" />
            <TextInput
              style={STYLES.input}
              value={form.email}
              keyboardType="email-address"
              onChangeText={(text) => handleChange("email", text)}
              placeholder="Enter Email"
              placeholderTextColor={COLORS.placeholder}
            />
            {errors.email && (
              <Text style={STYLES.errorText}>{errors.email}</Text>
            )}

            <Text style={STYLES.label}>Logo</Text>
            <TouchableOpacity onPress={pickLogo} style={STYLES.imagePicker}>
              {builderLogo ? (
                <Image source={{ uri: builderLogo }} style={STYLES.logo} />
              ) : (
                <View style={STYLES.logoPlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={40}
                    color={COLORS.primary}
                  />
                  <Text style={STYLES.logoText}>Tap to upload logo</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.logo && <Text style={STYLES.errorText}>{errors.logo}</Text>}

            <Text style={STYLES.label}>Description</Text>
            <TextInput
              style={[STYLES.input, STYLES.textArea]}
              value={form.description}
              multiline
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Enter a brief description"
              placeholderTextColor={COLORS.placeholder}
            />

            {/* 👉 Radio Buttons for Address */}
            <RequiredLabel text="Do you want to add Address?" />
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                }}
                onPress={() => setHasAddress(true)}
              >
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 6,
                  }}
                >
                  {hasAddress && (
                    <View
                      style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  )}
                </View>
                <Text style={{ color: COLORS.text }}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setHasAddress(false)}
              >
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 6,
                  }}
                >
                  {!hasAddress && (
                    <View
                      style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  )}
                </View>
                <Text style={{ color: COLORS.text }}>No</Text>
              </TouchableOpacity>
            </View>
          </CustomCard>

          {/* Address Card (Optional) */}
          {hasAddress && (
            <CustomCard title="Address Details" icon="location-outline">
              <RequiredLabel text="Country" />
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
                labelStyle={{ fontFamily: 'PlusR', fontSize: 16, color: COLORS.text }}
                zIndex={3000}
                listMode="SCROLLVIEW"
                onChangeValue={(value) => handleLocationChange('country', value)}
              />
              {errors.country && (
                <Text style={STYLES.errorText}>{errors.country}</Text>
              )}
              <RequiredLabel text="State" />
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
                labelStyle={{ fontFamily: 'PlusR', fontSize: 16, color: COLORS.text }}
                zIndex={2000}
                listMode="SCROLLVIEW"
                disabled={!countryValue}
                onChangeValue={(value) => handleLocationChange('state', value)}
              />
              {errors.state && (
                <Text style={STYLES.errorText}>{errors.state}</Text>
              )}
              <RequiredLabel text="District" />
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
                labelStyle={{ fontFamily: 'PlusR', fontSize: 16, color: COLORS.text }}
                zIndex={1000}
                listMode="SCROLLVIEW"
                disabled={!stateValue}
                onChangeValue={(value) => handleLocationChange('district', value)}
              />
              {errors.district && (
                <Text style={STYLES.errorText}>{errors.district}</Text>
              )}
              <Text style={STYLES.label}>City</Text>
              <TextInput
                style={STYLES.input}
                value={form.city}
                onChangeText={(text) => handleChange("city", text)}
                placeholder="Enter City"
                placeholderTextColor={COLORS.placeholder}
              />
              <Text style={STYLES.label}>Address Line 1</Text>
              <TextInput
                style={STYLES.input}
                value={form.addressLine1}
                onChangeText={(text) => handleChange("addressLine1", text)}
                placeholder="Enter Address Line 1"
                placeholderTextColor={COLORS.placeholder}
              />
              <Text style={STYLES.label}>Address Line 2</Text>
              <TextInput
                style={STYLES.input}
                value={form.addressLine2}
                onChangeText={(text) => handleChange("addressLine2", text)}
                placeholder="Enter Address Line 2"
                placeholderTextColor={COLORS.placeholder}
              />
            </CustomCard>
          )}

          {/* Submit Button */}
          <View style={STYLES.submitButton}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{ width: "100%" }}
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
                      name="checkmark-circle-outline"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={STYLES.submitButtonText}>Submit Builder</Text>
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

export default AddBuilder;


const STYLES = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollViewContent: { paddingBottom: 40 },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
    marginTop: 10,
    fontFamily: "PlusR",
  },
  requiredMark: { color: COLORS.error, marginLeft: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.input,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "PlusR",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: "PlusR",
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderLeftColor: COLORS.primary,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: 15,
  },
  submitButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  submitButtonGradient: {
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "PlusSB",
    textTransform: "uppercase",
  },
  bannerContainer: {
    height: 250,
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    position: "relative",
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  bannerImage: { ...StyleSheet.absoluteFillObject, resizeMode: "cover" },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 32,
    fontFamily: "PlusSB",
    color: COLORS.card,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },
  imagePicker: {
    height: 120,
    width: 120,
    backgroundColor: COLORS.input,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: "dashed",
    alignSelf: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  logo: { width: "100%", height: "100%", resizeMode: "cover", borderRadius: 60 },
  logoPlaceholder: { justifyContent: "center", alignItems: "center" },
  logoText: { color: COLORS.placeholder, marginTop: 5, fontSize: 12, fontFamily: "PlusR" },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  checkboxText: { marginLeft: 10, color: COLORS.text, fontSize: 16, fontFamily: "PlusR" },
  dropdown: { borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.input },
  dropdownContainer: { borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, backgroundColor: COLORS.card },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
});
