import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";

const useLeave = () => {
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
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRules, setLeaveRules] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);

  // ============================================
  // Leave Types API Helper Functions
  // ============================================

  const fetchAllLeaveTypesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveSetup/leaveTypes`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchLeaveTypeByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveSetup/leaveTypes/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveLeaveTypeAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveSetup/leaveTypes`, {
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

  const updateLeaveTypeAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveSetup/leaveTypes/${id}`, {
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

  const deleteLeaveTypeAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveSetup/leaveTypes/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Leave Rules API Helper Functions
  // ============================================

  const fetchAllLeaveRulesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveRules/getAllLeaveRules`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchLeaveRuleByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveRules/getLeaveRule/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveLeaveRuleAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveRules/save`, {
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

  const deleteLeaveRuleAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leaveRules/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Leave Types Business Logic Functions
  // ============================================

  /**
   * Get all leave types
   */
  const getAllLeaveTypes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllLeaveTypesAPI();
      
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
      setLeaveTypes(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching leave types:", err);
      setError(err.message || 'Failed to fetch leave types');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get leave type by ID
   */
  const getLeaveTypeById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchLeaveTypeByIdAPI(id);
      
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
      console.error("Error fetching leave type by ID:", err);
      setError(err.message || 'Failed to fetch leave type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save a new leave type
   */
  const saveLeaveType = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!payload.leaveName || payload.leaveName.trim() === "") {
        throw new Error("Leave name is required");
      }

      const requestPayload = {
        leaveName: payload.leaveName.trim(),
        usersCategory: payload.usersCategoryId ? { id: parseInt(payload.usersCategoryId) } : null,
        leavesEncashment: payload.leavesEncashment || "No",
        gender: payload.gender || "Any",
        leaveCarriedForward: payload.leaveCarriedForward || "No",
        maxCarryForward: payload.maxCarryForward ? parseInt(payload.maxCarryForward) : null,
      };

      const response = await saveLeaveTypeAPI(requestPayload);
      
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

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Leave type saved successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving leave type:", err);
      setError(err.message || 'Failed to save leave type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update an existing leave type
   */
  const updateLeaveType = async (id, payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!payload.leaveName || payload.leaveName.trim() === "") {
        throw new Error("Leave name is required");
      }

      const requestPayload = {
        leaveName: payload.leaveName.trim(),
        usersCategory: payload.usersCategoryId ? { id: parseInt(payload.usersCategoryId) } : null,
        leavesEncashment: payload.leavesEncashment || "No",
        gender: payload.gender || "Any",
        leaveCarriedForward: payload.leaveCarriedForward || "No",
        maxCarryForward: payload.maxCarryForward ? parseInt(payload.maxCarryForward) : null,
      };

      const response = await updateLeaveTypeAPI(id, requestPayload);
      
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

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Leave type updated successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating leave type:", err);
      setError(err.message || 'Failed to update leave type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete a leave type by ID
   */
  const deleteLeaveType = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteLeaveTypeAPI(id);
      
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

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Leave type deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting leave type:", err);
      setError(err.message || 'Failed to delete leave type');
      setLoading(false);
      throw err;
    }
  };

  // ============================================
  // Leave Rules Business Logic Functions
  // ============================================

  /**
   * Get all leave rules
   */
  const getAllLeaveRules = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllLeaveRulesAPI();
      
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
      setLeaveRules(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching leave rules:", err);
      setError(err.message || 'Failed to fetch leave rules');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get leave rule by ID
   */
  const getLeaveRuleById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchLeaveRuleByIdAPI(id);
      
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
      console.error("Error fetching leave rule by ID:", err);
      setError(err.message || 'Failed to fetch leave rule');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save a new leave rule (also used for update)
   */
  const saveLeaveRule = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!payload.leaveTypeId) {
        throw new Error("Leave type is required");
      }
      if (!payload.designationId) {
        throw new Error("Designation is required");
      }
      if (!payload.employeeTypeId) {
        throw new Error("Employee type is required");
      }

      const requestPayload = {
        leaveTypeId: parseInt(payload.leaveTypeId),
        designationId: parseInt(payload.designationId),
        employeeTypeId: parseInt(payload.employeeTypeId),
        maxLimitPerMonth: payload.maxLimitPerMonth || "No",
        maxLeavesPerMonth: payload.maxLeavesPerMonth ? parseInt(payload.maxLeavesPerMonth) : null,
        maxLeavesPerYear: payload.maxLeavesPerYear ? parseInt(payload.maxLeavesPerYear) : null,
        leaveTypeCode: payload.leaveTypeCode ? parseInt(payload.leaveTypeCode) : null,
      };

      const response = await saveLeaveRuleAPI(requestPayload);
      
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

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Leave rule saved successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving leave rule:", err);
      setError(err.message || 'Failed to save leave rule');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete a leave rule by ID
   */
  const deleteLeaveRule = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteLeaveRuleAPI(id);
      
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

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Leave rule deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting leave rule:", err);
      setError(err.message || 'Failed to delete leave rule');
      setLoading(false);
      throw err;
    }
  };

  // ============================================
  // Dropdown Data Functions
  // ============================================

  /**
   * Fetch user categories for the Leave For dropdown
   */
  const fetchUserCategories = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await fetch(`${API_BASE_URL}/userCategories/getAll`, {
        method: "GET",
        headers: {
          secret_key: secretKey,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch user categories, using empty array");
        setUserCategories([]);
        return [];
      }

      const data = await response.json();
      setUserCategories(data || []);
      return data;
    } catch (err) {
      console.warn("Error fetching user categories:", err);
      setUserCategories([]);
      return [];
    }
  };

  /**
   * Fetch designations for the Job Title dropdown
   */
  const fetchDesignations = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await fetch(`${API_BASE_URL}/designation/getAll`, {
        method: "GET",
        headers: {
          secret_key: secretKey,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch designations, using empty array");
        setDesignations([]);
        return [];
      }

      const data = await response.json();
      setDesignations(data || []);
      return data;
    } catch (err) {
      console.warn("Error fetching designations:", err);
      setDesignations([]);
      return [];
    }
  };

  /**
   * Fetch employee types for the Employment Type dropdown
   */
  const fetchEmployeeTypes = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync("auth_token");
      const response = await fetch(`${API_BASE_URL}/employeeTypes/getAll`, {
        method: "GET",
        headers: {
          secret_key: secretKey,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch employee types, using empty array");
        setEmployeeTypes([]);
        return [];
      }

      const data = await response.json();
      setEmployeeTypes(data || []);
      return data;
    } catch (err) {
      console.warn("Error fetching employee types:", err);
      setEmployeeTypes([]);
      return [];
    }
  };

  return {
    // Leave Types operations
    getAllLeaveTypes,
    getLeaveTypeById,
    saveLeaveType,
    updateLeaveType,
    deleteLeaveType,
    
    // Leave Rules operations
    getAllLeaveRules,
    getLeaveRuleById,
    saveLeaveRule,
    deleteLeaveRule,
    
    // Dropdown data functions
    fetchUserCategories,
    fetchDesignations,
    fetchEmployeeTypes,
    
    // State
    leaveTypes,
    leaveRules,
    userCategories,
    designations,
    employeeTypes,
    loading,
    error,
    success,
  };
};

export { useLeave };
export default useLeave;
