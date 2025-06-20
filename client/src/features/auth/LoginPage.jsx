// client/src/features/auth/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Import the necessary components and styles
import Squares from '../../components/ui/Squares';
import Logo from '../../assets/icons/Logo';
import './AuthForm.css'; // <-- THIS IS THE CRITICAL IMPORT

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.accessToken, { username: response.data.username });
      navigate('/app/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    // This top-level div needs the 'auth-container' class
    <div className="auth-container page-fade-in">
      <Squares />
      {/* This wrapper div creates the white card and centers the content */}
      <div className="auth-form-wrapper">
        <div className="auth-logo">
          <Logo />
        </div>
        <h2 className="auth-title">Log in to your account</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="username" className="form-label">Username *</label>
          </div>

          <div className="input-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="password" className="form-label">Password *</label>
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          <Link to="/forgot-password" className="forgot-password-link">Forgot password?</Link>

          <button type="submit" className="auth-button">Log In</button>
        </form>
        
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        
        <div className="secondary-action">
          <Link to="/resend-activation">Resend Activation Email</Link>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{fontWeight: '600', color: '#845ef7'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;