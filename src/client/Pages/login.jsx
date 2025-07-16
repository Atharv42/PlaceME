import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login(){
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const Navigate = useNavigate();

    function handleSubmit(e){
        e.preventDefault();
        axios.post('http://localhost:3000/api/login', {email, password})
        .then(res => {
            console.log(res);
            Navigate('/dashboard'); // Redirect to dashboard on successful login
        })
        .catch(err => console.error(err));
    };
    return(
        <>
            <div className="login-container">
                <h2 className="login-title"> Login </h2>
                <form onSubmit={handleSubmit}>
                    <label className="login-label">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="input"/>
                    <br/>
                    <label className="login-label">Password</label>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required className="input"/>

                    <button className="login-button">Login</button>
                    <p className="register-link">Don't have an account? <a href="/register">Register  </a></p>
                </form>
            </div>
        </>
    );
}