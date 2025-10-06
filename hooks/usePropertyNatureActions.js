// hooks/usePropertyNatureActions.js
import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const usePropertyNatureActions = () => {
  const [propertyNatures, setPropertyNatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch All Property Natures
  const fetchPropertyNatures = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/property-natures/getAllPropertyNatures`,
        { headers: { secret_key: secretKey } }
      );

      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.propertyNature,
        }));
        setPropertyNatures(mapped);
      } else {
        setPropertyNatures([]);
      }
    } catch (error) {
      console.error("Error fetching property natures:", error.message);
      setPropertyNatures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Add Property Nature
  const addPropertyNature = useCallback(async ({ propertyNature }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { propertyNature };

    const response = await axios.post(
      `${API_BASE_URL}/property-natures/savePropertyNature`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchPropertyNatures(); // refresh list
    return response.data;
  }, [fetchPropertyNatures]);

  // ✅ Update Property Nature
  const updatePropertyNature = useCallback(async ({ id, propertyNature }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { propertyNature };

    const response = await axios.put(
      `${API_BASE_URL}/property-natures/updatePropertyNature/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchPropertyNatures(); // refresh list
    return response.data;
  }, [fetchPropertyNatures]);

  // ✅ Delete Property Nature
  const deletePropertyNature = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    const response = await axios.delete(
      `${API_BASE_URL}/property-natures/deletePropertyNature/${id}`,
      { headers: { secret_key: secretKey } }
    );
    await fetchPropertyNatures(); // refresh list
    return response.data;
  }, [fetchPropertyNatures]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchPropertyNatures();
  }, [fetchPropertyNatures]);

  return {
    propertyNatures,
    loading,
    fetchPropertyNatures,
    addPropertyNature,
    updatePropertyNature,
    deletePropertyNature,
  };
};

export default usePropertyNatureActions;
