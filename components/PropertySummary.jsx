import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import usePropertyNatureActions from '../hooks/usePropertyNatureActions';
import usePropertyItemActions from '../hooks/usePropertyItemActions';
import useRealEstatePropertyTypeActions from '../hooks/useRealEstatePropertyTypeActions';
import useSubPropertyTypes from '../hooks/useSubPropertyTypes';
import useMeasurementUnits from '../hooks/useMeasurements'; 
import useStructure from '../hooks/useStructure';
import useSavePropertySummary from '../hooks/useSavePropertySummary';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PropertySummary = ({ onSave, initialData = {}, projectId }) => {
  const { propertyNatures, loading: propertyNaturesLoading } = usePropertyNatureActions();
  const { towerPropertyItems, loading: propertyItemsLoading } = usePropertyItemActions();
  const { propertyTypes, loading: propertyTypesLoading } = useRealEstatePropertyTypeActions();
  const { fetchPropertyTypeWithSubTypes, loading: subPropertyTypesLoading } = useSubPropertyTypes();
  const { units, loading: unitsLoading } = useMeasurementUnits();
  const { structures, loading: structuresLoading } = useStructure();
  const savePropertySummary = useSavePropertySummary();
  
  const [saving, setSaving] = useState(false);
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

 
  // Dropdown options for Property Item and Structure
  const propertyItemOptions = [
    { label: 'Select Property Item', value: '' },
    ...towerPropertyItems.map(item => ({
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

  const handleSave = async () => {
    console.log('=== SAVE PROPERTY SUMMARY STARTED ===');
    console.log('Raw projectId:', projectId, 'Type:', typeof projectId);
    console.log('Raw subPropertyType:', subPropertyType, 'Type:', typeof subPropertyType);
    console.log('Raw propertySummaryItems:', JSON.stringify(propertySummaryItems, null, 2));
    
    if (!projectId) {
      Alert.alert('Error', 'Project ID is required');
      return;
    }

    if (!subPropertyType) {
      Alert.alert('Error', 'Please select a sub-property type');
      return;
    }

    // Validate that at least one item has required fields
    const hasValidItems = propertySummaryItems.some(item => {
      const hasArea = item.area && item.area.trim() !== '';
      const hasUnit = item.unit && item.unit !== '';
      const hasQuantity = item.quantity && item.quantity.trim() !== '';
      return hasArea && hasUnit && hasQuantity;
    });

    if (!hasValidItems) {
      Alert.alert('Validation Error', 'Please fill in at least one complete property summary item with Area, Unit, and Quantity.');
      return;
    }

    try {
      setSaving(true);

      // Build metaRows from propertySummaryItems - filter out incomplete items
      const metaRows = propertySummaryItems
        .filter(item => {
          // Only include items with area, unit, and quantity
          return item.area && item.area.trim() !== '' && 
                 item.unit && item.unit !== '' && 
                 item.quantity && item.quantity.trim() !== '';
        })
        .map(item => ({
          area: parseFloat(item.area) || 0,
          areaUnitId: parseInt(item.unit) || 0,
          noOfItems: parseInt(item.quantity) || 1,
          flatHouseStructureId: item.structure ? parseInt(item.structure) : null,
          propertyItemId: item.propertyItem ? parseInt(item.propertyItem) : null,
        }));

      if (metaRows.length === 0) {
        Alert.alert('Validation Error', 'No valid property summary items to save.');
        return;
      }

      console.log('=== TRANSFORMED DATA ===');
      console.log('Transformed metaRows:', JSON.stringify(metaRows, null, 2));

      const summaryData = {
        projectId: parseInt(projectId),
        subPropertyTypeId: parseInt(subPropertyType),
        metaRows: metaRows,
      };

      console.log('=== FINAL SUMMARY DATA ===');
      console.log('Saving Property Summary with data:', JSON.stringify(summaryData, null, 2));

      // Call the API
      const response = await savePropertySummary(summaryData);
      
      console.log('Save successful:', response);

      // Call the parent onSave callback if provided
      if (onSave) {
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
        onSave(propertyData);
      }
    } catch (error) {
      console.error('Error saving property summary:', error);
      // Error alert is already shown by the hook
    } finally {
      setSaving(false);
    }
  };

  // Enhanced form validation
  const isFormValid = () => {
    if (!propertyType || !subPropertyType) {
      return false;
    }
    
    // Check if at least one property summary item has the required fields filled
    const hasValidItem = propertySummaryItems.some(item => {
      const hasArea = item.area && item.area.trim() !== '';
      const hasUnit = item.unit && item.unit !== '';
      const hasQuantity = item.quantity && item.quantity.trim() !== '';
      return hasArea && hasUnit && hasQuantity;
    });
    
    return hasValidItem;
  };

  // Helper function to determine which fields to show based on sub-property type
  const getFieldsToShow = () => {
    if (!selectedSubPropertyTypeData) return null;
    
    // Use boolean flags from the API response to determine which fields to show
    const {
      isMultiTower,
      isPlot,
      isHouseVilla,
      isCommercialUnit,
      
      isResidential,
      isCommercial
    } = selectedSubPropertyTypeData;
    
    // Multi Tower (Apartment Complex, Group Tower) - Show all fields including propertyItem
    if (isMultiTower) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: true };
    }
    
    // Plot - Show area, unit, quantity only (no structure, no propertyItem)
    if (isPlot) {
      return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
    }
    
    // House/Villa or Independent House - Show all except propertyItem
    if (isHouseVilla) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: false };
    }
    
    // Commercial Unit (Shop, Booth) - Show area, unit, quantity (no structure, no propertyItem)
    if (isCommercialUnit) {
      return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
    }
    
    // Default for other residential types
    if (isResidential) {
      return { area: true, unit: true, structure: true, quantity: true, propertyItem: false };
    }
    
    // Default for other commercial types
    if (isCommercial) {
      return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
    }
    
    // Fallback - show basic fields
    return { area: true, unit: true, structure: false, quantity: true, propertyItem: false };
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
          style={[styles.saveButton, (!isFormValid() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isFormValid() || saving}
        >
          <Text style={[styles.saveButtonText, (!isFormValid() || saving) && styles.saveButtonTextDisabled]}>
            {saving ? 'Saving...' : 'Save Property Summary'}
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
    padding: wp('5%'),
    paddingBottom: hp('12%'),
  },
  title: {
    fontSize: wp('6.2%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('2.5%'),
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: hp('3.2%'),
    backgroundColor: '#f8f9fa',
    padding: wp('4%'),
    borderRadius: wp('2.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 5,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.8%'),
  },
  fieldContainer: {
    marginBottom: hp('1.8%'),
  },
  rowContainer: {
    flexDirection: 'row',
    gap: wp('2.5%'),
    marginBottom: hp('1.8%'),
  },
  halfFieldContainer: {
    flex: 1,
  },
  label: {
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
    color: '#333',
    marginBottom: hp('1%'),
  },
  smallLabel: {
    fontSize: wp('3%'),
    fontFamily: 'PlusL',
    color: '#666',
    marginBottom: hp('0.5%'),
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    backgroundColor: '#fff',
    minHeight: hp('6%'),
  },
  dropDownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontFamily: 'PlusL',
    color: '#333',
    fontSize: wp('4%'),
  },
  dropdownLabel: {
    fontFamily: 'PlusR',
    color: '#333',
    fontSize: wp('4%'),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    fontFamily: 'PlusL',
    backgroundColor: '#fff',
    color: '#333',
  },
  smallTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('1.5%'),
    padding: wp('2%'),
    fontSize: wp('3.5%'),
    fontFamily: 'PlusL',
    backgroundColor: '#fff',
    color: '#333',
    flex: 1,
  },
  floorContainer: {
    backgroundColor: '#fff',
    marginBottom: hp('1.8%'),
    padding: wp('4%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
    borderColor: '#ddd',
  },
  floorTitle: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#007bff',
    marginBottom: hp('1.2%'),
    textAlign: 'center',
    backgroundColor: '#f0f8ff',
    padding: wp('2%'),
    borderRadius: wp('1.2%'),
  },
  propertyItemContainer: {
    backgroundColor: '#f9f9f9',
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.2%'),
    position: 'relative',
  },
  propertyItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: wp('2.5%'),
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
    borderRadius: wp('1.5%'),
  },
  quantityButton: {
    backgroundColor: '#007bff',
    padding: wp('2%'),
    borderRadius: wp('1%'),
    minWidth: wp('8%'),
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
  },
  quantityInput: {
    flex: 1,
    padding: wp('2%'),
    fontSize: wp('3.5%'),
    fontFamily: 'PlusL',
    textAlign: 'center',
    color: '#333',
  },
  removeItemButton: {
    position: 'absolute',
    top: wp('1.2%'),
    right: wp('1.2%'),
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('1%'),
    borderWidth: 1,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addItemText: {
    color: '#007bff',
    fontSize: wp('3.5%'),
    fontFamily: 'PlusL',
    marginLeft: wp('1.2%'),
  },
  commercialItemContainer: {
    backgroundColor: '#fff',
    marginBottom: hp('1.8%'),
    padding: wp('4%'),
    borderRadius: wp('2.5%'),
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
    padding: wp('4%'),
    paddingBottom: hp('2.5%'),
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: wp('4%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: wp('4%'),
    fontFamily: 'PlusR',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
});
