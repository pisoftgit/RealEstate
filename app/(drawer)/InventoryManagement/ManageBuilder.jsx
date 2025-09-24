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
    pic: "https://via.placeholder.com/150/004d40/ffc107?text=HG",
  },
  {
    id: "2",
    projectName: "Lakeview Apartments",
    builderName: "Urban Homes Inc.",
    address: "456 Pine Ave, Lakeside",
    propertyNature: "residential",
    residentialPropertyType: "apartments",
    isGated: true,
    pic: "https://via.placeholder.com/150/004d40/ffc107?text=APT",
  },
  {
    id: "3",
    projectName: "The Cedars Villa",
    builderName: "Luxury Estates Co.",
    address: "789 Cedar Rd, Hilltop",
    propertyNature: "residential",
    residentialPropertyType: "house_villa",
    isGated: false,
    pic: "https://via.placeholder.com/150/004d40/ffc107?text=VILLA",
  },
  {
    id: "4",
    projectName: "Sunset Farmhouse",
    builderName: "Country Living Ltd.",
    address: "101 Countryside Lane",
    propertyNature: "residential",
    residentialPropertyType: "farmhouse",
    isGated: false,
    pic: "https://via.placeholder.com/150/004d40/ffc107?text=FH",
  },
  {
    id: "5",
    projectName: "Tech Park Office Spaces",
    builderName: "Corporate Devs",
    address: "202 Business Blvd, Metropolis",
    propertyNature: "commercial",
    commercialPropertyType: "office_space",
    isGated: true,
    pic: "https://via.placeholder.com/150/004d40/ffc107?text=OFFICE",
  },
];

const ViewProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    setProperties(dummyProperties);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleActionsPress = (property) => {
    setSelectedProperty(property);
    setActionsModalVisible(true);
  };

  const handleActionOptionPress = (option) => {
    let route = "";
    switch (option) {
      case "Group":
        route = "/(drawer)/InventoryManagement/AddGroup";
        break;
      case "Block":
        route = "/(drawer)/InventoryManagement/AddBlock";
        break;
      case "Floor":
        route = "/(drawer)/InventoryManagement/AddFloor";
        break;
      case "Flat":
        route = "/(drawer)/InventoryManagement/AddFlat";
        break;
      case "Room":
        route = "/(drawer)/InventoryManagement/AddRoom";
        break;
      default:
        console.log(`No route defined for option: ${option}`);
        setActionsModalVisible(false);
        return;
    }

    router.push({
      pathname: route,
      params: { propertyData: JSON.stringify(selectedProperty) },
    });
    setActionsModalVisible(false);
  };

  const renderActionOptions = () => {
    if (!selectedProperty) return null;

    const { propertyNature, residentialPropertyType } = selectedProperty;
    let options = [];

    if (propertyNature === "residential") {
      switch (residentialPropertyType) {
        case "housing_group":
          options = ["Group", "Block", "Floor", "Flat", "Room"];
          break;
        case "house_villa":
          options = ["Block", "Floor", "Room"];
          break;
        case "apartments":
          options = ["Block", "Floor", "Flat", "Room"];
          break;
        case "farmhouse":
          options = ["Block", "Floor", "Room"];
          break;
        default:
          options = [];
          break;
      }
    } else {
      options = ["Block", "Floor", "Room"];
    }

    return (
      <View style={styles.actionOptionsContainer}>
        <Text style={styles.modalTitle}>Add:</Text>
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

  const renderProperty = ({ item }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.pic }} style={styles.avatar} />
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
          onPress={() => console.log("Edit property:", item.id)}
        >
          <Feather name="edit" size={18} color="#fff" />
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
          <Text style={styles.headerSubTitle}>Properties</Text>
          <Text style={styles.headerDesc}>
            Search for a property by name or builder!
          </Text>
        </View>
        <LottieView
          source={require("../../../assets/svg/EMP.json")}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 30,
    fontWeight: "bold",
    color: "#004d40",
  },
  headerSubTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginTop: -5,
  },
  headerDesc: {
    fontSize: 13,
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
    borderColor: '#ddd',
  },
  searchBar: {
    flex: 1,
    height: 45,
    fontSize: 15,
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
    borderLeftWidth: 4,
    borderLeftColor: '#fff',
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
    fontWeight: "600",
    color: "#fff",
  },
  department: {
    fontSize: 12,
    color: "#fff",
    marginTop: 1,
  },
  address: {
    fontSize: 11,
    color: "#fff",
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
    fontWeight: "bold",
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
    fontWeight: "600",
    color: "#fff",
  },
});

export default ViewProperties;