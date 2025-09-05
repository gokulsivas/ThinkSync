import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileView from "../components/profile/ProfileView";
import ProfileEdit from "../components/profile/ProfileEdit";
import { fetchProfile, updateProfile } from "../services/api";
import { Profile } from "../types/profile";
import "./ProfilePage.css";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const userId = "user-123";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const profileData = await fetchProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async (updatedProfile: Profile) => {
    try {
      await updateProfile(userId, updatedProfile);
      setProfile(updatedProfile);
      setEditing(false);
      setTimeout(() => {
        loadProfile();
      }, 500);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      {editing ? (
        <div className="edit-container">
          <div className="edit-header">
            <h2>🖊 Edit Profile</h2>
            <button 
              className="btn btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
          <ProfileEdit initialProfile={profile} onSave={handleSave} />
        </div>
      ) : (
        <>
          <ProfileView profile={profile} />
          <div className="profile-actions">
            <button 
              className="btn btn-primary edit-btn"
              onClick={() => setEditing(true)}
            >
              🖊 Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
