// src/client/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate

import Dashboard from './Pages/dashboard.jsx'; // Student Dashboard
import './index.css';
import Login from './Pages/login.jsx';
import Register from './Pages/register.jsx';
import UserRegister from './Pages/studentRegister.jsx';
import CompanyRegister from './Pages/companyRegister.jsx';
import UpdateProfile from './Pages/updateProfile.jsx';
import BrowseJobs from './Pages/browseJobs.jsx';
import ViewResume from './Pages/viewResume.jsx';
import Home from './Pages/home.jsx';
import CompanyDashboard from './Pages/CompanyDashboard.jsx'; // Import the new component

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to a different page or show access denied if role doesn't match
    return <Navigate to="/" />; // Or a specific access denied page
  }

  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/company" element={<CompanyRegister />} />
        <Route path="/student" element={<UserRegister />} />
        <Route path="*" element={<Home />} /> {/* Catch-all route */}

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['student']}> {/* Only students can access */}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/company-dashboard"
          element={
            <PrivateRoute allowedRoles={['company']}> {/* Only companies can access */}
              <CompanyDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/dashboard/updateprofile" element={
          <PrivateRoute allowedRoles={['student']}> {/* Assuming only students update their profile for now */}
            <UpdateProfile />
          </PrivateRoute>
        } />
        <Route path="/dashboard/newJobs" element={
          <PrivateRoute allowedRoles={['student']}> {/* Only students browse jobs */}
            <BrowseJobs />
          </PrivateRoute>
        } />
        <Route path="/dashboard/resume" element={
          <PrivateRoute allowedRoles={['student']}> {/* Only students view their resume */}
            <ViewResume />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  </StrictMode>
);