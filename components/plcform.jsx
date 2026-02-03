import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getAllPlc } from '../services/api';
import useSavePlcDetails from '../hooks/useSavePlcDetails';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PlcForm = ({ visible, onClose, onSave, initialData = null, propertyId }) => {
  const [plcs, setPlcs] = useState([{ id: 1, plcName: '', plcId: '', rateValue: '', rateUnit: '', isPercentage: false }]);
  // Remove local loading, use hook loading
  // const [loading, setLoading] = useState(false);
    // Use the custom hook for saving PLC details
    const { savePlcDetails, loading, error, response } = useSavePlcDetails();
  const [plcOptions, setPlcOptions] = useState([]);
  const [loadingPlcData, setLoadingPlcData] = useState(false);
  const [showPlcDropdown, setShowPlcDropdown] = useState({});
  const [showRateUnitDropdown, setShowRateUnitDropdown] = useState({});

  // Sync initialData when modal becomes visible and map API fields
  useEffect(() => {
    if (visible) {
      console.log('PLC Form visible. InitialData:', initialData);
      if (initialData && Array.isArray(initialData) && initialData.length > 0) {
        const mapped = initialData.map((item, index) => {
          // Robust mapping for rate value (handle 0, null, undefined and different field names)
          let rateVal = '';
          if (item.rate !== undefined && item.rate !== null) rateVal = String(item.rate);
          else if (item.rateValue !== undefined && item.rateValue !== null) rateVal = String(item.rateValue);
          else if (item.plcRate !== undefined && item.plcRate !== null) rateVal = String(item.plcRate);
          else if (item.amount !== undefined && item.amount !== null) rateVal = String(item.amount);

          return {
            id: index + 1, // Use index to ensure unique keys for local state management
            plcName: item.plc?.plcName || item.plcName || item.plc?.name || item.name || '',
            plcId: item.plc?.id || item.plcId || '',
            rateValue: rateVal,
            rateUnit: item.isPercentage ? 'Percentage (%)' : 'Amount',
            isPercentage: !!item.isPercentage,
          };
        });
        console.log('Mapped PLCs for state:', mapped);
        setPlcs(mapped);
      } else {
        console.log('No initial PLC data, setting default empty form');
        setPlcs([{ id: 1, plcName: '', plcId: '', rateValue: '', rateUnit: '', isPercentage: false }]);
      }
      fetchPlcData();
    }
  }, [visible, initialData]);

  // Fetch PLC data from API
  const fetchPlcData = async () => {
    if (loadingPlcData) return; // Prevent multiple simultaneous fetches
    try {
      setLoadingPlcData(true);
      const response = await getAllPlc();
      
      console.log('PLC API Response:', response);
      
      if (response && Array.isArray(response)) {
        setPlcOptions(response);
        console.log('PLC Options set:', response);
      } else {
        Alert.alert('Error', 'Failed to load PLC data');
      }
    } catch (error) {
      console.error('Error fetching PLC data:', error);
      Alert.alert('Error', 'Failed to load PLC data');
    } finally {
      setLoadingPlcData(false);
    }
  };

  // Toggle dropdown visibility for specific PLC
  const togglePlcDropdown = (plcId) => {
    setShowPlcDropdown((prev) => ({
      ...prev,
      [plcId]: !prev[plcId],
    }));
  };

  // Toggle Rate Unit dropdown visibility
  const toggleRateUnitDropdown = (plcId) => {
    setShowRateUnitDropdown((prev) => ({
      ...prev,
      [plcId]: !prev[plcId],
    }));
  };

  // Select PLC from dropdown
  const selectPlcOption = (plcId, selectedPlc) => {
    setPlcs(
      plcs.map((plc) =>
        plc.id === plcId
          ? {
              ...plc,
              plcName: selectedPlc.plcName || selectedPlc.name || selectedPlc.location || 'Unknown',
              plcId: selectedPlc.id,
            }
          : plc
      )
    );
    togglePlcDropdown(plcId);
  };

  // Select Rate Unit option
  const selectRateUnitOption = (plcId, label, isPercentage) => {
    setPlcs(
      plcs.map((plc) =>
        plc.id === plcId
          ? {
              ...plc,
              rateUnit: label,
              isPercentage: isPercentage,
            }
          : plc
      )
    );
    toggleRateUnitDropdown(plcId);
  };

  // Add a new PLC entry
  const handleAddPlc = () => {
    const newId = plcs.length > 0 ? Math.max(...plcs.map((p) => p.id)) + 1 : 1;
    setPlcs([...plcs, { id: newId, plcName: '', plcId: '', rateValue: '', rateUnit: '', isPercentage: false }]);
  };

  // Remove a PLC entry
  const handleRemovePlc = (id) => {
    if (plcs.length > 1) {
      setPlcs(plcs.filter((plc) => plc.id !== id));
    }
  };

  // Update PLC field
  const handleUpdatePlc = (id, field, value) => {
    setPlcs(
      plcs.map((plc) =>
        plc.id === id ? { ...plc, [field]: value } : plc
      )
    );
  };

  // Save all PLCs to API
  const handleSave = async () => {
    // Prepare plcDetails array for API
    const plcDetails = plcs.map((plc) => ({
      plcId: plc.plcId,
      rate: Number(plc.rateValue),
      isPercentage: plc.isPercentage,
    }));
    if (!propertyId) {
      Alert.alert('Error', 'Property ID is required');
      return;
    }
    const res = await savePlcDetails(propertyId, plcDetails);
    if (res) {
      if (onSave) onSave(res);
      onClose();
    } else if (error) {
      Alert.alert('Error', error.message || 'Failed to save PLC details');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Location Details -</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.addPlcTitle}>Add Plc</Text>

            {plcs.map((plc, index) => (
              <View key={plc.id} style={styles.plcCard}>
                {/* PLC Header with Remove Button */}
                <View style={styles.plcHeaderRow}>
                  <Text style={styles.plcNumber}>Plc {index + 1}</Text>
                  {plcs.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemovePlc(plc.id)}
                      style={styles.removePlcBtn}
                    >
                      <Feather name="trash-2" size={18} color="#d32f2f" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* PLC Information Section */}
                <Text style={styles.sectionTitle}>Plc Information</Text>

                {/* PLC Dropdown */}
                <Text style={styles.label}>Plc</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => togglePlcDropdown(plc.id)}
                  disabled={loadingPlcData}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !plc.plcName && styles.placeholderText,
                    ]}
                  >
                    {loadingPlcData ? 'Loading...' : (plc.plcName || 'Select Place')}
                  </Text>
                  <Feather 
                    name={showPlcDropdown[plc.id] ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>

                {/* PLC Dropdown List */}
                {showPlcDropdown[plc.id] && (
                  <View style={styles.dropdownList}>
                    <ScrollView 
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled={true}
                    >
                      {plcOptions.length > 0 ? (
                        plcOptions.map((option) => {
                          const displayName = option.plcName || option.name || option.location || `PLC ${option.id}`;
                          return (
                            <TouchableOpacity
                              key={option.id}
                              style={styles.dropdownItem}
                              onPress={() => {
                                console.log('Selected PLC:', option);
                                selectPlcOption(plc.id, option);
                              }}
                            >
                              <Text style={styles.dropdownItemText}>
                                {displayName}
                              </Text>
                              {plc.plcId === option.id && (
                                <Feather name="check" size={18} color="#4caf50" />
                              )}
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <View style={styles.emptyDropdown}>
                          <Text style={styles.emptyText}>No PLC options available</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Rate Information Section */}
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                  Rate Information
                </Text>

                {/* Rate Value Input */}
                <Text style={styles.label}>Rate Value</Text>
                <TextInput
                  style={styles.textInput}
                  value={plc.rateValue}
                  onChangeText={(text) =>
                    handleUpdatePlc(plc.id, 'rateValue', text)
                  }
                  keyboardType="numeric"
                  placeholder="Enter rate value"
                  placeholderTextColor="#999"
                />

                {/* Rate Unit Dropdown */}
                <Text style={styles.label}>Rate Unit</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => toggleRateUnitDropdown(plc.id)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !plc.rateUnit && styles.placeholderText,
                    ]}
                  >
                    {plc.rateUnit || 'Select Unit/Percentage'}
                  </Text>
                  <Feather 
                    name={showRateUnitDropdown[plc.id] ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>

                {/* Rate Unit Dropdown List */}
                {showRateUnitDropdown[plc.id] && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectRateUnitOption(plc.id, 'Amount', false)}
                    >
                      <Text style={styles.dropdownItemText}>Amount</Text>
                      {plc.rateUnit === 'Amount' && (
                        <Feather name="check" size={18} color="#4caf50" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => selectRateUnitOption(plc.id, 'Percentage (%)', true)}
                    >
                      <Text style={styles.dropdownItemText}>Percentage (%)</Text>
                      {plc.rateUnit === 'Percentage (%)' && (
                        <Feather name="check" size={18} color="#4caf50" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* Add Another PLC Button */}
            <TouchableOpacity
              style={styles.addAnotherPlcBtn}
              onPress={handleAddPlc}
            >
              <Feather name="plus-circle" size={20} color="#4caf50" />
              <Text style={styles.addAnotherPlcText}>Add Another Plc</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer - Save Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.savePlcBtn}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="save" size={20} color="#fff" />
                  <Text style={styles.savePlcText}>Save Plc</Text>
                </>
              )}
              {error && (
                <Text style={{ color: 'red', marginTop: 8 }}>{error.message || 'Failed to save PLC details'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    flex: 1,
    marginTop: hp('31%'),
    backgroundColor: '#fff',
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontFamily: 'PlusSB',
    color: '#333',
  },
  closeButton: {
    padding: wp('1%'),
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1%'),
  },
  addPlcTitle: {
    fontSize: wp('4.5%'),
    fontFamily: 'PlusSB',
    color: '#333',
    marginBottom: hp('1.2%'),
  },
  plcCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
  },
  plcHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  plcNumber: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#333',
  },
  removePlcBtn: {
    padding: wp('1%'),
  },
  sectionTitle: {
    fontSize: wp('3.8%'),
    fontFamily: 'PlusSB',
    color: '#4caf50',
    marginBottom: hp('1.2%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#333',
    marginBottom: hp('0.7%'),
    marginTop: hp('0.7%'),
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.2%'),
    minHeight: hp('6%'),
  },
  dropdownText: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.2%'),
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#333',
    minHeight: hp('6%'),
  },
  addAnotherPlcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4caf50',
    borderStyle: 'dashed',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.8%'),
    marginBottom: hp('2%'),
  },
  addAnotherPlcText: {
    fontSize: wp('3.8%'),
    fontFamily: 'PlusSB',
    color: '#4caf50',
    marginLeft: wp('2%'),
  },
  modalFooter: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  savePlcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    borderRadius: wp('2.5%'),
    paddingVertical: hp('1.8%'),
    gap: wp('2%'),
  },
  savePlcText: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: '#fff',
    marginLeft: wp('2%'),
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: hp('0.5%'),
    maxHeight: hp('25%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: hp('25%'),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#333',
    flex: 1,
  },
  emptyDropdown: {
    paddingVertical: hp('2.5%'),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusR',
    color: '#999',
  },
});

export default PlcForm;
