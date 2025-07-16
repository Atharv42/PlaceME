import react from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function companyRegister() {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = react.useState('');
    const [companyEmail, setCompanyEmail] = react.useState('');
    const [companyPassword, setCompanyPassword] = react.useState('');
    const [confirmPassword, setConfirmPassword] = react.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!companyName || !companyEmail || !companyPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }   else if (companyPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        } else if (companyPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        } else if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            alert('Please enter a valid email address');
            return;
        } else if (!/^[a-zA-Z]+$/.test(companyName) || !/^[a-zA-Z]+$/.test(companyName)) {
            alert('First and Last names should only contain letters');
            return;
        } else {
        axios.post('http://localhost:3000/api/companyRegister', {
            companyName,
            companyEmail,
            companyPassword,
        }).then(res => {
            console.log(res);
            alert('Company registered successfully');
            
            navigate('/login'); // Redirect to login page after successful registration
        }).catch(err => console.error(err));
    }
    };
    return (
        <>
            <div className="register-container">
                <h1>Register your Company with PlaceME!!!</h1>
                <form onSubmit={handleSubmit}>
                    <label className="register-label">Company Name</label>
                    <input onChange={(e) => setCompanyName(e.target.value)} required type="text" placeholder="Company Name" className="input" />
                    <br />
                    <label className="register-label">Email</label>
                    <input onChange={(e) => setCompanyEmail(e.target.value)} required type="email" placeholder="Email" className="input" />
                    <br />
                    <label className="register-label">Password</label>
                    <input onChange={(e) => setCompanyPassword(e.target.value)} required type="password" placeholder="Password" className="input" />
                    <br />
                    <label className="register-label">Confirm Password</label>
                    <input onChange={(e) => setConfirmPassword(e.target.value)} required type="password" placeholder="Confirm Password" className="input" />
                    <br />
                    <button className="register-button">Register</button>
                </form>
                <p className="login-link">Already have an account? <a href="/login">Login</a></p>
            </div>
        </>
    )
}
