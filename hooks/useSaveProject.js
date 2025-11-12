import { useCallback } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { API_BASE_URL } from "../services/api";

const useSaveProject = () => {
  const saveProject = useCallback(async (projectData) => {
    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      // Get current date in yyyy-MM-dd format
      const currentDate = new Date().toISOString().split('T')[0];

      // ✅ Clean and normalize data types according to API requirements
      const payload = {
        builderId: Number(projectData.builderId),
        projectName: projectData.projectName,
        isGated: Boolean(projectData.isGated),
        isReraApproved: Boolean(projectData.isReraApproved),
        reraId: projectData.reraId ? Number(projectData.reraId) : null,
        reraNumber: projectData.reraNumber || null,
        possessionStatus: projectData.possessionStatus,
        projectStartDate: projectData.projectStartDate,
        projectCompletionDate: projectData.projectCompletionDate || null,
        addedById: Number(userId),
        totalArea: projectData.totalArea ? Number(projectData.totalArea) : null,
        areaUnitId: projectData.areaUnitId ? Number(projectData.areaUnitId) : null,
        description: projectData.description || null,
        addressType: projectData.addressType || "COMMERCIAL",
        address1: projectData.address1 || null,
        address2: projectData.address2 || null,
        city: projectData.city || null,
        pincode: projectData.pincode || null,
        districtId: projectData.districtId ? Number(projectData.districtId) : null,
        stateId: projectData.stateId ? Number(projectData.stateId) : null,
        countryId: projectData.countryId ? Number(projectData.countryId) : null,
        currentDayDate: currentDate,
        plcIds: projectData.plcIds?.map((id) => Number(id)) || [],
        mediaDTOs: projectData.mediaDTOs || [],
      };

      console.log("Final Project Payload Sent:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/real-estate-projects/saveProject`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      Alert.alert("✅ Success", "Project saved successfully!");
      return response.data;
    } catch (error) {
      console.error("Save project error:", error?.response?.data || error.message);
      Alert.alert("❌ Error", error?.response?.data?.message || "Failed to save project.");
      throw error;
    }
  }, []);

  return saveProject;
};

export default useSaveProject;
