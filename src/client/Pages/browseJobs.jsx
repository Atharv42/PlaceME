// src/client/Pages/browseJobs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header.jsx'; // Assuming you want to reuse the existing header
import '../index.css'; // Reusing general styles for buttons and containers

export default function BrowseJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [studentId, setStudentId] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const userId = localStorage.getItem('userId');

                if (!token || role !== 'student') {
                    // If not logged in as a student, redirect or handle appropriately
                    navigate('/login');
                    return;
                }

                setUserRole(role);
                setStudentId(userId);

                // Fetch all jobs for students to browse
                const res = await axios.get('http://localhost:3000/api/jobs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setJobs(res.data.jobs);
            } catch (err) {
                setError('Failed to fetch jobs. Please try again.');
                console.error('Browse jobs fetch error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [navigate]);

    const handleApply = async (jobId) => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const studentId = localStorage.getItem('userId'); // Get studentId from localStorage

            const applicationData = {
                jobId: jobId,
                studentId: studentId,
            };

            const res = await axios.post('http://localhost:3000/api/apply-job', applicationData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message); // Show success message

            // Optionally, you might want to disable the apply button for this job
            // or update the UI to reflect that it's been applied.
            // For now, we'll just show an alert.

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                alert(err.response.data.message); // Show specific error message
            } else {
                setError('Failed to apply for job. Please try again.');
                alert('Failed to apply for job. Please try again.');
            }
            console.error('Apply job error:', err);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="browse-jobs-container">
                    <h1 className="browse-jobs-title">Loading Available Jobs...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="browse-jobs-container">
                <h1 className="browse-jobs-title">Browse Available Jobs</h1>
                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

                {jobs.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: '1.2em' }}>No jobs available at the moment. Please check back later!</p>
                ) : (
                    jobs.map((job) => (
                        <div className="job-listing" key={job._id}>
                            <h2 className="job-title">{job.title}</h2>
                            <h4 className="company-name">{job.company}</h4>
                            <p className="location">Location: {job.location}</p>
                            <p>{job.description}</p>
                            <p className="location">Skills: {job.skillsRequired.join(', ')}</p>
                            <p className="application-deadline">Application Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                            {userRole === 'student' && ( // Only show apply button for students
                                <button
                                    className="apply-button"
                                    onClick={() => handleApply(job._id)}
                                >
                                    View Details & Apply
                                </button>
                            )}
                            {userRole === 'company' && (
                                <p style={{ fontStyle: 'italic', color: '#555' }}>Companies cannot apply for jobs.</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}