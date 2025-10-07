import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useFacilityActions = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All Facilities
  const fetchFacilities = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/facilities/getAllFacilites`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.facilityName,
        }));
        setFacilities(mapped);
      } else {
        setFacilities([]);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error.message);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Facility
  const addFacility = useCallback(async ({ facilityName }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { facilityName };

    const response = await axios.post(
      `${API_BASE_URL}/facilities/saveFacility`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchFacilities();
    return response.data;
  }, [fetchFacilities]);

  // Update Facility
  const updateFacility = useCallback(async ({ id, facilityName }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { facilityName };

    const response = await axios.put(
      `${API_BASE_URL}/facilities/updateFacility/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchFacilities();
    return response.data;
  }, [fetchFacilities]);

  // Delete Facility
  const deleteFacility = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    const response = await axios.delete(
      `${API_BASE_URL}/facilities/deleteFacility/${id}`,
      { headers: { secret_key: secretKey } }
    );
    await fetchFacilities();
    return response.data;
  }, [fetchFacilities]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return {
    facilities,
    loading,
    fetchFacilities,
    addFacility,
    updateFacility,
    deleteFacility,
  };
};

export default useFacilityActions;
