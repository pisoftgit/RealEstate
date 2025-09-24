import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  TextInput,
  Linking,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons, Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "expo-router"; 
import * as SecureStore from "expo-secure-store";

import { getAllEmployees, API_BASE_URL } from "../../../services/api";

const ViewEmpLocation = () => {
  const navigation = useNavigation();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info"); // "info", "error", "loading", "location"
  const [modalActions, setModalActions] = useState([]);
  const [currentLocations, setCurrentLocations] = useState([]);
  const [currentEmployeeName, setCurrentEmployeeName] = useState("");

  // ✅ Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        const formatted = data.map((emp, i) => ({
          id: emp.id?.toString() || i.toString(),
          name: emp.name,
          department: emp.designation?.department?.department || "N/A",
          userId: emp.id?.toString() || "", // Ensure userId is a string
          pic:
            emp.employeePic && emp.employeePic.length < 1000
              ? `data:image/jpeg;base64,${emp.employeePic}`
              : "https://randomuser.me/api/portraits/lego/1.jpg",
        }));
        setEmployees(formatted);
        setFilteredEmployees(formatted);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Function to fetch locations directly from API
  const fetchLocationsDirect = async (userId, date) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      if (!secretKey) {
        throw new Error("Missing authentication token");
      }

      const url = `${API_BASE_URL}/user/${userId}/locations?day=${date}`;
      console.log("🌍 Fetching locations:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          secret_key: secretKey,
        },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Failed to fetch locations:", error);
      throw error;
    }
  };

  // Helper function to show modal
  const showModal = (title, message, type = "info", actions = []) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalActions(actions);
    setModalVisible(true);
  };

  // Helper function to close modal
  const closeModal = () => {
    setModalVisible(false);
    setModalTitle("");
    setModalMessage("");
    setModalType("info");
    setModalActions([]);
  };

  const onSelectEmployee = async (employee) => {
    setSelectedEmployee(employee);
    
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      
      // Show loading modal
      showModal("Loading", "Getting location data...", "loading");
      
      const locationsData = await fetchLocationsDirect(employee.userId, dateStr);
      
      console.log("Raw locations response:", JSON.stringify(locationsData));
      
      if (locationsData?.locations && locationsData.locations.length > 0) {
        // Close loading modal and show location details
        closeModal();
        setCurrentLocations(locationsData.locations);
        setCurrentEmployeeName(employee.name);
        showLocationDetails(locationsData.locations, employee.name);
      } else {
        closeModal();
        showModal("No Location Data", `No location data found for ${employee.name} on ${formatDate(selectedDate)}`, "info");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      closeModal();
      showModal("Error", "Failed to fetch location data", "error");
    }
  };

  // Function to get place name from coordinates (without API key required)
  const getPlaceName = async (latitude, longitude) => {
    try {
      // Using Nominatim (OpenStreetMap) - completely free, no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RealEstateApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Extract meaningful parts from the address
          const address = data.address || {};
          let placeName = '';
          
          // Build a readable address
          if (address.house_number && address.road) {
            placeName += `${address.house_number} ${address.road}, `;
          } else if (address.road) {
            placeName += `${address.road}, `;
          }
          
          if (address.neighbourhood) {
            placeName += `${address.neighbourhood}, `;
          }
          
          if (address.suburb && address.suburb !== address.neighbourhood) {
            placeName += `${address.suburb}, `;
          }
          
          if (address.city) {
            placeName += `${address.city}, `;
          } else if (address.town) {
            placeName += `${address.town}, `;
          } else if (address.village) {
            placeName += `${address.village}, `;
          }
          
          if (address.state) {
            placeName += `${address.state}`;
          }
          
          // Clean up the address
          placeName = placeName.replace(/,\s*$/, ''); // Remove trailing comma
          
          if (placeName) {
            return placeName;
          }
          
          // Fallback to display_name if custom formatting fails
          return data.display_name.split(',').slice(0, 3).join(', ');
        }
      }
      
      // If Nominatim fails, try a simple IP-based geolocation service
      const ipResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        if (ipData && ipData.locality) {
          let place = '';
          if (ipData.locality) place += ipData.locality + ', ';
          if (ipData.city && ipData.city !== ipData.locality) place += ipData.city + ', ';
          if (ipData.principalSubdivision) place += ipData.principalSubdivision;
          return place.replace(/,\s*$/, '') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
      }
      
    } catch (error) {
      console.log('Geocoding error:', error);
    }
    
    // Ultimate fallback - return coordinates with better formatting
    return `📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  // Function to show location details with timestamps and place names
  const showLocationDetails = async (locations, employeeName) => {
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    };

    // Show loading modal
    showModal("Loading", "Getting location names...", "loading");

    try {
      // Get place names for all locations with a small delay between requests
      const locationsWithPlaces = [];
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        try {
          const placeName = await getPlaceName(loc.latitude, loc.longitude);
          locationsWithPlaces.push({
            ...loc,
            placeName,
            index: i + 1
          });
          
          // Small delay to avoid rate limiting
          if (i < locations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.log(`Error getting place name for location ${i + 1}:`, error);
          locationsWithPlaces.push({
            ...loc,
            placeName: `📍 ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`,
            index: i + 1
          });
        }
      }

      const locationsList = locationsWithPlaces
        .map((loc) => 
          `${loc.index}. ${formatTime(loc.timestamp)}\n   ${loc.placeName}`
        )
        .join('\n\n');

      const alertMessage = `📍 ${employeeName}'s Location History\n${formatDate(selectedDate)}\n\nTotal Locations: ${locations.length}\n\n${locationsList}`;

      // Close loading modal and show location details modal
      closeModal();
      setCurrentLocations(locations);
      setCurrentEmployeeName(employeeName);
      
      const actions = [
        {
          text: "Cancel",
          style: "cancel",
          onPress: closeModal
        },
        {
          text: "View on Map",
          onPress: () => {
            closeModal();
            openExternalMap(locations, employeeName);
          }
        }
      ];
      
      showModal("Location Details", alertMessage, "location", actions);
    } catch (error) {
      console.error('Error getting place names:', error);
      
      // Fallback to coordinates if all geocoding fails
      const locationsList = locations
        .map((loc, index) => 
          `${index + 1}. ${formatTime(loc.timestamp)}\n   📍 ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`
        )
        .join('\n\n');

      const alertMessage = `📍 ${employeeName}'s Location History\n${formatDate(selectedDate)}\n\nTotal Locations: ${locations.length}\n\n${locationsList}`;

      // Close loading modal and show location details modal
      closeModal();
      setCurrentLocations(locations);
      setCurrentEmployeeName(employeeName);
      
      const actions = [
        {
          text: "Cancel",
          style: "cancel",
          onPress: closeModal
        },
        {
          text: "View on Map",
          onPress: () => {
            closeModal();
            openExternalMap(locations, employeeName);
          }
        }
      ];
      
      showModal("Location Details", alertMessage, "location", actions);
    }
  };

  // Function to open external map with all location pins
  const openExternalMap = (locations, employeeName) => {
    if (!locations || locations.length === 0) return;

    // Sort locations by timestamp to show movement path
    const sortedLocations = locations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Create waypoints for Google Maps URL
    const waypoints = sortedLocations.map(loc => `${loc.latitude},${loc.longitude}`).join('|');
    
    // First location as origin (earliest time)
    const origin = `${sortedLocations[0].latitude},${sortedLocations[0].longitude}`;
    
    // Last location as destination (latest time)
    const destination = sortedLocations.length > 1 
      ? `${sortedLocations[sortedLocations.length - 1].latitude},${sortedLocations[sortedLocations.length - 1].longitude}`
      : origin;

    // Create Google Maps URL
    let mapsUrl;
    
    if (Platform.OS === 'ios') {
      // For iOS, use Apple Maps or Google Maps
      if (sortedLocations.length === 1) {
        // Single location
        mapsUrl = `maps:?q=${origin}&ll=${origin}`;
      } else {
        // Multiple locations with waypoints
        mapsUrl = `maps:?saddr=${origin}&daddr=${destination}&waypoints=${waypoints}`;
      }
      
      // Fallback to Google Maps if Apple Maps doesn't work
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      
      Linking.canOpenURL(mapsUrl).then(supported => {
        if (supported) {
          Linking.openURL(mapsUrl);
        } else {
          Linking.openURL(googleMapsUrl);
        }
      });
      
    } else {
      // For Android, use Google Maps
      if (sortedLocations.length === 1) {
        // Single location with timestamp info
        const timeInfo = new Date(sortedLocations[0].timestamp).toLocaleTimeString("en-IN", { hour12: true });
        mapsUrl = `geo:${origin}?q=${origin}(${employeeName} - ${timeInfo})`;
      } else {
        // Multiple locations with directions
        mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
      }
      
      Linking.canOpenURL(mapsUrl).then(supported => {
        if (supported) {
          Linking.openURL(mapsUrl);
        } else {
          showModal("Error", "Google Maps is not installed on this device", "error");
        }
      }).catch(() => {
        showModal("Error", "Unable to open maps application", "error");
      });
    }
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (employee) => {
          const userId = employee.userId || ""; // Fallback to empty string if undefined
          return (
            employee.name?.toLowerCase().includes(text.toLowerCase()) ||
            userId.toLowerCase().includes(text.toLowerCase()) ||
            employee.department?.toLowerCase().includes(text.toLowerCase())
          );
        }
      );
      setFilteredEmployees(filtered);
    }
  };

  const renderEmployee = ({ item }) => (
    <View style={styles.employeeCard}>
      <View style={styles.cardHeader}>
        <View style={styles.employeeInfo}>
          <Image source={{ uri: item.pic }} style={styles.profileImage} />
          <View style={styles.employeeDetails}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <View style={styles.departmentBadge}>
              <Text style={styles.departmentText}>{item.department}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewLocationBtn}
          onPress={() => onSelectEmployee(item)}
        >
          <MaterialIcons name="location-on" size={16} color="#fff" />
          <Text style={styles.viewLocationText}>View Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationInfo}>
        <View style={styles.locationStat}>
          <Feather name="map-pin" size={14} color="#5aaf57" />
          <Text style={styles.locationStatText}>View location names with timestamps</Text>
        </View>
        <View style={styles.locationStat}>
          <Feather name="clock" size={14} color="#5aaf57" />
          <Text style={styles.locationStatText}>{formatDate(selectedDate)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Employee Locations</Text>
        </View>

        {/* Date Picker */}
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Select Date:</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <AntDesign name="calendar" size={20} color="#5aaf57" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <AntDesign name="down" size={16} color="#5aaf57" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + List */}
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search employees..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderEmployee}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {modalType === "loading" ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.modalMessage}>{modalMessage}</Text>
                </View>
              ) : modalType === "location" ? (
                <Text style={styles.modalMessageLocation}>{modalMessage}</Text>
              ) : (
                <Text style={styles.modalMessage}>{modalMessage}</Text>
              )}
            </ScrollView>

            {modalActions.length > 0 && (
              <View style={styles.modalActions}>
                {modalActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalButton,
                      action.style === "cancel" ? styles.modalButtonCancel : styles.modalButtonPrimary
                    ]}
                    onPress={action.onPress}
                  >
                    <Text style={[
                      styles.modalButtonText,
                      action.style === "cancel" ? styles.modalButtonTextCancel : styles.modalButtonTextPrimary
                    ]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ✅ same styles as before
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    backgroundColor: "#5aaf57",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontFamily: "PlusSB", color: "#fff" },
  dateSection: { paddingHorizontal: 20 },
  dateLabel: { fontSize: 14, fontFamily: "PlusR", color: "#fff", marginBottom: 8 },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  dateText: { fontSize: 16, fontFamily: "PlusR", color: "#333", flex: 1, marginLeft: 10 },
  contentContainer: { flex: 1, padding: 20 },
  searchContainer: { marginBottom: 15 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "PlusR", color: "#333" },
  clearButton: { padding: 2 },
  listContainer: { paddingBottom: 5 },
  employeeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  employeeInfo: { flexDirection: "row", flex: 1 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  employeeName: { fontSize: 16, fontFamily: "PlusR", color: "#333", marginBottom: 6 },
  departmentBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  departmentText: { fontSize: 8, fontFamily: "PlusR", color: "#5aaf57" },
  viewLocationBtn: {
    backgroundColor: "#5aaf57",
    flexDirection: "row",
    alignItems: "center",
    height: 35,
    marginTop: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  viewLocationText: { color: "#fff", fontFamily: "PlusR", fontSize: 12, },
  locationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  locationStat: { flexDirection: "row", alignItems: "center" },
  locationStatText: { fontSize: 12, fontFamily: "PlusL", color: "#666", marginLeft: 4 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#333",
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 400,
    flexGrow: 0,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#666",
    lineHeight: 20,
  },
  modalMessageLocation: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#333",
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#f5f5f5",
  },
  modalButtonPrimary: {
    backgroundColor: "#5aaf57",
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: "PlusR",
  },
  modalButtonTextCancel: {
    color: "#666",
  },
  modalButtonTextPrimary: {
    color: "#fff",
  },
});

export default ViewEmpLocation;
