import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../../../../services/api";
import useStructure from "../../../../hooks/useStructure";
import AddPropertyUnits from "../../../../components/AddPropertyUnits";
import TowerUnitSerializer from "./TowerUnitSerializer";
import ExistingPropertyUnitForm from "./ExistingPropertyUnitForm";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
  setCreatedTowerData,
  setShowSerializerModal,
}) => {
  // Fetch structure types for dropdowns using the correct hook
  const { structures, loading: loadingStructures } = useStructure();
  const [saving, setSaving] = useState(false);

  // State for floor structure builder (like website)
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedAreaObj, setSelectedAreaObj] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [towerUnits, setTowerUnits] = useState([]);
  const [structuresData, setStructuresData] = useState([]);
  const [areas, setAreas] = useState([]);
  const [totalLinkableUnit, setTotalLinkableUnit] = useState(0);
  const [remainingLinkableUnits, setRemainingLinkableUnits] = useState(0);
  const [floorStructures, setFloorStructures] = useState([]);

  const selectedUnitId = selectedUnit?.id;

  // Fetch Tower Units
  useEffect(() => {
    const fetchTowerUnits = async () => {
      try {
        const secretKey = await SecureStore.getItemAsync("auth_token");
        const res = await axios.get(
          `${API_BASE_URL}/tower-property-items/getAllTowerPropertyItems`,
          { headers: { secret_key: secretKey } }
        );
        setTowerUnits(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Fetch Tower Units Error:", err);
      }
    };
    fetchTowerUnits();
  }, []);

  // Fetch Structures
  useEffect(() => {
    if (!projectId || !subPropertyTypeId || !selectedUnitId) {
      setStructuresData([]);
      return;
    }
    const fetchStructures = async () => {
      try {
        const secretKey = await SecureStore.getItemAsync("auth_token");
        const res = await axios.get(
          `${API_BASE_URL}/real-estate-properties/getStructureByProjectIdAndSubPropertyTypeIdOfLinkableProperty`,
          {
            headers: { secret_key: secretKey },
            params: { projectId, subPropertyTypeId, floorUnitId: selectedUnitId },
          }
        );
        setStructuresData(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Fetch Structures Error:", err);
      }
    };
    fetchStructures();
  }, [projectId, subPropertyTypeId, selectedUnitId]);

  // Fetch Areas
  useEffect(() => {
    if (!projectId || !subPropertyTypeId || !selectedUnitId || !selectedStructure) {
      setAreas([]);
      return;
    }
    const fetchAreas = async () => {
      try {
        const secretKey = await SecureStore.getItemAsync("auth_token");
        const res = await axios.get(
          `${API_BASE_URL}/real-estate-properties/getPropertyAreasBySubPropertyTypeIdAndStructureIdAndFloorUnit`,
          {
            headers: { secret_key: secretKey },
            params: {
              projectId,
              subPropertyTypeId,
              floorUnitId: selectedUnitId,
              structureId: selectedStructure,
            },
          }
        );
        setAreas(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Fetch Areas Error:", err);
      }
    };
    fetchAreas();
  }, [projectId, subPropertyTypeId, selectedUnitId, selectedStructure]);

  // Track Selected Area Object
  useEffect(() => {
    if (!selectedArea || areas.length === 0) {
      setSelectedAreaObj(null);
      return;
    }
    const foundArea = areas.find(
      (a) => parseFloat(a.area) === parseFloat(selectedArea) && a.areaUnit?.id != null
    );
    setSelectedAreaObj(foundArea || null);
  }, [selectedArea, areas]);

  // Fetch Linkable Units
  const fetchLinkableUnits = async () => {
    if (!selectedAreaObj || !selectedStructure || !selectedUnitId || !projectId || !subPropertyTypeId) {
      setTotalLinkableUnit(0);
      setRemainingLinkableUnits(0);
      return;
    }

    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const params = {
        projectId: Number(projectId),
        subPropertyTypeId: Number(subPropertyTypeId),
        floorUnitId: Number(selectedUnitId),
        structureId: Number(selectedStructure),
        area: Number(selectedAreaObj.area),
        areaUnitId: Number(selectedAreaObj.areaUnit.id),
      };

      const res = await axios.get(
        `${API_BASE_URL}/real-estate-properties/getTotalLinkableUnit`,
        {
          headers: { secret_key: secretKey },
          params,
        }
      );

      const total = res.data?.data || res.data || 0;
      setTotalLinkableUnit(total);
      setRemainingLinkableUnits(total);
    } catch (err) {
      console.error("Fetch Linkable Units Error:", err);
      setTotalLinkableUnit(0);
      setRemainingLinkableUnits(0);
    }
  };

  useEffect(() => {
    fetchLinkableUnits();
  }, [selectedAreaObj, selectedStructure, selectedUnitId, subPropertyTypeId, projectId]);

  const handleUnitChange = (unitId) => {
    const unit = towerUnits.find((u) => String(u.id) === String(unitId));
    setSelectedUnit(unit || null);
    setSelectedStructure("");
    setSelectedArea("");
    setSelectedAreaObj(null);
    setFloorStructures([]);
    setRemainingLinkableUnits(0);
    setTotalLinkableUnit(0);
  };

  const handleStructureChange = (value) => {
    setSelectedStructure(value);
    setSelectedArea("");
    setSelectedAreaObj(null);
  };

  const handleAreaChange = (value) => {
    setSelectedArea(value);
    setQuantity("");
  };

  const addFloorStructure = () => {
    if (!selectedStructure || !selectedAreaObj || !quantity) {
      Alert.alert("Error", "Please select Structure, Area, and enter Quantity.");
      return;
    }

    const qty = parseInt(quantity);
    const totalFloorsInt = parseInt(totalFloors) || 1;
    const totalNeeded = unitsPerFloorSame === "yes" ? qty * totalFloorsInt : qty;

    if (totalNeeded > remainingLinkableUnits && remainingLinkableUnits >= 0) {
      Alert.alert("Error", `Cannot add ${totalNeeded} units. Only ${remainingLinkableUnits} units are available.`);
      return;
    }
    if (totalNeeded <= 0) {
      Alert.alert("Error", "Quantity must be a positive number.");
      return;
    }

    const existingIndex = floorStructures.findIndex(
      (fs) => fs.structureId === selectedStructure && fs.areaId === selectedAreaObj.id
    );

    let adjustedRemaining = remainingLinkableUnits;

    if (existingIndex !== -1) {
      const existing = floorStructures[existingIndex];
      const prevTotal = unitsPerFloorSame === "yes" ? existing.quantity * totalFloorsInt : existing.quantity;
      adjustedRemaining = adjustedRemaining + prevTotal - totalNeeded;

      setFloorStructures((prev) => {
        const updated = [...prev];
        updated[existingIndex] = {
          structureId: selectedStructure,
          areaId: selectedAreaObj.id,
          quantity: qty,
          structureName: structuresData.find((s) => String(s.id) === String(selectedStructure))?.structureName || "Unknown",
          areaUnitName: `${selectedAreaObj.area} ${selectedAreaObj.areaUnit?.unitName}`,
          areaObj: selectedAreaObj,
        };
        return updated;
      });
    } else {
      adjustedRemaining = adjustedRemaining - totalNeeded;
      setFloorStructures((prev) => [
        ...prev,
        {
          structureId: selectedStructure,
          areaId: selectedAreaObj.id,
          quantity: qty,
          structureName: structuresData.find((s) => String(s.id) === String(selectedStructure))?.structureName || "Unknown",
          areaUnitName: `${selectedAreaObj.area} ${selectedAreaObj.areaUnit?.unitName}`,
          areaObj: selectedAreaObj,
        },
      ]);
    }

    setRemainingLinkableUnits(adjustedRemaining);
    Alert.alert("Success", `Structure added! Remaining Units: ${adjustedRemaining}`);

    setSelectedStructure("");
    setSelectedArea("");
    setSelectedAreaObj(null);
    setQuantity("");
  };

  const removeFloorStructure = (indexToRemove) => {
    const removed = floorStructures[indexToRemove];
    if (!removed) return;
    const totalFloorsInt = parseInt(totalFloors) || 1;
    const totalUnitsToRefund = unitsPerFloorSame === "yes" ? removed.quantity * totalFloorsInt : removed.quantity;
    setFloorStructures((prev) => prev.filter((_, i) => i !== indexToRemove));
    setRemainingLinkableUnits((prev) => prev + totalUnitsToRefund);
  };

  const handleSaveTower = async () => {
    try {
      if (!towerName || !totalFloors || !selectedUnit || floorStructures.length === 0) {
        Alert.alert("Error", "Please complete Tower Details and add at least one floor structure.");
        return;
      }

      setSaving(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const payload = {
        projectId: parseInt(projectId),
        subPropertyTypeId: parseInt(subPropertyTypeId),
        towerName: towerName,
        noOfFloors: parseInt(totalFloors),
        isFlatPerFloorSame: unitsPerFloorSame === "yes",
        floorUnitId: selectedUnit.id,
        metaDatas: floorStructures.map((fs) => ({
          flatHouseStructureId: parseInt(fs.structureId),
          area: parseFloat(fs.areaObj.area),
          noOfItems: parseInt(fs.quantity),
          areaUnitId: parseInt(fs.areaObj.areaUnit?.id),
        })),
      };

      console.log("Tower Save Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/real-estate-properties/createTowerStructureForApi`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: secretKey,
          },
        }
      );

      console.log("Tower Save Response:", JSON.stringify(response.data, null, 2));
      
      // Open TowerUnitSerializer modal with the created tower data
      const towerData = response.data?.data || response.data;
      if (towerData) {
        setCreatedTowerData(towerData);
        setShowSerializerModal(true);
      }

      Alert.alert("Success", "Tower created successfully! Please serialize the units.");

      // Reset form
      setFloorStructures([]);
      setSelectedUnit(null);
      setRemainingLinkableUnits(0);
      setTotalLinkableUnit(0);
    } catch (error) {
      console.error("Error saving tower:", error.message);
      Alert.alert("Error", `Failed to create tower: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formSection}>
      {/* Tower Unit Selection */}
      <Text style={styles.label}>Floor Unit Type *</Text>
      <View style={styles.inputBox}>
        <Picker
          selectedValue={selectedUnit?.id || ""}
          onValueChange={handleUnitChange}
          style={{ color: COLORS.text }}
        >
          <Picker.Item label="Select Unit" value="" />
          {towerUnits.map((unit) => (
            <Picker.Item key={unit.id} label={unit.name} value={unit.id} />
          ))}
        </Picker>
      </View>

      {selectedUnit && selectedUnit.isFlat && (
        <>
          <View style={styles.linkableUnitsInfo}>
            <Text style={styles.linkableUnitsText}>
              Total Linkable: <Text style={styles.linkableUnitsBold}>{totalLinkableUnit}</Text> | 
              Remaining: <Text style={styles.linkableUnitsBold}>{remainingLinkableUnits}</Text>
            </Text>
          </View>

          {/* Floor Structure Builder */}
          <View style={[styles.formSection, { borderColor: '#3b82f6', borderWidth: 2 }]}>
            <Text style={styles.subLabel}>Define Floor Structures</Text>

            {/* Structure Dropdown */}
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Structure *</Text>
              <Picker
                selectedValue={selectedStructure}
                onValueChange={handleStructureChange}
                style={{ color: COLORS.text }}
              >
                <Picker.Item label="Select Structure" value="" />
                {structuresData.map((s) => (
                  <Picker.Item 
                    key={s.id} 
                    label={`${s.structureName} ${s.flatHouseStructureType?.structureType || ''}`} 
                    value={s.id} 
                  />
                ))}
              </Picker>
            </View>

            {/* Area Dropdown */}
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Area *</Text>
              <Picker
                selectedValue={selectedArea}
                onValueChange={handleAreaChange}
                style={{ color: COLORS.text }}
              >
                <Picker.Item label="Select Area" value="" />
                {areas.map((a, idx) => (
                  <Picker.Item 
                    key={`area-${idx}`} 
                    label={`${a.area} ${a.areaUnit?.unitName}`} 
                    value={a.area} 
                  />
                ))}
              </Picker>
            </View>

            {/* Quantity Input */}
            <TextInputBox
              label="Quantity (Per Floor) *"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />

            {/* Add Button */}
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: '#10b981', borderColor: '#10b981' }]}
              onPress={addFloorStructure}
            >
              <Ionicons name="add-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[styles.secondaryButtonText, { color: '#fff' }]}>Add Structure</Text>
            </TouchableOpacity>

            {/* Floor Structures List */}
            {floorStructures.length > 0 && (
              <View style={styles.floorStructuresTable}>
                <Text style={styles.subLabel}>Added Structures ({floorStructures.length})</Text>
                {floorStructures.map((fs, idx) => (
                  <View key={idx} style={styles.structureRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.structureName}>{fs.structureName}</Text>
                      <Text style={styles.structureArea}>{fs.areaUnitName}</Text>
                    </View>
                    <Text style={styles.structureQty}>Qty: {fs.quantity}</Text>
                    <TouchableOpacity onPress={() => removeFloorStructure(idx)}>
                      <Ionicons name="trash" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Save Tower Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, saving && { opacity: 0.6 }]} 
            onPress={handleSaveTower}
            disabled={saving || floorStructures.length === 0}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.card} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Create Tower</Text>
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
const ApartmentComplexSection = ({ towerType, setTowerType, projectId, subPropertyTypeId, setCreatedTowerData, setShowSerializerModal }) => {
  const [unitsPerFloorSame, setUnitsPerFloorSame] = useState("yes");
  const [towerName, setTowerName] = useState("");
  const [totalFloors, setTotalFloors] = useState("");

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
            towerName={towerName}
            totalFloors={totalFloors}
            projectId={projectId}
            subPropertyTypeId={subPropertyTypeId}
            unitsPerFloorSame={unitsPerFloorSame}
            setCreatedTowerData={setCreatedTowerData}
            setShowSerializerModal={setShowSerializerModal}
          />
        )
      )}
    </View>
  );
};

/* -------------------- Independent House Section -------------------- */
const IndependentHouseSection = ({ projectId, subPropertyTypeId }) => (
  <View style={styles.sectionContent}>
    <Text style={styles.instructionText}>Assign Independent House units</Text>
    <AddPropertyUnits
      projectId={projectId}
      subPropertyTypeId={subPropertyTypeId}
    />
  </View>
);

/* ---------------------------- Plot Section --------------------------- */
const PlotSection = ({ projectId, subPropertyTypeId }) => (
  <View style={styles.sectionContent}>
    <Text style={styles.instructionText}>Assign Plot units</Text>
    <AddPropertyUnits
      projectId={projectId}
      subPropertyTypeId={subPropertyTypeId}
    />
  </View>
);

/* ------------------------- Commercial Shop Section ------------------------- */
const CommercialShopSection = ({ projectId, subPropertyTypeId }) => (
  <View style={styles.sectionContent}>
    <Text style={styles.instructionText}>Assign Commercial Shop units</Text>
    <AddPropertyUnits
      projectId={projectId}
      subPropertyTypeId={subPropertyTypeId}
    />
  </View>
);

/* ------------------------- Commercial Plot Section ------------------------- */
const CommercialPlotSection = ({ projectId, subPropertyTypeId }) => (
  <View style={styles.sectionContent}>
    <Text style={styles.instructionText}>Assign Commercial Plot units</Text>
    <AddPropertyUnits
      projectId={projectId}
      subPropertyTypeId={subPropertyTypeId}
    />
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

  // State for TowerUnitSerializer Modal
  const [showSerializerModal, setShowSerializerModal] = useState(false);
  const [createdTowerData, setCreatedTowerData] = useState(null);

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
          setCreatedTowerData={setCreatedTowerData}
          setShowSerializerModal={setShowSerializerModal}
        />
      );
    }

    // Scenario 2: If isPlot is true
    if (propertySubTypeData.isPlot === true) {
      return (
        <PlotSection 
          projectId={projectId}
          subPropertyTypeId={propertySubTypeData.id}
        />
      );
    }

    // Scenario 3: If isHouseVilla is true
    if (propertySubTypeData.isHouseVilla === true) {
      return (
        <IndependentHouseSection 
          projectId={projectId}
          subPropertyTypeId={propertySubTypeData.id}
        />
      );
    }

    // Scenario 4: If isCommercialUnit is true
    if (propertySubTypeData.isCommercialUnit === true) {
      return (
        <CommercialShopSection 
          projectId={projectId}
          subPropertyTypeId={propertySubTypeData.id}
        />
      );
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
          isHouseVilla={String(propertySubTypeData.isHouseVilla)},
          isCommercialUnit={String(propertySubTypeData.isCommercialUnit)}
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

      {/* TowerUnitSerializer Modal */}
      <Modal
        visible={showSerializerModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSerializerModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSerializerModal(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Serialize Tower Units</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {createdTowerData && (
            <TowerUnitSerializer
              towerData={createdTowerData}
              onComplete={() => {
                setShowSerializerModal(false);
                setCreatedTowerData(null);
                Alert.alert("Success", "Tower units serialized successfully!");
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}


/* -------------------------- Stylesheet --------------------------- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: wp('4%'),
    paddingTop: hp('4%'),
    paddingBottom: hp('6%'),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('1.2%'),
  },
  headerTitle: {
    fontSize: wp('6.8%'),
    fontFamily: "PlusSB",
    color: COLORS.primary,
  },
  backButton: {
    padding: wp('1.2%'),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 3,
  },
  sectionContainer: {
    backgroundColor: COLORS.card,
    borderRadius: wp('4%'),
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: hp('0.25%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('1%'),
    elevation: 5,
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontFamily: "PlusSB",
    color: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingBottom: hp('1%'),
    marginBottom: hp('2%'),
  },
  propertyRow: {
    marginBottom: hp('1.8%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusSB",
    marginBottom: hp('1%'),
    color: COLORS.text,
  },
  subLabel: {
    fontSize: wp('4%'),
    fontFamily: "PlusSB",
    marginTop: hp('1.2%'),
    marginBottom: hp('1.2%'),
    color: COLORS.text,
  },
  instructionText: {
    fontSize: wp('3.2%'),
    fontFamily: "PlusL",
    color: COLORS.placeholder,
    marginBottom: hp('1.8%'),
  },
  
  // Option Buttons (Horizontal Scroll)
  optionButton: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4.5%'),
    borderRadius: wp('3%'),
    marginRight: wp('2.5%'),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp('0.12%') },
    shadowOpacity: 0.05,
    shadowRadius: wp('0.2%'),
    elevation: 2,
  },
  optionButtonActivePrimary: { backgroundColor: COLORS.primary },
  optionButtonActiveSecondary: { backgroundColor: COLORS.secondary },
  optionButtonInactive: { 
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionText: { fontSize: wp('3.5%'), fontFamily: "PlusM" },
  optionTextActive: { color: COLORS.card, fontFamily: "PlusSB" },
  optionTextInactive: { color: COLORS.text, fontFamily: "PlusL" },
  italicText: { fontStyle: "italic", fontFamily: "PlusL", color: COLORS.placeholder, textAlign: 'center', paddingVertical: hp('1.2%') },
  sectionContent: { marginTop: hp('0.6%') },
  
  // Form Section (for separating form components)
  formSection: {
    backgroundColor: COLORS.background,
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.8%'),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Tower Type Toggle Buttons
  toggleRow: { flexDirection: "row", gap: wp('2.5%'), marginBottom: hp('1.2%') },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleLabel: { marginLeft: wp('2%'), fontFamily: 'PlusSB', color: COLORS.text, fontSize: wp('3.5%') },
  radioGroup: { flexDirection: "row", gap: wp('6%'), marginBottom: hp('1.2%') },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioLabel: { marginLeft: wp('2%'), fontFamily: "PlusM", color: COLORS.text },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: hp('1.8%'),
    borderRadius: wp('3%'),
    marginTop: hp('2.5%'),
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: hp('0.37%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('1%'),
  },
  primaryButtonText: { color: COLORS.card, fontSize: wp('4%'), fontFamily: "PlusSB", textAlign: "center" },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: hp('1.5%'),
    borderRadius: wp('3%'),
    marginTop: hp('1.2%'),
    borderWidth: 1.5,
  },
  secondaryButtonText: { fontSize: wp('3.5%'), fontFamily: "PlusSB", textAlign: "center" },
  inputBox: { marginBottom: hp('1.8%') },
  inputLabel: { marginBottom: hp('0.6%'), fontFamily: "PlusSB", color: COLORS.text },
  input: {
    backgroundColor: COLORS.input,
    padding: wp('3%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: wp('4%'),
    fontFamily: "PlusL",
  },
  unitBox: { 
    marginBottom: hp('2.5%'), 
    padding: wp('4%'),
    paddingTop: hp('1.2%'),
    backgroundColor: COLORS.input,
    borderRadius: wp('3%'),
    borderLeftWidth: 4,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: hp('1.2%'),
    paddingVertical: hp('0.6%'),
  },
  unitHeaderText: {
    fontFamily: 'PlusSB',
    color: COLORS.primary,
  },
  removeButton: {
    padding: wp('1.2%'),
    alignSelf: 'flex-end',
  },
  errorText: { 
    marginTop: hp('2.5%'),
    padding: wp('2.5%'),
    borderRadius: wp('2%'),
    borderLeftWidth: 4,
    borderColor: COLORS.warning,
    backgroundColor: '#fffbe6',
    fontFamily: 'PlusM',
  },
  linkableUnitsInfo: {
    backgroundColor: '#3b82f620',
    padding: wp('3%'),
    borderRadius: wp('2.5%'),
    marginVertical: hp('1.8%'),
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  linkableUnitsText: {
    fontSize: wp('4%'),
    fontFamily: "PlusM",
    color: '#1e40af',
    textAlign: 'center',
  },
  linkableUnitsBold: {
    fontFamily: 'PlusSB',
    fontSize: wp('4.2%'),
  },
  floorStructuresTable: {
    marginTop: hp('2.5%'),
    padding: wp('3%'),
    backgroundColor: '#f9fafb',
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  structureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('2.5%'),
    backgroundColor: COLORS.background,
    borderRadius: wp('2%'),
    marginTop: hp('1%'),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  structureName: {
    fontSize: wp('4%'),
    fontFamily: 'PlusSB',
    color: COLORS.text,
  },
  structureArea: {
    fontSize: wp('3.2%'),
    fontFamily: 'PlusM',
    color: '#10b981',
    marginTop: hp('0.3%'),
  },
  structureQty: {
    fontSize: wp('3.5%'),
    fontFamily: 'PlusSB',
    color: COLORS.text,
    marginRight: wp('3.5%'),
  },
});