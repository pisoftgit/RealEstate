import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

/**
 * useFillDetails hook
 * Calls /api/v1/real-estate-properties/fill-details with the provided payload
 * @returns { fillDetails, loading, error, data }
 */
export default function useFillDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fillDetails = async (payload) => {
    console.log('useFillDetails payload:', payload);
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.post(
        'https://project.pisofterp.com/realestate/api/v1/real-estate-properties/fill-details',
        payload,
        { headers: { secret_key: secretKey } }
      );
      console.log('useFillDetails API response:', response.data);
      setData(response.data);
      return response.data;
    } catch (err) {
      console.log('useFillDetails API error:', err?.response?.data || err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fillDetails, loading, error, data };
}
