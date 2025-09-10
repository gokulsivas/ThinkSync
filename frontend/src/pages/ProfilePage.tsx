import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import './ProfilePage.css';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  title?: string;
  affiliation?: string;
  role: string;
  hIndex?: number;
  researchInterests: string[];
  awards: string[];
  publications: any[];
  socialLinks: {
    orcid?: string;
    googleScholar?: string;
    linkedIn?: string;
    github?: string;
  };
  isPublic: boolean;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        console.log('🔍 [PROFILE] Fetching profile data...');

        const response = await fetch('http://localhost:8000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [PROFILE] Profile data fetched successfully');

          // Transform backend data to match ProfileData interface
          const transformedProfile: ProfileData = {
            id: data.user.id || user.id,
            name: data.user.name || user.name,
            email: data.user.email || user.email,
            title: data.user.title || user.title,
            affiliation: data.user.affiliation || user.affiliation,
            role: data.user.role || user.role,
            hIndex: data.user.hIndex,
            researchInterests: data.user.researchInterests || [],
            awards: data.user.awards || [],
            publications: data.user.publications || [],
            socialLinks: data.user.socialLinks || {
              orcid: '',
              googleScholar: '',
              linkedIn: '',
              github: ''
            },
            isPublic: data.user.isPublic !== undefined ? data.user.isPublic : true
          };

          setProfileData(transformedProfile);
        } else if (response.status === 401) {
          setError('Authentication expired. Please log in again.');
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        console.error('❌ [PROFILE] Error fetching profile:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-icon">⚠️</div>
        <h2>Unable to Load Profile</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <div className="error-icon">👤</div>
        <h2>Profile Not Found</h2>
        <p>Unable to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-title">{profileData.title || 'Researcher'}</p>
            <p className="profile-affiliation">{profileData.affiliation || 'Independent Researcher'}</p>
            <div className="profile-badges">
              <span className="badge">{profileData.role}</span>
              {profileData.isPublic && <span className="badge public">Public Profile</span>}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Basic Information */}
          <div className="profile-section">
            <h2>Basic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Email:</strong>
                <span>{profileData.email}</span>
              </div>
              <div className="info-item">
                <strong>Role:</strong>
                <span>{profileData.role}</span>
              </div>
              {profileData.hIndex && (
                <div className="info-item">
                  <strong>H-Index:</strong>
                  <span className="h-index-value">{profileData.hIndex}</span>
                </div>
              )}
            </div>
          </div>

          {/* Research Interests */}
          {profileData.researchInterests.length > 0 && (
            <div className="profile-section">
              <h2>Research Interests</h2>
              <div className="tags">
                {profileData.researchInterests.map((interest, index) => (
                  <span key={index} className="tag">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {profileData.awards.length > 0 && (
            <div className="profile-section">
              <h2>Awards & Achievements</h2>
              <ul className="awards-list">
                {profileData.awards.map((award, index) => (
                  <li key={index}>{award}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Publications */}
          <div className="profile-section">
            <h2>Publications</h2>
            {profileData.publications.length > 0 ? (
              <div className="publications-list">
                {profileData.publications.map((pub, index) => (
                  <div key={index} className="publication-item">
                    <h3>{pub.title}</h3>
                    {pub.doi && <p><strong>DOI:</strong> {pub.doi}</p>}
                    {pub.url && (
                      <a href={pub.url} target="_blank" rel="noopener noreferrer">
                        View Publication
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No publications added yet.</p>
            )}
          </div>

          {/* Social Links */}
          <div className="profile-section">
            <h2>Academic Profiles</h2>
            <div className="social-links">
              {profileData.socialLinks.orcid && (
                <a href={profileData.socialLinks.orcid} target="_blank" rel="noopener noreferrer" className="social-link">
                  🆔 ORCID
                </a>
              )}
              {profileData.socialLinks.googleScholar && (
                <a href={profileData.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer" className="social-link">
                  🎓 Google Scholar
                </a>
              )}
              {profileData.socialLinks.linkedIn && (
                <a href={profileData.socialLinks.linkedIn} target="_blank" rel="noopener noreferrer" className="social-link">
                  💼 LinkedIn
                </a>
              )}
              {profileData.socialLinks.github && (
                <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
                  💻 GitHub
                </a>
              )}
              {!Object.values(profileData.socialLinks).some(link => link) && (
                <p className="no-data">No academic profiles linked yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;