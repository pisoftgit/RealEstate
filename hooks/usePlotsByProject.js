import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const usePlotsByProject = (projectId) => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // API Functions
  const getAllSerialisedPlotsByProjectId = async (projectId) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(
      `${API_BASE_URL}/plots/getAllSerialisedPlotsByProjectId/projectId/${projectId}`,
      {
        method: "GET",
        headers: {
          secret_key: secretKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch plots");
    }

    return await response.json();
  };

  const savePlotDetailsAPI = async (plotId, plotDetailsData) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(
      `${API_BASE_URL}/plots/savePlotDetails`,
      {
        method: "POST",
        headers: {
          secret_key: secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unitIds: [plotId],
          ...plotDetailsData,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to save plot details");
    }

    return await response.json();
  };

  const deletePlotAPI = async (plotId) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(
      `${API_BASE_URL}/plots/deletePlot/${plotId}`,
      {
        method: "DELETE",
        headers: {
          secret_key: secretKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete plot");
    }

    return { success: true };
  };

  const savePlotPlcDetailsAPI = async (plotId, plcDetailsData) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(
      `${API_BASE_URL}/plcDetails/savePlotPlcDetails`,
      {
        method: "POST",
        headers: {
          secret_key: secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: plotId,
          plcDetails: plcDetailsData,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to save plot PLC details");
    }

    return await response.json();
  };

  const getPlotDetailsForPlcAPI = async (plotId) => {
    const secretKey = await SecureStore.getItemAsync("auth_token");
    const response = await fetch(
      `${API_BASE_URL}/plots/getPlotDetails/${plotId}`,
      {
        method: "GET",
        headers: {
          secret_key: secretKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch plot details");
    }

    return await response.json();
  };

  // Fetch all plots for the project
  const fetchPlots = async () => {
    if (!projectId) {
      console.log('No project ID provided');
      return;
    }

    setLoading(true);
    try {
      const data = await getAllSerialisedPlotsByProjectId(projectId);
      setPlots(data || []);
    } catch (error) {
      console.error('Error fetching plots:', error);
      Alert.alert('Error', 'Failed to fetch plots');
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plots on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchPlots();
    }
  }, [projectId]);

  // Save plot details
  const savePlotDetailsData = async (plotIds, plotDetailsData) => {
    setSaving(true);
    setSaveError(null);
    
    try {
      const results = await Promise.all(
        plotIds.map(plotId => savePlotDetailsAPI(plotId, plotDetailsData))
      );
      
      // Refresh the plots list after saving
      await fetchPlots();
      
      return { success: true, results };
    } catch (error) {
      console.error('Error saving plot details:', error);
      setSaveError(error.message || 'Failed to save plot details');
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // Update plot details
  const updatePlotDetailsData = async (plotId, plotDetailsData) => {
    setSaving(true);
    setSaveError(null);
    
    try {
      const result = await savePlotDetailsAPI(plotId, plotDetailsData);
      
      // Refresh the plots list after updating
      await fetchPlots();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating plot details:', error);
      setSaveError(error.message || 'Failed to update plot details');
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // Delete plot
  const deletePlotData = async (plotId) => {
    setSaving(true);
    setSaveError(null);
    
    try {
      await deletePlotAPI(plotId);
      
      // Refresh the plots list after deletion
      await fetchPlots();
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting plot:', error);
      setSaveError(error.message || 'Failed to delete plot');
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // Save plot PLC details
  const savePlotPlcDetailsData = async (plotId, plcDetailsData) => {
    setSaving(true);
    setSaveError(null);
    
    try {
      const result = await savePlotPlcDetailsAPI(plotId, plcDetailsData);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving plot PLC details:', error);
      setSaveError(error.message || 'Failed to save plot PLC details');
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  // Fetch plot details for PLC
  const fetchPlotDetailsForPlc = async (plotId) => {
    try {
      const data = await getPlotDetailsForPlcAPI(plotId);
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching plot details for PLC:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    plots,
    loading,
    saving,
    saveError,
    fetchPlots,
    savePlotDetails: savePlotDetailsData,
    updatePlotDetails: updatePlotDetailsData,
    deletePlot: deletePlotData,
    savePlotPlcDetails: savePlotPlcDetailsData,
    fetchPlotDetailsForPlc
  };
};

export default usePlotsByProject;
