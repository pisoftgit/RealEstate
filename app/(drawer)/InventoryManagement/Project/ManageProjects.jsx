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
  Image,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";

const screenHeight = Dimensions.get("window").height;

const dummyProperties = [
  {
    id: "1",
    projectName: "Greenwood Residency",
    builderName: "Eco Builders",
    address: "123 Oak St, Springfield",
    propertyNature: "residential",
    residentialPropertyType: "housing_group",
    isGated: true,
    pic: "https://images.unsplash.com/photo-1560185127-6c4b1f1f9b3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGhvdXNlJTIwZ3JvdXB8ZW58MHx8fHwxNjk1NjYzMjYz&ixlib=rb-4.0.3&q=80&w=400",
    startDate: "2023-01-15",
    completionDate: "2025-06-30",
    possessionStatus: "Under Construction",
    reraApproved: true,
    description: "A premium housing group with eco-friendly amenities.",
    pdfUrl: "https://example.com/greenwood-residency.pdf",
  },
  {
    id: "2",
    projectName: "Lakeview Apartments",
    builderName: "Urban Homes Inc.",
    address: "456 Pine Ave, Lakeside",
    propertyNature: "residential",
    residentialPropertyType: "apartments",
    isGated: true,
    pic: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGFwYXJ0bWVudHN8ZW58MHx8fHwxNjk1NjYzMjYz&ixlib=rb-4.0.3&q=80&w=400",
    startDate: "2022-05-10",
    completionDate: "2024-12-15",
    possessionStatus: "Ready to Move",
    reraApproved: true,
    description: "Modern apartments with a stunning lake view.",
    pdfUrl: "https://example.com/lakeview-apartments.pdf",
  },
  {
    id: "3",
    projectName: "The Cedars Villa",
    builderName: "Luxury Estates Co.",
    address: "789 Cedar Rd, Hilltop",
    propertyNature: "residential",
    residentialPropertyType: "house_villa",
    isGated: false,
    pic: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDN8fHZpbGxhfGVufDB8fHx8MTY5NTY2MzI2Mw&ixlib=rb-4.0.3&q=80&w=400",
    startDate: "2021-09-01",
    completionDate: "2023-11-20",
    possessionStatus: "Completed",
    reraApproved: false,
    description: "Luxurious villas with private gardens and pools.",
    pdfUrl: "https://example.com/the-cedars-villa.pdf",
  },
  {
    id: "4",
    projectName: "Sunset Farmhouse",
    builderName: "Country Living Ltd.",
    address: "101 Countryside Lane",
    propertyNature: "residential",
    residentialPropertyType: "farmhouse",
    isGated: false,
    pic: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDR8fGZhcm1ob3VzZXN8ZW58MHx8fHwxNjk1NjYzMjYz&ixlib=rb-4.0.3&q=80&w=400",
    startDate: "2020-03-15",
    completionDate: "2022-08-30",
    possessionStatus: "Completed",
    reraApproved: true,
    description: "Farmhouses with serene countryside views.",
    pdfUrl: "https://example.com/sunset-farmhouse.pdf",
  },
  {
    id: "5",
    projectName: "Tech Park Office Spaces",
    builderName: "Corporate Devs",
    address: "202 Business Blvd, Metropolis",
    propertyNature: "commercial",
    commercialPropertyType: "office_space",
    isGated: true,
    pic: "https://images.unsplash.com/photo-1599423300746-b62533397364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDV8fG9mZmljZXxlbnwwfHx8fDE2OTU2NjMyNjM&ixlib=rb-4.0.3&q=80&w=400",
    startDate: "2024-01-01",
    completionDate: "2026-12-31",
    possessionStatus: "Planning Phase",
    reraApproved: false,
    description: "State-of-the-art office spaces in the heart of the city.",
    pdfUrl: "https://example.com/tech-park-office-spaces.pdf",
  },
];

const ViewProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewProperty, setViewProperty] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    setProperties(dummyProperties);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleEditPress = (property) => {
    router.push({
      pathname: "/(drawer)/InventoryManagement/AddProjects",
      params: { 
        editMode: "true",
        propertyData: JSON.stringify(property) 
      },
    });
  };

  const handleActionsPress = (property) => {
    setSelectedProperty(property);
    setActionsModalVisible(true);
  };

  const handleViewPress = (property) => {
    setViewProperty(property);
    setViewModalVisible(true);
  };

  const handleOpenImageModal = () => {
    setImageModalVisible(true);
  };

  const handleOpenPDF = (pdfUrl) => {
    if (!pdfUrl) {
      console.error("PDF URL is missing or invalid.");
      alert("Project details PDF is not available.");
      return;
    }

    Linking.openURL(pdfUrl).catch((err) => {
      console.error("Failed to open PDF:", err);
      alert("Failed to open the PDF. Please try again later.");
    });
  };

  const handleActionOptionPress = (option) => {
    switch (option) {
      case "Add Property Summary":
        router.push({
          pathname: "./PropertySummaryPage",
          params: { 
            propertyData: JSON.stringify(selectedProperty) 
          },
        });
        setActionsModalVisible(false);
        break;
      case "Manage Property Summary":
        // You can implement manage functionality here
        console.log("Manage Property Summary for:", selectedProperty?.projectName);
        setActionsModalVisible(false);
        break;
      default:
        console.log(`No action defined for option: ${option}`);
        setActionsModalVisible(false);
        return;
    }
  };

  const renderActionOptions = () => {
    if (!selectedProperty) return null;

    const options = ["Add Property Summary", "Manage Property Summary"];

    return (
      <View style={styles.actionOptionsContainer}>
        <Text style={styles.modalTitle}>Options:</Text>
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

  const renderViewModal = () => {
    if (!viewProperty) return null;

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
              <View style={styles.modalContainer}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{viewProperty.projectName}</Text>
                <Text style={styles.modalSubtitle}>{viewProperty.builderName}</Text>
                <Text style={styles.modalText}>
                  Start Date: {viewProperty.startDate || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  Completion Date: {viewProperty.completionDate || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  Possession Status: {viewProperty.possessionStatus || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  RERA Approved: {viewProperty.reraApproved ? "Yes" : "No"}
                </Text>
                <Text style={styles.modalText}>
                  Description: {viewProperty.description || "N/A"}
                </Text>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleOpenImageModal}
                >
                  <Text style={styles.imageButtonText}>View Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={() => handleOpenPDF(viewProperty.pdfUrl)}
                >
                  <Text style={styles.pdfButtonText}>Project Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderImageModal = () => {
    if (!viewProperty) return null;

    return (
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalBackground}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: viewProperty.pic }}
            style={styles.fullscreenImage}
          />
        </View>
      </Modal>
    );
  };

  const renderProperty = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.nameDeptWrapper}>
        <Text style={styles.name} numberOfLines={1}>
          {item.projectName}
        </Text>
        <Text style={styles.department} numberOfLines={1}>
          {item.builderName}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      <View style={styles.actionIcons}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleEditPress(item)}
        >
          <Feather name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleViewPress(item)}
        >
          <Feather name="eye" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => console.log("Delete property:", item.id)}
        >
          <Feather name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleActionsPress(item)}
        >
          <Feather name="more-horizontal" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredProperties = properties.filter((prop) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseName = prop.projectName?.toLowerCase() || "";
    const lowerCaseBuilder = prop.builderName?.toLowerCase() || "";
    return (
      lowerCaseName.includes(lowerCaseQuery) ||
      lowerCaseBuilder.includes(lowerCaseQuery)
    );
  });

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
          <Text style={styles.headerSubTitle}>Projects</Text>
          <Text style={styles.headerDesc}>
            Search for a property by name or builder!
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
          placeholder="Search properties..."
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
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderProperty}
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
      {renderImageModal()}
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
    fontFamily: "PlusSB", // Replace with available font if needed
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
    padding: 10,
    backgroundColor: "#03471aff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderLeftColor: "#fff",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  nameDeptWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  department: {
    fontSize: 12,
    fontFamily: "PlusL",
    color: "#fff",
    marginTop: 1,
  },
  address: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "PlusL",
    marginTop: 3,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
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
  },
  actionOptionBtn: {
    padding: 12,
    backgroundColor: "#033b01ff",
    borderRadius: 20,
    marginBottom: 8,
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
  imageButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#004d40",
    borderRadius: 10,
    alignItems: "center",
  },
  imageButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "PlusSB",
  },
  imageModalBackground: {
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
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'PlusR',
    color: "#666",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'PlusL',
    color: "#333",
    marginBottom: 8,
  },
  pdfButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#004d40",
    borderRadius: 10,
    alignItems: "center",
  },
  pdfButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "PlusSB",
  },
});

export default ViewProperties;