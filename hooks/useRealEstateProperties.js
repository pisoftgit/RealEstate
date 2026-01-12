// hooks/useRealEstateProperties.js
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const useRealEstateProperties = (params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paramsForData, setParamsForData] = useState(null);

  const paramsStr = params ? JSON.stringify(params) : null;
  const isStale = paramsStr !== paramsForData;

  useEffect(() => {
    if (!params) {
      setLoading(false);
      setParamsForData(null);
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const fetchProperties = async () => {
      try {
        const secretKey = await SecureStore.getItemAsync('auth_token');
        const queryString = params
          ? '?' + Object.entries(params)
              .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
              .join('&')
          : '';
        const response = await fetch(`${API_BASE_URL}/real-estate-properties${queryString}`, {
          method: 'GET',
          headers: {
            secret_key: secretKey,
          },
        });
        const text = await response.text();
        if (!response.ok) throw new Error(text || 'Failed to fetch properties');
        setData(JSON.parse(text));
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
        setParamsForData(paramsStr);
      }
    };
    fetchProperties();
  }, [paramsStr]);

  return { 
    data: isStale ? null : data, 
    loading: (params && isStale) ? true : loading, 
    error: isStale ? null : error 
  };
};

export const useSocietyBlocks = (projectId) => {
  const [blocks, setBlocks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setBlocks(null);
      return;
    }

    const fetchBlocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const secretKey = await SecureStore.getItemAsync('auth_token');
        const response = await fetch(`${API_BASE_URL}/real-estate-properties/getAllSocietyBlocksByProjectId/${projectId}`, {
          method: 'GET',
          headers: {
            secret_key: secretKey,
          },
        });
        const text = await response.text();
        if (!response.ok) throw new Error(text || 'Failed to fetch blocks');
        
        const result = JSON.parse(text);
        setBlocks(result.data || result);
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, [projectId]);

  return { blocks, loading, error };
};

export default useRealEstateProperties;
