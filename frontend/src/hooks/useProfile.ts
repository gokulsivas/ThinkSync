import { useState, useEffect } from 'react';
import { Profile } from '../types/profile';

export const useProfile = (profileId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (id?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      
      // ✅ DEBUG: Check if token exists
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Token preview:', token?.substring(0, 20) + '...');
      
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }
      
      const url = id 
        ? `http://localhost:8000/api/profile/${id}`
        : 'http://localhost:8000/api/profile';
        
      console.log('🔍 Fetching from URL:', url);
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        throw new Error('Authentication expired. Please login again.');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden. You may not have permission to view this profile.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Error response:', errorText);
        throw new Error(`Failed to fetch profile: ${response.status} - ${errorText}`);
      }

      const profileData = await response.json();
      console.log('🔍 Profile data received:', profileData);
      setProfile(profileData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('❌ Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedProfile: Profile): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No authentication token found. Please login.');
        return false;
      }
      
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfile)
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        setError('Authentication expired. Please login again.');
        return false;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${response.status} - ${errorText}`);
      }

      const savedProfile = await response.json();
      setProfile(savedProfile);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      console.error('Profile update error:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile(profileId);
  }, [profileId]);

  return {
    profile,
    loading,
    error,
    refetch: () => fetchProfile(profileId),
    updateProfile,
    setProfile
  };
};
