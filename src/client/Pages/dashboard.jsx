// src/client/Pages/dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from "../header.jsx";
import '../index.css'; // Reusing general styles for buttons and containers

export default function Dashboard() {
    const navigate = useNavigate();
    const [totalApplied, setTotalApplied] = useState(0);
    const [shortlistedCount, setShortlistedCount] = useState(0);
    const [interviewsScheduledCount, setInterviewsScheduledCount] = useState(0);
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const studentId = localStorage.getItem('userId');

                if (!token || role !== 'student') {
                    navigate('/login'); // Redirect if not logged in as a student
                    return;
                }

                // Fetch student's applications
                const applicationsRes = await axios.get(`http://localhost:3000/api/student/applications/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedApplications = applicationsRes.data.applications;
                setApplications(fetchedApplications);
                setTotalApplied(fetchedApplications.length);
                setShortlistedCount(fetchedApplications.filter(app => app.status === 'Shortlisted').length);

                // Fetch student's interviews
                const interviewsRes = await axios.get(`http://localhost:3000/api/student/interviews/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedInterviews = interviewsRes.data.interviews;
                setInterviews(fetchedInterviews);
                setInterviewsScheduledCount(fetchedInterviews.length);

            } catch (err) {
                // setError('Failed to fetch dashboard data. Please try again.');
                console.error('Student dashboard fetch error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [navigate]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container">
                    <h1>Loading Student Dashboard...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="dashboard-container">
                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

                <div className="dashboard-section">
                    <h2>A quick glance at your application activities:</h2>
                    <p><strong>Total Jobs Applied:</strong> {totalApplied}</p>
                    <p><strong>Shortlisted Applications:</strong> {shortlistedCount}</p>
                    <p><strong>Interviews Scheduled:</strong> {interviewsScheduledCount}</p>
                </div>

                <div className="dashboard-section">
                    <h2>Your Upcoming Interviews</h2>
                    {interviews.length === 0 ? (
                        <p>No interviews scheduled yet.</p>
                    ) : (
                        <ul>
                            {interviews.map((interview) => (
                                <li key={interview._id}>
                                    <div className="list-item-details">
                                        <strong>{interview.jobTitle || 'Job Title N/A'}</strong> at <span style={{ fontWeight: 'bold', color: 'blue' }}>{interview.companyName}</span><br />
                                        Date: {new Date(interview.date).toLocaleDateString()} | Time: {interview.time}
                                    </div>
                                    <div className="list-item-action">
                                        {interview.link && interview.type.toLowerCase() === 'virtual' ? (
                                            <a href={interview.link} target="_blank" rel="noopener noreferrer" className="button">Join Meeting</a>
                                        ) : (
                                            <button className="button" disabled>View Details</button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="dashboard-section">
                    <h2>Recent Application Updates</h2>
                    {applications.length === 0 ? (
                        <p>No applications found yet.</p>
                    ) : (
                        <ul>
                            {applications.map((app) => (
                                <li key={app._id}>
                                    <div className="list-item-details">
                                        <strong>{app.jobTitle}</strong> at <span style={{ fontWeight: 'bold', color: 'blue' }}>{app.companyName}</span> - <span>{app.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="view-all">
                        {/* This link should eventually lead to a page showing all applications in detail */}
                        <a href="#" className="button">View All Applications</a>
                    </p>
                </div>

                <div className="dashboard-section quick-actions">
                    <h2>What would you like to do?</h2>
                    <div className="like-buttons">
                        <Link to="/dashboard/newjobs" className="button">Browse Available Jobs</Link>
                        <Link to="/dashboard/updateprofile" className="button">Update My Profile</Link>
                        <Link to="/dashboard/resume" className="button">View My Resume</Link>
                    </div>
                </div>
            </div>
        </>
    );
}