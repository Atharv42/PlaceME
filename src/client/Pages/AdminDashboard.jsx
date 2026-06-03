import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    
    // Data states
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    
    // View state
    const [view, setView] = useState('stats'); // 'stats', 'students', 'companies', 'jobs'
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch all admin data
    const fetchData = async (viewName) => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            let res;
            switch(viewName) {
                case 'students':
                    res = await api.get('/api/admin/students', { headers: { Authorization: `Bearer ${token}` } });
                    setStudents(res.data.students);
                    break;
                case 'companies':
                    res = await api.get('/api/admin/companies', { headers: { Authorization: `Bearer ${token}` } });
                    setCompanies(res.data.companies);
                    break;
                case 'jobs':
                    res = await api.get('/api/admin/jobs', { headers: { Authorization: `Bearer ${token}` } });
                    setJobs(res.data.jobs);
                    break;
                case 'stats':
                default:
                    res = await api.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
                    setStats(res.data);
                    break;
            }
        } catch (err) {
            setError('Failed to fetch data.');
            console.error('Admin fetch error:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch for stats
    useEffect(() => {
        fetchData('stats');
    }, [navigate]);
    
    // Refetch data when view changes
    useEffect(() => {
        fetchData(view);
    }, [view]);

    // --- Admin Actions ---
    
    const handleVerifyCompany = async (companyId) => {
        if (!window.confirm("Are you sure you want to verify this company?")) return;
        
        setError(''); setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/api/admin/companies/${companyId}/verify`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(res.data.message);
            // Refresh company list
            fetchData('companies');
        } catch (err) {
            setError('Failed to verify company.');
        }
    };
    
    const handleDeleteCompany = async (companyId) => {
        if (!window.confirm("DELETE this company? This is permanent.")) return;
        
        setError(''); setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/admin/companies/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage("Company deleted.");
            fetchData('companies');
        } catch (err) {
            setError('Failed to delete company.');
        }
    };
    
    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("DELETE this student? This is permanent.")) return;
        
        setError(''); setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/admin/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage("Student deleted.");
            fetchData('students');
        } catch (err) {
            setError('Failed to delete student.');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("DELETE this job posting? This is permanent.")) return;
        
        setError(''); setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/admin/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage("Job deleted.");
            fetchData('jobs');
        } catch (err) {
            setError('Failed to delete job.');
        }
    };

    return (
        <>
            <Header /> 
            <div className="dashboard-container">
                <h1 className="browse-jobs-title">Admin Dashboard</h1>

                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}
                {successMessage && <div className="login-success" style={{ textAlign: 'center', marginBottom: '20px' }}>{successMessage}</div>}
                
                
                <div className="dashboard-section quick-actions" style={{ flexBasis: '100%' }}>
                    <div className="like-buttons">
                        <button className={`button ${view === 'stats' ? '' : 'outline'}`} onClick={() => setView('stats')}>Dashboard Stats</button>
                        <button className={`button ${view === 'companies' ? '' : 'outline'}`} onClick={() => setView('companies')}>Manage Companies</button>
                        <button className={`button ${view === 'students' ? '' : 'outline'}`} onClick={() => setView('students')}>Manage Students</button>
                        <button className={`button ${view === 'jobs' ? '' : 'outline'}`} onClick={() => setView('jobs')}>Manage Jobs</button>
                    </div>
                </div>

                
                <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            {view === 'stats' && stats && (
                                <div>
                                    <h2>Platform Statistics</h2>
                                    <p><strong>Total Students:</strong> {stats.students}</p>
                                    <p><strong>Total Companies:</strong> {stats.companies}</p>
                                    <p><strong>Pending Verification:</strong> {stats.pendingCompanies}</p>
                                    <p><strong>Total Job Postings:</strong> {stats.jobs}</p>
                                </div>
                            )}

                            {view === 'companies' && (
                                <div>
                                    <h2>Manage Companies ({companies.length})</h2>
                                    <ul>
                                        {companies.map(c => (
                                            <li key={c._id} className="job-listing-candidate">
                                                <div>
                                                    <strong>{c.companyName}</strong> ({c.companyEmail})<br/>
                                                    Status: {c.isVerified ? 
                                                        <span style={{color: 'green'}}>Verified</span> : 
                                                        <span style={{color: 'orange'}}>Pending</span>
                                                    }
                                                </div>
                                                <div className="list-item-action">
                                                    {!c.isVerified && (
                                                        <button className="button" style={{marginRight: '10px'}} onClick={() => handleVerifyCompany(c._id)}>Verify</button>
                                                    )}
                                                    <button className="button outline" onClick={() => handleDeleteCompany(c._id)}>Delete</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {view === 'students' && (
                                <div>
                                    <h2>Manage Students ({students.length})</h2>
                                    <ul>
                                        {students.map(s => (
                                            <li key={s._id} className="job-listing-candidate">
                                                <div>
                                                    <strong>{s.firstName} {s.lastName}</strong> ({s.email})<br/>
                                                    Contact: {s.contact}
                                                </div>
                                                <div className="list-item-action">
                                                    <button className="button outline" onClick={() => handleDeleteStudent(s._id)}>Delete</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {view === 'jobs' && (
                                <div>
                                    <h2>Manage Jobs ({jobs.length})</h2>
                                    <ul>
                                        {jobs.map(j => (
                                            <li key={j._id} className="job-listing-candidate">
                                                <div>
                                                    <strong>{j.title}</strong><br/>
                                                    Company: {j.company} | Location: {j.location}
                                                </div>
                                                <div className="list-item-action">
                                                    <button className="button outline" onClick={() => handleDeleteJob(j._id)}>Delete</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
