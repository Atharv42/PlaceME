import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function userRegister() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [contact, setContact] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [education, setEducation] = React.useState('');
    const [skills, setSkills] = React.useState('');
    const [experience, setExperience] = React.useState('');
    const [resumeUrl, setResumeUrl] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if(!firstName || !lastName || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }   else if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        } else if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            alert('Please enter a valid email address');
            return;
        } else if (!/^[a-zA-Z]+$/.test(firstName) || !/^[a-zA-Z]+$/.test(lastName)) {
            alert('First and Last names should only contain letters');
            return;
        } else {
        axios.post('http://localhost:3000/api/Studentregister', {firstName, lastName, email, password, confirmPassword})
        .then(res => console.log(res))
        .catch(err => console.error(err));
        console.log('User registered:', { firstName, lastName, email, password, confirmPassword });
        navigate('/login'); // Redirect to login page after successful registration
        }
    }
    return (
        <>
            <div className="register-container">
                <h2 className="register-title"> Register </h2>
                <form onSubmit={handleSubmit}>
                    <label className="register-label">First Name</label>
                    <input onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="First Name" className="input" />
                    <br />

                    <label className="register-label">Last Name</label>
                    <input onChange={(e) => setLastName(e.target.value)} type="text" placeholder="Last Name" className="input" />
                    <br />

                    <label className="register-label">Contact No.</label>
                    <input onChange={(e) => setContact(e.target.value)} type="text" placeholder="Contact No." className="input" />
                    <br />

                    <label className="register-label">Address</label>
                    <input onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Address" className="input" />
                    <br />

                    <label className="register-label">Education</label>
                    <input onChange={(e) => setEducation(e.target.value)} type="text" placeholder="Education" className="input" />
                    <br />

                    <label className="register-label">Skills</label>
                    <input onChange={(e) => setSkills(e.target.value)} type="text" placeholder="Skills" className="input" />
                    <br />

                    <label className="register-label">Experience</label>
                    <input onChange={(e) => setExperience(e.target.value)} type="text" placeholder="Experience" className="input" />
                    <br />

                    <label className="register-label">Resume URL</label>
                    <input onChange={(e) => setResumeUrl(e.target.value)} type="text" placeholder="URL" className="input" />
                    <br />

                    <label className="register-label">Email</label>
                    <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="input" />
                    <br />

                    <label className="register-label">Password</label>
                    <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="input" />
                    <br />

                    <label className="register-label">Confirm Password</label>
                    <input onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" className="input" />
                    
                    <button className="register-button">Register</button>
                    <p className="login-link">Already have an account? <a href="/login">Login</a></p>
                </form>
            </div>
        </>
    )

};