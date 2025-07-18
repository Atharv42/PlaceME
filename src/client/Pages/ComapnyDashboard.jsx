// src/client/Pages/CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header.jsx'; // Assuming you want to reuse the existing header
import '../index.css'; // Reusing general styles for buttons and containers

export default function CompanyDashboard() {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        location: '',
        skillsRequired: '', // Comma-separated string for input
        deadline: '',
    });
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const userId = localStorage.getItem('userId');

                if (!token || role !== 'company') {
                    navigate('/login'); // Redirect if not logged in as a company
                    return;
                }

                // Fetch company profile (assuming an endpoint for this)
                // This endpoint needs to be implemented on the backend.
                // For now, we'll just set a placeholder company name.
                // Example: const companyRes = await axios.get(`http://localhost:3000/api/company/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                // setCompanyName(companyRes.data.companyName);
                setCompanyName('Your Company Name'); // Placeholder

                // Fetch jobs posted by this company (needs backend implementation)
                // Example: const jobsRes = await axios.get(`http://localhost:3000/api/company/jobs/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                // setJobs(jobsRes.data.jobs);
                setJobs([
                    { id: 'job1', title: 'Senior Software Engineer', location: 'Remote', deadline: '2025-08-30', applicants: 5, status: 'Open' },
                    { id: 'job2', title: 'Marketing Specialist', location: 'New York, USA', deadline: '2025-09-15', applicants: 3, status: 'Open' },
                ]);


                // Fetch applications for all company's jobs (needs backend implementation)
                // Example: const appsRes = await axios.get(`http://localhost:3000/api/company/applications/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                // setApplications(appsRes.data.applications);
                setApplications([
                    { id: 'app1', jobId: 'job1', studentName: 'John Doe', status: 'Pending', studentId: 'student1' },
                    { id: 'app2', jobId: 'job1', studentName: 'Jane Smith', status: 'Shortlisted', studentId: 'student2' },
                    { id: 'app3', jobId: 'job2', studentName: 'Alice Johnson', status: 'Pending', studentId: 'student3' },
                ]);

            } catch (err) {
                setError('Failed to fetch company data. Please try again.');
                console.error('Company dashboard fetch error:', err);
                // Optionally redirect to login if token is invalid/expired
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [navigate]);

    const handleNewJobChange = (e) => {
        setNewJob({ ...newJob, [e.target.name]: e.target.value });
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const companyId = localStorage.getItem('userId'); // Assuming userId stored is companyId

            const jobData = {
                companyId: companyId,
                title: newJob.title,
                description: newJob.description,
                location: newJob.location,
                skillsRequired: newJob.skillsRequired.split(',').map(skill => skill.trim()), // Convert to array
                deadline: new Date(newJob.deadline).toISOString(), // Ensure ISO format for backend
                postedDate: new Date().toISOString(),
                company: companyName // Use the fetched/placeholder company name
            };

            // This API endpoint needs to be implemented on the backend in a new route (e.g., /api/jobs)
            const res = await axios.post('http://localhost:3000/api/jobs', jobData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Job posted successfully:', res.data);
            alert('Job posted successfully!');
            setJobs([...jobs, { ...jobData, id: res.data.jobId || Math.random().toString(36).substring(7) }]); // Add new job to state
            setNewJob({ title: '', description: '', location: '', skillsRequired: '', deadline: '' }); // Clear form
        } catch (err) {
            setError('Failed to post job. Please check your inputs and try again.');
            console.error('Post job error:', err);
        }
    };

    const handleUpdateApplicationStatus = async (applicationId, currentStatus, studentId) => {
        const newStatus = prompt(`Change status for application ${applicationId} (Current: ${currentStatus}). Enter new status (e.g., Shortlisted, Rejected, Interview Scheduled):`);
        if (newStatus && newStatus.trim() !== currentStatus) {
            try {
                const token = localStorage.getItem('token');
                // This API endpoint needs to be implemented on the backend
                const res = await axios.put(`http://localhost:3000/api/applications/${applicationId}/status`,
                    { status: newStatus.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert(`Application status updated to: ${newStatus.trim()}`);
                setApplications(applications.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus.trim() } : app
                ));

                // Optional: If status is 'Interview Scheduled', prompt for interview details
                if (newStatus.trim().toLowerCase() === 'interview scheduled') {
                    const interviewDate = prompt('Enter interview date (YYYY-MM-DD):');
                    const interviewTime = prompt('Enter interview time (HH:MM):');
                    const interviewType = prompt('Enter interview type (e.g., Virtual, On-site):');
                    const interviewLink = prompt('Enter interview link (if virtual):');

                    if (interviewDate && interviewTime && interviewType && interviewLink) {
                        const interviewData = {
                            applicationId: applicationId,
                            companyId: localStorage.getItem('userId'),
                            studentId: studentId, // Pass studentId from application
                            date: new Date(`${interviewDate}T${interviewTime}:00`).toISOString(),
                            time: interviewTime,
                            type: interviewType,
                            link: interviewLink,
                        };
                        // This API endpoint needs to be implemented on the backend (e.g., /api/interviews)
                        await axios.post('http://localhost:3000/api/interviews', interviewData, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        alert('Interview scheduled successfully!');
                    } else {
                        alert('Interview details incomplete, interview not scheduled.');
                    }
                }

            } catch (err) {
                setError('Failed to update application status.');
                console.error('Update status error:', err);
            }
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container">
                    <h1>Loading Company Dashboard...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="dashboard-container">
                <h1 className="browse-jobs-title">Welcome, {companyName}!</h1>
                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

                {/* Section 1: Post a New Job */}
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Post a New Job Opening</h2>
                    <form onSubmit={handlePostJob}>
                        <label className="login-label">Job Title</label>
                        <input
                            type="text"
                            name="title"
                            value={newJob.title}
                            onChange={handleNewJobChange}
                            className="input"
                            placeholder="e.g., Software Development Engineer Intern"
                            required
                        />
                        <label className="login-label">Description</label>
                        <textarea
                            name="description"
                            value={newJob.description}
                            onChange={handleNewJobChange}
                            className="input"
                            rows="4"
                            placeholder="Detailed job description..."
                            required
                        ></textarea>
                        <label className="login-label">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={newJob.location}
                            onChange={handleNewJobChange}
                            className="input"
                            placeholder="e.g., Bangalore, India (Hybrid)"
                            required
                        />
                        <label className="login-label">Skills Required (comma-separated)</label>
                        <input
                            type="text"
                            name="skillsRequired"
                            value={newJob.skillsRequired}
                            onChange={handleNewJobChange}
                            className="input"
                            placeholder="e.g., Python, Java, Data Structures, Algorithms"
                            required
                        />
                        <label className="login-label">Application Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={newJob.deadline}
                            onChange={handleNewJobChange}
                            className="input"
                            required
                        />
                        <button type="submit" className="button" style={{ width: '100%', marginTop: '20px' }}>
                            Post Job
                        </button>
                    </form>
                </div>

                {/* Section 2: My Job Postings */}
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>My Job Postings</h2>
                    {jobs.length === 0 ? (
                        <p>You haven't posted any jobs yet.</p>
                    ) : (
                        <ul>
                            {jobs.map((job) => (
                                <li key={job.id} className="job-listing" style={{ margin: '10px 0' }}>
                                    <div>
                                        <h3 className="job-title">{job.title}</h3>
                                        <p><strong>Location:</strong> {job.location}</p>
                                        <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                                        <p><strong>Applicants:</strong> {job.applicants}</p> {/* Placeholder, will come from backend */}
                                        <p><strong>Status:</strong> {job.status}</p> {/* Placeholder, will come from backend */}
                                    </div>
                                    <div className="list-item-action">
                                        {/* You'd add buttons here for View Applicants, Edit Job, Delete Job */}
                                        <button className="button" style={{ marginRight: '10px' }}>View Applicants</button>
                                        <button className="button">Edit Job</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Section 3: Candidate Applications (for all jobs) */}
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Candidate Applications</h2>
                    {applications.length === 0 ? (
                        <p>No applications received yet.</p>
                    ) : (
                        <ul>
                            {applications.map((app) => (
                                <li key={app.id} className="job-listing" style={{ margin: '10px 0' }}>
                                    <div>
                                        <p><strong>Job:</strong> {jobs.find(job => job.id === app.jobId)?.title || 'N/A'}</p>
                                        <p><strong>Applicant:</strong> {app.studentName}</p>
                                        <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{app.status}</span></p>
                                    </div>
                                    <div className="list-item-action">
                                        {/* You'd link to a detailed student profile page here */}
                                        <button className="button" style={{ marginRight: '10px' }} onClick={() => alert(`View profile for ${app.studentName} (ID: ${app.studentId})`)}>View Profile</button>
                                        <button
                                            className="button"
                                            onClick={() => handleUpdateApplicationStatus(app.id, app.status, app.studentId)}
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Section 4: Upcoming Interviews (optional, can be integrated into applications) */}
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Upcoming Interviews</h2>
                    {/* This would fetch from interviewSchema */}
                    <p>No interviews scheduled yet. (Backend API for fetching interviews needed)</p>
                    {/* Example interview listing (will be dynamic later)
                    <ul>
                        <li>
                            <div className="list-item-details">
                                <strong>Software Engineer</strong> Interview with John Doe<br />
                                Date: July 25, 2025 | Time: 11:00 AM IST
                            </div>
                            <div className="list-item-action">
                                <a href="#" className="button">View Details</a>
                            </div>
                        </li>
                    </ul>
                    */}
                </div>
            </div>
        </>
    );
}