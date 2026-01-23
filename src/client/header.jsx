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