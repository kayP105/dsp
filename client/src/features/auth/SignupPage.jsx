// client/src/features/auth/SignupPage.jsx


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


// Import the shared components and styles
import Squares from '../../components/ui/Squares';
import Logo from '../../assets/icons/Logo';
import './AuthForm.css'; // The same CSS file as the login page


const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      await api.post('/auth/signup', { username, password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up. Please try another username.');
    }
  };


  return (
    <div className="auth-container page-fade-in">
      <Squares
        direction="left" // Let's give it a different direction for variety
        borderColor="#e5dbff"
      />
      <div className="auth-form-wrapper">
        <div className="auth-logo">
          <Logo />
        </div>
        <h2 className="auth-title">Create your account</h2>
       
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Username Input */}
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


          {/* Password Input */}
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
         
          <button type="submit" className="auth-button">Create Account</button>
        </form>
       
        {error && <p style={{ color: '#e03131', marginTop: '1rem', fontWeight: 500 }}>{error}</p>}
        {success && <p style={{ color: '#2f9e44', marginTop: '1rem', fontWeight: 500 }}>{success}</p>}
       
        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{fontWeight: '600', color: '#845ef7'}}>Log In</Link>
        </p>
      </div>
    </div>
  );
};


export default SignupPage;