import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const PROPERTY_TYPES = ['Residential', 'Commercial'];
const PROPERTY_OPTIONS = ['Flat', 'Independent House', 'Plot', 'Apartment Complex'];
const ALL_PROPERTIES_DATA = [
    { id: '1004', name: 'The Grove Apartments', type: 'Residential', option: 'Apartment Complex', squareFeet: 950, serial: 1045, tower: 'A', totalFloors: 10, unitsPerFloor: 4, structureArea: 40000, linkableUnits: 40 },
    { id: '1001', name: 'Sky Heights Residency', type: 'Residential', option: 'Flat', squareFeet: 1200, serial: 1005 },
    { id: '1002', name: 'Prestige Greenwoods', type: 'Residential', option: 'Independent House', squareFeet: 2800, serial: 1020 },
    { id: '1003', name: 'DLF Corporate Park', type: 'Commercial', option: 'Independent House', squareFeet: 5000, serial: 1001 },
    { id: '1005', name: 'Industrial Hub 7', type: 'Commercial', option: 'Apartment Complex', squareFeet: 15000, serial: 1010 },
    { id: '1006', name: 'City Plot B', type: 'Residential', option: 'Flat', squareFeet: 800, serial: 1033 },
    { id: '1007', name: 'Corporate Tower A', type: 'Commercial', option: 'Flat', squareFeet: 1000, serial: 1015 },
];

const isValidInteger = (value) => {
    if (value === '') return true;
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
};

// --- Selection Component (Remains the same) ---
const SelectBox = ({ label, options, selectedValue, onSelect }) => { /* ... (Same as before) ... */
    return (
        <View style={filterStyles.formRowArea}>
            <Text style={filterStyles.label}>{label}</Text>
            <View style={filterStyles.selectContainer}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            filterStyles.selectOption,
                            selectedValue === option && filterStyles.selectOptionSelected,
                        ]}
                        onPress={() => onSelect(option)}
                    >
                        <Text style={[
                            filterStyles.selectOptionText,
                            selectedValue === option && filterStyles.selectOptionTextSelected,
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const FilteredListItem = ({ name, squareFeet }) => (
    <View style={filterStyles.listItem}>
        <Text style={filterStyles.listItemName}>{name}</Text>
        <Text style={filterStyles.listItemSqFt}><Ionicons name="resize-outline" size={14} color="#666" /> {squareFeet} sq. ft.</Text>
    </View>
);

export default function PropertyFilterScreen({ route }) {
    const navigation = useNavigation();
    
    // Primary Filter States
    const [propertyType, setPropertyType] = useState(null);
    const [propertyOption, setPropertyOption] = useState(null);
    const [serialFrom, setSerialFrom] = useState('');
    const [serialTo, setSerialTo] = useState('');

    // Dynamic Apartment Complex States
    const [towerName, setTowerName] = useState('');
    const [totalFloors, setTotalFloors] = useState('');
    const [unitsPerFloor, setUnitsPerFloor] = useState('');
    const [sameUnits, setSameUnits] = useState(null); // 'yes' / 'no'
    
    // Secondary Dynamic Fields (Hidden unless primary dynamic fields are complete)
    const [floorUnit, setFloorUnit] = useState('');
    const [structureArea, setStructureArea] = useState('');
    const [totalLinkableUnit, setTotalLinkableUnit] = useState('');

    const [filteredList, setFilteredList] = useState(null);

    // Determines if the dynamic Residential -> Apartment Complex form should show
    const isApartmentComplex = propertyType === 'Residential' && propertyOption === 'Apartment Complex';

    // Determines if the secondary dynamic form should show (after primary dynamic form is filled)
    const showSecondaryComplexForm = isApartmentComplex && towerName && totalFloors && unitsPerFloor && sameUnits;


    const mockFilterAndSort = (type, option, filters) => {
        let results = ALL_PROPERTIES_DATA.filter(p => 
            p.type === type && p.option === option
        );

        // --- 1. Apply Serial Number Range Filter (always applies) ---
        const startSerial = Number(filters.serialFrom);
        const endSerial = Number(filters.serialTo);
        
        if (startSerial > 0 || endSerial > 0) {
            results = results.filter(p => {
                const currentSerial = p.serial;
                const matchesFrom = startSerial > 0 ? currentSerial >= startSerial : true;
                const matchesTo = endSerial > 0 ? currentSerial <= endSerial : true;
                return matchesFrom && matchesTo;
            });
        }
        
        // --- 2. Apply Dynamic Complex Filters (only if relevant) ---
        if (isApartmentComplex && showSecondaryComplexForm) {
            if (filters.towerName) {
                results = results.filter(p => p.tower === filters.towerName);
            }
        }

        // --- 3. Sort by Square Feet in Ascending Order (as requested) ---
        results.sort((a, b) => a.squareFeet - b.squareFeet);
        
        return results;
    };

    const handleSubmit = () => {
        // --- Validation for primary filters (always required) ---
        if (!propertyType || !propertyOption) {
            Alert.alert('Selection Required', 'Please select both Property Type and Specific Property.');
            return;
        }
        if (serialFrom && !isValidInteger(serialFrom) || serialTo && !isValidInteger(serialTo)) {
             Alert.alert('Invalid Input', 'Serial numbers must be whole numbers.');
            return;
        }

        // --- Validation for dynamic fields (if visible) ---
        if (isApartmentComplex) {
            if (!towerName || !totalFloors || !unitsPerFloor || !sameUnits) {
                Alert.alert('Details Required', 'Please fill in all apartment complex details before filtering.');
                return;
            }
            if (!showSecondaryComplexForm) {
                Alert.alert('Details Required', 'Please submit the first set of complex details.');
                return;
            }
            if (!floorUnit || !structureArea || !totalLinkableUnit) {
                Alert.alert('Details Required', 'Please fill in all secondary complex details before filtering.');
                return;
            }
        }
        
        // Prepare filter object for mock filtering
        const filters = {
            serialFrom,
            serialTo,
            towerName,
            totalFloors,
            unitsPerFloor,
            sameUnits,
            floorUnit,
            structureArea,
            totalLinkableUnit,
        };

        // Execute the mock filter and update state
        const results = mockFilterAndSort(propertyType, propertyOption, filters);
        setFilteredList(results);
        
        console.log('Filtered List Updated:', results);
    };

    return (
        <SafeAreaView style={filterStyles.safeArea}>
            <ScrollView contentContainerStyle={filterStyles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={filterStyles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={filterStyles.title}>
                        Property <Text style={{ color: '#004d40' }}>Details</Text>
                    </Text>
                </View>

                {/* Main Filter Card */}
                <View style={filterStyles.card}>
                    <Text style={filterStyles.cardTitle}>Define Your Search Criteria</Text>

                    {/* Filter Group 1 & 2: Property Type and Option */}
                    <View style={filterStyles.filterGroup}>
                        <Text style={filterStyles.groupTitle}>1. Define Property Category</Text>
                        <SelectBox label="Property Type" options={PROPERTY_TYPES} selectedValue={propertyType} onSelect={type => { setPropertyType(type); setFilteredList(null); /* Reset results */ }}/>
                        <View style={{marginTop: 15}}/>
                        <SelectBox label="Property Option" options={PROPERTY_OPTIONS} selectedValue={propertyOption} onSelect={option => { setPropertyOption(option); setFilteredList(null); /* Reset results */ }}/>
                    </View>
                    
                    {/* --- DYNAMIC APARTMENT COMPLEX DETAILS (Conditional) --- */}
                    {isApartmentComplex && (
                        <View style={filterStyles.filterGroup}>
                            <Text style={filterStyles.groupTitle}>2. Enter Apartment Complex Details</Text>
                            
                            {/* Primary Details */}
                            <TextInput style={filterStyles.inputDynamic} placeholder="Tower Name" value={towerName} onChangeText={setTowerName}/>
                            <TextInput style={filterStyles.inputDynamic} placeholder="Total No. of Floors" value={totalFloors} onChangeText={setTotalFloors} keyboardType="number-pad"/>
                            <TextInput style={filterStyles.inputDynamic} placeholder="Units Per Floor" value={unitsPerFloor} onChangeText={setUnitsPerFloor} keyboardType="number-pad"/>
                            
                            <Text style={filterStyles.inputLabel}>Units per floor same?</Text>
                            <SelectBox 
                                label="Units per floor same?"
                                options={['Yes', 'No']}
                                selectedValue={sameUnits}
                                onSelect={setSameUnits}
                            />

                            {/* Secondary Details (Appears after primary details are entered) */}
                            {showSecondaryComplexForm && (
                                <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 15 }}>
                                    <Text style={[filterStyles.groupTitle, {color: '#d35400'}]}>2.1 Secondary Unit Details</Text>
                                    <TextInput style={filterStyles.inputDynamic} placeholder="Floor Unit" value={floorUnit} onChangeText={setFloorUnit}/>
                                    <TextInput style={filterStyles.inputDynamic} placeholder="Structure Area" value={structureArea} onChangeText={setStructureArea} keyboardType="number-pad"/>
                                    <TextInput style={filterStyles.inputDynamic} placeholder="Total Linkable Unit" value={totalLinkableUnit} onChangeText={setTotalLinkableUnit} keyboardType="number-pad"/>
                                </View>
                            )}
                        </View>
                    )}
                    
                    {(!isApartmentComplex || (isApartmentComplex && showSecondaryComplexForm)) && (
                        <View style={filterStyles.filterGroup}>
                            <Text style={filterStyles.groupTitle}>{isApartmentComplex ? '3.' : '2.'} Filter by Serial Number Range</Text>
                            <View style={filterStyles.rangeContainer}>
                                <View style={filterStyles.rangeInputWrapper}>
                                    <Text style={filterStyles.inputLabel}>From</Text>
                                    <TextInput style={filterStyles.input} placeholder="Start Serial No." placeholderTextColor="#999" value={serialFrom} onChangeText={setSerialFrom} keyboardType="number-pad"/>
                                </View>
                                <View style={filterStyles.rangeInputWrapper}>
                                    <Text style={filterStyles.inputLabel}>To</Text>
                                    <TextInput style={filterStyles.input} placeholder="End Serial No." placeholderTextColor="#999" value={serialTo} onChangeText={setSerialTo} keyboardType="number-pad"/>
                                </View>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity 
                        style={[
                            filterStyles.submitButton, 
                            (!propertyType || !propertyOption || (isApartmentComplex && !showSecondaryComplexForm)) && filterStyles.submitButtonDisabled
                        ]} 
                        onPress={handleSubmit}
                        disabled={!propertyType || !propertyOption || (isApartmentComplex && !showSecondaryComplexForm)}
                    >
                        <Text style={filterStyles.submitButtonText}>View Filtered List</Text>
                    </TouchableOpacity>
                </View>
                
                {/* --- FILTERED RESULTS DISPLAY SECTION --- */}
                {filteredList !== null && (
                    <View style={filterStyles.resultsCard}>
                        <Text style={filterStyles.resultsTitle}>
                            Query Results ({filteredList.length})
                        </Text>
                        
                        {filteredList.length > 0 ? (
                            <FlatList
                                data={filteredList}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <FilteredListItem name={item.name} squareFeet={item.squareFeet} />
                                )}
                                scrollEnabled={false}
                                ItemSeparatorComponent={() => <View style={filterStyles.separator} />}
                            />
                        ) : (
                            <Text style={filterStyles.noResultsText}>No properties match your selection criteria.</Text>
                        )}
                        
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// --- STYLES (Adjusted for dynamic inputs) ---
const filterStyles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 5,paddingTop:30, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24,
    fontFamily: "PlusSB", color: '#333', marginLeft: 10 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 5, shadowColor: '#000' },
    cardTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#004d40', paddingBottom: 10 },
    
    filterGroup: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    groupTitle: {
        fontSize: 16,
    fontFamily: "PlusSB",
        color: '#004d40',
        marginBottom: 10,
    },
    
    formRowArea: { marginBottom: 10 },
    label: { color: '#333', 
    fontFamily: "PlusSB", fontSize: 14, marginBottom: 8 },
    selectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    selectOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#fff' },
    selectOptionSelected: { borderColor: '#004d40', backgroundColor: '#004d4015' },
    selectOptionText: { color: '#333', 
    fontFamily: "PlusL", fontSize: 13 },
    selectOptionTextSelected: { color: '#004d40', fontWeight: '700' },
    
    inputDynamic: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        fontSize: 15,
    },
    rangeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    rangeInputWrapper: { width: '48%' },
    inputLabel: { color: '#555', fontWeight: '500', fontSize: 13, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#b0d4af', borderRadius: 8, padding: 10, backgroundColor: '#fff', color: '#333', fontSize: 16, fontWeight: '600' },
    
    submitButton: { backgroundColor: '', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 30 },
    submitButtonDisabled: { backgroundColor: '#004d40' },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

    resultsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 5, shadowColor: '#000', marginTop: 20 },
    resultsTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    listItemName: { fontSize: 15, fontWeight: '600', color: '#333', flex: 2 },
    listItemSqFt: { fontSize: 14, fontWeight: '500', color: '#666', flex: 1, textAlign: 'right' },
    separator: { height: 1, backgroundColor: '#f5f5f5' },
    noResultsText: { fontSize: 15, color: '#e53935', textAlign: 'center', paddingVertical: 20 }
});