import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../../../../services/api";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const COLORS = {
  primary: "#004d40",
  primaryLight: "#218373ff",
  secondary: "#198170ff",
  success: "#22c55e",
  background: "#fff",
  card: "#f4fcf4",
  input: "#f0f8f0",
  border: "#c8e6c9",
  text: "#202020ff",
  placeholder: "#13773dff",
  error: "#d32f2f",
};

const ExistingPropertyUnitForm = ({ projectId, subPropertyTypeId }) => {
  const [existingBlocks, setExistingBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [blockDetails, setBlockDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Serialization state
  const [units, setUnits] = useState([]);
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetches the list of blocks/towers for the project
  const fetchExistingBlocks = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.post(
        `${API_BASE_URL}/real-estate-properties/createTowerStructureForApi`,
        {
          projectId: Number(projectId),
          subPropertyTypeId: Number(subPropertyTypeId),
        },
        {
          headers: {
            secret_key: secretKey,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data?.tower?.blocks) {
        setExistingBlocks(data.tower.blocks);
      } else {
        setExistingBlocks([]);
      }
    } catch (err) {
      console.error("Fetch Existing Blocks Error:", err);
      setError("Failed to fetch existing blocks.");
      setExistingBlocks([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, subPropertyTypeId]);

  // Initialize unit state from block details
  const initializeUnitState = (details) => {
    if (!details?.tower?.floors) return;

    const initialUnits = details.tower.floors.map((floor) => ({
      floorNumber: floor.floorNumber,
      flats: floor.flats.map((flat) => ({
        id: flat.id,
        area: flat.area,
        areaUnitId: flat.areaUnitId,
        flatNumber: flat.flatNumber || "",
      })),
    }));

    setUnits(initialUnits);
  };

  // Fetches the detailed floor/unit structure for the selected block
  const fetchBlockDetails = useCallback(
    async (blockId) => {
      if (!blockId) return;

      try {
        setIsLoading(true);
        const secretKey = await SecureStore.getItemAsync("auth_token");

        const selectedBlock = existingBlocks.find(
          (b) => String(b.id) === String(blockId)
        );

        if (!selectedBlock) {
          setError("Selected block not found.");
          return;
        }

        const payload = {
          projectId: Number(projectId),
          subPropertyTypeId: Number(subPropertyTypeId),
          id: selectedBlock.id,
        };

        const response = await axios.post(
          `${API_BASE_URL}/real-estate-properties/createTowerStructureForApi`,
          payload,
          {
            headers: {
              secret_key: secretKey,
              "Content-Type": "application/json",
            },
          }
        );

        setBlockDetails(response.data);
        initializeUnitState(response.data);
      } catch (err) {
        console.error("Fetch Block Details Error:", err);
        setError("Failed to fetch block details.");
      } finally {
        setIsLoading(false);
      }
    },
    [existingBlocks, projectId, subPropertyTypeId]
  );

  useEffect(() => {
    fetchExistingBlocks();
  }, [fetchExistingBlocks]);

  const handleBlockSelection = (blockId) => {
    setSelectedBlockId(blockId);
    setBlockDetails(null);
    setUnits([]);
    if (blockId) {
      fetchBlockDetails(blockId);
    }
  };

  const selectedBlock = existingBlocks.find(
    (b) => String(b.id) === String(selectedBlockId)
  );

  const handleNumberChange = (floorIndex, flatIndex, value) => {
    setUnits((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[floorIndex].flats[flatIndex].flatNumber = value;
      return updated;
    });
  };

  const handleBulkFill = () => {
    const start = Number(bulkFrom);
    const end = Number(bulkTo);
    const totalFlats = units.reduce(
      (total, floor) => total + floor.flats.length,
      0
    );

    if (isNaN(start) || isNaN(end) || start < 1 || start > end) {
      Alert.alert(
        "Invalid Range",
        "'From' must be less than or equal to 'To' (and positive)."
      );
      return;
    }

    if (end - start + 1 < totalFlats) {
      Alert.alert(
        "Warning",
        `The range ${start}-${end} is smaller than the total number of flats (${totalFlats}). Not all flats will be numbered.`
      );
    }

    let current = start;

    setUnits((prev) =>
      prev.map((floor) => ({
        ...floor,
        flats: floor.flats.map((flat) => {
          if (current <= end) {
            const numbered = { ...flat, flatNumber: String(current) };
            current++;
            return numbered;
          }
          return flat;
        }),
      }))
    );

    Alert.alert("Success", `Units filled from ${start} up to ${current - 1}.`);
  };

  const handleAssignmentComplete = () => {
    setSelectedBlockId("");
    setBlockDetails(null);
    setUnits([]);
    setBulkFrom("");
    setBulkTo("");
    fetchExistingBlocks();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const isAnyFlatNumberEmpty = units.some((floor) =>
      floor.flats.some((flat) => flat.flatNumber.trim() === "")
    );

    if (isAnyFlatNumberEmpty) {
      Alert.alert(
        "Validation Error",
        "Please ensure all flat numbers are filled before submitting."
      );
      setIsSubmitting(false);
      return;
    }

    // Build payload
    const updatedData = JSON.parse(JSON.stringify(blockDetails));

    if (updatedData?.tower?.floors) {
      updatedData.tower.floors.forEach((floor, fIndex) => {
        floor.flats.forEach((flat, flIndex) => {
          flat.flatNumber = units[fIndex].flats[flIndex].flatNumber;
        });
      });
    }

    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      await axios.post(
        `${API_BASE_URL}/real-estate-properties/serializeProperty`,
        updatedData,
        {
          headers: {
            secret_key: secretKey,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert(
        "Success",
        "Unit numbers assigned successfully!",
        [{ text: "OK", onPress: handleAssignmentComplete }]
      );
    } catch (err) {
      console.error("Assignment Error:", err);
      Alert.alert("Error", "Failed to assign unit numbers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && existingBlocks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading blocks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Units to Existing Tower</Text>

      {/* Block Selection */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Tower/Block *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedBlockId}
            onValueChange={handleBlockSelection}
            style={styles.picker}
          >
            <Picker.Item label="Select Block..." value="" />
            {existingBlocks.map((block) => (
              <Picker.Item
                key={block.id}
                label={block.blockHouseName}
                value={String(block.id)}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Loading state for block details */}
      {isLoading && selectedBlockId && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading block details...</Text>
        </View>
      )}

      {/* Show unit assignment form when block is selected and loaded */}
      {selectedBlock && blockDetails && units.length > 0 && (
        <>
          <Text style={styles.selectedBlockText}>
            Selected: {selectedBlock.blockHouseName}
          </Text>

          {/* Bulk Fill Section */}
          <View style={styles.bulkFillSection}>
            <Text style={styles.bulkLabel}>Bulk Fill Range:</Text>
            <View style={styles.bulkInputRow}>
              <TextInput
                style={styles.bulkInput}
                placeholder="From"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="number-pad"
                value={bulkFrom}
                onChangeText={setBulkFrom}
              />
              <Text style={styles.bulkToText}>to</Text>
              <TextInput
                style={styles.bulkInput}
                placeholder="To"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="number-pad"
                value={bulkTo}
                onChangeText={setBulkTo}
              />
              <TouchableOpacity
                onPress={handleBulkFill}
                disabled={!bulkFrom || !bulkTo}
                style={[
                  styles.bulkFillButton,
                  (!bulkFrom || !bulkTo) && styles.disabledButton,
                ]}
              >
                <Text style={styles.bulkFillButtonText}>Fill</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Floor/Flat Mapping */}
          <ScrollView
            style={styles.floorScrollView}
            contentContainerStyle={styles.floorScrollContent}
          >
            {units.map((floor, fIdx) => (
              <View key={fIdx} style={styles.floorCard}>
                <Text style={styles.floorTitle}>
                  Floor - {floor.floorNumber}
                </Text>
                <View style={styles.flatsGrid}>
                  {floor.flats.map((flat, index) => (
                    <View key={flat.id} style={styles.flatBox}>
                      <Text style={styles.flatId}>ID: {flat.id}</Text>
                      <Text style={styles.flatArea}>{flat.area} sq.ft</Text>
                      <TextInput
                        style={styles.flatInput}
                        placeholder="Flat No."
                        placeholderTextColor={COLORS.placeholder}
                        value={flat.flatNumber}
                        onChangeText={(value) =>
                          handleNumberChange(fIdx, index, value)
                        }
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[
              styles.submitButton,
              isSubmitting && styles.disabledButton,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.submitButtonText}>Assign Unit Numbers</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp('5%'),
    backgroundColor: COLORS.card,
    borderRadius: wp('3%'),
    marginBottom: hp('2.5%'),
  },
  title: {
    fontSize: wp('4.5%'),
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: hp('2%'),
  },
  pickerContainer: {
    marginBottom: hp('2.5%'),
  },
  label: {
    fontSize: wp('3.5%'),
    fontFamily: "PlusSB",
    color: COLORS.text,
    marginBottom: hp('1%'),
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    borderRadius: wp('2%'),
  },
  picker: {
    color: COLORS.text,
  },
  selectedBlockText: {
    fontSize: wp('3.8%'),
    fontFamily: "PlusSB",
    color: COLORS.secondary,
    marginBottom: hp('2%'),
  },
  loadingContainer: {
    padding: hp('2.5%'),
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp('1.2%'),
    fontFamily: "PlusM",
    color: COLORS.placeholder,
  },
  bulkFillSection: {
    backgroundColor: COLORS.background,
    padding: wp('4%'),
    borderRadius: wp('2.5%'),
    marginBottom: hp('2.5%'),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bulkLabel: {
    fontSize: wp('3.8%'),
    fontFamily: "PlusSB",
    color: COLORS.text,
    marginBottom: hp('1.2%'),
  },
  bulkInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp('2.5%'),
  },
  bulkInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    width: wp('18%'),
    textAlign: "center",
    fontFamily: "PlusM",
    color: COLORS.text,
  },
  bulkToText: {
    fontFamily: "PlusM",
    color: COLORS.placeholder,
  },
  bulkFillButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
  },
  bulkFillButtonText: {
    color: COLORS.background,
    fontFamily: "PlusSB",
    fontSize: wp('3.5%'),
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  floorScrollView: {
    maxHeight: hp('50%'),
  },
  floorScrollContent: {
    paddingBottom: hp('2.5%'),
  },
  floorCard: {
    backgroundColor: COLORS.background,
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  floorTitle: {
    fontSize: wp('4%'),
    fontFamily: "PlusSB",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: hp('2%'),
  },
  flatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp('2.5%'),
    justifyContent: "center",
  },
  flatBox: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp('2.5%'),
    padding: wp('2.5%'),
    width: wp('25%'),
    alignItems: "center",
  },
  flatId: {
    fontSize: wp('2.5%'),
    fontFamily: "PlusL",
    color: COLORS.placeholder,
    marginBottom: hp('0.6%'),
  },
  flatArea: {
    fontSize: wp('3%'),
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: hp('1%'),
    textAlign: "center",
  },
  flatInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    width: "100%",
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('1.5%'),
    textAlign: "center",
    fontFamily: "PlusM",
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    paddingVertical: hp('2%'),
    borderRadius: wp('2.5%'),
    alignItems: "center",
    marginTop: hp('1.2%'),
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: wp('4%'),
    fontFamily: "PlusSB",
  },
  errorText: {
    color: COLORS.error,
    fontFamily: "PlusM",
    marginTop: hp('1.2%'),
  },
});

export default ExistingPropertyUnitForm;
