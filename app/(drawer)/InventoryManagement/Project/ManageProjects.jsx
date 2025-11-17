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
  Linking,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import useProject from "../../../../hooks/useProject";
import useDropdownData from "../../../../hooks/useDropdownData";
import useReraActions from "../../../../hooks/useReraActions";
import useSaveProject from "../../../../hooks/useSaveProject";
import useMeasurementUnits from "../../../../hooks/useMeasurements";
import { getAllPlc, getAllbuilderbyid } from "../../../../services/api";
import * as ImagePicker from 'expo-image-picker';

const screenHeight = Dimensions.get("window").height;

const ManageProjects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewProperty, setViewProperty] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  
  const navigation = useNavigation();
  const router = useRouter();
  const { projects, loading, deleteProject, deleteLoading } = useProject();

  // Edit form states
  const [editLoading, setEditLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderValue, setBuilderValue] = useState(null);
  const [builderItems, setBuilderItems] = useState([]);
  
  const [possessionOpen, setPossessionOpen] = useState(false);
  const [possessionValue, setPossessionValue] = useState(null);
  const [possessionItems, setPossessionItems] = useState([
    { label: 'READY_TO_MOVE', value: 'READY_TO_MOVE' },
    { label: 'UNDER_CONSTRUCTION', value: 'UNDER_CONSTRUCTION' },
  ]);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState(null);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateValue, setStateValue] = useState(null);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtValue, setDistrictValue] = useState(null);

  const [measurementUnitOpen, setMeasurementUnitOpen] = useState(false);
  const [measurementUnitValue, setMeasurementUnitValue] = useState(null);

  const [plcOpen, setPlcOpen] = useState(false);
  const [plcValue, setPlcValue] = useState([]);
  const [plcItems, setPlcItems] = useState([]);

  const [reraDropdownOpen, setReraDropdownOpen] = useState(false);
  const [reraDropdownValue, setReraDropdownValue] = useState(null);
  const { reras, loading: reraLoading } = useReraActions();

  const [editForm, setEditForm] = useState({
    projectName: '',
    startDate: '',
    completionDate: '',
    description: '',
    isGated: false,
    reraApproved: false,
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    area: '',
  });

  const [errors, setErrors] = useState({});
  const [showReraCard, setShowReraCard] = useState(false);
  const [reraDetails, setReraDetails] = useState({ reraNo: '' });
  const [datePickerVisible, setDatePickerVisible] = useState({
    start: false,
    completion: false,
  });
  const [mediaFiles, setMediaFiles] = useState([]);

  // Dropdown data hook
  const {
    countries,
    states,
    districts,
    loading: dropdownLoading
  } = useDropdownData(null, countryValue, stateValue, null);

  // Fetch measurement units
  const { units: measurementUnits, loading: measurementUnitsLoading } = useMeasurementUnits();

  // Ensure measurement unit value is set when units are loaded and editing
  useEffect(() => {
    if (editingProperty && measurementUnits && measurementUnits.length > 0 && editingProperty.areaUnitId) {
      const unitExists = measurementUnits.find(u => u.id?.toString() === editingProperty.areaUnitId?.toString());
      if (unitExists && !measurementUnitValue) {
        setMeasurementUnitValue(editingProperty.areaUnitId?.toString());
      }
    }
  }, [measurementUnits, editingProperty]);

  // Re-match builder when builderItems load
  useEffect(() => {
    if (editingProperty && builderItems.length > 0 && !builderValue) {
      if (editingProperty.builderId) {
        setBuilderValue(editingProperty.builderId.toString());
      } else if (editingProperty.builderName) {
        const matchedBuilder = builderItems.find(b => 
          b.label && b.label.toLowerCase() === editingProperty.builderName.toLowerCase()
        );
        if (matchedBuilder) {
          setBuilderValue(matchedBuilder.value);
        }
      }
    }
  }, [builderItems, editingProperty]);

  // Re-match PLC when plcItems load
  useEffect(() => {
    if (editingProperty && plcItems.length > 0 && (!plcValue || plcValue.length === 0)) {
      if (editingProperty.plcIds && Array.isArray(editingProperty.plcIds)) {
        // Format: plcIds as array of IDs
        setPlcValue(editingProperty.plcIds.map(id => id?.toString()));
      } else if (editingProperty.plcs && Array.isArray(editingProperty.plcs)) {
        // Format: plcs as array of objects with id and name
        setPlcValue(editingProperty.plcs.map(plc => plc.id?.toString()));
      } else if (editingProperty.plcNames && Array.isArray(editingProperty.plcNames)) {
        // Format: plcNames as array - match by names
        const matchedPlcs = editingProperty.plcNames.map(name => {
          const matched = plcItems.find(p => p.label && p.label.toLowerCase() === name.toLowerCase());
          return matched ? matched.value : null;
        }).filter(id => id !== null);
        if (matchedPlcs.length > 0) {
          setPlcValue(matchedPlcs);
        }
      }
    }
  }, [plcItems, editingProperty]);

  // Re-match country when countries load
  useEffect(() => {
    if (editingProperty && countries.length > 0 && !countryValue) {
      if (editingProperty.countryId) {
        setCountryValue(editingProperty.countryId.toString());
      } else if (editingProperty.country) {
        const matchedCountry = countries.find(c => 
          c.label && c.label.toLowerCase() === editingProperty.country.toLowerCase()
        );
        if (matchedCountry) {
          setCountryValue(matchedCountry.value);
        }
      }
    }
  }, [countries, editingProperty]);

  // Re-match state when states load
  useEffect(() => {
    if (editingProperty && states.length > 0 && !stateValue) {
      if (editingProperty.stateId) {
        setStateValue(editingProperty.stateId.toString());
      } else if (editingProperty.state) {
        const matchedState = states.find(s => 
          s.label && s.label.toLowerCase() === editingProperty.state.toLowerCase()
        );
        if (matchedState) {
          setStateValue(matchedState.value);
        }
      }
    }
  }, [states, editingProperty]);

  // Re-match district when districts load
  useEffect(() => {
    if (editingProperty && districts.length > 0 && !districtValue) {
      if (editingProperty.districtId) {
        setDistrictValue(editingProperty.districtId.toString());
      } else if (editingProperty.district) {
        const matchedDistrict = districts.find(d => 
          d.label && d.label.toLowerCase() === editingProperty.district.toLowerCase()
        );
        if (matchedDistrict) {
          setDistrictValue(matchedDistrict.value);
        }
      }
    }
  }, [districts, editingProperty]);

  // Re-match RERA when reras load
  useEffect(() => {
    if (editingProperty && reras.length > 0 && !reraDropdownValue) {
      if (editingProperty.reraId) {
        setReraDropdownValue(editingProperty.reraId.toString());
      } else if (editingProperty.reraName) {
        const matchedRera = reras.find(r => 
          r.name && r.name.toLowerCase() === editingProperty.reraName.toLowerCase()
        );
        if (matchedRera) {
          setReraDropdownValue(matchedRera.id.toString());
        }
      }
    }
  }, [reras, editingProperty]);

  // Fetch PLC and Builder options
  useEffect(() => {
    const fetchPlcAndBuilders = async () => {
      try {
        const plcList = await getAllPlc();
        console.log('PLC List:', plcList);
        setPlcItems(Array.isArray(plcList) ? plcList.map(p => ({ label: p.name, value: p.id?.toString() })) : []);
        
        const builderList = await getAllbuilderbyid();
        console.log('Builder List:', builderList);
        setBuilderItems(Array.isArray(builderList) ? builderList.map(b => ({ label: b.name, value: b.id?.toString() })) : []);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
      }
    };
    fetchPlcAndBuilders();
  }, []);

  // Debug measurement units
  useEffect(() => {
    console.log('Measurement Units:', measurementUnits);
  }, [measurementUnits]);

  const saveProject = useSaveProject();

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'reraApproved') {
      setShowReraCard(value);
    }
  };

  const handleReraDetailsChange = (field, value) => {
    setReraDetails(prev => ({ ...prev, [field]: value }));
  };

  const pickMediaFiles = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (!result.canceled) {
      const selectedAssets = result.assets;
      const newFiles = selectedAssets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64,
        type: asset.type || (asset.uri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        name: asset.fileName || asset.uri.split('/').pop(),
        mediaLabel: asset.fileName || 'Project Media',
      }));
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
  };

  const validateEditForm = () => {
    let newErrors = {};
    if (!editForm.projectName) newErrors.projectName = 'Project name is required.';
    if (!builderValue) newErrors.builder = 'Builder is required.';
    if (!possessionValue) newErrors.possession = 'Possession status is required.';
    if (!editForm.startDate) newErrors.startDate = 'Start date is required.';
    if (showReraCard && !reraDetails.reraNo) newErrors.reraNo = 'RERA number is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) {
      alert('Please fill all required fields');
      return;
    }

    setEditLoading(true);
    
    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare mediaDTOs from media files
    const mediaDTOs = mediaFiles.map(file => ({
      id: file.id || undefined,
      mediaLabel: file.mediaLabel || file.name || 'Project Media',
      contentType: file.contentType || file.type || 'image/jpeg',
      mediaBase64: file.mediaBase64 || file.base64 || '',
    }));
    
    const payload = {
      id: editingProperty.id,
      builderId: parseInt(builderValue),
      projectName: editForm.projectName,
      isGated: editForm.isGated,
      isReraApproved: editForm.reraApproved,
      reraId: reraDropdownValue ? parseInt(reraDropdownValue) : null,
      reraNumber: reraDetails.reraNo,
      possessionStatus: possessionValue,
      projectStartDate: editForm.startDate,
      projectCompletionDate: editForm.completionDate,
      addedById: editingProperty.addedById || 1,
      totalArea: parseFloat(editForm.area) || 0,
      areaUnitId: measurementUnitValue ? parseInt(measurementUnitValue) : null,
      description: editForm.description,
      address1: editForm.addressLine1,
      address2: editForm.addressLine2,
      city: editForm.city,
      pincode: editForm.pincode || "",
      districtId: districtValue ? parseInt(districtValue) : null,
      stateId: stateValue ? parseInt(stateValue) : null,
      countryId: countryValue ? parseInt(countryValue) : null,
      currentDayDate: currentDate,
      plcIds: plcValue && plcValue.length > 0 ? plcValue.map(id => parseInt(id)) : [],
      mediaDTOs: mediaDTOs
    };

    try {
      await saveProject(payload);
      setEditModalVisible(false);
      setEditingProperty(null);
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleEditPress = (property) => {
    setEditingProperty(property);
    setEditModalVisible(true);
    
    // Populate form with property data - using correct field names from API
    setEditForm({
      projectName: property.projectName || '',
      startDate: property.projectStartDate || '',
      completionDate: property.projectCompletionDate || '',
      description: property.description || '',
      isGated: property.isGated || false,
      reraApproved: property.isReraApproved || false,
      addressLine1: property.address1 || property.addressLine1 || '',
      addressLine2: property.address2 || property.addressLine2 || '',
      city: property.city || '',
      pincode: property.pincode || '',
      area: property.totalArea || '',
    });
    
    // Builder: Try ID first, then match by name
    if (property.builderId) {
      setBuilderValue(property.builderId.toString());
    } else if (property.builderName && builderItems.length > 0) {
      const matchedBuilder = builderItems.find(b => 
        b.label && b.label.toLowerCase() === property.builderName.toLowerCase()
      );
      setBuilderValue(matchedBuilder ? matchedBuilder.value : null);
    } else {
      setBuilderValue(null);
    }
    
    setPossessionValue(property.possessionStatusEnum || null);
    
    // Measurement Unit: Try ID first, then match by name
    if (property.areaUnitId) {
      setMeasurementUnitValue(property.areaUnitId.toString());
    } else if (property.areaUnitName && measurementUnits && measurementUnits.length > 0) {
      const matchedUnit = measurementUnits.find(u => 
        (u.name || u.unitName)?.toLowerCase() === property.areaUnitName.toLowerCase()
      );
      setMeasurementUnitValue(matchedUnit ? (matchedUnit.id || matchedUnit.unitId)?.toString() : null);
    } else {
      setMeasurementUnitValue(null);
    }
    
    // Country: Try ID first, then match by name
    if (property.countryId) {
      setCountryValue(property.countryId.toString());
    } else if (property.country && countries.length > 0) {
      const matchedCountry = countries.find(c => 
        c.label && c.label.toLowerCase() === property.country.toLowerCase()
      );
      setCountryValue(matchedCountry ? matchedCountry.value : null);
    } else {
      setCountryValue(null);
    }
    
    // State: Try ID first, then match by name
    if (property.stateId) {
      setStateValue(property.stateId.toString());
    } else if (property.state && states.length > 0) {
      const matchedState = states.find(s => 
        s.label && s.label.toLowerCase() === property.state.toLowerCase()
      );
      setStateValue(matchedState ? matchedState.value : null);
    } else {
      setStateValue(null);
    }
    
    // District: Try ID first, then match by name
    if (property.districtId) {
      setDistrictValue(property.districtId.toString());
    } else if (property.district && districts.length > 0) {
      const matchedDistrict = districts.find(d => 
        d.label && d.label.toLowerCase() === property.district.toLowerCase()
      );
      setDistrictValue(matchedDistrict ? matchedDistrict.value : null);
    } else {
      setDistrictValue(null);
    }
    
    // Set PLC values - handle different formats
    if (property.plcIds && Array.isArray(property.plcIds)) {
      // Format: plcIds as array of IDs
      setPlcValue(property.plcIds.map(id => id?.toString()));
    } else if (property.plcs && Array.isArray(property.plcs)) {
      // Format: plcs as array of objects with id and name
      setPlcValue(property.plcs.map(plc => plc.id?.toString()));
    } else if (property.plcId) {
      // Format: single plcId
      setPlcValue([property.plcId?.toString()]);
    } else if (property.plcNames && Array.isArray(property.plcNames) && plcItems.length > 0) {
      // Format: plcNames as array - match by names
      const matchedPlcs = property.plcNames.map(name => {
        const matched = plcItems.find(p => p.label && p.label.toLowerCase() === name.toLowerCase());
        return matched ? matched.value : null;
      }).filter(id => id !== null);
      setPlcValue(matchedPlcs);
    } else {
      setPlcValue([]);
    }
    
    setShowReraCard(property.isReraApproved || false);
    setReraDetails({ reraNo: property.reraNumber || property.reraNo || '' });
    
    // RERA: Try ID first, then match by name
    if (property.reraId) {
      setReraDropdownValue(property.reraId.toString());
    } else if (property.reraName && reras.length > 0) {
      const matchedRera = reras.find(r => 
        r.name && r.name.toLowerCase() === property.reraName.toLowerCase()
      );
      setReraDropdownValue(matchedRera ? matchedRera.id.toString() : null);
    } else {
      setReraDropdownValue(null);
    }
    
    setMediaFiles(property.mediaDTOs || []);
  };

  const handleActionsPress = (property) => {
    setSelectedProperty(property);
    setActionsModalVisible(true);
  };

  const handleViewPress = (property) => {
    setViewProperty(property);
    setViewModalVisible(true);
  };

  const handleOpenImageModal = () => {
    setImageModalVisible(true);
  };

  const handleOpenPDF = (pdfUrl) => {
    if (!pdfUrl) {
      console.error("PDF URL is missing or invalid.");
      alert("Project details PDF is not available.");
      return;
    }

    Linking.openURL(pdfUrl).catch((err) => {
      console.error("Failed to open PDF:", err);
      alert("Failed to open the PDF. Please try again later.");
    });
  };

  const handleActionOptionPress = (option) => {
    switch (option) {
      case "Add Property Summary":
        router.push({
          pathname: "./PropertySummaryPage",
          params: { 
            propertyData: JSON.stringify(selectedProperty),
            projectId: selectedProperty?.id?.toString() || ''
          },
        });
        setActionsModalVisible(false);
        break;
      case "View Property Summary":
        console.log("View Property Summary for:", selectedProperty?.projectName);
        setActionsModalVisible(false);
        break;
      default:
        console.log(`No action defined for option: ${option}`);
        setActionsModalVisible(false);
        return;
    }
  };

  const handleDeletePress = (property) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${property.projectName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await performDelete(property);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const performDelete = async (property) => {
    try {
      const result = await deleteProject(property.id);
      if (result.success) {
        Alert.alert('Success', 'Project deleted successfully!');
      } else {
        Alert.alert('Error', `Failed to delete project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('Error', 'Failed to delete project');
    }
  };

  const renderEditModal = () => {
    if (!editingProperty) return null;

    return (
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.editModalBackground}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Project</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editModalScroll} showsVerticalScrollIndicator={false}>
              {/* Project Name */}
              <Text style={styles.editLabel}>Project Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                placeholder="Enter project name"
                value={editForm.projectName}
                onChangeText={text => handleEditFormChange('projectName', text)}
                style={styles.editInput}
                placeholderTextColor="#999"
              />
              {errors.projectName && <Text style={styles.errorText}>{errors.projectName}</Text>}

              {/* Builder */}
              <Text style={styles.editLabel}>Builder <Text style={styles.required}>*</Text></Text>
              <DropDownPicker
                open={builderOpen}
                value={builderValue}
                items={builderItems}
                setOpen={setBuilderOpen}
                setValue={setBuilderValue}
                setItems={setBuilderItems}
                placeholder="Select Builder"
                style={styles.editDropdown}
                dropDownContainerStyle={styles.editDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={3000}
                maxHeight={200}
              />
              {errors.builder && <Text style={styles.errorText}>{errors.builder}</Text>}

              {/* Possession Status */}
              <Text style={styles.editLabel}>Possession Status <Text style={styles.required}>*</Text></Text>
              <DropDownPicker
                open={possessionOpen}
                value={possessionValue}
                items={possessionItems}
                setOpen={setPossessionOpen}
                setValue={setPossessionValue}
                setItems={setPossessionItems}
                placeholder="Select Possession Status"
                style={styles.editDropdown}
                dropDownContainerStyle={styles.editDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={2900}
                maxHeight={200}
              />
              {errors.possession && <Text style={styles.errorText}>{errors.possession}</Text>}

              {/* Start Date */}
              <Text style={styles.editLabel}>Start Date <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(prev => ({ ...prev, start: true }))}
                style={[styles.editInput, { justifyContent: 'center' }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: editForm.startDate ? '#333' : '#999' }}>
                  {editForm.startDate ? formatDate(editForm.startDate) : 'Select Start Date'}
                </Text>
              </TouchableOpacity>
              {datePickerVisible.start && (
                <DateTimePicker
                  value={editForm.startDate ? new Date(editForm.startDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setDatePickerVisible(prev => ({ ...prev, start: false }));
                    if (selectedDate) {
                      handleEditFormChange('startDate', selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
              {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}

              {/* Completion Date */}
              <Text style={styles.editLabel}>Completion Date</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(prev => ({ ...prev, completion: true }))}
                style={[styles.editInput, { justifyContent: 'center' }]}
                activeOpacity={0.7}
              >
                <Text style={{ color: editForm.completionDate ? '#333' : '#999' }}>
                  {editForm.completionDate ? formatDate(editForm.completionDate) : 'Select Completion Date'}
                </Text>
              </TouchableOpacity>
              {datePickerVisible.completion && (
                <DateTimePicker
                  value={editForm.completionDate ? new Date(editForm.completionDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setDatePickerVisible(prev => ({ ...prev, completion: false }));
                    if (selectedDate) {
                      handleEditFormChange('completionDate', selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editLabel}>Area</Text>
                  <TextInput
                    placeholder="Enter area"
                    value={editForm.area?.toString() || ''}
                    onChangeText={text => handleEditFormChange('area', text)}
                    style={styles.editInput}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.editLabel}>Unit</Text>
                  <DropDownPicker
                    open={measurementUnitOpen}
                    value={measurementUnitValue}
                    items={measurementUnits && measurementUnits.length > 0 
                      ? measurementUnits.map(u => ({ 
                          label: u.name || u.unitName, 
                          value: u.id?.toString() || u.unitId?.toString() 
                        }))
                      : []
                    }
                    setOpen={setMeasurementUnitOpen}
                    setValue={setMeasurementUnitValue}
                    setItems={() => {}}
                    placeholder="Select Unit"
                    style={styles.editDropdown}
                    dropDownContainerStyle={styles.editDropdownContainer}
                    listMode="SCROLLVIEW"
                    zIndex={2800}
                    maxHeight={200}
                    loading={measurementUnitsLoading}
                  />
                </View>
              </View>

              {/* PLC */}
              <Text style={styles.editLabel}>PLC</Text>
              <DropDownPicker
                open={plcOpen}
                value={plcValue}
                items={plcItems}
                setOpen={setPlcOpen}
                setValue={setPlcValue}
                setItems={setPlcItems}
                placeholder="Select PLC (Multiple)"
                style={styles.editDropdown}
                dropDownContainerStyle={styles.editDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={2700}
                maxHeight={200}
                multiple={true}
                mode="BADGE"
                badgeDotColors={["#2e7d32", "#5aaf57", "#8bc34a", "#c8e6c9"]}
              />

              {/* Description */}
              <Text style={styles.editLabel}>Description</Text>
              <TextInput
                placeholder="Enter description"
                value={editForm.description}
                onChangeText={text => handleEditFormChange('description', text)}
                style={[styles.editInput, { height: 100, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />

              {/* Is Gated */}
              <View style={styles.switchRow}>
                <Text style={styles.editLabel}>Is Gated Community?</Text>
                <Switch
                  value={editForm.isGated}
                  onValueChange={(value) => handleEditFormChange('isGated', value)}
                  trackColor={{ false: '#ddd', true: '#5aaf57' }}
                  thumbColor={editForm.isGated ? '#2e7d32' : '#f4f3f4'}
                />
              </View>

              {/* RERA Approved */}
              <View style={styles.switchRow}>
                <Text style={styles.editLabel}>RERA Approved?</Text>
                <Switch
                  value={editForm.reraApproved}
                  onValueChange={(value) => handleEditFormChange('reraApproved', value)}
                  trackColor={{ false: '#ddd', true: '#5aaf57' }}
                  thumbColor={editForm.reraApproved ? '#2e7d32' : '#f4f3f4'}
                />
              </View>

              {/* RERA Details */}
              {showReraCard && (
                <>
                  <Text style={styles.editSectionTitle}>RERA Details</Text>
                  <Text style={styles.editLabel}>RERA No. <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    placeholder="Enter RERA Number"
                    value={reraDetails.reraNo}
                    onChangeText={text => handleReraDetailsChange('reraNo', text)}
                    style={styles.editInput}
                    placeholderTextColor="#999"
                  />
                  {errors.reraNo && <Text style={styles.errorText}>{errors.reraNo}</Text>}

                  <Text style={styles.editLabel}>RERA</Text>
                  <DropDownPicker
                    open={reraDropdownOpen}
                    value={reraDropdownValue}
                    items={reras.map(r => ({ label: r.name, value: r.id.toString() }))}
                    setOpen={setReraDropdownOpen}
                    setValue={setReraDropdownValue}
                    setItems={() => {}}
                    placeholder="Select RERA"
                    style={styles.editDropdown}
                    dropDownContainerStyle={styles.editDropdownContainer}
                    listMode="SCROLLVIEW"
                    zIndex={2600}
                    maxHeight={200}
                    loading={reraLoading}
                  />
                </>
              )}

              {/* Address Details */}
              <Text style={styles.editSectionTitle}>Address Details</Text>

              <Text style={styles.editLabel}>Country</Text>
              <DropDownPicker
                open={countryOpen}
                value={countryValue}
                items={countries}
                setOpen={setCountryOpen}
                setValue={setCountryValue}
                setItems={() => {}}
                placeholder="Select Country"
                style={styles.editDropdown}
                dropDownContainerStyle={styles.editDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={2500}
                maxHeight={200}
                onChangeValue={(value) => {
                  setCountryValue(value);
                  setStateValue(null);
                  setDistrictValue(null);
                }}
                loading={dropdownLoading}
              />

              <Text style={styles.editLabel}>State</Text>
              <DropDownPicker
                open={stateOpen}
                value={stateValue}
                items={states}
                setOpen={setStateOpen}
                setValue={setStateValue}
                setItems={() => {}}
                placeholder="Select State"
                style={styles.editDropdown}
                dropDownContainerStyle={styles.editDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={2400}
                maxHeight={200}
                disabled={!countryValue}
                onChangeValue={(value) => {
                  setStateValue(value);
                  setDistrictValue(null);
                }}
                loading={dropdownLoading}
              />

              <Text style={styles.editLabel}>District</Text>
              <DropDownPicker
                open={districtOpen}
                value={districtValue}
                items={districts}
                setOpen={setDistrictOpen}
                setValue={setDistrictValue}
                setItems={() => {}}
                placeholder="Select District"
                style={styles.editDropdown}
                dropDownContainerStyle={styles.editDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={2300}
                maxHeight={200}
                disabled={!stateValue}
                loading={dropdownLoading}
              />

              <Text style={styles.editLabel}>City</Text>
              <TextInput
                placeholder="Enter city"
                value={editForm.city}
                onChangeText={text => handleEditFormChange('city', text)}
                style={styles.editInput}
                placeholderTextColor="#999"
              />

              <Text style={styles.editLabel}>Pincode</Text>
              <TextInput
                placeholder="Enter pincode"
                value={editForm.pincode}
                onChangeText={text => handleEditFormChange('pincode', text)}
                style={styles.editInput}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={styles.editLabel}>Address Line 1</Text>
              <TextInput
                placeholder="Enter address line 1"
                value={editForm.addressLine1}
                onChangeText={text => handleEditFormChange('addressLine1', text)}
                style={styles.editInput}
                placeholderTextColor="#999"
              />

              <Text style={styles.editLabel}>Address Line 2</Text>
              <TextInput
                placeholder="Enter address line 2"
                value={editForm.addressLine2}
                onChangeText={text => handleEditFormChange('addressLine2', text)}
                style={styles.editInput}
                placeholderTextColor="#999"
              />

              {/* Media Files Section */}
              <Text style={styles.editSectionTitle}>Media Files</Text>
              
              <TouchableOpacity 
                style={styles.mediaUploadButton}
                onPress={pickMediaFiles}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#2e7d32" />
                <Text style={styles.mediaUploadText}>Upload Media Files</Text>
              </TouchableOpacity>

              {mediaFiles.length > 0 && (
                <View style={styles.mediaFilesContainer}>
                  {mediaFiles.map((file, index) => (
                    <View key={index} style={styles.mediaFileItem}>
                      <View style={styles.mediaFileInfo}>
                        <Ionicons 
                          name={file.filePath || file.uri ? (file.type?.includes('pdf') ? 'document' : 'image') : 'close-circle'} 
                          size={20} 
                          color="#2e7d32" 
                        />
                        <Text style={styles.mediaFileName} numberOfLines={1}>
                          {file.mediaLabel || file.name || `Media ${index + 1}`}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeMediaFile(index)}>
                        <Ionicons name="trash-outline" size={20} color="#d32f2f" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.editSubmitButton} 
                onPress={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.editSubmitButtonText}>Update Project</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderActionOptions = () => {
    if (!selectedProperty) return null;

    const options = ["Add Property Summary", "View Property Summary"];

    return (
      <View style={styles.actionOptionsContainer}>
        <Text style={styles.modalTitle}>Options:</Text>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionOptionBtn}
            onPress={() => handleActionOptionPress(option)}
          >
            <Text style={styles.actionOptionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderViewModal = () => {
    if (!viewProperty) return null;

    return (
      <Modal
        visible={viewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setViewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setViewModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>{viewProperty.projectName}</Text>
                <Text style={styles.modalSubtitle}>{viewProperty.builderName || "N/A"}</Text>
                <Text style={styles.modalText}>
                  Start Date: {viewProperty.projectStartDate || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  Completion Date: {viewProperty.projectCompletionDate || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  Possession Status: {viewProperty.possessionStatusEnum || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  RERA Approved: {viewProperty.isReraApproved ? "Yes" : "No"}
                </Text>
                <Text style={styles.modalText}>
                  Total Area: {viewProperty.totalArea ? `${viewProperty.totalArea} ${viewProperty.areaUnitName || ""}` : "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  Description: {viewProperty.description || "N/A"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderImageModal = () => {
    if (!viewProperty) return null;

    return (
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalBackground}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: viewProperty.pic }}
            style={styles.fullscreenImage}
          />
        </View>
      </Modal>
    );
  };

  const renderProperty = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.nameDeptWrapper}>
        <Text style={styles.name} numberOfLines={1}>
          {item.projectName}
        </Text>
        <Text style={styles.department} numberOfLines={1}>
          {item.builderName || "N/A"}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {item.description || "No description available"}
        </Text>
      </View>
      <View style={styles.actionIcons}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleEditPress(item)}
        >
          <Feather name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleViewPress(item)}
        >
          <Feather name="eye" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDeletePress(item)}
        >
          <Feather name="trash-2" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleActionsPress(item)}
        >
          <Feather name="more-horizontal" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredProperties = projects.filter((prop) => {
    const lowerCaseQuery = searchQuery?.toLowerCase() || "";
    const lowerCaseName = prop.projectName?.toLowerCase() || "";
    const lowerCaseBuilder = prop.builderName?.toLowerCase() || "";
    return (
      lowerCaseName.includes(lowerCaseQuery) ||
      lowerCaseBuilder.includes(lowerCaseQuery)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={24} color="#004d40" />
          </TouchableOpacity>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <LottieView
            source={require("../../../../assets/svg/reales.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
          <Text style={{ fontSize: 16, color: '#666', fontFamily: 'PlusR', marginTop: 10 }}>
            Loading projects...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#004d40" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Manage</Text>
          <Text style={styles.headerSubTitle}>Projects</Text>
          <Text style={styles.headerDesc}>
            Search for a property by name or builder!
          </Text>
        </View>
        <LottieView
          source={require("../../../../assets/svg/reales.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color="#004d40"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search properties..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery?.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <AntDesign name="closecircle" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderProperty}
      />
      <Modal
        visible={actionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActionsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHandle} />
                {renderActionOptions()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {renderViewModal()}
      {renderImageModal()}
      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 25 : 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "PlusSB",
    color: "#333",
  },
  headerSubTitle: {
    fontSize: 32,
    fontFamily: "PlusSB",
    color: "#5aaf57",
  },
  headerDesc: {
    fontSize: 13,
    fontFamily: "PlusL",
    color: "#666",
    marginTop: 5,
  },
  lottie: {
    width: 90,
    height: 90,
    marginTop: -40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchBar: {
    flex: 1,
    height: 45,
    fontSize: 15,
    fontFamily: "PlusL",
    color: "#004d40",
    paddingLeft: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#03471aff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderLeftColor: "#fff",
  },
  nameDeptWrapper: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: "#fff",
  },
  department: {
    fontSize: 12,
    fontFamily: "PlusL",
    color: "#fff",
    marginTop: 1,
  },
  address: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "PlusL",
    marginTop: 3,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: "center",
    elevation: 10,
  },
  modalHandle: {
    width: 50,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 15,
  },
  actionOptionsContainer: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PlusSB',
    marginBottom: 15,
    color: "#064226ff",
  },
  actionOptionBtn: {
    padding: 12,
    backgroundColor: "#033b01ff",
    borderRadius: 20,
    marginBottom: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionOptionText: {
    fontSize: 15,
    fontFamily: 'PlusR',
    color: "#fff",
  },
  imageModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'PlusR',
    color: "#666",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'PlusL',
    color: "#333",
    marginBottom: 8,
  },
  // Edit Modal Styles
  editModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "95%",
    maxHeight: "90%",
    paddingBottom: 20,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  editModalTitle: {
    fontSize: 22,
    fontFamily: "PlusSB",
    color: "#2e7d32",
  },
  editModalScroll: {
    padding: 20,
  },
  editLabel: {
    fontSize: 15,
    fontFamily: "PlusR",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  required: {
    color: "#d32f2f",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: "#f0f8f0",
    color: "#333",
    fontSize: 15,
    fontFamily: "PlusL",
  },
  editDropdown: {
    borderColor: "#c8e6c9",
    borderRadius: 8,
    backgroundColor: "#f0f8f0",
    marginBottom: 15,
  },
  editDropdownContainer: {
    borderColor: "#c8e6c9",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f4fcf4",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
    paddingVertical: 8,
  },
  editSectionTitle: {
    fontSize: 18,
    fontFamily: "PlusSB",
    color: "#2e7d32",
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    fontFamily: "PlusR",
    marginTop: -5,
    marginBottom: 10,
  },
  editSubmitButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#2e7d32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  editSubmitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "PlusSB",
    textTransform: "uppercase",
  },
  mediaUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#2e7d32',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    gap: 10,
  },
  mediaUploadText: {
    fontSize: 16,
    fontFamily: 'PlusR',
    color: '#2e7d32',
  },
  mediaFilesContainer: {
    marginBottom: 15,
  },
  mediaFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  mediaFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mediaFileName: {
    fontSize: 14,
    fontFamily: 'PlusR',
    color: '#333',
    flex: 1,
  },
});

export default ManageProjects;
