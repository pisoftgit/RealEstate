import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../services/api";

const useHr = () => {
  // Helper function to parse and clean error messages
  const parseErrorMessage = (errorText) => {
    // Check for "Hey...! wait a minute, error says:" pattern
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
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [documents, setDocuments] = useState([]);

  // ============================================  // ============================================
  // API Helper Functions - Direct fetch calls
  // ============================================

  // Branch API Helper Functions
  const createBranchAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/branch/create`, {
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

  const fetchAllBranchesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/branch/all`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const updateBranchAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/branch/update/${id}`, {
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

  // Department API Helper Functions
  const fetchAllDepartmentsAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/department/all`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const addDepartmentAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/department/add`, {
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

  const updateDepartmentAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/department/update/${id}`, {
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

  const deleteDepartmentAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/department/delete/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Designation API Helper Functions
  const fetchAllDesignationsAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/designation/all`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const addDesignationAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/designation/add`, {
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

  const updateDesignationAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/designation/update/${id}`, {
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

  const deleteDesignationAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/designation/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Employee Type API Helper Functions
  const fetchAllEmployeeTypesAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/employee-type`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchEmployeeTypeByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/employee-type/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const addEmployeeTypeAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/employee-type`, {
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

  const updateEmployeeTypeAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/employee-type/${id}`, {
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

  const deleteEmployeeTypeAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/employee-type/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // Document API Helper Functions
  const fetchAllDocumentsAPI = async () => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/documents-name`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const fetchDocumentByIdAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/documents-name/${id}`, {
      method: "GET",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  const addDocumentAPI = async (payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/documents-name`, {
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

  const updateDocumentAPI = async (id, payload) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/documents-name/${id}`, {
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

  const deleteDocumentAPI = async (id) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(`${API_BASE_URL}/documents-name/${id}`, {
      method: "DELETE",
      headers: {
        secret_key: secretKey,
        Accept: "application/json",
      },
    });
    return response;
  };

  // ============================================
  // Business Logic Functions
  // ============================================

  /**
   * Create a new branch
   */
  const createBranch = async (branchData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!branchData.branch || branchData.branch.trim() === "") {
        throw new Error("Branch name is required");
      }
      if (!branchData.organizationId) {
        throw new Error("Organization ID is required");
      }
      if (!branchData.organisatonAddressDetails) {
        throw new Error("Address details are required");
      }
      if (!branchData.authorizedPersonName || branchData.authorizedPersonName.trim() === "") {
        throw new Error("Authorized person name is required");
      }
      if (!branchData.authorizedPersonContact || branchData.authorizedPersonContact.trim() === "") {
        throw new Error("Authorized person contact is required");
      }
      if (!branchData.authorizedPersonEmail || branchData.authorizedPersonEmail.trim() === "") {
        throw new Error("Authorized person email is required");
      }

      // Prepare the payload
      const payload = {
        branch: branchData.branch,
        organizationId: branchData.organizationId,
        gstApplicable: branchData.gstApplicable ?? false,
        gstNo: branchData.gstNo || "",
        organisatonAddressDetails: {
          districtId: branchData.organisatonAddressDetails.districtId,
          address1: branchData.organisatonAddressDetails.address1 || "",
          address2: branchData.organisatonAddressDetails.address2 || "",
          city: branchData.organisatonAddressDetails.city || "",
          pincode: branchData.organisatonAddressDetails.pincode || "",
        },
        authorizedPersonName: branchData.authorizedPersonName,
        authorizedPersonContact: branchData.authorizedPersonContact,
        authorizedPersonEmail: branchData.authorizedPersonEmail,
        authorizedPersonDesignation: branchData.authorizedPersonDesignation || "",
        bauthorizedSignatureLogoranchLogo: branchData.bauthorizedSignatureLogoranchLogo || "",
        authorizedSignatureLogoContentType: branchData.authorizedSignatureLogoContentType || "image/jpg",
      };

      const response = await createBranchAPI(payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Branch created successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error creating branch:", err);
      setError(err.message || 'Failed to create branch');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all branches
   */
  const getAllBranches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllBranchesAPI();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBranches(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError(err.message || 'Failed to fetch branches');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update branch
   */
  const updateBranch = async (id, branchData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!branchData.branch || branchData.branch.trim() === "") {
        throw new Error("Branch name is required");
      }
      if (!branchData.organizationId) {
        throw new Error("Organization ID is required");
      }

      // Prepare the payload
      const payload = {
        branch: branchData.branch,
        organizationId: branchData.organizationId,
        gstApplicable: branchData.gstApplicable ?? false,
        gstNo: branchData.gstNo || "",
        organisatonAddressDetails: {
          districtId: branchData.organisatonAddressDetails?.districtId || 0,
          address1: branchData.organisatonAddressDetails?.address1 || "",
          address2: branchData.organisatonAddressDetails?.address2 || "",
          city: branchData.organisatonAddressDetails?.city || "",
          pincode: branchData.organisatonAddressDetails?.pincode || "",
        },
        authorizedPersonName: branchData.authorizedPersonName || "",
        authorizedPersonContact: branchData.authorizedPersonContact || "",
        authorizedPersonEmail: branchData.authorizedPersonEmail || "",
        authorizedPersonDesignation: branchData.authorizedPersonDesignation || "",
        bauthorizedSignatureLogoranchLogo: branchData.bauthorizedSignatureLogoranchLogo || "",
        authorizedSignatureLogoContentType: branchData.authorizedSignatureLogoContentType || "image/jpg",
      };

      const response = await updateBranchAPI(id, payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Branch updated successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating branch:", err);
      setError(err.message || 'Failed to update branch');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all departments
   */
  const getAllDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllDepartmentsAPI();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDepartments(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message || 'Failed to fetch departments');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Add new department
   */
  const addDepartment = async (departmentName) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required field
      if (!departmentName || departmentName.trim() === "") {
        throw new Error("Department name is required");
      }

      const payload = {
        departmentName: departmentName.trim(),
      };

      const response = await addDepartmentAPI(payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Department added successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error adding department:", err);
      setError(err.message || 'Failed to add department');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update department
   */
  const updateDepartment = async (id, departmentName) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required field
      if (!departmentName || departmentName.trim() === "") {
        throw new Error("Department name is required");
      }

      const payload = {
        departmentName: departmentName.trim(),
      };

      const response = await updateDepartmentAPI(id, payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Department updated successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating department:", err);
      setError(err.message || 'Failed to update department');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete department
   */
  const deleteDepartment = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteDepartmentAPI(id);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Department deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting department:", err);
      setError(err.message || 'Failed to delete department');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all designations
   */
  const getAllDesignations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllDesignationsAPI();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDesignations(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching designations:", err);
      setError(err.message || 'Failed to fetch designations');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Add new designation
   */
  const addDesignation = async (departmentId, designationName) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!departmentId) {
        throw new Error("Department is required");
      }
      if (!designationName || designationName.trim() === "") {
        throw new Error("Designation name is required");
      }

      const payload = {
        departmentId: departmentId,
        designationName: designationName.trim(),
      };

      const response = await addDesignationAPI(payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Designation added successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error adding designation:", err);
      setError(err.message || 'Failed to add designation');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update designation
   */
  const updateDesignation = async (id, departmentId, designationName) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!departmentId) {
        throw new Error("Department is required");
      }
      if (!designationName || designationName.trim() === "") {
        throw new Error("Designation name is required");
      }

      const payload = {
        departmentId: departmentId,
        designationName: designationName.trim(),
      };

      const response = await updateDesignationAPI(id, payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Designation updated successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating designation:", err);
      setError(err.message || 'Failed to update designation');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete designation
   */
  const deleteDesignation = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteDesignationAPI(id);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Designation deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting designation:", err);
      setError(err.message || 'Failed to delete designation');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all employee types
   */
  const getAllEmployeeTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllEmployeeTypesAPI();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmployeeTypes(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching employee types:", err);
      setError(err.message || 'Failed to fetch employee types');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get employee type by ID (for editing)
   */
  const getEmployeeTypeById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchEmployeeTypeByIdAPI(id);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching employee type:", err);
      setError(err.message || 'Failed to fetch employee type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Add new employee type
   */
  const addEmployeeType = async (employeeType, employeeCodeGenerate) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required field
      if (!employeeType || employeeType.trim() === "") {
        throw new Error("Employee type name is required");
      }

      const payload = {
        employeeType: employeeType.trim(),
        employeeCodeGenerate: employeeCodeGenerate ?? false,
      };

      const response = await addEmployeeTypeAPI(payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Employee type added successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error adding employee type:", err);
      setError(err.message || 'Failed to add employee type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update employee type
   */
  const updateEmployeeType = async (id, employeeType, employeeCodeGenerate) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required field
      if (!employeeType || employeeType.trim() === "") {
        throw new Error("Employee type name is required");
      }

      const payload = {
        employeeType: employeeType.trim(),
        employeeCodeGenerate: employeeCodeGenerate ?? false,
      };

      const response = await updateEmployeeTypeAPI(id, payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Employee type updated successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating employee type:", err);
      setError(err.message || 'Failed to update employee type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete employee type
   */
  const deleteEmployeeType = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteEmployeeTypeAPI(id);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Employee type deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting employee type:", err);
      setError(err.message || 'Failed to delete employee type');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get all documents
   */
  const getAllDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllDocumentsAPI();
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data);
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message || 'Failed to fetch documents');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Get document by ID (for editing)
   */
  const getDocumentById = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDocumentByIdAPI(id);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Error fetching document:", err);
      setError(err.message || 'Failed to fetch document');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Add new document
   */
  const addDocument = async (documentName, description) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required field
      if (!documentName || documentName.trim() === "") {
        throw new Error("Document name is required");
      }

      const payload = {
        documentName: documentName.trim(),
        description: description?.trim() || null,
      };

      const response = await addDocumentAPI(payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Document added successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error adding document:", err);
      setError(err.message || 'Failed to add document');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Update document
   */
  const updateDocument = async (id, documentName, description) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required field
      if (!documentName || documentName.trim() === "") {
        throw new Error("Document name is required");
      }

      const payload = {
        documentName: documentName.trim(),
        description: description?.trim() || null,
      };

      const response = await updateDocumentAPI(id, payload);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Document updated successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error updating document:", err);
      setError(err.message || 'Failed to update document');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Delete document
   */
  const deleteDocument = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteDocumentAPI(id);
      
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

      // Handle success response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        result = { success: true, message: "Document deleted successfully" };
      }
      
      setSuccess(true);
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error deleting document:", err);
      setError(err.message || 'Failed to delete document');
      setLoading(false);
      throw err;
    }
  };

  return {
    // Branch operations
    createBranch,
    getAllBranches,
    updateBranch,
    
    // Department operations
    getAllDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    
    // Designation operations
    getAllDesignations,
    addDesignation,
    updateDesignation,
    deleteDesignation,
    
    // Employee Type operations
    getAllEmployeeTypes,
    getEmployeeTypeById,
    addEmployeeType,
    updateEmployeeType,
    deleteEmployeeType,
    
    // Document operations
    getAllDocuments,
    getDocumentById,
    addDocument,
    updateDocument,
    deleteDocument,
    
    // State
    branches,
    departments,
    designations,
    employeeTypes,
    documents,
    loading,
    error,
    success,
  };
};

export default useHr;
