// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand">Place</span><span className="accent">ME</span>
          </h1>
          <p className="hero-subtitle">Your smart campus placement assistant.</p>
          <div className="hero-buttons">
            <Link to="/login" className="hero-btn">Login</Link>
            <Link to="/register" className="hero-btn outline">Register</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/assets/placement-illustration.svg" alt="Illustration" />
        </div>
      </header>

      <section className="features">
        <h2>Why Use PlaceME?</h2>
        <div className="features-list">
          <div className="feature-card">
            <h3>🚀 Instant Applications</h3>
            <p>Apply to verified campus jobs through a single dashboard.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Real-Time Stats</h3>
            <p>Track placement status and improve your profile visibility.</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Connect to Recruiters</h3>
            <p>Communicate with companies and get interview updates directly.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Your Placement Journey Starts Here</h2>
        <p>Join thousands of students already getting placed with ease.</p>
        <Link to="/register" className="cta-btn">Get Started</Link>
      </section>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} PlaceME | Designed & Developed by Atharv42</p>
      </footer>
    </div>
  );
};

export default Home;
