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
  const [earnedLeaves, setEarnedLeaves] = useState([]);
  const [leaveStatuses, setLeaveStatuses] = useState([]);
  const [leaveApprovalConfigs, setLeaveApprovalConfigs] = useState([]);
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
  // Earned Leave API Helper Functions
  // ============================================

  const fetchAllEarnedLeavesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/earnLeave/`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchEarnedLeaveByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/earnLeave/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveEarnedLeaveAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/earnLeave/`, {
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

  const updateEarnedLeaveAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/earnLeave/${id}`, {
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

  const deleteEarnedLeaveAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/earnLeave/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Leave Status API Helper Functions
  // ============================================

  const fetchAllLeaveStatusesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-status/`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchLeaveStatusByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-status/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveLeaveStatusAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-status/`, {
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

  const updateLeaveStatusAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-status/`, {
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

  const deleteLeaveStatusAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-status/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Leave Approval Config API Helper Functions
  // ============================================

  const fetchAllLeaveApprovalConfigsAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-approval-config/`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchLeaveApprovalConfigByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-approval-config/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const saveLeaveApprovalConfigAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-approval-config/`, {
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

  const updateLeaveApprovalConfigAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-approval-config/`, {
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

  const deleteLeaveApprovalConfigAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/leave-approval-config/${id}`, {
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
   * Save a new leave type or update existing one
   */
  const saveLeaveType = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!payload.leaveName || payload.leaveName.trim() === "") {
        setLoading(false);
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

      // If id exists, add it to payload (API uses POST for both create and update)
      if (payload.id) {
        requestPayload.id = payload.id;
      }

      // Use POST for both create and update
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
        
        setLoading(false);
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { 
          success: true, 
          message: payload.id ? "Leave type updated successfully" : "Leave type saved successfully" 
        };
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
   * Update an existing leave type (uses saveLeaveType with id)
   */
  const updateLeaveType = async (id, payload) => {
    // Add id to payload and use saveLeaveType
    return saveLeaveType({ ...payload, id });
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
        
        setLoading(false);
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
        setLoading(false);
        throw new Error("Leave type is required");
      }
      if (!payload.designationId) {
        setLoading(false);
        throw new Error("Designation is required");
      }
      if (!payload.employeeTypeId) {
        setLoading(false);
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

      // If id exists, add it to payload for update
      if (payload.id) {
        requestPayload.id = payload.id;
      }

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
        
        setLoading(false);
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { 
          success: true, 
          message: payload.id ? "Leave rule updated successfully" : "Leave rule saved successfully" 
        };
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
        
        setLoading(false);
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
  // Earned Leave Business Logic Functions
  // ============================================

  /**
   * Get all earned leaves
   */
  const getAllEarnedLeaves = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchAllEarnedLeavesAPI();
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        const contentType = response.headers.get("content-type");
        
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
      setEarnedLeaves(data || []);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching earned leaves:", err);
      setError(err.message || 'Failed to fetch earned leaves');
      setLoading(false);
      setEarnedLeaves([]);
      return [];
    }
  };

  /**
   * Get earned leave by ID
   */
  const getEarnedLeaveById = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchEarnedLeaveByIdAPI(id);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        const contentType = response.headers.get("content-type");
        
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
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching earned leave:", err);
      setError(err.message || 'Failed to fetch earned leave');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save or update an earned leave
   */
  const saveEarnedLeave = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!payload.designationId) {
        setLoading(false);
        throw new Error("Job Title is required");
      }
      if (!payload.employeeTypeId) {
        setLoading(false);
        throw new Error("Employment Status is required");
      }
      if (!payload.eligibilityAfterDays) {
        setLoading(false);
        throw new Error("Eligibility After Days is required");
      }
      if (!payload.workingDays) {
        setLoading(false);
        throw new Error("Working Days is required");
      }
      if (!payload.numberOfLeaves) {
        setLoading(false);
        throw new Error("Number of Leaves is required");
      }

      const requestPayload = {
        designationId: parseInt(payload.designationId),
        employeeTypeId: parseInt(payload.employeeTypeId),
        eligibilityAfterDays: payload.eligibilityAfterDays.toString(),
        workingDays: parseFloat(payload.workingDays),
        numberOfLeaves: parseFloat(payload.numberOfLeaves),
      };

      // If ID exists, add it to payload (API uses POST for both create and update)
      if (payload.id) {
        requestPayload.id = payload.id;
      }

      // Use POST for both create and update
      const response = await saveEarnedLeaveAPI(requestPayload);
      
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
        
        setLoading(false);
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { 
          success: true, 
          message: payload.id ? "Earned leave updated successfully" : "Earned leave saved successfully" 
        };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error saving earned leave:", err);
      setError(err.message || 'Failed to save earned leave');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete an earned leave by ID
   */
  const deleteEarnedLeave = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteEarnedLeaveAPI(id);
      
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
        
        setLoading(false);
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Earned leave deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting earned leave:", err);
      setError(err.message || 'Failed to delete earned leave');
      setLoading(false);
      throw err;
    }
  };

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

  // ============================================
  // Leave Status Business Logic Functions
  // ============================================

  /**
   * Get all leave statuses
   */
  const getAllLeaveStatuses = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllLeaveStatusesAPI();
      
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
        console.error('Failed to parse leave statuses response:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setLeaveStatuses(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching leave statuses:", err.message);
      setError(err.message || 'Failed to fetch leave statuses');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get leave status by ID
   */
  const getLeaveStatusById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchLeaveStatusByIdAPI(id);
      
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
      console.error("Error fetching leave status by ID:", err);
      setError(err.message || 'Failed to fetch leave status');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save a new leave status
   */
  const saveLeaveStatus = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await saveLeaveStatusAPI(payload);
      
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
        console.error('Failed to parse leave status save response:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error saving leave status:", err.message);
      setError(err.message || 'Failed to save leave status');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update an existing leave status
   */
  const updateLeaveStatus = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateLeaveStatusAPI(payload);
      
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
        console.error('Failed to parse leave status update response:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error updating leave status:", err.message);
      setError(err.message || 'Failed to update leave status');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete a leave status
   */
  const deleteLeaveStatus = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteLeaveStatusAPI(id);
      
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
      console.error("Error deleting leave status:", err);
      setError(err.message || 'Failed to delete leave status');
      setLoading(false);
      throw err;
    }
  };

  // ============================================
  // Leave Approval Config Business Logic Functions
  // ============================================

  /**
   * Get all leave approval configs
   */
  const getAllLeaveApprovalConfigs = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchAllLeaveApprovalConfigsAPI();
      
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
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid JSON response from server');
      }
      
      setLeaveApprovalConfigs(data || []);
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching leave approval configs:", err);
      setError(err.message || 'Failed to fetch leave approval configs');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get leave approval config by ID
   */
  const getLeaveApprovalConfigById = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetchLeaveApprovalConfigByIdAPI(id);
      
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
      console.error("Error fetching leave approval config by ID:", err);
      setError(err.message || 'Failed to fetch leave approval config');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Save a new leave approval config
   */
  const saveLeaveApprovalConfig = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await saveLeaveApprovalConfigAPI(payload);
      
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
        data = { success: true, message: 'Leave approval config saved successfully' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If parsing fails but response is ok, consider it successful
          data = { success: true, message: 'Leave approval config saved successfully' };
        }
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error saving leave approval config:", err.message);
      setError(err.message || 'Failed to save leave approval config');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update an existing leave approval config
   */
  const updateLeaveApprovalConfig = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate that id exists for update
      if (!payload.id) {
        throw new Error('ID is required for updating leave approval config');
      }
      
      const response = await updateLeaveApprovalConfigAPI(payload);
      
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
        data = { success: true, message: 'Leave approval config updated successfully' };
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // If parsing fails but response is ok, consider it successful
          data = { success: true, message: 'Leave approval config updated successfully' };
        }
      }
      
      setSuccess(true);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error updating leave approval config:", err.message);
      setError(err.message || 'Failed to update leave approval config');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete a leave approval config
   */
  const deleteLeaveApprovalConfig = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteLeaveApprovalConfigAPI(id);
      
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
      console.error("Error deleting leave approval config:", err);
      setError(err.message || 'Failed to delete leave approval config');
      setLoading(false);
      throw err;
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
    
    // Earned Leave operations
    getAllEarnedLeaves,
    getEarnedLeaveById,
    saveEarnedLeave,
    deleteEarnedLeave,
    
    // Leave Status operations
    getAllLeaveStatuses,
    getLeaveStatusById,
    saveLeaveStatus,
    updateLeaveStatus,
    deleteLeaveStatus,
    
    // Leave Approval Config operations
    getAllLeaveApprovalConfigs,
    getLeaveApprovalConfigById,
    saveLeaveApprovalConfig,
    updateLeaveApprovalConfig,
    deleteLeaveApprovalConfig,
    
    // Dropdown data functions
    fetchUserCategories,
    fetchDesignations,
    fetchEmployeeTypes,
    
    // State
    leaveTypes,
    leaveRules,
    earnedLeaves,
    leaveStatuses,
    leaveApprovalConfigs,
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
