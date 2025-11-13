// hooks/useSubPropertyTypes.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";

const useSubPropertyTypes = () => {
  const [subPropertyTypes, setSubPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 GET ALL
  const fetchSubPropertyTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.get(
        `${API_BASE_URL}/sub-property-types/getAllSubPropertyTypes`,
        {
          headers: { secret_key: secretKey },
        }
      );
      setSubPropertyTypes(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching sub property types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 GET PROPERTY TYPE WITH SUB-TYPES BY PROPERTY TYPE ID
  const fetchPropertyTypeWithSubTypes = useCallback(
    async (propertyTypeId) => {
      setLoading(true);
      setError(null);
      try {
        const secretKey = await SecureStore.getItemAsync("auth_token");
        const response = await axios.get(
          `${API_BASE_URL}/sub-property-types/getPropertyTypeWithSubTypesByPropertyTypeId/${propertyTypeId}`,
          {
            headers: { secret_key: secretKey },
          }
        );
        return response.data;
      } catch (err) {
        setError(err.message);
        console.error("Error fetching property type with sub-types:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 🔹 CREATE (SAVE)
  const addSubPropertyType = useCallback(async (payload) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.post(
        `${API_BASE_URL}/sub-property-types/saveSubPropertyType`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: secretKey,
          },
        }
      );
      await fetchSubPropertyTypes(); // refresh list
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error("Error saving sub property type:", err);
      throw err;
    }
  }, [fetchSubPropertyTypes]);

  // 🔹 UPDATE
  const updateSubPropertyType = useCallback(async (id, payload) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await axios.put(
        `${API_BASE_URL}/sub-property-types/updateSubPropertyType/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: secretKey,
          },
        }
      );
      await fetchSubPropertyTypes(); // refresh list
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error("Error updating sub property type:", err);
      throw err;
    }
  }, [fetchSubPropertyTypes]);

  // 🔹 DELETE
  const deleteSubPropertyType = useCallback(async (id) => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      await axios.delete(
        `${API_BASE_URL}/sub-property-types/deleteSubPropertyType/${id}`,
        {
          headers: { secret_key: secretKey },
        }
      );
      await fetchSubPropertyTypes(); // refresh list
    } catch (err) {
      setError(err.message);
      console.error("Error deleting sub property type:", err);
      throw err;
    }
  }, [fetchSubPropertyTypes]);

  useEffect(() => {
    fetchSubPropertyTypes();
  }, [fetchSubPropertyTypes]);

  return {
    subPropertyTypes,
    loading,
    error,
    fetchSubPropertyTypes,
    fetchPropertyTypeWithSubTypes,
    addSubPropertyType,
    updateSubPropertyType,
    deleteSubPropertyType,
  };
};

export default useSubPropertyTypes;
