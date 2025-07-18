// src/components/CompanyRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CompanyRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { companyName, companyEmail, companyPassword, confirmPassword } = formData;

    if (!companyName || !companyEmail || !companyPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (companyPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/company-register", {
        companyName,
        companyEmail,
        companyPassword
      });

      alert("Company registered successfully!");
      navigate("/login");

    } catch (error) {
      console.error("Company Registration Failed:", error);
      alert("Company registration failed.");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register Your Company</h2>
      <form onSubmit={handleSubmit}>
        <label className="register-label">Company Name</label>
        <input
          onChange={handleChange}
          type="text"
          name="companyName"
          placeholder="Company Name"
          className="input"
          required
        />

        <label className="register-label">Email</label>
        <input
          onChange={handleChange}
          type="email"
          name="companyEmail"
          placeholder="Official Email"
          className="input"
          required
        />

        <label className="register-label">Password</label>
        <input
          onChange={handleChange}
          type="password"
          name="companyPassword"
          placeholder="Password"
          className="input"
          required
        />

        <label className="register-label">Confirm Password</label>
        <input
          onChange={handleChange}
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="input"
          required
        />

        <button className="register-button">Register</button>
        <p className="login-link">Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}
