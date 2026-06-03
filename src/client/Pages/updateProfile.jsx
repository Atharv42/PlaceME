
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../header.jsx'; 
import '../index.css'; 
import { Link } from 'react-router-dom'; 

export default function UpdateProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        address: '',
        education: '',
        skills: '',
        experience: '',
        resumeUrl: '',
    });

   
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
   

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const role = localStorage.getItem('role');
                const studentId = localStorage.getItem('userId');

                if (!token || role !== 'student') {
                    navigate('/login'); 
                    return;
                }

                const res = await axios.get(`/api/student/profile/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const studentProfile = res.data.student;
                setFormData({
                    firstName: studentProfile.firstName || '',
                    lastName: studentProfile.lastName || '',
                    email: studentProfile.email || '',
                    contact: studentProfile.contact || '',
                    address: studentProfile.address || '',
                    education: studentProfile.education || '',
                    skills: studentProfile.skills || '',
                    experience: studentProfile.experience || '',
                    resumeUrl: studentProfile.resumeUrl || '',
                });

            } catch (err) {
                setError('Failed to fetch profile data. Please try again.');
                console.error('Fetch profile error:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type !== 'application/pdf') {
            setError('Only .pdf files are allowed.');
            setSelectedFile(null);
            e.target.value = null; 
        } else if (file && file.size > 5 * 1024 * 1024) { 
             setError('File is too large. Max 5MB allowed.');
             setSelectedFile(null);
             e.target.value = null; 
        } else {
            setSelectedFile(file);
            setError(''); 
        }
    };
   
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const studentId = localStorage.getItem('userId');
            
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                contact: formData.contact,
                address: formData.address,
                education: formData.education,
                skills: formData.skills,
                experience: formData.experience,
                
            };
            
            const res = await axios.put(`/api/student/profile/${studentId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage(res.data.message); 
            setFormData(res.data.student); 

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); 
            } else {
                setError('Failed to update profile. Please try again.'); 
            }
            console.error('Update profile error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

   
    const handleResumeUpload = async () => {
        if (!selectedFile) {
            setError('Please select a PDF file to upload.');
            return;
        }
        
        setError('');
        setSuccessMessage('');
        setUploading(true);

        const token = localStorage.getItem('token');
        const studentId = localStorage.getItem('userId');
        
        const uploadFormData = new FormData();
        uploadFormData.append('resume', selectedFile); 

        try {
            const res = await axios.post(
                `/api/student/profile/${studentId}/upload-resume`,
                uploadFormData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' 
                    }
                }
            );

            setSuccessMessage(res.data.message);
            // Update the form data with the new URL
            setFormData({...formData, resumeUrl: res.data.resumeUrl});
            setSelectedFile(null);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); 
            } else {
                setError('Failed to upload resume. Please try again.'); 
            }
            console.error('Upload resume error:', err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="update-profile-container">
                    <h1>Loading Profile...</h1>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="update-profile-container">
                <h1 className="update-profile-title">Update your profile</h1>
                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                {successMessage && <div className="login-success" style={{ textAlign: 'center', marginBottom: '15px' }}>{successMessage}</div>}

               
                <form onSubmit={handleProfileSubmit}>
                    <label className="update-profile-fillup">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="input" required />
                    
                    <label className="update-profile-fillup">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="input" required />
                    
                    <label className="update-profile-fillup">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input" required />
                    
                    <label className="update-profile-fillup">Contact No.</label>
                    <input type="text" name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact No." className="input" required />
                    
                    <label className="update-profile-fillup">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="input" required />
                    
                    <label className="update-profile-fillup">Education</label>
                    <input type="text" name="education" value={formData.education} onChange={handleChange} placeholder="e.g., B.Tech Computer Science, University Name, Year" className="input" required />
                    
                    <label className="update-profile-fillup">Skills (comma-separated)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder=" e.g., Python, JavaScript, React, SQL" className="input" required />
                    
                    <label className="update-profile-fillup">Work Experience</label>
                    <textarea 
                        name="experience" 
                        value={formData.experience} 
                        onChange={handleChange} 
                        placeholder="e.g., Intern at Company A, Role, Dates (One per line)" 
                        className="input" 
                        rows="4"
                        required 
                    />

                    <div className="update-profile-buttons" style={{marginTop: '20px'}}>
                        <button type="submit" className="button" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating Info...' : 'Update Profile Info'}
                        </button>
                    </div>
                </form>
               
                <hr style={{ margin: '30px 0' }} />
                <h2 className="update-profile-title" style={{ fontSize: '20px', border: 'none', marginBottom: '20px' }}>Manage Resume</h2>
                
                {formData.resumeUrl && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="button outline">View Current Resume</a>
                    </div>
                )}
                
                <label className="update-profile-fillup">Upload New Resume (PDF only, max 5MB)</label>
                <input 
                    type="file" 
                    name="resume" 
                    onChange={handleFileChange} 
                    className="input" 
                    accept="application/pdf" // Only allow PDF
                />
                
                <div className="update-profile-buttons" style={{marginTop: '10px'}}>
                    <button 
                        onClick={handleResumeUpload} 
                        className="button" 
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload New Resume'}
                    </button>
                    <Link to="/dashboard" className="button outline">Back to Dashboard</Link>
                </div>
                
            </div>
        </>
    );
}