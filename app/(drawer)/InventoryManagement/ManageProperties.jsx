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
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNavigation } from 'expo-router';

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
    pic: "https://via.placeholder.com/150/5aaf57/FFFFFF?text=HG",
  },
  {
    id: "2",
    projectName: "Lakeview Apartments",
    builderName: "Urban Homes Inc.",
    address: "456 Pine Ave, Lakeside",
    propertyNature: "residential",
    residentialPropertyType: "apartments",
    isGated: true,
    pic: "https://via.placeholder.com/150/5aaf57/FFFFFF?text=APT",
  },
  {
    id: "3",
    projectName: "The Cedars Villa",
    builderName: "Luxury Estates Co.",
    address: "789 Cedar Rd, Hilltop",
    propertyNature: "residential",
    residentialPropertyType: "house_villa",
    isGated: false,
    pic: "https://via.placeholder.com/150/5aaf57/FFFFFF?text=VILLA",
  },
  {
    id: "4",
    projectName: "Sunset Farmhouse",
    builderName: "Country Living Ltd.",
    address: "101 Countryside Lane",
    propertyNature: "residential",
    residentialPropertyType: "farmhouse",
    isGated: false,
    pic: "https://via.placeholder.com/150/5aaf57/FFFFFF?text=FH",
  },
  {
    id: "5",
    projectName: "Tech Park Office Spaces",
    builderName: "Corporate Devs",
    address: "202 Business Blvd, Metropolis",
    propertyNature: "commercial",
    commercialPropertyType: "office_space",
    isGated: true,
    pic: "https://via.placeholder.com/150/5aaf57/FFFFFF?text=OFFICE",
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
    let route = '';
    switch (option) {
      case 'Group':
        route = '/(drawer)/InventoryManagement/AddGroup';
        break;
      case 'Block':
        route = '/(drawer)/InventoryManagement/AddBlock';
        break;
      case 'Floor':
        route = '/(drawer)/InventoryManagement/AddFloor';
        break;
      case 'Flat':
        route = '/(drawer)/InventoryManagement/AddFlat';
        break;
      case 'Room':
        route = '/(drawer)/InventoryManagement/AddRoom';
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
      <Image
        source={{ uri: item.pic }}
        style={styles.avatar}
      />
      <View style={styles.nameDeptWrapper}>
        <Text style={styles.name} numberOfLines={1}>{item.projectName}</Text>
        <Text style={styles.department} numberOfLines={1}>{item.builderName}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
      </View>
      <View style={styles.actionIcons}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => console.log('Edit property:', item.id)}>
          <Feather name="edit" size={20} color="#5aaf57" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => console.log('Delete property:', item.id)}>
          <Feather name="trash-2" size={20} color="#ff6b6b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => handleActionsPress(item)}>
          <Feather name="more-horizontal" size={20} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredProperties = properties.filter((prop) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseName = prop.projectName?.toLowerCase() || "";
    const lowerCaseBuilder = prop.builderName?.toLowerCase() || "";
    return lowerCaseName.includes(lowerCaseQuery) || lowerCaseBuilder.includes(lowerCaseQuery);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#000" />
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
          size={20}
          color="#5aaf57"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search properties..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery?.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AntDesign name="closecircle" size={18} color="#aaa" />
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
        animationType="fade"
        onRequestClose={() => setActionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActionsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add:</Text>
                {renderActionOptions()}
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setActionsModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 60 : 70,
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 35,
    fontFamily: "PlusSB",
    marginTop: -89,
  },
  headerSubTitle: {
    fontSize: 30,
    fontFamily: "PlusSB",
    color: "#5aaf57",
    marginTop: -5,
  },
  headerDesc: {
    fontSize: 12,
    fontFamily: "PlusR",
    marginTop: 5,
  },
  lottie: {
    width: 80,
    height: 50,
    transform: [{ scale: 2 }],
    bottom: 15,
    top: -45,
    marginRight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    shadowColor: "#32cd32",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    marginTop: -20,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontFamily: "PlusR",
    fontWeight: "600",
    color: "#333",
    paddingLeft: 8,
  },
  searchIcon: {
    marginRight: 5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    backgroundColor: "#fefefe",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  nameDeptWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  department: {
    fontSize: 14,
    color: "#5aaf57",
  },
  address: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 8,
    marginLeft: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "70%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actionOptionsContainer: {
    width: "100%",
  },
  actionOptionBtn: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
    alignItems: "center",
  },
  actionOptionText: {
    fontSize: 16,
    color: "#444",
  },
  closeBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
  },
  closeBtnText: {
    color: "white",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});

export default ViewProperties;