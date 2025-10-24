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
  Alert,
  KeyboardAvoidingView,
  ScrollView, // Essential for ensuring content is scrollable
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";

const dummyRealtors = [
  {
    id: "R001",
    logo: "https://thumbs.dreamstime.com/b/portrait-handsome-smiling-young-man-folded-arms-smiling-joyful-cheerful-men-crossed-hands-isolated-studio-shot-172869765.jpg",
    name: "Alpha Realty Group",
    userCode: "ARG1001",
    businessNature: ["Residential", "Commercial"],
    headOffice: "700 Market St, Suite 100, City A",
    email: "contact@alpharealty.com",
    mobileNo: "+1-555-123-4567",
    description: "A leading full-service real estate firm.",
    hasAddress: true, 
  },
  {
    id: "R002",
    logo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?cs=srgb&dl=pexels-italo-melo-881954-2379004.jpg&fm=jpg",
    name: "Coastal Homes Inc.",
    userCode: "CHI2002",
    businessNature: ["Luxury Residential", "Builder"],
    headOffice: "15 Palm Ave, Beachside",
    email: "info@coastalhomes.net",
    mobileNo: "+1-555-987-6543",
    description: "Specializing in premium coastal properties.",
    hasAddress: true,
  },
  {
    id: "R003",
    logo: "https://img.freepik.com/free-photo/designer-working-3d-model_23-2149371896.jpg?semt=ais_hybrid&w=740&q=80",
    name: "Metro Commercial Partners",
    userCode: "MCP3003",
    businessNature: ["Commercial"],
    headOffice: "99 Business Loop, Metropolis",
    email: "deals@metropartners.biz",
    mobileNo: "+1-555-111-2222",
    description: "Your partner for large-scale commercial leasing.",
    hasAddress: false,
  },
];

const BUSINESS_NATURE_OPTIONS = [
  "Builder",
  "Channels Partner Updated",
  "Dealer",
  "Aujla",
  "Residential",
  "Commercial",
  "Luxury Residential",
];
const ManageRealtors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [realtors, setRealtors] = useState(dummyRealtors);
  const [selectedRealtor, setSelectedRealtor] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [businessNatureModalVisible, setBusinessNatureModalVisible] = useState(false);
  
  const navigation = useNavigation();
  const router = useRouter();

  // State for the form data in the update modal
  const [formName, setFormName] = useState('');
  const [formMobileNo, setFormMobileNo] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOffice, setFormOffice] = useState('');
  const [formBusinessNature, setFormBusinessNature] = useState([]);
  const [formHasAddress, setFormHasAddress] = useState(false);

  useEffect(() => {
    if (selectedRealtor) {
      setFormName(selectedRealtor.name || '');
      setFormMobileNo(selectedRealtor.mobileNo || '');
      setFormEmail(selectedRealtor.email || '');
      setFormLogo(selectedRealtor.logo || '');
      setFormDescription(selectedRealtor.description || '');
      setFormOffice(selectedRealtor.headOffice || '');
      setFormBusinessNature(selectedRealtor.businessNature || []); 
      setFormHasAddress(selectedRealtor.hasAddress || false);
    }
  }, [selectedRealtor]);

  const handleUpdatePress = (realtor) => {
    setSelectedRealtor(realtor);
    setUpdateModalVisible(true);
  };
  
  const handleCloseUpdateModal = () => {
      setUpdateModalVisible(false);
      setSelectedRealtor(null);
  };

  const handleDeletePress = (realtor) => {
    setSelectedRealtor(realtor);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    setRealtors(realtors.filter((r) => r.id !== selectedRealtor.id));
    setDeleteModalVisible(false);
    setSelectedRealtor(null);
    Alert.alert("Deleted!", `${selectedRealtor.name} has been removed.`);
  };

  const handleUpdateSubmit = () => {
    if (!formName || formBusinessNature.length === 0 || !formMobileNo || formHasAddress === undefined) {
      Alert.alert("Missing Fields", "Name, Business Nature, Mobile No, and 'Add Address' are required.");
      return;
    }

    const updatedRealtors = realtors.map(r =>
      r.id === selectedRealtor.id ? { 
        ...r, 
        name: formName, 
        headOffice: formOffice, 
        mobileNo: formMobileNo, 
        email: formEmail,
        logo: formLogo,
        description: formDescription,
        businessNature: formBusinessNature,
        hasAddress: formHasAddress,
      } : r
    );
    setRealtors(updatedRealtors);
    handleCloseUpdateModal();
    Alert.alert("Updated!", `${formName} details have been saved.`);
  };

  const filteredRealtors = realtors.filter((realtor) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseName = realtor.name?.toLowerCase() || "";
    const lowerCaseCode = realtor.userCode?.toLowerCase() || "";
    return (
      lowerCaseName.includes(lowerCaseQuery) ||
      lowerCaseCode.includes(lowerCaseQuery)
    );
  });
  
  const toggleBusinessNature = (nature) => {
    setFormBusinessNature(prevNatures => {
      if (prevNatures.includes(nature)) {
        return prevNatures.filter(n => n !== nature);
      } else {
        return [...prevNatures, nature];
      }
    });
  };

  // --- Render Item for FlatList (Unchanged) ---
  const renderRealtor = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.cardHeader}>
        {/* ... (content) ... */}
        <View style={styles.snContainer}>
          <Text style={styles.snText}>{index + 1}</Text>
        </View>
        <Image source={{ uri: item.logo }} style={styles.cardAvatar} />
        <View style={styles.cardTitleWrapper}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardCode} numberOfLines={1}>
            User Code: {item.userCode}
          </Text>
        </View>
        <View style={styles.actionIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleUpdatePress(item)}
          >
            <Feather name="edit-3" size={18} color="#004d40" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDeletePress(item)}
          >
            <Feather name="x-circle" size={18} color="#c62828" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
            <MaterialCommunityIcons name="office-building" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
                {item.headOffice}
            </Text>
        </View>
        <View style={styles.detailRow}>
            <Feather name="briefcase" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
                {item.businessNature.join(", ")}
            </Text>
        </View>
        <View style={styles.detailRow}>
            <MaterialCommunityIcons name="email-outline" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
                {item.email}
            </Text>
        </View>
        <View style={styles.detailRow}>
            <Feather name="phone" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
                {item.mobileNo}
            </Text>
        </View>
      </View>
    </View>
  );

 // --- Render Business Nature Selection Modal ---
  const renderBusinessNatureModal = () => (
    <Modal
      visible={businessNatureModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setBusinessNatureModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setBusinessNatureModalVisible(false)}>
        <View style={styles.centeredModalBackground}>
          <View style={styles.selectionModalCard}>
            <Text style={styles.modalTitleCompact}>Select Business Nature *</Text>
            
            <FlatList
              data={BUSINESS_NATURE_OPTIONS}
              keyExtractor={item => item}
              numColumns={2}
              style={styles.businessNatureList}
              contentContainerStyle={styles.businessNatureListContent}
              renderItem={({ item }) => {
                const isSelected = formBusinessNature.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.selectOption, isSelected && styles.selectOptionSelected]}
                    onPress={() => toggleBusinessNature(item)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox-outline" : "square-outline"} 
                      size={18} 
                      color={isSelected ? "#fff" : "#004d40"} 
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.selectOptionText, isSelected && styles.selectOptionTextSelected]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            
            <Text style={styles.selectionCount}>
              {formBusinessNature.length} selected
            </Text>

            <TouchableOpacity
              style={[styles.modalBtnCompact, styles.modalBtnPrimary, { marginTop: 10 }]}
              onPress={() => setBusinessNatureModalVisible(false)}
            >
              <Text style={styles.modalBtnTextCompact}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );


  const renderUpdateModalContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.updateModalContent}
    >
        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
             <Text style={styles.modalTitleCompact}>Update Realtor Profile</Text>
            <Text style={styles.modalSubTitleCompact}>Editing: **{selectedRealtor?.name}**</Text>
            
            <View style={styles.sectionContainerCompact}>
                <Text style={styles.sectionTitleCompact}>Basic Information</Text>

                {/* Name */}
                <Text style={styles.inputLabelCompact}>Name *</Text>
                <View style={styles.inputWithIconCompact}>
                    <Feather name="user" size={18} color="#004d4080" style={styles.inputIcon} />
                    <TextInput
                        style={styles.modalTextInputCompact}
                        placeholder="Realtor Name"
                        value={formName}
                        onChangeText={setFormName}
                        placeholderTextColor="#aaa"
                    />
                </View>

                {/* Business Nature Multi-Select */}
                <Text style={styles.inputLabelCompact}>Business Nature *</Text>
                <TouchableOpacity 
                    style={styles.selectInputCompact}
                    onPress={() => setBusinessNatureModalVisible(true)}
                >
                    <Feather name="briefcase" size={18} color="#004d4080" style={styles.inputIcon} />
                    <Text style={styles.selectInputTextCompact} numberOfLines={1}>
                        {formBusinessNature.length > 0 
                        ? formBusinessNature.join(', ') 
                        : 'Select Business Nature'}
                    </Text>
                    <Feather name="chevron-down" size={18} color="#004d40" />
                </TouchableOpacity>
                <Text style={styles.selectionCountSmallCompact}>
                    {formBusinessNature.length} selected
                </Text>
            </View>

            <View style={styles.sectionContainerCompact}>
                <Text style={styles.sectionTitleCompact}>Contact Information</Text>
                
                {/* Mobile No */}
                <Text style={styles.inputLabelCompact}>Mobile No *</Text>
                <View style={styles.inputWithIconCompact}>
                    <Feather name="phone" size={18} color="#004d4080" style={styles.inputIcon} />
                    <TextInput
                        style={styles.modalTextInputCompact}
                        placeholder="Mobile Number"
                        value={formMobileNo}
                        onChangeText={setFormMobileNo}
                        keyboardType="phone-pad"
                        placeholderTextColor="#aaa"
                    />
                </View>

                {/* Email */}
                <Text style={styles.inputLabelCompact}>Email</Text>
                <View style={styles.inputWithIconCompact}>
                    <MaterialCommunityIcons name="email-outline" size={18} color="#004d4080" style={styles.inputIcon} />
                    <TextInput
                        style={styles.modalTextInputCompact}
                        placeholder="Email Address"
                        value={formEmail}
                        onChangeText={setFormEmail}
                        keyboardType="email-address"
                        placeholderTextColor="#aaa"
                    />
                </View>
            </View>
            <View style={styles.sectionContainerCompact}>
                <Text style={styles.sectionTitleCompact}>Branding & Description</Text>
                
                {/* Logo URL */}
                <Text style={styles.inputLabelCompact}>Logo URL</Text>
                <View style={styles.inputWithIconCompact}>
                    <Ionicons name="image-outline" size={18} color="#004d4080" style={styles.inputIcon} />
                    <TextInput
                        style={styles.modalTextInputCompact}
                        placeholder="Image URL for Logo"
                        value={formLogo}
                        onChangeText={setFormLogo}
                        placeholderTextColor="#aaa"
                    />
                </View>
                {formLogo ? (
                    <Image source={{ uri: formLogo }} style={styles.logoPreviewCompact} />
                ) : (
                    <Text style={styles.logoPlaceholderCompact}>No Logo URL provided</Text>
                )}

                {/* Description */}
                <Text style={styles.inputLabelCompact}>Description</Text>
                <TextInput
                    style={styles.modalTextInputAreaCompact}
                    placeholder="Realtor Description"
                    value={formDescription}
                    onChangeText={setFormDescription}
                    multiline
                    numberOfLines={2}
                    placeholderTextColor="#aaa"
                />
            </View>
            
            <View style={styles.sectionContainerCompact}>
                <Text style={styles.sectionTitleCompact}>Address Settings</Text>

                {/* Add Address Toggle */}
                <Text style={styles.inputLabelCompact}>Add Address ? *</Text>
                <View style={styles.toggleRowCompact}>
                    <TouchableOpacity 
                        style={[styles.toggleBtnCompact, formHasAddress && styles.toggleBtnActiveCompact]}
                        onPress={() => setFormHasAddress(true)}
                    >
                        <Text style={[styles.toggleTextCompact, formHasAddress && styles.toggleTextActiveCompact]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleBtnCompact, !formHasAddress && styles.toggleBtnActiveCompact]}
                        onPress={() => setFormHasAddress(false)}
                    >
                        <Text style={[styles.toggleTextCompact, !formHasAddress && styles.toggleTextActiveCompact]}>No</Text>
                    </TouchableOpacity>
                </View>
                
                {formHasAddress && (
                    <>
                        <Text style={styles.inputLabelCompact}>Head Office Address</Text>
                        <View style={styles.inputWithIconCompact}>
                            <MaterialCommunityIcons name="office-building" size={18} color="#004d4080" style={styles.inputIcon} />
                            <TextInput
                                style={styles.modalTextInputCompact}
                                placeholder="Head Office Address"
                                value={formOffice}
                                onChangeText={setFormOffice}
                                placeholderTextColor="#aaa"
                            />
                        </View>
                    </>
                )}
            </View>
            
            <View style={styles.modalButtonRowCompact}>
                <TouchableOpacity
                    style={[styles.modalBtnCompact, styles.modalBtnPrimary]}
                    onPress={handleUpdateSubmit}
                >
                    <Text style={styles.modalBtnTextCompact}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalBtnCompact, styles.modalBtnSecondary]}
                    onPress={handleCloseUpdateModal}
                >
                    <Text style={styles.modalBtnSecondaryTextCompact}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );

  // --- Render Delete Modal Content (Unchanged size) ---
  const renderDeleteModalContent = () => (
    <View style={styles.deleteModalContent}>
      <Ionicons name="warning-sharp" size={60} color="#c62828" />
      <Text style={styles.deleteModalTitle}>Delete Realtor?</Text>
      {selectedRealtor && (
        <>
          <Text style={styles.deleteModalMessage}>
            You are about to permanently delete{" "}
            <Text style={styles.deleteModalHighlight}>{selectedRealtor.name}</Text>. 
            This action cannot be undone.
          </Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnDelete]}
              onPress={confirmDelete}
            >
              <Text style={styles.modalBtnText}>Yes, Delete It</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnSecondary]}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Keep Realtor</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ... (Main screen content) ... */}
      
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={26} color="#004d40" />
        </TouchableOpacity>
      </View>
      
      {/* Title Section */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Realtor</Text>
          <Text style={styles.headerSubTitle}>Management</Text>
          <Text style={styles.headerDesc}>
            Search by Name or User Code.
          </Text>
        </View>
        <LottieView
          source={require("../../../../assets/svg/EMP.json")} 
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color="#004d40"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a realtor..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery?.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AntDesign name="closecircle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Realtor List */}
      <FlatList
        data={filteredRealtors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderRealtor}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <MaterialCommunityIcons name="account-group-outline" size={50} color="#aaa" />
            <Text style={styles.emptyListText}>No realtors found.</Text>
          </View>
        )}
      />


      {/* --- Update Modal --- */}
      <Modal
        visible={updateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseUpdateModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseUpdateModal}>
          <View style={styles.centeredModalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCardCompact}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={handleCloseUpdateModal}
                >
                    <Ionicons name="close" size={20} color="#555" />
                </TouchableOpacity>

                {renderUpdateModalContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View style={styles.centeredModalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.deleteModalCard}>
                {renderDeleteModalContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {renderBusinessNatureModal()}

      {/* Floating Add Button (FAB) */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/(drawer)/InventoryManagement/Builder/AddBuilder")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- General Styles (Kept for overall look) ---
  container: { flex: 1, backgroundColor: "#f0f4f7" },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 30 : 20, paddingBottom: 5 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: "#004d40" },
  headerSubTitle: { fontSize: 28, fontWeight: '800', color: "#333", marginTop: -5 },
  headerDesc: { fontSize: 14, color: "#666", marginTop: 5 },
  lottie: { width: 100, height: 100, marginTop: -30 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, borderRadius: 15, paddingHorizontal: 15, marginVertical: 15, shadowOpacity: 0.1, elevation: 5, borderWidth: 1, borderColor: '#eee' },
  searchBar: { flex: 1, height: 50, fontSize: 16, color: "#333", paddingLeft: 10 },
  searchIcon: { marginRight: 8 },
  list: { paddingHorizontal: 20, paddingVertical: 10 },
  itemCard: { backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: 20, padding: 15, marginBottom: 15, shadowOpacity: 0.15, elevation: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 },
  snContainer: { width: 25, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: '#004d40', borderRadius: 5, height: 25 },
  snText: { fontSize: 14, fontWeight: 'bold', color: "#fff" },
  cardAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: "#fff", borderWidth: 2, borderColor: '#004d4050' },
  cardTitleWrapper: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: "#004d40" },
  cardCode: { fontSize: 13, fontWeight: '600', color: "#444", marginTop: 2 },
  actionIcons: { flexDirection: "column", alignItems: "center" },
  iconBtn: { padding: 5, borderRadius: 5, marginBottom: 5, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  cardDetails: { paddingHorizontal: 5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  detailText: { fontSize: 13, color: '#333', marginLeft: 8 },
  emptyList: { alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: '#fff', borderRadius: 15 },
  emptyListText: { fontSize: 18, color: '#aaa', marginTop: 10, fontWeight: '600' },
  fab: { position: 'absolute', width: 65, height: 65, alignItems: 'center', justifyContent: 'center', right: 30, bottom: 30, backgroundColor: '#004d40', borderRadius: 35, elevation: 10, shadowOpacity: 0.5, shadowRadius: 10 },

  // --- MODAL OVERLAY STYLES ---
  centeredModalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  
  modalCardCompact: {
    width: "90%",
    maxHeight: Dimensions.get('window').height * 0.9, 
    backgroundColor: "#fff",
    borderRadius: 20, 
    padding: 10,
    paddingTop: 45,
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  updateModalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitleCompact: {
    fontSize: 20, // Smaller title
    fontWeight: 'bold',
    marginBottom: 5,
    color: "#004d40",
  },
  modalSubTitleCompact: {
    fontSize: 14, // Smaller subtitle
    color: "#888",
    marginBottom: 15, // Reduced margin
    fontWeight: '600',
  },
  
  // Section Grouping
  sectionContainerCompact: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10, 
    borderLeftWidth: 2, 
    borderLeftColor: '#004d40',
  },
  sectionTitleCompact: {
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 5, 
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  
  // Input Fields
  inputLabelCompact: {
    width: '100%',
    textAlign: 'left',
    fontSize: 13, // Smaller label
    fontWeight: '600',
    color: '#333',
    marginBottom: 3, // Reduced margin
    marginTop: 8, // Reduced margin
  },
  inputWithIconCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 5,
    height: 40,
  },
  inputIcon: {
    marginLeft: 10,
  },
  modalTextInputCompact: {
    flex: 1,
    paddingVertical: 8, 
    paddingRight: 10,
    fontSize: 14, 
    color: '#333',
    height: '100%',
  },
  modalTextInputAreaCompact: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#333',
    minHeight: 80, 
    textAlignVertical: 'top',
  },
  
  selectInputCompact: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingRight: 10,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 40,
  },
  selectInputTextCompact: {
    flex: 1,
    fontSize: 14, 
    color: '#333',
    marginLeft: 5,
  },
  selectionCountSmallCompact: {
    width: '100%',
    textAlign: 'right',
    fontSize: 11, 
    color: '#004d40',
    marginBottom: 5,
  },
  
  // Logo Preview
  logoPreviewCompact: {
    width: 50, 
    height: 50,
    borderRadius: 25,
    marginVertical: 5,
    borderWidth: 2,
    borderColor: '#004d40',
  },
  logoPlaceholderCompact: {
    fontSize: 10,
    color: '#999',
    marginBottom: 5,
    marginTop: -3,
  },
  
  toggleRowCompact: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10, 
    marginTop: 5,
  },
  toggleBtnCompact: {
    flex: 1,
    padding: 8, 
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleBtnActiveCompact: {
    backgroundColor: '#004d40',
    borderColor: '#004d40',
  },
  toggleTextCompact: {
    fontSize: 14, // Smaller toggle text
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActiveCompact: {
    color: '#fff',
  },

  // Modal Buttons
  modalButtonRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15, // Reduced margin
  },
  modalBtnCompact: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10, 
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
  },
  modalBtnPrimary: { backgroundColor: '#004d40' },
  modalBtnSecondary: { backgroundColor: '#e0e0e0' },
  modalBtnSecondaryTextCompact: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  modalBtnTextCompact: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  selectionModalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8, 
    margin: 4,  
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004d4050',
    backgroundColor: '#f5f7fa',
    width: '46%',
  },
  selectOptionSelected: { backgroundColor: '#004d40', borderColor: '#004d40' },
  selectOptionText: { fontSize: 12, color: '#333', fontWeight: '500' },
  selectOptionTextSelected: { color: '#fff' },
  selectionCount: { fontSize: 14, fontWeight: 'bold', color: '#004d40', marginTop: 10 },

  deleteModalCard: { width: "85%", backgroundColor: "#fff", borderRadius: 25, padding: 30, alignItems: "center", shadowOpacity: 0.5, shadowRadius: 15, elevation: 20 },
  deleteModalContent: { width: '100%', alignItems: 'center' },
  deleteModalTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: "#c62828" },
  deleteModalMessage: { fontSize: 15, color: "#555", textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  deleteModalHighlight: { fontWeight: 'bold', color: "#333" },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, elevation: 3 },
  modalBtnDelete: { backgroundColor: '#c62828' },
  modalBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  modalBtnSecondaryText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});

export default ManageRealtors;