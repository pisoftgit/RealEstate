import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useFurnishingStatusActions = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All Furnishing Statuses
  const fetchFurnishingStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/furnishing-statuses/getAllFurnishingStatuses`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.status,
        }));
        setStatuses(mapped);
      } else {
        setStatuses([]);
      }
    } catch (error) {
      console.error("Error fetching furnishing statuses:", error.message);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Furnishing Status
  const addFurnishingStatus = useCallback(async ({ status }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { status };

    const response = await axios.post(
      `${API_BASE_URL}/furnishing-statuses/saveFurnishingStatus`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchFurnishingStatuses();
    return response.data;
  }, [fetchFurnishingStatuses]);

  // Update Furnishing Status
  const updateFurnishingStatus = useCallback(async ({ id, status }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { status };

    const response = await axios.put(
      `${API_BASE_URL}/furnishing-statuses/updateFurnishingStatus/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchFurnishingStatuses();
    return response.data;
  }, [fetchFurnishingStatuses]);

  // Delete Furnishing Status
  const deleteFurnishingStatus = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    const response = await axios.delete(
      `${API_BASE_URL}/furnishing-statuses/deleteFurnishingStatus/${id}`,
      { headers: { secret_key: secretKey } }
    );
    await fetchFurnishingStatuses();
    return response.data;
  }, [fetchFurnishingStatuses]);

  useEffect(() => {
    fetchFurnishingStatuses();
  }, [fetchFurnishingStatuses]);

  return {
    statuses,
    loading,
    fetchFurnishingStatuses,
    addFurnishingStatus,
    updateFurnishingStatus,
    deleteFurnishingStatus,
  };
};

export default useFurnishingStatusActions;
