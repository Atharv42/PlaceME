import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      background: '#f5f6fa',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{ fontSize: '80px', lineHeight: 1, marginBottom: '16px' }}>404</div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2c3e50', margin: '0 0 12px' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '32px', maxWidth: '360px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="button"
        style={{ textDecoration: 'none', padding: '12px 28px', fontSize: '15px' }}
      >
        Go to Home
      </Link>
    </div>
  );
}
