import React from 'react';

export default function Header() {
    return(
        <>
        <header className="header">
            <div className="logo">PlaceME</div>
            <nav>
                <a href="/dashboard">Home</a>
                <a href="dashboard/updateprofile">My Profile</a>
                <a href="/login">Logout</a>
            </nav>
        </header>
        </>
    )
}