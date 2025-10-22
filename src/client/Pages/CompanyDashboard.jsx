// src/client/Pages/CompanyDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';
import ScheduleInterviewModal from '../Components/ScheduleInterviewModal.jsx';
import UpdateStatusModal from '../Components/UpdateStatusModal.jsx'; // <-- IMPORT NEW MODAL

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
    const [interviews, setInterviews] = useState([]); 
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [loading, setLoading] = useState(true);

    // State for Interview modal
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // --- NEW STATE FOR STATUS MODAL ---
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);
    // --- END NEW STATE ---

    // Function to fetch all company data
    const fetchCompanyData = async () => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const companyId = localStorage.getItem('userId');

            if (!token || role !== 'company') {
                navigate('/login');
                return;
            }
            
            if (!loading) {
                 setError('');
                 setSuccessMessage('');
            }

            const email = localStorage.getItem('email'); 
            setCompanyName(email || 'My Company'); 

            const jobsRes = await axios.get(`http://localhost:3000/api/company/jobs/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            setJobs(jobsRes.data.jobs);

            const appsRes = await axios.get(`http://localhost:3000/api/company/applications/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            setApplications(appsRes.data.applications);

            const interviewsRes = await axios.get(`http://localhost:3000/api/company/interviews/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            setInterviews(interviewsRes.data.interviews);

        } catch (err) {
            setError('Failed to fetch company data. Please try again.');
            console.error('Company dashboard fetch error:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchCompanyData();
    }, [navigate]);

    const handleNewJobChange = (e) => {
        setNewJob({ ...newJob, [e.target.name]: e.target.value });
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
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
            
            setSuccessMessage('Job posted successfully!'); 
            await fetchCompanyData(); 

            setNewJob({ title: '', description: '', location: '', skillsRequired: '', deadline: '' });
        } catch (err) {
            setError('Failed to post job. Please check your inputs and try again.');
            console.error('Post job error:', err);
        }
    };

    // --- UPDATED: This now just OPENS the status modal ---
    const handleUpdateApplicationStatus = (app) => {
        setSelectedAppForStatus(app);
        setShowStatusModal(true);
    };

    // --- NEW: This function handles the API call ---
    const handleSaveStatus = async (newStatus) => {
        if (!selectedAppForStatus || newStatus === selectedAppForStatus.status) {
            setShowStatusModal(false);
            return;
        }

        const { _id: applicationId, studentId, jobTitle, studentName } = selectedAppForStatus;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `http://localhost:3000/api/applications/${applicationId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setSuccessMessage(res.data.message); 
            
            // Update the state locally
            setApplications(applications.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));

            // If "Interview Scheduled", open the next modal
            if (newStatus.toLowerCase() === 'interview scheduled') {
                setSelectedApplication({ 
                    applicationId, 
                    studentId, 
                    jobTitle, 
                    studentName, 
                    companyId: localStorage.getItem('userId') 
                });
                setShowInterviewModal(true); // Open interview modal
            }

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to update application status.');
            }
            console.error('Update status error:', err);
        } finally {
            setShowStatusModal(false);
            setSelectedAppForStatus(null);
        }
    };
    // --- END NEW FUNCTION ---

    const handleInterviewScheduled = (newInterview) => {
        setInterviews([...interviews, newInterview]);
        fetchCompanyData();
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
                {successMessage && <div className="login-success" style={{ textAlign: 'center', marginBottom: '20px' }}>{successMessage}</div>}

                {/* ... Post a New Job section (unchanged) ... */}
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
                        <input type="date" name="deadline" value={newJob.deadline} onChange={handleNewJobChange} className="input" min={new Date().toISOString().split('T')[0]} required />
                        <button type="submit" className="button" style={{ width: '100%', marginTop: '20px' }}>Post Job</button>
                    </form>
                </div>

                {/* ... My Job Postings section (unchanged) ... */}
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
                                        <Link 
                                            to={`/jobs/${job._id}/applicants`} 
                                            className="button" 
                                            style={{ marginRight: '10px' }}
                                        >
                                            View Applicants
                                        </Link>
                                        <Link 
                                            to={`/jobs/${job._id}/edit`} 
                                            className="button outline"
                                        >
                                            Edit Job
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* --- Candidate Applications section (UPDATED) --- */}
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Candidate Applications</h2>
                    {applications.length === 0 ? (
                        <p>No applications received yet.</p>
                    ) : (
                        <ul>
                            {applications.map((app) => (
                                <li key={app._id} className="job-listing-candidate" style={{ margin: '10px 0' }}>
                                    <div>
                                        <p><strong>Job:</strong> {app.jobTitle}</p>
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
                                        {/* --- UPDATED onClick --- */}
                                        <button
                                            className="button"
                                            onClick={() => handleUpdateApplicationStatus(app)} 
                                        >
                                            Update Status
                                        </button>
                                        {/* --- END UPDATED onClick --- */}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ... Upcoming Interviews section (unchanged) ... */}
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    <h2>Upcoming Interviews</h2>
                    {interviews.length === 0 ? (
                        <p>No interviews scheduled yet.</p>
                    ) : (
                        <ul>
                            {interviews.map((interview) => (
                                <li key={interview._id}>
                                    <div className="list-item-details">
                                        <strong>{interview.jobTitle}</strong>
                                        <p>Date: {new Date(interview.date).toLocaleDateString()} | Time: {interview.time}</p>
                                        <p>Type: {interview.type}</p>
                                    </div>
                                    <div className="list-item-action">
                                        {interview.link && interview.type.toLowerCase() === 'virtual' ? (
                                            <a href={interview.link} target="_blank" rel="noopener noreferrer" className="button">Join Meeting</a>
                                        ) : (
                                            <button className="button" disabled>Meeting Details</button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* --- ADD MODALS TO JSX --- */}
            {/* Interview Modal */}
            {showInterviewModal && selectedApplication && (
                <ScheduleInterviewModal
                    applicationId={selectedApplication.applicationId}
                    studentId={selectedApplication.studentId}
                    jobTitle={selectedApplication.jobTitle}
                    studentName={selectedApplication.studentName}
                    companyId={selectedApplication.companyId}
                    companyName={companyName}
                    onClose={() => setShowInterviewModal(false)}
                    onInterviewScheduled={handleInterviewScheduled}
                />
            )}
            {/* Status Update Modal */}
            {showStatusModal && selectedAppForStatus && (
                <UpdateStatusModal
                    application={selectedAppForStatus}
                    onClose={() => setShowStatusModal(false)}
                    onSave={handleSaveStatus}
                />
            )}
            {/* --- END ADD MODALS --- */}
        </>
    );
}