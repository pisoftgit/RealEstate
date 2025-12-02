import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#004d40",
  success: "#10b981",
  error: "#ef4444",
  background: "#fff",
  border: "#d1d5db",
  inputBg: "#f9fafb",
  text: "#1f2937",
  textLight: "#6b7280",
};

const AddPropertyUnits = ({ projectId, subPropertyTypeId, onChange }) => {
  const [units, setUnits] = useState([]);
  const [updatedUnits, setUpdatedUnits] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const getEditableKey = (unit) => {
    if (unit.nameOrNumber !== undefined) return "nameOrNumber";
    if (unit.plotNumber !== undefined) return "plotNumber";
    if (unit.blockHouseNumber !== undefined) return "blockHouseNumber";
    return "nameOrNumber";
  };

  // -------------------------------------------
  // FETCH UNITS
  // -------------------------------------------
  useEffect(() => {
    if (!projectId || !subPropertyTypeId) return;

    const fetchUnits = async () => {
      setLoading(true);
      setError(null);

      try {
        const secretKey = await SecureStore.getItemAsync("auth_token");
        
        const payload = {
          projectId: Number(projectId),
          subPropertyTypeId: Number(subPropertyTypeId),
        };

        const res = await axios.post(
          `${API_BASE_URL}/real-estate-properties/createTowerStructureForApi`,
          payload,
          {
            headers: {
              secret_key: secretKey,
              "Content-Type": "application/json",
            },
          }
        );

        const data = res?.data || {};

        const list =
          data.plots?.length
            ? data.plots
            : data.houseVillas?.length
              ? data.houseVillas
              : data.commercialUnits?.length
                ? data.commercialUnits
                : [];

        const initialUpdated = {};

        list.forEach((unit) => {
          const key = getEditableKey(unit);

          // ensure key exists
          if (unit[key] === undefined) {
            unit[key] = "";
          }

          initialUpdated[unit.id] = {
            id: unit.id,
            existingValue: unit[key] || "",
            [key]: unit[key] || "",
          };
        });

        setUpdatedUnits(initialUpdated);
        setUnits(list);
      } catch (err) {
        console.error("Fetch Units Error:", err);
        setError("Failed to fetch units.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [projectId, subPropertyTypeId]);

  // -------------------------------------------
  // ON INPUT CHANGE
  // -------------------------------------------
  const handleChange = (unit, value) => {
    const key = getEditableKey(unit);
    const existingValue = updatedUnits[unit.id]?.existingValue || "";

    if (value === existingValue) {
      setUpdatedUnits((prev) => ({
        ...prev,
        [unit.id]: {
          ...prev[unit.id],
          [key]: value,
          error: "Value should be different from existing one",
        },
      }));
      return;
    }

    setUpdatedUnits((prev) => ({
      ...prev,
      [unit.id]: {
        ...prev[unit.id],
        [key]: value,
        error: "",
      },
    }));

    onChange && onChange(updatedUnits);
  };

  // -------------------------------------------
  // SUBMIT MERGED PAYLOAD
  // -------------------------------------------
  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitMessage("");

    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const mergedUnits = units.map((unit) => {
        const key = getEditableKey(unit);

        const updatedValue =
          updatedUnits[unit.id]?.[key] !== undefined
            ? updatedUnits[unit.id]?.[key]
            : unit[key] || "";

        return {
          ...unit,
          [key]: updatedValue,
        };
      });

      const payload = {
        projectId: Number(projectId),
        subPropertyTypeId: Number(subPropertyTypeId),
        units: mergedUnits,
      };

      console.log("FINAL MERGED PAYLOAD SENT TO API:", payload);

      await axios.post(
        `${API_BASE_URL}/real-estate-properties/serializeProperty`,
        payload,
        {
          headers: {
            secret_key: secretKey,
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitMessage("Details submitted successfully!");
      Alert.alert("Success", "Property units serialized successfully!");
    } catch (err) {
      console.error("Submit Error:", err);
      setSubmitMessage("Failed to submit details. Try again.");
      Alert.alert("Error", "Failed to submit details. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading property units...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && units.length > 0 && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.unitsGrid}>
              {units.map((unit) => {
                const key = getEditableKey(unit);
                const data = updatedUnits[unit.id];
                const value = data?.[key] || "";
                const errorMsg = data?.error;

                return (
                  <View key={unit.id} style={styles.unitCard}>
                    <Text style={styles.unitLabel}>
                      {unit.subPropertyTypeName} - {Number(unit.area).toFixed(2)} {unit.areaUnit || ""}
                    </Text>

                    <TextInput
                      value={value}
                      placeholder={`Enter ${key}`}
                      onChangeText={(text) => handleChange(unit, text)}
                      style={[styles.input, errorMsg && styles.inputError]}
                      placeholderTextColor={COLORS.textLight}
                    />

                    {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* SUBMIT */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitLoading}
              style={[styles.submitButton, submitLoading && styles.submitButtonDisabled]}
            >
              {submitLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Submit Details</Text>
                </>
              )}
            </TouchableOpacity>

            {submitMessage ? (
              <View style={[
                styles.messageContainer,
                submitMessage.includes("success") ? styles.successMessage : styles.errorMessage
              ]}>
                <Text style={styles.messageText}>{submitMessage}</Text>
              </View>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
};

export default AddPropertyUnits;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3b82f6",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: "PlusM",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    marginLeft: 8,
    color: COLORS.error,
    flex: 1,
    fontFamily: "PlusM",
  },
  unitsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  unitCard: {
    width: 200,
    padding: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unitLabel: {
    fontSize: 13,
    fontFamily: "PlusSB",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "PlusL",
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorMsg: {
    fontSize: 11,
    fontFamily: "PlusL",
    color: COLORS.error,
    marginTop: 4,
  },
  submitContainer: {
    marginTop: 20,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusSB",
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  successMessage: {
    backgroundColor: "#d1fae5",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "PlusM",
    textAlign: "center",
  },
});
