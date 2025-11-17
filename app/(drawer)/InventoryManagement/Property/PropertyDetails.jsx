import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = {
  primary: "#004d40", 
  primaryLight: "#218373ff",
  secondary: "#198170ff",
  background: "#fff", 
  card: "#f4fcf4",
  input: "#f0f8f0",
  border: "#c8e6c9",
  text: "#202020ff",
  placeholder: "#13773dff",
  error: "#d32f2f",
  warning: "#FF9800", 
};

const TextInputBox = ({ label, ...props }) => (
  <View style={styles.inputBox}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
      {...props} 
      style={styles.input} 
      placeholderTextColor={COLORS.placeholder} 
    />
  </View>
);

const UnitDefinitionRow = ({ unit, index, isPenthouse = false, onChange, onRemove }) => {
  const boxBorderColor = isPenthouse ? COLORS.primaryLight : COLORS.secondary;
  
  return (
    <View key={index} style={[styles.unitBox, { borderLeftColor: boxBorderColor }]}>
      <View style={styles.unitHeader}>
        <Text style={styles.unitHeaderText}>{isPenthouse ? `Penthouse Unit #${index + 1}` : `Floor Unit Type #${index + 1}`}</Text>
        <TouchableOpacity 
          onPress={() => onRemove(index)} 
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      
      <TextInputBox
        label="Structure (e.g., 2BHK, 3BHK) *"
        value={unit.structure}
        onChangeText={(t) => onChange(index, "structure", t)}
      />
      <TextInputBox
        label="Area (sq ft) *"
        value={unit.area}
        onChangeText={(t) => onChange(index, "area", t)}
        keyboardType="numeric"
      />
      <TextInputBox
        label="Total Linkable Unit *"
        value={unit.linkable}
        onChangeText={(t) => onChange(index, "linkable", t)}
        keyboardType="numeric"
      />
      
      {/* Quantity is only for non-penthouse floor units */}
      {!isPenthouse && (
        <TextInputBox
          label="Quantity per Floor *"
          value={unit.quantity}
          onChangeText={(t) => onChange(index, "quantity", t)}
          keyboardType="numeric"
        />
      )}
    </View>
  );
};


/* ---------------------------- Existing Tower ---------------------------- */
const ExistingTowerForm = () => (
  <View style={styles.sectionContent}>
    <Text style={styles.instructionText}>Use this section to quickly serialize flats for a known tower structure.</Text>
    <TextInputBox label="Floor Unit Definition *" placeholder="Enter Floor Unit (e.g., A,B,C)" />
    <TouchableOpacity style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>Go to Serialize Flats</Text>
      <Ionicons name="arrow-forward" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  </View>
);

/* ------------------------------ New Tower ------------------------------- */
const NewTowerForm = ({
  unitsPerFloorSame,
  setUnitsPerFloorSame,
  floorUnits,
  penthouseUnits,
  addFloorUnit,
  addPenthouseUnit,
  handleFloorUnitChange,
  removeFloorUnit,
  handlePenthouseUnitChange,
  removePenthouseUnit,
}) => (
  <View style={styles.sectionContent}>
    <TextInputBox label="Tower Name *" placeholder="Tower C" />
    <TextInputBox label="Total Floors *" placeholder="1" keyboardType="numeric" />

    <Text style={styles.label}>Are the Unit Structures on all Floors the Same?</Text>
    <View style={styles.radioGroup}>
      <TouchableOpacity onPress={() => setUnitsPerFloorSame("yes")} style={styles.radioRow}>
        <Ionicons
          name={unitsPerFloorSame === "yes" ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.radioLabel}>Yes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setUnitsPerFloorSame("no")} style={styles.radioRow}>
        <Ionicons
          name={unitsPerFloorSame === "no" ? "radio-button-on" : "radio-button-off"}
          size={20}
          color={COLORS.primary}
        />
        <Text style={styles.radioLabel}>No (Customize per floor)</Text>
      </TouchableOpacity>
    </View>

    {unitsPerFloorSame === "yes" && (
      <>
        <Text style={[styles.subLabel, { color: COLORS.secondary, marginTop: 15 }]}>Floor Units Definition</Text>
        
        {floorUnits.map((unit, index) => (
          <UnitDefinitionRow
            key={`floor-${index}`}
            unit={unit}
            index={index}
            onChange={handleFloorUnitChange}
            onRemove={removeFloorUnit}
          />
        ))}
        
        <TouchableOpacity onPress={addFloorUnit} style={[styles.secondaryButton, { borderColor: COLORS.secondary }]}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.secondary} style={{ marginRight: 5 }}/>
          <Text style={[styles.secondaryButtonText, { color: COLORS.secondary }]}>Add Flat Unit Type</Text>
        </TouchableOpacity>

        <Text style={[styles.subLabel, { color: COLORS.primaryLight, marginTop: 25 }]}>Penthouse Units Definition (Top Floor)</Text>
        
        {penthouseUnits.map((unit, index) => (
          <UnitDefinitionRow
            key={`ph-${index}`}
            unit={unit}
            index={index}
            isPenthouse={true}
            onChange={handlePenthouseUnitChange}
            onRemove={removePenthouseUnit}
          />
        ))}
        
        <TouchableOpacity onPress={addPenthouseUnit} style={[styles.secondaryButton, { borderColor: COLORS.primaryLight }]}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primaryLight} style={{ marginRight: 5 }}/>
          <Text style={[styles.secondaryButtonText, { color: COLORS.primaryLight }]}>Add Penthouse Type</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create New Tower</Text>
          <Ionicons name="save" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </>
    )}

    {unitsPerFloorSame === "no" && <Text style={[styles.errorText, { color: COLORS.warning }]}>Currently, you must define units that are the same across all standard floors. Please choose 'Yes'.</Text>}
  </View>
);

/* -------------------- Apartment Complex Section -------------------- */
const ApartmentComplexSection = ({ towerType, setTowerType }) => {
  const [unitsPerFloorSame, setUnitsPerFloorSame] = useState("yes");
  const [floorUnits, setFloorUnits] = useState([]);
  const [penthouseUnits, setPenthouseUnits] = useState([]);

  // Generic remove function
  const removeUnit = (units, setUnits, index) => {
    const newUnits = units.filter((_, i) => i !== index);
    setUnits(newUnits);
  };
  
  // Floor Unit Handlers
  const addFloorUnit = () =>
    setFloorUnits([
      ...floorUnits,
      { structure: "", area: "", linkable: "", quantity: "" },
    ]);
  const removeFloorUnit = (index) => removeUnit(floorUnits, setFloorUnits, index);
  const handleFloorUnitChange = (index, field, value) => {
    const newUnits = [...floorUnits];
    newUnits[index][field] = value;
    setFloorUnits(newUnits);
  };

  // Penthouse Unit Handlers
  const addPenthouseUnit = () =>
    setPenthouseUnits([
      ...penthouseUnits,
      { structure: "", area: "", linkable: "" },
    ]); // Removed quantity as it's implied 1 for the unit type
  const removePenthouseUnit = (index) => removeUnit(penthouseUnits, setPenthouseUnits, index);
  const handlePenthouseUnitChange = (index, field, value) => {
    const newUnits = [...penthouseUnits];
    newUnits[index][field] = value;
    setPenthouseUnits(newUnits);
  };


  return (
    <View style={styles.sectionContent}>
      <Text style={styles.subLabel}>Tower Status</Text>
      {/* Tower Type */}
      <View style={styles.toggleRow}>
        

        <TouchableOpacity 
          onPress={() => setTowerType("new")} 
          style={[styles.toggleButton, towerType === "new" && styles.toggleButtonActive]}
        >
          <MaterialCommunityIcons name="office-building-plus" size={18} color={towerType === "new" ? COLORS.card : COLORS.text} />
          <Text style={[styles.toggleLabel, towerType === "new" && styles.optionTextActive]}>New Tower</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTowerType("existing")} 
          style={[styles.toggleButton, towerType === "existing" && styles.toggleButtonActive]}
        >
          <MaterialCommunityIcons name="office-building-marker" size={18} color={towerType === "existing" ? COLORS.card : COLORS.text} />
          <Text style={[styles.toggleLabel, towerType === "existing" && styles.optionTextActive]}>Existing Tower</Text>
        </TouchableOpacity>
      </View>

      {towerType === "existing" ? (
        <ExistingTowerForm />
      ) : (
        <NewTowerForm
          unitsPerFloorSame={unitsPerFloorSame}
          setUnitsPerFloorSame={setUnitsPerFloorSame}
          floorUnits={floorUnits}
          penthouseUnits={penthouseUnits}
          addFloorUnit={addFloorUnit}
          addPenthouseUnit={addPenthouseUnit}
          handleFloorUnitChange={handleFloorUnitChange}
          removeFloorUnit={removeFloorUnit}
          handlePenthouseUnitChange={handlePenthouseUnitChange}
          removePenthouseUnit={removePenthouseUnit}
        />
      )}
    </View>
  );
};


/* -------------------- Independent House Section -------------------- */
const IndependentHouseSection = () => (
  <View style={styles.sectionContent}>
    <TextInputBox label="Number of Floors *" placeholder="2" keyboardType="numeric" />
    <TextInputBox label="Total Area (sq ft) *" placeholder="1500" keyboardType="numeric" />
    <TextInputBox label="Number of Bedrooms *" placeholder="3" keyboardType="numeric" />
    <TouchableOpacity style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>Save House Details</Text>
      <Ionicons name="save" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  </View>
);

/* ---------------------------- Plot Section --------------------------- */
const PlotSection = () => (
  <View style={styles.sectionContent}>
    <TextInputBox label="Plot Area (sq ft) *" placeholder="2000" keyboardType="numeric" />
    <TextInputBox label="Plot Dimensions (L x B) *" placeholder="40 x 50 ft" />
    <TextInputBox label="Location Details *" placeholder="Sector 21, City" />
    <TouchableOpacity style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>Save Plot Details</Text>
      <Ionicons name="save" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  </View>
);

/* ------------------------- Commercial Shop Section ------------------------- */
const CommercialShopSection = () => (
  <View style={styles.sectionContent}>
    <TextInputBox label="Shop Number / Name *" placeholder="Shop 12" />
    <TextInputBox label="Shop Area (sq ft) *" placeholder="500" keyboardType="numeric" />
    <TextInputBox label="Floor Level *" placeholder="Ground, First, etc." />
    <TouchableOpacity style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>Save Shop Details</Text>
      <Ionicons name="save" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  </View>
);

/* ------------------------- Commercial Plot Section ------------------------- */
const CommercialPlotSection = () => (
  <View style={styles.sectionContent}>
    <TextInputBox label="Plot Area (sq ft) *" placeholder="3000" keyboardType="numeric" />
    <TextInputBox label="Plot Location / Address *" placeholder="Sector 10, Commercial Hub" />
    <TouchableOpacity style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>Save Plot Details</Text>
      <Ionicons name="save" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  </View>
);


/* ----------------------------- Main Component ---------------------------- */
export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [propertyType, setPropertyType] = useState("");
  const [property, setProperty] = useState("");
  const [towerType, setTowerType] = useState("new");

  const propertyOptions = {
    Residential: ["Apartment Complex", "Independent House", "Plot"],
    Commercial: ["Shop", "Plot"],
    Agriculture: [],
    Industrial: [],
  };

  const isFormReady = propertyType && property;

  const renderPropertyDetails = () => {
    if (propertyType === "Residential" && property === "Apartment Complex")
      return (
        <ApartmentComplexSection
          towerType={towerType}
          setTowerType={setTowerType}
        />
      );
    if (propertyType === "Residential" && property === "Independent House")
      return <IndependentHouseSection />;
    if (propertyType === "Residential" && property === "Plot") return <PlotSection />;
    if (propertyType === "Commercial" && property === "Shop") return <CommercialShopSection />;
    if (propertyType === "Commercial" && property === "Plot") return <CommercialPlotSection />;

    return <Text style={styles.italicText}>Select a property type and sub-type to view the required details.</Text>;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Details</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        {/* Property Chooser */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1. Choose Property Type</Text>

          {/* Property Type */}
          <View style={styles.propertyRow}>
            <Text style={styles.label}>Property Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -5 }}>
              {Object.keys(propertyOptions).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setPropertyType(type);
                    setProperty("");
                  }}
                  style={[
                    styles.optionButton,
                    propertyType === type ? styles.optionButtonActivePrimary : styles.optionButtonInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      propertyType === type ? styles.optionTextActive : styles.optionTextInactive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Property */}
          <View style={styles.propertyRow}>
            <Text style={styles.label}>Property Sub-Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -5 }}>
              {propertyType &&
                propertyOptions[propertyType].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setProperty(p)}
                    style={[
                      styles.optionButton,
                      property === p ? styles.optionButtonActiveSecondary : styles.optionButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        property === p ? styles.optionTextActive : styles.optionTextInactive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>

        {/* Property Details Section */}
        {isFormReady && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2. Enter {property} Details</Text>
            {renderPropertyDetails()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


/* -------------------------- Stylesheet --------------------------- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop:30,
    paddingBottom: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primary,
  },
  backButton: {
    padding: 5,
  },
  sectionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // Slightly more prominent shadow for depth
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
    marginBottom: 16,
  },
  propertyRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.text,
  },
  subLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: COLORS.text,
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.placeholder,
    marginBottom: 15,
  },
  
  // Option Buttons (Horizontal Scroll)
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginRight: 10,
    // Subtle shadow for lift
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  optionButtonActivePrimary: { backgroundColor: COLORS.primary },
  optionButtonActiveSecondary: { backgroundColor: COLORS.secondary },
  optionButtonInactive: { 
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: { fontSize: 14, fontWeight: "500" },
  optionTextActive: { color: COLORS.card, fontWeight: "700" },
  optionTextInactive: { color: COLORS.text },
  italicText: { fontStyle: "italic", color: COLORS.placeholder, textAlign: 'center', paddingVertical: 10 },
  sectionContent: { marginTop: 5 },
  
  // Tower Type Toggle Buttons
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleLabel: { marginLeft: 8, fontWeight: '600', color: COLORS.text, fontSize: 14 },

  // Radio Buttons
  radioGroup: { flexDirection: "row", gap: 24, marginBottom: 12 },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioLabel: { marginLeft: 8, color: COLORS.text },

  // Primary Button (Save/Action)
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4, // Android shadow
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: { color: COLORS.card, fontSize: 16, fontWeight: "700", textAlign: "center" },

  // Secondary Button (Add Unit)
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1.5,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "600", textAlign: "center" },

  // Inputs
  inputBox: { marginBottom: 15 },
  inputLabel: { marginBottom: 4, fontWeight: "600", color: COLORS.text },
  input: {
    backgroundColor: COLORS.input,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 16,
  },
  
  // Unit Box
  unitBox: { 
    marginBottom: 20, 
    padding: 15,
    paddingTop: 5,
    backgroundColor: COLORS.input,
    borderRadius: 12,
    borderLeftWidth: 4,
    // borderLeftColor set dynamically
  },
  unitHeader: {
    flexDirection: 'row', // Added
    justifyContent: 'space-between', // Added
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
    paddingVertical: 5,
  },
  unitHeaderText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  removeButton: {
    padding: 5,
    alignSelf: 'flex-end',
  },
  errorText: { 
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: COLORS.warning,
    backgroundColor: '#fffbe6', 
    fontWeight: '500'
  },
});