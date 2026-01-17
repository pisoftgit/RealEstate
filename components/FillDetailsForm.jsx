import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import * as SecureStore from "expo-secure-store";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import useFurnishingStatusActions from "../hooks/useFurnishingStatusActions";
import useFaceDirectionActions from "../hooks/useFaceDirectionActions";
import useMeasurementUnits from "../hooks/useMeasurements";
import useAmenityActions from "../hooks/useAmenityActions";
import useFacilityActions from "../hooks/useFacilityActions";
import useOwnershipTypes from "../hooks/useOwnership";
import { API_BASE_URL } from "../services/api";

const { height: screenHeight } = Dimensions.get("window");

import useFillDetails from '../hooks/useFillDetails';

const FillDetailsForm = ({ visible, onClose, selectedCount = 0, onSave, propertyType, initialData, propIds }) => {
  propIds
    const { fillDetails, loading: fillLoading, error: fillError } = useFillDetails();
  const [furnishing, setFurnishing] = useState("");
  const [facing, setFacing] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("");
  const [loadingPercent, setLoadingPercent] = useState("");
  const [superArea, setSuperArea] = useState("");
  const [kitchens, setKitchens] = useState("");
  const [basicCost, setBasicCost] = useState("");
  const [amenities, setAmenities] = useState([]); // changed to array for multi-select
  const [facilities, setFacilities] = useState([]); // changed to array for multi-select
  const [description, setDescription] = useState("");
  const [deleteExistingFiles, setDeleteExistingFiles] = useState(false);
  const [ownershipType, setOwnershipType] = useState("");
  const [khasraNo, setKhasraNo] = useState("");

  // Image upload modal state
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLabel, setImageLabel] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Image preview modal state
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Fetch dropdown data from hooks - MUST be called before useEffects that depend on them
  const { statuses: furnishingStatuses } = useFurnishingStatusActions();
  const { faceDirections } = useFaceDirectionActions();
  const { units } = useMeasurementUnits();
  const { amenities: amenityList } = useAmenityActions();
  const { facilities: facilityList } = useFacilityActions();
  const { ownershipTypes } = useOwnershipTypes();

  // Prefill form when initialData changes (edit mode)
  useEffect(() => {
    if (initialData) {
      console.log("Initial Data for Edit:", JSON.stringify(initialData, null, 2));
      
      // Helper function to convert ID to string (since dropdown values are strings)
      const toStringId = (val) => (val !== undefined && val !== null && val !== "" ? String(val) : "");
      
      // Furnishing - API uses furnishingStatus.id
      const furnishingId = initialData.furnishingStatus?.id || initialData.furnishingStatusId || initialData.furnishing?.id || initialData.furnishingId || "";
      setFurnishing(toStringId(furnishingId));
      
      // Facing - API uses faceDirection.id
      const facingId = initialData.faceDirection?.id || initialData.faceDirectionId || initialData.facing?.id || initialData.facingId || "";
      setFacing(toStringId(facingId));
      
      // Carpet Area - use only initialData.carpetArea
      const carpetAreaVal = initialData.carpetArea || "";
      setCarpetArea(carpetAreaVal ? carpetAreaVal.toString() : "");
      
      // Area Unit - API uses areaUnit.id
      const areaUnitId = initialData.areaUnit?.id || initialData.areaUnitId || initialData.measurementUnit?.id || "";
      setAreaUnit(toStringId(areaUnitId) || "sqft");
      
      // Loading Percent
      const loadingVal = initialData.loadingPercent || initialData.loading || initialData.loadingPercentage || "";
      setLoadingPercent(loadingVal ? loadingVal.toString() : "");
      
      // Super Area
      const superAreaVal = initialData.superArea || initialData.superBuiltUpArea || initialData.builtUpArea || "";
      setSuperArea(superAreaVal ? superAreaVal.toString() : "");
      
      // Number of Kitchens - API uses "totalNoOfKitchen"
      const kitchensVal = initialData.totalNoOfKitchen || initialData.kitchens || initialData.numberOfKitchens || initialData.noOfKitchens || initialData.kitchen || "";
      setKitchens(kitchensVal ? kitchensVal.toString() : "");
      
      // Basic Cost - API uses "basicAmount"
      const costVal = initialData.basicAmount || initialData.basicCost || initialData.cost || initialData.price || initialData.baseCost || initialData.unitPrice || "";
      setBasicCost(costVal ? costVal.toString() : "");
      
      // Description
      setDescription(initialData.description || initialData.desc || "");
      
      // Ownership Type
      const ownershipId = initialData.ownershipType?.id || initialData.ownershipTypeId || initialData.ownership?.id || "";
      setOwnershipType(toStringId(ownershipId));
      
      // Khasra No
      setKhasraNo(initialData.khasraNo || initialData.khasraNumber || "");
      
      // Handle existing media/images - API uses "propertyMediaList" with filePath
      const mediaList = initialData.propertyMediaList || initialData.media || initialData.mediaList || initialData.images || [];
      const existingImages = mediaList.map(m => ({
        uri: m.filePath || m.url || m.mediaUrl || m.imageUrl || m.uri,
        label: m.mediaLabel || m.label || m.name || "Image",
        id: m.id, // Keep track of existing media ID for updates
      }));
      setSelectedImages(existingImages);
    } else {
      // Reset form when no initialData (new entry mode)
      setFurnishing("");
      setFacing("");
      setCarpetArea("");
      setAreaUnit("sqft");
      setLoadingPercent("");
      setSuperArea("");
      setKitchens("");
      setBasicCost("");
      setAmenities([]);
      setFacilities([]);
      setDescription("");
      setOwnershipType("");
      setKhasraNo("");
      setSelectedImages([]);
    }
  }, [initialData]);

  // Set amenities ONLY when BOTH initialData AND amenityList are available
  useEffect(() => {
    if (initialData && amenityList && amenityList.length > 0) {
      const amenitiesData = initialData.amenities || initialData.amenityList || [];
      if (amenitiesData.length > 0) {
        // Get all available amenity IDs from dropdown
        const availableIds = amenityList.map(a => String(a.id));
        
        // Extract IDs from API data and convert to strings
        const amenityIds = amenitiesData
          .map(a => String(typeof a === 'object' ? a.id : a))
          .filter(id => id && id !== "undefined" && id !== "null" && availableIds.includes(id));
        
        console.log("Prefilling amenities:", amenityIds);
        
        if (amenityIds.length > 0) {
          setAmenities(amenityIds);
        }
      }
    }
  }, [initialData, amenityList]);

  // Set facilities ONLY when BOTH initialData AND facilityList are available
  useEffect(() => {
    if (initialData && facilityList && facilityList.length > 0) {
      const facilitiesData = initialData.facilities || initialData.facilityList || [];
      if (facilitiesData.length > 0) {
        // Get all available facility IDs from dropdown
        const availableIds = facilityList.map(f => String(f.id));
        
        // Extract IDs from API data and convert to strings
        const facilityIds = facilitiesData
          .map(f => String(typeof f === 'object' ? f.id : f))
          .filter(id => id && id !== "undefined" && id !== "null" && availableIds.includes(id));
        
        console.log("Prefilling facilities:", facilityIds);
        
        if (facilityIds.length > 0) {
          setFacilities(facilityIds);
        }
      }
    }
  }, [initialData, facilityList]);

  // Pick images from gallery
  const pickImages = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to upload images.");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Read base64 for each image
      const newImages = await Promise.all(result.assets.map(async (asset) => {
        let base64 = asset.base64;
        if (!base64 && asset.uri) {
          try {
            const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
            base64 = fileBase64;
          } catch (e) {
            base64 = '';
          }
        }
        return {
          uri: asset.uri,
          label: imageLabel || asset.fileName || "Image",
          base64: base64 ? `data:image/jpeg;base64,${base64}` : '',
        };
      }));
      setSelectedImages([...selectedImages, ...newImages]);
      setImageLabel("");
      setImageModalVisible(false);
    }
  };

  // Remove an image
  const removeImage = (index) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  // Fetch and preview image (secure fetch for existing images from API)
  const handleImagePreview = async (img) => {
    // Check if it's an existing image from API (has id and filePath that's not a local uri)
    const isExistingApiImage = img.id && img.uri && !img.uri.startsWith('file://') && !img.uri.startsWith('content://');
    
    if (isExistingApiImage) {
      // Fetch image securely from API using same approach as Propertydetailview
      setLoadingImage(true);
      setPreviewModalVisible(true);
      setPreviewImage(null);
      
      try {
        const secretKey = await SecureStore.getItemAsync("auth_token");
        if (!secretKey) {
          Alert.alert("Error", "Authentication token not found");
          setPreviewModalVisible(false);
          setLoadingImage(false);
          return;
        }

        const mediaUrl = `${API_BASE_URL}/property-media/by-id?id=${img.id}`;
        console.log('Fetching image from API:', mediaUrl);
        
        const response = await fetch(mediaUrl, {
          method: 'GET',
          headers: {
            'secret_key': secretKey,
            'Accept': '*/*',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load image. Status: ${response.status}`);
        }

        // Get the blob and convert to base64
        const blob = await response.blob();
        
        // Convert blob to base64 using FileReader API
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        setPreviewImage(base64Data);
      } catch (error) {
        console.error("Error fetching image:", error);
        Alert.alert("Error", "Failed to load image preview");
        setPreviewModalVisible(false);
      } finally {
        setLoadingImage(false);
      }
    } else {
      // It's a newly selected local image, show directly
      setPreviewImage(img.uri);
      setPreviewModalVisible(true);
      setLoadingImage(false);
    }
  };

  // Calculate super area automatically
  React.useEffect(() => {
    if (carpetArea && loadingPercent) {
      const carpet = parseFloat(carpetArea);
      const loading = parseFloat(loadingPercent);
      if (!isNaN(carpet) && !isNaN(loading)) {
        const superAreaCalc = carpet + (carpet * loading) / 100;
        setSuperArea(superAreaCalc.toFixed(2));
      }
    }
  }, [carpetArea, loadingPercent]);

  const handleSave = async () => {
    // Debug: log selectedImages before sending
    console.log('FillDetailsForm selectedImages:', selectedImages);
    // Map form state to API payload
    const payload = {
      propIds: propIds
        ? Array.isArray(propIds)
          ? propIds
          : [propIds]
        : initialData && initialData.propertyId
          ? [initialData.propertyId]
          : [],
      possessionStatus: initialData?.possessionStatus || "READY_TO_MOVE", // Example default
      faceDirectionId: facing ? Number(facing) : undefined,
      furnishingStatusId: furnishing ? Number(furnishing) : undefined,
      hasParking: initialData?.hasParking ?? true, // Example default
      carpetArea: carpetArea ? Number(carpetArea) : undefined,
      carpetAreaUnitId: areaUnit ? Number(areaUnit) : undefined,
      loadingPercentage: loadingPercent ? Number(loadingPercent) : undefined,
      basicAmount: basicCost ? Number(basicCost) : undefined,
      totalAmount: initialData?.totalAmount || undefined,
      description,
      amenityIds: amenities.map(Number),
      facilityIds: facilities.map(Number),
      shouldDeletePreviousFile: deleteExistingFiles,
      propertyMediaList: selectedImages
        .filter(img => !!img.base64)
        .map((img, idx) => ({
          mediaLabel: img.label || `image${idx+1}`,
          contentType: 'image/jpeg',
          mediaBase64: img.base64,
        })),
      flat: (propertyType === 'GROUP_BLOCK' || propertyType === 'FLAT') ? {
        totalNoOfKitchen: kitchens ? Number(kitchens) : undefined,
      } : undefined,
      houseVilla: propertyType === 'HOUSE_VILLA' ? {
        totalNoOfKitchen: kitchens ? Number(kitchens) : undefined,
        totalNoOfFloors: initialData?.totalNoOfFloors || undefined,
      } : undefined,
      plot: propertyType === 'PLOT' ? {
        ownerShipTypeId: ownershipType ? Number(ownershipType) : undefined,
      } : undefined,
      commercialUnit: propertyType === 'COMMERCIAL_PROPERTY_UNIT' ? {
        ownerShipTypeId: ownershipType ? Number(ownershipType) : undefined,
      } : undefined,
    };
    console.log('FillDetails Payload:', payload);
    try {
      const result = await fillDetails(payload);
      console.log('FillDetails API Response:', result);
      onSave && onSave(result);
      onClose();
    } catch (err) {
      console.log('FillDetails API Error:', err?.response?.data || err);
      Alert.alert('Error', 'Failed to save details.');
    }
  };

  // Normalize propertyType so checks are case-insensitive
  const normalizedType = (propertyType || "").toUpperCase();

  const showKitchens =
    normalizedType === "GROUP_BLOCK" || normalizedType === "HOUSE_VILLA";
  const showOwnershipType =
    normalizedType === "PLOT" || normalizedType === "COMMERCIAL_PROPERTY_UNIT";
  const showKhasraNo = normalizedType === "PLOT";

  const furnishingDropdownData = (furnishingStatuses || []).map((s) => ({
    label: s.name,
    value: s.id?.toString(),
  }));

  const facingDropdownData = (faceDirections || []).map((f) => ({
    label: f.name,
    value: f.id?.toString(),
  }));

  let unitDropdownData = (units || []).map((u) => ({
    label: u.name,
    value: u.id?.toString(),
  }));

  // If initialData.carpetAreaUnit exists and is not in the dropdown, add it
  if (initialData && initialData.carpetAreaUnit && initialData.carpetAreaUnit.unitName && initialData.carpetAreaUnit.id) {
    const exists = unitDropdownData.some(u => u.value === initialData.carpetAreaUnit.id.toString());
    if (!exists) {
      unitDropdownData = [
        { label: initialData.carpetAreaUnit.unitName, value: initialData.carpetAreaUnit.id.toString() },
        ...unitDropdownData
      ];
    }
    // Preselect carpetAreaUnit
    if (areaUnit !== initialData.carpetAreaUnit.id.toString()) {
      setAreaUnit(initialData.carpetAreaUnit.id.toString());
    }
  }

  const amenitiesDropdownData = (amenityList || []).map((a) => ({
    label: a.name,
    value: String(a.id),
  }));

  const facilitiesDropdownData = (facilityList || []).map((f) => ({
    label: f.name,
    value: String(f.id),
  }));

  const ownershipDropdownData = (ownershipTypes || []).map((o) => ({
    label: o.type || o.name || o.id?.toString(),
    value: o.id?.toString(),
  }));

  // Create unique keys for MultiSelect to force re-render when data changes
  const amenitiesKey = `amenities-${amenities.join(',')}-${amenitiesDropdownData.length}`;
  const facilitiesKey = `facilities-${facilities.join(',')}-${facilitiesDropdownData.length}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.drawer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Fill Details {selectedCount > 0 ? `(${selectedCount} flats selected)` : ""}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#222" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Basic Details Section */}
            <Text style={styles.sectionTitle}>Basic Details</Text>
            <View style={styles.sectionLine} />

            <Text style={styles.label}>Furnishing</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownItemText}
              data={furnishingDropdownData}
              maxHeight={260}
              labelField="label"
              valueField="value"
              placeholder={furnishing ? undefined : "Select Furnishing"}
              value={furnishing}
              onChange={(item) => {
                setFurnishing(item.value);
              }}
            />

            <Text style={styles.label}>Facing</Text>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownItemText}
              data={facingDropdownData}
              maxHeight={260}
              labelField="label"
              valueField="value"
              placeholder={facing ? undefined : "Select Facing Direction"}
              value={facing}
              onChange={(item) => {
                setFacing(item.value);
              }}
            />

            {/* Area Details Section */}
            <Text style={styles.sectionTitle}>Area Details</Text>
            <View style={styles.sectionLine} />

            <Text style={styles.label}>Carpet Area</Text>
            <View style={styles.rowInput}>
              <TextInput
                style={[styles.input, styles.carpetInput]}
                placeholder="Enter carpet area"
                placeholderTextColor="#aaa"
                value={carpetArea}
                onChangeText={setCarpetArea}
                keyboardType="numeric"
              />
              <Dropdown
                style={styles.unitDropdown}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.unitText}
                selectedTextStyle={styles.unitText}
                itemTextStyle={styles.dropdownItemText}
                data={unitDropdownData}
                maxHeight={260}
                labelField="label"
                valueField="value"
                placeholder={(initialData && initialData.carpetAreaUnit && initialData.carpetAreaUnit.unitName) ? undefined : "Unit"}
                value={areaUnit}
                onChange={(item) => {
                  setAreaUnit(item.value);
                }}
              />
           
            </View>

            <Text style={styles.label}>Loading %</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter loading percentage"
              placeholderTextColor="#aaa"
              value={loadingPercent}
              onChangeText={setLoadingPercent}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Super Area</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Auto-calculated"
              placeholderTextColor="#aaa"
              value={superArea}
              editable={false}
            />

            {/* Other Details Section */}
            <Text style={styles.sectionTitle}>Other Details</Text>
            <View style={styles.sectionLine} />

            {showKitchens && (
              <>
                <Text style={styles.label}>Number of Kitchens</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of kitchens"
                  placeholderTextColor="#aaa"
                  value={kitchens}
                  onChangeText={setKitchens}
                  keyboardType="numeric"
                />
              </>
            )}

            {showOwnershipType && (
              <>
                <Text style={styles.label}>Ownership Type</Text>
                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownText}
                  selectedTextStyle={styles.dropdownText}
                  itemTextStyle={styles.dropdownItemText}
                  data={ownershipDropdownData}
                  maxHeight={260}
                  labelField="label"
                  valueField="value"
                  placeholder={ownershipType ? undefined : "Select Ownership Type"}
                  value={ownershipType}
                  onChange={(item) => {
                    setOwnershipType(item.value);
                  }}
                />
              </>
            )}

            {showKhasraNo && (
              <>
                <Text style={styles.label}>Khasra No.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Khasra number"
                  placeholderTextColor="#aaa"
                  value={khasraNo}
                  onChangeText={setKhasraNo}
                />
              </>
            )}

            <Text style={styles.label}>Basic Cost</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter basic cost"
              placeholderTextColor="#aaa"
              value={basicCost}
              onChangeText={setBasicCost}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Amenities</Text>
            <MultiSelect
              key={amenitiesKey}
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownItemText}
              data={amenitiesDropdownData}
              maxHeight={260}
              labelField="label"
              valueField="value"
              placeholder="Select Amenities"
              value={amenities}
              onChange={(items) => {
                console.log("Amenities changed to:", items);
                setAmenities(items);
              }}
              selectedStyle={styles.selectedStyle}
              activeColor="#e8f5e9"
              search
              searchPlaceholder="Search amenities..."
              renderItem={(item, selected) => (
                <View style={styles.itemRow}>
                  <Text style={[styles.dropdownItemText, selected && styles.selectedItemText]}>
                    {item.label}
                  </Text>
                  {selected && <Feather name="check" size={18} color="#5aaf57" />}
                </View>
              )}
              renderSelectedItem={(item, unSelect) => (
                <TouchableOpacity onPress={() => unSelect && unSelect(item)} style={styles.selectedStyle}>
                  <Text style={styles.selectedItemText}>{item.label}</Text>
                  <Feather name="x" size={14} color="#217a3b" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
              )}
            />

            <Text style={styles.label}>Facilities</Text>
            <MultiSelect
              key={facilitiesKey}
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.dropdownText}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownItemText}
              data={facilitiesDropdownData}
              maxHeight={260}
              labelField="label"
              valueField="value"
              placeholder="Select Facilities"
              value={facilities}
              onChange={(items) => {
                console.log("Facilities changed to:", items);
                setFacilities(items);
              }}
              selectedStyle={styles.selectedStyle}
              activeColor="#e8f5e9"
              search
              searchPlaceholder="Search facilities..."
              renderItem={(item, selected) => (
                <View style={styles.itemRow}>
                  <Text style={[styles.dropdownItemText, selected && styles.selectedItemText]}>
                    {item.label}
                  </Text>
                  {selected && <Feather name="check" size={18} color="#5aaf57" />}
                </View>
              )}
              renderSelectedItem={(item, unSelect) => (
                <TouchableOpacity onPress={() => unSelect && unSelect(item)} style={styles.selectedStyle}>
                  <Text style={styles.selectedItemText}>{item.label}</Text>
                  <Feather name="x" size={14} color="#217a3b" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
              )}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description"
              placeholderTextColor="#aaa"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {/* Media Section */}
            <Text style={styles.sectionTitle}>Media</Text>
            <View style={styles.sectionLine} />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Delete Existing Files</Text>
              <Switch
                value={deleteExistingFiles}
                onValueChange={setDeleteExistingFiles}
                trackColor={{ false: "#ccc", true: "#5aaf57" }}
                thumbColor={deleteExistingFiles ? "#fff" : "#f4f3f4"}
              />
            </View>

            <Text style={styles.label}>Images</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => setImageModalVisible(true)}>
              <Feather name="image" size={24} color="#5aaf57" />
              <Text style={styles.uploadText}>Upload Images</Text>
            </TouchableOpacity>

            {/* Show selected images as icon + name (click to preview) */}
            {selectedImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                {selectedImages.map((img, index) => {
                  // Check if it's an existing API image or a newly uploaded local image
                  const isLocalImage = img.uri && (img.uri.startsWith('file://') || img.uri.startsWith('content://'));
                  
                  return (
                    <View key={index} style={styles.imageItemWrapper}>
                      <TouchableOpacity 
                        style={styles.imageItemContent} 
                        onPress={() => handleImagePreview(img)}
                      >
                        <View style={styles.imageIconContainer}>
                          <Feather 
                            name={isLocalImage ? "image" : "file-text"} 
                            size={24} 
                            color="#5aaf57" 
                          />
                        </View>
                        <View style={styles.imageNameContainer}>
                          <Text style={styles.imageNameText} numberOfLines={1}>
                            {img.label || "Image"}
                          </Text>
                          <Text style={styles.imageSubText}>
                            {isLocalImage ? "New" : "Existing"}
                          </Text>
                        </View>
                        <Feather name="eye" size={18} color="#888" style={{ marginLeft: 8 }} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                        <Feather name="x" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={fillLoading}>
            <Text style={styles.saveBtnText}>{fillLoading ? 'Saving...' : 'Save Details'}</Text>
          </TouchableOpacity>
          {fillError && (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
              Error saving details. Please try again.
            </Text>
          )}
        </View>
      </View>

      {/* Image Upload Modal */}
      <Modal
        visible={imageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity 
            style={styles.imageModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setImageModalVisible(false)} 
          />
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>Upload Image</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Feather name="x" size={24} color="#222" />
              </TouchableOpacity>
            </View>

            <View style={styles.imageModalDivider} />

            <Text style={styles.label}>Image Label</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter image label (optional)"
              placeholderTextColor="#aaa"
              value={imageLabel}
              onChangeText={setImageLabel}
            />

            <TouchableOpacity style={styles.chooseUploadBtn} onPress={pickImages}>
              <Feather name="upload-cloud" size={22} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.chooseUploadBtnText}>Choose & Upload Images</Text>
            </TouchableOpacity>

            <Text style={styles.noteText}>Note: If no label is provided, the image filename will be used.</Text>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={previewModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.previewModalOverlay}>
          <TouchableOpacity 
            style={styles.previewModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setPreviewModalVisible(false)} 
          />
          <View style={styles.previewModalContent}>
            <TouchableOpacity 
              style={styles.previewCloseBtn} 
              onPress={() => setPreviewModalVisible(false)}
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.imageContainer}>
              {loadingImage ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#217a3b" />
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              ) : previewImage ? (
                <Image
                  source={{ uri: previewImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawer: {
    width: "100%",
    height: screenHeight * 0.6,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 20,
    paddingBottom: Platform.OS === "android" ? 16 : 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#222",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#222",
    marginTop: 18,
    marginBottom: 4,
  },
  sectionLine: {
    height: 3,
    backgroundColor: "#5aaf57",
    width: "100%",
    marginBottom: 12,
    borderRadius: 2,
  },
  label: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#333",
  },
  dropdownItemText: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#333",
  },
  carpetInput: {
    flex: 1,
    marginRight: 8,
  },
  unitDropdown: {
    minWidth: 90,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
  },
  unitText: {
    fontSize: 12,
    fontFamily: "PlusSB",
    color: "#222",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "PlusL",
    color: "#222",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  disabledInput: {
    backgroundColor: "#eaeaea",
    color: "#888",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  rowInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#5aaf57",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 6,
  },
  uploadText: {
    fontSize: 15,
    fontFamily: "PlusSB",
    color: "#5aaf57",
    marginLeft: 10,
  },
  saveBtn: {
    backgroundColor: "#217a3b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusSB",
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  imageModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageModalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "android" ? 20 : 34,
  },
  imageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  imageModalTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#222",
  },
  imageModalDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 16,
  },
  chooseUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#217a3b",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
  },
  chooseUploadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusSB",
  },
  noteText: {
    fontSize: 12,
    fontFamily: "PlusL",
    color: "#888",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  selectedImagesContainer: {
    flexDirection: "column",
    marginTop: 12,
  },
  imageItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    position: "relative",
  },
  imageItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 40,
  },
  imageIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  imageNameContainer: {
    flex: 1,
  },
  imageNameText: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
  },
  imageSubText: {
    fontSize: 11,
    fontFamily: "PlusL",
    color: "#888",
    marginTop: 2,
  },
  imagePreviewWrapper: {
    width: 80,
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  imageLabelText: {
    fontSize: 10,
    fontFamily: "PlusL",
    color: "#333",
    textAlign: "center",
    marginTop: 4,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#d32f2f",
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    borderColor: "#5aaf57",
    borderWidth: 1,
    marginRight: 6,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedItemText: {
    color: "#217a3b",
    fontFamily: "PlusSB",
  },
  previewModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  previewModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewModalContent: {
    width: "92%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  previewCloseBtn: {
    position: "absolute",
    top: -40,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "PlusL",
    color: "#888",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});

export default FillDetailsForm;
