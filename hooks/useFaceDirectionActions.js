import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const useFaceDirectionActions = () => {
  const [faceDirections, setFaceDirections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch All Face Directions
  const fetchFaceDirections = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(
        `${API_BASE_URL}/face-directions/getAllFaceDirection`,
        { headers: { secret_key: secretKey } }
      );

      // directly use response if structure is just an array
      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.faceDirection,
        }));
        setFaceDirections(mapped);
      } else {
        setFaceDirections([]);
      }
    } catch (error) {
      console.error("Error fetching face directions:", error.message);
      setFaceDirections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Face Direction
  const addFaceDirection = useCallback(async ({ faceDirection }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { faceDirection };

    const response = await axios.post(
      `${API_BASE_URL}/face-directions/saveFaceDirection`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchFaceDirections();
    return response.data;
  }, [fetchFaceDirections]);

  // Update Face Direction
  const updateFaceDirection = useCallback(async ({ id, faceDirection }) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const payload = { faceDirection };

    const response = await axios.put(
      `${API_BASE_URL}/face-directions/updateFaceDirection/${id}`,
      payload,
      { headers: { "Content-Type": "application/json", secret_key: secretKey } }
    );
    await fetchFaceDirections();
    return response.data;
  }, [fetchFaceDirections]);

  // Delete Face Direction
  const deleteFaceDirection = useCallback(async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");

    const response = await axios.delete(
      `${API_BASE_URL}/face-directions/deleteFaceDirection/${id}`,
      { headers: { secret_key: secretKey } }
    );
    await fetchFaceDirections();
    return response.data;
  }, [fetchFaceDirections]);

  useEffect(() => {
    fetchFaceDirections();
  }, [fetchFaceDirections]);

  return {
    faceDirections,
    loading,
    fetchFaceDirections,
    addFaceDirection,
    updateFaceDirection,
    deleteFaceDirection,
  };
};

export default useFaceDirectionActions;
