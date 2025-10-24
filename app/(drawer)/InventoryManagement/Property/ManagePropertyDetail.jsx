import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import FlatDetailsPage from "../../../../components/FlatDetailsPage";
import HouseVillaDetailsPage from "../../../../components/HouseVillaDetailsPage";
import PlotsDetailsPage from "../../../../components/PlotsDetailsPage";
import CommercialUnitDetailsPage from "../../../../components/CommercialUnitDetailsPage";

const screenHeight = Dimensions.get("window").height;

const dummyPropertyDetails = [
  {
    id: "1",
    projectName: "Greenwood Residency",
    builderName: "Eco Builders",
    startDate: "2023-01-15",
    endDate: "2025-06-30",
    possessionStatus: "Ready to Move",
    isReady: true,
  },
  {
    id: "2",
    projectName: "Lakeview Apartments",
    builderName: "Urban Homes Inc.",
    startDate: "2022-05-10",
    endDate: "2024-12-15",
    possessionStatus: "Not Ready",
    isReady: false,
  },
  {
    id: "3",
    projectName: "The Cedars Villa",
    builderName: "Luxury Estates Co.",
    startDate: "2021-09-01",
    endDate: "2023-11-20",
    possessionStatus: "Ready to Move",
    isReady: true,
  },
  {
    id: "4",
    projectName: "Sunset Farmhouse",
    builderName: "Country Living Ltd.",
    startDate: "2020-03-15",
    endDate: "2022-08-30",
    possessionStatus: "Ready to Move",
    isReady: true,
  },
  {
    id: "5",
    projectName: "Tech Park Office Spaces",
    builderName: "Corporate Devs",
    startDate: "2024-01-01",
    endDate: "2026-12-31",
    possessionStatus: "Not Ready",
    isReady: false,
  },
];

const ManagePropertyDetail = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyDetails, setPropertyDetails] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [showFlatDetails, setShowFlatDetails] = useState(false);
  const [showHouseVillaDetails, setShowHouseVillaDetails] = useState(false);
  const [showPlotsDetails, setShowPlotsDetails] = useState(false);
  const [showCommercialUnitDetails, setShowCommercialUnitDetails] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    setPropertyDetails(dummyPropertyDetails);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleActionsPress = (property) => {
    setSelectedProperty(property);
    setActionsModalVisible(true);
  };

  const handleBackFromFlatDetails = () => {
    setShowFlatDetails(false);
    setSelectedProperty(null);
  };

  const handleBackFromHouseVillaDetails = () => {
    setShowHouseVillaDetails(false);
    setSelectedProperty(null);
  };

  const handleBackFromPlotsDetails = () => {
    setShowPlotsDetails(false);
    setSelectedProperty(null);
  };

  const handleBackFromCommercialUnitDetails = () => {
    setShowCommercialUnitDetails(false);
    setSelectedProperty(null);
  };

  const handleActionOptionPress = (option) => {
    switch (option) {
       case "Flat":
        setActionsModalVisible(false);
        setShowFlatDetails(true);
        break;
      case "House/Villa":
        setActionsModalVisible(false);
        setShowHouseVillaDetails(true);
        break;
      case "Plots (Residential/Commercial)":
        setActionsModalVisible(false);
        setShowPlotsDetails(true);
        break;
      case "Commercial Unit":
        setActionsModalVisible(false);
        setShowCommercialUnitDetails(true);
        break;
      default:
        console.log(`No action defined for option: ${option}`);
        setActionsModalVisible(false);
        return;
    }
  };

  const renderActionOptions = () => {
    if (!selectedProperty) return null;

    const options = ["Flat", "House/Villa", "Plots (Residential/Commercial)", "Commercial Unit"];

    return (
      <View style={styles.actionOptionsContainer}>
        <Text style={styles.modalTitle}>Property Options:</Text>
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

  const renderPropertyDetail = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.propertyInfoWrapper}>
        <View style={styles.nameBuilderRow}>
          <Text style={styles.projectName} numberOfLines={1}>
            {item.projectName}
          </Text>
         
          <View style={styles.badgeRow}>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: item.isReady 
                ? "rgba(50, 245, 11, 0.2)" 
                : "rgba(255, 87, 34, 0.3)" 
            }
          ]}>
            <Text style={styles.badgeText}>
              {item.possessionStatus}
            </Text>
          </View>
        </View>
        </View>

         <Text style={styles.builderName} numberOfLines={1}>
            by {item.builderName}
          </Text>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateText} numberOfLines={1}>
            {item.startDate}  to  {item.endDate}
          </Text>
        </View>
        
        
      </View>
      
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleActionsPress(item)}
        >
          <Feather name="more-horizontal" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredPropertyDetails = propertyDetails.filter((prop) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseName = prop.projectName?.toLowerCase() || "";
    const lowerCaseBuilder = prop.builderName?.toLowerCase() || "";
    return (
      lowerCaseName.includes(lowerCaseQuery) ||
      lowerCaseBuilder.includes(lowerCaseQuery)
    );
  });

  // Show FlatDetailsPage if showFlatDetails is true
  if (showFlatDetails && selectedProperty) {
    return (
      <FlatDetailsPage 
        propertyData={selectedProperty}
        onBack={handleBackFromFlatDetails}
      />
    );
  }

  // Show HouseVillaDetailsPage if showHouseVillaDetails is true
  if (showHouseVillaDetails && selectedProperty) {
    return (
      <HouseVillaDetailsPage 
        propertyData={selectedProperty}
        onBack={handleBackFromHouseVillaDetails}
      />
    );
  }

  // Show PlotsDetailsPage if showPlotsDetails is true
  if (showPlotsDetails && selectedProperty) {
    return (
      <PlotsDetailsPage 
        propertyData={selectedProperty}
        onBack={handleBackFromPlotsDetails}
      />
    );
  }

  // Show CommercialUnitDetailsPage if showCommercialUnitDetails is true
  if (showCommercialUnitDetails && selectedProperty) {
    return (
      <CommercialUnitDetailsPage 
        propertyData={selectedProperty}
        onBack={handleBackFromCommercialUnitDetails}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#004d40" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Manage</Text>
          <Text style={styles.headerSubTitle}>Property Details</Text>
          <Text style={styles.headerDesc}>
            Search for property details by name or builder!
          </Text>
        </View>
        <LottieView
          source={require("../../../../assets/svg/reales.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color="#004d40"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search property details..."
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
      
      <FlatList
        data={filteredPropertyDetails}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderPropertyDetail}
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
    paddingTop: Platform.OS === "android" ? 25 : 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 20,
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
  headerTitle: {
    fontSize: 32,
    fontFamily: "PlusSB",
    color: "#333",
  },
  headerSubTitle: {
    fontSize: 32,
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
    width: 90,
    height: 90,
    marginTop: -40,
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#03471aff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  propertyInfoWrapper: {
    flex: 1,
    paddingRight: 10,
  },
  nameBuilderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#fff",
    flex: 1,
  },
  builderName: {
    fontSize: 12,
    fontFamily: "PlusL",
    color: "#e0e0e0",
    marginLeft: 8,
  },
  dateRow: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 13,
    fontFamily: "PlusR",
    color: "#f0f0f0",
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
    fontSize: 11,
    fontFamily: "PlusSB",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionSection: {
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    height: 6,
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
});

export default ManagePropertyDetail;
