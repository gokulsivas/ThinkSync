import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/navbar/Navbar';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import ProfileView from './pages/ProfilePage';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 🎯 Force re-render when user changes
  React.useEffect(() => {
    console.log('🔄 [APP] Auth state changed:', { isAuthenticated, user: !!user });
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="App">
      {/* 🎯 Only show navbar for authenticated users */}
      {isAuthenticated && <Navbar />}
      
      <main className={isAuthenticated ? "main-content" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          
          {/* Conditional Routing based on Authentication */}
          {isAuthenticated ? (
            <>
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/search" element={<div>Search Page</div>} />
              <Route path="/opportunities" element={<div>Opportunities Page</div>} />
              <Route path="/messages" element={<div>Messages Page</div>} />
              {/* Catch all for authenticated users */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              {/* Unauthenticated Routes */}
              <Route path="/" element={<LandingPage />} />
              {/* Catch all for unauthenticated users */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
