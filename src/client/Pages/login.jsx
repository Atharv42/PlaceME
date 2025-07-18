// src/client/Pages/login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        email,
        password,
      });

      const { token, role, userId } = res.data;

      // Save token and user info to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);

      // Redirect to appropriate dashboard based on role
      if (role === 'student') {
        navigate("/dashboard"); // Redirect students to student dashboard
      } else if (role === 'company') {
        navigate("/company-dashboard"); // Redirect companies to company dashboard
      } else {
        navigate("/"); // Default redirect if role is unknown
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          Place<span className="accent">ME</span>
        </div>
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