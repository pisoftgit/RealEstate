// hooks/useProject.jsx
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../services/api';

const useProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      console.log("Secret Key:", secretKey);

      const res = await fetch(`${API_BASE_URL}/real-estate-projects/getAllProjects`, {
        headers: {
          secret_key: secretKey,
        },
      });

      const data = await res.json();
      console.log("API Response:", data);

      // Map data to a simplified structure
      const list = data.data || data; // handle both {data: [...]} and [...] formats
      if (Array.isArray(list)) {
        const mappedList = list.map((item) => ({
          id: item.id?.toString(),
          name: item.projectName,
          projectName: item.projectName,
          isReraApproved: item.isReraApproved,
          projectStartDate: item.projectStartDate,
          projectCompletionDate: item.projectCompletionDate,
          totalArea: item.totalArea,
          description: item.description,
          possessionStatusEnum: item.possessionStatusEnum,
          areaUnitName: item.areaUnitName,
          builderName: item.builderName,
          builderId: item.builderId,
          isGated: item.isGated,
          reraId: item.reraId,
          reraNumber: item.reraNumber,
          areaUnitId: item.areaUnitId,
          address1: item.address1,
          address2: item.address2,
          city: item.city,
          pincode: item.pincode,
          districtId: item.districtId,
          stateId: item.stateId,
          countryId: item.countryId,
          plcIds: item.plcIds,
          mediaDTOs: item.mediaDTOs,
        }));
        setProjects(mappedList);
      } else {
        setProjects([]); // fallback to empty if not array
      }
    } catch (error) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, projectData) => {
    setUpdateLoading(true);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      console.log("Updating project with ID:", id);
      console.log("Project Data:", projectData);

      const res = await fetch(`${API_BASE_URL}/real-estate-projects/updateProject/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          secret_key: secretKey,
        },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();
      console.log("Update API Response:", data);

      if (res.ok) {
        // Refresh the projects list after successful update
        await fetchProjects();
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to update project' };
      }
    } catch (error) {
      console.error('Error updating project:', error.message);
      return { success: false, error: error.message };
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setDeleteLoading(true);
    try {
      const secretKey = await SecureStore.getItemAsync('auth_token');
      console.log("Deleting project with ID:", id);

      const res = await fetch(`${API_BASE_URL}/real-estate-projects/deleteProject/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          secret_key: secretKey,
        },
      });

      console.log("Delete Response Status:", res.status);
      console.log("Delete Response OK:", res.ok);

      // Check if response is successful
      if (res.ok) {
        // Try to parse JSON, but handle if response is empty or plain text
        let data;
        const contentType = res.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            data = await res.json();
          } else {
            data = await res.text();
          }
          console.log("Delete API Response:", data);
        } catch (parseError) {
          console.log("Could not parse response, but deletion was successful");
          data = { message: 'Project deleted successfully' };
        }

        // Refresh the projects list after successful deletion
        await fetchProjects();
        return { success: true, data };
      } else {
        // Handle error response
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: await res.text() || 'Failed to delete project' };
        }
        console.log("Delete Error Response:", errorData);
        return { success: false, error: errorData.message || 'Failed to delete project' };
      }
    } catch (error) {
      console.error('Error deleting project:', error.message);
      return { success: false, error: error.message };
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { 
    projects, 
    loading, 
    updateProject, 
    updateLoading, 
    deleteProject, 
    deleteLoading, 
    refetch: fetchProjects 
  };
};

export default useProject;
