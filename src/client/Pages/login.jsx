// Login.jsx (React Component)
import React, { useState } from "react";
import './Login.css'; // Refer to the CSS below

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and call your login API here
    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }
    // Replace with actual authentication logic
    onLogin && onLogin(email, password);
    
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">Place<span className="accent">ME</span></div>
        <h2 className="login-title">Welcome Back!</h2>
        <form onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <div className="login-error">{error}</div>}
          <button className="login-button" type="submit">Sign In</button>
        </form>
        <div className="login-links">
          <a href="/register" className="login-link">Don’t have an account? Register</a>
          <a href="/forgot" className="login-link">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
