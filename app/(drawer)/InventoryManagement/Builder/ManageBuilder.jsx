import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  TextInput,
  FlatList,
  Image,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from "../../../../services/api";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useNavigation, useFocusEffect } from "expo-router";
import useBusinessNature from "../../../../hooks/useBusinessNature";
import axios from "axios";
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const API_URL = `${API_BASE_URL}/builders/getAllBuilders/1`;
const GET_BUILDER_BY_ID_URL = `${API_BASE_URL}/builders/getBuilderById`;
const UPDATE_BUILDER_URL = `${API_BASE_URL}/builders/updateBuilder`;

const COLORS = {
  primary: "#004d40",
  secondary: "#198170ff",
  text: "#333",
  placeholder: "#999",
  background: "#f0f4f7",
  card: "rgba(255, 255, 255, 0.9)",
  danger: "#c62828",
};

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (!token) {
    console.error("Authentication token is missing.");
    return {};
  }
  return {
    'Content-Type': 'application/json',
    secret_key: token,
  };
};

// Helper function to convert an ArrayBuffer to a binary string
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is a standard browser function for Base64 encoding a binary string
  return btoa(binary); 
};

const getAuthenticatedImageSource = async (realtorId) => {
  if (!realtorId) return null;

  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/builders/getLogo/${realtorId}/logo`;

    // 1. Request the response data as an ArrayBuffer
    const response = await axios.get(url, { 
      headers: headers, 
      responseType: 'arraybuffer' // <--- Essential for raw bytes
    });

    let base64String = null;
    
    // Check if the response is valid and contains raw data (ArrayBuffer)
    if (response.data instanceof ArrayBuffer) {
      // 2. Convert the ArrayBuffer to a Base64 string using the browser-compatible helper
      base64String = arrayBufferToBase64(response.data);
    }

    if (base64String && typeof base64String === 'string') {
      // 3. Construct the data URI
      return {
        uri: `data:image/jpeg;base64,${base64String}`, 
        cache: 'reload',
      };
    }
    return null;

  } catch (error) {
    console.warn(`Failed to fetch Base64 image for ${realtorId}:`, error?.response?.status, error?.message);
    return null;
  }
};

const RealtorLogoWithAuth = ({ realtorId, style }) => {
  const [imageSource, setImageSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!realtorId) {
      setLoading(false);
      return;
    }

    const fetchImageSource = async () => {
      setLoading(true);
      try {
        const source = await getAuthenticatedImageSource(realtorId);
        setImageSource(source);
      } catch (error) {
        setImageSource(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImageSource();
  }, [realtorId]);

  if (loading) {
    return (
      <View style={[styles.cardAvatar, styles.avatarPlaceholder, style]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (imageSource && imageSource.uri) {
    return (
      <Image
        source={imageSource}
        style={[styles.cardAvatar, style]}
        resizeMode="contain"
        onError={(e) => {
          console.error("Image failed to load:", e.nativeEvent.error);
          setImageSource(null);
        }}
      />
    );
  }

  return (
    <View style={[styles.cardAvatar, styles.avatarPlaceholder, style]}>
      <Ionicons name="business-outline" size={24} color={COLORS.placeholder} />
    </View>
  );
};

const mapBusinessNatureIds = (ids, natureList) => {
  const idStrings = Array.isArray(ids) ? ids.map(id => String(id)) : [];
  if (idStrings.length === 0) {
    return ["Not Specified"];
  }
  if (!Array.isArray(natureList) || natureList.length === 0) {
    return ["Names Unavailable"];
  }
  const natureMap = natureList.reduce((map, item) => {
    map[String(item.id)] = item.name;
    return map;
  }, {});
  const mappedNames = idStrings.map(id => natureMap[id]).filter(name => name);
  return [...new Set(mappedNames.length > 0 ? mappedNames : ["Names Unavailable"])];
};


// --- 3. Main Component ---
const ManageRealtors = () => {
  const navigation = useNavigation();

  // ---------------------- FORM STATE VARIABLES ----------------------
  const [formName, setFormName] = useState("");
  const [formMobileNo, setFormMobileNo] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formOffice, setFormOffice] = useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [formBusinessNature, setFormBusinessNature] = useState([]);
  const [formHasAddress, setFormHasAddress] = useState(false);
  const [formAddress1, setFormAddress1] = useState("");
  const [formAddress2, setFormAddress2] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPincode, setFormPincode] = useState("");
  const [formCountryId, setFormCountryId] = useState("");
  const [formStateId, setFormStateId] = useState("");
  const [formDistrictId, setFormDistrictId] = useState("");

  // ---------------------- OTHER STATE ----------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [realtors, setRealtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingSelectedRealtor, setIsFetchingSelectedRealtor] = useState(false);
  const [selectedRealtor, setSelectedRealtor] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [businessNatureModalVisible, setBusinessNatureModalVisible] = useState(false);

  // ---------------------- HOOKS ----------------------
  const { businessNatures: natures, loading: loadingNatures } = useBusinessNature() || {
    businessNatures: [],
    loading: false,
  };

  const { countries, states, districts, loading: loadingDropdownData } = useDropdownData(
    null, // departmentId
    formCountryId,
    formStateId,
    null
  );

  const fetchRealtors = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    setIsRefreshing(isRefresh);

    if (loadingNatures) {
      setIsLoading(false);
      return;
    }

    try {
      const authOptions = await getAuthHeaders();
      const response = await fetch(API_URL, { headers: authOptions });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const apiData = await response.json();

      const mappedData = (Array.isArray(apiData) ? apiData : []).map(item => {
        const businessNatureIdsFromApi = Array.isArray(item.businessNatures)
          ? item.businessNatures.map(nature => nature.id)
          : [];

        return ({
          id: item.id,
          name: item.name || `Builder ID ${item.id}`,
          userCode: item.userCode || `C-${item.id}`,
          mobileNo: item.mobileNo || '+91-XXX-XXX-XXXX',
          email: item.email || `contact@builder${item.id}.com`,
          headOffice: item.headOffice || 'N/A',
          description: item.description || 'No description provided.',
          hasAddress: item.hasAddress === true,
          websiteUrl: item.websiteURL,
          businessNature: mapBusinessNatureIds(businessNatureIdsFromApi, natures),
          originalBusinessNatureIds: businessNatureIdsFromApi,
        });
      });

      setRealtors(mappedData);
    } catch (error) {
      console.error("Failed to fetch realtors:", error);
      Alert.alert("Error", error.message || "Failed to load realtors.");
      setRealtors([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [natures, loadingNatures]);

  const fetchSelectedRealtor = useCallback(async (realtorId) => {
    if (!realtorId) return;

    setIsFetchingSelectedRealtor(true);
    try {
      const authOptions = await getAuthHeaders();
      const url = `${GET_BUILDER_BY_ID_URL}/${realtorId}`;
      const response = await fetch(url, { headers: authOptions });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const item = await response.json();

      const businessNatureIdsFromApi = Array.isArray(item.businessNatures)
        ? item.businessNatures.map(nature => nature.id)
        : [];

      const businessNatureNames = mapBusinessNatureIds(businessNatureIdsFromApi, natures);

      // Existing form state initialization
      setFormName(item.name || '');
      setFormMobileNo(item.mobileNo || '');
      setFormEmail(item.email || '');
      setFormDescription(item.description || '');
      setFormOffice(item.headOffice || '');
      setFormWebsiteUrl(item.websiteURL || '');
      setFormBusinessNature(businessNatureNames);
      setFormHasAddress(item.hasAddress === true);

      // 🌟 FIX: Initialize address and location ID fields 🌟
      setFormAddress1(item.address1 || '');
      setFormAddress2(item.address2 || '');
      setFormCity(item.city || '');
      setFormPincode(item.pincode || '');

      // Convert IDs to string for TextInput value property
      setFormDistrictId(String(item.districtId || ''));
      setFormStateId(String(item.stateId || ''));
      setFormCountryId(String(item.countryId || ''));
      // ---------------------------------------------------

      setUpdateModalVisible(true);

    } catch (error) {
      console.error("Failed to fetch selected realtor details:", error);
      Alert.alert("Error", error.message || "Failed to load realtor details for update.");
      setSelectedRealtor(null);
    } finally {
      setIsFetchingSelectedRealtor(false);
    }
  }, [natures]);

  useFocusEffect(
    useCallback(() => {
      if (!loadingNatures) {
        fetchRealtors();
      }
    }, [fetchRealtors, loadingNatures])
  );

  const handleUpdatePress = (realtor) => {
    setSelectedRealtor(realtor);
    fetchSelectedRealtor(realtor.id);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalVisible(false);
    setSelectedRealtor(null);
    setFormName('');
    setFormDescription('');
    setFormOffice('');
    setFormWebsiteUrl('');
    setFormBusinessNature([]);
    setFormHasAddress(false);

    setFormAddress1('');
    setFormAddress2('');
    setFormCity('');
    setFormPincode('');
    setFormDistrictId('');
    setFormStateId('');
    setFormCountryId('');
  };

  const handleDeletePress = (realtor) => { setSelectedRealtor(realtor); setDeleteModalVisible(true); };

  const confirmDelete = async () => {
    if (!selectedRealtor?.id) {
      Alert.alert("Error", "No realtor selected for deletion.");
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/builders/deleteBuilder/${selectedRealtor.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        const errMsg = `Server responded with status ${response.status}`;
        console.error(errMsg);
        throw new Error("Failed to delete realtor. Please try again.");
      }

      setRealtors((prev) => prev.filter((r) => r.id !== selectedRealtor.id));
      setDeleteModalVisible(false);
      setSelectedRealtor(null);
      Alert.alert("Deleted", `${selectedRealtor.name} was successfully removed.`);
    } catch (error) {
      console.error("Error deleting realtor:", error);
      Alert.alert("Error", error.message || "Failed to delete realtor.");
    }
  };

const handleUpdateSubmit = async () => {
  if (!selectedRealtor?.id) {
    Alert.alert("Error", "No realtor ID found for update.");
    return;
  }

  const natureMap = natures.reduce((map, item) => {
    map[item.name] = item.id;
    return map;
  }, {});
  const businessNatureIdsForAPI = formBusinessNature
    .map(name => natureMap[name])
    .filter(id => id !== undefined);

  // Convert to number or null
  const getNumericId = (id) => {
    const num = parseInt(id, 10);
    return isNaN(num) ? null : num;
  };

  // Build payload
  const updatePayload = {
    headOffice: formOffice || "",
    hasAddress: !!formHasAddress,
    websiteURL: formWebsiteUrl || "",
    description: formDescription || "",
    businessNatureIds: businessNatureIdsForAPI,
    name: formName || "",
    logoContentType: "image/jpg",
    logoString: "", 
    addedById: 1,
    addressType: "Office",
    address1: formAddress1 || "",
    address2: formAddress2 || "",
    city: formCity || "",
    pincode: formPincode || "",
    districtId: getNumericId(formDistrictId),
    stateId: getNumericId(formStateId),
    countryId: getNumericId(formCountryId),
  };

  try {
    const headers = await getAuthHeaders();
    headers["Content-Type"] = "application/json"; 

    const url = `${UPDATE_BUILDER_URL}/${selectedRealtor.id}`;

    console.log("Sending payload:", JSON.stringify(updatePayload, null, 2));

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(updatePayload),
    });

    const resultText = await response.text();
    if (!response.ok) {
      console.error("Update failed response:", resultText);
      throw new Error(`Failed to update realtor. Status: ${response.status}. Details: ${resultText.substring(0, 200)}...`);
    }

    console.log("Update response:", resultText);

    Alert.alert("Success", `${formName} details have been successfully updated.`);
    
    fetchRealtors(); 
    handleCloseUpdateModal();

  } catch (error) {
    console.error("Error during update:", error);
    Alert.alert("Update Failed", error.message || "An unexpected error occurred during update.");
  }
};


  const toggleBusinessNature = (natureName) => {
    setFormBusinessNature(prev => {
      if (prev.includes(natureName)) {
        return prev.filter(n => n !== natureName);
      } else {
        return [...prev, natureName];
      }
    });
  };

  const filteredRealtors = realtors.filter((realtor) =>
    realtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    realtor.userCode.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderRealtor = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.cardHeader}>
        <View style={styles.snContainer}>
          <Text style={styles.snText}>{index + 1}</Text>
        </View>

        <RealtorLogoWithAuth
          realtorId={item.id}
          style={styles.cardAvatar}
        />

        <View style={styles.cardTitleWrapper}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardCode} numberOfLines={1}>
            User Code: {item.userCode}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleUpdatePress(item)}>
            <Feather name="edit-3" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeletePress(item)}>
            <Feather name="x-circle" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="office-building" size={14} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.headOffice || 'Address not provided'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="briefcase" size={14} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.businessNature.join(", ")}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="file-text" size={14} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.description}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather name="globe" size={14} color="#666" style={{ marginRight: 6 }} />
          <Text
            style={[styles.detailText, { color: "#007AFF", textDecorationLine: "underline" }]}
            numberOfLines={1}
            onPress={() => {
              if (item.websiteUrl) {
                let url = item.websiteUrl.trim();
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                  url = `https://${url}`;
                }
                Linking.openURL(url).catch(err =>
                  console.error("Failed to open URL:", err)
                );
              } else {
                Alert.alert("No Website", "This realtor has not provided a website URL.");
              }
            }}
          >
            Click here to visit Website
          </Text>
        </View>

      </View>
    </View>
  );

  // --- Render Business Nature Selection Modal ---
  const renderBusinessNatureModal = () => (
    <Modal visible={businessNatureModalVisible} transparent={true} animationType="fade" onRequestClose={() => setBusinessNatureModalVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setBusinessNatureModalVisible(false)}>
        <View style={styles.centeredModalBackground}>
          <TouchableWithoutFeedback>
            <View style={styles.selectionModalCard}>
              <Text style={styles.modalTitleCompact}>Select Business Natures</Text>

              {(loadingNatures || !Array.isArray(natures)) ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
                  {natures.map((nature) => (
                    <TouchableOpacity
                      key={nature.id}
                      style={[styles.selectOption, formBusinessNature.includes(nature.name) && styles.selectOptionSelected]}
                      onPress={() => toggleBusinessNature(nature.name)}
                    >
                      <MaterialCommunityIcons
                        name={formBusinessNature.includes(nature.name) ? "check-circle" : "checkbox-blank-circle-outline"}
                        size={16}
                        color={formBusinessNature.includes(nature.name) ? '#fff' : COLORS.primary}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.selectOptionText, formBusinessNature.includes(nature.name) && styles.selectOptionTextSelected]}>{nature.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.selectionCount}>Selected: {formBusinessNature.length}</Text>
              <TouchableOpacity style={[styles.modalBtnCompact, styles.modalBtnPrimary, { marginTop: 20, width: '100%' }]} onPress={() => setBusinessNatureModalVisible(false)}>
                <Text style={styles.modalBtnTextCompact}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderUpdateModalContent = () => {
    // Combined loading check for a smoother transition
    const isFullyLoading = isFetchingSelectedRealtor || !selectedRealtor || loadingDropdownData;

    if (isFullyLoading) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 15, color: COLORS.text }}>Loading realtor details...</Text>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.updateModalContent}>
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          <Text style={styles.modalTitleCompact}>Update Realtor Profile</Text>
          <Text style={styles.modalSubTitleCompact}>Editing: **{selectedRealtor?.name}**</Text>

          {/* --- Basic Information --- */}
          <View style={styles.sectionContainerCompact}>
            <Text style={styles.sectionTitleCompact}>Basic Information</Text>
            <Text style={styles.inputLabelCompact}>Name *</Text>
            <View style={styles.inputWithIconCompact}>
              <Feather name="user" size={18} color="#004d4080" style={styles.inputIcon} />
              <TextInput style={styles.modalTextInputCompact} placeholder="Realtor Name" value={formName} onChangeText={setFormName} placeholderTextColor="#aaa" />
            </View>
            <Text style={styles.inputLabelCompact}>Business Nature *</Text>
            <TouchableOpacity style={styles.selectInputCompact} onPress={() => setBusinessNatureModalVisible(true)}>
              <Feather name="briefcase" size={18} color="#004d4080" style={styles.inputIcon} />
              <Text style={styles.selectInputTextCompact} numberOfLines={1}>
                {formBusinessNature.length > 0 ? formBusinessNature.join(', ') : 'Select Business Nature'}
              </Text>
              <Feather name="chevron-down" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.selectionCountSmallCompact}>{formBusinessNature.length} selected</Text>
          </View>

          {/* --- Contact Information --- */}
          <View style={styles.sectionContainerCompact}>
            <Text style={styles.sectionTitleCompact}>Contact Information</Text>
            <Text style={styles.inputLabelCompact}>Mobile No *</Text>
            <View style={styles.inputWithIconCompact}>
              <Feather name="phone" size={18} color="#004d4080" style={styles.inputIcon} />
              <TextInput style={styles.modalTextInputCompact} placeholder="Mobile Number" value={formMobileNo} onChangeText={setFormMobileNo} keyboardType="phone-pad" placeholderTextColor="#aaa" />
            </View>
            <Text style={styles.inputLabelCompact}>Email</Text>
            <View style={styles.inputWithIconCompact}>
              <MaterialCommunityIcons name="email-outline" size={18} color="#004d4080" style={styles.inputIcon} />
              <TextInput style={styles.modalTextInputCompact} placeholder="Email Address" value={formEmail} onChangeText={setFormEmail} keyboardType="email-address" placeholderTextColor="#aaa" />
            </View>
            <Text style={styles.inputLabelCompact}>Website URL</Text>
            <View style={styles.inputWithIconCompact}>
              <Feather name="globe" size={18} color="#004d4080" style={styles.inputIcon} />
              <TextInput style={styles.modalTextInputCompact} placeholder="Website URL (optional)" value={formWebsiteUrl} onChangeText={setFormWebsiteUrl} keyboardType="url" autoCapitalize="none" placeholderTextColor="#aaa" />
            </View>
          </View>

          <View style={styles.sectionContainerCompact}>
            <Text style={styles.sectionTitleCompact}>Branding & Description</Text>

            <Text style={styles.inputLabelCompact}>Logo Preview (Secure Fetch)</Text>
            <RealtorLogoWithAuth
              realtorId={selectedRealtor?.id}
              style={styles.logoPreviewCompact}
            />
            <Text style={styles.logoPlaceholderCompact}>Logo is loaded securely using ID.</Text>

            <Text style={styles.inputLabelCompact}>Description</Text>
            <TextInput style={styles.modalTextInputAreaCompact} placeholder="Realtor Description" value={formDescription} onChangeText={setFormDescription} multiline numberOfLines={2} placeholderTextColor="#aaa" />
          </View>

          {/* --- Address Settings & Detailed Address --- */}
          <View style={styles.sectionContainerCompact}>
            <Text style={styles.sectionTitleCompact}>Address Settings</Text>
            <Text style={styles.inputLabelCompact}>Add Address ? *</Text>
            <View style={styles.toggleRowCompact}>
              <TouchableOpacity style={[styles.toggleBtnCompact, formHasAddress && styles.toggleBtnActiveCompact]} onPress={() => setFormHasAddress(true)}><Text style={[styles.toggleTextCompact, formHasAddress && styles.toggleTextActiveCompact]}>Yes</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtnCompact, !formHasAddress && styles.toggleBtnActiveCompact]} onPress={() => setFormHasAddress(false)}><Text style={[styles.toggleTextCompact, !formHasAddress && styles.toggleTextActiveCompact]}>No</Text></TouchableOpacity>
            </View>

            {formHasAddress && (
              <>
                <Text style={styles.inputLabelCompact}>Head Office Name/Short Description</Text>
                <View style={styles.inputWithIconCompact}>
                  <MaterialCommunityIcons name="office-building" size={18} color="#004d4080" style={styles.inputIcon} />
                  <TextInput style={styles.modalTextInputCompact} placeholder="Head Office Name" value={formOffice} onChangeText={setFormOffice} placeholderTextColor="#aaa" />
                </View>

                {/* --- Detailed Address Inputs --- */}
                <Text style={styles.sectionTitleCompact}>Detailed Address</Text>

                <Text style={styles.inputLabelCompact}>Address Line 1 *</Text>
                <View style={styles.inputWithIconCompact}>
                  <Feather name="map-pin" size={18} color="#004d4080" style={styles.inputIcon} />
                  <TextInput style={styles.modalTextInputCompact} placeholder="House/Street Number" value={formAddress1} onChangeText={setFormAddress1} placeholderTextColor="#aaa" />
                </View>

                <Text style={styles.inputLabelCompact}>Address Line 2 (Optional)</Text>
                <View style={styles.inputWithIconCompact}>
                  <Feather name="map" size={18} color="#004d4080" style={styles.inputIcon} />
                  <TextInput style={styles.modalTextInputCompact} placeholder="Landmark / Area" value={formAddress2} onChangeText={setFormAddress2} placeholderTextColor="#aaa" />
                </View>

                <Text style={styles.inputLabelCompact}>City *</Text>
                <View style={styles.inputWithIconCompact}>
                  <Feather name="tag" size={18} color="#004d4080" style={styles.inputIcon} />
                  <TextInput style={styles.modalTextInputCompact} placeholder="City Name" value={formCity} onChangeText={setFormCity} placeholderTextColor="#aaa" />
                </View>

                <Text style={styles.inputLabelCompact}>Pincode *</Text>
                <View style={styles.inputWithIconCompact}>
                  <Feather name="code" size={18} color="#004d4080" style={styles.inputIcon} />
                  <TextInput style={styles.modalTextInputCompact} placeholder="Pincode" value={formPincode} onChangeText={setFormPincode} keyboardType="numeric" placeholderTextColor="#aaa" />
                </View>

                <Text style={styles.sectionTitleCompact}>Location</Text>

                {/* --- Country Dropdown --- */}
                <Text style={styles.inputLabelCompact}>Country *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formCountryId}
                    onValueChange={(value) => {
                      setFormCountryId(value);
                      setFormStateId("");
                      setFormDistrictId("");
                    }}
                    style={styles.pickerCompact}
                  >
                    <Picker.Item label="Select Country" value="" />
                    {countries.map((country) => (
                      <Picker.Item
                        key={country.value}
                        label={country.label}
                        value={String(country.value)}
                      />
                    ))}
                  </Picker>
                </View>

                {/* --- State Dropdown --- */}
                <Text style={styles.inputLabelCompact}>State *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formStateId}
                    onValueChange={(value) => {
                      setFormStateId(value);
                      setFormDistrictId("");
                    }}
                    style={styles.pickerCompact}
                    enabled={!!formCountryId}
                  >
                    <Picker.Item
                      label={formCountryId ? "Select State" : "Select Country First"}
                      value=""
                    />
                    {states.map((state) => (
                      <Picker.Item
                        key={state.value}
                        label={state.label}
                        value={String(state.value)}
                      />
                    ))}
                  </Picker>
                </View>

                {/* --- District Dropdown --- */}
                <Text style={styles.inputLabelCompact}>District *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={formDistrictId}
                    onValueChange={setFormDistrictId}
                    style={styles.pickerCompact}
                    enabled={!!formStateId}
                  >
                    <Picker.Item
                      label={formStateId ? "Select District" : "Select State First"}
                      value=""
                    />
                    {districts.map((district) => (
                      <Picker.Item
                        key={district.value}
                        label={district.label}
                        value={String(district.value)}
                      />
                    ))}
                  </Picker>
                </View>


              </>
            )}
          </View>

          {/* --- Buttons --- */}
          <View style={styles.modalButtonRowCompact}>
            <TouchableOpacity style={[styles.modalBtnCompact, styles.modalBtnPrimary]} onPress={handleUpdateSubmit}><Text style={styles.modalBtnTextCompact}>Save Changes</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // --- Render Delete Modal Content ---
  const renderDeleteModalContent = () => (
    <View style={styles.deleteModalContent}>
      <Feather name="alert-triangle" size={40} color={COLORS.danger} />
      <Text style={styles.deleteModalTitle}>Confirm Deletion</Text>
      <Text style={styles.deleteModalMessage}>
        Are you sure you want to delete realtor
        <Text style={styles.deleteModalHighlight}> {selectedRealtor?.name} </Text>
        ? This action cannot be undone.
      </Text>
      <View style={styles.modalButtonRow}>
        <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDelete]} onPress={confirmDelete}>
          <Text style={styles.modalBtnText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSecondary]} onPress={() => setDeleteModalVisible(false)}>
          <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  // --- Main Render Return ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Realtor</Text>
          <Text style={styles.headerSubTitle}>Management</Text>
          <Text style={styles.headerDesc}>
            Search by Name or User Code.
          </Text>
        </View>
        {/* ⚠️ Ensure Lottie path is correct */}
        <LottieView
          source={require("../../../../assets/svg/EMP.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.primary} style={styles.searchIcon} />
        <TextInput style={styles.searchBar} placeholder="Search for a realtor..." placeholderTextColor={COLORS.placeholder} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery?.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AntDesign name="closecircle" size={18} color={COLORS.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* Realtor List */}
      {(isLoading || loadingNatures) && !isRefreshing ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {loadingNatures ? 'Loading business data...' : 'Loading Realtors...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRealtors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderRealtor}
          onRefresh={() => fetchRealtors(true)}
          refreshing={isRefreshing}
          ListEmptyComponent={() => (
            <View style={styles.emptyList}>
              <MaterialCommunityIcons name="account-group-outline" size={50} color="#aaa" />
              <Text style={styles.emptyListText}>No realtors found.</Text>
            </View>
          )}
        />
      )}

      {/* --- Modals --- */}
      <Modal visible={updateModalVisible} transparent={true} animationType="slide" onRequestClose={handleCloseUpdateModal}>
        <TouchableWithoutFeedback onPress={handleCloseUpdateModal}>
          <View style={styles.centeredModalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCardCompact}>
                <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseUpdateModal}>
                  <Ionicons name="close-circle" size={24} color={COLORS.placeholder} />
                </TouchableOpacity>
                {renderUpdateModalContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={deleteModalVisible} transparent={true} animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.centeredModalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {renderDeleteModalContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {renderBusinessNatureModal()}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: wp('5%'), paddingTop: Platform.OS === "android" ? hp('3.5%') : hp('2.5%'), paddingBottom: hp('0.7%') },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wp('5%'), marginBottom: hp('1.2%') },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: wp('8%'), fontFamily: "PlusSB", color: COLORS.primary },
  headerSubTitle: { fontSize: wp('7%'), fontFamily: "PlusSB", color: COLORS.text, marginTop: -hp('0.6%') },
  headerDesc: { fontSize: wp('3.5%'), fontFamily: "PlusSB", color: "#666", marginTop: hp('0.6%') },
  lottie: { width: wp('26%'), height: wp('26%'), marginTop: -hp('3.7%') },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: wp('5%'), borderRadius: wp('4%'), paddingHorizontal: wp('4%'), marginVertical: hp('1.2%'), shadowOpacity: 0.1, elevation: 5, borderWidth: 1, borderColor: '#eee' },
  searchBar: { flex: 1, height: hp('6.5%'), fontFamily: "PlusL", fontSize: wp('4%'), color: COLORS.text, paddingLeft: wp('2.5%') },
  searchIcon: { marginRight: wp('2%') },
  list: { paddingHorizontal: wp('5%'), paddingVertical: hp('1.2%'), paddingBottom: hp('13%') },
  itemCard: { backgroundColor: COLORS.card, borderRadius: wp('5%'), padding: wp('4%'), marginBottom: hp('2%'), shadowOpacity: 0.15, elevation: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", paddingBottom: hp('1.2%'), borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: hp('1.2%') },
  snContainer: { width: wp('7%'), alignItems: 'center', justifyContent: 'center', marginRight: wp('3%'), backgroundColor: COLORS.primary, borderRadius: wp('1.2%'), height: wp('7%') },
  snText: { fontSize: wp('3.5%'), fontFamily: "PlusS", fontWeight: 'bold', color: "#fff" },
  cardAvatar: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    marginRight: wp('4%'),
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: `${COLORS.primary}50`,
    objectFit: "contain",
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cardTitleWrapper: { flex: 1 },
  cardName: { fontSize: wp('4.5%'), fontFamily: "PlusSB", color: COLORS.primary },
  cardCode: { fontSize: wp('3.2%'), fontFamily: "PlusL", color: "#444", marginTop: hp('0.3%') },
  actionIcons: { flexDirection: "column", alignItems: "center" },
  iconBtn: { padding: wp('1.2%'), borderRadius: wp('1.2%'), marginBottom: hp('0.7%'), backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  cardDetails: { paddingHorizontal: wp('1.2%') },
  detailRow: { flexDirection: 'row', fontFamily: "PlusL", alignItems: 'center', marginBottom: hp('0.7%') },
  detailText: { fontSize: wp('3.2%'), fontFamily: "PlusL", color: '#333', marginLeft: wp('2%') },
  emptyList: { alignItems: 'center', marginTop: hp('6%'), padding: wp('5%'), backgroundColor: '#fff', borderRadius: wp('4%') },
  emptyListText: { fontSize: wp('4.5%'), color: '#aaa', marginTop: hp('1.2%'), fontFamily: "PlusL" },
  fab: { position: 'absolute', width: wp('17%'), height: wp('17%'), alignItems: 'center', justifyContent: 'center', right: wp('8%'), bottom: wp('8%'), backgroundColor: COLORS.primary, borderRadius: wp('8.5%'), elevation: 10, shadowOpacity: 0.5, shadowRadius: 10 },

  // Modal Styles 
  centeredModalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.75)" },
  modalCardCompact: { width: Dimensions.get('window').width * 0.9, maxHeight: Dimensions.get('window').height * 0.9, backgroundColor: "#fff", borderRadius: wp('5%'), padding: wp('2.5%'), paddingTop: hp('6%'), alignItems: "center", shadowOpacity: 0.4, shadowRadius: 15, elevation: 20, position: 'relative' },
  modalCloseButton: { position: 'absolute', top: hp('1.2%'), right: wp('2.5%'), padding: wp('1.2%'), zIndex: 10 },
  updateModalContent: { width: '100%', alignItems: 'center' },
  modalTitleCompact: { fontFamily: "PlusSB", fontSize: wp('5%'), marginBottom: hp('0.6%'), color: COLORS.primary },
  modalSubTitleCompact: { fontFamily: "PlusL", fontSize: wp('3.5%'), color: "#888", marginBottom: hp('1.2%') },
  sectionContainerCompact: { width: '85%', padding: wp('1.2%'), backgroundColor: '#f9f9f9', borderRadius: wp('3%'), marginBottom: hp('1.2%'), borderLeftWidth: 2, borderLeftColor: COLORS.primary },
  sectionTitleCompact: { fontFamily: "PlusR", fontSize: wp('4%'), color: COLORS.primary, marginBottom: hp('0.6%'), borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: hp('0.6%') },
  inputLabelCompact: { width: '100%', textAlign: 'left', fontFamily: "PlusSB", fontSize: wp('3.2%'), color: COLORS.text, marginBottom: hp('0.3%'), marginTop: hp('1%') },
  inputWithIconCompact: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: '#fff', borderRadius: wp('2.5%'), borderWidth: 1, borderColor: '#e0e0e0', marginBottom: hp('0.3%'), height: hp('5.5%') },
  inputIcon: { marginLeft: wp('2.5%') },
  modalTextInputCompact: { flex: 1, paddingVertical: hp('1%'), fontFamily: "PlusR", paddingRight: wp('2.5%'), fontSize: wp('3.5%'), color: COLORS.text, height: '100%' },
  modalTextInputAreaCompact: { width: '100%', backgroundColor: '#fff', borderRadius: wp('2.5%'), fontFamily: "PlusL", padding: wp('2.5%'), marginBottom: hp('0.3%'), borderWidth: 1, borderColor: '#e0e0e0', fontSize: wp('3.5%'), color: COLORS.text, minHeight: hp('10%'), textAlignVertical: 'top' },
  selectInputCompact: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: wp('2.5%'), paddingRight: wp('2.5%'), marginBottom: hp('0.2%'), borderWidth: 1, borderColor: '#e0e0e0', minHeight: hp('5.5%') },
  selectInputTextCompact: { flex: 1, fontFamily: "PlusR", fontSize: wp('3.5%'), color: COLORS.text, marginLeft: wp('1.2%') },
  selectionCountSmallCompact: { width: '100%', textAlign: 'right', fontSize: wp('2.8%'), fontFamily: "PlusSB", color: COLORS.primary, marginBottom: hp('0.3%') },
  logoPreviewCompact: { width: wp('16%'), height: wp('16%'), borderRadius: wp('8%'), marginVertical: hp('0.7%'), borderWidth: 2, borderColor: COLORS.primary },
  logoPlaceholderCompact: { fontSize: wp('2.5%'), fontFamily: "PlusSB", color: COLORS.placeholder, marginBottom: hp('0.3%'), marginTop: -hp('0.2%') },
  toggleRowCompact: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: hp('0.7%'), marginTop: hp('0.3%') },
  toggleBtnCompact: { flex: 1, padding: hp('0.7%'), borderRadius: wp('2.5%'), borderWidth: 2, borderColor: '#e0e0e0', marginHorizontal: wp('0.7%'), alignItems: 'center', backgroundColor: '#fff' },
  toggleBtnActiveCompact: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleTextCompact: { fontSize: wp('3.5%'), fontFamily: "PlusL", color: '#666' },
  toggleTextActiveCompact: { color: '#fff' },
  modalButtonRowCompact: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: wp('2.5%'), marginTop: hp('0.7%') },
  modalBtnCompact: { flex: 1, padding: hp('1.2%'), borderRadius: wp('2.5%'), alignItems: 'center', marginHorizontal: wp('1.2%') },
  modalBtnPrimary: { backgroundColor: COLORS.primary },
  modalBtnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.primary },
  modalBtnTextCompact: { color: '#fff', fontFamily: "PlusSB", fontSize: wp('4%') },
  modalBtnSecondaryTextCompact: { color: COLORS.primary, fontFamily: "PlusSB", fontSize: wp('4%') },
  selectionModalCard: { width: Dimensions.get('window').width * 0.85, maxHeight: Dimensions.get('window').height * 0.7, backgroundColor: "#fff", borderRadius: wp('5%'), padding: wp('5%'), alignItems: "center" },
  selectOption: { flexDirection: 'row', alignItems: 'center', width: '48%', padding: wp('2%'), margin: wp('1.2%'), borderRadius: wp('2%'), borderWidth: 1, borderColor: `${COLORS.primary}30`, backgroundColor: '#fff' },
  selectOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectOptionText: { fontSize: wp('3.5%'), fontFamily: "PlusR", color: COLORS.text, flexShrink: 1 },
  selectOptionTextSelected: { color: '#fff', fontFamily: "PlusSB" },
  selectionCount: { marginTop: hp('0.7%'), fontSize: wp('3.5%'), fontFamily: "PlusSB", color: COLORS.primary },
  deleteModalCard: { width: Dimensions.get('window').width * 0.8, backgroundColor: "#fff", borderRadius: wp('5%'), padding: wp('6%'), alignItems: "center" },
  deleteModalContent: { alignItems: 'center' },
  deleteModalTitle: { fontFamily: "PlusSB", fontSize: wp('5.5%'), color: COLORS.danger, marginTop: hp('1.2%') },
  deleteModalMessage: { fontFamily: "PlusR", fontSize: wp('3.7%'), color: "#444", textAlign: 'center', marginVertical: hp('1.2%') },
  deleteModalHighlight: { fontFamily: "PlusSB", color: "#000" },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: hp('2.5%') },
  modalBtn: { flex: 1, padding: hp('1.5%'), borderRadius: wp('2.5%'), alignItems: 'center', marginHorizontal: wp('1.2%') },
  modalBtnDelete: { backgroundColor: COLORS.danger },
  modalBtnSecondaryText: { color: COLORS.primary, fontFamily: "PlusSB", fontSize: wp('4%') },
  modalBtnText: { color: '#fff', fontFamily: "PlusSB", fontSize: wp('4%') },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    marginBottom: hp('1.2%'),
    overflow: 'hidden',
  },
  pickerCompact: {
    height: hp('5.5%'),
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
});

export default ManageRealtors;