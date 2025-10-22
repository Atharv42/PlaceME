// src/client/Pages/browseJobs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Header from '../header.jsx'; 
import '../index.css'; 

export default function BrowseJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [studentId, setStudentId] = useState('');
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());

    // --- NEW STATES FOR FILTERS ---
    const [filters, setFilters] = useState({
        search: '',
        location: ''
    });
    const [isSearching, setIsSearching] = useState(false);
    // --- END NEW STATES ---

    // Encapsulate fetch logic to call it from multiple places
    const fetchJobsAndApps = async () => {
        setLoading(true);
        setError(''); // Clear error on new search
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const userId = localStorage.getItem('userId');

            if (!token || role !== 'student') {
                navigate('/login');
                return;
            }

            setUserRole(role);
            setStudentId(userId);

            // --- UPDATED API CALL ---
            // Pass filters as query params
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.location) params.location = filters.location;

            const jobsRes = await axios.get('http://localhost:3000/api/jobs', {
                headers: { Authorization: `Bearer ${token}` },
                params: params // Send the query params
            });
            // --- END UPDATED API CALL ---
            
            setJobs(jobsRes.data.jobs);
            if (jobsRes.data.jobs.length === 0) {
                setError('No jobs found matching your criteria.');
            }

            // Fetch student's existing applications (this can stay the same)
            const appsRes = await axios.get(`http://localhost:3000/api/student/applications/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const appliedIds = new Set(appsRes.data.applications.map(app => app.jobId));
            setAppliedJobIds(appliedIds);

        } catch (err) {
            setError('Failed to fetch jobs. Please try again.');
            console.error('Browse jobs fetch error:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
            setIsSearching(false); // Done searching
        }
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchJobsAndApps();
    }, [navigate]); // Only run once on mount

    // --- NEW HANDLERS ---
    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        fetchJobsAndApps(); // Refetch with new filters
    };
    // --- END NEW HANDLERS ---

    const handleApply = async (jobId) => {
        setError('');
        setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            const studentId = localStorage.getItem('userId'); 

            const applicationData = {
                jobId: jobId,
                studentId: studentId,
            };

            const res = await axios.post('http://localhost:3000/api/apply-job', applicationData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccessMessage(res.data.message); 
            
            setAppliedJobIds(prevIds => new Set(prevIds).add(jobId));

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); 
            } else {
                setError('Failed to apply for job. Please try again.'); 
            }
            console.error('Apply job error:', err);
        }
    };

    return (
        <>
            <Header />
            <div className="browse-jobs-container">
                <h1 className="browse-jobs-title">Browse Available Jobs</h1>

                {/* --- NEW SEARCH FORM --- */}
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        name="search"
                        className="input"
                        placeholder="Search by job title or skill (e.g., 'React', 'Python')"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                    <input
                        type="text"
                        name="location"
                        className="input"
                        placeholder="Search by location (e.g., 'Bangalore')"
                        value={filters.location}
                        onChange={handleFilterChange}
                    />
                    <button type="submit" className="button" disabled={isSearching}>
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
                {/* --- END NEW SEARCH FORM --- */}

                {successMessage && <div className="login-success" style={{ textAlign: 'center', margin: '20px 0' }}>{successMessage}</div>}
                
                {/* Updated Loading/Error checks */}
                {loading ? (
                    <p style={{ textAlign: 'center', fontSize: '1.2em', marginTop: '20px' }}>Loading jobs...</p>
                ) : error ? (
                    <div className="login-error" style={{ textAlign: 'center', margin: '20px 0' }}>{error}</div>
                ) : jobs.length === 0 ? (
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
                            {userRole === 'student' && ( 
                                <button
                                    className="apply-button"
                                    onClick={() => handleApply(job._id)}
                                    disabled={appliedJobIds.has(job._id)} 
                                >
                                    {appliedJobIds.has(job._id) ? 'Applied' : 'View Details & Apply'}
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}