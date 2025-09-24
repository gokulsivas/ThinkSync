// PATH: src/components/profile/ProfileEdit.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileEdit.css';

interface ProfileEditData {
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
  isPublic: boolean; // New field for account visibility
}

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfileEditData>({
    fullName: '',
    title: '',
    affiliation: '',
    hIndex: 0,
    bio: '',
    website: '',
    researchInterests: [],
    awards: [],
    socialLinks: { orcid: '', googleScholar: '', linkedIn: '', github: '' },
    isPublic: true, // default mode is public
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newAward, setNewAward] = useState('');

  useEffect(() => {
    const loadProfile = () => {
      try {
        setLoading(true);
        const savedProfile = localStorage.getItem(`profile_${user?.id}`);
        if (savedProfile) {
          const data = JSON.parse(savedProfile);
          setFormData({ ...data, isPublic: data.isPublic ?? true });
        } else {
          setFormData(prev => ({
            ...prev,
            fullName: user?.name || '',
            isPublic: true,
          }));
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

  const handleInputChange = (field: keyof ProfileEditData, val: any) =>
    setFormData(prev => ({ ...prev, [field]: val }));

  const handleSocial = (p: keyof ProfileEditData['socialLinks'], v: string) =>
    setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [p]: v } }));

  const addInterest = () => {
    if (newInterest.trim() && !formData.researchInterests.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, researchInterests: [...prev.researchInterests, newInterest.trim()] }));
      setNewInterest('');
    }
  };

  const addAward = () => {
    if (newAward.trim() && !formData.awards.includes(newAward.trim())) {
      setFormData(prev => ({ ...prev, awards: [...prev.awards, newAward.trim()] }));
      setNewAward('');
    }
  };

  const removeInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((_, i) => i !== index),
    }));
  };

  const removeAward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  };

  // Toggle public/private mode
  const handleToggleVisibility = () => {
    setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      // Save to localStorage including isPublic mode
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(formData));
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/profile');
    } catch (err) {
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-wrapper">
        {/* Header */}
        <div className="profile-edit-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Edit Profile</h1>
              <p>Update your professional information and research details</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="close-button"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="profile-edit-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Assistant Professor, Research Scientist"
                />
              </div>
              <div className="form-group">
                <label>Affiliation</label>
                <input
                  type="text"
                  value={formData.affiliation}
                  onChange={e => handleInputChange('affiliation', e.target.value)}
                  placeholder="University or Institution"
                />
              </div>
              <div className="form-group">
                <label>H-Index</label>
                <input
                  type="number"
                  value={formData.hIndex}
                  onChange={e => handleInputChange('hIndex', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself, your research background, and current interests..."
                />
              </div>
            </div>
          </div>

          {/* Research Interests */}
          <div className="form-section">
            <h2 className="section-title">Research Interests</h2>
            <div className="add-item-container">
              <input
                type="text"
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add a research interest"
                className="add-item-input"
              />
              <button type="button" onClick={addInterest} className="add-button interests">
                Add
              </button>
            </div>
            <div className="tags-container">
              {formData.researchInterests?.map((interest, index) => (
                <span key={interest} className="tag interests-tag">
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Awards */}
          <div className="form-section">
            <h2 className="section-title">Awards & Recognition</h2>
            <div className="add-item-container">
              <input
                type="text"
                value={newAward}
                onChange={e => setNewAward(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAward())}
                placeholder="Add an award or recognition"
                className="add-item-input"
              />
              <button type="button" onClick={addAward} className="add-button awards">
                Add
              </button>
            </div>
            <div className="awards-list">
              {formData.awards?.map((award, index) => (
                <div key={award} className="award-item">
                  <span>{award}</span>
                  <button
                    type="button"
                    onClick={() => removeAward(index)}
                    className="award-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="form-section">
            <h2 className="section-title">Professional Links</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>ORCID ID</label>
                <input
                  type="text"
                  value={formData.socialLinks.orcid}
                  onChange={e => handleSocial('orcid', e.target.value)}
                  placeholder="0000-0000-0000-0000"
                />
              </div>
              <div className="form-group">
                <label>Google Scholar ID</label>
                <input
                  type="text"
                  value={formData.socialLinks.googleScholar}
                  onChange={e => handleSocial('googleScholar', e.target.value)}
                  placeholder="Scholar ID"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={formData.socialLinks.linkedIn}
                  onChange={e => handleSocial('linkedIn', e.target.value)}
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="text"
                  value={formData.socialLinks.github}
                  onChange={e => handleSocial('github', e.target.value)}
                  placeholder="github.com/username"
                />
              </div>
            </div>
          </div>

          {/* Account Visibility Toggle */}
          <div className="form-section">
            <h2 className="section-title">Account Visibility</h2>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={handleToggleVisibility}
                className="switch-input"
              />
              <span className="switch-slider"></span>
              <span className="switch-text">{formData.isPublic ? 'Public' : 'Private'}</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving && <div className="button-spinner"></div>}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
  