import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';

export default function ViewResume() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const studentId = localStorage.getItem('userId');

                if (!token || role !== 'student') {
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`/api/student/profile/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setStudent(res.data.student);
            } catch (err) {
                setError('Failed to fetch profile data.');
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

    if (loading) {
        return (
            <>
                <Header />
                <div className="browse-jobs-container">
                    <h1 className="browse-jobs-title">Loading My Resume...</h1>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="browse-jobs-container">
                    <h1 className="browse-jobs-title">My Resume</h1>
                    <div className="job-listing">
                        <p className="login-error" style={{ textAlign: 'center' }}>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    if (!student) {
        return (
            <>
                <Header />
                <div className="browse-jobs-container">
                    <h1 className="browse-jobs-title">My Resume</h1>
                    <div className="job-listing">
                        <p style={{ textAlign: 'center' }}>Could not load student data.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header /> 
            <div className="browse-jobs-container">
                <h1 className="browse-jobs-title">My Resume / Profile</h1>
                <div className="job-listing">
                 <h1 className="resume-title">Contact Information</h1>   
                 <ul className="resume-list">
                    <li><strong>Name:</strong> {student.firstName} {student.lastName}</li>
                    <li><strong>Email:</strong> {student.email}</li>
                    <li><strong>Phone:</strong> {student.contact}</li>
                    <li><strong>Address:</strong> {student.address}</li>
                 </ul>
                
                <h1 className="resume-title">Education</h1>
                <p><span className="special-text">{student.education}</span></p>

                <h1 className="resume-title">Skills</h1>
                <ul className="resume-list">
                   
                    {student.skills.split(',').map((skill, index) => (
                        <li key={index}>{skill.trim()}</li>
                    ))}
                </ul>

                <h1 className="resume-title">Experience</h1>
                <p>{student.experience}</p>
                

                <div className="resume-btn">
                <button 
                    className="button" 
                    onClick={() => student.resumeUrl ? window.open(student.resumeUrl, '_blank') : alert('No resume URL provided. Please update your profile.')}
                    disabled={!student.resumeUrl}
                >
                    Download Resume (PDF)
                </button>
                <Link to="/dashboard/updateprofile" className="button">
                    Edit Profile / Upload New Resume
                </Link>
                </div>
                
                </div>
            </div>
        </>
    );
}