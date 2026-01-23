// src/client/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 

import Dashboard from './Pages/dashboard.jsx'; 
import './index.css';
import Login from './Pages/login.jsx';
import Register from './Pages/register.jsx';
import UserRegister from './Pages/studentRegister.jsx';
import CompanyRegister from './Pages/companyRegister.jsx';
import UpdateProfile from './Pages/updateProfile.jsx';
import BrowseJobs from './Pages/browseJobs.jsx';
import ViewResume from './Pages/viewResume.jsx';
import Home from './Pages/home.jsx';
import CompanyDashboard from './Pages/CompanyDashboard.jsx'; 
import ViewApplicants from './Pages/ViewApplicants.jsx'; 
import EditJob from './Pages/EditJob.jsx'; 
import ViewAllApplications from './Pages/ViewAllApplications.jsx'; 
import AdminRegister from './Pages/AdminRegister.jsx'; 
import AdminDashboard from './Pages/AdminDashboard.jsx'; 
import ForgotPassword from './Pages/ForgotPassword.jsx'; 
import ResetPassword from './Pages/ResetPassword.jsx';   
import EditCompanyProfile from './Pages/EditCompanyProfile.jsx'; // <-- IMPORT NEW
import ViewCompanyProfile from './Pages/ViewCompanyProfile.jsx'; // <-- IMPORT NEW


const PrivateRoute = ({ children, allowedRoles }) => {
  // ... (existing PrivateRoute code... no changes)
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
        <Route path="/admin-register" element={<AdminRegister />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/reset-password/:token" element={<ResetPassword />} /> 
        <Route path="*" element={<Home />} /> 

      
        <Route
          path="/admin-dashboard"
          element={ <PrivateRoute allowedRoles={['admin']}> <AdminDashboard /> </PrivateRoute> }
        />

       
        <Route
          path="/company-dashboard"
          element={ <PrivateRoute allowedRoles={['company']}> <CompanyDashboard /> </PrivateRoute> }
        />
        <Route
          path="/jobs/:jobId/applicants"
          element={ <PrivateRoute allowedRoles={['company']}> <ViewApplicants /> </PrivateRoute> }
        />
        <Route
          path="/jobs/:jobId/edit"
          element={ <PrivateRoute allowedRoles={['company']}> <EditJob /> </PrivateRoute> }
        />
        
        <Route
          path="/edit-company-profile"
          element={ <PrivateRoute allowedRoles={['company']}> <EditCompanyProfile /> </PrivateRoute> }
        />
       
        <Route
          path="/dashboard"
          element={ <PrivateRoute allowedRoles={['student']}> <Dashboard /> </PrivateRoute> }
        />
        <Route 
          path="/dashboard/updateprofile" 
          element={ <PrivateRoute allowedRoles={['student']}> <UpdateProfile /> </PrivateRoute> } 
        />
        <Route 
          path="/dashboard/newJobs" 
          element={ <PrivateRoute allowedRoles={['student']}> <BrowseJobs /> </PrivateRoute> } 
        />
        <Route 
          path="/dashboard/resume" 
          element={ <PrivateRoute allowedRoles={['student']}> <ViewResume /> </PrivateRoute> } 
        />
        <Route 
          path="/dashboard/applications" 
          element={ <PrivateRoute allowedRoles={['student']}> <ViewAllApplications /> </PrivateRoute> } 
        />
        
        
        <Route 
          path="/company-profile/:companyId" 
          element={ <PrivateRoute allowedRoles={['student', 'company', 'admin']}> <ViewCompanyProfile /> </PrivateRoute> } 
        />
         
      </Routes>
    </Router>
  </StrictMode>
);