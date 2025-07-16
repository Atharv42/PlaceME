import React from "react";
import Header from "../header.jsx";
import { Link } from 'react-router-dom'


export default function Dashboard() {
    return(
        <>
            <Header />
            <div class="dashboard-section">
            <h2>A quick glance at your application activities:</h2>
            <p><strong>Total Jobs Applied:</strong> 12</p>
            <p><strong>Shortlisted Applications:</strong> 3</p>
            <p><strong>Interviews Scheduled:</strong> 1</p>
            </div>

        
            <div class="dashboard-section">
            <h2>Your Upcoming Interviews</h2>
            <ul>
                <li>
                    <div class="list-item-details">
                        <strong>Software Engineer</strong> at Tech Solutions Inc.<br />
                        Date: July 15, 2025 | Time: 10:00 AM IST
                    </div>
                    <div class="list-item-action">
                        <a href="#" class="button">View Details</a>
                    </div>
                </li>
                <li>
                    <div class="list-item-details">
                        <strong>Data Analyst Intern</strong> at Data Insights Co.<br/>
                        Date: July 20, 2025 | Time: 02:30 PM IST
                    </div>
                    <div class="list-item-action">
                        <a href="#" class="button">View Details</a>
                    </div>
                </li>
            </ul>
            
            </div>

            <div class="dashboard-section">
            <h2>Recent Application Updates</h2>
            <ul>
                <li>
                    <div class="list-item-details">
                        <strong>Web Developer</strong> at Creative Agency - <span>Shortlisted</span>
                    </div>
                </li>
                <li>
                    <div class="list-item-details">
                        <strong>UX Designer</strong> at Innovate Corp - <span>Under Review</span>
                    </div>
                </li>
                <li>
                    <div class="list-item-details">
                        <strong>Marketing Intern</strong> at Global Brands - <span>Rejected</span>
                    </div>
                </li>
            </ul>
            <p className="view-all">
                <a href="#" className="button">View All Applications</a>
            </p>
            </div>

        
            <div class="dashboard-section quick-actions">
            <h2>What would you like to do?</h2>
            <div className="like-buttons">
                <Link to="/dashboard/newjobs" className="button">Browse Available Jobs</Link>
                <Link to="/dashboard/updateprofile" className="button">Update My Profile</Link>
                <Link to="/dashboard/resume" className="button">View My Resume</Link>    
            </div>
            </div>
        </>
    )
}