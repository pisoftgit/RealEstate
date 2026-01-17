import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import * as SecureStore from 'expo-secure-store';

/**
 * useSavePlcDetails - Hook to save PLC details for a property
 * @returns { savePlcDetails, loading, error, response }
 * Usage: const { savePlcDetails, loading, error, response } = useSavePlcDetails();
 * savePlcDetails(propertyId, plcDetailsArray)
 */
export default function useSavePlcDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const savePlcDetails = async (propertyId, plcDetails) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await fetch(`${API_BASE_URL}/plcDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'secret_key': secretKey,
        },
        body: JSON.stringify({ propertyId, plcDetails }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to save PLC details');
      }
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        console.warn('Non-JSON response:', data);
      }
      setResponse(data);
      return data;
    } catch (err) {
      console.error('Save PLC Details Error:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { savePlcDetails, loading, error, response };
}
