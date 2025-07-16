import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from './Pages/dashboard.jsx';
import './index.css';
import Login from './Pages/login.jsx';
import Register from './Pages/register.jsx';
import UserRegister from './Pages/studentRegister.jsx';
import CompanyRegister from './Pages/companyRegister.jsx';
import UpdateProfile from  './Pages/updateProfile.jsx';
import BrowseJobs from './Pages/browseJobs.jsx';
import ViewResume from './Pages/viewResume.jsx';


createRoot(document.getElementById('root')).render(
  <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
        <Route path="/company" element={<CompanyRegister />} />
        <Route path="/student" element={<UserRegister />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/dashboard/updateprofile" element={<UpdateProfile />} />
        <Route path="/dashboard/newJobs" element={<BrowseJobs />} />
        <Route path="/dashboard/resume" element={<ViewResume />} />
      </Routes>
    </Router>
  </>
  
)
