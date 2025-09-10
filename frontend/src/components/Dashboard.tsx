import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Your ThinkSync research collaboration platform
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ 
          padding: '20px', 
          borderRadius: '12px', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>📊 Your Profile</h3>
          <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
            Manage your researcher information
          </p>
          <button 
            onClick={() => navigate('/profile')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
        </div>

        <div style={{ 
          padding: '20px', 
          borderRadius: '12px', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>🔬 Research</h3>
          <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
            Browse and share research work
          </p>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Explore Research
          </button>
        </div>

        <div style={{ 
          padding: '20px', 
          borderRadius: '12px', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>🤝 Network</h3>
          <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
            Connect with other researchers
          </p>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Find Collaborators
          </button>
        </div>

        <div style={{ 
          padding: '20px', 
          borderRadius: '12px', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>💼 Opportunities</h3>
          <p style={{ margin: '0 0 15px 0', color: '#6c757d' }}>
            Discover grants and collaborations
          </p>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Browse Opportunities
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
