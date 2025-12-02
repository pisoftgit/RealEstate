import { useState } from 'react';
import api from '../services/api';

const useGeneral = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

      const response = await api.post('/organization/save', payload);
      
      setSuccess(true);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save organization');
      setLoading(false);
      throw err;
    }
  };

  return {
    saveOrganization,
    loading,
    error,
    success,
  };
};

export default useGeneral;
