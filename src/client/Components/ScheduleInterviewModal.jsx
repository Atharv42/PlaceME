// src/client/Components/ScheduleInterviewModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../client/index.css'; // Import general styles

export default function ScheduleInterviewModal({
    applicationId,
    studentId,
    jobTitle,
    studentName,
    companyId,
    companyName, // <-- NEW PROP
    onClose, // Function to close the modal
    onInterviewScheduled // Callback after successful scheduling
}) {
    const [interviewData, setInterviewData] = useState({
        date: '',
        time: '',
        type: 'Virtual', // Default type
        link: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Get today's date in YYYY-MM-DD format for min attribute
        const today = new Date().toISOString().split('T')[0];

        // Clear form data and error when modal opens/changes application
        setInterviewData({
            date: today, // Default to today
            time: '10:00', // Default to a reasonable time
            type: 'Virtual',
            link: '',
        });
        setError('');
    }, [applicationId, studentId]); // Reset when applicationId or studentId changes

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

            // --- UPDATED PAYLOAD ---
            const payload = {
                applicationId,
                companyId,
                studentId,
                jobTitle,    // <-- ADDED
                companyName, // <-- ADDED
                date: interviewData.date,
                time: interviewData.time,
                type: interviewData.type,
                link: interviewData.link,
            };
            // --- END UPDATED PAYLOAD ---

            // --- DEBUGGING LOGS ---
            console.log('Sending interview payload:', payload); // Log the data being sent
            // --- END DEBUGGING LOGS ---

            const res = await axios.post('http://localhost:3000/api/interviews', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // --- DEBUGGING LOGS ---
            console.log('Interview scheduled successfully! Response:', res.data); // Log success response
            // --- END DEBUGGING LOGS ---

            alert('Interview scheduled successfully!'); // Alert is ok inside a modal flow
            onInterviewScheduled(res.data.interview); // Pass new interview data to parent
            onClose(); // Close modal
        } catch (err) {
            // --- DEBUGGING LOGS ---
            console.error('Error scheduling interview:', err); // Log the full error object
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
            }
            // --- END DEBUGGING LOGS ---

            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                // Don't alert error, show it in the modal
            } else {
                setError('Failed to schedule interview. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for min attribute
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
                        min={today} // Prevent scheduling in the past
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