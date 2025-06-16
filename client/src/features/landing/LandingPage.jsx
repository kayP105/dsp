// client/src/features/landing/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>Welcome to the Dynamic Study Planner</h1>
      <p>Your personal, adaptive study schedule awaits.</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/signup">
          <button>Get Started</button>
        </Link>
        <Link to="/login" style={{ marginLeft: '1rem' }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;