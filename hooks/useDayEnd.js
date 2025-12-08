import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const useDayEnd = () => {
  const [currentDayData, setCurrentDayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to format date as DD-MM-YYYY for API
  const formatDateForAPI = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  // Fetch current day data
  const fetchCurrentDay = async () => {
    try {
      setLoading(true);
      setError(null);

      const loginUserId = await SecureStore.getItemAsync('userid');
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const currentDayDate = await SecureStore.getItemAsync('currentDayDate');

      if (!currentDayDate) {
        throw new Error('Current day date not found in storage');
      }

      // Convert date format if needed (YYYY-MM-DD to DD-MM-YYYY)
      let formattedDate = currentDayDate;
      if (currentDayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date is in YYYY-MM-DD format, convert to DD-MM-YYYY
        const [year, month, day] = currentDayDate.split('-');
        formattedDate = `${day}-${month}-${year}`;
      }

      const API_URL = `${API_BASE_URL}/current_day/close/${formattedDate}/${loginUserId}`;

      console.log('Fetching current day:', API_URL);

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          secret_key: secretKey,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch current day data');
      }

      setCurrentDayData(result);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Fetch Current Day Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Close day
  const closeDay = async (currentDayId) => {
    try {
      setLoading(true);
      setError(null);

      const secretKey = await SecureStore.getItemAsync('auth_token');

      const API_URL = `${API_BASE_URL}/current_day/close/${currentDayId}`;

      console.log('Closing day:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          secret_key: secretKey,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to close day');
      }

      // Save the next day's date to SecureStore
      if (result.nextDay && result.nextDay.date) {
        await SecureStore.setItemAsync('currentDayDate', result.nextDay.date);
        console.log('Updated currentDayDate to:', result.nextDay.date);
      }

      return result;
    } catch (err) {
      setError(err.message);
      console.error('Close Day Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Open day
  const openDay = async (checkInDate) => {
    try {
      setLoading(true);
      setError(null);

      const secretKey = await SecureStore.getItemAsync('auth_token');

      const formattedDate = formatDateForAPI(checkInDate);
      const API_URL = `${API_BASE_URL}/current_day/open?checkIn=${formattedDate}`;

      console.log('Opening day:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          secret_key: secretKey,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to open day');
      }

      // Update currentDayDate in SecureStore with the opened date
      await SecureStore.setItemAsync('currentDayDate', formattedDate);
      console.log('Updated currentDayDate to:', formattedDate);

      return result;
    } catch (err) {
      setError(err.message);
      console.error('Open Day Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentDayData,
    loading,
    error,
    fetchCurrentDay,
    closeDay,
    openDay,
  };
};

export default useDayEnd;
