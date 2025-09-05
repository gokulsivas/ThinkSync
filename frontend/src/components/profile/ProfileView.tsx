import React from "react";
import { Profile } from "../../types/profile";
import "./ProfileView.css";

interface ProfileViewProps {
  profile: Profile;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  // Helper function to ensure URL has protocol
  const ensureProtocol = (url: string): string => {
    if (!url) return url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
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
            {profile.isPublic ? '🗺 Public' : 'ꗃ Private'}
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="profile-content">
        {/* Research Interests - Always visible */}
        <div className="profile-section">
          <h3 className="section-title">
            <span className="section-icon">⌬</span>
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

        {/* Awards - Only show if profile is public */}
        {profile.isPublic && profile.awards.length > 0 && (
          <div className="profile-section">
            <h3 className="section-title">
              <span className="section-icon">𐃯</span>
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
        {profile.isPublic && (profile.socialLinks.orcid || profile.socialLinks.googleScholar || 
          profile.socialLinks.linkedIn || profile.socialLinks.github) && (
          <div className="profile-section">
            <h3 className="section-title">
              <span className="section-icon">🖇</span>
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
              <span className="section-icon">ꗃ</span>
              Private Profile
            </h3>
            <p className="private-text">
              This profile is set to private.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
