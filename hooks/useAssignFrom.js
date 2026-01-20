import { useCallback, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../services/api';

// APIs
const API_BASE = `${API_BASE_URL}/assign-property/getAssignedFromByLevel`;
const SELLERS_API = `${API_BASE_URL}/business-nature/getAllSellers`;
const SELLERS_BY_TYPE_API = `${API_BASE_URL}/builders/getSellersBySellerTypeId`;
const PROJECTS_BY_BUILDER_API = `${API_BASE_URL}/assign-property/getProjectsByBuilderId`;
const PROPERTY_TYPES_FOR_ASSIGNMENTS_API =
  `${API_BASE_URL}/assign-property/getPropertyTypesForAssignments`;
const SUB_PROPERTY_TYPES_FOR_ASSIGNMENTS_API =
  `${API_BASE_URL}/assign-property/getSubPropertyTypesForAssignments`;

const SUB_PROPERTY_TYPE_BY_ID_API = `${API_BASE_URL}/sub-property-types/getSubPropertyTypeById`;

const DISTINCT_TOWER_PROPERTY_ITEMS_API = `${API_BASE_URL}/assign-property/getDistinctTowerPropertyItemsForAssignments`;

const DISTINCT_STRUCTURES_API = `${API_BASE_URL}/assign-property/getDistinctStructuresForAssignments`;

const UNITS_FOR_ASSIGNMENTS_API = `${API_BASE_URL}/assign-property/getUnitsForAssignments`;

const ALL_DURATION_UNITS_API = `${API_BASE_URL}/assign-property/getAllDurationUnits`;
const ASSIGN_PROPERTY_API = `${API_BASE_URL}/assign-property`;

const useAssignFrom = () => {
  const [loading, setLoading] = useState(false);
  const [assignedFrom, setAssignedFrom] = useState([]);
  const [error, setError] = useState(null);

  // Common error handler (MUST be before use)
  const handleError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;

    if (error?.response?.data) {
      errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error(defaultMessage, error);
    setError(errorMessage);
    setLoading(false);
    Alert.alert('❌ Error', errorMessage);
    throw error;
  };

  // Fetch all sellers
  const getAllSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) throw new Error('Missing authentication token');

      const response = await axios.get(SELLERS_API, {
        headers: {
          'Content-Type': 'application/json',
          secret_key: authToken,
        },
      });

      setLoading(false);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch sellers.');
    }
  }, []);

  // Fetch assigned from by level and userId
  const getAssignedFrom = useCallback(async (level, userId) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) throw new Error('Missing authentication token');
      if (!level || !userId) throw new Error('Level and userId are required');

      const response = await axios.get(
        `${API_BASE}/${level}/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: authToken,
          },
        }
      );

      const data = response.data;
      if (Array.isArray(data)) setAssignedFrom(data);
      else if (Array.isArray(data?.data)) setAssignedFrom(data.data);
      else setAssignedFrom([]);

      setLoading(false);
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch assigned from.');
    }
  }, []);

  // Fetch sellers by businessNatureId
  const getSellersBySellerTypeId = useCallback(async (businessNatureId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) throw new Error('Missing authentication token');
      if (!businessNatureId || !userId) {
        throw new Error('businessNatureId and userId are required');
      }

      const response = await axios.get(
        `${SELLERS_BY_TYPE_API}/${businessNatureId}/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: authToken,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch sellers by type.');
    }
  }, []);

  // Fetch projects by builderId
  const getProjectsByBuilderId = useCallback(async (builderId, level) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) throw new Error('Missing authentication token');
      if (!builderId || !level) {
        throw new Error('builderId and level are required');
      }

      const response = await axios.get(
        `${PROJECTS_BY_BUILDER_API}/${builderId}/${level}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: authToken,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch projects by builder.');
    }
  }, []);

  // Fetch property types
  const getPropertyTypesForAssignments = useCallback(async (realtorId, projectId, level) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) throw new Error('Missing authentication token');
      if (!realtorId || !projectId || !level) {
        throw new Error('realtorId, projectId, and level are required');
      }

      const response = await axios.get(
        `${PROPERTY_TYPES_FOR_ASSIGNMENTS_API}/${realtorId}/${projectId}/${level}`,
        {
          headers: {
            'Content-Type': 'application/json',
            secret_key: authToken,
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch property types for assignments.');
    }
  }, []);

  // Fetch sub property types
  const getSubPropertyTypesForAssignments = useCallback(
    async (realtorId, projectId, propertyTypeId, level) => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');
        if (!realtorId || !projectId || !propertyTypeId || !level) {
          throw new Error('All parameters are required');
        }

        const response = await axios.get(
          `${SUB_PROPERTY_TYPES_FOR_ASSIGNMENTS_API}/${realtorId}/${projectId}/${propertyTypeId}/${level}`,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );

        setLoading(false);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to fetch sub property types for assignments.');
      }
    },
    []
  );

  // Fetch sub property type by id
  const getSubPropertyTypeById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');
        if (!id) throw new Error('id is required');

        const response = await axios.get(
          `${SUB_PROPERTY_TYPE_BY_ID_API}/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );

        setLoading(false);
        console.log('Sub Property Type by ID Response:', response.data);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to fetch sub property type by id.');
      }
    },
    []
  );

  // Fetch distinct tower property items for assignments
  const getDistinctTowerPropertyItemsForAssignments = useCallback(
    async (projectId, subPropertyTypeId, level, realtorId) => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');
        if (!projectId || !subPropertyTypeId || !level || !realtorId) {
          throw new Error('All parameters are required');
        }

        const response = await axios.get(
          `${DISTINCT_TOWER_PROPERTY_ITEMS_API}/${projectId}/${subPropertyTypeId}/${level}/${realtorId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );

        setLoading(false);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to fetch distinct tower property items for assignments.');
      }
    },
    []
  );

  // Fetch distinct structures for assignments
  const getDistinctStructuresForAssignments = useCallback(
    async (projectId, subPropertyTypeId, towerItemId, level, realtorId) => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');
        if (!projectId || !subPropertyTypeId || !towerItemId || !level || !realtorId) {
          throw new Error('All parameters are required');
        }

        const response = await axios.get(
          `${DISTINCT_STRUCTURES_API}/${projectId}/${subPropertyTypeId}/${towerItemId}/${level}/${realtorId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );

        setLoading(false);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to fetch distinct structures for assignments.');
      }
    },
    []
  );

  // Fetch units for assignments
  const getUnitsForAssignments = useCallback(
    async (projectId, subPropertyTypeId, structureId, towerItemId, level, realtorId) => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');
        if (!projectId || !subPropertyTypeId || !structureId || !level || !realtorId) {
          throw new Error('Required parameters are missing');
        }

        // towerItemId can be null
        const towerParam = towerItemId === null ? 'null' : towerItemId;

        const response = await axios.get(
          `${UNITS_FOR_ASSIGNMENTS_API}/${projectId}/${subPropertyTypeId}/${structureId}/${towerParam}/${level}/${realtorId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );

        setLoading(false);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to fetch units for assignments.');
      }
    },
    []
  );

  // Fetch all duration units
  const getAllDurationUnits = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');

        const response = await axios.get(
          ALL_DURATION_UNITS_API,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );

        setLoading(false);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to fetch duration units.');
      }
    },
    []
  );

  // Assign property (POST)
  const assignProperty = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) throw new Error('Missing authentication token');
        const response = await axios.post(
          ASSIGN_PROPERTY_API,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              secret_key: authToken,
            },
          }
        );
        setLoading(false);
        return response.data;
      } catch (error) {
        handleError(error, 'Failed to assign property.');
      }
    },
    []
  );

  return {
    loading,
    error,
    assignedFrom,
    getAssignedFrom,
    getAllSellers,
    getSellersBySellerTypeId,
    getProjectsByBuilderId,
    getPropertyTypesForAssignments,
    getSubPropertyTypesForAssignments,
    getSubPropertyTypeById,
    getDistinctTowerPropertyItemsForAssignments,
    getDistinctStructuresForAssignments,
    getUnitsForAssignments,
    getAllDurationUnits,
    assignProperty,
  };
};

export default useAssignFrom;
