import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";

const useHoliday = () => {
  // Helper function to parse and clean error messages
  const parseErrorMessage = (errorText) => {
    if (errorText.includes('Hey...! wait a minute, error says:')) {
      const match = errorText.match(/error says: (.+?)(?:\]|$)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return errorText;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [holidayTypes, setHolidayTypes] = useState([]);
  const [durations, setDurations] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // ============================================
  // Duration API Helper Functions
  // ============================================

  const fetchAllDurationsAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/duration/`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Holiday API Helper Functions
  // ============================================

  const fetchAllHolidaysAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holidays`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchHolidayByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveHolidayAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holidays/`, {
      method: "POST",
      headers: {
        secret_key: secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response;
  };

  const updateHolidayAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: "PUT",
      headers: {
        secret_key: secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response;
  };

  const deleteHolidayAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Holiday Type API Helper Functions
  // ============================================

  const fetchAllHolidayTypesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holiday-type/`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchHolidayTypeByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holiday-type/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveHolidayTypeAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holiday-type/`, {
      method: "POST",
      headers: {
        secret_key: secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response;
  };

  const updateHolidayTypeAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holiday-type/`, {
      method: "POST",
      headers: {
        secret_key: secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    return response;
  };

  const deleteHolidayTypeAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/holiday-type/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Holiday Type Business Logic Functions
  // ============================================

  /**
   * Get all holiday types
   */
  const getAllHolidayTypes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllHolidayTypesAPI();
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse holiday types response:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setHolidayTypes(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching holiday types:", err.message);
      setError(err.message || 'Failed to fetch holiday types');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get holiday type by ID
   */
  const getHolidayTypeById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchHolidayTypeByIdAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = parseErrorMessage(errorText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching holiday type by ID:", err.message);
      setError(err.message || 'Failed to fetch holiday type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save a new holiday type
   */
  const saveHolidayType = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await saveHolidayTypeAPI(payload);
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle both JSON and plain text responses
      let data;
      if (responseText === 'saved' || responseText.toLowerCase().includes('success')) {
        // Backend returned plain text success message
        data = { success: true, message: 'Holiday type saved successfully' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If parsing fails but response is ok, consider it successful
          data = { success: true, message: 'Holiday type saved successfully' };
        }
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error saving holiday type:", err.message);
      setError(err.message || 'Failed to save holiday type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update an existing holiday type
   */
  const updateHolidayType = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate that id exists for update
      if (!payload.id) {
        throw new Error('ID is required for updating holiday type');
      }
      
      const response = await updateHolidayTypeAPI(payload);
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle both JSON and plain text responses
      let data;
      if (responseText === 'saved' || responseText.toLowerCase().includes('success') || responseText.toLowerCase().includes('updated')) {
        // Backend returned plain text success message
        data = { success: true, message: 'Holiday type updated successfully' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If parsing fails but response is ok, consider it successful
          data = { success: true, message: 'Holiday type updated successfully' };
        }
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error updating holiday type:", err.message);
      setError(err.message || 'Failed to update holiday type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete a holiday type
   */
  const deleteHolidayType = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteHolidayTypeAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = parseErrorMessage(errorText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error deleting holiday type:", err.message);
      setError(err.message || 'Failed to delete holiday type');
      setLoading(false);
      throw err;
    }
  };

  // ============================================
  // Duration Business Logic Functions
  // ============================================

  /**
   * Get all durations
   */
  const getAllDurations = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllDurationsAPI();
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse durations response:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setDurations(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching durations:", err.message);
      setError(err.message || 'Failed to fetch durations');
      setLoading(false);
      throw err;
    }
  };

  // ============================================
  // Holiday Business Logic Functions
  // ============================================

  /**
   * Get all holidays
   */
  const getAllHolidays = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllHolidaysAPI();
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse holidays response:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setHolidays(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching holidays:", err.message);
      setError(err.message || 'Failed to fetch holidays');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get holiday by ID
   */
  const getHolidayById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchHolidayByIdAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = parseErrorMessage(errorText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching holiday by ID:", err.message);
      setError(err.message || 'Failed to fetch holiday');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save a new holiday
   */
  const saveHoliday = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await saveHolidayAPI(payload);
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle both JSON and plain text responses
      let data;
      if (responseText === 'saved' || responseText.toLowerCase().includes('success')) {
        data = { success: true, message: 'Holiday saved successfully' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { success: true, message: 'Holiday saved successfully' };
        }
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error saving holiday:", err.message);
      setError(err.message || 'Failed to save holiday');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update an existing holiday
   */
  const updateHoliday = async (id, payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateHolidayAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = parseErrorMessage(responseText) || errorMessage;
          }
        } else {
          errorMessage = parseErrorMessage(responseText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Handle both JSON and plain text responses
      let data;
      if (responseText === 'saved' || responseText.toLowerCase().includes('success') || responseText.toLowerCase().includes('updated')) {
        data = { success: true, message: 'Holiday updated successfully' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { success: true, message: 'Holiday updated successfully' };
        }
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error updating holiday:", err.message);
      setError(err.message || 'Failed to update holiday');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete a holiday
   */
  const deleteHoliday = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteHolidayAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = parseErrorMessage(errorText) || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error deleting holiday:", err.message);
      setError(err.message || 'Failed to delete holiday');
      setLoading(false);
      throw err;
    }
  };

  return {
    // Holiday Type operations
    getAllHolidayTypes,
    getHolidayTypeById,
    saveHolidayType,
    updateHolidayType,
    deleteHolidayType,
    
    // Duration operations
    getAllDurations,
    
    // Holiday operations
    getAllHolidays,
    getHolidayById,
    saveHoliday,
    updateHoliday,
    deleteHoliday,
    
    // State
    holidayTypes,
    durations,
    holidays,
    loading,
    error,
    success,
  };
};

export { useHoliday };
export default useHoliday;
