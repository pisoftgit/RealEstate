import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons, Feather, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";
import ManageFilter from "./ManageFilter";
import FillDetailsForm from "./FillDetailsForm";
import PropertyDetailView from "./Propertydetailview";
import PlcForm from "./plcform";

const dummyData = {
  GROUP_BLOCK: [
    { id: "1", tower: "A", floor: "5", flatNumber: "501", flatStructure: "3BHK", area: "1500", status: "Available", addedBy: "Pisoft", date: "2025-05-24" },
    { id: "2", tower: "B", floor: "3", flatNumber: "302", flatStructure: "2BHK", area: "1200", status: "Sold", addedBy: "Pisoft", date: "2025-05-24" },
  ],
  HOUSE_VILLA: [
    { id: "3", tower: "-", floor: "G", flatNumber: "Villa 1", flatStructure: "4BHK", area: "2500", status: "Available", addedBy: "Pisoft", date: "2025-05-24" },
  ],
  PLOT: [
    { id: "4", tower: "-", floor: "-", flatNumber: "Plot 12", flatStructure: "Plot", area: "1800", status: "Available", amenities: 2, facilities: 3, addedBy: "Pisoft", date: "2025-05-24" },
  ],
  COMMERCIAL_PROPERTY_UNIT: [
    { id: "5", tower: "C", floor: "1", flatNumber: "101", flatStructure: "Shop", area: "900", status: "Available", addedBy: "Pisoft", date: "2025-05-24" },
  ],
};

const statusColors = {
  Available: { bg: "#185e2a", text: "#fff" },
  Sold: { bg: "#d32f2f", text: "#fff" },
};

const PropertyDetailPage = ({ type, onBack, data, loading }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({});
  const [fillDetailsVisible, setFillDetailsVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Store item being edited
  const [editLoading, setEditLoading] = useState(false); // Loading state for edit fetch
  const [viewVisible, setViewVisible] = useState(false); // View modal visibility
  const [viewingItem, setViewingItem] = useState(null); // Store item being viewed
  const [plcModalVisible, setPlcModalVisible] = useState(false); // PLC modal visibility
  const [selectedItemForPlc, setSelectedItemForPlc] = useState(null); // Store item for PLC

  // Dummy project name
  const projectName = data && data.length > 0 ? data[0].projectName : "Property Details";

  // Use API data if it's an array. If loading or if data is empty, we show empty list.
  // We only show dummy data if the data prop is explicitly undefined (not yet fetching or dev mode).
  const sourceData = loading ? [] : (Array.isArray(data) ? data : (dummyData[type] || []));

  // Filtered data - supporting both API and dummy data fields
  const filteredData = sourceData.filter(
    (item) =>
      (item.towerName && item.towerName.toLowerCase().includes(search.toLowerCase())) ||
      (item.tower && item.tower.toLowerCase().includes(search.toLowerCase())) ||
      (item.unitNumber && item.unitNumber.toLowerCase().includes(search.toLowerCase())) ||
      (item.flatNumber && item.flatNumber.toLowerCase().includes(search.toLowerCase()))
  );
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(paginatedData.map(item => item.unitId || item.id));
      setSelectAll(true);
    }
  };

  // Handle individual card checkbox
  const handleCardSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(_id => _id !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      if (newSelected.length === paginatedData.length) setSelectAll(true);
    }
  };

  // Handle edit button click - fetch property details with amenities/facilities, then open FillDetailsForm
  const handleEditItem = async (item) => {
    console.log("=== EDIT ITEM CLICKED ===");
    console.log("Item propertyId:", item.propertyId);
    
    // If item already has amenities and facilities, use it directly
    if (item.amenities && item.facilities) {
      console.log("Item already has amenities/facilities, using directly");
      setEditingItem(item);
      setFillDetailsVisible(true);
      return;
    }
    
    // Fetch property details with amenities and facilities
    try {
      setEditLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const projectId = item.projectId;
      const propertyId = item.propertyId;
      const propertyItem = type;
      
      const url = `${API_BASE_URL}/real-estate-properties?projectId=${projectId}&propertyItem=${propertyItem}&propertyId=${propertyId}&needMedia=true&needAmenitiesAndFacilities=true`;
      console.log("Fetching property details from:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          secret_key: secretKey,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch property details");
      }
      
      const result = await response.json();
      console.log("Fetched property details:", JSON.stringify(result, null, 2));
      
      // Get the first item from content array (should be the property we're editing)
      const propertyData = result.content && result.content.length > 0 ? result.content[0] : item;
      
      console.log("Property amenities:", JSON.stringify(propertyData.amenities, null, 2));
      console.log("Property facilities:", JSON.stringify(propertyData.facilities, null, 2));
      console.log("Property media:", JSON.stringify(propertyData.propertyMediaList, null, 2));
      
      setEditingItem(propertyData);
      setFillDetailsVisible(true);
    } catch (error) {
      console.error("Error fetching property details:", error);
      // Fallback to using the item as-is if fetch fails
      setEditingItem(item);
      setFillDetailsVisible(true);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle view button click - open PropertyDetailView with item data
  const handleViewItem = (item) => {
    console.log("=== VIEW ITEM CLICKED ===");
    console.log("Item propertyId:", item.propertyId);
    setViewingItem(item);
    setViewVisible(true);
  };

  // Handle location/PLC button click - open PLC modal
  const handlePlcItem = async (item) => {
    console.log("=== PLC ITEM CLICKED ===");
    console.log("Item:", item);
    
    try {
      setEditLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const projectId = item.projectId;
      const propertyId = item.propertyId;
      const propertyItem = type;
      
      const url = `${API_BASE_URL}/real-estate-properties?projectId=${projectId}&propertyItem=${propertyItem}&propertyId=${propertyId}&needPLC=true`;
      console.log("Fetching PLC details from:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          secret_key: secretKey,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch PLC details");
      }
      
      const result = await response.json();
      console.log("Fetched PLC details:", JSON.stringify(result, null, 2));
      
      const propertyData = result.content && result.content.length > 0 ? result.content[0] : item;
      
      setSelectedItemForPlc(propertyData);
      setPlcModalVisible(true);
    } catch (error) {
      console.error("Error fetching PLC details:", error);
      setSelectedItemForPlc(item);
      setPlcModalVisible(true);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle save PLC data
  const handleSavePlc = (plcData) => {
    console.log("=== SAVING PLC DATA ===");
    console.log("Item:", selectedItemForPlc);
    console.log("PLC Data:", plcData);
    // TODO: Implement API call to save PLC data
    setPlcModalVisible(false);
  };

  // Card renderers for each type
  const renderGroupBlockCard = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity style={styles.cardCheckbox} onPress={() => handleCardSelect(item.unitId || item.id)}>
          {selectedIds.includes(item.unitId || item.id) && <Feather name="check" size={16} color="#fff" />}
        </TouchableOpacity>
        <View style={[styles.cardFieldRow, {flex: 1}]}> 
          <View style={styles.cardHashHighlighted}><Feather name="hash" size={18} color="#fff" style={{marginRight:4}} />
            <Text style={[styles.cardFieldText, {marginLeft:0, fontFamily:"PlusSB", color: '#fff'}]}>{item.unitNumber || '-'}</Text>
          </View>
        </View>
        <View style={[styles.cardBadge, { backgroundColor: statusColors[item.availabilityStatus === "AVAILABLE" ? "Available" : "Sold"]?.bg || '#185e2a' }]}> 
          <Text style={styles.cardBadgeText}>{(item.availabilityStatus || item.status)?.toUpperCase()}</Text> 
        </View>
      </View>
      <View style={styles.cardContentRow}>
        <View style={styles.cardFieldRow}>
          <Feather name="layout" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Structure: {item.flatHouseStructure?.structure || "-"}</Text>
        </View>
        <View style={styles.cardFieldRow}>
          <Feather name="maximize" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Area: {item.area ? `${item.area} sqft` : "-"}</Text>
        </View>
      </View>
      <View style={styles.cardContentRow}>
        <View style={styles.cardFieldRow}>
          <Feather name="compass" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Face Direction: {item.faceDirection?.faceDirection || item.faceDirection?.name || "-"}</Text>
        </View>
        <View style={styles.cardFieldRow}>
          <Feather name="layers" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Total Floors: {item.totalFloors || "-"}</Text>
        </View>
      </View>
      <View style={styles.cardMetaRow}>
        <Text style={styles.cardAddedBy}>Builder: {item.builderName || "-"}</Text>
      </View>
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleEditItem(item)}><Feather name="edit" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleViewItem(item)}><Feather name="eye" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn}><Feather name="trash-2" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handlePlcItem(item)}><Feather name="map-pin" size={18} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );

  const renderPlotCard = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity style={styles.cardCheckbox} onPress={() => handleCardSelect(item.unitId || item.id)}>
          {selectedIds.includes(item.unitId || item.id) && <Feather name="check" size={16} color="#fff" />}
        </TouchableOpacity>
        <View style={[styles.cardFieldRow, {flex: 1}]}> 
          <View style={styles.cardHashHighlighted}><Feather name="hash" size={18} color="#fff" style={{marginRight:4}} />
            <Text style={[styles.cardFieldText, {marginLeft:0, fontFamily:"PlusSB", color: '#fff'}]}>{item.unitNumber || '-'}</Text>
          </View>
        </View>
        <View style={[styles.cardBadge, { backgroundColor: statusColors[item.availabilityStatus === "AVAILABLE" ? "Available" : "Sold"]?.bg || '#185e2a' }]}>
          <Text style={styles.cardBadgeText}>{(item.availabilityStatus || item.status)?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardContentRow}>
        <View style={styles.cardFieldRow}>
          <Feather name="maximize" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Area: {item.area ? `${item.area} ${item.areaUnit?.unitName || ''}` : '-'}</Text>
        </View>
        <View style={styles.cardFieldRow}>
          <Feather name="tool" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Type: {item.subPropertyType?.realEstatePropertyType?.name || '-'}</Text>
        </View>
      </View>
      <View style={styles.cardMetaRow}>
        <Text style={styles.cardAddedBy}>Builder: {item.builderName || '-'}</Text>
        <Text style={styles.cardAddedBy}>{item.subPropertyType?.name || '-'}</Text>
      </View>
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleEditItem(item)}><Feather name="edit" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleViewItem(item)}><Feather name="eye" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn}><Feather name="trash-2" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handlePlcItem(item)}><Feather name="map-pin" size={18} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );

  const renderHouseVillaCard = (item) => (
    <View style={styles.card}>
      <View style={[styles.cardHeaderRow, { justifyContent: 'space-between', alignItems: 'center' }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.cardCheckbox} onPress={() => handleCardSelect(item.unitId || item.id)}>
            {selectedIds.includes(item.unitId || item.id) && <Feather name="check" size={16} color="#fff" />}
          </TouchableOpacity>
          <View style={styles.cardHashHighlighted}>
            <Feather name="hash" size={18} color="#fff" style={{marginRight:4}} />
            <Text style={[styles.cardFieldText, {marginLeft:0, fontFamily:"PlusSB", color: '#fff'}]}>{item.unitNumber || "-"}</Text>
          </View>
        </View>
        <View style={[styles.cardBadge, { backgroundColor: statusColors[item.availabilityStatus === "AVAILABLE" ? "Available" : "Sold"]?.bg || '#185e2a' }]}> 
          <Text style={styles.cardBadgeText}>{(item.availabilityStatus || item.status)?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardContentRow}>
        <View style={styles.cardFieldRow}>
          <Feather name="layout" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Structure: {item.flatHouseStructure?.structure || "-"}</Text>
        </View>
        <View style={styles.cardFieldRow}>
          <Feather name="maximize" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Area: {item.area ? `${item.area} sqft` : "-"}</Text>
        </View>
      </View>
      <View style={styles.cardMetaRow}>
        <Text style={styles.cardAddedBy}>Builder: {item.builderName || "-"}</Text>
      </View>
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleEditItem(item)}><Feather name="edit" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleViewItem(item)}><Feather name="eye" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn}><Feather name="trash-2" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handlePlcItem(item)}><Feather name="map-pin" size={18} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );

  const renderCommercialUnitCard = (item) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <TouchableOpacity style={styles.cardCheckbox} onPress={() => handleCardSelect(item.unitId || item.id)}>
          {selectedIds.includes(item.unitId || item.id) && <Feather name="check" size={16} color="#fff" />}
        </TouchableOpacity>
        <View style={[styles.cardFieldRow, {flex: 1}]}> 
          <View style={styles.cardHashHighlighted}><Feather name="hash" size={18} color="#fff" style={{marginRight:4}} />
            <Text style={[styles.cardFieldText, {marginLeft:0, fontFamily:"PlusSB", color: '#fff'}]}>{item.unitNumber || '-'}</Text>
          </View>
        </View>
        <View style={[styles.cardBadge, { backgroundColor: statusColors[item.availabilityStatus === "AVAILABLE" ? "Available" : "Sold"]?.bg || '#185e2a' }]}>
          <Text style={styles.cardBadgeText}>{(item.availabilityStatus || item.status)?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardContentRow}>
        <View style={styles.cardFieldRow}>
          <Feather name="maximize" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Area: {item.area ? `${item.area} ${item.areaUnit?.unitName || ''}` : '-'}</Text>
        </View>
        <View style={styles.cardFieldRow}>
          <Feather name="tool" size={16} color="#fff" style={{marginRight:4}} />
          <Text style={styles.cardFieldText}>Type: {item.subPropertyType?.realEstatePropertyType?.name || '-'}</Text>
        </View>
      </View>
      <View style={styles.cardMetaRow}>
        <Text style={styles.cardAddedBy}>Builder: {item.builderName || '-'}</Text>
        <Text style={styles.cardAddedBy}>{item.subPropertyType?.name || '-'}</Text>
      </View>
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleEditItem(item)}><Feather name="edit" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleViewItem(item)}><Feather name="eye" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn}><Feather name="trash-2" size={18} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.cardActionBtn} onPress={() => handlePlcItem(item)}><Feather name="map-pin" size={18} color="#fff" /></TouchableOpacity>
      </View>
    </View>
  );

  const renderCard = (item) => {
    if (type === "GROUP_BLOCK") return renderGroupBlockCard(item);
    if (type === "PLOT") return renderPlotCard(item);
    if (type === "HOUSE_VILLA") return renderHouseVillaCard(item);
    if (type === "COMMERCIAL_PROPERTY_UNIT") return renderCommercialUnitCard(item);
    // fallback for other types
    return renderGroupBlockCard(item);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{projectName}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setFilterVisible(true)}>
          <Feather name="filter" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search & Pagination */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Tower or Flat Number..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}> <AntDesign name="closecircle" size={16} color="#999" /> </TouchableOpacity>
          )}
        </View>
        <View style={styles.paginationBox}>
          <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)}>
            <AntDesign name="left" size={18} color={page === 1 ? "#ccc" : "#333"} />
          </TouchableOpacity>
          <Text style={styles.pageText}>{page} / {totalPages}</Text>
          <TouchableOpacity disabled={page === totalPages} onPress={() => setPage(page + 1)}>
            <AntDesign name="right" size={18} color={page === totalPages ? "#ccc" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Buttons below search bar */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.selectAllCheckbox} onPress={handleSelectAll}>
          <View style={[styles.selectAllBox, selectAll && styles.selectAllBoxChecked]}>
            {selectAll && <Feather name="check" size={16} color="#fff" />}
          </View>
          <Text style={{fontFamily:"PlusSB"}}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.fillDetailBtn, selectedIds.length === 0 && styles.fillDetailBtnDisabled]} 
          onPress={() => setFillDetailsVisible(true)}
          disabled={selectedIds.length === 0}
        >
          <Feather name="edit-2" size={18} color="#fff" style={{marginRight:6}} />
          <Text style={styles.actionBtnText}>Fill Detail</Text>
        </TouchableOpacity>
      </View>

      {/* Card List UI */}
      <FlatList
        data={paginatedData}
        keyExtractor={(item) => (item.unitId ? String(item.unitId) : item.id ? String(item.id) : Math.random().toString())}
        ListEmptyComponent={<Text style={styles.emptyText}>No data found.</Text>}
        renderItem={({ item }) => renderCard(item)}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      {/* Filter Drawer */}
      <ManageFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        propertyType={type}
        onApply={() => setFilterVisible(false)}
        filters={filters}
        setFilters={setFilters}
        projectId={sourceData[0]?.projectId}
      />
      {/* Fill Details Drawer */}
      <FillDetailsForm
        visible={fillDetailsVisible}
        onClose={() => {
          setFillDetailsVisible(false);
          setEditingItem(null);
        }}
        selectedCount={editingItem ? 1 : selectedIds.length}
        onSave={(data) => {
          console.log("Fill Details Saved:", data);
          setFillDetailsVisible(false);
          setEditingItem(null);
        }}
        propertyType={type}
        initialData={editingItem}
      />
      {/* Property Detail View Modal */}
      <PropertyDetailView
        visible={viewVisible}
        onClose={() => {
          setViewVisible(false);
          setViewingItem(null);
        }}
        item={viewingItem}
        propertyType={type}
      />
      {/* PLC Form Modal */}
      <PlcForm
        visible={plcModalVisible}
        onClose={() => {
          setPlcModalVisible(false);
          setSelectedItemForPlc(null);
        }}
        onSave={handleSavePlc}
        initialData={selectedItemForPlc?.plcDetails || null}
      />
      {/* Loading overlay for list or edit fetch */}
      {(editLoading || loading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5aaf57" />
          <Text style={styles.loadingText}>
            {loading ? "Loading properties..." : "Loading property details..."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "PlusR",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f7f7f7",
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 24, color: "#333", fontFamily: "PlusSB" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
    marginLeft: 6,
    fontFamily: "PlusL",
  },
  paginationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  pageText: { marginHorizontal: 8, fontSize: 14, color: "#333", fontFamily: "PlusR" },
  card: {
    backgroundColor: '#0a4d1c',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 7,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a4d1c',
  },
  cardCheckboxBox: {
    width: 13,
    height: 13,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#0a4d1c',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PlusSB',
    flex: 1,
  },
  cardBadge: {
    backgroundColor: '#185e2a',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeText: {
    color: '#fff',
    fontFamily: 'PlusSB',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardHash: {
    backgroundColor: '#19704a',
    borderRadius: 6,
    padding: 2,
    marginLeft: 7,
  },
  cardHashHighlighted: {
    backgroundColor: 'rgba(251, 192, 45, 0.25)', // glassy yellow
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
    // Add glassy effect
    shadowColor: '#fbc02d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // For iOS glassy effect
    // For Android, use opacity
    borderWidth: 1,
    borderColor: 'rgba(251, 192, 45, 0.25)',
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    marginTop: 2,
  },
  cardContentRowColumn: {
    flexDirection: 'column',
    marginBottom: 5,
    marginTop: 2,
  },
  cardContentLeft: {
    flex: 2,
  },
  cardContentRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardFieldText: {
    color: '#fff',
    fontFamily: 'PlusL',
    fontSize: 13,
  },
  cardAddedBy: {
    color: '#fff',
    fontFamily: 'PlusL',
    fontSize: 12,
    marginTop: 1,
    marginBottom: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardDate: {
    color: '#fff',
    fontFamily: 'PlusR',
    fontSize: 12,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  cardActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    backgroundColor: '#185e2a',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20, fontFamily: 'PlusR' },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'PlusR',
    marginHorizontal: 16,
    marginBottom: 6,
    marginTop: -2,
  },
  selectAllCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'flex-start',
  },
  selectAllBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#388e3c',
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAllBoxChecked: {
    backgroundColor: '#388e3c',
    borderColor: '#388e3c',
  },
  fillDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 90,
    maxWidth: 120,
    flexShrink: 1,
    flexGrow: 0,
    marginLeft: 8,
    justifyContent: 'center',
  },
  fillDetailBtnDisabled: {
    backgroundColor: '#b0bec5',
    opacity: 0.7,
  },
  actionBtnText: {
    color: '#fff',
    fontFamily: 'PlusSB',
    fontSize: 13, // reduced from 15
    letterSpacing: 0.2,
  },
});

export default PropertyDetailPage;
