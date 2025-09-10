import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    console.log('🚪 [NAVBAR] Logout clicked');
    logout();
    navigate('/', { replace: true });
    closeMenu();
  };

  // ✅ Profile circle click handler
  const handleProfileClick = () => {
    console.log('👤 [NAVBAR] Profile circle clicked');
    navigate('/profile');
    closeMenu();
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
    closeMenu();
  };

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Far Left - Logo and Name */}
        <div className="navbar-left" onClick={handleLogoClick}>
          <span className="brand-icon">🌐</span>
          <span className="brand-text">ThinkSync</span>
        </div>

        {/* Center - Navigation Links */}
        {user && (
          <div className="navbar-center">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">⊞</span> Dashboard
            </Link>
            
            {/* ✅ Profile Button - Links to ProfileView */}
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">👤</span> Profile
            </Link>
            
            <Link 
              to="/search" 
              className={`nav-link ${isActive('/search') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🔍</span> Search
            </Link>
            <Link 
              to="/opportunities" 
              className={`nav-link ${isActive('/opportunities') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🌟</span> Opportunities
            </Link>
            <Link 
              to="/messages" 
              className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">✉️</span> Messages
            </Link>
          </div>
        )}

        {/* Far Right - Logout and Profile Circle */}
        {user && (
          <div className="navbar-right">
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              Logout
            </button>
            
            {/* ✅ Profile Circle - Navigates to ProfileView */}
            <div 
              className="user-circle" 
              onClick={handleProfileClick}
              title={`${user.name} - Click for profile`}
            >
              {getUserInitials(user.name)}
            </div>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Menu */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {user && <div className="user-welcome">Welcome, {user.name}</div>}
          
          <ul className="nav-links">
            <li>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} 
                onClick={closeMenu}
              >
                ⊞ Dashboard
              </Link>
            </li>
            <li>
              {/* ✅ Mobile Profile Link */}
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`} 
                onClick={closeMenu}
              >
                👤 Profile
              </Link>
            </li>
            <li>
              <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`} onClick={closeMenu}>
                🔍 Search
              </Link>
            </li>
            <li>
              <Link to="/opportunities" className={`nav-link ${isActive('/opportunities') ? 'active' : ''}`} onClick={closeMenu}>
                🌟 Opportunities
              </Link>
            </li>
            <li>
              <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`} onClick={closeMenu}>
                ✉️ Messages
              </Link>
            </li>
          </ul>
          
          <button className="logout-btn mobile-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
