import React, { useState, useMemo, useEffect } from "react";
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
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../../../../services/api";
import useBusinessNature from "../../../../hooks/useBusinessNature";
import useDropdownData from "../../../../hooks/useDropdownData";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const COLORS = {
  primary: "#004d40",
  primaryLight: "#218373ff",
  secondary: "#198170ff",
  background: "#e8f5e9",
  card: "#f4fcf4",
  input: "#f0f8f0",
  border: "#c8e6c9",
  text: "#202020ff",
  placeholder: "#13773dff",
  error: "#d32f2f",
};

// --- Helper Components ---
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
      onPress={() =>  navigation.openDrawer()}
      style={STYLES.backButton}
    >
      <Ionicons name="menu" size={24} color={COLORS.card} />
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

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync("auth_token");
  return {
    "Content-Type": "application/json",
    secret_key: token,
  };
};

// --- Main Screen ---
const AddRealtor = () => {
  const navigation = useNavigation();

  const [RealtorLogo, setRealtorLogo] = useState(null);
  const [logoBytes, setLogoBytes] = useState(null);
  const [logoType, setLogoType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAddress, setHasAddress] = useState(true);

  const [form, setForm] = useState({
    RealtorNature: [], // must be array
    name: "",
    mobile: "",
    email: "",
    website: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    isHeadOffice: false,
  });

  const [errors, setErrors] = useState({});

  // --- Realtor Nature Dropdown ---
  const [natureOpen, setNatureOpen] = useState(false);
  const { businessNatures, loading: natureLoading } = useBusinessNature();

  const natureItems = useMemo(
    () =>
      businessNatures.map((item) => ({
        label: item.name,
        value: item.id, // ✅ send ID to backend
      })),
    [businessNatures]
  );

  useEffect(() => {
    console.log("Business Natures fetched:", businessNatures);
  }, [businessNatures]);

  useEffect(() => {
    console.log("Selected RealtorNature IDs:", form.RealtorNature);
  }, [form.RealtorNature]);

  // --- Location Dropdowns ---
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState(null);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const { countries, states, districts } = useDropdownData(
    null,
    countryValue,
    stateValue,
    null
  );

  const handleLocationChange = (key, value) => {
    if (key === "country") {
      setCountryValue(value);
      setStateValue(null);
      setDistrictValue(null);
    } else if (key === "state") {
      setStateValue(value);
      setDistrictValue(null);
    } else if (key === "district") {
      setDistrictValue(value);
    }
  };

  // --- Pick Logo ---
  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setRealtorLogo(asset.uri);
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
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // --- Validation ---
  const validateForm = () => {
    let newErrors = {};

    if (!form.RealtorNature || form.RealtorNature.length === 0) {
      newErrors.RealtorNature = "At least one Realtor Nature is required";
    }
    if (!form.name) newErrors.name = "Realtor Name is required";
    if (!form.mobile) newErrors.mobile = "Mobile number is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!logoBytes) newErrors.logo = "Logo is required";

    if (hasAddress) {
      if (!countryValue) newErrors.country = "Country is required";
      if (!stateValue) newErrors.state = "State is required";
      if (!districtValue) newErrors.district = "District is required";
      if (!form.pincode) newErrors.pincode = "Pincode is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix form errors.");
      return;
    }
    setLoading(true);

    const payload = {
      logoString: logoBytes,
      logoContentType: logoType,
      businessNatureIds: form.RealtorNature, // ✅ sending array of IDs
      name: form.name,
      mobileNo: form.mobile,
      email: form.email,
      websiteURL: form.website,
      description: form.description,
      addedById: 1,
      addressType: "Office",
      hasAddress: hasAddress,
      headOffice:
        form.isHeadOffice && hasAddress
          ? `${form.addressLine1}, ${form.city}, ${form.pincode}`
          : "",
      ...(hasAddress && {
        address1: form.addressLine1,
        address2: form.addressLine2,
        city: form.city,
        pincode: form.pincode,
        districtId: districtValue,
        stateId: stateValue,
        countryId: countryValue,
      }),
    };

    console.log("Submitting Payload:", payload);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/builders/saveBuilder`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }
        throw new Error(
          errorBody?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      Alert.alert("Success!", "Realtor added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Submission Error:", err.message);
      Alert.alert("Error", `Failed to submit Realtor: ${err.message}`);
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
        <ScrollView contentContainerStyle={STYLES.scrollViewContent}>
          <CustomCard title="Basic Information" icon="person-add-outline">
            <RequiredLabel text="Realtor Nature" />
            <DropDownPicker
              open={natureOpen}
              value={form.RealtorNature}
              items={natureItems}
              setOpen={setNatureOpen}
              setValue={(callback) =>
                setForm((prev) => ({
                  ...prev,
                  RealtorNature: callback(prev.RealtorNature),
                }))
              }
              setItems={() => { }}
              multiple={true}
              mode="BADGE"
              placeholder={
                natureLoading
                  ? "Loading Realtor Natures..."
                  : "Select Realtor Nature(s)"
              }
              style={STYLES.dropdown}
              dropDownContainerStyle={STYLES.dropdownContainer}
              zIndex={5000}
              zIndexInverse={1000}
              listMode="SCROLLVIEW"
              disabled={natureLoading}
            />
            {errors.RealtorNature && (
              <Text style={STYLES.errorText}>{errors.RealtorNature}</Text>
            )}

            <RequiredLabel text="Realtor Name" />
            <TextInput
              style={STYLES.input}
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter Realtor Name"
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

            <Text style={STYLES.label}>Website (Optional)</Text>
            <TextInput
              style={STYLES.input}
              value={form.website}
              keyboardType="url"
              onChangeText={(text) => handleChange("website", text)}
              placeholder="Enter Website URL"
              placeholderTextColor={COLORS.placeholder}
            />

            <Text style={STYLES.label}>Logo</Text>
            <TouchableOpacity onPress={pickLogo} style={STYLES.imagePicker}>
              {RealtorLogo ? (
                <Image source={{ uri: RealtorLogo }} style={STYLES.logo} />
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

            <Text style={STYLES.label}>Description (Optional)</Text>
            <TextInput
              style={[STYLES.input, STYLES.textArea]}
              value={form.description}
              multiline
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Enter a brief description"
              placeholderTextColor={COLORS.placeholder}
            />

            <RequiredLabel text="Is this the Head Office?" />
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                style={STYLES.radioOption}
                onPress={() => handleChange('isHeadOffice', true)}
              >
                <View style={STYLES.radioRing}>
                  {form.isHeadOffice && (
                    <View style={STYLES.radioDot} />
                  )}
                </View>
                <Text style={{ color: COLORS.text }}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={STYLES.radioOption}
                onPress={() => handleChange('isHeadOffice', false)}
              >
                <View style={STYLES.radioRing}>
                  {!form.isHeadOffice && (
                    <View style={STYLES.radioDot} />
                  )}
                </View>
                <Text style={{ color: COLORS.text }}>No</Text>
              </TouchableOpacity>
            </View>

            <RequiredLabel text="Do you want to add Address?" />
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity
                style={STYLES.radioOption}
                onPress={() => setHasAddress(true)}
              >
                <View style={STYLES.radioRing}>
                  {hasAddress && (
                    <View style={STYLES.radioDot} />
                  )}
                </View>
                <Text style={{ color: COLORS.text }}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={STYLES.radioOption}
                onPress={() => setHasAddress(false)}
              >
                <View style={STYLES.radioRing}>
                  {!hasAddress && (
                    <View style={STYLES.radioDot} />
                  )}
                </View>
                <Text style={{ color: COLORS.text }}>No</Text>
              </TouchableOpacity>
            </View>
          </CustomCard>

          {/* Address Card (Visible if hasAddress is true) */}
          {hasAddress && (
            <CustomCard title="Address Details" icon="location-outline">
              <RequiredLabel text="Country" />
              <DropDownPicker
                open={countryOpen}
                value={countryValue}
                items={countries}
                setOpen={setCountryOpen}
                setValue={setCountryValue}
                setItems={() => { }}
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
                setItems={() => { }}
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
                setItems={() => { }}
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

              <RequiredLabel text="Pincode" />
              <TextInput
                style={STYLES.input}
                value={form.pincode}
                keyboardType="number-pad"
                onChangeText={(text) => handleChange("pincode", text)}
                placeholder="Enter Pincode"
                placeholderTextColor={COLORS.placeholder}
              />
              {errors.pincode && (
                <Text style={STYLES.errorText}>{errors.pincode}</Text>
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
                placeholder="Enter Address Line 2 (Optional)"
                placeholderTextColor={COLORS.placeholder}
              />
            </CustomCard>
          )}
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
                    <Text style={STYLES.submitButtonText}>
                      Submit Realtor
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
export default AddRealtor;

// --- STYLES ---
const STYLES = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollViewContent: { paddingBottom: hp('5%') },
  label: {
    fontSize: wp('3.7%'),
    color: COLORS.text,
    marginBottom: hp('0.6%'),
    marginTop: hp('1.2%'),
    fontFamily: "PlusR",
  },
  requiredMark: { color: COLORS.error, marginLeft: wp('1%') },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp('2%'),
    padding: wp('3%'),
    backgroundColor: COLORS.input,
    color: COLORS.text,
    fontSize: wp('4%'),
    fontFamily: "PlusR",
  },
  textArea: { height: hp('13%'), textAlignVertical: "top" },
  errorText: {
    color: COLORS.error,
    fontSize: wp('3.2%'),
    fontFamily: "PlusR",
    marginTop: hp('0.6%'),
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: wp('4%'),
    borderLeftColor: COLORS.primary,
    padding: wp('2.5%'),
    marginHorizontal: wp('2.5%'),
    marginBottom: hp('2.5%'),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: wp('5.5%'),
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: hp('1.8%'),
  },
  submitButton: {
    marginHorizontal: wp('5%'),
    borderRadius: wp('3%'),
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  submitButtonGradient: {
    padding: hp('2.2%'),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: wp('3.7%'),
    fontFamily: "PlusSB",
    textTransform: "uppercase",
  },
  bannerContainer: {
    height: hp('32%'),
    width: "100%",
    borderBottomLeftRadius: wp('7.5%'),
    borderBottomRightRadius: wp('7.5%'),
    overflow: "hidden",
    position: "relative",
    marginBottom: hp('1.2%'),
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
    fontSize: wp('8%'),
    fontFamily: "PlusSB",
    color: COLORS.card,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  backButton: {
    position: "absolute",
    left: wp('5%'),
    top: hp('6.5%'),
    zIndex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: wp('5%'),
    padding: wp('2%'),
  },
  imagePicker: {
    height: wp('32%'),
    width: wp('32%'),
    backgroundColor: COLORS.input,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp('16%'),
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: "dashed",
    alignSelf: "center",
    marginBottom: hp('2.5%'),
    overflow: "hidden",
  },
  logo: { width: "100%", height: "100%", resizeMode: "cover", borderRadius: wp('16%') },
  logoPlaceholder: { justifyContent: "center", alignItems: "center" },
  logoText: { color: COLORS.placeholder, marginTop: hp('0.6%'), fontSize: wp('3.2%'), fontFamily: "PlusR" },
  dropdown: { borderColor: COLORS.border, borderRadius: wp('2%'), backgroundColor: COLORS.input },
  dropdownContainer: { borderColor: COLORS.border, borderWidth: 1, borderRadius: wp('2%'), backgroundColor: COLORS.card },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: hp('1.8%') },
  radioOption: { flexDirection: "row", alignItems: "center", marginRight: wp('5%') },
  radioRing: {
    height: wp('5%'),
    width: wp('5%'),
    borderRadius: wp('2.5%'),
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp('1.5%'),
  },
  radioDot: {
    height: wp('2.5%'),
    width: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: COLORS.primary,
  }
});