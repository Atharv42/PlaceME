// src/client/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 

import Dashboard from './Pages/dashboard.jsx'; 
import './index.css';
import Login from './Pages/login.jsx';
import Register from './Pages/register.jsx';
import UserRegister from './Pages/StudentRegister.jsx';
import CompanyRegister from './Pages/CompanyRegister.jsx';
import UpdateProfile from './Pages/updateProfile.jsx';
import BrowseJobs from './Pages/browseJobs.jsx';
import ViewResume from './Pages/viewResume.jsx';
import Home from './Pages/home.jsx';
import CompanyDashboard from './Pages/CompanyDashboard.jsx'; 
import ViewApplicants from './Pages/ViewApplicants.jsx'; 
import EditJob from './Pages/EditJob.jsx'; 
import ViewAllApplications from './Pages/ViewAllApplications.jsx'; // <-- IMPORT NEW PAGE

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />; 
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
        <Route path="*" element={<Home />} /> 

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['student']}> 
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/company-dashboard"
          element={
            <PrivateRoute allowedRoles={['company']}> 
              <CompanyDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs/:jobId/applicants"
          element={
            <PrivateRoute allowedRoles={['company']}> 
              <ViewApplicants />
            </PrivateRoute>
          }
        />
        <Route
          path="/jobs/:jobId/edit"
          element={
            <PrivateRoute allowedRoles={['company']}> 
              <EditJob />
            </PrivateRoute>
          }
        />
        <Route path="/dashboard/updateprofile" element={
          <PrivateRoute allowedRoles={['student']}> 
            <UpdateProfile />
          </PrivateRoute>
        } />
        <Route path="/dashboard/newJobs" element={
          <PrivateRoute allowedRoles={['student']}> 
            <BrowseJobs />
          </PrivateRoute>
        } />
        <Route path="/dashboard/resume" element={
          <PrivateRoute allowedRoles={['student']}> 
            <ViewResume />
          </PrivateRoute>
        } />
        {/* --- NEW ROUTE --- */}
        <Route path="/dashboard/applications" element={
          <PrivateRoute allowedRoles={['student']}> 
            <ViewAllApplications />
          </PrivateRoute>
        } />
        {/* --- END NEW ROUTE --- */}
      </Routes>
    </Router>
  </StrictMode>
);