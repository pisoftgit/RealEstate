// hooks/useAddBusinessNature.js
import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../services/api';

const useAddBusinessNature = () => {
  const addBusinessNature = useCallback(async ({ nature, code }) => {
    try {
      // Optional: fetch auth token if needed
      const secretKey = await SecureStore.getItemAsync('auth_token');

      if (!secretKey) {
        throw new Error('Missing authentication token');
      }

      const payload = {
        nature,
        code: Number(code),
      };

      console.log('Sending Business Nature payload:', payload); // Debug log

      const response = await axios.post(
        `${API_BASE_URL}/business-nature/addBusinessNature`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: secretKey, // If your API requires it
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log('Error adding Business Nature:', error);
      throw error; // Re-throw to let the component handle it
    }
  }, []);

  return addBusinessNature;
};

export default useAddBusinessNature;
