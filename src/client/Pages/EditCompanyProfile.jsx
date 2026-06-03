import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../header.jsx';
import '../index.css';

export default function EditCompanyProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '', 
        website: '',
        description: '',
        logoUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const companyId = localStorage.getItem('userId');

                if (!token || role !== 'company') {
                    navigate('/login');
                    return;
                }

                const res = await api.get(`/api/company/profile/${companyId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const profile = res.data.company;
                setFormData({
                    companyName: profile.companyName || '', 
                    website: profile.website || '',
                    description: profile.description || '',
                    logoUrl: profile.logoUrl || '',
                });

            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error('Fetch company profile error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const companyId = localStorage.getItem('userId');

            const updateData = {
                website: formData.website,
                description: formData.description,
                logoUrl: formData.logoUrl,
            };

            const res = await api.put(`/api/company/profile/${companyId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage(res.data.message);
            
            const updatedProfile = res.data.company;
             setFormData({
                 companyName: updatedProfile.companyName, 
                 website: updatedProfile.website || '',
                 description: updatedProfile.description || '',
                 logoUrl: updatedProfile.logoUrl || '',
             });

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to update profile.');
            }
            console.error('Update company profile error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="dashboard-container"><h1>Loading Profile...</h1></div>
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
                <h1 className="update-profile-title">Edit Company Profile ({formData.companyName})</h1>

                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                {successMessage && <div className="login-success" style={{ textAlign: 'center', marginBottom: '15px' }}>{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <label className="login-label">Company Website</label>
                    <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="e.g., https://www.yourcompany.com"
                        className="input"
                    />

                    <label className="login-label">Company Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell students about your company..."
                        className="input"
                        rows="5"
                    />

                    <label className="login-label">Logo URL</label>
                    <input
                        type="url"
                        name="logoUrl"
                        value={formData.logoUrl}
                        onChange={handleChange}
                        placeholder="e.g., https://www.yourcompany.com/logo.png"
                        className="input"
                    />

                    <button type="submit" className="button" style={{ width: '100%', marginTop: '20px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </>
    );
}
