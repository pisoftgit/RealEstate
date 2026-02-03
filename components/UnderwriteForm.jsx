import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TextInput, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import useAssignFrom from '../hooks/useAssignFrom';
import * as SecureStore from 'expo-secure-store';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const COLORS = {
  primary: '#2e7d32',
  primaryLight: '#58b26e',
  secondary: '#8bc34a',
  background: '#e8f5e9',
  card: '#f4fcf4',
  input: '#f0f8f0',
  border: '#c8e6c9',
  text: '#333333',
  placeholder: '#66bb6a',
  error: '#d32f2f',
};

const STYLES = StyleSheet.create({
  label: {
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: hp('0.7%'),
    marginTop: hp('1.2%'),
    fontFamily: 'PlusR',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginBottom: hp('0.7%'),
    backgroundColor: COLORS.input,
    color: COLORS.text,
    fontSize: wp('4%'),
    fontFamily: 'PlusL',
  },
  dropdown: {
    borderColor: COLORS.border,
    borderRadius: wp('2%'),
    backgroundColor: COLORS.input,
    marginBottom: hp('2%'),
    fontFamily: 'PlusR',
  },
  dropdownContainer: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: wp('2%'),
    backgroundColor: COLORS.card,
    fontFamily: 'PlusR',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: wp('4%'),
    padding: wp('2.5%'),
    marginHorizontal: wp('2.5%'),
    marginBottom: hp('2.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 5,
  },
});

const UnderwriteForm = ({ level }) => {
  // Dropdown states
  const [assignFromOpen, setAssignFromOpen] = useState(false);
  const [assignFromValue, setAssignFromValue] = useState(null);
  const [assignFromItems, setAssignFromItems] = useState([]);

  const { getAssignedFrom, assignedFrom, loading: assignFromLoading, getAllSellers, getSellersBySellerTypeId, getProjectsByBuilderId, getPropertyTypesForAssignments, getSubPropertyTypesForAssignments, getSubPropertyTypeById, getDistinctTowerPropertyItemsForAssignments, getDistinctStructuresForAssignments, getUnitsForAssignments, getAllDurationUnits } = useAssignFrom();

  useEffect(() => {
    const fetchAssignFrom = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userid');
        if (level && userId) {
          console.log('API: getAssignedFrom', { level, userId });
          await getAssignedFrom(level, userId);
        }
      } catch (e) {
        // handle error if needed
      }
    };
    fetchAssignFrom();
  }, [level]);

  useEffect(() => {
    if (Array.isArray(assignedFrom)) {
      setAssignFromItems(
        assignedFrom
          .filter(item => item.name)
          .map(item => ({ label: item.name, value: item.id }))
      );
    }
  }, [assignedFrom]);

  // Seller Type Dropdown (from API)
  const [sellerTypeOpen, setSellerTypeOpen] = useState(false);
  const [sellerTypeValue, setSellerTypeValue] = useState(null);
  const [sellerTypeItems, setSellerTypeItems] = useState([]);

  useEffect(() => {
    const fetchSellerTypes = async () => {
      try {
        console.log('API: getAllSellers');
        const data = await getAllSellers();
        if (Array.isArray(data)) {
          setSellerTypeItems(data.map(item => ({ label: item.nature, value: item.id })));
        } else if (data?.data && Array.isArray(data.data)) {
          setSellerTypeItems(data.data.map(item => ({ label: item.nature, value: item.id })));
        }
      } catch (e) {
        // handle error if needed
      }
    };
    fetchSellerTypes();
  }, []);

  const [sellerOpen, setSellerOpen] = useState(false);
  const [sellerValue, setSellerValue] = useState(null);
  const [sellerItems, setSellerItems] = useState([]);

  // Fetch sellers when sellerTypeValue changes
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        if (!sellerTypeValue) {
          setSellerItems([]);
          setSellerValue(null);
          return;
        }
        const userId = await SecureStore.getItemAsync('userid');
        if (!userId) return;
        console.log('API: getSellersBySellerTypeId', { sellerTypeValue, userId });
        const data = await getSellersBySellerTypeId(sellerTypeValue, userId);
        // Always map all items, even if name is missing
        let items = [];
        if (Array.isArray(data)) {
          items = data.map(item => ({ label: item.name || String(item.id), value: item.id }));
        } else if (data?.data && Array.isArray(data.data)) {
          items = data.data.map(item => ({ label: item.name || String(item.id), value: item.id }));
        }
        setSellerItems(items);
        setSellerValue(null);
      } catch (e) {
        setSellerItems([]);
        setSellerValue(null);
      }
    };
    fetchSellers();
  }, [sellerTypeValue]);

  const [projectOpen, setProjectOpen] = useState(false);
  const [projectValue, setProjectValue] = useState(null);
  const [projectItems, setProjectItems] = useState([]);

  // Fetch projects when assignFromValue changes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!assignFromValue || !level) {
          setProjectItems([]);
          setProjectValue(null);
          return;
        }
        console.log('API: getProjectsByBuilderId', { assignFromValue, level });
        const data = await getProjectsByBuilderId(assignFromValue, level);
        if (Array.isArray(data)) {
          setProjectItems(
            data.filter(item => item.projectName).map(item => ({ label: item.projectName, value: item.id }))
          );
        } else if (data?.data && Array.isArray(data.data)) {
          setProjectItems(
            data.data.filter(item => item.projectName).map(item => ({ label: item.projectName, value: item.id }))
          );
        } else {
          setProjectItems([]);
        }
        setProjectValue(null);
      } catch (e) {
        setProjectItems([]);
        setProjectValue(null);
      }
    };
    fetchProjects();
  }, [assignFromValue, level]);

  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [propertyTypeValue, setPropertyTypeValue] = useState(null);
  const [propertyTypeItems, setPropertyTypeItems] = useState([]);


  // Sub Property Types Dropdown
  const [subPropertyTypeOpen, setSubPropertyTypeOpen] = useState(false);
  const [subPropertyTypeValue, setSubPropertyTypeValue] = useState(null);
  const [subPropertyTypeItems, setSubPropertyTypeItems] = useState([]);

  // Fetch sub property types when assignFromValue (realtorId), projectValue (projectId), propertyTypeValue (propertyTypeId), or level changes
  useEffect(() => {
    const fetchSubPropertyTypes = async () => {
      // realtorId comes from Assign From dropdown
      const realtorId = assignFromValue;
      // projectId comes from Project dropdown
      const projectId = projectValue;
      // propertyTypeId comes from Property Type dropdown
      const propertyTypeId = propertyTypeValue;
      if (!realtorId || !projectId || !propertyTypeId || !level) {
        setSubPropertyTypeItems([]);
        setSubPropertyTypeValue(null);
        return;
      }
      try {
        console.log('API: getSubPropertyTypesForAssignments', { realtorId, projectId, propertyTypeId, level });
        const data = await getSubPropertyTypesForAssignments(realtorId, projectId, propertyTypeId, level);
        console.log('API Response: getSubPropertyTypesForAssignments', data);
        if (Array.isArray(data)) {
          setSubPropertyTypeItems(
            data.map(item => ({ label: item.subPropertyTypeName || item.propertyName, value: item.id }))
          );
        } else if (data?.data && Array.isArray(data.data)) {
          setSubPropertyTypeItems(
            data.data.map(item => ({ label: item.subPropertyTypeName || item.propertyName, value: item.id }))
          );
        } else {
          setSubPropertyTypeItems([]);
        }
        setSubPropertyTypeValue(null);
      } catch (e) {
        console.log('API Error: getSubPropertyTypesForAssignments', e);
        setSubPropertyTypeItems([]);
        setSubPropertyTypeValue(null);
      }
    };
    fetchSubPropertyTypes();
  }, [assignFromValue, projectValue, propertyTypeValue, level]);

  // Fetch property types when assignFromValue, projectValue, or level changes
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        if (!assignFromValue || !projectValue || !level) {
          setPropertyTypeItems([]);
          setPropertyTypeValue(null);
          return;
        }
        console.log('API: getPropertyTypesForAssignments', { assignFromValue, projectValue, level });
        const data = await getPropertyTypesForAssignments(assignFromValue, projectValue, level);
        if (Array.isArray(data)) {
          setPropertyTypeItems(
            data.filter(item => item.propertyName).map(item => ({ label: item.propertyName, value: item.id }))
          );
        } else if (data?.data && Array.isArray(data.data)) {
          setPropertyTypeItems(
            data.data.filter(item => item.propertyName).map(item => ({ label: item.propertyName, value: item.id }))
          );
        } else {
          setPropertyTypeItems([]);
        }
        setPropertyTypeValue(null);
      } catch (e) {
        setPropertyTypeItems([]);
        setPropertyTypeValue(null);
      }
    };
    fetchPropertyTypes();
  }, [assignFromValue, projectValue, level]);

  const [propertyItemOpen, setPropertyItemOpen] = useState(false);
  const [propertyItemValue, setPropertyItemValue] = useState(null);
  const [propertyItemItems, setPropertyItemItems] = useState([
    { label: 'Item 1', value: 'item1' },
    { label: 'Item 2', value: 'item2' },
  ]);

  const [towerItemOpen, setTowerItemOpen] = useState(false);
  const [towerItemValue, setTowerItemValue] = useState(null);
  const [towerItemItems, setTowerItemItems] = useState([
    { label: 'Tower 1', value: 'tower1' },
    { label: 'Tower 2', value: 'tower2' },
  ]);

  const [structureOpen, setStructureOpen] = useState(false);
  const [structureValue, setStructureValue] = useState(null);
  const [structureItems, setStructureItems] = useState([
    { label: 'Structure 1', value: 'structure1' },
    { label: 'Structure 2', value: 'structure2' },
  ]);

  const [unitsOpen, setUnitsOpen] = useState(false);
  const [unitsValue, setUnitsValue] = useState([]);
  const [unitsItems, setUnitsItems] = useState([
    { label: 'Unit 1', value: 'unit1' },
    { label: 'Unit 2', value: 'unit2' },
    { label: 'Unit 3', value: 'unit3' },
  ]);

  const [commissionBased, setCommissionBased] = useState(false);
  const [duration, setDuration] = useState('');
  const [durationTypeOpen, setDurationTypeOpen] = useState(false);
  const [durationTypeValue, setDurationTypeValue] = useState(null);
  const [durationTypeItems, setDurationTypeItems] = useState([
    { label: 'Days', value: 'days' },
    { label: 'Months', value: 'months' },
    { label: 'Years', value: 'years' },
  ]);
  const [settlementPrice, setSettlementPrice] = useState('');
  const [commission, setCommission] = useState('');
  const [commissionTypeOpen, setCommissionTypeOpen] = useState(false);
  const [commissionTypeValue, setCommissionTypeValue] = useState(null);
  const [commissionTypeItems, setCommissionTypeItems] = useState([
    { label: 'Percentage', value: 'true' },
    { label: 'Lumsum', value: 'false' },
  ]);
  const [commissionIsPercentage, setCommissionIsPercentage] = useState(false);

  const [showTowerItem, setShowTowerItem] = useState(false);
  const [showStructure, setShowStructure] = useState(false);

  // Log sub property type details and set visibility when selected
  useEffect(() => {
    const fetchSubPropertyTypeDetails = async () => {
      if (subPropertyTypeValue) {
        const result = await getSubPropertyTypeById(subPropertyTypeValue);
        console.log('API Response: getSubPropertyTypeById', result);
        if (result) {
          if (result.isMultiTower) {
            setShowTowerItem(true);
            setShowStructure(true);
          } else if (result.isHouseVilla) {
            setShowTowerItem(false);
            setShowStructure(true);
          } else {
            setShowTowerItem(false);
            setShowStructure(false);
          }
        } else {
          setShowTowerItem(false);
          setShowStructure(false);
        }
      } else {
        setShowTowerItem(false);
        setShowStructure(false);
      }
    };
    fetchSubPropertyTypeDetails();
  }, [subPropertyTypeValue]);

  // Fetch and display Tower Item dropdown data using getDistinctTowerPropertyItemsForAssignments API when showTowerItem is true and dependencies change
  useEffect(() => {
    const fetchTowerItems = async () => {
      if (showTowerItem && projectValue && subPropertyTypeValue && level && assignFromValue) {
        const data = await getDistinctTowerPropertyItemsForAssignments(projectValue, subPropertyTypeValue, level, assignFromValue);
        console.log('API Response: getDistinctTowerPropertyItemsForAssignments', data);
        if (Array.isArray(data)) {
          setTowerItemItems(data.map(item => ({ label: item.name, value: item.id })));
        } else if (data?.data && Array.isArray(data.data)) {
          setTowerItemItems(data.data.map(item => ({ label: item.name, value: item.id })));
        } else {
          setTowerItemItems([]);
        }
      } else {
        setTowerItemItems([]);
      }
    };
    fetchTowerItems();
  }, [showTowerItem, projectValue, subPropertyTypeValue, level, assignFromValue]);

  // Fetch and display Structure dropdown data using getDistinctStructuresForAssignments API when showStructure is true and dependencies change
  useEffect(() => {
    const fetchStructureItems = async () => {
      if (showStructure && projectValue && subPropertyTypeValue && level && assignFromValue) {
        // towerItemValue is required for API, if tower section is visible
        const towerId = showTowerItem ? (towerItemValue || null) : null;
        if (showTowerItem && !towerItemValue) {
          setStructureItems([]);
          return;
        }
        const data = await getDistinctStructuresForAssignments(projectValue, subPropertyTypeValue, towerId, level, assignFromValue);
        console.log('API Response: getDistinctStructuresForAssignments', data);
        if (Array.isArray(data)) {
          setStructureItems(data.map(item => ({ label: item.structure, value: item.id })));
        } else if (data?.data && Array.isArray(data.data)) {
          setStructureItems(data.data.map(item => ({ label: item.structure, value: item.id })));
        } else {
          setStructureItems([]);
        }
      } else {
        setStructureItems([]);
      }
    };
    fetchStructureItems();
  }, [showStructure, projectValue, subPropertyTypeValue, towerItemValue, level, assignFromValue, showTowerItem]);

  // Fetch units when dependencies change
  useEffect(() => {
    const fetchUnits = async () => {
      if (projectValue && subPropertyTypeValue && structureValue && level && assignFromValue) {
        // towerItemValue can be null
        const towerId = showTowerItem ? (towerItemValue || null) : null;
        const data = await getUnitsForAssignments(projectValue, subPropertyTypeValue, structureValue, towerId, level, assignFromValue);
        console.log('API Response: getUnitsForAssignments', data);
        if (Array.isArray(data)) {
          setUnitsItems(data.map(item => ({ label: item.propertyName, value: item.id })));
        } else if (data?.data && Array.isArray(data.data)) {
          setUnitsItems(data.data.map(item => ({ label: item.propertyName, value: item.id })));
        } else {
          setUnitsItems([]);
        }
      } else {
        setUnitsItems([]);
      }
    };
    fetchUnits();
  }, [projectValue, subPropertyTypeValue, structureValue, towerItemValue, level, assignFromValue, showTowerItem]);

  // Fetch duration units for Duration Type dropdown
  useEffect(() => {
    const fetchDurationUnits = async () => {
      const data = await getAllDurationUnits();
      if (Array.isArray(data)) {
        setDurationTypeItems(data.map(unit => ({ label: unit.charAt(0) + unit.slice(1).toLowerCase(), value: unit.toLowerCase() })));
      } else {
        setDurationTypeItems([]);
      }
    };
    fetchDurationUnits();
  }, []);

  useEffect(() => {
    if (commissionTypeValue === 'percentage') {
      setCommissionIsPercentage(true);
    } else {
      setCommissionIsPercentage(false);
    }
  }, [commissionTypeValue]);

  // Add state for advance payment
  const [advancePayment, setAdvancePayment] = useState('');

  // Handle form submit
  const handleSubmit = async () => {
    // Prepare payload for /assign-property API
    const payload = {
      projectId: projectValue,
      assignmentLevel: level,
      sellerTypeId: sellerTypeValue,
      assignFromId: assignFromValue,
      assignToId: sellerValue,
      addedById: 1, // Replace with actual user id if needed
      isCommissionBased: commissionBased,
      settlementPrice: settlementPrice ? parseFloat(settlementPrice) : null,
      commission: commissionBased ? (commission ? parseFloat(commission) : null) : null,
      isPercentage: commissionBased ? commissionIsPercentage : null,
      isApplicableOnBasicAmount: true, // Set as needed
      finalAmount: null, // Set as needed
      advancePaymentInAmount: !commissionBased ? (advancePayment ? parseFloat(advancePayment) : null) : null,
      durationForSale: duration ? parseInt(duration) : null,
      durationUnit: durationTypeValue ? durationTypeValue.toUpperCase() : null,
      propertyItemId: subPropertyTypeValue,
      towerPropertyItemId: showTowerItem ? (towerItemValue || null) : null,
      flatHouseStructureId: showStructure ? (structureValue || null) : null,
      unitIds: Array.isArray(unitsValue) ? unitsValue : [],
    };
    console.log('Assign Property Payload:', payload);
    // TODO: Call the API here using axios/fetch if needed
  };

  return (
    <View>
      <Text style={STYLES.label}>Assign From</Text>
      <DropDownPicker
        open={assignFromOpen}
        value={assignFromValue}
        items={assignFromItems}
        setOpen={setAssignFromOpen}
        setValue={setAssignFromValue}
        setItems={setAssignFromItems}
        placeholder="Select Assign From"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={1000}
        listMode="SCROLLVIEW"
      />
      <Text style={STYLES.label}>Seller Type</Text>
      <DropDownPicker
        open={sellerTypeOpen}
        value={sellerTypeValue}
        items={sellerTypeItems}
        setOpen={setSellerTypeOpen}
        setValue={setSellerTypeValue}
        setItems={setSellerTypeItems}
        placeholder="Select Seller Type"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={900}
        listMode="SCROLLVIEW"
      />
      <Text style={STYLES.label}>Seller</Text>
      <DropDownPicker
        open={sellerOpen}
        value={sellerValue}
        items={sellerItems}
        setOpen={setSellerOpen}
        setValue={setSellerValue}
        setItems={setSellerItems}
        placeholder="Select Seller"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={800}
        listMode="SCROLLVIEW"
      />
      <Text style={STYLES.label}>Project</Text>
      <DropDownPicker
        open={projectOpen}
        value={projectValue}
        items={projectItems}
        setOpen={setProjectOpen}
        setValue={setProjectValue}
        setItems={setProjectItems}
        placeholder="Select Project"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={700}
        listMode="SCROLLVIEW"
      />
      <Text style={STYLES.label}>Property Type</Text>
      <DropDownPicker
        open={propertyTypeOpen}
        value={propertyTypeValue}
        items={propertyTypeItems}
        setOpen={setPropertyTypeOpen}
        setValue={setPropertyTypeValue}
        setItems={setPropertyTypeItems}
        placeholder="Select Property Type"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={600}
        listMode="SCROLLVIEW"
      />
      <Text style={STYLES.label}>Sub Property Type</Text>
      <DropDownPicker
        open={subPropertyTypeOpen}
        value={subPropertyTypeValue}
        items={subPropertyTypeItems}
        setOpen={setSubPropertyTypeOpen}
        setValue={setSubPropertyTypeValue}
        setItems={setSubPropertyTypeItems}
        placeholder="Select Sub Property Type"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={500}
        listMode="SCROLLVIEW"
      />
      {/* Tower Item Section */}
      {showTowerItem && (
        <>
          <Text style={STYLES.label}>Tower Item</Text>
          <DropDownPicker
            open={towerItemOpen}
            value={towerItemValue}
            items={towerItemItems}
            setOpen={setTowerItemOpen}
            setValue={setTowerItemValue}
            setItems={setTowerItemItems}
            placeholder="Select Tower Item"
            style={STYLES.dropdown}
            dropDownContainerStyle={STYLES.dropdownContainer}
            textStyle={{ fontFamily: 'PlusR' }}
            labelStyle={{ fontFamily: 'PlusR' }}
            zIndex={400}
            listMode="SCROLLVIEW"
          />
        </>
      )}
      {/* Structure Section */}
      {showStructure && (
        <>
          <Text style={STYLES.label}>Structure</Text>
          <DropDownPicker
            open={structureOpen}
            value={structureValue}
            items={structureItems}
            setOpen={setStructureOpen}
            setValue={setStructureValue}
            setItems={setStructureItems}
            placeholder="Select Structure"
            style={STYLES.dropdown}
            dropDownContainerStyle={STYLES.dropdownContainer}
            textStyle={{ fontFamily: 'PlusR' }}
            labelStyle={{ fontFamily: 'PlusR' }}
            zIndex={300}
            listMode="SCROLLVIEW"
          />
        </>
      )}
      <Text style={STYLES.label}>Units</Text>
      <DropDownPicker
        open={unitsOpen}
        value={unitsValue}
        items={unitsItems}
        setOpen={setUnitsOpen}
        setValue={setUnitsValue}
        setItems={setUnitsItems}
        placeholder="Select Units (Multiple)"
        style={STYLES.dropdown}
        dropDownContainerStyle={STYLES.dropdownContainer}
        textStyle={{ fontFamily: 'PlusR' }}
        labelStyle={{ fontFamily: 'PlusR' }}
        zIndex={200}
        multiple={true}
        mode="BADGE"
        badgeDotColors={[COLORS.primary, COLORS.secondary, COLORS.primaryLight]}
        listMode="SCROLLVIEW"
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
        <Text style={[STYLES.label, { flex: 1 }]}>Commission Based?</Text>
        <Switch
          value={commissionBased}
          onValueChange={setCommissionBased}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={commissionBased ? COLORS.primary : '#f4f3f4'}
        />
      </View>
      {/* Commission/Advance Payment Section */}
      {commissionBased ? (
        <>
          <Text style={STYLES.label}>Commission</Text>
          <TextInput
            placeholder="Enter Commission"
            style={STYLES.input}
            keyboardType="numeric"
            placeholderTextColor={COLORS.placeholder}
            value={commission}
            onChangeText={setCommission}
          />
          <Text style={STYLES.label}>Commission Type</Text>
          <DropDownPicker
            open={commissionTypeOpen}
            value={commissionTypeValue}
            items={commissionTypeItems}
            setOpen={setCommissionTypeOpen}
            setValue={setCommissionTypeValue}
            setItems={setCommissionTypeItems}
            placeholder="Select Commission Type"
            style={STYLES.dropdown}
            dropDownContainerStyle={STYLES.dropdownContainer}
            textStyle={{ fontFamily: 'PlusR' }}
            labelStyle={{ fontFamily: 'PlusR' }}
            zIndex={90}
            listMode="SCROLLVIEW"
          />
        </>
      ) : (
        <>
          <Text style={STYLES.label}>Advance Payment (Amount)</Text>
          <TextInput
            placeholder="Enter Advance Payment"
            style={STYLES.input}
            keyboardType="numeric"
            placeholderTextColor={COLORS.placeholder}
            value={advancePayment}
            onChangeText={setAdvancePayment}
          />
        </>
      )}
      <Text style={STYLES.label}>Duration</Text>
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          placeholder="Enter Duration"
          style={[STYLES.input, { flex: 1, marginRight: 10, paddingVertical: 8, height: 44 }]}
          keyboardType="numeric"
          placeholderTextColor={COLORS.placeholder}
          value={duration}
          onChangeText={setDuration}
        />
        <View style={{ width: 110 }}>
          <DropDownPicker
            open={durationTypeOpen}
            value={durationTypeValue}
            items={durationTypeItems}
            setOpen={setDurationTypeOpen}
            setValue={setDurationTypeValue}
            setItems={setDurationTypeItems}
            placeholder="Select"
            style={[STYLES.dropdown, { width: '100%', height: 44, minHeight: 0, paddingVertical: 8 }]}
            dropDownContainerStyle={[STYLES.dropdownContainer, { width: '100%' }]}
            textStyle={{ fontFamily: 'PlusR' }}
            labelStyle={{ fontFamily: 'PlusR' }}
            zIndex={100}
            listMode="SCROLLVIEW"
          />
        </View>
      </View>
      <Text style={STYLES.label}>Settlement Price</Text>
      <TextInput
        placeholder="Enter Settlement Price"
        style={STYLES.input}
        keyboardType="numeric"
        placeholderTextColor={COLORS.placeholder}
        value={settlementPrice}
        onChangeText={setSettlementPrice}
      />
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text
          style={{
            backgroundColor: COLORS.primary,
            color: '#fff',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 8,
            fontFamily: 'PlusSB',
            fontSize: 18,
            textAlign: 'center',
            overflow: 'hidden',
          }}
          onPress={handleSubmit}
        >
          Submit
        </Text>
      </View>
    </View>
  );
};

export default UnderwriteForm;
