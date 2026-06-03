
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom"; 
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccessMessage(""); 

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const res = await axios.post("/api/login", {
        email,
        password,
      });

      const { token, role, userId, email: userEmail } = res.data; 

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      localStorage.setItem("email", userEmail); 

      if (role === 'student') {
        navigate("/dashboard");
      } else if (role === 'company') {
        navigate("/company-dashboard");
      } else if (role === 'admin') {
        navigate("/admin-dashboard"); 
      } else {
        navigate("/"); 
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
        
        {successMessage && <div className="login-success" style={{marginBottom: '15px'}}>{successMessage}</div>}
        {error && <div className="login-error" style={{marginBottom: '15px'}}>{error}</div>}

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
          <button className="login-button" type="submit">Sign In</button>
        </form>
        <div className="login-links">
          <Link to="/register" className="login-link">Don’t have an account? Register</Link>
          
          <Link to="/forgot-password" className="login-link">Forgot Password?</Link>
         
        </div>
      </div>
    </div>
  );
}

export default Login;