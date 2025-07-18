import React from 'react';
import LogoutButton from './Pages/logOutbutton';

export default function Header() {
    return(
        <>
        <header className="header">
            <div className="logo">PlaceME</div>
            <nav>
                <a href="/dashboard">Home</a>
                <a href="dashboard/updateprofile">My Profile</a>
                <LogoutButton />
            </nav>
        </header>
        </>
    )
}