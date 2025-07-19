// src/client/Pages/CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';

export default function CompanyDashboard() {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        location: '',
        skillsRequired: '',
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
                const companyId = localStorage.getItem('userId');

                // --- DEBUGGING LOGS ---
                console.log('CompanyDashboard useEffect - Initial Check:');
                console.log('Token:', token ? 'Exists' : 'Does NOT exist');
                console.log('Role:', role);
                console.log('Company ID:', companyId);
                // --- END DEBUGGING LOGS ---

                if (!token || role !== 'company') {
                    console.log('Redirecting to login: Token missing or Role is not "company"');
                    navigate('/login'); // Redirect if not logged in as a company
                    return;
                }

                setCompanyName('Your Company Name'); // Placeholder for company name for now

                // Fetch jobs posted by this company
                const jobsRes = await axios.get(`http://localhost:3000/api/company/jobs/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
                setJobs(jobsRes.data.jobs);

                // Fetch applications for this company
                const appsRes = await axios.get(`http://localhost:3000/api/company/applications/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
                setApplications(appsRes.data.applications); // FIXED: Changed appsRes.data.app to appsRes.data.applications

            } catch (err) {
                setError('Failed to fetch company data. Please try again.');
                console.error('Company dashboard fetch error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    console.log('Redirecting to login due to API error (401/403)');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, [navigate]); // Added navigate to dependency array

    const handleNewJobChange = (e) => {
        setNewJob({ ...newJob, [e.target.name]: e.target.value });
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            const companyId = localStorage.getItem('userId');

            const jobData = {
                companyId: companyId,
                title: newJob.title,
                description: newJob.description,
                location: newJob.location,
                skillsRequired: newJob.skillsRequired.split(',').map(skill => skill.trim()),
                deadline: new Date(newJob.deadline).toISOString(),
                postedDate: new Date().toISOString(),
                company: companyName
            };

            const res = await axios.post('http://localhost:3000/api/jobs', jobData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Job posted successfully:', res.data);
            alert('Job posted successfully!');

            const updatedJobsRes = await axios.get(`http://localhost:3000/api/company/jobs/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            setJobs(updatedJobsRes.data.jobs);

            setNewJob({ title: '', description: '', location: '', skillsRequired: '', deadline: '' });
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
                const res = await axios.put(`http://localhost:3000/api/applications/${applicationId}/status`,
                    { status: newStatus.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert(`Application status updated to: ${newStatus.trim()}`);
                setApplications(applications.map(app =>
                    app._id === applicationId ? { ...app, status: newStatus.trim() } : app // Used _id here for consistency
                ));

                if (newStatus.trim().toLowerCase() === 'interview scheduled') {
                    const interviewDate = prompt('Enter interview date (YYYY-MM-DD):');
                    const interviewTime = prompt('Enter interview time (HH:MM):');
                    const interviewType = prompt('Enter interview type (e.g., Virtual, On-site):');
                    const interviewLink = prompt('Enter interview link (if virtual):');

                    if (interviewDate && interviewTime && interviewType && interviewLink) {
                        const interviewData = {
                            applicationId: applicationId,
                            companyId: localStorage.getItem('userId'),
                            studentId: studentId,
                            date: new Date(`${interviewDate}T${interviewTime}:00`).toISOString(),
                            time: interviewTime,
                            type: interviewType,
                            link: interviewLink,
                        };
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

                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Post a New Job Opening</h2>
                    <form onSubmit={handlePostJob}>
                        <label className="login-label">Job Title</label>
                        <input type="text" name="title" value={newJob.title} onChange={handleNewJobChange} className="input" placeholder="e.g., Software Development Engineer Intern" required />
                        <label className="login-label">Description</label>
                        <textarea name="description" value={newJob.description} onChange={handleNewJobChange} className="input" rows="4" placeholder="Detailed job description..." required></textarea>
                        <label className="login-label">Location</label>
                        <input type="text" name="location" value={newJob.location} onChange={handleNewJobChange} className="input" placeholder="e.g., Bangalore, India (Hybrid)" required />
                        <label className="login-label">Skills Required (comma-separated)</label>
                        <input type="text" name="skillsRequired" value={newJob.skillsRequired} onChange={handleNewJobChange} className="input" placeholder="e.g., Python, Java, Data Structures, Algorithms" required />
                        <label className="login-label">Application Deadline</label>
                        <input type="date" name="deadline" value={newJob.deadline} onChange={handleNewJobChange} className="input" required />
                        <button type="submit" className="button" style={{ width: '100%', marginTop: '20px' }}>Post Job</button>
                    </form>
                </div>

                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>My Job Postings</h2>
                    {jobs.length === 0 ? (
                        <p>You haven't posted any jobs yet.</p>
                    ) : (
                        <ul>
                            {jobs.map((job) => (
                                <li key={job._id} className="job-listing-candidate" style={{ margin: '10px 0' }}>
                                    <div>
                                        <h3 className="job-title">{job.title}</h3>
                                        <h5 className="company-name">{job.company}</h5>
                                        <p><strong>Location:</strong> {job.location}</p>
                                        <p><strong>Skills:</strong> {job.skillsRequired.join(', ')}</p>
                                        <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                                        <p><strong>Posted On:</strong> {new Date(job.postedDate).toLocaleDateString()}</p>
                                        <p><strong>Applicants:</strong> {applications.filter(app => app.jobId === job._id).length}</p>
                                    </div>
                                    <div className="list-item-action">
                                        <button className="button" style={{ marginRight: '10px' }}>View Applicants</button>
                                        <button className="button">Edit Job</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Candidate Applications</h2>
                    {applications.length === 0 ? (
                        <p>No applications received yet.</p>
                    ) : (
                        <ul>
                            {applications.map((app) => (
                                <li key={app._id} className="job-listing-candidate" style={{ margin: '10px 0' }}> {/* Used _id here for consistency */}
                                    <div>
                                        <p><strong>Job:</strong> {app.jobTitle}</p>
                                        <p><strong>Applicant:</strong> {app.studentName}</p>
                                        <p><strong>Email:</strong> {app.studentEmail}</p>
                                        <p><strong>Contact:</strong> {app.studentContact}</p>
                                        <p><strong>Applied On:</strong> {new Date(app.appliedDate).toLocaleDateString()}</p>
                                        <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{app.status}</span></p>
                                    </div>
                                    <div className="list-item-action">
                                        <button className="button" style={{ marginRight: '10px' }} onClick={() => window.open(app.studentResumeUrl, '_blank')}>View Resume</button>
                                        <button
                                            className="button"
                                            onClick={() => handleUpdateApplicationStatus(app._id, app.status, app.studentId)} 
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Upcoming Interviews</h2>
                    <p>No interviews scheduled yet. (Backend API for fetching interviews needed)</p>
                </div>
            </div>
        </>
    );
}