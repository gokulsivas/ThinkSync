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

  // Profile circle click handler
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
        <div className="navbar-left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <span className="brand-icon">𖡎</span>
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

            <Link
              to="/profile"
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">𐀪</span> Profile
            </Link>

            <Link
              to="/search"
              className={`nav-link ${isActive('/search') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🔍︎</span> Search
            </Link>

            <Link
              to="/opportunities"
              className={`nav-link ${isActive('/opportunities') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">✈︎</span> Opportunities
            </Link>

            <Link
              to="/messages"
              className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">✉︎</span> Messages
            </Link>

            {/* Admin-only Authorization link */}
            {user?.role === 'admin' && (
              <button
                className="nav-btn authorization-btn"
                onClick={() => {
                  navigate('/authorization');
                  closeMenu();
                }}
                style={{
                  marginLeft: '12px',
                  padding: '8px 14px',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #4a5568',
                  cursor: 'pointer',
                  backgroundColor: '#718096',
                  color: 'white',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#4a5568';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#718096';
                }}
                type="button"
              >
                Authorization
              </button>
            )}
          </div>
        )}

        {/* Far Right - Logout and Profile Circle */}
        {user && (
          <div className="navbar-right">
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              Logout
            </button>

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
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                𐀪 Profile
              </Link>
            </li>
            <li>
              <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`} onClick={closeMenu}>
                🔍︎ Search
              </Link>
            </li>
            <li>
              <Link to="/opportunities" className={`nav-link ${isActive('/opportunities') ? 'active' : ''}`} onClick={closeMenu}>
                💭 Opportunities
              </Link>
            </li>
            <li>
              <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`} onClick={closeMenu}>
                ✉︎ Messages
              </Link>
            </li>

            {/* Admin Authorization link on mobile menu */}
            {user?.role === 'admin' && (
              <li>
                <button
                  className="nav-btn authorization-btn"
                  onClick={() => {
                    navigate('/authorization');
                    closeMenu();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #4a5568',
                    cursor: 'pointer',
                    backgroundColor: '#718096',
                    color: 'white',
                    marginTop: '8px',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#4a5568';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#718096';
                  }}
                  type="button"
                >
                  Authorization
                </button>
              </li>
            )}
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
