import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useAmenityActions = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All Amenities
  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/amenities/getAllAmenities`,
        { headers: { secret_key: secretKey } }
      );
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.amenityName,
        }));
        setAmenities(mapped);
      } else {
        setAmenities([]);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error.message);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Amenity
  const addAmenity = useCallback(async ({ amenityName }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { amenityName };

    const response = await axios.post(
      `${API_BASE_URL}/amenities/saveAminity`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchAmenities();
    return response.data;
  }, [fetchAmenities]);

  // Update Amenity
  const updateAmenity = useCallback(async ({ id, amenityName }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { amenityName };

    const response = await axios.put(
      `${API_BASE_URL}/amenities/updateAminity/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchAmenities();
    return response.data;
  }, [fetchAmenities]);

  // Delete Amenity
  const deleteAmenity = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await axios.delete(
      `${API_BASE_URL}/amenities/delelteAminity/${id}`,
      { headers: { secret_key: secretKey } }
    );
    await fetchAmenities();
    return response.data;
  }, [fetchAmenities]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  return {
    amenities,
    loading,
    fetchAmenities,
    addAmenity,
    updateAmenity,
    deleteAmenity,
  };
};

export default useAmenityActions;
 