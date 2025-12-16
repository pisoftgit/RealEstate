import { useCallback, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { API_BASE_URL } from "../services/api";

const useCreateBranch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Create a new branch
   * @param {Object} branchData - Branch creation data
   * @param {string} branchData.branch - Branch name
   * @param {number} branchData.organizationId - Organization ID
   * @param {boolean} branchData.gstApplicable - GST applicable flag
   * @param {string} branchData.gstNo - GST number (if applicable)
   * @param {Object} branchData.organisatonAddressDetails - Address details
   * @param {number} branchData.organisatonAddressDetails.districtId - District ID
   * @param {string} branchData.organisatonAddressDetails.address1 - Address line 1
   * @param {string} branchData.organisatonAddressDetails.address2 - Address line 2
   * @param {string} branchData.organisatonAddressDetails.city - City
   * @param {string} branchData.organisatonAddressDetails.pincode - Pincode
   * @param {string} branchData.authorizedPersonName - Authorized person name
   * @param {string} branchData.authorizedPersonContact - Contact number
   * @param {string} branchData.authorizedPersonEmail - Email address
   * @param {string} branchData.authorizedPersonDesignation - Designation
   * @param {string} branchData.bauthorizedSignatureLogoranchLogo - Logo (base64 or empty string)
   * @param {string} branchData.authorizedSignatureLogoContentType - Content type (e.g., "image/jpg")
   */
  const createBranch = useCallback(async (branchData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const authToken = await SecureStore.getItemAsync("auth_token");

      if (!authToken) {
        throw new Error("Missing authentication token");
      }

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

      console.log("Creating branch with payload:", payload);

      const response = await axios.post(
        `${API_BASE_URL}/branch/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "secret_key": authToken,
          },
        }
      );

      console.log("Branch creation response:", response.data);

      setSuccess(true);
      setLoading(false);

      Alert.alert(
        "Success",
        "Branch created successfully!",
        [{ text: "OK" }]
      );

      return response.data;
    } catch (err) {
      console.error("Error creating branch:", err);
      
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Failed to create branch. Please try again.";
      
      setError(errorMessage);
      setLoading(false);

      Alert.alert(
        "Error",
        errorMessage,
        [{ text: "OK" }]
      );

      throw err;
    }
  }, []);

  // Reset hook state
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    createBranch,
    loading,
    error,
    success,
    reset,
  };
};

export default useCreateBranch;
