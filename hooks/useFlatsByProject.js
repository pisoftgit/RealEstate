import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useFlatsByProject = (projectId) => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch All Flats by Project ID
  const fetchFlats = useCallback(async () => {
    if (!projectId) {
      setFlats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/flats/getAllSeriealisedFlatsByProjectId/projectId/${projectId}`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.flatId?.toString(),
          flatId: item.flatId,
          flatNumber: item.flatNumber,
          area: item.area,
          flatStructure: item.flatStructure,
          availabilityStatusEnum: item.availabilityStatusEnum,
          tower: item.tower,
          floorNumber: item.floorNumber,
          sortFields: item.sortFields || {},
          page: item.page || 0,
          pageSize: item.pageSize || 20,
          amenities: item.amenities || [],
          facilities: item.facilities || [],
          propertyMediaDTOs: item.propertyMediaDTOs || [],
          shouldDeletePreviousMedia: item.shouldDeletePreviousMedia || false,
          activeTab: item.activeTab || "structure",
          paginated: item.paginated !== undefined ? item.paginated : true,
          // Computed display fields
          towerName: item.tower ? `Tower ${item.tower}` : "N/A",
          floor: item.floorNumber ? `${getOrdinal(item.floorNumber)} Floor` : "N/A",
          bhk: item.flatStructure || "N/A",
          areaDisplay: item.area ? `${item.area} sq ft` : "N/A",
          status: mapAvailabilityStatus(item.availabilityStatusEnum),
          isAvailable: item.availabilityStatusEnum === "AVAILABLE",
        }));
        setFlats(mapped);
      } else {
        setFlats([]);
      }
    } catch (error) {
      console.error("Error fetching flats:", error.message);
      setFlats([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFlats();
  }, [fetchFlats]);

  // Save Flat Details
  const saveFlatDetails = useCallback(async (flatDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/flats/saveFlatDetails`,
        flatDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the flats list after successful save
      await fetchFlats();
      
      return {
        success: true,
        data: response.data,
        message: "Flat details saved successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save flat details";
      console.error("Error saving flat details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchFlats]);

  // Save Flat PLC Details
  const saveFlatPlcDetails = useCallback(async (plcDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/plcDetails/saveFlatPlcDetails`,
        plcDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the flats list after successful save
      await fetchFlats();
      
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
  }, [fetchFlats]);

  // Update Flat Details (for editing existing records)
  const updateFlatDetails = useCallback(async (flatId, updateDetailsData) => {
    try {
      setSaving(true);
      setSaveError(null);
      
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.post(
        `${API_BASE_URL}/flats/updateFlatDetails/${flatId}`,
        updateDetailsData,
        { 
          headers: { 
            secret_key: secretKey,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Refresh the flats list after successful update
      await fetchFlats();
      
      return {
        success: true,
        data: response.data,
        message: "Flat details updated successfully"
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update flat details";
      console.error("Error updating flat details:", errorMessage);
      setSaveError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    } finally {
      setSaving(false);
    }
  }, [fetchFlats]);

  // Fetch Flat Details for PLC (detailed view)
  const fetchFlatDetailsForPlc = useCallback(async (flatId) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      
      const response = await axios.get(
        `${API_BASE_URL}/plcDetails/getFlatDetailsForPlc/flatId/${flatId}`,
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
          bhk: data.flatStructureName && data.structureType ? `${data.flatStructureName} ${data.structureType}` : "N/A",
          areaDisplay: data.area && data.areaUnitName ? `${data.area} ${data.areaUnitName}` : "N/A",
          carpetAreaDisplay: data.carpetArea && data.areaUnitName ? `${data.carpetArea} ${data.areaUnitName}` : "N/A",
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
        }
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch flat details";
      console.error("Error fetching flat details:", errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  }, []);

  return {
    flats,
    loading,
    fetchFlats,
    saveFlatDetails,
    updateFlatDetails,
    saveFlatPlcDetails,
    fetchFlatDetailsForPlc,
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

export default useFlatsByProject;
