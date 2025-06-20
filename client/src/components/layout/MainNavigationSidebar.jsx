// client/src/components/layout/MainNavigationSidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaPlus, FaCog, FaSignOutAlt, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './MainNavigationSidebar.css';

const MainNavigationSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="main-nav-sidebar">
      <NavLink to="/app/dashboard" className="logo-link" title="Dashboard">
        <div className="app-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V19L12 14L4 19Z" fill="#845ef7"/>
          </svg>
        </div>
      </NavLink>

      <div className="nav-links-group">
        <NavLink to="/app/dashboard" className="nav-link" title="Dashboard">
          <FaCalendarAlt size={20} />
        </NavLink>
        <NavLink to="/app/report" className="nav-link" title="Grade Report">
          <FaChartBar size={20} />
        </NavLink>
        <NavLink to="/app/add-task" className="nav-link" title="Add New">
          <FaPlus size={20} />
        </NavLink>
        <NavLink to="/app/settings" className="nav-link" title="Settings">
          <FaCog size={20} />
        </NavLink>
      </div>
      
      <button onClick={logout} className="nav-link logout-btn" title="Logout">
          <FaSignOutAlt size={20} />
      </button>
    </div>
  );
};

export default MainNavigationSidebar;