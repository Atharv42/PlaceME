import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';

export default function ViewApplicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    
    const [applications, setApplications] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const res = await api.get(`/api/jobs/${jobId}/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setApplications(res.data.applications);
                setJobTitle(res.data.jobTitle);

            } catch (err) {
                setError('Failed to fetch applicants.');
                console.error('Fetch applicants error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobId, navigate]);

    const handleUpdateStatus = async (applicationId, currentStatus, studentName) => {
        const newStatus = prompt(`Change status for ${studentName}.\nCurrent: ${currentStatus}\nEnter new status:`);
        
        if (!newStatus || newStatus.trim().toLowerCase() === currentStatus.toLowerCase()) {
            return; 
        }

        const newStatusTrimmed = newStatus.trim();

        try {
            const token = localStorage.getItem('token');
            const res = await api.put(
                `/api/applications/${applicationId}/status`,
                { status: newStatusTrimmed },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSuccessMessage(res.data.message); 
            setApplications(applications.map(app => 
                app._id === applicationId ? { ...app, status: newStatusTrimmed } : app
            ));

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to update application status.');
            }
            console.error('Update status error:', err);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container">
                    <h1>Loading Applicants...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="dashboard-container">
                <Link to="/company-dashboard" className="button outline" style={{ marginBottom: '20px' }}>
                    &larr; Back to Dashboard
                </Link>
                <h1 className="browse-jobs-title">Applicants for {jobTitle}</h1>

                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
                {successMessage && <div className="login-success" style={{ textAlign: 'center', marginBottom: '20px' }}>{successMessage}</div>}

                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    {applications.length === 0 ? (
                        <p>No applications received for this job yet.</p>
                    ) : (
                        <ul>
                            {applications.map((app) => (
                                <li key={app._id} className="job-listing-candidate" style={{ margin: '10px 0' }}>
                                    <div>
                                        <p><strong>Applicant:</strong> {app.studentName}</p>
                                        <p><strong>Email:</strong> {app.studentEmail}</p>
                                        <p><strong>Contact:</strong> {app.studentContact}</p>
                                        <p><strong>Applied On:</strong> {new Date(app.appliedDate).toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{app.status}</span></p>
                                    </div>
                                    <div className="list-item-action">
                                        <button 
                                            className="button" 
                                            style={{ marginRight: '10px' }} 
                                            onClick={() => app.studentResumeUrl ? window.open(app.studentResumeUrl, '_blank') : alert('No resume URL provided by student.')}
                                            disabled={!app.studentResumeUrl}
                                        >
                                            View Resume
                                        </button>
                                        <button
                                            className="button"
                                            onClick={() => handleUpdateStatus(app._id, app.status, app.studentName)} 
                                        >
                                            Update Status
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
