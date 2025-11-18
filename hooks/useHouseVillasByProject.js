import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useHouseVillasByProject = (projectId) => {
  const [houseVillas, setHouseVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch All House/Villas by Project ID
  const fetchHouseVillas = useCallback(async () => {
    if (!projectId) {
      setHouseVillas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/house-villas/getAllSerialisedHouseVillasByProjectId/projectId/${projectId}`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.houseVillaId?.toString(),
          houseVillaId: item.houseVillaId,
          villaNumber: item.blockHouseNumber || item.villaNumber,
          blockHouseNumber: item.blockHouseNumber,
          area: item.area,
          areaUnit: item.areaUnit,
          structure: item.structure,
          structureType: item.structureType,
          faceDirection: item.faceDirection,
          houseVillaStructure: item.structure && item.structureType 
            ? `${item.structure} ${item.structureType}` 
            : (item.houseVillaStructure || "N/A"),
          availabilityStatusEnum: item.availabilityStatusEnum,
          blockHouseName: item.blockHouseName || item.blockHouseNumber,
          floorNumber: item.floorNumber,
          totalNoOfFloors: item.totalNoOfFloors,
          totalNoOfKitchen: item.totalNoOfKitchen,
          carpetArea: item.carpetArea,
          loadingPercentage: item.loadingPercentage,
          sortFields: item.sortFields || {},
          page: item.page || 0,
          pageSize: item.pageSize || 20,
          amenities: item.amenities || [],
          facilities: item.facilities || [],
          villaIds: item.villaIds || [],
          propertyMediaDTOs: item.propertyMediaDTOs || [],
          shouldDeletePreviousMedia: item.shouldDeletePreviousMedia || false,
          activeTab: item.activeTab || "structure",
          paginated: item.paginated !== undefined ? item.paginated : true,
          // Computed display fields
          towerName: item.blockHouseName || item.blockHouseNumber 
            ? `Block ${item.blockHouseName || item.blockHouseNumber}` 
            : "N/A",
          unitNumber: item.blockHouseNumber || item.villaNumber || "N/A",
          floor: item.floorNumber ? `${getOrdinal(item.floorNumber)} Floor` : "N/A",
          totalFloors: item.totalNoOfFloors ? `${item.totalNoOfFloors} Floors` : "N/A",
          bhk: item.structure && item.structureType 
            ? `${item.structure} ${item.structureType}` 
            : (item.houseVillaStructure || "N/A"),
          areaDisplay: item.area && item.areaUnit 
            ? `${item.area} ${item.areaUnit}` 
            : (item.area ? `${item.area} sq ft` : "N/A"),
          carpetAreaDisplay: item.carpetArea && item.areaUnit
            ? `${item.carpetArea} ${item.areaUnit}` 
            : (item.carpetArea ? `${item.carpetArea} sq ft` : "N/A"),
          facing: item.faceDirection || "N/A",
          status: mapAvailabilityStatus(item.availabilityStatusEnum),
          isAvailable: item.availabilityStatusEnum === "AVAILABLE",
        }));
        setHouseVillas(mapped);
      } else {
        setHouseVillas([]);
      }
    } catch (error) {
      console.error("Error fetching house/villas:", error.message);
      setHouseVillas([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchHouseVillas();
  }, [fetchHouseVillas]);

  // Save House/Villa Details
  const saveHouseVillaDetails = useCallback(async (houseVillaDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/house-villas/saveHouseVillaDetails`,
        houseVillaDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the house/villas list after successful save
      await fetchHouseVillas();
      
      return {
        success: true,
        data: response.data,
        message: "House/Villa details saved successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save house/villa details";
      console.error("Error saving house/villa details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchHouseVillas]);

  // Save House/Villa PLC Details
  // Expected payload structure:
  // {
  //   id: houseVillaId,
  //   plcDetails: [
  //     { plcId: 4, rate: 8000, isPercentage: false },
  //     { plcId: 6, rate: 20, isPercentage: true }
  //   ]
  // }
  const saveHouseVillaPlcDetails = useCallback(async (houseVillaId, plcDetailsArray) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      // Construct the payload according to API requirements
      const payload = {
        id: houseVillaId,
        plcDetails: plcDetailsArray
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/plcDetails/saveHouseVillaPlcDetails`,
        payload,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the house/villas list after successful save
      await fetchHouseVillas();
      
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
  }, [fetchHouseVillas]);

  // Fetch House/Villa Details for PLC (detailed view)
  const fetchHouseVillaDetailsForPlc = useCallback(async (houseVillaId) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.get(
        `${API_BASE_URL}/plcDetails/getHouseVillaDetailsForPlc/houseVillaId/${houseVillaId}`,
        { 
          headers: { 
            secret_key: secretKey
          } 
        }
      );
      
      const data = response.data;
      
      // Transform the data to include display fields
      return {
        success: true,
        data: {
          ...data,
          // Computed display fields
          towerName: data.blockHouseName ? `Block ${data.blockHouseName}` : "N/A",
          floor: data.floorNumber ? `${getOrdinal(data.floorNumber)} Floor` : "N/A",
          bhk: data.houseVillaStructureName && data.structureType ? `${data.houseVillaStructureName} ${data.structureType}` : "N/A",
          areaDisplay: data.area && data.areaUnitName ? `${data.area} ${data.areaUnitName}` : "N/A",
          carpetAreaDisplay: data.carpetArea && data.carpetAreaUnitName ? `${data.carpetArea} ${data.carpetAreaUnitName}` : "N/A",
          superAreaDisplay: data.area && data.loadingPercentage 
            ? `${(data.area * (1 + data.loadingPercentage / 100)).toFixed(2)} ${data.areaUnitName}` 
            : "N/A",
          basicCostDisplay: data.basicAmount ? `₹${data.basicAmount.toLocaleString()}` : "N/A",
          totalCostDisplay: data.totalAmount ? `₹${data.totalAmount.toLocaleString()}` : "N/A",
          loadingDisplay: data.loadingPercentage ? `${data.loadingPercentage}%` : "N/A",
          status: mapAvailabilityStatus(data.availabilityStatusEnum),
          isAvailable: data.availabilityStatusEnum === "AVAILABLE",
          furnishing: data.furnishingStatus || "N/A",
          parking: data.parking || "N/A",
          facing: data.faceDirection || "N/A",
          balconies: data.balconies || 0,
          bathrooms: data.bathrooms || 0,
          kitchens: data.totalNoOfKitchen || 0,
          totalFloors: data.totalNoOfFloors || 0,
        }
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch house/villa details";
      console.error("Error fetching house/villa details:", errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  }, []);

  // Delete House/Villa
  const deleteHouseVilla = useCallback(async (houseVillaId) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.delete(
        `${API_BASE_URL}/house-villas/deleteHouseVilla/${houseVillaId}`,
        { 
          headers: { 
            secret_key: secretKey
          } 
        }
      );
      
      // Refresh the house/villas list after successful delete
      await fetchHouseVillas();
      
      return {
        success: true,
        data: response.data,
        message: "House/Villa deleted successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete house/villa";
      console.error("Error deleting house/villa:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchHouseVillas]);

  // Update House/Villa Details (for editing existing records)
  const updateHouseVillaDetails = useCallback(async (villaId, updateDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/house-villas/updateHouseVillaDetails/${villaId}`,
        updateDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the house/villas list after successful update
      await fetchHouseVillas();
      
      return {
        success: true,
        data: response.data,
        message: "House/Villa details updated successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update house/villa details";
      console.error("Error updating house/villa details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchHouseVillas]);

  return {
    houseVillas,
    loading,
    fetchHouseVillas,
    saveHouseVillaDetails,
    updateHouseVillaDetails,
    saveHouseVillaPlcDetails,
    fetchHouseVillaDetailsForPlc,
    deleteHouseVilla,
    saving,
    saveError,
  };
};

// Helper function to convert number to ordinal (1st, 2nd, 3rd, etc.)
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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

export default useHouseVillasByProject;
