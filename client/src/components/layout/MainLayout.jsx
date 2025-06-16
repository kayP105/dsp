// client/src/components/layout/MainLayout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If for any reason this layout renders while the user is still loading,
  // this check prevents the crash.
  if (!user) {
    return <div>Loading user...</div>; // Or redirect, or return null
  }

  return (
    <div>
      <nav>
        <div>
          <NavLink to="/app/dashboard">Dashboard</NavLink>
          <NavLink to="/app/add-task">Add Task</NavLink>
        </div>
        <div>
          {/* This line is now safe because of the 'if (!user)' check above */}
          <span>Welcome, {user.username}</span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem', background: '#dc3545' }}>
            Logout
          </button>
        </div>
      </nav>
      <main className="container">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

export default MainLayout;