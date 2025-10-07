import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return {
    headers: {
      'Content-Type': 'application/json',
      secret_key: token,
    },
  };
};

export default function useMeasurementUnits() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_BASE_URL}/measurement-units/getAllMeasurementUnits`, headers);
      const formatted = res.data.map(item => ({
        id: item.id,
        name: item.unitName,
      }));
      setUnits(formatted);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError('Failed to fetch measurement units');
    } finally {
      setLoading(false);
    }
  };

  const getUnitById = async (id) => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_BASE_URL}/measurement-units/getMeasurementUnitById/${id}`, headers);
      return res.data;
    } catch (err) {
      console.error('Get by ID error:', err.message);
      throw err;
    }
  };

  const addUnit = async (name) => {
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE_URL}/measurement-units/saveMeasurementUnit`, { unitName: name }, headers);
      await fetchUnits();
    } catch (err) {
      console.error('Add error:', err.message);
      throw err;
    }
  };

  const updateUnit = async (id, name) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(`${API_BASE_URL}/measurement-units/updateMeasurementUnit/${id}`, { unitName: name }, headers);
      await fetchUnits();
    } catch (err) {
      console.error('Update error:', err.message);
      throw err;
    }
  };

  const deleteUnit = async (id) => {
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/measurement-units/deleteMeasurementUnit/${id}`, headers);
      await fetchUnits();
    } catch (err) {
      console.error('Delete error:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return {
    units,
    loading,
    error,
    fetchUnits,
    getUnitById,
    addUnit,
    updateUnit,
    deleteUnit,
  };
}
