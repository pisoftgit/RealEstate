import { useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const API_BASE = "https://project.pisofterp.com/realestate/api/v1/reras";

const useReraActions = () => {
  const [reras, setReras] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all RERAs
  const fetchReras = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.get(`${API_BASE}/getAllReras`, {
        headers: { secret_key: secretKey },
      });

      const list = response.data.data || response.data;
      if (Array.isArray(list)) {
        const mapped = list.map((item) => ({
          id: item.id?.toString(),
          name: item.name,
        }));
        setReras(mapped);
      } else {
        setReras([]);
      }
    } catch (error) {
      console.error("Error fetching RERAs:", error.message);
      setReras([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Add RERA
  const addRera = useCallback(
    async ({ name }) => {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const payload = { name };

      const response = await axios.post(`${API_BASE}/saveRera`, payload, {
        headers: { "Content-Type": "application/json", secret_key: secretKey },
      });

      await fetchReras();
      return response.data;
    },
    [fetchReras]
  );

  // ✅ Update RERA
  const updateRera = useCallback(
    async ({ id, name }) => {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const payload = { name };

      const response = await axios.put(`${API_BASE}/updateRera/${id}`, payload, {
        headers: { "Content-Type": "application/json", secret_key: secretKey },
      });

      await fetchReras();
      return response.data;
    },
    [fetchReras]
  );

  // ✅ Delete RERA
  const deleteRera = useCallback(
    async (id) => {
      const secretKey = await SecureStore.getItemAsync("auth_token");

      const response = await axios.delete(`${API_BASE}/deleteRera/${id}`, {
        headers: { secret_key: secretKey },
      });

      await fetchReras();
      return response.data;
    },
    [fetchReras]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchReras();
  }, [fetchReras]);

  return {
    reras,
    loading,
    fetchReras,
    addRera,
    updateRera,
    deleteRera,
  };
};

export default useReraActions;
