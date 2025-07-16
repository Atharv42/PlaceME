import { Link } from 'react-router-dom';



export default function Register() {
    return (
        <>
            <div className="register-container">
                <h1 className="register-title">Register yourself to PlaceME!!!</h1>
                <h3 className="register-question">Who you are?</h3>
                <div className="register-options">
                <Link to="/student" className="button">student</Link>
                <Link to="/company" className="button">company</Link>
                </div>
                
                <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
                
             
            </div>
        </>
    )
}