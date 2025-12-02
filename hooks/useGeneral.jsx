import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {API_BASE_URL} from '../services/api'


const useGeneral = () => {
  // Helper function to parse and clean error messages
  const parseErrorMessage = (errorText) => {
    // Check for "Hey...! wait a minute, error says:" pattern
    if (errorText.includes('Hey...! wait a minute, error says:')) {
      const match = errorText.match(/error says: (.+?)(?:\]|$)/);
      if (match && match[1]) {
        const cleanError = match[1].trim();
        // Make it more user-friendly
        if (cleanError.includes('NoSuchMethodError')) {
          return 'Server configuration error. Please contact administrator.';
        }
        if (cleanError.includes('Handler dispatch failed')) {
          return 'Server error. Please try again or contact administrator.';
        }
        return cleanError;
      }
    }
    return errorText;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [usersCategories, setUsersCategories] = useState([]);
  const [currentUserCategory, setCurrentUserCategory] = useState(null);
  const [religions, setReligions] = useState([]);
  const [currentReligion, setCurrentReligion] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [currentBloodGroup, setCurrentBloodGroup] = useState(null);
  const [prefixes, setPrefixes] = useState([]);
  const [currentPrefix, setCurrentPrefix] = useState(null);
  const [countries, setCountries] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [states, setStates] = useState([]);
  const [currentState, setCurrentState] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [currentDistrict, setCurrentDistrict] = useState(null);

  // API Helper Functions - Direct fetch calls
  const fetchOrganization = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/organization/getOrganization`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveOrg = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/organization/save`, {
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

  const fetchAllFinancialYears = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/FinancialYear/getAllFinancialYears`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchFinancialYearById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/FinancialYear/getFinancialYear/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveFinancialYearAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/FinancialYear/save`, {
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

  const updateFinancialYearAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/FinancialYear/update/${id}`, {
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

  const deleteFinancialYearAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/FinancialYear/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Users Category API Helper Functions
  const fetchAllUsersCategories = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/users-category/getAllUsersCategories`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchUserCategoryById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/users-category/getUserCategory/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveUserCategoryAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/users-category/save`, {
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

  const updateUserCategoryAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/users-category/update/${id}`, {
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

  const deleteUserCategoryAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/users-category/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Religion API Helper Functions
  const fetchAllReligions = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/religion/religions`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchReligionById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/religion/getReligion/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveReligionAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/religion/addNewReligion`, {
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

  const updateReligionAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/religion/updateReligion/${id}`, {
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

  const deleteReligionAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/religion/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Category API Helper Functions
  const fetchAllCategories = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/category/getAllCategories`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchCategoryById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/category/getCategory/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveCategoryAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/category/add`, {
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

  const updateCategoryAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/category/update/${id}`, {
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

  const deleteCategoryAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/category/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Blood Group API Helper Functions
  const fetchAllBloodGroups = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/blood-groups/getAllBloodGroups`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchBloodGroupById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/blood-groups/getBloodGroup/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveBloodGroupAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/blood-groups/save`, {
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

  const updateBloodGroupAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/blood-groups/update/${id}`, {
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

  const deleteBloodGroupAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/blood-groups/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Prefix API Helper Functions
  const fetchAllPrefixes = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/prefix/getAllPrefix`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchPrefixById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/prefix/getPrefix/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const savePrefixAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/prefix/save`, {
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

  const updatePrefixAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/prefix/update/${id}`, {
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

  const deletePrefixAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/prefix/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Country API Helper Functions
  const fetchAllCountries = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/country/getAllCountries`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchCountryById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/country/country/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveCountryAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/country/save`, {
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

  const updateCountryAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/country/update/${id}`, {
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

  const deleteCountryAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/country/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // State API Helper Functions
  const fetchAllStates = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/state/getAllStates`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchStateById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/state/getState/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchStatesByCountryId = async (countryId) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/state/country/${countryId}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveStateAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/state/save`, {
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

  const updateStateAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/state/update/${id}`, {
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

  const deleteStateAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/state/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // District API Helper Functions
  const fetchAllDistricts = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/district/getAllDistricts`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchDistrictById = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/district/getDistrict/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchDistrictsByStateId = async (stateId) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/district/state/${stateId}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveDistrictAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/district/save`, {
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

  const updateDistrictAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/district/update/${id}`, {
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

  const deleteDistrictAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/district/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveOrganization = async (organizationData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: organizationData.name || '',
        officeNo: organizationData.officeNo || '',
        contactNo: organizationData.contactNo || '',
        gstNo: organizationData.gstNo || '',
        email: organizationData.email || '',
        webSite: organizationData.website || '',
        logoString: organizationData.logoString || '',
        organizationCode: organizationData.organizationCode || '',
      };

      const response = await saveOrg(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save organization");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to save organization");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save organization response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Organization saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving organization:", err);
      setError(err.message || 'Failed to save organization');
      setLoading(false);
      throw err;
    }
  };

  const getOrganization = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchOrganization();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch organization");
      }

      const data = await response.json();
      setOrganizationData(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching organization:", err);
      setError(err.message || 'Failed to fetch organization');
      setLoading(false);
      throw err;
    }
  };

  // Financial Year Functions
  const getAllFinancialYears = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllFinancialYears();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch financial years");
      }

      const data = await response.json();
      setFinancialYears(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching financial years:", err);
      setError(err.message || 'Failed to fetch financial years');
      setLoading(false);
      throw err;
    }
  };

  const getFinancialYearById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFinancialYearById(id);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch financial year");
      }

      const data = await response.json();
      setCurrentFinancialYear(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching financial year:", err);
      setError(err.message || 'Failed to fetch financial year');
      setLoading(false);
      throw err;
    }
  };

  const saveFinancialYear = async (financialYearData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: financialYearData.name || '',
        startDate: financialYearData.startDate || '',
        endDate: financialYearData.endDate || '',
        currentYear: financialYearData.currentYear || false,
      };

      const response = await saveFinancialYearAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save financial year");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to save financial year");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        // If parsing fails but response was ok, consider it success
        console.log('Parse error but response OK:', parseError);
        result = { message: "Operation completed successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving financial year:", err);
      setError(err.message || 'Failed to save financial year');
      setLoading(false);
      throw err;
    }
  };

  const updateFinancialYear = async (id, financialYearData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: financialYearData.name || '',
        startDate: financialYearData.startDate || '',
        endDate: financialYearData.endDate || '',
        currentYear: financialYearData.currentYear || false,
      };

      const response = await updateFinancialYearAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update financial year");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update financial year");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        // If parsing fails but response was ok, consider it success
        console.log('Parse error but response OK:', parseError);
        result = { message: "Operation completed successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating financial year:", err);
      setError(err.message || 'Failed to update financial year');
      setLoading(false);
      throw err;
    }
  };

  const deleteFinancialYear = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteFinancialYearAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete financial year");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to delete financial year");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        // If parsing fails but response was ok, consider it success
        console.log('Parse error but response OK:', parseError);
        result = { message: "Operation completed successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting financial year:", err);
      setError(err.message || 'Failed to delete financial year');
      setLoading(false);
      throw err;
    }
  };

  // Users Category Functions
  const getAllUsersCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllUsersCategories();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch users categories");
      }

      const data = await response.json();
      setUsersCategories(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching users categories:", err);
      setError(err.message || 'Failed to fetch users categories');
      setLoading(false);
      throw err;
    }
  };

  const getUserCategoryById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchUserCategoryById(id);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch user category");
      }

      const data = await response.json();
      setCurrentUserCategory(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching user category:", err);
      setError(err.message || 'Failed to fetch user category');
      setLoading(false);
      throw err;
    }
  };

  const saveUserCategory = async (userCategoryData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        categoryName: userCategoryData.categoryName || '',
        categoryCode: userCategoryData.categoryCode || '',
      };

      const response = await saveUserCategoryAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save user category");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to save user category");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save user category response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "User category saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving user category:", err);
      setError(err.message || 'Failed to save user category');
      setLoading(false);
      throw err;
    }
  };

  const updateUserCategory = async (id, userCategoryData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        categoryName: userCategoryData.categoryName || '',
        categoryCode: userCategoryData.categoryCode || '',
      };

      const response = await updateUserCategoryAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update user category");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update user category");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update user category response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "User category updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating user category:", err);
      setError(err.message || 'Failed to update user category');
      setLoading(false);
      throw err;
    }
  };

  const deleteUserCategory = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteUserCategoryAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete user category");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to delete user category");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete user category response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "User category deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting user category:", err);
      setError(err.message || 'Failed to delete user category');
      setLoading(false);
      throw err;
    }
  };

  // Religion Functions
  const getAllReligions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllReligions();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch religions");
      }

      const data = await response.json();
      setReligions(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching religions:", err);
      setError(err.message || 'Failed to fetch religions');
      setLoading(false);
      throw err;
    }
  };

  const getReligionById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchReligionById(id);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch religion");
      }

      const data = await response.json();
      setCurrentReligion(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching religion:", err);
      setError(err.message || 'Failed to fetch religion');
      setLoading(false);
      throw err;
    }
  };

  const saveReligion = async (religionData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: religionData.name || '',
      };

      const response = await saveReligionAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save religion");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to save religion");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save religion response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Religion saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving religion:", err);
      setError(err.message || 'Failed to save religion');
      setLoading(false);
      throw err;
    }
  };

  const updateReligion = async (id, religionData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        name: religionData.name || '',
      };

      const response = await updateReligionAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update religion");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update religion");
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update religion response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Religion updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating religion:", err);
      setError(err.message || 'Failed to update religion');
      setLoading(false);
      throw err;
    }
  };

  const deleteReligion = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteReligionAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete religion");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete religion");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete religion response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Religion deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting religion:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete religion');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  // Category Functions
  const getAllCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllCategories();
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || 'Failed to fetch categories');
      setLoading(false);
      throw err;
    }
  };

  const getCategoryById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCategoryById(id);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch category");
      }

      const data = await response.json();
      setCurrentCategory(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching category:", err);
      setError(err.message || 'Failed to fetch category');
      setLoading(false);
      throw err;
    }
  };

  const saveCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        category: categoryData.category || '',
      };

      const response = await saveCategoryAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to save category");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to save category");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save category response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Category saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving category:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to save category');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        category: categoryData.category || '',
      };

      const response = await updateCategoryAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to update category");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to update category");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update category response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Category updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating category:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to update category');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteCategoryAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete category");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete category");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete category response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Category deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting category:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete category');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  // Blood Group Business Logic Functions
  const getAllBloodGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllBloodGroups();
      
      if (!response.ok) {
        const errorData = await response.json();
        const cleanMessage = parseErrorMessage(errorData.message || "Failed to fetch blood groups");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setBloodGroups(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching blood groups:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch blood groups');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getBloodGroupById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchBloodGroupById(id);
      
      if (!response.ok) {
        const errorData = await response.json();
        const cleanMessage = parseErrorMessage(errorData.message || "Failed to fetch blood group");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setCurrentBloodGroup(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching blood group:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch blood group');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const saveBloodGroup = async (bloodGroupData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        bloodGroup: bloodGroupData.bloodGroup,
      };

      const response = await saveBloodGroupAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to save blood group");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to save blood group");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save blood group response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Blood group saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving blood group:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to save blood group');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const updateBloodGroup = async (id, bloodGroupData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        bloodGroup: bloodGroupData.bloodGroup,
      };

      const response = await updateBloodGroupAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to update blood group");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to update blood group");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update blood group response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Blood group updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating blood group:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to update blood group');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const deleteBloodGroup = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteBloodGroupAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete blood group");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete blood group");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete blood group response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Blood group deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting blood group:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete blood group');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  // Prefix Business Logic Functions
  const getAllPrefixes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllPrefixes();
      
      if (!response.ok) {
        const errorData = await response.json();
        const cleanMessage = parseErrorMessage(errorData.message || "Failed to fetch prefixes");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setPrefixes(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching prefixes:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch prefixes');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getPrefixById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchPrefixById(id);
      
      if (!response.ok) {
        const errorData = await response.json();
        const cleanMessage = parseErrorMessage(errorData.message || "Failed to fetch prefix");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setCurrentPrefix(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching prefix:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch prefix');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const savePrefix = async (prefixData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        prefixName: prefixData.prefixName,
      };

      const response = await savePrefixAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to save prefix");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to save prefix");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save prefix response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Prefix saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving prefix:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to save prefix');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const updatePrefix = async (id, prefixData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        prefixName: prefixData.prefixName,
      };

      const response = await updatePrefixAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to update prefix");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to update prefix");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update prefix response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Prefix updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating prefix:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to update prefix');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const deletePrefix = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deletePrefixAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete prefix");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete prefix");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete prefix response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Prefix deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting prefix:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete prefix');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  // Country Business Logic Functions
  const getAllCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllCountries();
      
      if (!response.ok) {
        const errorData = await response.json();
        const cleanMessage = parseErrorMessage(errorData.message || "Failed to fetch countries");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setCountries(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching countries:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch countries');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getCountryById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCountryById(id);
      
      if (!response.ok) {
        const errorData = await response.json();
        const cleanMessage = parseErrorMessage(errorData.message || "Failed to fetch country");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setCurrentCountry(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching country:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch country');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const saveCountry = async (countryData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        country: countryData.country,
        countryCode: countryData.countryCode,
      };

      const response = await saveCountryAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to save country");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to save country");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save country response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Country saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving country:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to save country');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const updateCountry = async (id, countryData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        country: countryData.country,
        countryCode: countryData.countryCode,
      };

      const response = await updateCountryAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to update country");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to update country");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update country response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Country updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating country:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to update country');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const deleteCountry = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteCountryAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete country");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete country");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete country response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "Country deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting country:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete country');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  // State Functions
  const getAllStates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllStates();
      
      if (!response.ok) {
        const errorText = await response.text();
        const cleanMessage = parseErrorMessage(errorText || "Failed to fetch states");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setStates(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching states:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch states');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getStateById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchStateById(id);
      
      if (!response.ok) {
        const errorText = await response.text();
        const cleanMessage = parseErrorMessage(errorText || "Failed to fetch state");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setCurrentState(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching state:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch state');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getStatesByCountryId = async (countryId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchStatesByCountryId(countryId);
      
      if (!response.ok) {
        const errorText = await response.text();
        const cleanMessage = parseErrorMessage(errorText || "Failed to fetch states by country");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setStates(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching states by country:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch states by country');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const saveState = async (stateData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        state: stateData.stateName || '',
        stateCode: stateData.stateCode || '',
        country: {
          id: stateData.countryId || null,
        },
      };

      const response = await saveStateAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to save state");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to save state");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save state response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "State saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving state:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to save state');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const updateState = async (id, stateData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        state: stateData.stateName || '',
        stateCode: stateData.stateCode || '',
        country: {
          id: stateData.countryId || null,
        },
      };

      const response = await updateStateAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to update state");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to update state");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update state response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "State updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating state:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to update state');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const deleteState = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteStateAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete state");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete state");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete state response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "State deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting state:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete state');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  // District Functions
  const getAllDistricts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllDistricts();
      
      if (!response.ok) {
        const errorText = await response.text();
        const cleanMessage = parseErrorMessage(errorText || "Failed to fetch districts");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setDistricts(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching districts:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch districts');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getDistrictById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDistrictById(id);
      
      if (!response.ok) {
        const errorText = await response.text();
        const cleanMessage = parseErrorMessage(errorText || "Failed to fetch district");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setCurrentDistrict(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching district:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch district');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const getDistrictsByStateId = async (stateId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDistrictsByStateId(stateId);
      
      if (!response.ok) {
        const errorText = await response.text();
        const cleanMessage = parseErrorMessage(errorText || "Failed to fetch districts by state");
        throw new Error(cleanMessage);
      }

      const data = await response.json();
      setDistricts(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching districts by state:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to fetch districts by state');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const saveDistrict = async (districtData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        district: districtData.districtName || '',
        districtCode: districtData.districtCode || '',
        state: {
          id: districtData.stateId || null,
        },
      };

      const response = await saveDistrictAPI(payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to save district");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to save district");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Save district response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "District saved successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving district:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to save district');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const updateDistrict = async (id, districtData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        district: districtData.districtName || '',
        districtCode: districtData.districtCode || '',
        state: {
          id: districtData.stateId || null,
        },
      };

      const response = await updateDistrictAPI(id, payload);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to update district");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to update district");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Update district response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "District updated successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating district:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to update district');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  const deleteDistrict = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteDistrictAPI(id);
      
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        // Handle error response
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const cleanMessage = parseErrorMessage(errorData.message || "Failed to delete district");
          throw new Error(cleanMessage);
        } else {
          const errorText = await response.text();
          const cleanMessage = parseErrorMessage(errorText || "Failed to delete district");
          throw new Error(cleanMessage);
        }
      }

      // Handle success response
      let result;
      try {
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.log('Delete district response (text):', text);
          result = { message: text, success: true };
        }
      } catch (parseError) {
        console.log('Parse error but response OK:', parseError);
        result = { message: "District deleted successfully", success: true };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting district:", err);
      const cleanError = parseErrorMessage(err.message || 'Failed to delete district');
      setError(cleanError);
      setLoading(false);
      throw new Error(cleanError);
    }
  };

  return {
    saveOrganization,
    getOrganization,
    organizationData,
    getAllFinancialYears,
    getFinancialYearById,
    saveFinancialYear,
    updateFinancialYear,
    deleteFinancialYear,
    financialYears,
    currentFinancialYear,
    loading,
    error,
    success,
    getAllUsersCategories,
    getUserCategoryById,
    saveUserCategory,
    updateUserCategory,
    deleteUserCategory,
    usersCategories,
    currentUserCategory,
    getAllReligions,
    getReligionById,
    saveReligion,
    updateReligion,
    deleteReligion,
    religions,
    currentReligion,
    getAllCategories,
    getCategoryById,
    saveCategory,
    updateCategory,
    deleteCategory,
    categories,
    currentCategory,
    getAllBloodGroups,
    getBloodGroupById,
    saveBloodGroup,
    updateBloodGroup,
    deleteBloodGroup,
    bloodGroups,
    currentBloodGroup,
    getAllPrefixes,
    getPrefixById,
    savePrefix,
    updatePrefix,
    deletePrefix,
    prefixes,
    currentPrefix,
    getAllCountries,
    getCountryById,
    saveCountry,
    updateCountry,
    deleteCountry,
    countries,
    currentCountry,
    getAllStates,
    getStateById,
    getStatesByCountryId,
    saveState,
    updateState,
    deleteState,
    states,
    currentState,
    getAllDistricts,
    getDistrictById,
    getDistrictsByStateId,
    saveDistrict,
    updateDistrict,
    deleteDistrict,
    districts,
    currentDistrict,
  };
};

export default useGeneral;
