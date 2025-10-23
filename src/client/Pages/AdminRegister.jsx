// src/client/Pages/AdminRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { adminName, adminEmail, adminPassword, confirmPassword } = formData;

    if (!adminName || !adminEmail || !adminPassword || !confirmPassword) {
      setError("Please fill all fields.");
      setIsSubmitting(false);
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/admin-register", {
        adminName,
        adminEmail,
        adminPassword
      });

      navigate("/login", { state: { successMessage: "Admin registered! Please log in." } });

    } catch (error) {
      console.error("Admin Registration Failed:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Admin registration failed.");
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Create Admin Account</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

        <label className="login-label">Admin Name</label>
        <input
          onChange={handleChange}
          type="text"
          name="adminName"
          placeholder="Admin Name"
          className="input"
          required
        />

        <label className="login-label">Email</label>
        <input
          onChange={handleChange}
          type="email"
          name="adminEmail"
          placeholder="Admin Email"
          className="input"
          required
        />

        <label className="login-label">Password</label>
        <input
          onChange={handleChange}
          type="password"
          name="adminPassword"
          placeholder="Password (min. 6 characters)"
          className="input"
          minLength="6"
          required
        />

        <label className="login-label">Confirm Password</label>
        <input
          onChange={handleChange}
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="input"
          minLength="6"
          required
        />

        <button className="register-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Create Admin'}
        </button>
        <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}