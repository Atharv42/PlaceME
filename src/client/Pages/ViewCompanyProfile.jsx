import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css'; 

export default function ViewCompanyProfile() {
    const { companyId } = useParams(); 
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); 
                    return;
                }

                const res = await axios.get(`http://localhost:3000/api/company/profile/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCompany(res.data.company);
            } catch (err) {
                setError('Failed to fetch company profile.');
                console.error('View company profile error:', err);
                if (err.response && err.response.status === 404) {
                     setError('Company profile not found.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [companyId, navigate]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container"><h1>Loading Company Profile...</h1></div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="dashboard-container">
                     <Link to="/dashboard/newJobs" className="button outline" style={{ marginBottom: '20px' }}>
                        &larr; Back to Jobs
                    </Link>
                    <h1 className="browse-jobs-title">Company Profile</h1>
                    <p className="login-error" style={{ textAlign: 'center' }}>{error}</p>
                </div>
            </>
        );
    }

    if (!company) {
        return (
             <>
                <Header />
                <div className="dashboard-container">
                    <h1 className="browse-jobs-title">Company Profile Not Found</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="dashboard-container">
                
                <Link to="/dashboard/newJobs" className="button outline" style={{ marginBottom: '20px', flexBasis: '100%' }}>
                    &larr; Back to Browse Jobs
                </Link>

                <div className="dashboard-section" style={{ flexBasis: '100%', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {company.logoUrl && (
                        <img
                            src={company.logoUrl}
                            alt={`${company.companyName} Logo`}
                            style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #eee' }}
                        />
                    )}
                    <div>
                        <h1 style={{ marginTop: 0, marginBottom: '10px' }}>{company.companyName}</h1>
                        {company.website && (
                            <p>
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="button outline small">
                                    Visit Website
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                {company.description && (
                     <div className="dashboard-section" style={{ flexBasis: '100%' }}>
                        <h2>About {company.companyName}</h2>
                        
                        <p style={{ whiteSpace: 'pre-wrap' }}>{company.description}</p>
                    </div>
                )}

               
            </div>
        </>
    );
}