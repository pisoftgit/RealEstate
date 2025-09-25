import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
    { label: 'Villa', value: 'villa' },
    { label: 'House', value: 'house' },
    { label: 'Flat', value: 'flat' },
    { label: 'Bungalow', value: 'bungalow' },
    { label: 'Duplex', value: 'duplex' },
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
    };
    
    if (onSave) {
      onSave(propertyData);
    }
  };

  const isFormValid = propertyNature && propertyType && 
    (propertyType !== 'residential' || (isGated && residentialProperty && blockTower.trim() && totalFloors)) &&
    (propertyType === 'residential' || (propertyName.trim() && blockTower.trim() && totalFloors)) &&
    propertyName.trim();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    
      
      {/* Basic Details Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Basic Details</Text>
        
        {/* Property Nature */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Property Nature *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={propertyNature}
              onValueChange={setPropertyNature}
              style={styles.picker}
            >
              {propertyNatureOptions.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Property Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={propertyType}
              onValueChange={setPropertyType}
              style={styles.picker}
            >
              {propertyTypeOptions.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Residential Property - Only show for Residential */}
        {propertyType === 'residential' && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Residential Property *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={residentialProperty}
                onValueChange={setResidentialProperty}
                style={styles.picker}
              >
                {residentialPropertyOptions.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Gated Option - Only show for Residential */}
        {propertyType === 'residential' && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Gated Property? *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={isGated}
                onValueChange={setIsGated}
                style={styles.picker}
              >
                {gatedOptions.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value} 
                  />
                ))}
              </Picker>
            </View>
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

      {/* Property Details Section - Only show when residential property is selected */}
      {residentialProperty && (
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

      {/* Floor-wise Property Summary - Only show when total floors is entered */}
      {residentialProperty && totalFloors && parseInt(totalFloors) > 0 && (
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
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={item.propertyItem}
                            onValueChange={(value) => updatePropertyItem(floorNumber, itemIndex, 'propertyItem', value)}
                            style={styles.picker}
                          >
                            {propertyItemOptions.map((option) => (
                              <Picker.Item key={option.value} label={option.label} value={option.value} />
                            ))}
                          </Picker>
                        </View>
                      </View>
                      <View style={styles.propertyItemField}>
                        <Text style={styles.smallLabel}>Structure</Text>
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={item.structure}
                            onValueChange={(value) => updatePropertyItem(floorNumber, itemIndex, 'structure', value)}
                            style={styles.picker}
                          >
                            {structureOptions.map((option) => (
                              <Picker.Item key={option.value} label={option.label} value={option.value} />
                            ))}
                          </Picker>
                        </View>
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
  picker: {
    height: 50,
    color: '#333',
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
