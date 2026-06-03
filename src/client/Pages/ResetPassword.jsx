import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../Pages/Login.css'; 

export default function ResetPassword() {
    const { token } = useParams(); // Get token from URL
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
             setError('Password must be at least 6 characters long.');
             return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`/api/reset-password/${token}`, { password });
            setMessage(res.data.message);
           
            setTimeout(() => {
                navigate('/login', { state: { successMessage: res.data.message } });
            }, 2000); // 2 seconds delay
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to reset password. The link may be invalid or expired.');
            }
            console.error('Reset password error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                  Place<span className="accent">ME</span>
                </div>
                <h2 className="login-title">Set New Password</h2>

                {message && <div className="login-success" style={{ marginBottom: '15px' }}>{message}</div>}
                {error && <div className="login-error" style={{ marginBottom: '15px' }}>{error}</div>}

               
                {!message && (
                    <form onSubmit={handleSubmit}>
                        <label className="login-label" htmlFor="password">New Password</label>
                        <input
                            id="password"
                            type="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength="6"
                            required
                        />
                        <label className="login-label" htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="login-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength="6"
                            required
                        />
                        <button className="login-button" type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
                <div className="login-links">
                    <Link to="/login" className="login-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}