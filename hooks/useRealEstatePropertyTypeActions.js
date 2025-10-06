// hooks/useRealEstatePropertyTypeActions.js
import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useRealEstatePropertyTypeActions = () => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ GET all property types
  const fetchPropertyTypes = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const res = await axios.get(
        `${API_BASE_URL}/real-estate-property-types/getAllRealEstatePropertyTypes`,
        {
          headers: { secret_key: secretKey },
        }
      );

      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        setPropertyTypes(list);
      } else {
        setPropertyTypes([]);
      }
    } catch (error) {
      console.error("Error fetching property types:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ SAVE property type
  const savePropertyType = useCallback(async (payload) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const res = await axios.post(
        `${API_BASE_URL}/real-estate-property-types/saveRealEstatePropertyType`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: secretKey,
          },
        }
      );

      await fetchPropertyTypes(); // refresh after save
      return res.data;
    } catch (error) {
      console.error("Error saving property type:", error.message);
      throw error;
    }
  }, [fetchPropertyTypes]);

  // ✅ DELETE property type
  const deletePropertyType = useCallback(async (id) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");

      await axios.delete(
        `${API_BASE_URL}/real-estate-property-types/deleteRealEstatePropertyType/${id}`,
        {
          headers: { secret_key: secretKey },
        }
      );

      setPropertyTypes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting property type:", error.message);
      throw error;
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    fetchPropertyTypes();
  }, [fetchPropertyTypes]);

  return {
    propertyTypes,
    loading,
    fetchPropertyTypes,
    savePropertyType,
    deletePropertyType,
  };
};

export default useRealEstatePropertyTypeActions;
