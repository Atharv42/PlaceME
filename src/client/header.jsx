import React from 'react';
import { useNavigate } from 'react-router-dom'; 
export default function Header() {
    const navigate = useNavigate(); 

    const handleLogout = () => {
       
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        
        navigate('/login');
    };

    return(
        <>
        <header className="header">
            <div className="logo">Place<span style={{ color: '#3b82f6' }}>ME</span></div>
            <nav>
                <a href="/dashboard">Home</a> 
                <a href="/dashboard/updateprofile">My Profile</a> 
                <button onClick={handleLogout} className="header-logout-button">Logout</button>
            </nav>
        </header>
        </>
    )
}