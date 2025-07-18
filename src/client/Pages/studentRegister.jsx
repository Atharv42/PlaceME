// src/components/StudentRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    address: '',
    education: '',
    skills: '',
    experience: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      firstName, lastName, contact, address, education,
      skills, experience, email, password, confirmPassword
    } = formData;

    // Simple validations
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/student-register", {
        firstName,
        lastName,
        email,
        password,
        contact,
        address,
        education,
        skills,
        experience,
        // resumeUrl
      });

      alert("Student registered successfully!");
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Check your inputs or try again later.");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Student Registration</h2>
      <form onSubmit={handleSubmit}>
        {[
          { label: 'First Name', name: 'firstName', type: 'text' },
          { label: 'Last Name', name: 'lastName', type: 'text' },
          { label: 'Contact No.', name: 'contact', type: 'text' },
          { label: 'Address', name: 'address', type: 'text' },
          { label: 'Education', name: 'education', type: 'text' },
          { label: 'Skills', name: 'skills', type: 'text' },
          { label: 'Experience', name: 'experience', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Password', name: 'password', type: 'password' },
          { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
        ].map((input, index) => (
          <div key={index}>
            <label className="register-label">{input.label}</label>
            <input
              onChange={handleChange}
              placeholder={input.label}
              name={input.name}
              type={input.type}
              value={formData[input.name]}
              className="input"
              required
            />
          </div>
        ))}

        <button className="register-button">Register</button>
        <p className="login-link">Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}
