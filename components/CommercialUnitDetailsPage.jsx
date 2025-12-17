import React, { useState, useEffect, Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "../services/api";
import useCommercialUnitsByProject from "../hooks/useCommercialUnitsByProject";
import useFurnishingStatusActions from "../hooks/useFurnishingStatusActions";
import useFaceDirectionActions from "../hooks/useFaceDirectionActions";
import useAmenityActions from "../hooks/useAmenityActions";
import useFacilityActions from "../hooks/useFacilityActions";
import useMeasurements from "../hooks/useMeasurements";
import useOwnership from '../hooks/useOwnership';
import { getAllPlc } from '../services/api';

const screenHeight = Dimensions.get("window").height;

const PlotsDetailsPage = ({ propertyData, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStructure, setSelectedStructure] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [structureDropdownVisible, setStructureDropdownVisible] = useState(false);
  const [areaDropdownVisible, setAreaDropdownVisible] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedFlats, setSelectedFlats] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fillDetailsModalVisible, setFillDetailsModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocationFlat, setSelectedLocationFlat] = useState(null);
  const [imageUploadModalVisible, setImageUploadModalVisible] = useState(false);
  const [imageLabel, setImageLabel] = useState("");
  const [imageViewModalVisible, setImageViewModalVisible] = useState(false);
  const [currentViewingImage, setCurrentViewingImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Use the custom hook to fetch commercial units
  const { commercialUnits, loading, fetchCommercialUnits, saveCommercialUnitDetails, updateCommercialUnitDetails, saveCommercialUnitPlcDetails, fetchCommercialUnitDetailsForPlc, deleteCommercialUnit, saving, saveError } = useCommercialUnitsByProject(propertyData?.projectId);

  // Use the custom hook to fetch ownership types
  const { ownershipTypes: ownerships, loading: ownershipLoading } = useOwnership();

  // Use the custom hook to fetch furnishing statuses
  const { statuses: furnishingStatuses, loading: furnishingLoading } = useFurnishingStatusActions();

  // Use the custom hook to fetch face directions
  const { faceDirections, loading: faceDirectionsLoading } = useFaceDirectionActions();

  // Use the custom hook to fetch amenities
  const { amenities, loading: amenitiesLoading } = useAmenityActions();

  // Use the custom hook to fetch facilities
  const { facilities, loading: facilitiesLoading } = useFacilityActions();

  // Use the custom hook to fetch measurement units
  const { units: measurementUnits, loading: measurementUnitsLoading } = useMeasurements();

  // State for PLC data
  const [plcData, setPlcData] = useState([]);
  const [plcLoading, setPlcLoading] = useState(false);

  // Fill Details Form State
  const [formData, setFormData] = useState({
    ownership: "",
    furnishing: "",
    facing: "",
    carpetArea: "",
    carpetAreaUnit: "",
    loadingPercentage: "",
    superArea: "",
    numberOfKitchens: "",
    basicCost: "",
    amenities: [],
    facilities: [],
    description: "",
    images: [],
    deleteExistingFiles: false,
    // Dropdown visibility states
    ownershipDropdownVisible: false,
    furnishingDropdownVisible: false,
    facingDropdownVisible: false,
    unitDropdownVisible: false,
    amenitiesDropdownVisible: false,
    facilitiesDropdownVisible: false,
  });

  // Location Form State
  const [locationFormData, setLocationFormData] = useState({
    places: [
      {
        id: 1,
        place: "",
        rateValue: "",
        rateUnit: "",
        placeDropdownVisible: false,
        rateUnitDropdownVisible: false,
      }
    ],
  });

  const navigation = useNavigation();
  const router = useRouter();

  // Dropdown options
  const plotOptions = ["All Plot", "Residential", "Commercial"];
  const areaOptions = ["All Areas", "500-1000 sq ft", "1000-1500 sq ft", "1500-2000 sq ft", "2000+ sq ft"];

  // Fill Details Form Options
  // Ownership options now come from the useOwnership hook
  const ownershipOptions = ownerships.map(ownership => ownership.type);
  // Furnishing options now come from the useFurnishingStatusActions hook
  const furnishingOptions = furnishingStatuses.map(status => status.name);
  // Facing options now come from the useFaceDirectionActions hook
  const facingOptions = faceDirections.map(direction => direction.name);
  // Area unit options now come from the useMeasurements hook
  const areaUnitOptions = measurementUnits.map(unit => unit.name);
  // Amenities options now come from the useAmenityActions hook
  const amenitiesOptions = amenities.map(amenity => amenity.name);
  // Facilities options now come from the useFacilityActions hook
  const facilitiesOptions = facilities.map(facility => facility.name);

  // Location Modal Options - PLC options now come from the getAllPlc API
  const placeOptions = plcData.map(plc => plc.plcName || plc.name || plc.place);

  const rateUnitOptions = [
    { label: "Amount", value: false },
    { label: "Percentage", value: true }
  ];

  // Fetch PLC data on component mount
  useEffect(() => {
    const fetchPlcData = async () => {
      try {
        setPlcLoading(true);
        const secretKey = await SecureStore.getItemAsync("auth_token");
        const response = await axios.get(`${API_BASE_URL}/plcs/getAllPlcs`, {
          headers: { secret_key: secretKey }
        });
        const data = response.data.data || response.data || [];
        setPlcData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching PLC data:", error);
        setPlcData([]);
      } finally {
        setPlcLoading(false);
      }
    };

    fetchPlcData();
  }, []);

  // Update select all state based on selected flats
  useEffect(() => {
    if (filteredFlats.length > 0) {
      const allSelected = filteredFlats.every(flat => selectedFlats.includes(flat.id));
      setSelectAll(allSelected);
    }
  }, [selectedFlats, filteredFlats]);

  const handleStructureSelect = (structure) => {
    setSelectedStructure(structure);
    setStructureDropdownVisible(false);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setAreaDropdownVisible(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSelectFlat = (flatId) => {
    setSelectedFlats(prev => {
      if (prev.includes(flatId)) {
        return prev.filter(id => id !== flatId);
      } else {
        return [...prev, flatId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFlats([]);
      setSelectAll(false);
    } else {
      const allFlatIds = filteredFlats.map(flat => flat.id);
      setSelectedFlats(allFlatIds);
      setSelectAll(true);
    }
  };

  const handleActionsPress = (flat) => {
    setSelectedFlat(flat);
    setActionsModalVisible(true);
  };

  const handleViewPress = async (unit) => {
    setViewModalCurrentIndex(0); // Reset to first tab
    setViewModalVisible(true);
    
    // Fetch detailed commercial unit information from PLC API
    if (unit?.commercialUnitId || unit?.id) {
      try {
        const unitId = unit.commercialUnitId || unit.id;
        console.log('Fetching details for unit ID:', unitId);
        
        const result = await fetchCommercialUnitDetailsForPlc(unitId);
        
        if (result.success && result.data) {
          console.log('Fetched detailed data:', result.data);
          setSelectedFlat(result.data);
        } else {
          console.log('Failed to fetch details, using basic data');
          // If fetch fails, use the basic unit data
          setSelectedFlat(unit);
        }
      } catch (error) {
        console.error('Error fetching commercial unit details:', error);
        // If error, use the basic unit data
        setSelectedFlat(unit);
      }
    } else {
      setSelectedFlat(unit);
    }
  };

  const handleViewMediaFile = async (filePath) => {
    if (!filePath) {
      Alert.alert("Error", "No file path available");
      return;
    }

    try {
      setImageLoading(true);
      setImageViewModalVisible(true);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      if (!secretKey) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        setImageViewModalVisible(false);
        setImageLoading(false);
        return;
      }

      const mediaUrl = `${API_BASE_URL}/property-media/by-path?path=${encodeURIComponent(filePath)}`;
      console.log('Fetching media file from path:', mediaUrl);
      
      const response = await fetch(mediaUrl, {
        method: 'GET',
        headers: {
          'secret_key': secretKey,
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
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
      
      setCurrentViewingImage(base64Data);
      setImageLoading(false);
      
    } catch (err) {
      console.error("Failed to load media file:", err);
      Alert.alert("Error", `Failed to load the media file. ${err.message || 'Please try again.'}`);
      setImageViewModalVisible(false);
      setImageLoading(false);
      setCurrentViewingImage(null);
    }
  };

  const handleDeletePress = async (unit) => {
    Alert.alert(
      "Delete Commercial Unit",
      `Are you sure you want to delete Unit ${unit.unitNumber}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteCommercialUnit(unit.commercialUnitId || unit.id);
              if (result.success) {
                Alert.alert("Success", "Commercial unit deleted successfully!");
                // Refresh the list
                await fetchCommercialUnits();
              } else {
                Alert.alert("Error", result.message || "Failed to delete commercial unit");
              }
            } catch (error) {
              console.error("Error deleting commercial unit:", error);
              Alert.alert("Error", "An error occurred while deleting the commercial unit");
            }
          }
        }
      ]
    );
  };

  const handleActionOptionPress = async (option) => {
    switch (option) {
      case "Edit":
        // Close action modal first, then open fill details modal with delay
        setActionsModalVisible(false);

        // Use timeout to ensure action modal is closed before opening fill details
        setTimeout(async () => {
          // Close all dropdowns first
          setStructureDropdownVisible(false);
          setAreaDropdownVisible(false);

          // Fetch detailed unit information before opening modal
          let unitData = selectedFlat;
          if (selectedFlat?.commercialUnitId || selectedFlat?.id) {
            try {
              const unitId = selectedFlat.commercialUnitId || selectedFlat.id;
              const result = await fetchCommercialUnitDetailsForPlc(unitId);
              if (result.success && result.data) {
                unitData = result.data;
              }
            } catch (error) {
              console.error('Error fetching unit details for edit:', error);
              // Continue with basic data if fetch fails
            }
          }

          // Select the current unit and open Fill Details modal
          setSelectedFlats([unitData.id]);
          // Pre-fill form with fetched unit's data
          setFormData({
            ownership: unitData.ownership || unitData.ownershipType || "",
            furnishing: unitData.furnishing || unitData.furnishingStatus || "",
            facing: unitData.facing || unitData.faceDirection || "",
            carpetArea: unitData.carpetArea ? String(unitData.carpetArea) : (unitData.area ? String(unitData.area).replace(/[^\d.]/g, '') : ""),
            carpetAreaUnit: unitData.areaUnit || "sq ft",
            loadingPercentage: unitData.loadingPercentage ? String(unitData.loadingPercentage) : "",
            superArea: unitData.carpetArea && unitData.loadingPercentage 
              ? String((unitData.carpetArea * (1 + unitData.loadingPercentage / 100)).toFixed(2))
              : "",
            numberOfKitchens: unitData.totalNoOfKitchen ? String(unitData.totalNoOfKitchen) : "",
            basicCost: unitData.basicAmount ? String(unitData.basicAmount) : (unitData.basicCost ? String(unitData.basicCost) : ""),
            amenities: unitData.amenities 
              ? unitData.amenities.map(a => a.amenityName || a.name || a).filter(Boolean)
              : [],
            facilities: unitData.facilities 
              ? unitData.facilities.map(f => f.facilityName || f.name || f).filter(Boolean)
              : [],
            description: unitData.description || "",
            images: [],
            deleteExistingFiles: false,
            // Reset all dropdown visibility states
            ownershipDropdownVisible: false,
            furnishingDropdownVisible: false,
            facingDropdownVisible: false,
            unitDropdownVisible: false,
            amenitiesDropdownVisible: false,
            facilitiesDropdownVisible: false,
          });
          setFillDetailsModalVisible(true);
        }, 300);
        break;
      case "View":
        handleViewPress(selectedFlat);
        setActionsModalVisible(false);
        break;
      case "Delete":
        handleDeletePress(selectedFlat);
        setActionsModalVisible(false);
        break;
      case "Location":
        handleLocationPress(selectedFlat);
        setActionsModalVisible(false);
        break;
      default:
        console.log(`No action defined for option: ${option}`);
        setActionsModalVisible(false);
        return;
    }
  };

  const renderActionOptions = () => {
    if (!selectedFlat) return null;

    const options = ["Edit", "View", "Delete", "Location"];

    return (
      <View style={styles.actionOptionsContainer}>
        <Text style={styles.modalTitle}>Flat Actions:</Text>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionOptionBtn}
            onPress={() => handleActionOptionPress(option)}
          >
            <Text style={styles.actionOptionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const [viewModalCurrentIndex, setViewModalCurrentIndex] = useState(0);

  const renderViewModal = () => {
    if (!selectedFlat) return null;

    const sections = [
      {
        title: "Basic Details",
        icon: "information-circle-outline",
        content: (
          <View style={styles.sectionContent}>
          
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added Date:</Text>
              <Text style={styles.detailValue}>{selectedFlat.addedDateDisplay}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added By:</Text>
              <Text style={styles.detailValue}>{selectedFlat.addedBy}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Face Direction:</Text>
              <Text style={styles.detailValue}>{selectedFlat.facing || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Furnishing Status:</Text>
              <Text style={styles.detailValue}>{selectedFlat.furnishing || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ownership:</Text>
              <Text style={styles.detailValue}>{selectedFlat.ownership || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability:</Text>
              <View style={styles.availabilityStatus}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: selectedFlat.isAvailable ? "#4CAF50" : "#FF5722" }
                ]} />
                <Text style={[
                  styles.detailValue,
                  { color: selectedFlat.isAvailable ? "#4CAF50" : "#FF5722" }
                ]}>
                  {selectedFlat.status}
                </Text>
              </View>
            </View>
          </View>
        )
      },
      {
        title: "Other Details",
        icon: "document-text-outline",
        content: (
           <View style={styles.sectionContent}>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Carpet Area:</Text>
                       <Text style={styles.detailValue}>{selectedFlat.carpetAreaDisplay || "N/A"}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Loading %:</Text>
                       <Text style={styles.detailValue}>{selectedFlat.loadingDisplay || "N/A"}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Super Area:</Text>
                       <Text style={styles.detailValue}>{selectedFlat.superAreaDisplay || "N/A"}</Text>
                     </View>
                     <View style={styles.detailRow}>
                       <Text style={styles.detailLabel}>Basic Cost:</Text>
                       <Text style={styles.detailValue}>{selectedFlat.basicCostDisplay || "N/A"}</Text>
                     </View>
                     {selectedFlat.description && (
                       <View style={styles.detailRow}>
                         <Text style={styles.detailLabel}>Description:</Text>
                         <Text style={styles.detailValue}>{selectedFlat.description}</Text>
                       </View>
                     )}
                   </View>
        )
      },
      {
        title: "Amenities",
        icon: "star-outline",
        content: (
          <View style={styles.sectionContent}>
            {selectedFlat.amenities && selectedFlat.amenities.length > 0 ? (
              <View style={styles.amenitiesGrid}>
                {selectedFlat.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.amenityText}>
                      {amenity.amenityName || amenity.name || (typeof amenity === 'string' ? amenity : 'N/A')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No amenities available</Text>
            )}
          </View>
        )
      },
      {
        title: "Facilities",
        icon: "location-outline",
        content: (
          <View style={styles.sectionContent}>
            {selectedFlat.facilities && selectedFlat.facilities.length > 0 ? (
              <View style={styles.amenitiesGrid}>
                {selectedFlat.facilities.map((facility, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="location" size={16} color="#2196F3" />
                    <Text style={styles.amenityText}>
                      {facility.facilityName || facility.name || (typeof facility === 'string' ? facility : 'N/A')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No facilities available</Text>
            )}
          </View>
        )
      },
      {
        title: "Media Files",
        icon: "images-outline",
        content: (
          <View style={styles.sectionContent}>
            <View style={styles.mediaSection}>
              {selectedFlat.propertyMediaDTOs && selectedFlat.propertyMediaDTOs.length > 0 ? (
                <>
                  <View style={styles.mediaRow}>
                    <Ionicons name="images-outline" size={24} color="#FF9800" />
                    <Text style={styles.mediaText}>
                      Total Images: {selectedFlat.propertyMediaDTOs.filter(m => m.filePath).length}
                    </Text>
                  </View>
                  
                  <View style={styles.imageListContainer}>
                    {selectedFlat.propertyMediaDTOs.map((media, index) => (
                      media.filePath && (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.imageItemRow}
                          onPress={() => handleViewMediaFile(media.filePath)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="image" size={20} color="#5aaf57" />
                          <View style={styles.imageItemInfo}>
                            <Text style={styles.imageItemLabel}>
                              {media.mediaLabel || `Image ${index + 1}`}
                            </Text>
                            <Text style={styles.imageItemPath} numberOfLines={1}>
                              {media.filePath}
                            </Text>
                          </View>
                          <Ionicons name="eye-outline" size={18} color="#5aaf57" />
                        </TouchableOpacity>
                      )
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noDataText}>No images available</Text>
              )}
            </View>
          </View>
        )
      }
    ];

    return (
      <Modal
        visible={viewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setViewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setViewModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.viewModalContainer}>
                <View style={styles.modalHandle} />

                {/* Header */}
                

                {/* Tab Navigation */}
                <View style={styles.tabNavigation}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
                    {sections.map((section, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.tabItem,
                          viewModalCurrentIndex === index && styles.activeTabItem
                        ]}
                        onPress={() => setViewModalCurrentIndex(index)}
                      >
                        <Ionicons
                          name={section.icon}
                          size={16}
                          color={viewModalCurrentIndex === index ? "#5aaf57" : "#666"}
                        />
                        <Text style={[
                          styles.tabText,
                          viewModalCurrentIndex === index && styles.activeTabText
                        ]}>
                          {section.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Content */}
                <ScrollView style={styles.viewModalContent} showsVerticalScrollIndicator={false}>
                  {sections[viewModalCurrentIndex].content}
                </ScrollView>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                  {sections.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        viewModalCurrentIndex === index && styles.activePaginationDot
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setViewModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderFlatItem = ({ item }) => (
    <View style={styles.flatItem}>
      {/* Checkbox Section */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleSelectFlat(item.id)}
      >
        <View style={[
          styles.checkbox,
          { backgroundColor: selectedFlats.includes(item.id) ? "#5aaf57" : "transparent" }
        ]}>
          {selectedFlats.includes(item.id) && (
            <Feather name="check" size={14} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.flatInfoWrapper}>
        {/* Header Row - Unit Number and Status Badge */}
        <View style={styles.flatHeaderRow}>
          <Text style={styles.flatNumber}>#{item.unitNumber}</Text>
          <View style={styles.badgeRow}>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: item.isAvailable
                  ? "rgba(76, 175, 80, 0.3)"
                  : "rgba(255, 87, 34, 0.3)"
              }
            ]}>
              <Text style={styles.badgeText}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Added By and Area Row */}
        <View style={styles.floorFlatRow}>
          <Text style={styles.floorText}>Added By: {item.addedBy}</Text>
          <Text style={styles.areaText}>{item.areaDisplay}</Text>
        </View>

        {/* Added Date Row */}
        <View style={styles.structureAreaRow}>
          <Text style={styles.areaText}>Added: {item.addedDateDisplay}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              // Close all dropdowns first
              setStructureDropdownVisible(false);
              setAreaDropdownVisible(false);

              // Fetch detailed unit information before opening modal
              let unitData = item;
              if (item?.commercialUnitId || item?.id) {
                try {
                  const unitId = item.commercialUnitId || item.id;
                  const result = await fetchCommercialUnitDetailsForPlc(unitId);
                  if (result.success && result.data) {
                    unitData = result.data;
                  }
                } catch (error) {
                  console.error('Error fetching unit details for edit:', error);
                  // Continue with basic data if fetch fails
                }
              }

              // Select the current unit and open Fill Details modal
              setSelectedFlats([unitData.id]);
              // Pre-fill form with fetched unit's data
              setFormData({
                ownership: unitData.ownership || unitData.ownershipType || "",
                furnishing: unitData.furnishing || unitData.furnishingStatus || "",
                facing: unitData.facing || unitData.faceDirection || "",
                carpetArea: unitData.carpetArea ? String(unitData.carpetArea) : (unitData.area ? String(unitData.area).replace(/[^\d.]/g, '') : ""),
                carpetAreaUnit: unitData.areaUnit || "sq ft",
                loadingPercentage: unitData.loadingPercentage ? String(unitData.loadingPercentage) : "",
                superArea: unitData.carpetArea && unitData.loadingPercentage 
                  ? String((unitData.carpetArea * (1 + unitData.loadingPercentage / 100)).toFixed(2))
                  : "",
                numberOfKitchens: unitData.totalNoOfKitchen ? String(unitData.totalNoOfKitchen) : "",
                basicCost: unitData.basicAmount ? String(unitData.basicAmount) : (unitData.basicCost ? String(unitData.basicCost) : ""),
                amenities: unitData.amenities 
                  ? unitData.amenities.map(a => a.amenityName || a.name || a).filter(Boolean)
                  : [],
                facilities: unitData.facilities 
                  ? unitData.facilities.map(f => f.facilityName || f.name || f).filter(Boolean)
                  : [],
                description: unitData.description || "",
                images: [],
                deleteExistingFiles: false,
                // Reset all dropdown visibility states
                ownershipDropdownVisible: false,
                furnishingDropdownVisible: false,
                facingDropdownVisible: false,
                unitDropdownVisible: false,
                amenitiesDropdownVisible: false,
                facilitiesDropdownVisible: false,
              });
              setFillDetailsModalVisible(true);
            }}
          >
            <Feather name="edit-2" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleViewPress(item)}
          >
            <Feather name="eye" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDeletePress(item)}
          >
            <Feather name="trash-2" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleLocationPress(item)}
          >
            <Feather name="map-pin" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filteredFlats = commercialUnits.filter((unit) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseUnitNumber = unit.unitNumber?.toLowerCase() || "";

    // Filter by unit number
    const matchesUnitNumber = !searchQuery || lowerCaseUnitNumber.includes(lowerCaseQuery);

    // Filter by area
    let matchesArea = !selectedArea || selectedArea === "All Areas";
    if (selectedArea && selectedArea !== "All Areas") {
      const areaValue = parseInt(unit.area || 0);
      switch (selectedArea) {
        case "500-1000 sq ft":
          matchesArea = areaValue >= 500 && areaValue <= 1000;
          break;
        case "1000-1500 sq ft":
          matchesArea = areaValue >= 1000 && areaValue <= 1500;
          break;
        case "1500-2000 sq ft":
          matchesArea = areaValue >= 1500 && areaValue <= 2000;
          break;
        case "2000+ sq ft":
          matchesArea = areaValue >= 2000;
          break;
      }
    }

    return matchesUnitNumber && matchesArea;
  });

  // Helper functions for Fill Details Modal
  const handleFormDataChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate super area when carpet area or loading percentage changes
      if (field === 'carpetArea' || field === 'loadingPercentage') {
        const carpetArea = parseFloat(field === 'carpetArea' ? value : prev.carpetArea) || 0;
        const loadingPercentage = parseFloat(field === 'loadingPercentage' ? value : prev.loadingPercentage) || 0;
        
        if (carpetArea > 0 && loadingPercentage >= 0) {
          const superArea = carpetArea * (1 + loadingPercentage / 100);
          newData.superArea = superArea.toFixed(2);
        } else if (carpetArea > 0) {
          newData.superArea = carpetArea.toFixed(2);
        }
      }
      
      return newData;
    });
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === 'images' ? 'image/*' : 'video/*',
        multiple: true,
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        // Add label and convert to base64 for each image
        const imagesWithLabels = await Promise.all(
          result.assets.map(async (asset) => {
            // Read file as base64
            let base64 = "";
            try {
              // For React Native/Expo, we'll store the URI and convert later if needed
              // Or you can use FileReader or expo-file-system here
              const response = await fetch(asset.uri);
              const blob = await response.blob();
              const reader = new FileReader();
              
              base64 = await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                  const base64String = reader.result.split(',')[1]; // Remove data:image/xxx;base64, prefix
                  resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } catch (error) {
              console.error("Error converting to base64:", error);
              // If conversion fails, we'll send empty string
              base64 = "";
            }

            return {
              ...asset,
              label: imageLabel || asset.name,
              base64: base64,
              contentType: asset.mimeType || 'image/jpeg'
            };
          })
        );
        
        setFormData(prev => ({
          ...prev,
          [type]: [...prev[type], ...imagesWithLabels]
        }));
        
        // Reset and close modal
        setImageLabel("");
        setImageUploadModalVisible(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const removeFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSaveDetails = async () => {
    try {
      // Validate required fields
      if (!formData.carpetArea) {
        Alert.alert('Validation Error', 'Please fill in Carpet Area');
        return;
      }

      // Get the IDs from the names selected
      const ownerShipTypeId = ownerships.find(o => o.type === formData.ownership)?.id;
      const furnishingStatusId = furnishingStatuses.find(s => s.name === formData.furnishing)?.id;
      const faceDirectionId = faceDirections.find(d => d.name === formData.facing)?.id;
      const carpetAreaUnitId = measurementUnits.find(u => u.name === formData.carpetAreaUnit)?.id;
      const amenityIds = amenities.filter(a => formData.amenities.includes(a.name)).map(a => a.id);
      const facilityIds = facilities.filter(f => formData.facilities.includes(f.name)).map(f => f.id);

      // Debug logs
      console.log('Form Data:', formData);
      console.log('Ownership ID:', ownerShipTypeId);
      console.log('Furnishing ID:', furnishingStatusId);
      console.log('Face Direction ID:', faceDirectionId);
      console.log('Carpet Area Unit ID:', carpetAreaUnitId);

      // Validate that we have ownership type if one was selected
      if (formData.ownership && !ownerShipTypeId) {
        Alert.alert('Error', 'Invalid ownership type selected. Please try again.');
        return;
      }

      // Get all selected commercial unit IDs
      const commercialUnitIds = selectedFlats.map(selectedUnitId => {
        const selectedUnitData = commercialUnits.find(unit => unit.id === selectedUnitId);
        return selectedUnitData?.commercialUnitId || selectedUnitData?.id;
      }).filter(id => id); // Remove any null/undefined IDs

      if (commercialUnitIds.length === 0) {
        Alert.alert('Error', 'No valid commercial unit IDs found');
        return;
      }

      // Base payload structure (without commercialUnitIds for update)
      const basePayload = {
        ownerShipTypeId,
        faceDirectionId,
        furnishingStatusId,
        carpetArea: parseFloat(formData.carpetArea),
        carpetAreaUnitId,
        loadingPercentage: parseFloat(formData.loadingPercentage) || 0,
        basicAmount: parseFloat(formData.basicCost) || 0,
        amenityIds,
        facilityIds,
        description: formData.description,
        propertyMediaDTOs: formData.images.map(img => ({
          mediaLabel: img.label || "Image",
          mediaBase64: img.base64 || "",
          contentType: img.contentType || img.mimeType || img.type || "image/jpg"
        })),
        shouldDeletePreviousMedia: formData.deleteExistingFiles
      };

      let result;

      // If only one unit is selected, use UPDATE API for editing
      if (commercialUnitIds.length === 1) {
        console.log('Updating single commercial unit with payload:', basePayload);
        result = await updateCommercialUnitDetails(commercialUnitIds[0], basePayload);
      } else {
        // If multiple units selected, use SAVE API for bulk fill
        const bulkPayload = {
          ...basePayload,
          commercialUnitIds
        };
        console.log('Saving multiple commercial units with payload:', bulkPayload);
        result = await saveCommercialUnitDetails(bulkPayload);
      }
      
      if (result.success) {
        Alert.alert('Success', `Commercial unit details ${commercialUnitIds.length === 1 ? 'updated' : 'saved'} successfully!`);
        setFillDetailsModalVisible(false);
        
        // Reset form
        setFormData({
          ownership: "",
          furnishing: "",
          facing: "",
          carpetArea: "",
          carpetAreaUnit: "",
          loadingPercentage: "",
          superArea: "",
          numberOfKitchens: "",
          basicCost: "",
          amenities: [],
          facilities: [],
          description: "",
          images: [],
          deleteExistingFiles: false,
          // Reset all dropdown visibility states
          ownershipDropdownVisible: false,
          furnishingDropdownVisible: false,
          facingDropdownVisible: false,
          unitDropdownVisible: false,
          amenitiesDropdownVisible: false,
          facilitiesDropdownVisible: false,
        });
        setSelectedFlats([]);
      } else {
        Alert.alert('Error', result.message || 'Failed to save commercial unit details');
      }
    } catch (error) {
      console.error('Error saving commercial unit details:', error);
      Alert.alert('Error', 'Failed to save commercial unit details. Please try again.');
    }
  };

  // Location Modal Handlers
  const handleLocationPress = (flat) => {
    setSelectedLocationFlat(flat);
    setLocationModalVisible(true);
  };

  const handleLocationFormChange = (placeId, field, value) => {
    setLocationFormData(prev => ({
      ...prev,
      places: prev.places.map(place =>
        place.id === placeId ? { ...place, [field]: value } : place
      )
    }));
  };

  const addNewPlace = () => {
    const newId = Math.max(...locationFormData.places.map(p => p.id)) + 1;
    setLocationFormData(prev => ({
      ...prev,
      places: [...prev.places, {
        id: newId,
        place: "",
        rateValue: "",
        rateUnit: "",
        placeDropdownVisible: false,
        rateUnitDropdownVisible: false,
      }]
    }));
  };

  const removePlace = (placeId) => {
    if (locationFormData.places.length > 1) {
      setLocationFormData(prev => ({
        ...prev,
        places: prev.places.filter(place => place.id !== placeId)
      }));
    }
  };

  const handleSaveLocation = () => {
    // Here you would typically save the location data
    console.log('Saving location for commercial unit:', selectedLocationFlat?.unitNumber);
    console.log('Location data:', locationFormData);
    Alert.alert('Success', 'Location details saved successfully!');
    setLocationModalVisible(false);

    // Reset location form
    setLocationFormData({
      places: [
        {
          id: 1,
          place: "",
          rateValue: "",
          rateUnit: "",
          placeDropdownVisible: false,
          rateUnitDropdownVisible: false,
        }
      ],
    });
  };

  const renderDropdownModal = (visible, setVisible, options, selectedValue, onSelect, title) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.dropdownModal}>
              <Text style={styles.dropdownModalTitle}>{title}</Text>
              <ScrollView style={styles.dropdownList}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownOption,
                      selectedValue === option && styles.selectedOption
                    ]}
                    onPress={() => {
                      onSelect(option);
                      setVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      selectedValue === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                    {selectedValue === option && (
                      <Ionicons name="checkmark" size={20} color="#5aaf57" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderMultiSelectModal = (visible, setVisible, options, selectedValues, onToggle, title) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={styles.dropdownModal}>
              <Text style={styles.dropdownModalTitle}>{title}</Text>
              <ScrollView style={styles.dropdownList}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownOption,
                      selectedValues.includes(option) && styles.selectedOption
                    ]}
                    onPress={() => onToggle(option)}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      selectedValues.includes(option) && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                    {selectedValues.includes(option) && (
                      <Ionicons name="checkmark" size={20} color="#5aaf57" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#004d40" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commercial Unit Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {propertyData && (
        <View style={styles.propertyInfoCard}>
          <Text style={styles.propertyName}>{propertyData.projectName}</Text>
          <Text style={styles.propertyBuilder}>by {propertyData.builderName}</Text>
        </View>
      )}



      {/* Filter Section */}
      <View style={styles.filtersContainer}>

        {/* Area Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setAreaDropdownVisible(!areaDropdownVisible)}
          >
            <Text style={styles.dropdownText}>
              {selectedArea || "Area"}
            </Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          {areaDropdownVisible && (
            <View style={styles.dropdownOptions}>
              {areaOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => handleAreaSelect(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Flat Number Search */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color="#004d40"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search by unit number..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery?.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AntDesign name="closecircle" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Select All Section */}
      <View style={styles.selectAllContainer}>
        <TouchableOpacity
          style={styles.selectAllBtn}
          onPress={handleSelectAll}
        >
          <View style={[
            styles.checkbox,
            { backgroundColor: selectAll ? "#5aaf57" : "transparent" }
          ]}>
            {selectAll && (
              <Feather name="check" size={14} color="#fff" />
            )}
          </View>
          <Text style={styles.selectAllText}>
            Select All ({selectedFlats.length}/{filteredFlats.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.fillDetailsBtn,
            {
              backgroundColor: selectedFlats.length > 0 ? "#5aaf57" : "#ccc",
              opacity: selectedFlats.length > 0 ? 1 : 0.5
            }
          ]}
          disabled={selectedFlats.length === 0}
          onPress={() => {
            // Close all dropdowns first
            setStructureDropdownVisible(false);
            setAreaDropdownVisible(false);

            if (selectedFlats.length === 1) {
              // Pre-fill form with single unit's data
              const selectedUnitData = commercialUnits.find(unit => unit.id === selectedFlats[0]);
              if (selectedUnitData) {
                setFormData({
                  ownership: selectedUnitData.ownership || "",
                  facing: selectedUnitData.facing || "",
                  furnishing: selectedUnitData.furnishing || "",
                  carpetArea: selectedUnitData.carpetArea ? selectedUnitData.carpetArea.toString() : "",
                  carpetAreaUnit: selectedUnitData.areaUnit || "",
                  loadingPercentage: selectedUnitData.loadingPercentage ? selectedUnitData.loadingPercentage.toString() : "",
                  superArea: selectedUnitData.superAreaDisplay || "",
                  numberOfKitchens: "",
                  basicCost: selectedUnitData.basicCost ? selectedUnitData.basicCost.toString() : "",
                  amenities: selectedUnitData.amenities ? selectedUnitData.amenities.map(a => a.amenityName) : [],
                  facilities: selectedUnitData.facilities ? selectedUnitData.facilities.map(f => f.facilityName) : [],
                  description: selectedUnitData.description || "",
                  images: [],
                  deleteExistingFiles: false,
                  // Reset all dropdown visibility states
                  ownershipDropdownVisible: false,
                  furnishingDropdownVisible: false,
                  facingDropdownVisible: false,
                  unitDropdownVisible: false,
                  amenitiesDropdownVisible: false,
                  facilitiesDropdownVisible: false,
                });
              }
            } else {
              // Multiple units selected - empty form
              setFormData({
                ownership: "",
                facing: "",
                furnishing: "",
                carpetArea: "",
                carpetAreaUnit: "",
                loadingPercentage: "",
                superArea: "",
                numberOfKitchens: "",
                basicCost: "",
                amenities: [],
                facilities: [],
                description: "",
                images: [],
                deleteExistingFiles: false,
                // Reset all dropdown visibility states
                ownershipDropdownVisible: false,
                furnishingDropdownVisible: false,
                facingDropdownVisible: false,
                unitDropdownVisible: false,
                amenitiesDropdownVisible: false,
                facilitiesDropdownVisible: false,
              });
            }
            setFillDetailsModalVisible(true);
          }}
        >
          <Feather name="edit-3" size={16} color="#fff" />
          <Text style={styles.fillDetailsText}>Fill Details</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading commercial units...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFlats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderFlatItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={actionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActionsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHandle} />
                {renderActionOptions()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {renderViewModal()}

      {/* Fill Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fillDetailsModalVisible}
        onRequestClose={() => setFillDetailsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setFillDetailsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.fillDetailsModal}>
                <View style={styles.modalHandle} />

                {/* Modal Header */}
                <View style={styles.fillDetailsHeader}>
                  <Text style={styles.fillDetailsTitle}>
                    {selectedFlats.length === 1
                      ? `Edit Unit Details (${commercialUnits.find(u => u.id === selectedFlats[0])?.unitNumber || 'Unknown'})`
                      : `Fill Details (${selectedFlats.length} Units selected)`
                    }
                  </Text>
                  <TouchableOpacity onPress={() => setFillDetailsModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.fillDetailsContent} showsVerticalScrollIndicator={false}>
                  {/* Section 1: Basic Details */}
                  <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Basic Details</Text>

                    {/* ownership Dropdown */}
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Ownership Type</Text>
                      <TouchableOpacity
                        style={styles.formDropdown}
                        onPress={() => setFormData(prev => ({ ...prev, ownershipDropdownVisible: !prev.ownershipDropdownVisible }))}
                      >
                        <Text style={[styles.formDropdownText, !formData.ownership && styles.placeholderText]}>
                          {formData.ownership || "Select ownership"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {/* Furnishing Dropdown */}
                                       <View style={styles.formRow}>
                                         <Text style={styles.formLabel}>Furnishing</Text>
                                         <TouchableOpacity
                                           style={styles.formDropdown}
                                           onPress={() => setFormData(prev => ({ ...prev, furnishingDropdownVisible: !prev.furnishingDropdownVisible }))}
                                         >
                                           <Text style={[styles.formDropdownText, !formData.furnishing && styles.placeholderText]}>
                                             {formData.furnishing || "Select Furnishing"}
                                           </Text>
                                           <Ionicons name="chevron-down" size={20} color="#666" />
                                         </TouchableOpacity>
                                       </View>
                                        {/* Facing Dropdown */}
                                      <View style={styles.formRow}>
                                        <Text style={styles.formLabel}>Facing</Text>
                                        <TouchableOpacity
                                          style={styles.formDropdown}
                                          onPress={() => setFormData(prev => ({ ...prev, facingDropdownVisible: !prev.facingDropdownVisible }))}
                                        >
                                          <Text style={[styles.formDropdownText, !formData.facing && styles.placeholderText]}>
                                            {formData.facing || "Select Facing Direction"}
                                          </Text>
                                          <Ionicons name="chevron-down" size={20} color="#666" />
                                        </TouchableOpacity>
                                      </View>
                  

             
                  
                  {/* Area Details */}
                  <Text style={styles.subsectionTitle}>Area Details</Text>

                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Carpet Area</Text>
                    <View style={styles.areaInputContainer}>
                      <TextInput
                        style={styles.areaInput}
                        value={formData.carpetArea}
                        onChangeText={(value) => handleFormDataChange('carpetArea', value)}
                        placeholder="Enter carpet area"
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.unitDropdown}
                        onPress={() => setFormData(prev => ({ ...prev, unitDropdownVisible: !prev.unitDropdownVisible }))}
                      >
                        <Text style={[styles.unitText, !formData.carpetAreaUnit && styles.placeholderText]}>
                          {formData.carpetAreaUnit || "Unit"}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Loading %</Text>
                    <TextInput
                      style={styles.formInput}
                      value={formData.loadingPercentage}
                      onChangeText={(value) => handleFormDataChange('loadingPercentage', value)}
                      placeholder="Enter loading percentage"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Super Area</Text>
                    <TextInput
                      style={[styles.formInput, { backgroundColor: '#f0f0f0' }]}
                      value={formData.superArea}
                      placeholder="Auto-calculated"
                      keyboardType="numeric"
                      editable={false}
                    />
                  </View>
                       </View>

                  {/* Section 2: Other Details */}
                  <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Other Details</Text>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Basic Cost</Text>
                      <TextInput
                        style={styles.formInput}
                        value={formData.basicCost}
                        onChangeText={(value) => handleFormDataChange('basicCost', value)}
                        placeholder="Enter basic cost"
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Amenities Multi-Select */}
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Amenities</Text>
                      <TouchableOpacity
                        style={styles.formDropdown}
                        onPress={() => setFormData(prev => ({ ...prev, amenitiesDropdownVisible: !prev.amenitiesDropdownVisible }))}
                      >
                        <Text style={[styles.formDropdownText, formData.amenities.length === 0 && styles.placeholderText]}>
                          {formData.amenities.length > 0 ? `${formData.amenities.length} selected` : "Select Amenities"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {/* Facilities Multi-Select */}
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Facilities</Text>
                      <TouchableOpacity
                        style={styles.formDropdown}
                        onPress={() => setFormData(prev => ({ ...prev, facilitiesDropdownVisible: !prev.facilitiesDropdownVisible }))}
                      >
                        <Text style={[styles.formDropdownText, formData.facilities.length === 0 && styles.placeholderText]}>
                          {formData.facilities.length > 0 ? `${formData.facilities.length} selected` : "Select Facilities"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Description</Text>
                      <TextInput
                        style={styles.formTextArea}
                        value={formData.description}
                        onChangeText={(value) => handleFormDataChange('description', value)}
                        placeholder="Enter description"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* File Uploads */}
                    <Text style={styles.subsectionTitle}>Media</Text>

                    {/* Delete Existing Files Toggle */}
                    <View style={styles.formRowInline}>
                      <Text style={styles.formLabel}>Delete Existing Files</Text>
                      <Switch
                        value={formData.deleteExistingFiles}
                        onValueChange={(value) => handleFormDataChange('deleteExistingFiles', value)}
                        trackColor={{ false: "#e0e0e0", true: "#5aaf57" }}
                        thumbColor={formData.deleteExistingFiles ? "#fff" : "#f4f3f4"}
                      />
                    </View>

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Images</Text>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => setImageUploadModalVisible(true)}
                      >
                        <Ionicons name="image-outline" size={20} color="#5aaf57" />
                        <Text style={styles.uploadButtonText}>Upload Images</Text>
                      </TouchableOpacity>
                    </View>

                    {formData.images.length > 0 && (
                      <View style={styles.filesList}>
                        <Text style={styles.filesListLabel}>Uploaded Images:</Text>
                        {formData.images.map((file, index) => (
                          <View key={index} style={styles.fileItem}>
                            <View style={styles.fileInfo}>
                              <Ionicons name="image" size={16} color="#5aaf57" />
                              <View style={styles.fileNameContainer}>
                                <Text style={styles.fileNameLabel}>Image Label:</Text>
                                <Text style={styles.fileName} numberOfLines={1}>{file.label || file.name}</Text>
                              </View>
                            </View>
                            <TouchableOpacity onPress={() => removeFile('images', index)}>
                              <Ionicons name="close-circle" size={20} color="#ff4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.fillDetailsFooter}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveDetails}>
                    <Text style={styles.saveButtonText}>Save Details</Text>
                  </TouchableOpacity>
                </View>

                {/* Dropdown Modals */}
                {renderDropdownModal(
                  formData.ownershipDropdownVisible,
                  (visible) => handleFormDataChange('ownershipDropdownVisible', visible),
                  ownershipOptions,
                  formData.ownership,
                  (value) => handleFormDataChange('ownership', value),
                  "Select Ownership Type"
                )}

                {renderDropdownModal(
                  formData.furnishingDropdownVisible,
                  (visible) => handleFormDataChange('furnishingDropdownVisible', visible),
                  furnishingOptions,
                  formData.furnishing,
                  (value) => handleFormDataChange('furnishing', value),
                  "Select Furnishing Status"
                )}

                {renderDropdownModal(
                  formData.facingDropdownVisible,
                  (visible) => handleFormDataChange('facingDropdownVisible', visible),
                  facingOptions,
                  formData.facing,
                  (value) => handleFormDataChange('facing', value),
                  "Select Facing Direction"
                )}

                {renderDropdownModal(
                  formData.unitDropdownVisible,
                  (visible) => handleFormDataChange('unitDropdownVisible', visible),
                  areaUnitOptions,
                  formData.carpetAreaUnit,
                  (value) => handleFormDataChange('carpetAreaUnit', value),
                  "Select Unit"
                )}

                {renderMultiSelectModal(
                  formData.amenitiesDropdownVisible,
                  (visible) => handleFormDataChange('amenitiesDropdownVisible', visible),
                  amenitiesOptions,
                  formData.amenities,
                  (value) => handleMultiSelect('amenities', value),
                  "Select Amenities"
                )}

                {renderMultiSelectModal(
                  formData.facilitiesDropdownVisible,
                  (visible) => handleFormDataChange('facilitiesDropdownVisible', visible),
                  facilitiesOptions,
                  formData.facilities,
                  (value) => handleMultiSelect('facilities', value),
                  "Select Facilities"
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLocationModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.locationModal}>
                <View style={styles.modalHandle} />

                {/* Modal Header */}
                <View style={styles.locationModalHeader}>
                  <Text style={styles.locationModalTitle}>
                    Location Details - Unit {selectedLocationFlat?.unitNumber}
                  </Text>
                  <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.locationModalContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.locationFormSection}>
                    <Text style={styles.locationSectionTitle}>Add Plc</Text>

                    {/* Places Cards */}
                    {locationFormData.places.map((placeItem, index) => (
                      <View key={placeItem.id} style={styles.locationCard}>
                        <View style={styles.locationCardHeader}>
                          <Text style={styles.locationCardTitle}>Plc {index + 1}</Text>
                          {locationFormData.places.length > 1 && (
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removePlace(placeItem.id)}
                            >
                              <Ionicons name="trash-outline" size={18} color="#ff4444" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Place Info Section */}
                        <View style={styles.locationInfoSection}>
                          <Text style={styles.locationInfoTitle}>Plc Information</Text>

                          <View style={styles.locationFormRow}>
                            <Text style={styles.locationFormLabel}>Plc</Text>
                            <TouchableOpacity
                              style={styles.locationFormDropdown}
                              onPress={() => handleLocationFormChange(placeItem.id, 'placeDropdownVisible', !placeItem.placeDropdownVisible)}
                            >
                              <Text style={[styles.locationFormDropdownText, !placeItem.place && styles.locationPlaceholderText]}>
                                {placeItem.place || "Select Place"}
                              </Text>
                              <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Rate Info Section */}
                        <View style={styles.locationInfoSection}>
                          <Text style={styles.locationInfoTitle}>Rate Information</Text>

                          <View style={styles.locationFormRow}>
                            <Text style={styles.locationFormLabel}>Rate Value</Text>
                            <TextInput
                              style={styles.locationFormInput}
                              value={placeItem.rateValue}
                              onChangeText={(value) => handleLocationFormChange(placeItem.id, 'rateValue', value)}
                              placeholder="Enter rate value"
                              keyboardType="numeric"
                            />
                          </View>

                          <View style={styles.locationFormRow}>
                            <Text style={styles.locationFormLabel}>Rate Unit</Text>
                            <TouchableOpacity
                              style={styles.locationFormDropdown}
                              onPress={() => handleLocationFormChange(placeItem.id, 'rateUnitDropdownVisible', !placeItem.rateUnitDropdownVisible)}
                            >
                              <Text style={[styles.locationFormDropdownText, !placeItem.rateUnit && styles.locationPlaceholderText]}>
                                {placeItem.rateUnit || "Select Unit/Percentage"}
                              </Text>
                              <Ionicons name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}

                    {/* Add New Place Button */}
                    <TouchableOpacity style={styles.addPlaceButton} onPress={addNewPlace}>
                      <Ionicons name="add-circle-outline" size={24} color="#5aaf57" />
                      <Text style={styles.addPlaceButtonText}>Add Another Plc</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.locationModalFooter}>
                  <TouchableOpacity style={styles.locationSaveButton} onPress={handleSaveLocation}>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.locationSaveButtonText}>Save Plc</Text>
                  </TouchableOpacity>
                </View>

                {/* Place Dropdown Modals */}
                {locationFormData.places.map((placeItem) => (
                  <Fragment key={`place-${placeItem.id}`}>
                    {renderDropdownModal(
                      placeItem.placeDropdownVisible,
                      (visible) => handleLocationFormChange(placeItem.id, 'placeDropdownVisible', visible),
                      placeOptions,
                      placeItem.place,
                      (value) => handleLocationFormChange(placeItem.id, 'place', value),
                      "Select Place"
                    )}

                    {renderDropdownModal(
                      placeItem.rateUnitDropdownVisible,
                      (visible) => handleLocationFormChange(placeItem.id, 'rateUnitDropdownVisible', visible),
                      rateUnitOptions,
                      placeItem.rateUnit,
                      (value) => handleLocationFormChange(placeItem.id, 'rateUnit', value),
                      "Select Rate Unit"
                    )}
                  </Fragment>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageUploadModalVisible}
        onRequestClose={() => {
          setImageUploadModalVisible(false);
          setImageLabel("");
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setImageUploadModalVisible(false);
          setImageLabel("");
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.imageUploadModal}>
                <View style={styles.modalHandle} />
                
                {/* Modal Header */}
                <View style={styles.imageUploadModalHeader}>
                  <Text style={styles.imageUploadModalTitle}>Upload Image</Text>
                  <TouchableOpacity onPress={() => {
                    setImageUploadModalVisible(false);
                    setImageLabel("");
                  }}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={styles.imageUploadModalContent}>
                  <View style={styles.imageUploadFormRow}>
                    <Text style={styles.imageUploadFormLabel}>Image Label</Text>
                    <TextInput
                      style={styles.imageUploadFormInput}
                      value={imageLabel}
                      onChangeText={setImageLabel}
                      placeholder="Enter image label (optional)"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.imageUploadButton}
                    onPress={() => pickDocument('images')}
                  >
                    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                    <Text style={styles.imageUploadButtonText}>Choose & Upload Images</Text>
                  </TouchableOpacity>

                  <Text style={styles.imageUploadNote}>
                    Note: If no label is provided, the image filename will be used.
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setImageViewModalVisible(false);
          setCurrentViewingImage(null);
        }}
      >
        <View style={styles.imageViewModalBackground}>
          <TouchableOpacity
            style={styles.imageCloseButton}
            onPress={() => {
              setImageViewModalVisible(false);
              setCurrentViewingImage(null);
            }}
          >
            <Text style={styles.imageCloseButtonText}>×</Text>
          </TouchableOpacity>
          {imageLoading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : currentViewingImage ? (
            <Image
              source={{ uri: currentViewingImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16 }}>No image to display</Text>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#004d40",
  },
  propertyInfoCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#5aaf57",
  },
  propertyName: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#333",
  },
  propertyBuilder: {
    fontSize: 12,
    fontFamily: "PlusL",
    color: "#666",
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "PlusSB",
    color: "#333",
  },
  pageSubTitle: {
    fontSize: 28,
    fontFamily: "PlusSB",
    color: "#5aaf57",
  },
  headerDesc: {
    fontSize: 13,
    fontFamily: "PlusL",
    color: "#666",
    marginTop: 5,
  },
  lottie: {
    width: 80,
    height: 80,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  dropdownContainer: {
    flex: 1,
    position: "relative",
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#004d40",
  },
  dropdownOptions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchBar: {
    flex: 1,
    height: 45,
    fontSize: 15,
    fontFamily: "PlusL",
    color: "#004d40",
    paddingLeft: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  flatItem: {
    flexDirection: "row",
    backgroundColor: "#03471aff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  flatInfoWrapper: {
    flex: 1,
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectAllText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#004d40",
  },
  fillDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  fillDetailsText: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  flatHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  towerName: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#fff",
    flex: 1,
  },
  floorFlatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  floorText: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#e0e0e0",
  },
  flatNumber: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  structureAreaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  structureText: {
    fontSize: 15,
    fontFamily: "PlusSB",
    color: "#4CAF50",
  },
  areaText: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#e0e0e0",
  },
  availabilityRow: {
    marginBottom: 12,
  },
  availabilityIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: "PlusR",
    color: "#e0e0e0",
  },
  badgeRow: {
    flexDirection: "row",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "PlusSB",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  actionBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: "center",
    elevation: 10,
  },
  modalHandle: {
    width: 50,

    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 15,
  },
  actionOptionsContainer: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PlusSB',
    marginBottom: 15,
    color: "#064226ff",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  actionOptionBtn: {
    padding: 15,
    backgroundColor: "#033b01ff",
    borderRadius: 20,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionOptionText: {
    fontSize: 15,
    fontFamily: 'PlusR',
    color: "#fff",
  },
  detailsGrid: {
    width: "100%",
    marginVertical: 20,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
  },
  closeModalBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#004d40",
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  closeModalText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "PlusSB",
  },
  // View Modal Styles
  viewModalContainer: {
    height: screenHeight * 0.8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  viewModalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  tabNavigation: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabScrollView: {
    paddingHorizontal: 10,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginVertical: 8,
  },
  activeTabItem: {
    backgroundColor: "#e8f5e8",
    borderWidth: 1,
    borderColor: "#5aaf57",
  },
  tabText: {
    fontSize: 12,
    fontFamily: "PlusR",
    color: "#666",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#5aaf57",
    fontFamily: "PlusSB",
  },
  viewModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionContent: {
    paddingBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
    flex: 1,
    textAlign: "right",
  },
  availabilityStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 8,
    minWidth: "45%",
  },
  amenityText: {
    fontSize: 12,
    fontFamily: "PlusR",
    color: "#333",
    marginLeft: 6,
    flex: 1,
  },
  mediaSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    width: "100%",
  },
  mediaText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
    marginLeft: 12,
  },
  viewMediaBtn: {
    backgroundColor: "#5aaf57",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  viewMediaText: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  imageListContainer: {
    width: "100%",
       marginTop: 15,
  },
  imageItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#5aaf57",
  },
  imageItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  imageItemLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 4,
  },
  imageItemPath: {
    fontSize: 12,
    fontFamily: "PlusR",
    color: "#666",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  activePaginationDot: {
    backgroundColor: "#5aaf57",
    width: 20,
  },
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  // Fill Details Modal Styles
  fillDetailsModal: {
    height: screenHeight * 0.75,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  fillDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fillDetailsTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#333",
  },
  fillDetailsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#5aaf57",
  },
  subsectionTitle: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#666",
    marginTop: 15,
    marginBottom: 10,
  },
  formRow: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    backgroundColor: "#f9f9f9",
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    backgroundColor: "#f9f9f9",
    minHeight: 80,
  },
  formRowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingVertical: 8,
  },
  formDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  formDropdownText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  areaInputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  areaInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    backgroundColor: "#f9f9f9",
  },
  unitDropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    minWidth: 80,
    justifyContent: "space-between",
  },
  unitText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#5aaf57",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8fff8",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#5aaf57",
  },
  filesList: {
    marginTop: 10,
  },
  filesListLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  fileNameContainer: {
    flex: 1,
  },
  fileNameLabel: {
    fontSize: 11,
    fontFamily: "PlusSB",
    color: "#999",
    marginBottom: 2,
  },
  fileName: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#333",
  },
  fillDetailsFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#5aaf57",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 100,
    borderRadius: 15,
    maxHeight: screenHeight * 0.6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#333",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    textAlign: "center",
  },
  dropdownList: {
    maxHeight: screenHeight * 0.4,
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  selectedOption: {
    backgroundColor: "#f8fff8",
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
    flex: 1,
  },
  selectedOptionText: {
    color: "#5aaf57",
    fontFamily: "PlusSB",
  },
  // Location Modal Styles
  locationModal: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: screenHeight * 0.3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  locationModalTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#333",
    flex: 1,
  },
  locationModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationFormSection: {
    paddingVertical: 20,
  },
  locationSectionTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 15,
  },
  locationSubsectionTitle: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#666",
    marginTop: 20,
    marginBottom: 10,
  },
  locationFormRow: {
    marginBottom: 15,
  },
  locationFormLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 8,
  },
  locationFormInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    backgroundColor: "#f9f9f9",
  },
  locationFormDropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  locationFormDropdownText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
    flex: 1,
  },
  locationPlaceholderText: {
    color: "#999",
  },
  locationModalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  locationSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5aaf57",
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  locationSaveButtonText: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  // Location Card Styles
  locationCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  locationCardTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#ffe6e6",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfoSection: {
    marginBottom: 15,
  },
  locationInfoTitle: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#5aaf57",
    marginBottom: 10,
    paddingLeft: 5,
  },
  addPlaceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8f0",
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#5aaf57",
    borderStyle: "dashed",
    gap: 10,
    marginTop: 10,
  },
  addPlaceButtonText: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#5aaf57",
  },
  imageUploadModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "40%",
    width: "100%",
    position: "absolute",
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imageUploadModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  imageUploadModalTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#333",
  },
  imageUploadModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  imageUploadFormRow: {
    marginBottom: 20,
  },
  imageUploadFormLabel: {
    fontSize: 14,
    fontFamily: "PlusSB",
    color: "#333",
    marginBottom: 8,
  },
  imageUploadFormInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  imageUploadButton: {
    backgroundColor: "#5aaf57",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
  },
  imageUploadButtonText: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  imageUploadNote: {
    fontSize: 12,
    fontFamily: "PlusR",
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    fontFamily: "PlusR",
  },
  // Image Viewer Modal Styles
  imageViewModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  imageCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  imageCloseButtonText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PlotsDetailsPage;
