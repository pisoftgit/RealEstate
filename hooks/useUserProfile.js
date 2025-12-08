import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import * as SecureStore from 'expo-secure-store';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userId = await SecureStore.getItemAsync('userid');
        
        if (userId) {
          const data = await getUserProfile(userId);
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { profile, loading, error };
};
