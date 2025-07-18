// src/client/header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Header() {
    const navigate = useNavigate(); // Initialize navigate hook

    const handleLogout = () => {
        // Clear all relevant items from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        // Redirect to the login page
        navigate('/login');
    };

    return(
        <>
        <header className="header">
            <div className="logo">PlaceME</div>
            <nav>
                <a href="/dashboard">Home</a> 
                <a href="/dashboard/updateprofile">My Profile</a> 
                <button onClick={handleLogout} className="header-logout-button">Logout</button>
            </nav>
        </header>
        </>
    )
}