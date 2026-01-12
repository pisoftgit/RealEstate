import React, { useMemo } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useSocietyBlocks } from "../hooks/useRealEstateProperties";

const screenWidth = Dimensions.get("window").width;

const structureOptions = ["1BHK", "2BHK", "3BHK", "4BHK"];
const areaOptions = ["500 sqft", "1000 sqft", "1500 sqft", "2000 sqft"]; // Example
const houseVillaOptions = ["Villa Type 1", "Villa Type 2"];
const plotTypeOptions = ["Residential", "Commercial", "Industrial"];

const ManageFilter = ({ visible, onClose, propertyType, onApply, filters, setFilters, projectId }) => {
  const { blocks, loading: blocksLoading } = useSocietyBlocks(propertyType === "GROUP_BLOCK" ? projectId : null);

  const towerOptions = useMemo(() => {
    if (blocks && Array.isArray(blocks)) {
      return blocks.map(block => block.blockHouseName);
    }
    return ["Tower 1", "Tower 2", "Tower 3"]; // Fallback
  }, [blocks]);

  // Helper to render a simple option list
  const renderOptions = (label, options, filterKey) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionBtn,
              filters[filterKey] === opt && styles.optionBtnSelected,
            ]}
            onPress={() => setFilters({ ...filters, [filterKey]: filters[filterKey] === opt ? undefined : opt })}
          >
            <Text style={[
              styles.optionBtnText,
              filters[filterKey] === opt && styles.optionBtnTextSelected,
            ]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render filter fields based on propertyType
  const renderFilters = () => {
    switch (propertyType) {
      case "GROUP_BLOCK":
        return (
          <>
            {renderOptions("Structure", structureOptions, "structure")}
            {renderOptions("Area", areaOptions, "area")}
            {blocksLoading ? (
               <ActivityIndicator size="small" color="#033b01ff" style={{ marginVertical: 10 }} />
            ) : (
              renderOptions("Tower", towerOptions, "tower")
            )}
          </>
        );
      case "HOUSE_VILLA":
        return (
          <>
            {renderOptions("Structure", structureOptions, "structure")}
            {renderOptions("House/Villa", houseVillaOptions, "houseVilla")}
          </>
        );
      case "PLOT":
        return (
          <>
            {renderOptions("Plot Type", plotTypeOptions, "plotType")}
            {renderOptions("Area", areaOptions, "area")}
          </>
        );
      case "COMMERCIAL_PROPERTY_UNIT":
        return (
          <>
            {renderOptions("Area", areaOptions, "area")}
          </>
        );
      default:
        return <Text style={styles.filterLabel}>No filters available.</Text>;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {renderFilters()}
          </ScrollView>
          <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: screenWidth * 0.8,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 50,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    color: '#064226ff',
    fontFamily: 'PlusSB',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusL',
  },
  content: {
    paddingBottom: 30,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
    color: '#033b01ff',
    fontFamily: 'PlusSB',
  },
  applyBtn: {
    backgroundColor: '#033b01ff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusSB',
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionBtnSelected: {
    backgroundColor: '#033b01ff',
    borderColor: '#033b01ff',
  },
  optionBtnText: {
    color: '#033b01ff',
    fontSize: 14,
    
    fontFamily: 'PlusL',
  },
  optionBtnTextSelected: {
    color: '#fff',
    fontFamily: 'PlusSB',
  },
});

export default ManageFilter;
