import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

import moment from 'moment-timezone';


const API_URL = `${API_BASE_URL}/saveLocations`;

const useSaveLocation = () => {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveLocation = async (latitude, longitude) => {
  try {
    setLoading(true);
    setError(null);

    const loginUserId = await SecureStore.getItemAsync('userid');
    const secretKey = await SecureStore.getItemAsync('auth_token');

    if (!loginUserId || !secretKey) {
      throw new Error('Missing required authentication details.');
    }

    let currentDayDate = await SecureStore.getItemAsync('currentDayDate');
   // Keep IST time, remove milliseconds, replace offset with 'Z'
const timestamp = moment.tz('Asia/Kolkata')
  .format('YYYY-MM-DDTHH:mm:ss') + 'Z';

console.log("Backend-friendly IST timestamp:", timestamp);
// Example output: "2025-09-26T11:29:25Z"

// Output: 2025-09-26T11:11:31+05:30

    const payload = {
      userId: Number(loginUserId),
      day: currentDayDate,
      latitude,
      longitude,
      timestamp,
    };

    console.log("POST Payload:", payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'secret_key': secretKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save location.');
    }

    setResponseData(result);
    return result;
  } catch (err) {
    setError(err.message);
    console.error('Error saving location:', err);
  } finally {
    setLoading(false);
  }
};


  return { saveLocation, responseData, loading, error };
};

export default useSaveLocation;
