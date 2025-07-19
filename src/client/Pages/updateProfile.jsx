// src/client/Pages/updateProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header.jsx'; // Assuming you want to reuse the existing header
import '../index.css'; // Reusing general styles for buttons and containers
import { Link } from 'react-router-dom'; // Import Link for navigation

export default function UpdateProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        address: '',
        education: '',
        skills: '',
        experience: '',
        resumeUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const studentId = localStorage.getItem('userId');

                if (!token || role !== 'student') {
                    navigate('/login'); // Redirect if not logged in as a student
                    return;
                }

                // Fetch student's current profile data
                const res = await axios.get(`http://localhost:3000/api/student/profile/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const studentProfile = res.data.student;
                setFormData({
                    firstName: studentProfile.firstName || '',
                    lastName: studentProfile.lastName || '',
                    email: studentProfile.email || '',
                    contact: studentProfile.contact || '',
                    address: studentProfile.address || '',
                    education: studentProfile.education || '',
                    skills: studentProfile.skills || '',
                    experience: studentProfile.experience || '',
                    resumeUrl: studentProfile.resumeUrl || '',
                });

            } catch (err) {
                setError('Failed to fetch profile data. Please try again.');
                console.error('Fetch profile error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const studentId = localStorage.getItem('userId');

            // Construct update data, only sending fields that might have changed
            const updateData = {};
            for (const key in formData) {
                // You might want a more sophisticated check here, e.g.,
                // if formData[key] !== initialProfileData[key]
                // but for now, sending all form data is fine given optional Joi schema.
                updateData[key] = formData[key];
            }


            const res = await axios.put(`http://localhost:3000/api/student/profile/${studentId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage(res.data.message);
            // Optionally, update formData with the response to ensure consistency if backend applies any transformations
            setFormData(res.data.student);
            alert(res.data.message); // For immediate feedback

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                alert(err.response.data.message);
            } else {
                setError('Failed to update profile. Please try again.');
                alert('Failed to update profile. Please try again.');
            }
            console.error('Update profile error:', err);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="update-profile-container">
                    <h1>Loading Profile...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="update-profile-container">
                <h1 className="update-profile-title">Update your profile</h1>
                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                {successMessage && <div style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <label className="update-profile-fillup">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Contact No.</label>
                    <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact No." className="input" required />
                    <br />
                    <label className="update-profile-fillup">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Education</label>
                    <input type="text" name="education" value={formData.education} onChange={handleChange} placeholder="e.g., B.Tech Computer Science, University Name, Year" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Skills</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder=" e.g., Python, JavaScript, React, SQL" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Work Experience</label>
                    <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g., Intern at Company A, Role, Dates" className="input" required />
                    <br />
                    <label className="update-profile-fillup">Resume URL</label> {/* Changed from file input to URL as per schema */}
                    <input type="text" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="e.g., https://your-resume.com/file.pdf" className="input" required />
                    <br />
                    <div className="update-profile-buttons">
                        <button type="submit" className="update-button">Update Profile</button>
                        <Link to="/dashboard" className="update-button">Back to Dashboard</Link>
                    </div>
                </form>
            </div>
        </>
    );
}