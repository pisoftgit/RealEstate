import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return {
    headers: {
      'Content-Type': 'application/json',
      secret_key: token
    }
  };
};

export default function useShopShowroomCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_BASE_URL}/shop-showroom-categories/getAllCategories`, headers);

      const formatted = res.data.map(item => ({
        id: item.id,
        name: item.categoryName
      }));

      setCategories(formatted);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id) => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_BASE_URL}/shop-showroom-categories/getCategoryById/${id}`, headers);
      return res.data;
    } catch (err) {
      console.error('Get by ID error:', err.message);
      throw err;
    }
  };
  const addCategory = async (name) => {
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE_URL}/shop-showroom-categories/saveCategory`, {
        categoryName: name
      }, headers);
      await fetchCategories();
    } catch (err) {
      console.error('Add error:', err.message);
      throw err;
    }
  };

  const updateCategory = async (id, name) => {
    try {
      const headers = await getAuthHeaders();
      await axios.put(`${API_BASE_URL}/shop-showroom-categories/updateCategory/${id}`, {
        categoryName: name
      }, headers);
      await fetchCategories();
    } catch (err) {
      console.error('Update error:', err.message);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/shop-showroom-categories/deleteCategory/${id}`, headers);
      await fetchCategories();
    } catch (err) {
      console.error('Delete error:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
  };
}
