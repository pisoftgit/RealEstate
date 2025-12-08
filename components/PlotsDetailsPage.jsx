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
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import usePlotsByProject from '../hooks/usePlotsByProject';
import useOwnership from '../hooks/useOwnership';
import useAmenityActions from '../hooks/useAmenityActions';
import useFacilityActions from '../hooks/useFacilityActions';
import useMeasurements from '../hooks/useMeasurements';
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
  
  // Use the custom hook to fetch plots
  const { plots, loading, fetchPlots, savePlotDetails, updatePlotDetails, savePlotPlcDetails, fetchPlotDetailsForPlc, deletePlot, saving, saveError } = usePlotsByProject(propertyData?.projectId);
  
  // Use the custom hook to fetch ownership types
  const { ownershipTypes: ownerships, loading: ownershipLoading } = useOwnership();
  
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
    Khasra: "",
    basicCost: "",
    amenities: [],
    facilities: [],
    description: "",
    images: [],
    videos: [],
    deleteExistingFiles: false,
    // Dropdown visibility states
    ownershipDropdownVisible: false,
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
  const ownershipOptions = (ownerships || []).map(ownership => ownership.type || ownership.name);
  console.log("Ownerships data:", ownerships);
  console.log("Ownership Options:", ownershipOptions);
  
  // Amenities options now come from the useAmenityActions hook
  const amenitiesOptions = (amenities || []).map(amenity => amenity.name);
  console.log("Amenities data:", amenities);
  console.log("Amenities Options:", amenitiesOptions);
  
  // Facilities options now come from the useFacilityActions hook
  const facilitiesOptions = (facilities || []).map(facility => facility.name);
  console.log("Facilities data:", facilities);
  console.log("Facilities Options:", facilitiesOptions);
  
  // Khasra numbers - for now, this can be a manual input field rather than dropdown
  const KhasraOptions = []; // This will be empty, we'll use TextInput instead
  // Area unit options now come from the useMeasurements hook
  const areaUnitOptions = (measurementUnits || []).map(unit => unit.name || unit.unit);
  
  // Location Modal Options - PLC options now come from the getAllPlc API
  const placeOptions = (plcData || []).map(plc => plc.plcName || plc.name || plc.place);
  console.log("PLC data:", plcData);
  console.log("Place Options:", placeOptions);
  
  const rateUnitOptions = ["Amount", "Percentage"];

  // Fetch PLC data on component mount
  useEffect(() => {
    const fetchPlcData = async () => {
      setPlcLoading(true);
      try {
        const data = await getAllPlc();
        setPlcData(data);
      } catch (error) {
        console.error("Error fetching PLC data:", error);
        Alert.alert("Error", "Failed to fetch PLC data");
      } finally {
        setPlcLoading(false);
      }
    };

    fetchPlcData();
  }, []);

  // Update select all state based on selected plots
  useEffect(() => {
    if (filteredFlats.length > 0) {
      const allSelected = filteredFlats.every(flat => selectedFlats.includes(flat.plotId));
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
      const allFlatIds = filteredFlats.map(flat => flat.plotId);
      setSelectedFlats(allFlatIds);
      setSelectAll(true);
    }
  };

  const handleActionsPress = (flat) => {
    setSelectedFlat(flat);
    setActionsModalVisible(true);
  };

  const handleViewPress = async (flat) => {
    // Fetch detailed data from API before showing modal
    if (flat?.plotId) {
      try {
        const response = await fetchPlotDetailsForPlc(flat.plotId);
        
        if (response.success && response.data) {
          const detailedData = response.data;
          console.log('Detailed plot data for view:', detailedData);
          
          // Set the detailed data for viewing
          setSelectedFlat(detailedData);
        } else {
          // Fallback to basic data if API fails
          console.warn('Failed to fetch detailed data, using basic data');
          setSelectedFlat(flat);
        }
      } catch (error) {
        console.error('Error fetching plot details for view:', error);
        // Fallback to basic data if error occurs
        setSelectedFlat(flat);
      }
    } else {
      setSelectedFlat(flat);
    }
    
    setViewModalCurrentIndex(0); // Reset to first tab
    setViewModalVisible(true);
  };

  const handleActionOptionPress = (option) => {
    switch (option) {
      case "Edit":
        // Close action modal first, then open fill details modal with delay
        setActionsModalVisible(false);
        
        // Use timeout to ensure action modal is closed before opening fill details
        setTimeout(async () => {
          // Close all dropdowns first
          setStructureDropdownVisible(false);
          setAreaDropdownVisible(false);
          
          // Select the current flat and open Fill Details modal
          setSelectedFlats([selectedFlat.plotId]);
          
          // Fetch detailed data from API
          if (selectedFlat?.plotId) {
            try {
              const response = await fetchPlotDetailsForPlc(selectedFlat.plotId);
              
              if (response.success && response.data) {
                const detailedData = response.data;
                console.log('Detailed plot data for edit:', detailedData);
                
                // Map API response to form fields
                const ownershipName = detailedData.ownershipType || "";
                const amenitiesNames = detailedData.amenities?.map(a => a.amenityName || a.name) || [];
                const facilitiesNames = detailedData.facilities?.map(f => f.facilityName || f.name) || [];
                
                setFormData({
                  ownership: ownershipName,
                  Khasra: detailedData.khasraNumber || "",
                  basicCost: detailedData.basicAmount ? String(detailedData.basicAmount).replace(/[^\d.]/g, '') : "",
                  amenities: amenitiesNames,
                  facilities: facilitiesNames,
                  description: detailedData.description || "",
                  images: detailedData.propertyMediaDTOs?.map(m => ({
                    name: m.mediaLabel || 'Image',
                    uri: m.filePath,
                    label: m.mediaLabel || '',
                    id: m.id
                  })) || [],
                  videos: [],
                  deleteExistingFiles: false,
                  ownershipDropdownVisible: false,
                  amenitiesDropdownVisible: false,
                  facilitiesDropdownVisible: false,
                });
              } else {
                throw new Error(response.message || response.error || 'Failed to fetch details');
              }
            } catch (error) {
              console.error('Error fetching plot details:', error);
              Alert.alert('Error', 'Failed to load plot details. Using basic data.');
              // Fallback to basic data
              setFormData({
                ownership: selectedFlat.ownership || "",
                Khasra: selectedFlat.Khasra || "",
                basicCost: selectedFlat.price ? String(selectedFlat.price).replace(/[^\d]/g, '') : "",
                amenities: [],
                facilities: [],
                description: selectedFlat.description || "",
                images: [],
                videos: [],
                deleteExistingFiles: false,
                ownershipDropdownVisible: false,
                amenitiesDropdownVisible: false,
                facilitiesDropdownVisible: false,
              });
            }
          }
          setFillDetailsModalVisible(true);
        }, 300);
        break;
      case "View":
        handleViewPress(selectedFlat);
        setActionsModalVisible(false);
        break;
      case "Delete":
        setActionsModalVisible(false);
        // Show confirmation dialog
        Alert.alert(
          'Delete Plot',
          `Are you sure you want to delete plot ${selectedFlat?.plotNumber}? This action cannot be undone.`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('Deleting plot:', selectedFlat?.plotNumber, 'ID:', selectedFlat?.plotId);
                  const result = await deletePlot(selectedFlat?.plotId);
                  
                  if (result.success) {
                    Alert.alert('Success', 'Plot deleted successfully!');
                    // Refresh plots data
                    await fetchPlots();
                  } else {
                    Alert.alert('Error', result.message || 'Failed to delete plot');
                  }
                } catch (error) {
                  console.error('Error deleting plot:', error);
                  Alert.alert('Error', error.message || 'Failed to delete plot. Please try again.');
                }
              }
            }
          ]
        );
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
              <Text style={styles.detailValue}>{selectedFlat.addedDate || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added By:</Text>
              <Text style={styles.detailValue}>{selectedFlat.addedBy || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plot No:</Text>
              <Text style={styles.detailValue}>{selectedFlat.plotNumber || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Khasra Number:</Text>
              <Text style={styles.detailValue}>{selectedFlat.khasraNumber || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ownership Type:</Text>
              <Text style={styles.detailValue}>{selectedFlat.ownershipType || selectedFlat.ownership || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Length:</Text>
              <Text style={styles.detailValue}>{selectedFlat.length || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Width:</Text>
              <Text style={styles.detailValue}>{selectedFlat.width || "N/A"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Measurement Unit:</Text>
              <Text style={styles.detailValue}>{selectedFlat.measurementUnit || "sq ft"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Area:</Text>
              <Text style={styles.detailValue}>
                {selectedFlat.area ? `${selectedFlat.area} ${selectedFlat.measurementUnit || 'sq ft'}` : "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability Status:</Text>
              <View style={styles.availabilityStatus}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: selectedFlat.availabilityStatusEnum === "AVAILABLE" ? "#4CAF50" : "#FF5722" }
                ]} />
                <Text style={[
                  styles.detailValue,
                  { color: selectedFlat.availabilityStatusEnum === "AVAILABLE" ? "#4CAF50" : "#FF5722" }
                ]}>
                  {selectedFlat.availabilityStatusEnum || "N/A"}
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
              <Text style={styles.detailLabel}>Basic Cost:</Text>
              <Text style={styles.detailValue}>
                {selectedFlat.basicAmount ? `₹${selectedFlat.basicAmount.toLocaleString()}` : "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>{selectedFlat.description || "No description available"}</Text>
            </View>
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
                      {amenity.amenityName || amenity.name || amenity}
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
                      {facility.facilityName || facility.name || facility}
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
                        <View key={index} style={styles.imageItemRow}>
                          <Ionicons name="image" size={20} color="#5aaf57" />
                          <View style={styles.imageItemInfo}>
                            <Text style={styles.imageItemLabel}>
                              {media.mediaLabel || `Image ${index + 1}`}
                            </Text>
                            <Text style={styles.imageItemPath} numberOfLines={1}>
                              {media.filePath}
                            </Text>
                          </View>
                        </View>
                      )
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.noDataText}>No media files available</Text>
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
                <View style={styles.viewModalHeader}>
                  <Text style={styles.modalTitle}>{selectedFlat.plotNumber}</Text>
                  <Text style={styles.modalSubtitle}>{selectedFlat.bhk} - {selectedFlat.area}</Text>
                </View>

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
        onPress={() => handleSelectFlat(item.plotId)}
      >
        <View style={[
          styles.checkbox, 
          { backgroundColor: selectedFlats.includes(item.plotId) ? "#5aaf57" : "transparent" }
        ]}>
          {selectedFlats.includes(item.plotId) && (
            <Feather name="check" size={14} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.flatInfoWrapper}>
        {/* Header Row - Tower Name and Status Badge */}
        <View style={styles.flatHeaderRow}>
          <Text style={styles.towerName} numberOfLines={1}>
            {item.plotType}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[
              styles.statusBadge, 
              { 
                backgroundColor: item.availabilityStatusEnum === "AVAILABLE" 
                  ? "rgba(76, 175, 80, 0.3)" 
                  : "rgba(255, 87, 34, 0.3)" 
              }
            ]}>
              <Text style={styles.badgeText}>
                {item.availabilityStatusEnum || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Floor and Flat Number Row */}
        <View style={styles.floorFlatRow}>
          <Text style={styles.floorText}>Added By: {item.addedBy}</Text>
          <Text style={styles.flatNumber}>#{item.plotNumber}</Text>
        </View>

        {/* Structure and Area Row */}
        <View style={styles.structureAreaRow}>
          <Text style={styles.structureText}>Amenities: {item.amenities?.length || 0} | Facilities: {item.facilities?.length || 0}</Text>
          <Text style={styles.areaText}>{item.addedDate}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              // Close all dropdowns first
              setStructureDropdownVisible(false);
              setAreaDropdownVisible(false);
              
              // Select the current flat
              setSelectedFlats([item.plotId]);
              
              // Fetch detailed data from API before opening modal
              if (item?.plotId) {
                try {
                  const response = await fetchPlotDetailsForPlc(item.plotId);
                  
                  if (response.success && response.data) {
                    const detailedData = response.data;
                    console.log('Detailed plot data for edit:', detailedData);
                    
                    // Find ownership type from the ownerships array
                    const ownershipName = ownerships.find(o => o.id === detailedData.ownershipTypeId)?.type || detailedData.ownershipType || "";
                    
                    // Extract amenity IDs
                    const amenityIds = (detailedData.amenities || []).map(a => a.amenityId).filter(Boolean);
                    
                    // Extract facility IDs
                    const facilityIds = (detailedData.facilities || []).map(f => f.facilityId).filter(Boolean);
                    
                    // Extract existing images
                    const existingImages = (detailedData.propertyMediaDTOs || [])
                      .filter(media => media.filePath)
                      .map(media => ({
                        uri: media.filePath,
                        name: media.mediaLabel || 'Image',
                        type: 'image',
                        base64: null,
                        label: media.mediaLabel || ''
                      }));
                    
                    // Pre-fill form with detailed data
                    setFormData({
                      ownership: ownershipName,
                      Khasra: detailedData.khasraNumber || "",
                      basicCost: detailedData.basicAmount ? String(detailedData.basicAmount) : "",
                      amenities: amenityIds,
                      facilities: facilityIds,
                      description: detailedData.description || "",
                      images: existingImages,
                      videos: [],
                      deleteExistingFiles: false,
                      ownershipDropdownVisible: false,
                      amenitiesDropdownVisible: false,
                      facilitiesDropdownVisible: false,
                    });
                  } else {
                    throw new Error(response.message || response.error || 'Failed to fetch details');
                  }
                } catch (error) {
                  console.error('Error fetching plot details for edit:', error);
                  Alert.alert('Error', 'Failed to load plot details. Using basic data.');
                  // Fallback to basic data
                  setFormData({
                    ownership: item.ownership || "",
                    Khasra: item.Khasra || "",
                    basicCost: item.price ? String(item.price).replace(/[^\d]/g, '') : "",
                    amenities: [],
                    facilities: [],
                    description: item.description || "",
                    images: [],
                    videos: [],
                    deleteExistingFiles: false,
                    ownershipDropdownVisible: false,
                    amenitiesDropdownVisible: false,
                    facilitiesDropdownVisible: false,
                  });
                }
              }
              
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
            onPress={() => {
              Alert.alert(
                'Delete Plot',
                `Are you sure you want to delete plot ${item.plotNumber}? This action cannot be undone.`,
                [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        console.log('Deleting plot:', item.plotNumber, 'ID:', item.plotId);
                        const result = await deletePlot(item.plotId);
                        
                        if (result.success) {
                          Alert.alert('Success', 'Plot deleted successfully!');
                          // Refresh plots data
                          await fetchPlots();
                        } else {
                          Alert.alert('Error', result.message || 'Failed to delete plot');
                        }
                      } catch (error) {
                        console.error('Error deleting plot:', error);
                        Alert.alert('Error', error.message || 'Failed to delete plot. Please try again.');
                      }
                    }
                  }
                ]
              );
            }}
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

  const filteredFlats = (plots || []).filter((plot) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCasePlotNumber = plot.plotNumber?.toLowerCase() || "";
    
    // Filter by plot number
    const matchesPlotNumber = !searchQuery || lowerCasePlotNumber.includes(lowerCaseQuery);
    
    // Filter by type (Residential/Commercial)
    const matchesStructure = !selectedStructure || 
      selectedStructure === "All Plot" || 
      plot.plotType === selectedStructure;
    
    // Filter by area
    let matchesArea = !selectedArea || selectedArea === "All Areas";
    if (selectedArea && selectedArea !== "All Areas") {
      const areaValue = plot.area || 0; // Use numeric area directly
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
    
    return matchesPlotNumber && matchesStructure && matchesArea;
  });

  // Helper functions for Fill Details Modal
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value) => {
    // For amenities and facilities, we need to work with IDs
    if (field === 'amenities') {
      const amenityId = amenities.find(a => a.name === value)?.id;
      if (amenityId) {
        setFormData(prev => ({
          ...prev,
          [field]: prev[field].includes(amenityId)
            ? prev[field].filter(id => id !== amenityId)
            : [...prev[field], amenityId]
        }));
      }
    } else if (field === 'facilities') {
      const facilityId = facilities.find(f => f.name === value)?.id;
      if (facilityId) {
        setFormData(prev => ({
          ...prev,
          [field]: prev[field].includes(facilityId)
            ? prev[field].filter(id => id !== facilityId)
            : [...prev[field], facilityId]
        }));
      }
    } else {
      // For other fields, use the value directly
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    }
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
      if (!formData.ownership || !formData.basicCost) {
        Alert.alert('Validation Error', 'Please fill in all required fields (Ownership, Basic Cost)');
        return;
      }

      // Get the ownership ID from the name selected
      const ownershipId = ownerships.find(o => o.type === formData.ownership)?.id;
      
      // formData.amenities and formData.facilities already contain IDs, not names
      const amenitiesIds = formData.amenities;
      const facilitiesIds = formData.facilities;

      console.log('Selected ownership ID:', ownershipId);
      console.log('Selected amenities IDs:', amenitiesIds);
      console.log('Selected facilities IDs:', facilitiesIds);

      // Prepare the data payload for each selected plot
      const savePromises = selectedFlats.map(async (selectedPlotId) => {
        // Find the plotId from the selected plot
        const selectedPlotData = (plots || []).find(plot => plot.plotId === selectedPlotId);
        const plotId = selectedPlotData?.plotId;
        
        if (!plotId) {
          return { success: false, message: 'Plot ID not found' };
        }
        
        // Prepare payload matching the update API structure
        const payload = {
          ownerShipTypeId: ownershipId,
          khasraNumber: formData.Khasra,
          basicAmount: parseFloat(formData.basicCost) || 0,
          amenityIds: amenitiesIds,
          facilityIds: facilitiesIds,
          description: formData.description,
          unitIds: [plotId],
          propertyMediaDTOs: formData.images.map(img => ({
            mediaLabel: img.label || "Image",
            mediaBase64: img.base64 || "",
            contentType: img.mimeType || img.contentType || "image/jpeg"
          })),
          shouldDeletePreviousMedia: formData.deleteExistingFiles
        };

        console.log('Saving plot details for plotId:', plotId);
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // Use updatePlotDetails for editing existing records
        return updatePlotDetails(plotId, payload);
      });

      const results = await Promise.all(savePromises);
      
      console.log('=== SAVE RESULTS ===');
      console.log('All results:', JSON.stringify(results, null, 2));
      
      const allSuccess = results.every(r => r && r.success);
      
      if (allSuccess) {
        Alert.alert('Success', 'Plot details saved successfully!');
        setFillDetailsModalVisible(false);
        
        // Refresh plots data
        await fetchPlots();
        
        // Reset form
        setFormData({
          ownership: "",
          Khasra: "",
          basicCost: "",
          amenities: [],
          facilities: [],
          description: "",
          images: [],
          videos: [],
          deleteExistingFiles: false,
          ownershipDropdownVisible: false,
          amenitiesDropdownVisible: false,
          facilitiesDropdownVisible: false,
        });
        setSelectedFlats([]);
        setSelectAll(false);
      } else {
        const failedResults = results.filter(r => !r || !r.success);
        console.error('Failed results:', failedResults);
        const errorMessages = failedResults.map(r => r?.message || r?.error || 'Unknown error').join(', ');
        Alert.alert('Error', `Some plot details failed to save: ${errorMessages}`);
      }
    } catch (error) {
      console.error('=== ERROR SAVING PLOT DETAILS ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', error.message || 'Failed to save plot details. Please try again.');
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
    const newId = locationFormData.places.length > 0 
      ? Math.max(...locationFormData.places.map(p => p.id)) + 1 
      : 1;
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

  const handleSaveLocation = async () => {
    try {
      // Validate required fields
      const hasEmptyFields = locationFormData.places.some(
        place => !place.place || !place.rateValue || !place.rateUnit
      );

      if (hasEmptyFields) {
        Alert.alert('Validation Error', 'Please fill all PLC fields');
        return;
      }

      if (!selectedLocationFlat?.plotId) {
        Alert.alert('Error', 'No plot selected');
        return;
      }

      // Find the selected PLC IDs and prepare the plcDetails array
      const plcDetails = locationFormData.places.map(place => {
        // Find the PLC ID from the selected place name
        const selectedPlc = plcData.find(plc => 
          (plc.plcName || plc.name || plc.place) === place.place
        );

        if (!selectedPlc) {
          throw new Error(`PLC not found for: ${place.place}`);
        }

        // Determine if the rate unit is "Percentage" (true) or "Amount" (false)
        const isPercentage = place.rateUnit === "Percentage";

        return {
          plcId: selectedPlc.id,
          rate: parseFloat(place.rateValue),
          isPercentage: isPercentage
        };
      });

      // Prepare the API payload
      const payload = {
        id: selectedLocationFlat.plotId,
        plcDetails: plcDetails
      };

      console.log('Saving PLC details for plot:', selectedLocationFlat.plotNumber);
      console.log('Payload:', payload);

      // Call the API
      const result = await savePlotPlcDetails(payload);

      if (result.success) {
        Alert.alert('Success', 'PLC details saved successfully!');
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
      } else {
        Alert.alert('Error', result.message || 'Failed to save PLC details');
      }
    } catch (error) {
      console.error('Error in handleSaveLocation:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred while saving PLC details');
    }
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
          <TouchableWithoutFeedback onPress={() => {}}>
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

  const renderMultiSelectModal = (visible, setVisible, options, selectedValues, onToggle, title, field) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.dropdownModal}>
              <Text style={styles.dropdownModalTitle}>{title}</Text>
              <ScrollView style={styles.dropdownList}>
                {options.map((option, index) => {
                  // Check if this option is selected
                  let isSelected = false;
                  
                  if (field === 'amenities') {
                    const amenityId = amenities.find(a => a.name === option)?.id;
                    isSelected = selectedValues.includes(amenityId);
                  } else if (field === 'facilities') {
                    const facilityId = facilities.find(f => f.name === option)?.id;
                    isSelected = selectedValues.includes(facilityId);
                  } else {
                    isSelected = selectedValues.includes(option);
                  }
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownOption,
                        isSelected && styles.selectedOption
                      ]}
                      onPress={() => onToggle(option)}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        isSelected && styles.selectedOptionText
                      ]}>
                        {option}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#5aaf57" />
                      )}
                    </TouchableOpacity>
                  );
                })}
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
        <Text style={styles.headerTitle}>Plot Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {propertyData && (
        <View style={styles.propertyInfoCard}>
          <Text style={styles.propertyName}>{propertyData.projectName}</Text>
          <Text style={styles.propertyBuilder}>by {propertyData.builderName}</Text>
        </View>
      )}
      
      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>Loading plots...</Text>
        </View>
      ) : (
        <>
      
      {/* Filter Section */}
      <View style={styles.filtersContainer}>
        {/* Structure Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setStructureDropdownVisible(!structureDropdownVisible)}
          >
            <Text style={styles.dropdownText}>
              {selectedStructure || "Plot"}
            </Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          {structureDropdownVisible && (
            <View style={styles.dropdownOptions}>
              {plotOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => handleStructureSelect(option)}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
          placeholder="Search by plot number..."
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
          onPress={async () => {
            // Close all dropdowns first
            setStructureDropdownVisible(false);
            setAreaDropdownVisible(false);
            
            if (selectedFlats.length === 1) {
              // Pre-fill form with single plot's detailed data from API
              const selectedPlotData = (plots || []).find(plot => plot.plotId === selectedFlats[0]);
              if (selectedPlotData?.plotId) {
                try {
                  // Fetch detailed data from API
                  const response = await fetchPlotDetailsForPlc(selectedPlotData.plotId);
                  
                  if (response.success && response.data) {
                    const detailedData = response.data;
                    console.log('Detailed plot data for edit:', detailedData);
                    
                    // Map API response to form fields
                    const ownershipName = detailedData.ownership || "";
                    const amenitiesNames = detailedData.amenities?.map(a => a.amenityName || a.name) || [];
                    const facilitiesNames = detailedData.facilities?.map(f => f.facilityName || f.name) || [];
                    
                    setFormData({
                      ownership: ownershipName,
                      Khasra: detailedData.Khasra || "",
                      basicCost: detailedData.price ? String(detailedData.price).replace(/[^\d]/g, '') : "",
                      amenities: amenitiesNames,
                      facilities: facilitiesNames,
                      description: detailedData.description || "",
                      images: detailedData.propertyMediaDTOs?.filter(m => m.mediaType === 'IMAGE').map(m => ({
                        name: m.mediaName || 'Image',
                        uri: m.mediaUrl,
                        label: m.mediaLabel || ''
                      })) || [],
                      videos: detailedData.propertyMediaDTOs?.filter(m => m.mediaType === 'VIDEO').map(m => ({
                        name: m.mediaName || 'Video',
                        uri: m.mediaUrl,
                        label: m.mediaLabel || ''
                      })) || [],
                      deleteExistingFiles: false,
                      ownershipDropdownVisible: false,
                      amenitiesDropdownVisible: false,
                      facilitiesDropdownVisible: false,
                    });
                  } else {
                    throw new Error(response.message || response.error || 'Failed to fetch details');
                  }
                } catch (error) {
                  console.error('Error fetching plot details:', error);
                  Alert.alert('Error', 'Failed to load plot details. Using basic data.');
                  // Fallback to basic data
                  setFormData({
                    ownership: selectedPlotData.ownership || "",
                    Khasra: selectedPlotData.Khasra || "",
                    basicCost: selectedPlotData.price ? String(selectedPlotData.price).replace(/[^\d]/g, '') : "",
                    amenities: [],
                    facilities: [],
                    description: selectedPlotData.description || "",
                    images: [],
                    videos: [],
                    deleteExistingFiles: false,
                    ownershipDropdownVisible: false,
                    amenitiesDropdownVisible: false,
                    facilitiesDropdownVisible: false,
                  });
                }
              }
            } else {
              // Multiple plots selected - empty form
              setFormData({
                ownership: "",
                Khasra: "",
                basicCost: "",
                amenities: [],
                facilities: [],
                description: "",
                images: [],
                videos: [],
                deleteExistingFiles: false,
                // Reset all dropdown visibility states
                ownershipDropdownVisible: false,
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
      
      <FlatList
        data={filteredFlats}
        keyExtractor={(item) => item.plotId?.toString()}
        contentContainerStyle={styles.list}
        renderItem={renderFlatItem}
        showsVerticalScrollIndicator={false}
      />
      
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
                      ? `Edit Plot Details (${(plots || []).find(f => f.plotId === selectedFlats[0])?.plotNumber || 'Unknown'})`
                      : `Fill Details (${selectedFlats.length} Plots selected)`
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

                    {/* Khasra Number Input */}
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Khasra Number</Text>
                      <TextInput
                        style={styles.formInput}
                        value={formData.Khasra}
                        onChangeText={(value) => handleFormDataChange('Khasra', value)}
                        placeholder="Enter Khasra Number"
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
                  <TouchableOpacity 
                    style={[styles.saveButton, saving && { opacity: 0.7 }]} 
                    onPress={handleSaveDetails}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={[styles.saveButtonText, { marginLeft: 10 }]}>Saving...</Text>
                      </>
                    ) : (
                      <Text style={styles.saveButtonText}>Save Details</Text>
                    )}
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

                {renderMultiSelectModal(
                  formData.amenitiesDropdownVisible,
                  (visible) => handleFormDataChange('amenitiesDropdownVisible', visible),
                  amenitiesOptions,
                  formData.amenities,
                  (value) => handleMultiSelect('amenities', value),
                  "Select Amenities",
                  'amenities'
                )}

                {renderMultiSelectModal(
                  formData.facilitiesDropdownVisible,
                  (visible) => handleFormDataChange('facilitiesDropdownVisible', visible),
                  facilitiesOptions,
                  formData.facilities,
                  (value) => handleMultiSelect('facilities', value),
                  "Select Facilities",
                  'facilities'
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
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.locationModal}>
                <View style={styles.modalHandle} />
                
                {/* Modal Header */}
                <View style={styles.locationModalHeader}>
                  <Text style={styles.locationModalTitle}>
                    Location Details - {selectedLocationFlat?.plotNumber}
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
      </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontFamily: "PlusM",
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
  noDataText: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
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
    fontSize: 12,
    fontFamily: "PlusSB",
    color: "#666",
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
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
    fontSize: 10,
    fontFamily: "PlusR",
    color: "#999",
  },
  fileName: {
    fontSize: 12,
    fontFamily: "PlusM",
    color: "#333",
  },
  formRowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
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
  // Image Upload Modal Styles
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
  // Image List Styles for View Modal
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
});

export default PlotsDetailsPage;
