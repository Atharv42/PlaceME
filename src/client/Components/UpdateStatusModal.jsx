// src/client/Components/UpdateStatusModal.jsx
import React, { useState } from 'react';
import '../index.css';

export default function UpdateStatusModal({
    application, // Pass the whole application object
    onClose,
    onSave
}) {
    const [newStatus, setNewStatus] = useState(application.status || 'Applied');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // onSave is the function that will make the API call
        await onSave(newStatus); 
        setLoading(false);
        onClose(); // Close the modal after saving
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Update Status for {application.studentName}</h2>
                <p><strong>Job:</strong> {application.jobTitle}</p>
                <p><strong>Current Status:</strong> {application.status}</p>
                
                <form onSubmit={handleSubmit}>
                    <label className="login-label">New Status:</label>
                    <select
                        name="status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="input"
                        required
                    >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hired">Hired</option>
                    </select>

                    <div className="modal-actions">
                        <button type="submit" className="button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Status'}
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