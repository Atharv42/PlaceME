// src/client/Pages/ViewAllApplications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';

export default function ViewAllApplications() {
    const navigate = useNavigate();
    
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('token');
                const studentId = localStorage.getItem('userId');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const res = await axios.get(`/api/student/applications/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setApplications(res.data.applications);

            } catch (err) {
                setError('Failed to fetch applications.');
                console.error('Fetch applications error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [navigate]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container">
                    <h1>Loading My Applications...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="dashboard-container">
                <Link to="/dashboard" className="button outline" style={{ marginBottom: '20px' }}>
                    &larr; Back to Dashboard
                </Link>
                <h1 className="browse-jobs-title">My Applications</h1>

                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    {applications.length === 0 ? (
                        <p>You haven't applied to any jobs yet.</p>
                    ) : (
                        <ul>
                            {applications.map((app) => (
                                <li key={app._id} className="job-listing-candidate" style={{ margin: '10px 0' }}>
                                    <div>
                                        <h3 className="job-title">{app.jobTitle}</h3>
                                        <h5 className="company-name">{app.companyName}</h5>
                                        <p><strong>Applied On:</strong> {new Date(app.appliedDate).toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{app.status}</span></p>
                                    </div>
                                    <div className="list-item-action">
                                        <button 
                                            className="button" 
                                            disabled={app.status.toLowerCase() !== 'interview scheduled'}
                                            title={app.status.toLowerCase() !== 'interview scheduled' ? 'No interview scheduled' : 'View Interview Details'}
                                        >
                                            View Interview
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}