// src/components/CompanyRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

export default function CompanyRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState(''); // <-- NEW STATE
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- NEW STATE

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { companyName, companyEmail, companyPassword, confirmPassword } = formData;

    if (!companyName || !companyEmail || !companyPassword || !confirmPassword) {
      setError("Please fill all fields.");
      setIsSubmitting(false);
      return;
    }

    if (companyPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/company-register", {
        companyName,
        companyEmail,
        companyPassword
      });

      // alert("Company registered successfully!"); // <-- REPLACED
      // Redirect to login with a success message
      navigate("/login", { state: { successMessage: "Registration successful! Please log in." } });


    } catch (error) {
      console.error("Company Registration Failed:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message); // Show specific error from backend
      } else {
        setError("Company registration failed.");
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register Your Company</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

        <label className="login-label">Company Name</label>
        <input
          onChange={handleChange}
          type="text"
          name="companyName"
          placeholder="Company Name"
          className="input"
          required
        />

        <label className="login-label">Email</label>
        <input
          onChange={handleChange}
          type="email"
          name="companyEmail"
          placeholder="Official Email"
          className="input"
          required
        />

        <label className="login-label">Password</label>
        <input
          onChange={handleChange}
          type="password"
          name="companyPassword"
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
            {isSubmitting ? 'Registering...' : 'Register'}
        </button>
        <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}