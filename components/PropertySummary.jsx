import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import usePropertyNatureActions from '../hooks/usePropertyNatureActions';
import usePropertyItemActions from '../hooks/usePropertyItemActions';
import useRealEstatePropertyTypeActions from '../hooks/useRealEstatePropertyTypeActions';
import useSubPropertyTypes from '../hooks/useSubPropertyTypes';
import useMeasurementUnits from '../hooks/useMeasurements';
import useStructure from '../hooks/useStructure';

const PropertySummary = ({ onSave, initialData = {} }) => {
  const { propertyNatures, loading: propertyNaturesLoading } = usePropertyNatureActions();
  const { propertyItems, loading: propertyItemsLoading } = usePropertyItemActions();
  const { propertyTypes, loading: propertyTypesLoading } = useRealEstatePropertyTypeActions();
  const { fetchPropertyTypeWithSubTypes, loading: subPropertyTypesLoading } = useSubPropertyTypes();
  const { units, loading: unitsLoading } = useMeasurementUnits();
  const { structures, loading: structuresLoading } = useStructure();
  
  const [propertyNature, setPropertyNature] = useState(initialData.propertyNature || '');
  const [propertyType, setPropertyType] = useState(initialData.propertyType || '');
  const [subPropertyType, setSubPropertyType] = useState(initialData.subPropertyType || '');
  const [subPropertyTypesData, setSubPropertyTypesData] = useState([]);
  const [propertyTypeData, setPropertyTypeData] = useState(null);
  const [selectedSubPropertyTypeData, setSelectedSubPropertyTypeData] = useState(null);
  const [residentialProperty, setResidentialProperty] = useState(initialData.residentialProperty || '');
  const [isGated, setIsGated] = useState(initialData.isGated || ''); 
  const [propertyName, setPropertyName] = useState(initialData.propertyName || '');
  const [blockTower, setBlockTower] = useState(initialData.blockTower || '');
  const [totalFloors, setTotalFloors] = useState(initialData.totalFloors || '');
  const [floorData, setFloorData] = useState(initialData.floorData || {});
  const [commercialProperty, setCommercialProperty] = useState(initialData.commercialProperty || '');
  const [commercialQuantity, setCommercialQuantity] = useState(initialData.commercialQuantity || '1');
  
  // Property summary items (can include: area, unit, quantity, structure, propertyItem)
  const [propertySummaryItems, setPropertySummaryItems] = useState(initialData.propertySummaryItems || [
    { area: '', unit: '', quantity: '1', structure: '', propertyItem: '' }
  ]);

  // Dropdown open states for react-native-dropdown-picker
  const [propertyNatureOpen, setPropertyNatureOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [subPropertyTypeOpen, setSubPropertyTypeOpen] = useState(false);
  const [residentialPropertyOpen, setResidentialPropertyOpen] = useState(false);
  const [isGatedOpen, setIsGatedOpen] = useState(false);
  // For dynamic floor property items and structures
  const [floorItemOpen, setFloorItemOpen] = useState({});
  const [structureOpen, setStructureOpen] = useState({});
  // For property summary items dropdowns
  const [summaryItemUnitOpen, setSummaryItemUnitOpen] = useState({});
  const [summaryItemStructureOpen, setSummaryItemStructureOpen] = useState({});
  const [summaryItemPropertyItemOpen, setSummaryItemPropertyItemOpen] = useState({});

  // Transform propertyNatures to dropdown format
  const propertyNatureOptions = [
    { label: 'Select Property Nature', value: '' },
    ...propertyNatures.map(nature => ({
      label: nature.name,
      value: nature.id
    }))
  ];

  // Transform propertyTypes to dropdown format
  const propertyTypeOptions = [
    { label: 'Select Property Type', value: '' },
    ...propertyTypes.map(type => ({
      label: type.name || type.propertyType,
      value: type.id
    }))
  ];

  // Transform subPropertyTypes to dropdown format
  const subPropertyTypeOptions = [
    { label: 'Select Sub Property Type', value: '' },
    ...subPropertyTypesData.map(type => ({
      label: type.name || type.subPropertyType,
      value: type.id
    }))
  ];

  // Fetch sub-property types when property type changes
  useEffect(() => {
    const loadSubPropertyTypes = async () => {
      if (propertyType) {
        try {
          const data = await fetchPropertyTypeWithSubTypes(propertyType);
          if (data && data.subPropertyTypes) {
            setSubPropertyTypesData(data.subPropertyTypes);
            setPropertyTypeData(data.propertyType);
          }
        } catch (error) {
          console.error('Error loading sub-property types:', error);
          setSubPropertyTypesData([]);
          setPropertyTypeData(null);
        }
      } else {
        setSubPropertyTypesData([]);
        setPropertyTypeData(null);
        setSubPropertyType(''); // Reset sub-property type when property type is cleared
      }
    };

    loadSubPropertyTypes();
  }, [propertyType, fetchPropertyTypeWithSubTypes]);

  // Update selected sub-property type data when subPropertyType changes
  useEffect(() => {
    if (subPropertyType && subPropertyTypesData.length > 0) {
      const selectedSubType = subPropertyTypesData.find(st => st.id === subPropertyType);
      setSelectedSubPropertyTypeData(selectedSubType);
    } else {
      setSelectedSubPropertyTypeData(null);
    }
  }, [subPropertyType, subPropertyTypesData]);

  const gatedOptions = [
    { label: 'Select', value: '' },
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  // Transform measurement units to dropdown format
  const unitOptions = [
    { label: 'Select Unit', value: '' },
    ...units.map(unit => ({
      label: unit.name,
      value: unit.id
    }))
  ];

  const residentialPropertyOptions = [
    { label: 'Select Residential Property', value: '' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'House/Villa', value: 'house_villa' },
    { label: 'Residential Plot/Land', value: 'plot_land' },
  ];

  const commercialPropertyOptions = [
    { label: 'Select Commercial Property', value: '' },
    { label: 'Shop', value: 'shop' },
    { label: 'Office', value: 'office' },
    { label: 'Warehouse', value: 'warehouse' },
    { label: 'Showroom', value: 'showroom' },
    // Add more as needed
  ];

  // Dropdown options for Property Item and Structure
  const propertyItemOptions = [
    { label: 'Select Property Item', value: '' },
    ...propertyItems.map(item => ({
      label: item.name,
      value: item.id
    }))
  ];

  // Transform structures from API to dropdown format
  const structureOptions = [
    { label: 'Select Structure', value: '' },
    ...structures.map(structure => ({
      label: structure.structure,
      value: structure.id
    }))
  ];

  // Handle floor data changes
  const handleTotalFloorsChange = (floors) => {
    setTotalFloors(floors);
    const numFloors = parseInt(floors) || 0;
    const newFloorData = {};
    
    for (let i = 1; i <= numFloors; i++) {
      if (floorData[i]) {
        newFloorData[i] = floorData[i];
      } else {
        newFloorData[i] = [{
          propertyItem: '',
          structure: '',
          quantity: '1'
        }];
      }
    }
    setFloorData(newFloorData);
  };

  const addPropertyItem = (floorNumber) => {
    const newFloorData = { ...floorData };
    if (!newFloorData[floorNumber]) {
      newFloorData[floorNumber] = [];
    }
    newFloorData[floorNumber].push({
      propertyItem: '',
      structure: '',
      quantity: '1'
    });
    setFloorData(newFloorData);
  };

  const removePropertyItem = (floorNumber, index) => {
    const newFloorData = { ...floorData };
    if (newFloorData[floorNumber] && newFloorData[floorNumber].length > 1) {
      newFloorData[floorNumber].splice(index, 1);
      setFloorData(newFloorData);
    }
  };

  const updatePropertyItem = (floorNumber, index, field, value) => {
    const newFloorData = { ...floorData };
    if (!newFloorData[floorNumber]) {
      newFloorData[floorNumber] = [];
    }
    if (!newFloorData[floorNumber][index]) {
      newFloorData[floorNumber][index] = { propertyItem: '', structure: '', quantity: '1' };
    }
    newFloorData[floorNumber][index][field] = value;
    setFloorData(newFloorData);
  };

  // Handle property summary items
  const addPropertySummaryItem = () => {
    setPropertySummaryItems([...propertySummaryItems, { area: '', unit: '', quantity: '1', structure: '', propertyItem: '' }]);
  };

  const removePropertySummaryItem = (index) => {
    if (propertySummaryItems.length > 1) {
      const newItems = propertySummaryItems.filter((_, i) => i !== index);
      setPropertySummaryItems(newItems);
    }
  };

  const updatePropertySummaryItem = (index, field, value) => {
    const newItems = [...propertySummaryItems];
    newItems[index][field] = value;
    setPropertySummaryItems(newItems);
  };

  const handleSave = () => {
    const propertyData = {
      propertyType,
      subPropertyType,
      propertyNature,
      residentialProperty,
      isGated,
      propertyName,
      blockTower,
      totalFloors,
      floorData,
      commercialProperty,
      commercialQuantity,
      propertySummaryItems,
    };
    
    if (onSave) {
      onSave(propertyData);
    }
  };

  const isFormValid = propertyType && subPropertyType;

  // Helper function to determine which fields to show based on sub-property type
  const getFieldsToShow = () => {
    if (!selectedSubPropertyTypeData) return null;
    
    const subPropertyName = selectedSubPropertyTypeData.name || selectedSubPropertyTypeData.subPropertyType || '';
    const normalizedName = subPropertyName.toLowerCase().trim();
    
    // Define field configurations for different sub-property types
    if (normalizedName.includes('pent house') || normalizedName.includes('penthouse')) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: false };
    } else if (normalizedName.includes('super sub property')) {
      return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
    } else if (normalizedName.includes('villa')) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: false };
    } else if (normalizedName.includes('group tower')) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: true };
    } else if (normalizedName.includes('plot')) {
      return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
    } else if (normalizedName.includes('independent house')) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: false };
    } else if (normalizedName.includes('multi tower')) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: true };
    }
    
    // Default for commercial or other types
    if (propertyTypeData?.isCommercial) {
      return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
    }
    
    return null;
  };

  const fieldsToShow = getFieldsToShow();
  const shouldShowPropertySummary = subPropertyType && fieldsToShow;

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" 
        nestedScrollEnabled={true} 
      >
        {/* Basic Details Section */}
        <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Basic Details</Text>
        
        {/* Property Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Property Type *</Text>
          <DropDownPicker
            open={propertyTypeOpen}
            value={propertyType}
            items={propertyTypeOptions}
            setOpen={setPropertyTypeOpen}
            setValue={setPropertyType}
            setItems={() => {}}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            labelStyle={styles.dropdownLabel}
            containerStyle={{ marginBottom: 10 }}
            zIndex={2000}
            listMode="MODAL"
            modalProps={{
              animationType: "fade",
              transparent: true
            }}
            modalContentContainerStyle={{
              backgroundColor: '#fff',
              borderRadius: 15,
              padding: 20,
              maxHeight: '60%',
              width: '85%',
              alignSelf: 'center',
              marginTop: 'auto',
              marginBottom: 'auto',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 8,
            }}
            modalTitleStyle={{
              fontFamily: 'PlusSB',
              fontSize: 18,
              color: '#333',
              marginBottom: 10,
            }}
            loading={propertyTypesLoading}
          />
        </View>

        {/* Sub Property Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Sub Property Type *</Text>
          <DropDownPicker
            open={subPropertyTypeOpen}
            value={subPropertyType}
            items={subPropertyTypeOptions}
            setOpen={setSubPropertyTypeOpen}
            setValue={setSubPropertyType}
            setItems={() => {}}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            labelStyle={styles.dropdownLabel}
            containerStyle={{ marginBottom: 10 }}
            zIndex={99}
            listMode="MODAL"
            modalProps={{
              animationType: "fade",
              transparent: true
            }}
            modalContentContainerStyle={{
              backgroundColor: '#fff',
              borderRadius: 15,
              padding: 20,
              maxHeight: '60%',
              width: '85%',
              alignSelf: 'center',
              marginTop: 'auto',
              marginBottom: 'auto',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 8,
            }}
            modalTitleStyle={{
              fontFamily: 'PlusSB',
              fontSize: 18,
              color: '#333',
              marginBottom: 10,
            }}
            loading={subPropertyTypesLoading}
            disabled={!propertyType}
          />
        </View>
      </View>

      {/* Property Summary Section - Dynamic based on Sub Property Type */}
      {shouldShowPropertySummary && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Property Summary</Text>
          
          {propertySummaryItems.map((item, index) => (
            <View key={index} style={styles.commercialItemContainer}>
              
              {/* Property Item (for Group Tower, Multi Tower) */}
              {fieldsToShow.propertyItem && (
                <View style={[styles.fieldContainer, { zIndex: 3000 - index * 10 }]}>
                  <Text style={styles.label}>Property Item *</Text>
                  <DropDownPicker
                    open={summaryItemPropertyItemOpen[index] || false}
                    value={item.propertyItem}
                    items={propertyItemOptions}
                    setOpen={(open) => {
                      setSummaryItemPropertyItemOpen({ ...summaryItemPropertyItemOpen, [index]: open });
                    }}
                    setValue={(callback) => {
                      const newValue = typeof callback === 'function' ? callback(item.propertyItem) : callback;
                      updatePropertySummaryItem(index, 'propertyItem', newValue);
                    }}
                    setItems={() => {}}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropDownContainer}
                    textStyle={styles.dropdownText}
                    labelStyle={styles.dropdownLabel}
                    zIndex={3000 - index * 10}
                    listMode="MODAL"
                    modalProps={{
                      animationType: "fade",
                      transparent: true
                    }}
                    modalContentContainerStyle={{
                      backgroundColor: '#fff',
                      borderRadius: 15,
                      padding: 20,
                      maxHeight: '70%',
                      width: '85%',
                      alignSelf: 'center',
                      marginTop: 'auto',
                      marginBottom: 'auto',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      elevation: 8,
                    }}
                    modalTitleStyle={{
                      fontFamily: 'PlusSB',
                      fontSize: 18,
                      color: '#333',
                      marginBottom: 10,
                    }}
                    searchable={true}
                    searchPlaceholder="Search property item..."
                    loading={propertyItemsLoading}
                  />
                </View>
              )}

              {/* Area and Unit in one row */}
              <View style={styles.rowContainer}>
                {/* Area */}
                {fieldsToShow.area && (
                  <View style={styles.halfFieldContainer}>
                    <Text style={styles.label}>Area *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter area"
                      keyboardType="numeric"
                      value={item.area}
                      onChangeText={(value) => updatePropertySummaryItem(index, 'area', value)}
                    />
                  </View>
                )}

                {/* Unit */}
                {fieldsToShow.unit && (
                  <View style={[styles.halfFieldContainer, { zIndex: 2000 - index * 10 }]}>
                    <Text style={styles.label}>Unit *</Text>
                    <DropDownPicker
                      open={summaryItemUnitOpen[index] || false}
                      value={item.unit}
                      items={unitOptions}
                      setOpen={(open) => {
                        setSummaryItemUnitOpen({ ...summaryItemUnitOpen, [index]: open });
                      }}
                      setValue={(callback) => {
                        const newValue = typeof callback === 'function' ? callback(item.unit) : callback;
                        updatePropertySummaryItem(index, 'unit', newValue);
                      }}
                      setItems={() => {}}
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropDownContainer}
                      textStyle={styles.dropdownText}
                      labelStyle={styles.dropdownLabel}
                      zIndex={2000 - index * 10}
                      listMode="MODAL"
                      modalProps={{
                        animationType: "fade",
                        transparent: true
                      }}
                      modalContentContainerStyle={{
                        backgroundColor: '#fff',
                        borderRadius: 15,
                        padding: 20,
                        maxHeight: '60%',
                        width: '85%',
                        alignSelf: 'center',
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 8,
                      }}
                      modalTitleStyle={{
                        fontFamily: 'PlusSB',
                        fontSize: 18,
                        color: '#333',
                        marginBottom: 10,
                      }}
                      searchable={true}
                      searchPlaceholder="Search unit..."
                      loading={unitsLoading}
                    />
                  </View>
                )}
              </View>

              {/* Structure and Quantity in one row */}
              <View style={styles.rowContainer}>
                {/* Structure */}
                {fieldsToShow.structure && (
                  <View style={[styles.halfFieldContainer, { zIndex: 1000 - index * 10 }]}>
                    <Text style={styles.label}>Structure *</Text>
                    <DropDownPicker
                      open={summaryItemStructureOpen[index] || false}
                      value={item.structure}
                      items={structureOptions}
                      setOpen={(open) => {
                        setSummaryItemStructureOpen({ ...summaryItemStructureOpen, [index]: open });
                      }}
                      setValue={(callback) => {
                        const newValue = typeof callback === 'function' ? callback(item.structure) : callback;
                        updatePropertySummaryItem(index, 'structure', newValue);
                      }}
                      setItems={() => {}}
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropDownContainer}
                      textStyle={styles.dropdownText}
                      labelStyle={styles.dropdownLabel}
                      zIndex={1000 - index * 10}
                      listMode="MODAL"
                      modalProps={{
                        animationType: "fade",
                        transparent: true
                      }}
                      modalContentContainerStyle={{
                        backgroundColor: '#fff',
                        borderRadius: 15,
                        padding: 20,
                        maxHeight: '50%',
                        width: '85%',
                        alignSelf: 'center',
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 8,
                      }}
                      modalTitleStyle={{
                        fontFamily: 'PlusSB',
                        fontSize: 18,
                        color: '#333',
                        marginBottom: 10,
                      }}
                      searchable={true}
                      searchPlaceholder="Search structure..."
                      loading={structuresLoading}
                    />
                  </View>
                )}

                {/* Quantity */}
                {fieldsToShow.quantity && (
                  <View style={styles.halfFieldContainer}>
                    <Text style={styles.label}>Quantity *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter quantity"
                      keyboardType="numeric"
                      value={item.quantity}
                      onChangeText={(value) => updatePropertySummaryItem(index, 'quantity', value)}
                    />
                  </View>
                )}
              </View>

              {/* Delete Button */}
              {propertySummaryItems.length > 1 && (
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removePropertySummaryItem(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#dc3545" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Add Item Button */}
          <TouchableOpacity style={styles.addItemButton} onPress={addPropertySummaryItem}>
            <Ionicons name="add-circle-outline" size={20} color="#007bff" />
            <Text style={styles.addItemText}>Add More</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>

      {/* Save Button - Fixed at Bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
            Save Property Summary
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    
   
    shadowRadius: 6,
    elevation: 5,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: 15,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  halfFieldContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'PlusR',
    color: '#333',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 12,
    fontFamily: 'PlusL',
    color: '#666',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  dropDownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontFamily: 'PlusL',
    color: '#333',
    fontSize: 16,
  },
  dropdownLabel: {
    fontFamily: 'PlusR',
    color: '#333',
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'PlusL',
    backgroundColor: '#fff',
    color: '#333',
  },
  smallTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    fontFamily: 'PlusL',
    backgroundColor: '#fff',
    color: '#333',
    flex: 1,
  },
  floorContainer: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  floorTitle: {
    fontSize: 16,
    fontFamily: 'PlusSB',
    color: '#007bff',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 5,
  },
  propertyItemContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  propertyItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  propertyItemField: {
    flex: 2,
  },
  quantityField: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  quantityButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusR',
  },
  quantityInput: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    fontFamily: 'PlusL',
    textAlign: 'center',
    color: '#333',
  },
  removeItemButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    
    borderStyle: 'dashed',
  },
  addItemText: {
    color: '#007bff',
    fontSize: 14,
    fontFamily: 'PlusL',
    marginLeft: 5,
  },
  commercialItemContainer: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusR',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
});

export default PropertySummary;
