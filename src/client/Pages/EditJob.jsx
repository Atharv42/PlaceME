import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';

// Helper function to format date to YYYY-MM-DD
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

export default function EditJob() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    
    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        location: '',
        skillsRequired: '', 
        deadline: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const res = await api.get(`/api/jobs/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const { job } = res.data;
                setJobData({
                    title: job.title,
                    description: job.description,
                    location: job.location,
                    skillsRequired: job.skillsRequired.join(', '), 
                    deadline: formatDateForInput(job.deadline), 
                });

            } catch (err) {
                setError('Failed to fetch job details.');
                console.error('Fetch job error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId, navigate]);

    const handleChange = (e) => {
        setJobData({
            ...jobData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const companyId = localStorage.getItem('userId'); 
            const companyName = "My Company"; 

            
            const updatePayload = {
                ...jobData,
                skillsRequired: jobData.skillsRequired.split(',').map(skill => skill.trim()),
                deadline: new Date(jobData.deadline).toISOString(),
               
                companyId: companyId,
                company: companyName,
                postedDate: new Date().toISOString() 
            };
            
            const res = await api.put(`/api/jobs/${jobId}`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage('Job updated successfully!');
           
            setTimeout(() => {
                 navigate('/company-dashboard');
            }, 1500);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to update job.');
            }
            console.error('Update job error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container"><h1>Loading Job Details...</h1></div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="update-profile-container">
                <Link to="/company-dashboard" className="button outline" style={{ marginBottom: '20px' }}>
                    &larr; Back to Dashboard
                </Link>
                <h1 className="update-profile-title">Edit Job Opening</h1>

                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                {successMessage && <div className="login-success" style={{ textAlign: 'center', marginBottom: '15px' }}>{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <label className="login-label">Job Title</label>
                    <input type="text" name="title" value={jobData.title} onChange={handleChange} className="input" required />
                    
                    <label className="login-label">Description</label>
                    <textarea name="description" value={jobData.description} onChange={handleChange} className="input" rows="4" required></textarea>
                    
                    <label className="login-label">Location</label>
                    <input type="text" name="location" value={jobData.location} onChange={handleChange} className="input" required />
                    
                    <label className="login-label">Skills Required (comma-separated)</label>
                    <input type="text" name="skillsRequired" value={jobData.skillsRequired} onChange={handleChange} className="input" required />
                    
                    <label className="login-label">Application Deadline</label>
                    <input type="date" name="deadline" value={jobData.deadline} onChange={handleChange} className="input" min={new Date().toISOString().split('T')[0]} required />
                    
                    <button type="submit" className="button" style={{ width: '100%', marginTop: '20px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </>
    );
}
