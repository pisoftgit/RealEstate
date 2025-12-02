import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const usePropertyItemActions = () => {
  const [propertyItems, setPropertyItems] = useState([]);
  const [towerPropertyItems, setTowerPropertyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All Property Items
  const fetchPropertyItems = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/property-items/getAllPropertyItems`,
        { headers: { secret_key: secretKey } }
      );

      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.name,
          code: item.code,
          realEstatePropertyType: item.realEstatePropertyType,
          isCommercialUnit: item.isCommercialUnit,
          isPlot: item.isPlot,
          isFlat: item.isFlat,
          isResidential: item.isResidential,
          isCommercial: item.isCommercial,
          isHouseVilla: item.isHouseVilla,
        }));
        setPropertyItems(mapped);
      } else {
        setPropertyItems([]);
      }
    } catch (error) {
      console.error("Error fetching property items:", error.message);
      setPropertyItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch All Tower Property Items
  const fetchTowerPropertyItems = useCallback(async () => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/tower-property-items/getAllTowerPropertyItems`,
        { headers: { secret_key: secretKey } }
      );

      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.name,
          code: item.code,
          isFlat: item.isFlat,
          isHouseVilla: item.isHouseVilla,
          isMultiFloor: item.isMultiFloor,
          isSingleFloor: item.isSingleFloor,
        }));
        setTowerPropertyItems(mapped);
      } else {
        setTowerPropertyItems([]);
      }
    } catch (error) {
      console.error("Error fetching tower property items:", error.message);
      setTowerPropertyItems([]);
    }
  }, []);

  // Add Property Item
  const addPropertyItem = useCallback(async ({ realEstatePropertyType, name, code }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    // example payload as per your sample:
    const payload = {
      realEstatePropertyType: {
        id: realEstatePropertyType.id,
      },
      name,
      code,
    };

    const response = await axios.post(
      `${API_BASE_URL}/property-items/savePropertyItem`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );

    await fetchPropertyItems();
    return response.data;
  }, [fetchPropertyItems]);

  // Update Property Item
  const updatePropertyItem = useCallback(async ({ id, realEstatePropertyType, name, code }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = {
      realEstatePropertyType: {
        id: realEstatePropertyType.id,
      },
      name,
      code,
    };

    const response = await axios.put(
      `${API_BASE_URL}/property-items/updatePropertyItem/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );

    await fetchPropertyItems();
    return response.data;
  }, [fetchPropertyItems]);

  // Delete Property Item
  const deletePropertyItem = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    const response = await axios.delete(
      `${API_BASE_URL}/property-items/deletePropertyItem/${id}`,
      { headers: { secret_key: secretKey } }
    );

    await fetchPropertyItems();
    return response.data;
  }, [fetchPropertyItems]);

  useEffect(() => {
    fetchPropertyItems();
    fetchTowerPropertyItems();
  }, [fetchPropertyItems, fetchTowerPropertyItems]);

  return {
    propertyItems,
    towerPropertyItems,
    loading,
    fetchPropertyItems,
    fetchTowerPropertyItems,
    addPropertyItem,
    updatePropertyItem,
    deletePropertyItem,
  };
};

export default usePropertyItemActions;
