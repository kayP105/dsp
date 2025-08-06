// client/src/features/landing/LandingPage.jsx


import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/icons/Logo';
import Squares from '../../components/ui/Squares';
import BlurText from '../../components/ui/BlurText'; // Import your animation component
import './LandingPage.css';


const LandingPage = () => {
  return (
    <div className="landing-page">
      <Squares
        speed={0.4}
        borderColor="#e5dbff"
        squareSize={35}
        hoverFillColor="#d0bfff"
      />


      <header className="landing-header">
        <div className="logo-container">
          <Logo />
          <span>StudyPlanner</span>
        </div>
      </header>


      <main className="hero-section">
        <div className="hero-content">
         
          {/* --- THIS IS THE NEW STRUCTURE FOR THE TITLE --- */}
          <div className="hero-title-container">
            <BlurText
              className="hero-title"
              text="Finally,"
              animateBy="words" // Animate as a single word
              delay={200} // <-- INCREASED from 100ms to 200ms
              stepDuration={0.25}
              justify="center"
            />
            <BlurText
              className="hero-title"
              text="A Study Planner That"
              animateBy="words"
              delay={200} // <-- INCREASED from 100ms to 200ms
              stepDuration={0.25}
              justify="center"
            />
            {/* For the highlighted part, we wrap BlurText in its own styled div */}
            <div className="highlight-container">
              <BlurText
                className="hero-title highlight-text" // Apply both classes
                text="Gets You"
                animateBy="words"
                delay={200} // <-- INCREASED from 100ms to 200ms
                stepDuration={0.25}
                justify="center"
              />
            </div>
          </div>
         
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