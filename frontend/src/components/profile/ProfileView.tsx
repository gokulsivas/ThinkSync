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
    <div className="profile-bg">
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
              <span className="edit-icon">✎</span>
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
                    <img 
                      className="link-icon" 
                      src="data:image/png;base64,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" 
                      alt="GitHub Icon" 
                    />
                    <span className="link-text">ORCID Profile</span>
                    <span className="link-arrow">→</span>
                  </a>
                )}
                {profile.socialLinks.googleScholar && (
                  <a href={`${profile.socialLinks.googleScholar}`} className="link-item" target="_blank" rel="noopener noreferrer">
                    <img 
                      className="link-icon" 
                      src="data:image/png;base64,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" 
                      alt="GitHub Icon" 
                    />
                    <span className="link-text">Google Scholar</span>
                    <span className="link-arrow">→</span>
                  </a>
                )}
                {profile.socialLinks.linkedIn && (
                  <a href={`${profile.socialLinks.linkedIn}`} className="link-item" target="_blank" rel="noopener noreferrer">
                    <img 
                      className="link-icon" 
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAdVBMVEUKZsL///8AZME7eMgAWb7i6fUAXL/Az+oAYsFjj9B1m9QAYMBGgswAVr0AXb8AWr5ZjdBWh80ZbMTO3PCzx+drl9T2+f2Ssd7G1u0dbsXF1e3w9fs2dsfl7ffV4fIocsaApNmowOSMrNyrw+Wbt+AAUryFqNr2AL+0AAADz0lEQVR4nO3ca1+qMACAcZiA5ATMW+a98vT9P+LROkXiNruMLXae/2v1xyOy6QCjCAAAAAAAAAAAAAAAAAAAALBGnPjeiPbkZSJ36/W4qmSQlbIYTTfxyXx72CXBNYpkv4o/mAwDayx7m7hhWoWUWM2afUebcTiJ5UAReDweo1AS5VAZeNyLgXxQhZxrCo/Hou+NsyJ70AXGcS+EnSgifWC8SHxvngXyzlAYhzCeJqmp8FH63r4fE8IUGC+6P9YI3VTxatP9AzFXz/bvCt8b+GNyT2HX5aov3UEVip4xMO3+SBNlxsJp6Xv7fq5amApn3Z/xzQfivAzgW1tUrPSFDwF8SM1zfiDLisUk5KPwREjN5/QpgKnilbhXrmP0uz/bvxPR9jLwEFDgacm7+Ut/c5v53ijLSvHw4WhMB0Xue4usE2U1vOtv03Qy3e+S8PpeCJlVSZKVgcyCAIDfT+SyrI6Ok0+As4+QVbGbHabLxWTRf7qb7YrMa6XIdZpbpX3k2QPzSuyXjV8rk8dd4i1SjG90bs+3SQx1D7yvH5gnt0vlr830ufK06mNYMW2cl8nUm370/laIYmQ4W3covSwaGAob68FZ/1phudOuiLyYDwoPu9FeoSiejX0nE+H+Z4u1QiHNO/DVfOh8hdJWYT42LLx+NHN9XtlSoVxrL8tpGjheILFTqFmvU7txO6RaKZT5Jz+ir9xeiWSl8M9nBpnayunVqzYKh9eniXNTl8vpVvbhFwOP74nDadFG4RdGmbeXdriibqPwG2budqKnQofXQHgqjIfOhlNfhX1nX958FcaZq53ordDZOXRvhVNXX8DtF87TNP3EDLlyNZpaLlwOxkWSJIWYXX20q4vIrRY+jat/S4tCVmPjBWXuDkSLhave2V02ojDeBxAfHK1n2CvcZs1vYhcXQJxZOhpqrBWqvofpr7fSPOE3F84vTgKcXvze9AxHvy9sFY6U40Zleo6jMxmWChfqHWK8n8PRdGGpULe4lBiWqHZdKtzqRg3TkxwtudkpfNbN3tKwSNWpQu0hJQyrVF0q3GgHftPNcV0qXOp/sBdhFBou6jcMpl0qNNxrmlz8XUMnC/fBFw7067uGG40ptITCGoVqFLaPwhqFahS2j8IahWoUto/CGoVqFLaPwhqFahS2j8IahWoUto/CGoVqFLaPwhqFahS2j8IahWoUto/CGoVqFLaPwlqAhc1/4NHfx2Qq9H7lXhT1dNaNf1HqDc/djt4YrroXa+3rtx1Wb4PWlQfq/zPrWy8PAAAAAAAAAAAAAAAAAAAA4D/0F5lQSZ+5G/qbAAAAAElFTkSuQmCC" 
                      alt="GitHub Icon" 
                    />
                    <span className="link-text">LinkedIn</span>
                    <span className="link-arrow">→</span>
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a href={`${profile.socialLinks.github}`} className="link-item" target="_blank" rel="noopener noreferrer">
                    <img 
                      className="link-icon" 
                      src="https://cdn-1.webcatalog.io/catalog/github/github-icon-filled-256.png?v=1756687729671" 
                      alt="GitHub Icon" 
                    />
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
    </div>
  );
};

export default ProfileView;
