import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useCommercialUnitsByProject = (projectId) => {
  const [commercialUnits, setCommercialUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch All Commercial Units by Project ID
  const fetchCommercialUnits = useCallback(async () => {
    if (!projectId) {
      setCommercialUnits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/commercial-units/getAllSerialisedCommercialUnitsByProjectId/projectId/${projectId}`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          commercialUnitId: item.id,
          unitNumber: item.nameOrNumber,
          area: item.area,
          areaUnit: item.areaUnit,
          carpetArea: item.carpetArea,
          loadingPercentage: item.loadingPercentage1,
          basicCost: item.basicAmount,
          description: item.description,
          availabilityStatusEnum: item.availabilityStatusEnum,
          addedBy: item.addedBy,
          addedDate: item.addedDate1,
          propertyMediaDTOs: item.propertyMediaDTOs || [],
          amenities: item.amenities || [],
          facilities: item.facilities || [],
          // API response field names (for form pre-fill)
          ownership: item.ownershipTypeName,
          furnishing: item.furnishingStatusName,
          facing: item.faceDirectionName,
          ownerShipTypeId: item.ownerShipTypeId,
          faceDirectionId: item.faceDirectionId,
          furnishingStatusId: item.furnishingStatusId,
          // Computed display fields
          unitName: item.nameOrNumber ? `Unit ${item.nameOrNumber}` : "N/A",
          areaDisplay: item.area && item.areaUnit ? `${item.area} ${item.areaUnit}` : "N/A",
          carpetAreaDisplay: item.carpetArea && item.areaUnit ? `${item.carpetArea} ${item.areaUnit}` : "N/A",
          superAreaDisplay: item.carpetArea && item.loadingPercentage1 
            ? `${(item.carpetArea * (1 + item.loadingPercentage1 / 100)).toFixed(2)} ${item.areaUnit}` 
            : "N/A",
          basicCostDisplay: item.basicAmount ? `₹${item.basicAmount.toLocaleString()}` : "N/A",
          loadingDisplay: item.loadingPercentage1 ? `${item.loadingPercentage1}%` : "N/A",
          status: mapAvailabilityStatus(item.availabilityStatusEnum),
          isAvailable: item.availabilityStatusEnum === "AVAILABLE",
          addedDateDisplay: item.addedDate1 ? formatDate(item.addedDate1) : "N/A",
        }));
        setCommercialUnits(mapped);
      } else {
        setCommercialUnits([]);
      }
    } catch (error) {
      console.error("Error fetching commercial units:", error.message);
      setCommercialUnits([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCommercialUnits();
  }, [fetchCommercialUnits]);

  // Save Commercial Unit Details
  const saveCommercialUnitDetails = useCallback(async (unitDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/commercial-units/saveCommercialUnitDetails`,
        unitDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the commercial units list after successful save
      await fetchCommercialUnits();
      
      return {
        success: true,
        data: response.data,
        message: "Commercial unit details saved successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save commercial unit details";
      console.error("Error saving commercial unit details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchCommercialUnits]);

  // Save Commercial Unit PLC Details
  const saveCommercialUnitPlcDetails = useCallback(async (plcDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/plcDetails/saveCommercialUnitPlcDetails`,
        plcDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the commercial units list after successful save
      await fetchCommercialUnits();
      
      return {
        success: true,
        data: response.data,
        message: "PLC details saved successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save PLC details";
      console.error("Error saving PLC details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchCommercialUnits]);

  // Update Commercial Unit Details (for editing existing records)
  const updateCommercialUnitDetails = useCallback(async (unitId, updateDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/commercial-units/updateCommercialUnitDetails/${unitId}`,
        updateDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the commercial units list after successful update
      await fetchCommercialUnits();
      
      return {
        success: true,
        data: response.data,
        message: "Commercial unit details updated successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update commercial unit details";
      console.error("Error updating commercial unit details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchCommercialUnits]);

  // Fetch Commercial Unit Details for PLC (detailed view)
  const fetchCommercialUnitDetailsForPlc = useCallback(async (unitId) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.get(
        `${API_BASE_URL}/plcDetails/getCommercialUnitDetailsForPlc/commercialUnit/${unitId}`,
        { 
          headers: { 
            secret_key: secretKey
          } 
        }
      );
      
      const data = response.data;
      console.log('Raw PLC API response:', data);
      
      // Transform the data to match the same structure as fetchCommercialUnits
      return {
        success: true,
        data: {
          ...data,
          // Basic fields
          id: data.id?.toString() || data.commercialUnitId?.toString(),
          commercialUnitId: data.id || data.commercialUnitId,
          unitNumber: data.nameOrNumber,
          area: data.area,
          areaUnit: data.areaUnitName || data.areaUnit,
          carpetArea: data.carpetArea,
          loadingPercentage: data.loadingPercentage || data.loadingPercentage1,
          basicCost: data.basicAmount,
          description: data.description,
          availabilityStatusEnum: data.availabilityStatusEnum,
          addedBy: data.addedBy,
          addedDate: data.addedDate1,
          propertyMediaDTOs: data.propertyMediaDTOs || [],
          amenities: data.amenities || [],
          facilities: data.facilities || [],
          // Display name fields
          ownership: data.ownershipTypeName || data.ownershipType,
          furnishing: data.furnishingStatusName || data.furnishingStatus,
          facing: data.faceDirectionName || data.faceDirection,
          // ID fields
          ownerShipTypeId: data.ownerShipTypeId,
          faceDirectionId: data.faceDirectionId,
          furnishingStatusId: data.furnishingStatusId,
          // Computed display fields
          unitName: data.nameOrNumber ? `Unit ${data.nameOrNumber}` : "N/A",
          areaDisplay: data.area && data.areaUnitName ? `${data.area} ${data.areaUnitName}` : "N/A",
          carpetAreaDisplay: data.carpetArea && data.areaUnitName 
            ? `${data.carpetArea} ${data.areaUnitName}` 
            : (data.carpetArea && data.areaUnit ? `${data.carpetArea} ${data.areaUnit}` : "N/A"),
          superAreaDisplay: data.carpetArea && data.loadingPercentage 
            ? `${(data.carpetArea * (1 + data.loadingPercentage / 100)).toFixed(2)} ${data.areaUnitName || data.areaUnit}` 
            : "N/A",
          basicCostDisplay: data.basicAmount ? `₹${data.basicAmount.toLocaleString()}` : "N/A",
          totalCostDisplay: data.totalAmount ? `₹${data.totalAmount.toLocaleString()}` : "N/A",
          loadingDisplay: data.loadingPercentage 
            ? `${data.loadingPercentage}%` 
            : (data.loadingPercentage1 ? `${data.loadingPercentage1}%` : "N/A"),
          status: mapAvailabilityStatus(data.availabilityStatusEnum),
          isAvailable: data.availabilityStatusEnum === "AVAILABLE",
          addedDateDisplay: data.addedDate1 ? formatDate(data.addedDate1) : "N/A",
        }
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch commercial unit details";
      console.error("Error fetching commercial unit details:", errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  }, []);

  // Delete Commercial Unit
  const deleteCommercialUnit = useCallback(async (unitId) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.delete(
        `${API_BASE_URL}/commercial-units/deleteCommercialUnit/${unitId}`,
        { 
          headers: { 
            secret_key: secretKey
          } 
        }
      );
      
      // Refresh the commercial units list after successful deletion
      await fetchCommercialUnits();
      
      return {
        success: true,
        data: response.data,
        message: "Commercial unit deleted successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete commercial unit";
      console.error("Error deleting commercial unit:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchCommercialUnits]);

  return {
    commercialUnits,
    loading,
    fetchCommercialUnits,
    saveCommercialUnitDetails,
    updateCommercialUnitDetails,
    saveCommercialUnitPlcDetails,
    fetchCommercialUnitDetailsForPlc,
    deleteCommercialUnit,
    saving,
    saveError,
  };
};

// Helper function to format date (YYYY-MM-DD to DD-MM-YYYY)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString;
  }
};

// Helper function to map availability status enum to readable text
const mapAvailabilityStatus = (status) => {
  const statusMap = {
    AVAILABLE: "Available",
    SOLD: "Sold",
    RESERVED: "Reserved",
    BLOCKED: "Blocked",
    UNAVAILABLE: "Not Available",
  };
  return statusMap[status] || status || "Unknown";
};

export default useCommercialUnitsByProject;
