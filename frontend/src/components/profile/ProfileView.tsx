// PATH: src/components/profile/ProfileView.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileView.css';

interface Profile {
  fullName: string;
  title: string;
  affiliation: string;
  hIndex: number;
  bio: string;
  website: string;
  researchInterests: string[];
  awards: string[];
  socialLinks: {
    orcid: string;
    googleScholar: string;
    linkedIn: string;
    github: string;
  };
}

const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem(`profile_${user?.id}`);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          // Default profile with user's basic info
          setProfile({
            fullName: user?.name || 'Your Name',
            title: '',
            affiliation: '',
            hIndex: 0,
            bio: '',
            website: '',
            researchInterests: [],
            awards: [],
            socialLinks: {
              orcid: '',
              googleScholar: '',
              linkedIn: '',
              github: ''
            }
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [user?.id, user?.name]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-empty">
        <div className="empty-icon">👤</div>
        <h2>No Profile Found</h2>
        <p>Create your researcher profile to get started.</p>
        <Link to="/profile/edit" className="create-profile-btn">
          Create Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-view">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {(profile.fullName || 'U').charAt(0).toUpperCase()}
          </div>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
          <h1 className="profile-name">{profile.fullName}</h1>
        </div>
        
        <div className="profile-info">
          {profile.title && <p className="profile-title">{profile.title}</p>}
          {profile.affiliation && <p className="profile-affiliation">{profile.affiliation}</p>}
          
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">H-Index</span>
              <span className="stat-value">{profile.hIndex}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <Link to="/profile/edit" className="edit-btn">
            <span className="edit-icon">✏️</span>
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="profile-content">
        {/* Research Interests Section */}
        <div className="content-section">
          <div className="section-header">
            <h2>Research Interests</h2>
          </div>
          <div className="section-body">
            {profile.researchInterests?.length ? (
              <div className="tags-container">
                {profile.researchInterests.map((interest, index) => (
                  <span key={index} className="research-tag">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No research interests listed yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Awards Section */}
        <div className="content-section">
          <div className="section-header">
            <h2>Awards & Recognition</h2>
          </div>
          <div className="section-body">
            {profile.awards?.length ? (
              <div className="awards-list">
                {profile.awards.map((award, index) => (
                  <div key={index} className="award-item">
                    <span className="award-icon"></span>
                    <span className="award-text">{award}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No awards listed yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Links Section */}
        <div className="content-section">
          <div className="section-header">
            <h2>Professional Links</h2>
          </div>
          <div className="section-body">
            <div className="links-grid">
              {profile.website && (
                <a href={profile.website} className="link-item" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">🌐</span>
                  <span className="link-text">Personal Website</span>
                  <span className="link-arrow">→</span>
                </a>
              )}
              {profile.socialLinks.orcid && (
                <a href={`${profile.socialLinks.orcid}`} className="link-item" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">🔬</span>
                  <span className="link-text">ORCID Profile</span>
                  <span className="link-arrow">→</span>
                </a>
              )}
              {profile.socialLinks.googleScholar && (
                <a href={`${profile.socialLinks.googleScholar}`} className="link-item" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">📚</span>
                  <span className="link-text">Google Scholar</span>
                  <span className="link-arrow">→</span>
                </a>
              )}
              {profile.socialLinks.linkedIn && (
                <a href={`${profile.socialLinks.linkedIn}`} className="link-item" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">💼</span>
                  <span className="link-text">LinkedIn</span>
                  <span className="link-arrow">→</span>
                </a>
              )}
              {profile.socialLinks.github && (
                <a href={`${profile.socialLinks.github}`} className="link-item" target="_blank" rel="noopener noreferrer">
                  <span className="link-icon">💻</span>
                  <span className="link-text">GitHub</span>
                  <span className="link-arrow">→</span>
                </a>
              )}
            </div>
            {!profile.website && !profile.socialLinks.orcid && !profile.socialLinks.googleScholar && !profile.socialLinks.linkedIn && !profile.socialLinks.github && (
              <div className="empty-state">
                <p>No professional links added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
