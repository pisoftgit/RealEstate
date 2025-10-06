import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useFlatHouseStructureTypeActions = () => {
  const [structureTypes, setStructureTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All Structure Types
  const fetchStructureTypes = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/flat-house-structure-types/getAllFlatHouseStructureTypes`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.structureType,
        }));
        setStructureTypes(mapped);
      } else {
        setStructureTypes([]);
      }
    } catch (error) {
      console.error("Error fetching structure types:", error.message);
      setStructureTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Structure Type
  const addStructureType = useCallback(async ({ structureType }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { structureType };

    const response = await axios.post(
      `${API_BASE_URL}/flat-house-structure-types/saveFlatHouseStructureType`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchStructureTypes();
    return response.data;
  }, [fetchStructureTypes]);

  // Update Structure Type
  const updateStructureType = useCallback(async ({ id, structureType }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { structureType };

    const response = await axios.put(
      `${API_BASE_URL}/flat-house-structure-types/updateFlatHouseStructureType/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchStructureTypes();
    return response.data;
  }, [fetchStructureTypes]);

  // Delete Structure Type
  const deleteStructureType = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    const response = await axios.delete(
      `${API_BASE_URL}/flat-house-structure-types/deleteFlatHouseStructureType/${id}`,
      { headers: { secret_key: secretKey } }
    );
    await fetchStructureTypes();
    return response.data;
  }, [fetchStructureTypes]);

  useEffect(() => {
    fetchStructureTypes();
  }, [fetchStructureTypes]);

  return {
    structureTypes,
    loading,
    fetchStructureTypes,
    addStructureType,
    updateStructureType,
    deleteStructureType,
  };
};

export default useFlatHouseStructureTypeActions;
