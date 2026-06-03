
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Pages/Login.css'; 

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await axios.post('/api/forgot-password', { email });
            setMessage(res.data.message); 
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred. Please try again.');
            }
            console.error('Forgot password error:', err);
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
                <h2 className="login-title">Reset Your Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: '#555' }}>
                    Enter your email address below, and we'll send you a link to reset your password.
                </p>

                {message && <div className="login-success" style={{ marginBottom: '15px' }}>{message}</div>}
                {error && <div className="login-error" style={{ marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label className="login-label" htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                    <button className="login-button" type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="login-links">
                    <Link to="/login" className="login-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}