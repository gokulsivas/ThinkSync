import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar"; // Update path as needed
import { Profile } from "../../types/profile";
import "./ProfileView.css";

interface ProfileViewProps {
  profile?: Profile;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile: propProfile }) => {
  const [profile, setProfile] = useState<Profile | null>(propProfile || null);
  const [loading, setLoading] = useState(!propProfile);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch profile data from backend if not provided as prop
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Transform backend data to match Profile interface
          // Transform backend data to match Profile interface
          const profileData: Profile = {
            id: data.user.id || '1', // ✅ Add required id property
            name: data.user.name || 'Unknown User',
            title: data.user.title || 'Researcher',
            affiliation: data.user.affiliation || 'Independent Researcher',
            // hIndex is optional - can be omitted
            researchInterests: data.user.researchInterests || ['Data Science', 'Machine Learning'],
            awards: data.user.awards || [],
            publications: data.user.publications || [], // ✅ Add required publications property
            socialLinks: data.user.socialLinks || {
              orcid: '',
              googleScholar: '',
              linkedIn: '',
              github: ''
            },
            isPublic: data.user.isPublic || true
          };

          
          setProfile(profileData);
        } else if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!propProfile) {
      fetchProfile();
    }
  }, [propProfile, navigate]);

  // Helper function to ensure URL has protocol
  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <div className="loading-spinner">Loading profile...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <div className="error-message">
            <h3>Profile Not Found</h3>
            <p>Unable to load profile information.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-basic-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-title">{profile.title}</p>
            <p className="profile-affiliation">
              <span className="icon">🏛</span>
              {profile.affiliation}
            </p>
            
            {/* H-Index - Only show if profile is public */}
            {profile.isPublic && profile.hIndex !== null && profile.hIndex !== undefined && (
              <div className="h-index-badge">
                <span className="h-index-label">H-Index:</span>
                <span className="h-index-value">{profile.hIndex}</span>
              </div>
            )}
          </div>
          <div className="profile-visibility">
            <span className={`visibility-badge ${profile.isPublic ? 'public' : 'private'}`}>
              {profile.isPublic ? '🗺 Public' : '🔒 Private'}
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="profile-content">
          {/* Research Interests - Always visible */}
          <div className="profile-section">
            <h3 className="section-title">
              <span className="section-icon">🔬</span>
              Research Interests
            </h3>
            <div className="tags-container">
              {profile.researchInterests.map((interest, idx) => (
                <span key={idx} className="tag research-tag">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div className="profile-section">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              Account Information
            </h3>
            <div className="account-info">
              <p><strong>Email:</strong> {profile.name.toLowerCase().replace(/\s+/g, '.') + '@example.com'}</p>
              <p><strong>Role:</strong> Researcher</p>
              <p><strong>Profile Status:</strong> {profile.isPublic ? 'Public' : 'Private'}</p>
            </div>
          </div>

          {/* Awards - Only show if profile is public */}
          {profile.isPublic && profile.awards && profile.awards.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">
                <span className="section-icon">🏆</span>
                Awards & Achievements
              </h3>
              <div className="awards-list">
                {profile.awards.map((award, idx) => (
                  <div key={idx} className="award-item">
                    <span className="award-icon">🎖</span>
                    <span className="award-text">{award}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links - Only show if profile is public */}
          {profile.isPublic && profile.socialLinks && (profile.socialLinks.orcid || 
            profile.socialLinks.googleScholar || profile.socialLinks.linkedIn || 
            profile.socialLinks.github) && (
            <div className="profile-section">
              <h3 className="section-title">
                <span className="section-icon">🔗</span>
                Academic & Social Links
              </h3>
              <div className="social-links">
                {profile.socialLinks.orcid && (
                  <a 
                    href={ensureProtocol(profile.socialLinks.orcid)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link orcid-link"
                  >
                    <img 
                      src="/images/orcid-icon.jpg" 
                      alt="ORCID" 
                      className="link-icon-img" 
                    />
                    ORCID
                  </a>
                )}
                {profile.socialLinks.googleScholar && (
                  <a 
                    href={ensureProtocol(profile.socialLinks.googleScholar)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link scholar-link"
                  >
                    <img 
                      src="/images/google-scholar-icon.jpg" 
                      alt="Google Scholar" 
                      className="link-icon-img" 
                    />
                    Google Scholar
                  </a>
                )}
                {profile.socialLinks.linkedIn && (
                  <a 
                    href={ensureProtocol(profile.socialLinks.linkedIn)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link linkedin-link"
                  >
                    <img 
                      src="/images/linkedin-icon.jpg" 
                      alt="LinkedIn" 
                      className="link-icon-img" 
                    />
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a 
                    href={ensureProtocol(profile.socialLinks.github)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link github-link"
                  >
                    <img 
                      src="/images/github-icon.jpg" 
                      alt="GitHub" 
                      className="link-icon-img" 
                    />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Private Profile Message */}
          {!profile.isPublic && (
            <div className="profile-section private-message">
              <h3 className="section-title">
                <span className="section-icon">🔒</span>
                Private Profile
              </h3>
              <p className="private-text">
                This profile is set to private. Only you can see the full details.
              </p>
            </div>
          )}

          {/* Actions Section */}
          <div className="profile-section profile-actions">
            <h3 className="section-title">
              <span className="section-icon">⚙️</span>
              Profile Actions
            </h3>
            <div className="action-buttons">
              <button className="action-btn edit-btn" onClick={() => navigate('/profile/edit')}>
                ✏️ Edit Profile
              </button>
              <button className="action-btn settings-btn" onClick={() => navigate('/settings')}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileView;
