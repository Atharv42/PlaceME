import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
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
    const [filters, setFilters] = useState({
        search: '',
        location: ''
    });
    const [isSearching, setIsSearching] = useState(false);
   
    const fetchJobsAndApps = async () => {
        setLoading(true);
        setError(''); 
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

           
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.location) params.location = filters.location;

            const jobsRes = await axios.get('/api/jobs', {
                headers: { Authorization: `Bearer ${token}` },
                params: params 
            });
           
            setJobs(jobsRes.data.jobs);
            if (jobsRes.data.jobs.length === 0) {
                setError('No jobs found matching your criteria.');
            }

            
            const appsRes = await axios.get(`/api/student/applications/${userId}`, {
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
            setIsSearching(false); 
        }
    };

    
    useEffect(() => {
        fetchJobsAndApps();
    }, [navigate]); 

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        fetchJobsAndApps();
    };
   
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

            const res = await axios.post('/api/apply-job', applicationData, {
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
               

                {successMessage && <div className="login-success" style={{ textAlign: 'center', margin: '20px 0' }}>{successMessage}</div>}
                
               
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
                            <h4 className="company-name">
                                <Link to={`/company-profile/${job.companyId}`} title={`View profile for ${job.company}`}>
                                    {job.company}
                                </Link>
                            </h4>
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