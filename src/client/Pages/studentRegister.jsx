// src/components/StudentRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

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
  
  const [error, setError] = useState(''); // <-- NEW STATE
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- NEW STATE

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true);

    const {
      firstName, lastName, contact, address, education,
      skills, experience, email, password, confirmPassword
    } = formData;

    // Simple validations
    if (!firstName || !lastName || !email || !password || !confirmPassword || !contact || !address || !education || !skills || !experience) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
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
        // resumeUrl is no longer sent from here
      });

      // alert("Student registered successfully!"); // <-- REPLACED
      // Redirect to login with a success message
      navigate("/login", { state: { successMessage: "Registration successful! Please log in." } });

    } catch (error) {
      console.error("Registration error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message); // Show specific error from backend
      } else {
        setError("Registration failed. Check your inputs or try again later.");
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Student Registration</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
        
        {[
          { label: 'First Name', name: 'firstName', type: 'text' },
          { label: 'Last Name', name: 'lastName', type: 'text' },
          { label: 'Contact No.', name: 'contact', type: 'text', minLength: 10, maxLength: 10 },
          { label: 'Address', name: 'address', type: 'text' },
          { label: 'Education', name: 'education', type: 'text', placeholder: 'e.g., B.Tech CS, XYZ University' },
          { label: 'Skills', name: 'skills', type: 'text', placeholder: 'e.g., Python, React, SQL' },
          { label: 'Experience', name: 'experience', type: 'text', placeholder: 'e.g., Intern at ABC Corp (or "Fresher")' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Password', name: 'password', type: 'password', minLength: 6 },
          { label: 'Confirm Password', name: 'confirmPassword', type: 'password', minLength: 6 },
        ].map((input, index) => (
          <div key={index}>
            <label className="register-label">{input.label}</label>
            <input
              onChange={handleChange}
              placeholder={input.placeholder || input.label}
              name={input.name}
              type={input.type}
              value={formData[input.name]}
              className="input"
              minLength={input.minLength}
              maxLength={input.maxLength}
              required
            />
          </div>
        ))}

        <button className="register-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
        <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}