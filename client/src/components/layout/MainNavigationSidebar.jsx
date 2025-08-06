// client/src/components/layout/MainNavigationSidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaPlus, FaCog, FaSignOutAlt, FaCalendarAlt, FaChartBar, FaBrain } from 'react-icons/fa'; // <-- ADD FaBrain
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/icons/Logo';
import './MainNavigationSidebar.css';

const MainNavigationSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="main-nav-sidebar">
      <NavLink to="/app/dashboard" className="logo-link" title="Dashboard">
        <div className="app-logo">
          <Logo size={24} />
        </div>
      </NavLink>

      <div className="nav-links-group">
        <NavLink to="/app/dashboard" className="nav-link" title="Dashboard">
          <FaCalendarAlt size={20} />
        </NavLink>
        {/* NEW LINK FOR AI HELP */}
        <NavLink to="/app/gemini-help" className="nav-link" title="Study Assistant">
          <FaBrain size={20} />
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