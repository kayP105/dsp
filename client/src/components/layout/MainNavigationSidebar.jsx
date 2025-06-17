// client/src/components/layout/MainNavigationSidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
// Import the new calendar icon
import { FaPlus, FaCog, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './MainNavigationSidebar.css';

const MainNavigationSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="main-nav-sidebar">
      {/* --- App Icon/Logo (now a clickable link to the dashboard) --- */}
      <NavLink to="/app/dashboard" className="logo-link" title="Dashboard"> {/* // <-- WRAPPED IN NAVLINK */}
        <div className="app-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V19L12 14L4 19Z" fill="#845ef7"/>
          </svg>
        </div>
      </NavLink>

      {/* --- Navigation Links --- */}
      <div className="nav-links-group">
        {/* // V-- NEW DASHBOARD LINK --V */}
        <NavLink to="/app/dashboard" className="nav-link" title="Dashboard">
          <FaCalendarAlt size={20} />
        </NavLink>
        <NavLink to="/app/add-task" className="nav-link" title="Add Task">
          <FaPlus size={20} />
        </NavLink>
        <NavLink to="/app/settings" className="nav-link" title="Settings">
          <FaCog size={20} />
        </NavLink>
      </div>
      
      {/* --- Logout Button at the bottom --- */}
      <button onClick={logout} className="nav-link logout-btn" title="Logout">
          <FaSignOutAlt size={20} />
      </button>
    </div>
  );
};

export default MainNavigationSidebar;