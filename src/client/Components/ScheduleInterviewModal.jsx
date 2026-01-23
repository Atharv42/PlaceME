import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../client/index.css'; 

export default function ScheduleInterviewModal({
    applicationId,
    studentId,
    jobTitle,
    studentName,
    companyId,
    companyName, 
    onClose, 
    onInterviewScheduled 
}) {
    const [interviewData, setInterviewData] = useState({
        date: '',
        time: '',
        type: 'Virtual', 
        link: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
       
        const today = new Date().toISOString().split('T')[0];

        
        setInterviewData({
            date: today, 
            time: '10:00', 
            type: 'Virtual',
            link: '',
        });
        setError('');
    }, [applicationId, studentId]); 

    const handleChange = (e) => {
        setInterviewData({ ...interviewData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token missing. Please log in again.');
                setLoading(false);
                return;
            }

           
            const payload = {
                applicationId,
                companyId,
                studentId,
                jobTitle,    
                companyName,
                date: interviewData.date,
                time: interviewData.time,
                type: interviewData.type,
                link: interviewData.link,
            };
            
            console.log('Sending interview payload:', payload);

            const res = await axios.post('http://localhost:3000/api/interviews', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

           
            console.log('Interview scheduled successfully! Response:', res.data); 
           

            alert('Interview scheduled successfully!'); 
            onInterviewScheduled(res.data.interview); 
            onClose(); 
        } catch (err) {
            
            console.error('Error scheduling interview:', err); // Log the full error object
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
            }
            

            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                
            } else {
                setError('Failed to schedule interview. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Schedule Interview for {studentName} ({jobTitle})</h2>
                {error && <div className="login-error" style={{ textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <label className="login-label">Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={interviewData.date}
                        onChange={handleChange}
                        className="input"
                        min={today} 
                        required
                    />
                    <label className="login-label">Time:</label>
                    <input
                        type="time"
                        name="time"
                        value={interviewData.time}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                    <label className="login-label">Type:</label>
                    <select
                        name="type"
                        value={interviewData.type}
                        onChange={handleChange}
                        className="input"
                        required
                    >
                        <option value="Virtual">Virtual</option>
                        <option value="On-site">On-site</option>
                        <option value="Phone">Phone</option>
                    </select>
                    {interviewData.type === 'Virtual' && (
                        <>
                            <label className="login-label">Meeting Link:</label>
                            <input
                                type="url"
                                name="link"
                                value={interviewData.link}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., https://meet.google.com/..."
                                required
                            />
                        </>
                    )}
                    <div className="modal-actions">
                        <button type="submit" className="button" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Schedule Interview'}
                        </button>
                        <button type="button" className="button outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}