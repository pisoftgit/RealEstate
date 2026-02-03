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
import useProject from "../../../../hooks/useProject";
import PropertyDetailPage from "../../../../components/propertydetailpage";
import useRealEstateProperties from '../../../../hooks/useRealEstateProperties';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const screenHeight = Dimensions.get("window").height;

const ManagePropertyDetail = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [showPropertyDetailPage, setShowPropertyDetailPage] = useState(false);
  const [propertyDetailType, setPropertyDetailType] = useState("GROUP_BLOCK");
  const [propertyParams, setPropertyParams] = useState(null);
  const navigation = useNavigation();
  const router = useRouter();
  
  // Fetch projects from API
  const { projects, loading, refetch } = useProject();
  const { data: propertyData, loading: propertyLoading, error: propertyError } = useRealEstateProperties(propertyParams);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleActionsPress = (property) => {
    setSelectedProperty(property);
    setActionsModalVisible(true);
  };

  const handleActionOptionPress = (option) => {
    setActionsModalVisible(false);
    if (!option || !option.item) return;
    const typeKey = option.item;
    const params = {
      projectId: selectedProperty?.projectId || selectedProperty?.id,
      propertyItem: typeKey,
      pageSize: 10,
      page: 0,
    };
    setPropertyDetailType(typeKey);
    setShowPropertyDetailPage(true);
    setPropertyParams(params);
  };

  const renderActionOptions = () => {
    if (!selectedProperty) return null;

    // Show the 'name' and 'item' from each propertyItems object, remove duplicates by item
    const options = (selectedProperty.propertyItems || [])
      .filter((obj, i, arr) => obj && obj.item && arr.findIndex(o => o.item === obj.item) === i);

    if (options.length === 0) {
      return (
        <View style={styles.actionOptionsContainer}>
          <Text style={styles.modalTitle}>No property options available.</Text>
        </View>
      );
    }

    return (
      <View style={styles.actionOptionsContainer}>
        <Text style={styles.modalTitle}>Property Options:</Text>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionOptionBtn}
            onPress={() => handleActionOptionPress(option)}
          >
            <Text style={styles.actionOptionText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPropertyDetail = ({ item }) => {
    const isReady = item.possessionStatusEnum === "READY_TO_MOVE";
    const possessionStatus = item.possessionStatusEnum 
      ? item.possessionStatusEnum.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
      : "N/A";
    
    return (
      <View style={styles.item}>
        <View style={styles.propertyInfoWrapper}>
          <View style={styles.nameBuilderRow}>
            <Text style={styles.projectName} numberOfLines={1}>
              {item.projectName || "N/A"}
            </Text>
           
            <View style={styles.badgeRow}>
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: isReady 
                    ? "rgba(50, 245, 11, 0.2)" 
                    : "rgba(255, 87, 34, 0.3)" 
                }
              ]}>
                <Text style={styles.badgeText}>
                  {possessionStatus}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.builderName} numberOfLines={1}>
            by {item.builderName || "Unknown Builder"}
          </Text>
          
          <View style={styles.dateRow}>
            <Text style={styles.dateText} numberOfLines={1}>
              {item.projectStartDate || "N/A"}  to  {item.projectCompletionDate || "N/A"}
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
  };

  const filteredPropertyDetails = projects.filter((prop) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseName = prop.projectName?.toLowerCase() || "";
    const lowerCaseBuilder = prop.builderName?.toLowerCase() || "";
    return (
      lowerCaseName.includes(lowerCaseQuery) ||
      lowerCaseBuilder.includes(lowerCaseQuery)
    );
  });

  const renderPropertyTypeProperties = () => {
    if (!propertyParams) return null;
    if (propertyLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../../../../assets/svg/reales.json")}
            autoPlay
            loop
            style={styles.loadingLottie}
          />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      );
    }
    if (propertyError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error: {propertyError}</Text>
        </View>
      );
    }
    if (propertyData && propertyData.content && propertyData.content.length > 0) {
      return (
        <FlatList
          data={propertyData.content}
          keyExtractor={(item) => item.unitId ? String(item.unitId) : item.id ? String(item.id) : Math.random().toString()}
          contentContainerStyle={styles.list}
          renderItem={renderPropertyDetail}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties found.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {showPropertyDetailPage ? (
        <PropertyDetailPage
          type={propertyDetailType}
          onBack={() => {
            setShowPropertyDetailPage(false);
            setPropertyParams(null); // Reset to show projects again
          }}
          data={propertyData && propertyData.content ? propertyData.content : undefined}
          loading={propertyLoading}
        />
      ) : (
        <>
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
              <TouchableOpacity onPress={() => setSearchQuery("")}> <AntDesign name="closecircle" size={16} color="#666" /> </TouchableOpacity>
            )}
          </View>
          {propertyParams ? (
            renderPropertyTypeProperties()
          ) : (
            loading ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={require("../../../../assets/svg/reales.json")}
                  autoPlay
                  loop
                  style={styles.loadingLottie}
                />
                <Text style={styles.loadingText}>Loading projects...</Text>
              </View>
            ) : filteredPropertyDetails.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No projects found</Text>
                <TouchableOpacity onPress={refetch} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredPropertyDetails}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={renderPropertyDetail}
                showsVerticalScrollIndicator={false}
              />
            )
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
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? hp('3%') : 0,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === "android" ? hp('3%') : 0,
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('1.2%'),
    paddingTop: hp('2.5%'),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp('5%'),
    marginBottom: hp('2.5%'),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: wp('8%'),
    fontFamily: "PlusSB",
    color: "#333",
  },
  headerSubTitle: {
    fontSize: wp('8%'),
    fontFamily: "PlusSB",
    color: "#5aaf57",
  },
  headerDesc: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusL",
    color: "#666",
    marginTop: hp('0.6%'),
  },
  lottie: {
    width: wp('22%'),
    height: wp('22%'),
    marginTop: -hp('5%'),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: wp('5%'),
    borderRadius: wp('2.5%'),
    paddingHorizontal: wp('3%'),
    marginVertical: hp('1.2%'),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchBar: {
    flex: 1,
    height: hp('5.5%'),
    fontSize: wp('4%'),
    fontFamily: "PlusL",
    color: "#004d40",
    paddingLeft: wp('2%'),
  },
  searchIcon: {
    marginRight: wp('1.5%'),
  },
  list: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp('4%'),
    backgroundColor: "#03471aff",
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('1.5%'),
    elevation: 8,
  },
  propertyInfoWrapper: {
    flex: 1,
    paddingRight: wp('2.5%'),
  },
  nameBuilderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp('1%'),
  },
  projectName: {
    fontSize: wp('4.2%'),
    fontFamily: "PlusSB",
    color: "#fff",
    flex: 1,
  },
  builderName: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusL",
    color: "#e0e0e0",
    marginLeft: wp('2%'),
  },
  dateRow: {
    marginBottom: hp('1.2%'),
  },
  dateText: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusR",
    color: "#f0f0f0",
  },
  badgeRow: {
    flexDirection: "row",
    marginRight: wp('2%'),
  },
  statusBadge: {
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('5%'),
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('1%'),
    elevation: 5,
  },
  badgeText: {
    fontSize: wp('2.8%'),
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
    padding: wp('3.5%'),
    borderRadius: wp('2%'),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
    paddingTop: hp('1.2%'),
    alignItems: "center",
    elevation: 10,
  },
  modalHandle: {
    width: wp('13%'),
    height: hp('0.7%'),
    backgroundColor: "#ccc",
    borderRadius: wp('1.5%'),
    marginBottom: hp('1.8%'),
  },
  actionOptionsContainer: {
    width: "100%",
  },
  modalTitle: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    marginBottom: hp('1.8%'),
    color: "#064226ff",
    textAlign: "center",
  },
  actionOptionBtn: {
    padding: wp('4%'),
    backgroundColor: "#033b01ff",
    borderRadius: wp('5%'),
    marginBottom: hp('1.2%'),
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.12%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('0.5%'),
    elevation: 2,
  },
  actionOptionText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp('5%'),
  },
  loadingLottie: {
    width: wp('38%'),
    height: wp('38%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    fontFamily: "PlusR",
    color: "#666",
    marginTop: hp('1.2%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp('5%'),
  },
  emptyText: {
    fontSize: wp('4%'),
    fontFamily: "PlusR",
    color: "#666",
    marginBottom: hp('2.5%'),
  },
  retryButton: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    backgroundColor: "#5aaf57",
    borderRadius: wp('2%'),
  },
  retryText: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusSB",
    color: "#fff",
  },
});

export default ManagePropertyDetail;
