import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
      <nav className="landing-navbar">
        <div className="navbar-brand">
          <span className="brand-icon">(˶ᵔ ᵕ ᵔ˶)</span>
          <span className="brand-text">ThinkSync</span>
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="landing-main">
        <div className="hero-section">
          <h1>Welcome to ThinkSync</h1>
          <p>A collaborative platform for researchers to connect, share, and discover opportunities worldwide.</p>
          
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-large btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-large btn-outline">
              Sign In
            </Link>
          </div>
        </div>

        <div className="features-section">
          <div className="feature">
            <h3>🔬 Research Profiles</h3>
            <p>Create detailed academic profiles showcasing your research, publications, and achievements.</p>
          </div>
          <div className="feature">
            <h3>🤝 Collaboration</h3>
            <p>Connect with researchers worldwide and discover new collaboration opportunities.</p>
          </div>
          <div className="feature">
            <h3>💼 Opportunities</h3>
            <p>Find jobs, grants, and research opportunities tailored to your expertise.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
export {};
