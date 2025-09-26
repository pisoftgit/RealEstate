import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';

const PropertySummary = ({ onSave, initialData = {} }) => {
  const [propertyNature, setPropertyNature] = useState(initialData.propertyNature || '');
  const [propertyType, setPropertyType] = useState(initialData.propertyType || '');
  const [residentialProperty, setResidentialProperty] = useState(initialData.residentialProperty || '');
  const [isGated, setIsGated] = useState(initialData.isGated || '');
  const [propertyName, setPropertyName] = useState(initialData.propertyName || '');
  const [blockTower, setBlockTower] = useState(initialData.blockTower || '');
  const [totalFloors, setTotalFloors] = useState(initialData.totalFloors || '');
  const [floorData, setFloorData] = useState(initialData.floorData || {});
  const [commercialProperty, setCommercialProperty] = useState(initialData.commercialProperty || '');
  const [commercialQuantity, setCommercialQuantity] = useState(initialData.commercialQuantity || '1');

  // Dropdown open states for react-native-dropdown-picker
  const [propertyNatureOpen, setPropertyNatureOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [residentialPropertyOpen, setResidentialPropertyOpen] = useState(false);
  const [isGatedOpen, setIsGatedOpen] = useState(false);
  // For dynamic floor property items and structures
  const [floorItemOpen, setFloorItemOpen] = useState({});
  const [structureOpen, setStructureOpen] = useState({});

  const propertyNatureOptions = [
    { label: 'Select Property Nature', value: '' },
    { label: 'Transfer', value: 'transfer' },
    { label: 'Registry', value: 'registry' },
  ];

  const propertyTypeOptions = [
    { label: 'Select Property Type', value: '' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Residential', value: 'residential' },
  ];

  const gatedOptions = [
    { label: 'Select', value: '' },
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
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
    { label: 'Bedroom', value: 'bedroom' },
    { label: 'Bathroom', value: 'bathroom' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Living Room', value: 'living_room' },
    { label: 'Balcony', value: 'balcony' },
    // Add more as needed
  ];
  const structureOptions = [
    { label: 'Select Structure', value: '' },
    { label: 'Concrete', value: 'concrete' },
    { label: 'Wood', value: 'wood' },
    { label: 'Steel', value: 'steel' },
    { label: 'Brick', value: 'brick' },
    // Add more as needed
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

  const handleSave = () => {
    const propertyData = {
      propertyNature,
      propertyType,
      residentialProperty,
      isGated,
      propertyName,
      blockTower,
      totalFloors,
      floorData,
      commercialProperty,
      commercialQuantity,
    };
    
    if (onSave) {
      onSave(propertyData);
    }
  };

  const isFormValid = propertyNature && propertyType && 
    (propertyType !== 'residential' || (isGated && residentialProperty && blockTower.trim() && totalFloors)) &&
    (propertyType === 'residential' || (propertyType === 'commercial' ? commercialProperty : propertyName.trim() && blockTower.trim() && totalFloors)) &&
    (propertyType === 'commercial' ? commercialQuantity : propertyName.trim());

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
      {/* Basic Details Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Basic Details</Text>
        {/* Property Nature */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Property Nature *</Text>
          <DropDownPicker
            open={propertyNatureOpen}
            value={propertyNature}
            items={propertyNatureOptions}
            setOpen={setPropertyNatureOpen}
            setValue={setPropertyNature}
            setItems={() => {}}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            labelStyle={styles.dropdownLabel}
            containerStyle={{ marginBottom: 10 }}
            zIndex={100}
            listMode="SCROLLVIEW"
          />
        </View>
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
            zIndex={99}
            listMode="SCROLLVIEW"
          />
        </View>
        {/* Residential Property - Only show for Residential */}
        {propertyType === 'residential' && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Residential Property *</Text>
            <DropDownPicker
              open={residentialPropertyOpen}
              value={residentialProperty}
              items={residentialPropertyOptions}
              setOpen={setResidentialPropertyOpen}
              setValue={setResidentialProperty}
              setItems={() => {}}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              labelStyle={styles.dropdownLabel}
              containerStyle={{ marginBottom: 10 }}
              zIndex={98}
              listMode="SCROLLVIEW"
            />
          </View>
        )}
        {/* Gated Option - Only show for Residential */}
        {propertyType === 'residential' && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gated Property? *</Text>
            <DropDownPicker
              open={isGatedOpen}
              value={isGated}
              items={gatedOptions}
              setOpen={setIsGatedOpen}
              setValue={setIsGated}
              setItems={() => {}}
              style={styles.dropdown}
              textStyle={styles.dropdownText}
              labelStyle={styles.dropdownLabel}
              containerStyle={{ marginBottom: 10 }}
              zIndex={97}
              listMode="SCROLLVIEW"
            />
          </View>
        )}

        {/* Property Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Property Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter property name"
            value={propertyName}
            onChangeText={setPropertyName}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Property Details Section - Only show for apartment */}
      {residentialProperty === 'apartment' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          {/* Block/Tower */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Block/Tower *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter block/tower name"
              value={blockTower}
              onChangeText={setBlockTower}
              placeholderTextColor="#999"
            />
          </View>
          {/* Total Floors */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Total Floors *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter total number of floors"
              value={totalFloors}
              onChangeText={handleTotalFloorsChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      )}

      {/* Property Summary Section */}
      {(residentialProperty === 'apartment' && totalFloors && parseInt(totalFloors) > 0) && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Property Summary</Text>
          {Array.from({ length: parseInt(totalFloors) }, (_, index) => {
            const floorNumber = index + 1;
            const floorItems = floorData[floorNumber] || [];
            return (
              <View key={floorNumber} style={styles.floorContainer}>
                <Text style={styles.floorTitle}>Floor-{floorNumber}</Text>
                {floorItems.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.propertyItemContainer}>
                    {/* Row for Property Item and Structure dropdowns */}
                    <View style={styles.propertyItemRow}>
                      <View style={styles.propertyItemField}>
                        <Text style={styles.smallLabel}>Property Item</Text>
                        <DropDownPicker
                          open={floorItemOpen[`${floorNumber}-${itemIndex}`] || false}
                          value={item.propertyItem}
                          items={propertyItemOptions}
                          setOpen={(open) => setFloorItemOpen((prev) => ({ ...prev, [`${floorNumber}-${itemIndex}`]: open }))}
                          setValue={(value) => updatePropertyItem(floorNumber, itemIndex, 'propertyItem', value())}
                          setItems={() => {}}
                          style={styles.dropdown}
                          textStyle={styles.dropdownText}
                          labelStyle={styles.dropdownLabel}
                          containerStyle={{ marginBottom: 10 }}
                          zIndex={96 - itemIndex}
                          listMode="SCROLLVIEW"
                        />
                      </View>
                      <View style={styles.propertyItemField}>
                        <Text style={styles.smallLabel}>Structure</Text>
                        <DropDownPicker
                          open={structureOpen[`${floorNumber}-${itemIndex}`] || false}
                          value={item.structure}
                          items={structureOptions}
                          setOpen={(open) => setStructureOpen((prev) => ({ ...prev, [`${floorNumber}-${itemIndex}`]: open }))}
                          setValue={(value) => updatePropertyItem(floorNumber, itemIndex, 'structure', value())}
                          setItems={() => {}}
                          style={styles.dropdown}
                          textStyle={styles.dropdownText}
                          labelStyle={styles.dropdownLabel}
                          containerStyle={{ marginBottom: 10 }}
                          zIndex={95 - itemIndex}
                          listMode="SCROLLVIEW"
                        />
                      </View>
                    </View>
                    {/* Quantity below both dropdowns */}
                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.smallLabel}>Quantity</Text>
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            const currentQty = parseInt(item.quantity) || 1;
                            if (currentQty > 1) {
                              updatePropertyItem(floorNumber, itemIndex, 'quantity', (currentQty - 1).toString());
                            }
                          }}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.quantityInput}
                          value={item.quantity}
                          onChangeText={(value) => updatePropertyItem(floorNumber, itemIndex, 'quantity', value)}
                          keyboardType="numeric"
                          textAlign="center"
                        />
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            const currentQty = parseInt(item.quantity) || 1;
                            updatePropertyItem(floorNumber, itemIndex, 'quantity', (currentQty + 1).toString());
                          }}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Remove Button */}
                    {floorItems.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeItemButton}
                        onPress={() => removePropertyItem(floorNumber, itemIndex)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {/* Add Item Button */}
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => addPropertyItem(floorNumber)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007bff" />
                  <Text style={styles.addItemText}>Add Property Item</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* For house/villa and plot/land, show direct property summary (single summary, no floors) */}
      {residentialProperty === 'house_villa' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Property Summary</Text>
          <View style={styles.floorContainer}>
            <Text style={styles.floorTitle}>Property</Text>
            {(floorData[1] || [{ structure: '', quantity: '1' }]).map((item, itemIndex) => (
              <View key={itemIndex} style={styles.propertyItemContainer}>
                {/* Only Structure and Quantity for house/villa */}
                <View style={styles.propertyItemRow}>
                  <View style={styles.propertyItemField}>
                    <Text style={styles.smallLabel}>Structure</Text>
                    <DropDownPicker
                      open={structureOpen[`1-${itemIndex}`] || false}
                      value={item.structure}
                      items={structureOptions}
                      setOpen={(open) => setStructureOpen((prev) => ({ ...prev, [`1-${itemIndex}`]: open }))}
                      setValue={(value) => updatePropertyItem(1, itemIndex, 'structure', value())}
                      setItems={() => {}}
                      style={styles.dropdown}
                      textStyle={styles.dropdownText}
                      labelStyle={styles.dropdownLabel}
                      containerStyle={{ marginBottom: 10 }}
                      zIndex={95 - itemIndex}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>
                {/* Quantity below dropdown */}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.smallLabel}>Quantity</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const currentQty = parseInt(item.quantity) || 1;
                        if (currentQty > 1) {
                          updatePropertyItem(1, itemIndex, 'quantity', (currentQty - 1).toString());
                        }
                      }}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity}
                      onChangeText={(value) => updatePropertyItem(1, itemIndex, 'quantity', value)}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const currentQty = parseInt(item.quantity) || 1;
                        updatePropertyItem(1, itemIndex, 'quantity', (currentQty + 1).toString());
                      }}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Remove Button */}
                {floorData[1] && floorData[1].length > 1 && (
                  <TouchableOpacity
                    style={styles.removeItemButton}
                    onPress={() => removePropertyItem(1, itemIndex)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => addPropertyItem(1)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007bff" />
              <Text style={styles.addItemText}>Add Structure</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* For plot/land, show property item, structure, quantity */}
      {residentialProperty === 'plot_land' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Property Summary</Text>
          <View style={styles.floorContainer}>
            <Text style={styles.floorTitle}>Property</Text>
            {(floorData[1] || [{ area: '', units: '', quantity: '1' }]).map((item, itemIndex) => (
              <View key={itemIndex} style={styles.propertyItemContainer}>
                {/* Area and Units for plot/land */}
                <View style={styles.propertyItemRow}>
                  <View style={styles.propertyItemField}>
                    <View style={{paddingBottom: 10 }}>
                    <Text style={styles.smallLabel}>Area</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter area"
                      value={item.area}
                      onChangeText={(value) => updatePropertyItem(1, itemIndex, 'area', value)}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    </View>
                  </View>
                  <View style={styles.propertyItemField}>
                    
                    <Text style={styles.smallLabel}>Units</Text>
                    <DropDownPicker
                      open={structureOpen[`1-${itemIndex}`] || false}
                      value={item.units}
                      items={[{ label: 'Select', value: '' }, { label: 'sq ft', value: 'sq_ft' }, { label: 'sq m', value: 'sq_m' }, { label: 'acre', value: 'acre' }, { label: 'hectare', value: 'hectare' }]}
                      setOpen={(open) => setStructureOpen((prev) => ({ ...prev, [`1-${itemIndex}`]: open }))}
                      setValue={(value) => updatePropertyItem(1, itemIndex, 'units', value())}
                      setItems={() => {}}
                      style={styles.dropdown}
                      textStyle={styles.dropdownText}
                      labelStyle={styles.dropdownLabel}
                      containerStyle={{ marginBottom: 10 }}
                      zIndex={95 - itemIndex}
                      listMode="SCROLLVIEW"
                    />
                  </View>
                </View>
                {/* Quantity below area/units */}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.smallLabel}>Quantity</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const currentQty = parseInt(item.quantity) || 1;
                        if (currentQty > 1) {
                          updatePropertyItem(1, itemIndex, 'quantity', (currentQty - 1).toString());
                        }
                      }}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity}
                      onChangeText={(value) => updatePropertyItem(1, itemIndex, 'quantity', value)}
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const currentQty = parseInt(item.quantity) || 1;
                        updatePropertyItem(1, itemIndex, 'quantity', (currentQty + 1).toString());
                      }}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Remove Button */}
                {floorData[1] && floorData[1].length > 1 && (
                  <TouchableOpacity
                    style={styles.removeItemButton}
                    onPress={() => removePropertyItem(1, itemIndex)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => addPropertyItem(1)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007bff" />
              <Text style={styles.addItemText}>Add Area</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* For commercial property, show direct property summary */}
      {propertyType === 'commercial' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Property Summary</Text>
          <View style={styles.floorContainer}>
            <Text style={styles.floorTitle}>Property</Text>
            <View style={styles.propertyItemContainer}>
              <View style={styles.propertyItemRow}>
                <View style={styles.propertyItemField}>
                  <Text style={styles.smallLabel}>Commercial Property Type</Text>
                  <DropDownPicker
                    open={structureOpen['commercial-0'] || false}
                    value={commercialProperty}
                    items={commercialPropertyOptions}
                    setOpen={(open) => setStructureOpen((prev) => ({ ...prev, ['commercial-0']: open }))}
                    setValue={setCommercialProperty}
                    setItems={() => {}}
                    style={styles.dropdown}
                    textStyle={styles.dropdownText}
                    labelStyle={styles.dropdownLabel}
                    containerStyle={{ marginBottom: 10 }}
                    zIndex={95}
                    listMode="SCROLLVIEW"
                  />
                </View>
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.smallLabel}>Quantity</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const currentQty = parseInt(commercialQuantity) || 1;
                      if (currentQty > 1) {
                        setCommercialQuantity((currentQty - 1).toString());
                      }
                    }}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={commercialQuantity}
                    onChangeText={setCommercialQuantity}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const currentQty = parseInt(commercialQuantity) || 1;
                      setCommercialQuantity((currentQty + 1).toString());
                    }}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isFormValid}
      >
        <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
          Save Property Summary
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
