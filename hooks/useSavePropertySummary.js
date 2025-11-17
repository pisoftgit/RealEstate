import { useCallback } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { API_BASE_URL } from "../services/api";

const useSavePropertySummary = () => {
  const savePropertySummary = useCallback(async (summaryData) => {
    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      // ✅ Clean and normalize data types according to API requirements
      const payload = {
        projectId: Number(summaryData.projectId),
        subPropertyTypeId: Number(summaryData.subPropertyTypeId),
        metaRows: summaryData.metaRows?.map((row) => ({
          area: Number(row.area),
          areaUnitId: Number(row.areaUnitId),
          noOfItems: Number(row.noOfItems),
          flatHouseStructureId: row.flatHouseStructureId ? Number(row.flatHouseStructureId) : null,
          propertyItemId: row.propertyItemId ? Number(row.propertyItemId) : null,
        })) || [],
      };

      // Validate payload before sending
      if (isNaN(payload.projectId) || payload.projectId <= 0) {
        throw new Error("Invalid projectId");
      }
      if (isNaN(payload.subPropertyTypeId) || payload.subPropertyTypeId <= 0) {
        throw new Error("Invalid subPropertyTypeId");
      }
      if (!payload.metaRows || payload.metaRows.length === 0) {
        throw new Error("At least one property item is required");
      }

      console.log("Final Property Summary Payload Sent:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/real-estate-properties/summary`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      Alert.alert("✅ Success", "Property summary saved successfully!");
      return response.data;
    } catch (error) {
      console.error("Save property summary error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to save property summary.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Log full error details for debugging
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  return savePropertySummary;
};

export default useSavePropertySummary;