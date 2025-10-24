import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";

// Enable animation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- SIMULATED MULTI-PROPERTY DATA ---
const ALL_PROPERTIES = [
  {
    id: "P001",
    builderName: "Skyline Builders",
    projectName: "Sky Heights Residency: A Project with a Very Long Name to Test Congestion", // Long title to test wrapping
    startDate: "2023-01-15",
    completionDate: "2025-08-30",
    possessionStatus: "Under Construction",
    reraApproved: true,
    description: "Sky Heights Residency redefines urban living with spacious 2 & 3 BHK apartments, panoramic city views, and modern lifestyle amenities. The project emphasizes sustainability and green design while offering excellent connectivity to schools, malls, and major business hubs.",
  },
  {
    id: "P002",
    builderName: "Prestige Group",
    projectName: "Prestige Greenwoods",
    startDate: "2020-05-10",
    completionDate: "2022-12-01",
    possessionStatus: "Ready to Move",
    reraApproved: true,
    description: "A collection of luxury villas set amidst lush greenery, offering a serene escape within the city. Features include a private pool, clubhouse access, and 24/7 security. This project is highly sought after and fully sold out.",
  },
  {
    id: "P003",
    builderName: "DLF Limited",
    projectName: "DLF Corporate Park",
    startDate: "2024-03-01",
    completionDate: "2026-11-20",
    possessionStatus: "Delayed",
    reraApproved: false,
    description: "Premium commercial spaces designed for large enterprises. Features customizable layouts and high-speed infrastructure. Currently facing minor zoning delays due to municipal clearances.",
  },
];
// --- END SIMULATED DATA ---

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Ready to Move":
      return { color: "#4CAF50", background: "#E6F4E6" }; 
    case "Under Construction":
      return { color: "#FFA726", background: "#FFF8E6" }; 
    case "Delayed":
      return { color: "#E53935", background: "#FFEBEE" }; 
    default:
      return { color: "#9E9E9E", background: "#F5F5F5" }; 
  }
};

// --- PROPERTY DETAILS MODAL (BOTTOM DRAWER) ---
const PropertyDetailsModal = ({ visible, onClose, property }) => {
    if (!property) return null;

    const status = getStatusStyle(property.possessionStatus);
    
    const DetailRow = ({ label, value, icon, valueStyle }) => (
        <View style={modalStyles.detailRow}>
            <Feather name={icon} size={16} color="#555" style={{width: 25}} />
            <Text style={modalStyles.detailLabel}>{label}</Text>
            <Text style={[modalStyles.detailValue, valueStyle]}>{value}</Text>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={modalStyles.modalOverlay} 
                activeOpacity={1} 
                onPress={onClose} 
            >
                <View style={modalStyles.modalContent}>
                    <View style={modalStyles.handleBar} />

                    <ScrollView showsVerticalScrollIndicator={false}>
                        
                        {/* HEADER */}
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.modalTitle}>{property.projectName}</Text>
                            <View style={[modalStyles.statusPill, { backgroundColor: status.background, borderColor: status.color }]}>
                                <Text style={[modalStyles.statusText, { color: status.color }]}>{property.possessionStatus.toUpperCase()}</Text>
                            </View>
                        </View>
                        <Text style={modalStyles.builderText}>Builder: {property.builderName}</Text>
                        
                        {/* KEY DETAILS */}
                        <View style={modalStyles.detailsContainer}>
                            <DetailRow icon="calendar" label="Start Date" value={formatDate(property.startDate)} />
                            <DetailRow icon="clock" label="Completion Date" value={formatDate(property.completionDate)} />
                            <DetailRow 
                                icon="shield" 
                                label="RERA Approved" 
                                value={property.reraApproved ? "Yes" : "No"}
                                valueStyle={{ color: property.reraApproved ? "#4CAF50" : "#E53935" }}
                            />
                        </View>

                        {/* FULL DESCRIPTION (Only shown here) */}
                        <View style={modalStyles.descriptionContainer}>
                            <Text style={modalStyles.descriptionTitle}>Full Description</Text>
                            <Text style={modalStyles.descriptionText}>{property.description}</Text>
                        </View>
                        
                        <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
                            <Text style={modalStyles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const PropertyCard = ({ item, navigation, onViewDetails, onEditDetails }) => {
  const status = getStatusStyle(item.possessionStatus);
  
  return (
    <View style={appStyles.card}>
      <View style={cardStyles.cardHeader}>
        <View style={cardStyles.titleContainer}>
          <Text style={cardStyles.cardProjectName} numberOfLines={2}>{item.projectName}</Text>
          <Text style={cardStyles.cardBuilder}>By {item.builderName}</Text>
        </View>
        <View style={[cardStyles.statusPill, { backgroundColor: status.background, borderColor: status.color }]}>
          <Text style={[cardStyles.statusText, { color: status.color }]}>{status.color === "#FFA726" ? "U/C" : status.color === "#4CAF50" ? "RTM" : status.color === "#E53935" ? "DEL" : "N/A"}</Text> 
        </View>
      </View>

      {/* KEY ADMINISTRATIVE DETAILS (FIXED SPACING) */}
      <View style={cardStyles.detailsSection}>
        <View style={cardStyles.twoColumnRow}>
            <View style={cardStyles.twoColumnItem}>
                <Feather name="calendar" size={14} color="#555" />
                <Text style={cardStyles.detailLabelSmall}>Start: <Text style={{fontWeight: '600'}}>{formatDate(item.startDate)}</Text></Text>
            </View>
            <View style={cardStyles.twoColumnItem}>
                <Feather name="clock" size={14} color="#555" />
                <Text style={cardStyles.detailLabelSmall}>End: <Text style={{fontWeight: '600'}}>{formatDate(item.completionDate)}</Text></Text>
            </View>
        </View>
        <View style={cardStyles.reraRow}>
            <Feather name="shield" size={14} color="#555" />
            <Text style={cardStyles.detailLabelSmall}>RERA Approved: 
                <Text style={{fontWeight: '700', color: item.reraApproved ? "#4CAF50" : "#E53935"}}> {item.reraApproved ? "YES" : "NO"}</Text>
            </Text>
        </View>
      </View>
      
      {/* ACTION BAR: Edit Data & View Details */}
      <View style={cardStyles.actionBar}>
        {/* ACTION 1: ADD/EDIT Property Details (Navigates to Edit Page) */}
        <TouchableOpacity style={cardStyles.actionBtnIcon} onPress={() => navigate("/(drawer)/InventoryManagement/Property/ManageSerialize")}>
          <Feather name="edit" size={18} color="#5aaf57" />
          <Text style={cardStyles.iconActionText}>Serialize Data</Text>
        </TouchableOpacity>
        
        {/* ACTION 2: VIEW DETAILS (Opens Bottom Drawer) */}
        <TouchableOpacity style={cardStyles.actionBtnPrimary} onPress={() => onViewDetails(item)}>
          <Text style={cardStyles.actionBtnText}>View Details</Text>
          <Ionicons name="eye-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- MAIN LIST SCREEN COMPONENT ---
export default function PropertyListScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setModalVisible(true);
  };
  
  const handleEditDetails = (property) => {
      // Simulate navigation to a dedicated Edit screen
      console.log(`Navigating to EditScreen for Property ID: ${property.id}`);
      // In a real app, this would be: navigation.navigate('PropertyEditScreen', { propertyId: property.id });
  };

  return (
    <SafeAreaView style={appStyles.safeArea}>
      <View style={appStyles.container}>
        {/* Header - Consistent with BusinessNature */}
        <View style={appStyles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Ionicons name="menu" size={28} color="BLACK" />
            </TouchableOpacity>
            <Text style={appStyles.title}>
              Property <Text style={{ color: '#5aaf57' }}>Records</Text>
            </Text>
        </View>

        <FlatList
          data={ALL_PROPERTIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard 
                item={item} 
                navigation={navigation}
                onViewDetails={handleViewDetails} 
                onEditDetails={handleEditDetails}
            />
          )}
          contentContainerStyle={appStyles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {/* The Bottom Drawer Component */}
      <PropertyDetailsModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
          property={selectedProperty} 
      />
    </SafeAreaView>
  );
}

// --- STYLES (MATCHING BusinessNature) ---
const appStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingTop:20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#333', 
    flex: 1,
    marginLeft: 10,
  },
  addButton: { padding: 4 },
  
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 4, 
    borderLeftColor: '#5aaf57',
  },
  listContainer: {
    paddingVertical: 10,
  }
});

// --- CARD SPECIFIC STYLES ---
const cardStyles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  titleContainer: {
      flex: 1,
      paddingRight: 10,
  },
  cardProjectName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333', 
    marginBottom: 4,
  },
  cardBuilder: { 
    fontSize: 14, 
    color: '#666', 
    fontWeight: '400',
  },
  
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  statusText: { 
    fontWeight: '700',
    fontSize: 10, 
  },

  detailsSection: {
    paddingVertical: 1,
    marginBottom: 1,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    marginBottom: 5,
  },
  twoColumnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '48%',
  },
  reraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabelSmall: { 
    fontSize: 13, 
    color: '#333', 
    fontWeight: '500', 
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtnIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  iconActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5aaf57',
    marginLeft: 4,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5aaf57', 
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 'auto',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});

// --- MODAL SPECIFIC STYLES (No changes needed, they were already spacious) ---
const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 10,
        maxHeight: '80%', 
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: {
        fontWeight: '600',
        fontSize: 12,
    },
    builderText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailsContainer: {
        marginBottom: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: { 
        fontSize: 14, 
        color: '#555', 
        flex: 1.2, 
        marginLeft: 10,
        fontWeight: '500', 
    },
    detailValue: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: '#333', 
        flex: 2, 
        textAlign: 'right' 
    },
    descriptionContainer: {
        paddingVertical: 10,
    },
    descriptionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        textAlign: 'justify',
    },
    closeButton: {
        backgroundColor: '#5aaf57',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30, 
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});