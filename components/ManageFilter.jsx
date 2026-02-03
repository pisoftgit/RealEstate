import React, { useMemo, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useSocietyBlocks } from "../hooks/useRealEstateProperties";
import { API_BASE_URL } from "../services/api";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const screenWidth = Dimensions.get("window").width;

const defaultStructureOptions = ["1BHK", "2BHK", "3BHK", "4BHK"];
// Area options will be fetched from API for GROUP_BLOCK
const houseVillaOptions = ["Villa Type 1", "Villa Type 2"];
const plotTypeOptions = ["Residential", "Commercial", "Industrial"];

const ManageFilter = ({ visible, onClose, propertyType, onApply, filters, setFilters, projectId }) => {
  const { blocks, loading: blocksLoading } = useSocietyBlocks(propertyType === "GROUP_BLOCK" ? projectId : null);

  // Area and structure options state
  const [areaOptions, setAreaOptions] = useState(["500 sqft", "1000 sqft", "1500 sqft", "2000 sqft"]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaError, setAreaError] = useState(null);
  const [structureOptions, setStructureOptions] = useState(defaultStructureOptions);
  const [structureLoading, setStructureLoading] = useState(false);
  const [structureError, setStructureError] = useState(null);

  useEffect(() => {
    // Only fetch for GROUP_BLOCK and valid projectId
    if (propertyType && projectId) {
      setAreaLoading(true);
      setAreaError(null);
      setStructureLoading(true);
      setStructureError(null);
      (async () => {
        try {
          const secretKey = await SecureStore.getItemAsync('auth_token');
          // Area fetch
          const areaRes = await fetch(`${API_BASE_URL}/real-estate-properties/areas?propertyItem=${propertyType}&projectId=${projectId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                secret_key: secretKey,
              },
            }
          );
          if (!areaRes.ok) {
            console.error('Area API response not ok:', areaRes.status, areaRes.statusText);
            throw new Error("Failed to fetch area options");
          }
          const areaData = await areaRes.json();
          console.log('Area API response:', areaData);
          if (Array.isArray(areaData)) {
            setAreaOptions(areaData.map(a => a.areaDetails));
          } else {
            setAreaOptions(["500 sqft", "1000 sqft", "1500 sqft", "2000 sqft"]);
            setAreaError("Area API did not return array");
          }
          setAreaLoading(false);

          // Structure fetch
          const structureRes = await fetch(`${API_BASE_URL}/real-estate-properties/structures?propertyItem=${propertyType}&projectId=${projectId}`,
            {
              headers: {
                'Content-Type': 'application/json',
                secret_key: secretKey,
              },
            }
          );
          if (!structureRes.ok) {
            console.error('Structure API response not ok:', structureRes.status, structureRes.statusText);
            throw new Error("Failed to fetch structure options");
          }
          const structureData = await structureRes.json();
          console.log('Structure API response:', structureData);
          if (Array.isArray(structureData)) {
            setStructureOptions(structureData.map(s => s.structure));
          } else {
            setStructureOptions(defaultStructureOptions);
            setStructureError("Structure API did not return array");
          }
        } catch (err) {
          setAreaError("Error loading area options: " + err.message);
          setStructureError("Error loading structure options: " + err.message);
          console.error('Area/Structure API error:', err);
          setAreaOptions(["500 sqft", "1000 sqft", "1500 sqft", "2000 sqft"]);
          setStructureOptions(defaultStructureOptions);
        } finally {
          setAreaLoading(false);
          setStructureLoading(false);
        }
      })();
    }
  }, [propertyType, projectId]);

  const towerOptions = useMemo(() => {
    if (blocks && Array.isArray(blocks)) {
      return blocks.map(block => block.blockHouseName);
    }
    return []
  }, [blocks]);

  // Helper to render a simple option list
  const renderOptions = (label, options, filterKey) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={typeof opt === 'object' ? opt.id || opt.value || idx : opt}
            style={[
              styles.optionBtn,
              filters[filterKey] === (typeof opt === 'object' ? opt.value || opt.id : opt) && styles.optionBtnSelected,
            ]}
            onPress={() => setFilters({ ...filters, [filterKey]: filters[filterKey] === (typeof opt === 'object' ? opt.value || opt.id : opt) ? undefined : (typeof opt === 'object' ? opt.value || opt.id : opt) })}
          >
            <Text style={[
              styles.optionBtnText,
              filters[filterKey] === (typeof opt === 'object' ? opt.value || opt.id : opt) && styles.optionBtnTextSelected,
            ]}>{typeof opt === 'object' ? (opt.label || opt.structure || opt.areaDetails || opt.name || opt.value) : opt}</Text>
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
            {structureLoading ? (
              <ActivityIndicator size="small" color="#033b01ff" style={{ marginVertical: 10 }} />
            ) : structureError ? (
              <Text style={{ color: 'red', marginBottom: 10 }}>{structureError}</Text>
            ) : (
              renderOptions("Structure", structureOptions, "structure")
            )}
            {areaLoading ? (
              <ActivityIndicator size="small" color="#033b01ff" style={{ marginVertical: 10 }} />
            ) : areaError ? (
              <Text style={{ color: 'red', marginBottom: 10 }}>{areaError}</Text>
            ) : (
              renderOptions("Area", areaOptions, "area")
            )}
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

  // Helper to get selected structureId, area, towerId
  const getSelectedFilterParams = () => {
    let structureId = null;
    let area = null;
    let towerId = null;
    // Try to find structureId from structureOptions
    if (filters.structure && Array.isArray(structureOptions)) {
      const found = structureOptions.find(opt => (typeof opt === 'object' ? (opt.value || opt.id || opt.structure) : opt) === filters.structure || (typeof opt === 'string' && opt === filters.structure));
      if (found && typeof found === 'object' && found.id) structureId = found.id;
    }
    // Area: if areaOptions are objects, get value, else use string
    if (filters.area && Array.isArray(areaOptions)) {
      const found = areaOptions.find(opt => (typeof opt === 'object' ? (opt.value || opt.area || opt.areaDetails) : opt) === filters.area || (typeof opt === 'string' && opt === filters.area));
      if (found && typeof found === 'object' && found.area) area = found.area;
      else if (typeof filters.area === 'string') area = parseFloat(filters.area);
    }
    // Tower: if towerOptions are objects, get id, else use string
    if (filters.tower && Array.isArray(towerOptions)) {
      const found = towerOptions.find(opt => (typeof opt === 'object' ? (opt.value || opt.id || opt.name) : opt) === filters.tower || (typeof opt === 'string' && opt === filters.tower));
      if (found && typeof found === 'object' && found.id) towerId = found.id;
      else if (typeof filters.tower === 'string') towerId = filters.tower;
    }
    return { structureId, area, towerId };
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
          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(getSelectedFilterParams())}>
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
    width: wp('80%'),
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? hp('3.7%') : hp('6.2%'),
    paddingHorizontal: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: wp('2%'),
    elevation: 10,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  headerText: {
    fontSize: wp('5.5%'),
    color: '#064226ff',
    fontFamily: 'PlusSB',
  },
  closeText: {
    fontSize: wp('4%'),
    color: '#666',
    fontFamily: 'PlusL',
  },
  content: {
    paddingBottom: hp('3.7%'),
  },
  filterLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    marginTop: hp('2.2%'),
    marginBottom: hp('1%'),
    color: '#033b01ff',
    fontFamily: 'PlusSB',
  },
  applyBtn: {
    backgroundColor: '#033b01ff',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('2.5%'),
    alignItems: 'center',
    marginTop: hp('2.5%'),
  },
  applyBtnText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
  },
  optionBtn: {
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('5%'),
    backgroundColor: '#f1f1f1',
    marginRight: wp('2%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionBtnSelected: {
    backgroundColor: '#033b01ff',
    borderColor: '#033b01ff',
  },
  optionBtnText: {
    color: '#033b01ff',
    fontSize: wp('3.5%'),
    fontFamily: 'PlusL',
  },
  optionBtnTextSelected: {
    color: '#fff',
    fontFamily: 'PlusSB',
  },
});

export default ManageFilter;
