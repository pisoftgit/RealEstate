import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../../../../services/api";
import useStructure from "../../../../hooks/useStructure";

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

const DropdownBox = ({ label, value, onValueChange, items, ...props }) => (
  <View style={styles.inputBox}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.input, { padding: 0, justifyContent: 'center' }]}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={{ color: COLORS.text }}
        {...props}
      >
        <Picker.Item label="Select..." value="" />
        {items.map((item) => (
          <Picker.Item 
            key={item.id} 
            label={`${item.structureName} - ${item.flatHouseStructureType?.structureType || ''}`} 
            value={item.id} 
          />
        ))}
      </Picker>
    </View>
  </View>
);

const UnitDefinitionRow = ({ 
  unit, 
  index, 
  isPenthouse = false, 
  onChange, 
  onRemove, 
  isFlat = true,
  structureTypes = [],
  loadingStructures = false
}) => {
  const boxBorderColor = isPenthouse ? COLORS.primaryLight : COLORS.secondary;
  
  return (
    <View key={index} style={[styles.unitBox, { borderLeftColor: boxBorderColor }]}>
      <View style={styles.unitHeader}>
        <Text style={styles.unitHeaderText}>
          {isPenthouse ? `Penthouse Unit #${index + 1}` : `Floor Unit Type #${index + 1}`}
        </Text>
        <TouchableOpacity 
          onPress={() => onRemove(index)} 
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      
      {/* Structure - Dropdown for isFlat, TextInput for isHouseVilla */}
      {isFlat ? (
        loadingStructures ? (
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Structure *</Text>
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
          </View>
        ) : (
          <DropdownBox
            label="Structure (e.g., 2BHK, 3BHK) *"
            value={unit.structure}
            onValueChange={(value) => onChange(index, "structure", value)}
            items={structureTypes}
          />
        )
      ) : (
        <TextInputBox
          label="Structure (e.g., Villa, Duplex) *"
          value={unit.structure}
          onChangeText={(t) => onChange(index, "structure", t)}
        />
      )}
      
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
      
      {/* Quantity is only shown for isFlat units (not for penthouse or isHouseVilla) */}
      {isFlat && !isPenthouse && (
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

/* ---------------------- Tower Basic Info Component ---------------------- */
const TowerBasicInfo = ({ 
  towerType, 
  setTowerType, 
  unitsPerFloorSame, 
  setUnitsPerFloorSame,
  towerName,
  setTowerName,
  totalFloors,
  setTotalFloors
}) => (
  <View style={styles.formSection}>
    <Text style={styles.subLabel}>Tower Status</Text>
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

    {towerType === "new" && (
      <>
        <TextInputBox 
          label="Tower Name *" 
          placeholder="Tower C"
          value={towerName}
          onChangeText={setTowerName}
        />
        <TextInputBox 
          label="Total Floors *" 
          placeholder="1" 
          keyboardType="numeric"
          value={totalFloors}
          onChangeText={setTotalFloors}
        />

        <Text style={[styles.subLabel, { marginTop: 20 }]}>
          Are the Unit Structures on all Floors the Same? *
        </Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity 
            onPress={() => setUnitsPerFloorSame("yes")} 
            style={[styles.toggleButton, unitsPerFloorSame === "yes" && styles.toggleButtonActive]}
          >
            <Ionicons name="checkmark-circle" size={18} color={unitsPerFloorSame === "yes" ? COLORS.card : COLORS.text} />
            <Text style={[styles.toggleLabel, unitsPerFloorSame === "yes" && styles.optionTextActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setUnitsPerFloorSame("no")} 
            style={[styles.toggleButton, unitsPerFloorSame === "no" && styles.toggleButtonActive]}
          >
            <Ionicons name="close-circle" size={18} color={unitsPerFloorSame === "no" ? COLORS.card : COLORS.text} />
            <Text style={[styles.toggleLabel, unitsPerFloorSame === "no" && styles.optionTextActive]}>No</Text>
          </TouchableOpacity>
        </View>

        {unitsPerFloorSame === "no" && (
          <Text style={[styles.errorText, { color: COLORS.warning, marginTop: 10 }]}>
            Currently, you must define units that are the same across all standard floors. Please choose 'Yes'.
          </Text>
        )}
      </>
    )}
  </View>
);

/* -------------------- Floor Structure Component -------------------- */
const FloorStructureForm = ({
  floorUnits,
  penthouseUnits,
  addFloorUnit,
  addPenthouseUnit,
  handleFloorUnitChange,
  removeFloorUnit,
  handlePenthouseUnitChange,
  removePenthouseUnit,
  towerPropertyUnits,
  loadingTowerUnits,
  selectedFloorUnit,
  setSelectedFloorUnit,
  towerName,
  totalFloors,
  projectId,
  subPropertyTypeId,
  unitsPerFloorSame,
}) => {
  // Fetch structure types for dropdowns using the correct hook
  const { structures, loading: loadingStructures } = useStructure();
  const [saving, setSaving] = useState(false);

  const handleSaveTower = async () => {
    try {
      // Validation
      if (!towerName || !totalFloors || !selectedFloorUnit || floorUnits.length === 0) {
        alert("Please fill in all required fields and add at least one floor unit.");
        return;
      }

      // Check if all floor units have required fields
      const hasIncompleteUnits = floorUnits.some(unit => 
        !unit.structure || !unit.area || !unit.linkable || (selectedFloorUnit.isFlat && !unit.quantity)
      );

      if (hasIncompleteUnits) {
        alert("Please complete all floor unit fields.");
        return;
      }

      setSaving(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      // Build metaDatas array from floorUnits
      const metaDatas = floorUnits.map(unit => ({
        flatHouseStructureId: parseInt(unit.structure),
        area: parseFloat(unit.area),
        noOfItems: selectedFloorUnit.isFlat ? parseInt(unit.quantity) : 1,
        areaUnitId: 362417 // You may need to make this dynamic based on your requirements
      }));

      const payload = {
        projectId: parseInt(projectId),
        subPropertyTypeId: parseInt(subPropertyTypeId),
        towerName: towerName,
        noOfFloors: parseInt(totalFloors),
        isFlatPerFloorSame: unitsPerFloorSame === "yes",
        floorUnitId: selectedFloorUnit.id,
        metaDatas: metaDatas
      };

      console.log("==================== TOWER SAVE PAYLOAD ====================");
      console.log(JSON.stringify(payload, null, 2));
      console.log("============================================================");

      const response = await axios.post(
        `${API_BASE_URL}/real-estate-properties/saveTower`,
        payload,
        {
          headers: { 
            "Content-Type": "application/json",
            secret_key: secretKey 
          },
        }
      );

      console.log("Tower Save Response:", JSON.stringify(response.data, null, 2));
      alert("Tower created successfully!");
      
      // Optionally reset the form or navigate back
      // router.back();

    } catch (error) {
      console.error("Error saving tower:", error.message);
      console.error("Error details:", error.response?.data);
      alert(`Failed to create tower: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formSection}>
      <Text style={styles.label}>Floor Common Structure</Text>
      <Text style={styles.instructionText}>Select the type of units for this tower</Text>
      
      {loadingTowerUnits ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
      ) : (
        <View style={styles.toggleRow}>
          {towerPropertyUnits.map((unit) => (
            <TouchableOpacity
              key={unit.id}
              onPress={() => setSelectedFloorUnit(unit)}
              style={[
                styles.toggleButton,
                selectedFloorUnit?.id === unit.id && styles.toggleButtonActive,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  unit.isFlat
                    ? "home-city"
                    : unit.isHouseVilla
                    ? "home-variant"
                    : "office-building"
                }
                size={18}
                color={selectedFloorUnit?.id === unit.id ? COLORS.card : COLORS.text}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  selectedFloorUnit?.id === unit.id && styles.optionTextActive,
                ]}
              >
                {unit.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedFloorUnit && (
        <>
          <Text style={[styles.subLabel, { color: COLORS.secondary, marginTop: 15 }]}>
            Unit Type: {selectedFloorUnit.name}
          </Text>
          <Text style={styles.instructionText}>
            {selectedFloorUnit.isFlat && "Configure flat units for this tower. Structure will be selected from dropdown."}
            {selectedFloorUnit.isHouseVilla && "Configure villa/penthouse units for this tower."}
          </Text>
          
          <Text style={[styles.subLabel, { color: COLORS.secondary, marginTop: 15 }]}>
            {selectedFloorUnit.isFlat ? "Floor Units Definition (4 fields)" : "Floor Units Definition (3 fields)"}
          </Text>
          
          {floorUnits.map((unit, index) => (
            <UnitDefinitionRow
              key={`floor-${index}`}
              unit={unit}
              index={index}
              onChange={handleFloorUnitChange}
              onRemove={removeFloorUnit}
              isFlat={selectedFloorUnit.isFlat}
              isPenthouse={false}
              structureTypes={structures}
              loadingStructures={loadingStructures}
            />
          ))}
          
          <TouchableOpacity onPress={addFloorUnit} style={[styles.secondaryButton, { borderColor: COLORS.secondary }]}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.secondary} style={{ marginRight: 5 }}/>
            <Text style={[styles.secondaryButtonText, { color: COLORS.secondary }]}>Add Unit Type</Text>
          </TouchableOpacity>

          {selectedFloorUnit.isHouseVilla && (
            <>
              <Text style={[styles.subLabel, { color: COLORS.primaryLight, marginTop: 25 }]}>
                Penthouse Units Definition (Top Floor - 3 fields)
              </Text>
              
              {penthouseUnits.map((unit, index) => (
                <UnitDefinitionRow
                  key={`ph-${index}`}
                  unit={unit}
                  index={index}
                  isPenthouse={true}
                  onChange={handlePenthouseUnitChange}
                  onRemove={removePenthouseUnit}
                  isFlat={false}
                  structureTypes={structures}
                  loadingStructures={loadingStructures}
                />
              ))}
              
              <TouchableOpacity onPress={addPenthouseUnit} style={[styles.secondaryButton, { borderColor: COLORS.primaryLight }]}>
                <Ionicons name="add-circle-outline" size={18} color={COLORS.primaryLight} style={{ marginRight: 5 }}/>
                <Text style={[styles.secondaryButtonText, { color: COLORS.primaryLight }]}>Add Penthouse Type</Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.primaryButton, saving && { opacity: 0.6 }]} 
            onPress={handleSaveTower}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.card} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Create New Tower</Text>
                <Ionicons name="save" size={18} color={COLORS.card} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

/* -------------------- Apartment Complex Section -------------------- */
const ApartmentComplexSection = ({ towerType, setTowerType, projectId, subPropertyTypeId }) => {
  const [unitsPerFloorSame, setUnitsPerFloorSame] = useState("yes");
  const [floorUnits, setFloorUnits] = useState([]);
  const [penthouseUnits, setPenthouseUnits] = useState([]);
  const [towerPropertyUnits, setTowerPropertyUnits] = useState([]);
  const [loadingTowerUnits, setLoadingTowerUnits] = useState(false);
  const [selectedFloorUnit, setSelectedFloorUnit] = useState(null);
  const [towerName, setTowerName] = useState("");
  const [totalFloors, setTotalFloors] = useState("");

  // Fetch tower property units
  useEffect(() => {
    const fetchTowerPropertyUnits = async () => {
      try {
        setLoadingTowerUnits(true);
        const secretKey = await SecureStore.getItemAsync("auth_token");

        const response = await axios.get(
          `${API_BASE_URL}/real-estate-properties/getAllTowerPropertyUnit`,
          {
            headers: { secret_key: secretKey },
          }
        );

        console.log("Tower Property Units Response:", JSON.stringify(response.data, null, 2));
        
        const data = response.data?.data || response.data || [];
        setTowerPropertyUnits(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching tower property units:", error.message);
        setTowerPropertyUnits([]);
      } finally {
        setLoadingTowerUnits(false);
      }
    };

    // Only fetch when towerType is "new"
    if (towerType === "new") {
      fetchTowerPropertyUnits();
    }
  }, [towerType]);

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
      {/* Tower Basic Info Component */}
      <TowerBasicInfo 
        towerType={towerType}
        setTowerType={setTowerType}
        unitsPerFloorSame={unitsPerFloorSame}
        setUnitsPerFloorSame={setUnitsPerFloorSame}
        towerName={towerName}
        setTowerName={setTowerName}
        totalFloors={totalFloors}
        setTotalFloors={setTotalFloors}
      />

      {/* Conditional rendering based on tower type */}
      {towerType === "existing" ? (
        <ExistingTowerForm />
      ) : (
        unitsPerFloorSame === "yes" && (
          <FloorStructureForm
            floorUnits={floorUnits}
            penthouseUnits={penthouseUnits}
            addFloorUnit={addFloorUnit}
            addPenthouseUnit={addPenthouseUnit}
            handleFloorUnitChange={handleFloorUnitChange}
            removeFloorUnit={removeFloorUnit}
            handlePenthouseUnitChange={handlePenthouseUnitChange}
            removePenthouseUnit={removePenthouseUnit}
            towerPropertyUnits={towerPropertyUnits}
            loadingTowerUnits={loadingTowerUnits}
            selectedFloorUnit={selectedFloorUnit}
            setSelectedFloorUnit={setSelectedFloorUnit}
            towerName={towerName}
            totalFloors={totalFloors}
            projectId={projectId}
            subPropertyTypeId={subPropertyTypeId}
            unitsPerFloorSame={unitsPerFloorSame}
          />
        )
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
  const { projectId } = useLocalSearchParams(); // This is the projectId from Serialize page
  const router = useRouter();

  const [propertyType, setPropertyType] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState(null);
  const [property, setProperty] = useState("");
  const [propertySubTypeData, setPropertySubTypeData] = useState(null); // Store the selected sub-property object
  const [towerType, setTowerType] = useState("new");

  // State for property types
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);
  const [subPropertyTypes, setSubPropertyTypes] = useState([]);
  const [loadingSubTypes, setLoadingSubTypes] = useState(false);

  // Fetch property types for the specific project
  useEffect(() => {
    const fetchProjectPropertyTypes = async () => {
      if (!projectId) {
        console.log("No project ID provided");
        return;
      }

      try {
        setLoadingPropertyTypes(true);
        const secretKey = await SecureStore.getItemAsync("auth_token");

        const response = await axios.get(
          `${API_BASE_URL}/real-estate-properties/getProjectPropertyTypes/${projectId}`,
          {
            headers: { secret_key: secretKey },
          }
        );

        const data = response.data?.data || response.data || [];
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        console.log("Property Types Data:", JSON.stringify(data, null, 2));
        setPropertyTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching project property types:", error.message);
        setPropertyTypes([]);
      } finally {
        setLoadingPropertyTypes(false);
      }
    };

    fetchProjectPropertyTypes();
  }, [projectId]);

  // Fetch sub-property types when property type changes
  useEffect(() => {
    const fetchSubTypes = async () => {
      if (!propertyTypeId) {
        setSubPropertyTypes([]);
        return;
      }

      try {
        setLoadingSubTypes(true);
        const secretKey = await SecureStore.getItemAsync("auth_token");

        const response = await axios.get(
          `${API_BASE_URL}/sub-property-types/getPropertyTypeWithSubTypesByPropertyTypeId/${propertyTypeId}`,
          {
            headers: { secret_key: secretKey },
          }
        );

        console.log("Sub-Property Types API Response:", JSON.stringify(response.data, null, 2));
        
        const data = response.data?.subPropertyTypes || response.data?.data?.subPropertyTypes || response.data || [];
        console.log("Sub-Property Types Data:", JSON.stringify(data, null, 2));
        
        setSubPropertyTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sub-property types:", error.message);
        setSubPropertyTypes([]);
      } finally {
        setLoadingSubTypes(false);
      }
    };
    
    fetchSubTypes();
  }, [propertyTypeId]);

  const isFormReady = propertyType && property;

  const renderPropertyDetails = () => {
    // If no sub-property data is available, show a message
    if (!propertySubTypeData) {
      return (
        <View style={styles.sectionContent}>
          <Text style={styles.italicText}>
            Please select a property sub-type to continue.
          </Text>
        </View>
      );
    }

    console.log("Property Sub-Type Data:", JSON.stringify(propertySubTypeData, null, 2));
    console.log("isMultiTower:", propertySubTypeData.isMultiTower);
    console.log("isPlot:", propertySubTypeData.isPlot);
    console.log("isHouseVilla:", propertySubTypeData.isHouseVilla);
    console.log("isCommercialUnit:", propertySubTypeData.isCommercialUnit);

    // Scenario 1: If isMultiTower is true - Show New Tower or Existing Tower options
    if (propertySubTypeData.isMultiTower === true) {
      return (
        <ApartmentComplexSection
          towerType={towerType}
          setTowerType={setTowerType}
          projectId={projectId}
          subPropertyTypeId={propertySubTypeData.id}
        />
      );
    }

    // Scenario 2: If isPlot is true - Will implement later
    if (propertySubTypeData.isPlot === true) {
      return <PlotSection />;
    }

    // Scenario 3: If isHouseVilla is true
    if (propertySubTypeData.isHouseVilla === true) {
      return <IndependentHouseSection />;
    }

    // Scenario 4: If isCommercialUnit is true
    if (propertySubTypeData.isCommercialUnit === true) {
      return <CommercialShopSection />;
    }

    // Fallback for any unmatched combination
    return (
      <View style={styles.sectionContent}>
        <Text style={styles.italicText}>
          Form not configured for this property type combination.
        </Text>
        <Text style={[styles.italicText, { marginTop: 10, fontSize: 12 }]}>
          Sub-property type: {property}
        </Text>
        <Text style={[styles.italicText, { marginTop: 5, fontSize: 11 }]}>
          Flags: isMultiTower={String(propertySubTypeData.isMultiTower)}, 
          isPlot={String(propertySubTypeData.isPlot)}, 
          isHouseVilla={String(propertySubTypeData.isHouseVilla)}
        </Text>
      </View>
    );
  };

  // Loading state
  if (loadingPropertyTypes) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.placeholder }}>Loading property types...</Text>
      </SafeAreaView>
    );
  }

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
              {propertyTypes.map((type) => {
                // Try different possible field names for the property type name
                const typeName = type.realEstatePropertyType || 
                                type.propertyType || 
                                type.name || 
                                type.typeName ||
                                'Unknown Type';
                
                console.log("Rendering type:", JSON.stringify(type));
                
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                      setPropertyType(typeName);
                      setPropertyTypeId(type.id);
                      setProperty("");
                    }}
                    style={[
                      styles.optionButton,
                      propertyType === typeName ? styles.optionButtonActivePrimary : styles.optionButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        propertyType === typeName ? styles.optionTextActive : styles.optionTextInactive,
                      ]}
                    >
                      {typeName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Property Sub-Type */}
          <View style={styles.propertyRow}>
            <Text style={styles.label}>Property Sub-Type *</Text>
            {loadingSubTypes ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -5 }}>
                {propertyTypeId && subPropertyTypes.length > 0 ? (
                  subPropertyTypes.map((p) => {
                    // Try different possible field names for the sub-property type name
                    const subTypeName = p.subPropertyType || 
                                       p.propertySubType || 
                                       p.name || 
                                       p.subType ||
                                       'Unknown Sub-Type';
                    
                    console.log("Rendering sub-type:", JSON.stringify(p));
                    
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          setProperty(subTypeName);
                          setPropertySubTypeData(p); // Store the entire sub-property object
                        }}
                        style={[
                          styles.optionButton,
                          property === subTypeName ? styles.optionButtonActiveSecondary : styles.optionButtonInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            property === subTypeName ? styles.optionTextActive : styles.optionTextInactive,
                          ]}
                        >
                          {subTypeName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.italicText}>
                    {propertyTypeId ? "No sub-types available" : "Please select a property type first"}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Property Details Section */}
        {isFormReady ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2. Enter {property} Details</Text>
            {renderPropertyDetails()}
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>2. Property Details Form</Text>
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.placeholder} />
              <Text style={[styles.italicText, { marginTop: 15 }]}>
                Select a property type and sub-type above to view the required details form.
              </Text>
            </View>
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
  
  // Form Section (for separating form components)
  formSection: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
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