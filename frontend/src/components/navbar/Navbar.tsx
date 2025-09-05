import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">(˶ᵔ ᵕ ᵔ˶)</span>
          <span className="brand-text">ThinkSync</span>
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                ⊞ Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                 Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/search" 
                className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                🔍︎ Search
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/opportunities" 
                className={`nav-link ${isActive('/opportunities') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                𖠩 Opportunities
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/messages" 
                className={`nav-link ${isActive('/messages') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                ✉︎ Messages
              </Link>
            </li>
            <li className="nav-item">
              <button className="nav-link logout-btn" onClick={closeMenu}>
                ➜] Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
