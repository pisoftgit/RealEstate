import { useCallback, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { API_BASE_URL } from "../services/api";

const useAddUser = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Add New User
  const addUser = useCallback(async (userData) => {
    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      // ✅ Clean and normalize data types according to API requirements
      const payload = {
        name: userData.name,
        email: userData.email,
        phone: userData.mobileNo,
        password: userData.password,
        userCategory1: "Normal User",
        usercode: userData.userName,
        dob: formatDateForAPI(userData.dob),
        fatherName: userData.fatherName || "",
        motherName: userData.motherName || "",
        gender: userData.gender || "n/a",
      };

      // Validate payload before sending
      if (!payload.name || payload.name.trim() === "") {
        throw new Error("Name is required");
      }
      if (!payload.email || payload.email.trim() === "") {
        throw new Error("Email is required");
      }
      if (!payload.phone || payload.phone.trim() === "") {
        throw new Error("Phone number is required");
      }
      if (!payload.password || payload.password.trim() === "") {
        throw new Error("Password is required");
      }
      if (!payload.usercode || payload.usercode.trim() === "") {
        throw new Error("Username is required");
      }

      console.log("Final Add User Payload Sent:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${API_BASE_URL}/user/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      Alert.alert("✅ Success", "User added successfully!");
      return response.data;
    } catch (error) {
      console.error("Add user error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to add user.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Log full error details for debugging
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  // Get All Users - /realEstate/api/v1/user/manage (without any params)
  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      console.log("Fetching all users...");

      const response = await axios.get(
        `${API_BASE_URL}/user/manage`,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      console.log("All users fetched successfully:", response.data);
      
      // Handle different response structures
      let usersData = response.data;
      if (response.data?.data) {
        usersData = response.data.data;
      }
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
      return usersData;
    } catch (error) {
      console.error("Get all users error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to fetch users.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  // Search Users - /realEstate/api/v1/user/manage?name=&userCode=
  const searchUsers = useCallback(async (name = "", userCode = "") => {
    setLoading(true);
    setError(null);

    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      // Build query parameters for search
      const params = new URLSearchParams();
      if (name && name.trim()) params.append('name', name.trim());
      if (userCode && userCode.trim()) params.append('userCode', userCode.trim());

      console.log("Searching users with params:", params.toString());

      const response = await axios.get(
        `${API_BASE_URL}/user/manage?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      console.log("Users search results:", response.data);
      
      // Handle different response structures
      let usersData = response.data;
      if (response.data?.data) {
        usersData = response.data.data;
      }
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
      return usersData;
    } catch (error) {
      console.error("Search users error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to search users.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  // Get User Profile by ID - /realEstate/api/user/myprofile/{id}
  const getUserProfile = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      if (!id) {
        throw new Error("User ID is required");
      }

      console.log("Fetching user profile with ID:", id);

      const response = await axios.get(
        `${API_BASE_URL}/user/myprofile/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      console.log("User profile fetched successfully:", response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error("Get user profile error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to fetch user profile.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  // Get User by ID - /realEstate/api/user/get/{id}
  const getUserById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      if (!id) {
        throw new Error("User ID is required");
      }

      console.log("Fetching user with ID:", id);

      const response = await axios.get(
        `${API_BASE_URL}/user/get/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      console.log("User fetched successfully:", response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error("Get user by ID error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to fetch user details.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  // Update User
  const updateUser = useCallback(async (userId, userData) => {
    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userIdFromStore = await SecureStore.getItemAsync("userid");

      if (!authToken || !userIdFromStore) {
        throw new Error("Missing authentication details");
      }

      if (!userId) {
        throw new Error("User ID is required");
      }

      // ✅ Clean and normalize data types according to API requirements
      const payload = {
        name: userData.name,
        email: userData.email,
        phone: userData.mobileNo,
        password: userData.password,
        userCategory1: "Normal User",
        usercode: userData.userName,
        dob: formatDateForAPI(userData.dob),
        fatherName: userData.fatherName || "",
        motherName: userData.motherName || "",
        gender: userData.gender || "n/a",
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      };

      // Validate payload before sending
      if (!payload.name || payload.name.trim() === "") {
        throw new Error("Name is required");
      }
      if (!payload.email || payload.email.trim() === "") {
        throw new Error("Email is required");
      }
      if (!payload.phone || payload.phone.trim() === "") {
        throw new Error("Phone number is required");
      }
      if (!payload.usercode || payload.usercode.trim() === "") {
        throw new Error("Username is required");
      }

      console.log("Final Update User Payload Sent:", JSON.stringify(payload, null, 2));

      const response = await axios.put(
        `${API_BASE_URL}/user/update/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      Alert.alert("✅ Success", "User updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Update user error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to update user.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Log full error details for debugging
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  // Delete User - /realEstate/api/user/delete/{id}
  const deleteUser = useCallback(async (id) => {
    try {
      const authToken = await SecureStore.getItemAsync("auth_token");
      const userId = await SecureStore.getItemAsync("userid");

      if (!authToken || !userId) {
        throw new Error("Missing authentication details");
      }

      if (!id) {
        throw new Error("User ID is required");
      }

      console.log("Deleting user with ID:", id);

      const response = await axios.delete(
        `${API_BASE_URL}/user/delete/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            secret_key: authToken,
          },
        }
      );

      console.log("User deleted successfully:", response.data);
      Alert.alert("✅ Success", "User deleted successfully!");
      
      // Update local users list by removing deleted user
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      
      return response.data;
    } catch (error) {
      console.error("Delete user error:", error?.response?.data || error.message);
      
      let errorMessage = "Failed to delete user.";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("❌ Error", errorMessage);
      throw error;
    }
  }, []);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    addUser,
    getAllUsers,
    searchUsers,
    getUserProfile,
    getUserById,
    updateUser,
    deleteUser,
    loading,
    users,
    error,
  };
};

export default useAddUser;
