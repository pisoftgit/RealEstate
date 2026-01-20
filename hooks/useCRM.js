import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const useCRM = () => {
  // ==================== CUSTOMER DOCUMENT NAMES STATE ====================
  const [customerDocumentNames, setCustomerDocumentNames] = useState([]);
  const [isLoadingCustomerDocuments, setIsLoadingCustomerDocuments] = useState(false);
  const [customerDocumentsError, setCustomerDocumentsError] = useState(null);

  // ==================== API HELPERS - CUSTOMER DOCUMENT NAMES ====================
  
  // Get all customer document names
  const fetchCustomerDocumentNames = useCallback(async () => {
    setIsLoadingCustomerDocuments(true);
    setCustomerDocumentsError(null);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/realEstateCustomerDocumentNames/getDocumentNamesList`,
        {
          headers: {
            secret_key: secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      setCustomerDocumentNames(response.data || []);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch customer document names';
      setCustomerDocumentsError(errorMessage);
      console.error('Error fetching customer document names:', error);
      throw error;
    } finally {
      setIsLoadingCustomerDocuments(false);
    }
  }, []);

  // Get customer document name by ID
  const getCustomerDocumentNameById = useCallback(async (id) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.get(
        `${API_BASE_URL}/realEstateCustomerDocumentNames/getDocumentName/${id}`,
        {
          headers: {
            secret_key: secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch customer document name';
      console.error('Error fetching customer document name by ID:', error);
      throw new Error(errorMessage);
    }
  }, []);

  // Add new customer document name
  const addCustomerDocumentName = useCallback(async (documentData) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const payload = {
        documentName: documentData.documentName,
        description: documentData.description || null
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/realEstateCustomerDocumentNames/saveDocumentName`,
        payload,
        {
          headers: {
            secret_key: secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      
      // Refresh the list after adding
      await fetchCustomerDocumentNames();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add customer document name';
      console.error('Error adding customer document name:', error);
      throw new Error(errorMessage);
    }
  }, [fetchCustomerDocumentNames]);

  // Update existing customer document name
  const updateCustomerDocumentName = useCallback(async (documentData) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const payload = {
        id: documentData.id,
        documentName: documentData.documentName,
        description: documentData.description || null
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/realEstateCustomerDocumentNames/saveDocumentName`,
        payload,
        {
          headers: {
            secret_key: secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      
      // Refresh the list after updating
      await fetchCustomerDocumentNames();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer document name';
      console.error('Error updating customer document name:', error);
      throw new Error(errorMessage);
    }
  }, [fetchCustomerDocumentNames]);

  // Delete customer document name
  const deleteCustomerDocumentName = useCallback(async (id) => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      const response = await axios.delete(
        `${API_BASE_URL}/realEstateCustomerDocumentNames/deleteDocumentName/${id}`,
        {
          headers: {
            secret_key: secretKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      
      // Refresh the list after deleting
      await fetchCustomerDocumentNames();
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete customer document name';
      console.error('Error deleting customer document name:', error);
      throw new Error(errorMessage);
    }
  }, [fetchCustomerDocumentNames]);

  // ==================== BUSINESS LOGIC - CUSTOMER DOCUMENT NAMES ====================

  // Handle add customer document name with UI feedback
  const handleAddCustomerDocumentName = useCallback(async (documentData, onSuccess) => {
    try {
      await addCustomerDocumentName(documentData);
      Alert.alert('Success', 'Customer document name added successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [addCustomerDocumentName]);

  // Handle update customer document name with UI feedback
  const handleUpdateCustomerDocumentName = useCallback(async (documentData, onSuccess) => {
    try {
      await updateCustomerDocumentName(documentData);
      Alert.alert('Success', 'Customer document name updated successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [updateCustomerDocumentName]);

  // Handle delete customer document name with confirmation
  const handleDeleteCustomerDocumentName = useCallback(async (id, documentName) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${documentName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomerDocumentName(id);
              Alert.alert('Success', 'Customer document name deleted successfully');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  }, [deleteCustomerDocumentName]);

  // ==================== INITIAL DATA FETCH ====================
  useEffect(() => {
    fetchCustomerDocumentNames();
  }, [fetchCustomerDocumentNames]);

  return {
    // Customer Document Names
    customerDocumentNames,
    isLoadingCustomerDocuments,
    customerDocumentsError,
    fetchCustomerDocumentNames,
    getCustomerDocumentNameById,
    addCustomerDocumentName,
    updateCustomerDocumentName,
    deleteCustomerDocumentName,
    handleAddCustomerDocumentName,
    handleUpdateCustomerDocumentName,
    handleDeleteCustomerDocumentName,
  };
};

export default useCRM;
