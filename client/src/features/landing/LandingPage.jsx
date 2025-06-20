// client/src/features/landing/LandingPage.jsx


import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/icons/Logo';
import Squares from '../../components/ui/Squares'; // Import the animated background
import './LandingPage.css';


const LandingPage = () => {
  return (
    <div className="landing-page">
      {/*
        The Squares component is placed here. The CSS will position it
        as a background layer behind all the other content.
      */}
      <Squares
        speed={0.4}
        borderColor="#e5dbff"
        squareSize={35}
        hoverFillColor="#d0bfff"
      />


      {/* --- Header/Navbar (Simplified) --- */}
      <header className="landing-header">
        <div className="logo-container">
          <Logo />
          <span>StudyPlanner</span>
        </div>
        {/* Empty nav to keep the layout consistent */}
       
      </header>


      {/* --- Hero Section --- */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Finally,
            <br />
            A Study Planner That <span className="highlight-text">Gets You</span>
          </h1>
          <p className="hero-subtitle">
            Grades. Friends. Freedom.
          </p>
         
          <div className="hero-button-group">
            <Link to="/login">
              <button className="hero-button secondary">Login</button>
            </Link>
            <Link to="/signup">
              <button className="hero-button primary">Sign Up</button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};


export default LandingPage;