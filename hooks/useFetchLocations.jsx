import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";

const useFetchLocations = (userId, day) => {
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const secretKey = await SecureStore.getItemAsync("auth_token");
      const storedUserId = await SecureStore.getItemAsync("userid");
      if (!secretKey || !storedUserId) {
        throw new Error("Missing authentication token or user ID.");
      }

      const finalUserId = userId || storedUserId;
      const url = `${API_BASE_URL}/user/${finalUserId}/locations?day=${day}`;
      console.log("🌍 Fetching locations:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          secret_key: secretKey,
        },
      });

      const raw = await response.text();
      console.log("📦 Raw locations response:", raw);

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = JSON.parse(raw);
      setLocations(data);
    } catch (err) {
      setError(err.message);
      console.error("❌ Failed to load locations:", err.message);
      setLocations(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && day) {
      fetchLocations();
    }
  }, [userId, day]);

  return { locations, loading, error, refetch: fetchLocations };
};

export default useFetchLocations;
