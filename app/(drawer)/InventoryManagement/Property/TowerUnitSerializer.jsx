import React, { useState } from "react";
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
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../../../../services/api";

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

const TowerUnitSerializer = ({ towerData, onComplete }) => {
  const floors = towerData?.tower?.floors || [];

  const [units, setUnits] = useState(() => {
    return floors.map((f) => ({
      floorNumber: f.floorNumber,
      flats: f.flats.map((flat) => ({
        id: flat.id,
        area: flat.area,
        areaUnitId: flat.areaUnitId,
        flatNumber: flat.flatNumber || "",
      })),
    }));
  });

  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle individual flat number change
  const handleNumberChange = (floorIndex, flatIndex, value) => {
    setUnits((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[floorIndex].flats[flatIndex].flatNumber = value;
      return updated;
    });
  };

  // Handle auto-fill based on floor number
  const handleAutoFillByFloor = () => {
    setUnits((prev) =>
      prev.map((floor) => ({
        ...floor,
        flats: floor.flats.map((flat, index) => {
          // Format: FloorNumber + FlatIndex (e.g., Floor 2, Flat 1 → 201)
          const flatNumber = `${floor.floorNumber}${String(index + 1).padStart(2, '0')}`;
          return { ...flat, flatNumber };
        }),
      }))
    );

    Alert.alert(
      "Success",
      "Flat numbers assigned based on floor numbers!"
    );
  };

  // Handle bulk fill (Sequential numbering, floor-independent)
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
        "Please enter valid numbers. 'From' must be less than or equal to 'To'."
      );
      return;
    }

    const availableNumbers = end - start + 1;
    if (availableNumbers < totalFlats) {
      Alert.alert(
        "Warning",
        `Range ${start}-${end} has only ${availableNumbers} numbers, but you have ${totalFlats} flats. Some flats will not be numbered.`
      );
    }

    let currentNumber = start;

    setUnits((prev) =>
      prev.map((floor) => ({
        ...floor,
        flats: floor.flats.map((flat) => {
          if (currentNumber <= end) {
            const numbered = { ...flat, flatNumber: String(currentNumber) };
            currentNumber++;
            return numbered;
          }
          return flat; // If range exhausted, leave empty
        }),
      }))
    );

    const lastNumberUsed = currentNumber - 1;
    Alert.alert(
      "Success",
      `Flats numbered from ${start} to ${lastNumberUsed}.\nTotal: ${lastNumberUsed - start + 1} flats numbered.`
    );
  };

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const isAnyFlatNumberEmpty = units.some((floor) =>
      floor.flats.some((flat) => flat.flatNumber.trim() === "")
    );

    if (isAnyFlatNumberEmpty) {
      Alert.alert(
        "Validation Error",
        "Please ensure all flat numbers are filled before saving."
      );
      setIsSubmitting(false);
      return;
    }

    // Prepare Payload: Update the original towerData structure
    const updatedData = JSON.parse(JSON.stringify(towerData));

    updatedData.tower.floors.forEach((floor, fIndex) => {
      floor.flats.forEach((flat, flIndex) => {
        flat.flatNumber = units[fIndex].flats[flIndex].flatNumber;
      });
    });

    // API Submission
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

      Alert.alert("Success", "Tower units saved successfully!");
      onComplete();
    } catch (err) {
      console.error(
        "Serialization Error:",
        err.response?.data || err.message
      );
      Alert.alert(
        "Error",
        "Failed to save tower unit numbers. Check console for details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Unit Numbers</Text>

      {/* Auto-Fill by Floor Button */}
      <TouchableOpacity
        onPress={handleAutoFillByFloor}
        style={styles.autoFillButton}
      >
        <Text style={styles.autoFillButtonText}>
          🏢 Auto-Fill Based on Floor Numbers
        </Text>
      </TouchableOpacity>

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

      {/* Floor/Flat Mapping Section */}
      <ScrollView
        style={styles.floorScrollView}
        contentContainerStyle={styles.floorScrollContent}
      >
        {units.map((floor, fIdx) => (
          <View key={fIdx} style={styles.floorCard}>
            <Text style={styles.floorTitle}>Floor - {floor.floorNumber}</Text>
            <View style={styles.flatsGrid}>
              {floor.flats.map((flat, index) => (
                <View key={flat.id} style={styles.flatBox}>
                  <Text style={styles.flatId}>ID: {flat.id}</Text>
                  <Text style={styles.flatArea}>
                    {flat.area} sq.ft
                  </Text>
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
          <Text style={styles.submitButtonText}>Save Serialized Units</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: 15,
  },
  bulkFillSection: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bulkLabel: {
    fontSize: 15,
    fontFamily: "PlusSB",
    color: COLORS.text,
    marginBottom: 10,
  },
  bulkInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulkInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    width: 70,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bulkFillButtonText: {
    color: COLORS.background,
    fontFamily: "PlusSB",
    fontSize: 14,
  },
  autoFillButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  autoFillButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontFamily: "PlusSB",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  floorScrollView: {
    maxHeight: 400,
  },
  floorScrollContent: {
    paddingBottom: 20,
  },
  floorCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  floorTitle: {
    fontSize: 16,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 15,
  },
  flatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  flatBox: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    width: 100,
    alignItems: "center",
  },
  flatId: {
    fontSize: 10,
    fontFamily: "PlusL",
    color: COLORS.placeholder,
    marginBottom: 5,
  },
  flatArea: {
    fontSize: 12,
    fontFamily: "PlusSB",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  flatInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    textAlign: "center",
    fontFamily: "PlusM",
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontFamily: "PlusSB",
  },
});

export default TowerUnitSerializer;
