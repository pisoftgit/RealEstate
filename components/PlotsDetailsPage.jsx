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
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";

const screenHeight = Dimensions.get("window").height;

const dummyFlats = [
  {
    id: "1",
    type: "Residential",
    plotNumber: "101",
    addedby: "Dav",
    Khasra: "204",
    addeddate: "14-04-2025",
    price: "₹45,00,000",
    status: "Available",
    isAvailable: true,
    ownership: "Free Hold",
    facing: "East",
    balconies: 2,
    bathrooms: 2,
    
  },
  {
    id: "2",
    type: "Residential ",
    plotNumber: "205",
    addedby: "Sumit",
    Khasra: "375",
    addeddate: "14-02-2025",
    price: "₹62,50,000",
    status: "Not Available",
    isAvailable: false,
    ownership: "Lease Hold",
    facing: "North",
    balconies: 3,
    bathrooms: 3,
   
  },
  {
    id: "3",
    type: "Commercial",
    plotNumber: "310",
    addedby: "Rahul",
    Khasra: "156",
    addeddate: "18-03-2025",
    price: "₹32,00,000",
    status: "Available",
    isAvailable: true,
    ownership: "Free Hold 2",
    facing: "South",
    balconies: 1,
    bathrooms: 1,
  
  },
  {
    id: "4",
    type: "Commercial",
    plotNumber: "405",
    addedby: "Aman Badyal",
    Khasra: "405",
    addeddate: "20-01-2025",
    price: "₹85,00,000",
    status: "Not Available",
    isAvailable: false,
    ownership: "Lease Hold",
    facing: "West",
    balconies: 4,
    bathrooms: 4,
   
  },
];

const PlotsDetailsPage = ({ propertyData, onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStructure, setSelectedStructure] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [structureDropdownVisible, setStructureDropdownVisible] = useState(false);
  const [areaDropdownVisible, setAreaDropdownVisible] = useState(false);
  const [flats, setFlats] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedFlats, setSelectedFlats] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fillDetailsModalVisible, setFillDetailsModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocationFlat, setSelectedLocationFlat] = useState(null);
  
  // Fill Details Form State
  const [formData, setFormData] = useState({
    ownership: "",
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
    videos: [],
    deleteExistingFiles: false,
    // Dropdown visibility states
    ownershipDropdownVisible: false,
    KhasraDropdownVisible: false,
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
  const ownershipOptions = ["Free Hold", "Lease Hold", "Free Hold 2"];
  const KhasraOptions = ["204", "206", "6567", "755", "5678", "678", "668", "567"];
  const areaUnitOptions = ["sq ft", "sq m"];
  const amenitiesOptions = [
    "Swimming Pool", "Gym", "Club House", "Children's Play Area", "Jogging Track",
    "Security", "Power Backup", "Lift", "Car Parking", "Visitor Parking",
    "Garden", "Maintenance Staff", "Water Supply", "Intercom"
  ];
  const facilitiesOptions = [
    "Hospital", "School", "Shopping Mall", "Bank", "ATM", "Restaurant",
    "Public Transport", "Metro Station", "Airport", "Railway Station",
    "Market", "Pharmacy", "Petrol Pump", "Temple"
  ];
  
  // Location Modal Options
  const placeOptions = [
    "Near Metro Station", "Near Shopping Mall", "Near Hospital", "Near School",
    "Near Park", "Near Market", "Main Road", "Highway Access", "Airport Nearby",
    "Railway Station", "Bus Stop", "Commercial Area", "Residential Area"
  ];
  
  const rateUnitOptions = [
    "₹/sq ft", "₹/sq m", "% appreciation", "% premium", "₹ lakh total", "₹ crore total"
  ];

  useEffect(() => {
    setFlats(dummyFlats);
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

  const handleViewPress = (flat) => {
    setSelectedFlat(flat);
    setViewModalCurrentIndex(0); // Reset to first tab
    setViewModalVisible(true);
  };

  const handleActionOptionPress = (option) => {
    switch (option) {
      case "Edit":
        // Close action modal first, then open fill details modal with delay
        setActionsModalVisible(false);
        
        // Use timeout to ensure action modal is closed before opening fill details
        setTimeout(() => {
          // Close all dropdowns first
          setStructureDropdownVisible(false);
          setAreaDropdownVisible(false);
          
          // Select the current flat and open Fill Details modal
          setSelectedFlats([selectedFlat.id]);
          // Pre-fill form with current flat's data
          setFormData({
            ownership: selectedFlat.ownership || "",
            facing: selectedFlat.facing || "",
            carpetArea: selectedFlat.area ? selectedFlat.area.replace(/[^\d]/g, '') : "",
            carpetAreaUnit: "sq ft",
            loadingPercentage: "",
            superArea: "",
            numberOfKitchens: "",
            basicCost: selectedFlat.price ? selectedFlat.price.replace(/[^\d]/g, '') : "",
            amenities: [],
            facilities: [],
            description: "",
            images: [],
            videos: [],
            deleteExistingFiles: false,
            // Reset all dropdown visibility states
            ownershipDropdownVisible: false,
            KhasraDropdownVisible: false,
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
        console.log("Delete Flat:", selectedFlat?.flatNumber);
        // Add delete logic here
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
              <Text style={styles.detailLabel}>Ownership Type:</Text>
              <Text style={styles.detailValue}>{selectedFlat.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plot No:</Text>
              <Text style={styles.detailValue}>{selectedFlat.plotNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added By:</Text>
              <Text style={styles.detailValue}>{selectedFlat.addedby}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Added Date:</Text>
              <Text style={styles.detailValue}>{selectedFlat.addeddate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Khasra Number:</Text>
              <Text style={styles.detailValue}>{selectedFlat.Khasra}</Text>
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
              <Text style={styles.detailLabel}>Length:</Text>
              <Text style={styles.detailValue}>100</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Width:</Text>
              <Text style={styles.detailValue}>200</Text>
            </View>
             <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Measurement Unit:</Text>
              <Text style={styles.detailValue}>ft</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Basic Cost:</Text>
              <Text style={styles.detailValue}>{selectedFlat.price}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description:</Text>
              <Text style={styles.detailValue}>Dev</Text>
            </View>
          </View>
        )
      },
      {
        title: "Amenities",
        icon: "star-outline",
        content: (
          <View style={styles.sectionContent}>
            <View style={styles.amenitiesGrid}>
              {["Swimming Pool", "Gym", "Club House", "Children's Play Area", "Jogging Track", "Security", "Power Backup", "Lift"].map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )
      },
      {
        title: "Facilities",
        icon: "location-outline",
        content: (
          <View style={styles.sectionContent}>
            <View style={styles.amenitiesGrid}>
              {["Hospital", "School", "Shopping Mall", "Bank", "ATM", "Restaurant", "Public Transport", "Metro Station"].map((facility, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="location" size={16} color="#2196F3" />
                  <Text style={styles.amenityText}>{facility}</Text>
                </View>
              ))}
            </View>
          </View>
        )
      },
      {
        title: "Media Files",
        icon: "images-outline",
        content: (
          <View style={styles.sectionContent}>
            <View style={styles.mediaSection}>
              <View style={styles.mediaRow}>
                <Ionicons name="image-outline" size={24} color="#FF9800" />
                <Text style={styles.mediaText}>Images: 5 files</Text>
              </View>
              <View style={styles.mediaRow}>
                <Ionicons name="videocam-outline" size={24} color="#9C27B0" />
                <Text style={styles.mediaText}>Videos: 2 files</Text>
              </View>
              <TouchableOpacity style={styles.viewMediaBtn}>
                <Text style={styles.viewMediaText}>View All Media</Text>
              </TouchableOpacity>
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
                  <Text style={styles.modalTitle}>{selectedFlat.flatNumber}</Text>
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
        {/* Header Row - Tower Name and Status Badge */}
        <View style={styles.flatHeaderRow}>
          <Text style={styles.towerName} numberOfLines={1}>
            {item.type}
          </Text>
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

        {/* Floor and Flat Number Row */}
        <View style={styles.floorFlatRow}>
          <Text style={styles.floorText}>Added By: {item.addedby}</Text>
          <Text style={styles.flatNumber}>#{item.plotNumber}</Text>
        </View>

        {/* Structure and Area Row */}
        <View style={styles.structureAreaRow}>
          <Text style={styles.structureText}>Khasra Number: {item.Khasra}</Text>
          <Text style={styles.areaText}>{item.addeddate}</Text>
        </View>

        

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              // Close all dropdowns first
              setStructureDropdownVisible(false);
              setAreaDropdownVisible(false);
              
              // Select the current flat and open Fill Details modal
              setSelectedFlats([item.id]);
              // Pre-fill form with current flat's data
              setFormData({
                ownership: item.ownership || "",
                Khasra: item.Khasra || "",
                carpetArea: item.area ? item.area.replace(/[^\d]/g, '') : "",
                carpetAreaUnit: "sq ft",
                loadingPercentage: "",
                superArea: "",
                numberOfKitchens: "",
                basicCost: item.price ? item.price.replace(/[^\d]/g, '') : "",
                amenities: [],
                facilities: [],
                description: "",
                images: [],
                videos: [],
                deleteExistingFiles: false,
                // Reset all dropdown visibility states
                ownershipDropdownVisible: false,
                KhasraDropdownVisible: false,
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
            onPress={() => console.log("Delete:", item.flatNumber)}
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

  const filteredFlats = flats.filter((flat) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseFlatNumber = flat.flatNumber?.toLowerCase() || "";
    
    // Filter by flat number
    const matchesFlatNumber = !searchQuery || lowerCaseFlatNumber.includes(lowerCaseQuery);
    
    // Filter by structure (BHK)
    const matchesStructure = !selectedStructure || 
      selectedStructure === "All Structures" || 
      flat.bhk === selectedStructure;
    
    // Filter by area
    let matchesArea = !selectedArea || selectedArea === "All Areas";
    if (selectedArea && selectedArea !== "All Areas") {
      const areaValue = parseInt(flat.area.replace(/[^\d]/g, ''));
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
    
    return matchesFlatNumber && matchesStructure && matchesArea;
  });

  // Helper functions for Fill Details Modal
  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        setFormData(prev => ({
          ...prev,
          [type]: [...prev[type], ...result.assets]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick files');
    }
  };

  const removeFile = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSaveDetails = () => {
    // Here you would typically save the form data
    console.log('Saving details for flats:', selectedFlats);
    console.log('Form data:', formData);
    Alert.alert('Success', 'Details saved successfully!');
    setFillDetailsModalVisible(false);
    
    // Reset form
    setFormData({
      ownership: "",
      Khasra: "",
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
      videos: [],
      deleteExistingFiles: false,
      // Reset all dropdown visibility states
      ownershipDropdownVisible: false,
      KhasraDropdownVisible: false,
      unitDropdownVisible: false,
      amenitiesDropdownVisible: false,
      facilitiesDropdownVisible: false,
    });
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
    console.log('Saving location for flat:', selectedLocationFlat?.flatNumber);
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

  const renderMultiSelectModal = (visible, setVisible, options, selectedValues, onToggle, title) => (
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
        <Text style={styles.headerTitle}>Plot Details</Text>
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
          onPress={() => {
            // Close all dropdowns first
            setStructureDropdownVisible(false);
            setAreaDropdownVisible(false);
            
            if (selectedFlats.length === 1) {
              // Pre-fill form with single flat's data
              const selectedFlatData = flats.find(flat => flat.id === selectedFlats[0]);
              if (selectedFlatData) {
                setFormData({
                  ownership: selectedFlatData.ownership || "",
                  Khasra: selectedFlatData.Khasra || "",
                  carpetArea: selectedFlatData.area ? selectedFlatData.area.replace(/[^\d]/g, '') : "",
                  carpetAreaUnit: "sq ft",
                  loadingPercentage: "",
                  superArea: "",
                  numberOfKitchens: "",
                  basicCost: selectedFlatData.price ? selectedFlatData.price.replace(/[^\d]/g, '') : "",
                  amenities: [],
                  facilities: [],
                  description: "",
                  images: [],
                  videos: [],
                  deleteExistingFiles: false,
                  // Reset all dropdown visibility states
                  ownershipDropdownVisible: false,
                  KhasraDropdownVisible: false,
                  unitDropdownVisible: false,
                  amenitiesDropdownVisible: false,
                  facilitiesDropdownVisible: false,
                });
              }
            } else {
              // Multiple flats selected - empty form
              setFormData({
                ownership: "",
                Khasra: "",
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
                videos: [],
                deleteExistingFiles: false,
                // Reset all dropdown visibility states
                ownershipDropdownVisible: false,
                KhasraDropdownVisible: false,
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
      
      <FlatList
        data={filteredFlats}
        keyExtractor={(item) => item.id}
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
                      ? `Edit Flat Details (${flats.find(f => f.id === selectedFlats[0])?.flatNumber || 'Unknown'})`
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

                    {/* Khasra Dropdown */}
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Khasra Number</Text>
                      <TouchableOpacity
                        style={styles.formDropdown}
                        onPress={() => setFormData(prev => ({ ...prev, KhasraDropdownVisible: !prev.KhasraDropdownVisible }))}
                      >
                        <Text style={[styles.formDropdownText, !formData.Khasra && styles.placeholderText]}>
                          {formData.Khasra || "Select Khasra"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                      </TouchableOpacity>
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
                    
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Images</Text>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => pickDocument('images')}
                      >
                        <Ionicons name="image-outline" size={20} color="#5aaf57" />
                        <Text style={styles.uploadButtonText}>Upload Images</Text>
                      </TouchableOpacity>
                    </View>

                    {formData.images.length > 0 && (
                      <View style={styles.filesList}>
                        {formData.images.map((file, index) => (
                          <View key={index} style={styles.fileItem}>
                            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                            <TouchableOpacity onPress={() => removeFile('images', index)}>
                              <Ionicons name="close-circle" size={20} color="#ff4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Videos</Text>
                      <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => pickDocument('videos')}
                      >
                        <Ionicons name="videocam-outline" size={20} color="#5aaf57" />
                        <Text style={styles.uploadButtonText}>Upload Videos</Text>
                      </TouchableOpacity>
                    </View>

                    {formData.videos.length > 0 && (
                      <View style={styles.filesList}>
                        {formData.videos.map((file, index) => (
                          <View key={index} style={styles.fileItem}>
                            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                            <TouchableOpacity onPress={() => removeFile('videos', index)}>
                              <Ionicons name="close-circle" size={20} color="#ff4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Delete Existing Files Toggle */}
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Delete Existing Files</Text>
                      <Switch
                        value={formData.deleteExistingFiles}
                        onValueChange={(value) => handleFormDataChange('deleteExistingFiles', value)}
                        trackColor={{ false: "#e0e0e0", true: "#5aaf57" }}
                        thumbColor={formData.deleteExistingFiles ? "#fff" : "#f4f3f4"}
                      />
                    </View>
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
                  formData.KhasraDropdownVisible,
                  (visible) => handleFormDataChange('KhasraDropdownVisible', visible),
                  KhasraOptions,
                  formData.Khasra,
                  (value) => handleFormDataChange('Khasra', value),
                  "Select Khasra Number"
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
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.locationModal}>
                <View style={styles.modalHandle} />
                
                {/* Modal Header */}
                <View style={styles.locationModalHeader}>
                  <Text style={styles.locationModalTitle}>
                    Location Details - {selectedLocationFlat?.flatNumber}
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
  fileName: {
    flex: 1,
    fontSize: 12,
    fontFamily: "PlusR",
    color: "#666",
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
});

export default PlotsDetailsPage;
