import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthorizationItem {
  id: number;
  user_id: string;
  type?: string;
  content: string;
  post_id?: number;
  status: string;
  created_at: string;
  user_name?: string;
}

const AuthorizationPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AuthorizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchPendingItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/post_authorizations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data);
      } catch (err) {
        setError('Failed to load pending authorizations');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingItems();
  }, [user, token, navigate]);

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await axios.post(
        `/api/admin/post_authorizations/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(items.filter((item) => item.id !== id));
    } catch {
      setError('Failed to approve item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoadingId(id);
    try {
      await axios.post(
        `/api/admin/post_authorizations/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(items.filter((item) => item.id !== id));
    } catch {
      setError('Failed to reject item');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <div>Loading pending authorizations...</div>;
  if (error) return <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <h2>Pending Post Authorizations</h2>
      {items.length === 0 && <p>No pending items.</p>}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              backgroundColor: '#fafafa',
            }}
          >
            <p><strong>User:</strong> {item.user_name}</p>
            <p><strong>Content:</strong> {item.content}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleApprove(item.id)}
                disabled={actionLoadingId === item.id}
                style={{ padding: '8px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {actionLoadingId === item.id ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(item.id)}
                disabled={actionLoadingId === item.id}
                style={{ padding: '8px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {actionLoadingId === item.id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorizationPage;
