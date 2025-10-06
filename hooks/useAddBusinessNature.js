// hooks/useBusinessNatureActions.js
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const useBusinessNatureActions = () => {
  const [businessNatures, setBusinessNatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all
  const fetchBusinessNatures = useCallback(async () => {
    try {
      setLoading(true);
      const secretKey = await SecureStore.getItemAsync('auth_token');
      if (!secretKey) throw new Error('Missing authentication token');

      const res = await axios.get(
        `${API_BASE_URL}/business-nature/getAllBusinessNatures`,
        { headers: { secret_key: secretKey } }
      );

      const list = res.data.data || res.data;
      if (Array.isArray(list)) {
        const mappedList = list.map((item) => ({
          id: item.id?.toString(),
          name: item.nature,
          code: item.code,
        }));
        setBusinessNatures(mappedList);
      } else {
        setBusinessNatures([]);
      }
    } catch (error) {
      console.error('Error fetching business natures:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add
  const addBusinessNature = useCallback(async ({ nature, code }) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      if (!secretKey) throw new Error('Missing authentication token');

      const payload = { nature, code: Number(code) };

      const response = await axios.post(
        `${API_BASE_URL}/business-nature/addBusinessNature`,
        payload,
        { headers: { 'Content-Type': 'application/json', secret_key: secretKey } }
      );

      // Refresh list
      await fetchBusinessNatures();
      return response.data;
    } catch (error) {
      console.error('Error adding:', error?.response?.data || error.message);
      throw error;
    }
  }, [fetchBusinessNatures]);

  // Update
  const updateBusinessNature = useCallback(async ({ id, nature, code }) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      if (!secretKey) throw new Error('Missing authentication token');

      const payload = { nature, code: Number(code) };

      const response = await axios.put(
        `${API_BASE_URL}/business-nature/updateBusinessNature/${id}`,
        payload,
        { headers: { 'Content-Type': 'application/json', secret_key: secretKey } }
      );

      // Refresh list
      await fetchBusinessNatures();
      return response.data;
    } catch (error) {
      console.error('Error updating:', error?.response?.data || error.message);
      throw error;
    }
  }, [fetchBusinessNatures]);

  // Delete
  const deleteBusinessNature = useCallback(async (id) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      if (!secretKey) throw new Error('Missing authentication token');

      const response = await axios.delete(
        // assuming DELETE method is allowed; if API expects POST you can change accordingly
        `${API_BASE_URL}/business-nature/deleteBusinessNature/${id}`,
        { headers: { secret_key: secretKey } }
      );

      // Refresh list
      await fetchBusinessNatures();
      return response.data;
    } catch (error) {
      console.error('Error deleting:', error?.response?.data || error.message);
      throw error;
    }
  }, [fetchBusinessNatures]);

  // On mount fetch
  useEffect(() => {
    fetchBusinessNatures();
  }, [fetchBusinessNatures]);

  return {
    businessNatures,
    loading,
    fetchBusinessNatures,
    addBusinessNature,
    updateBusinessNature,
    deleteBusinessNature,
  };
};

export default useBusinessNatureActions;
