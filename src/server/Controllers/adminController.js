// src/server/Controllers/adminController.js

import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Job from '../models/jobSchema.js';

// Get counts for dashboard widgets
export const getDashboardStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const companyCount = await Company.countDocuments();
        const pendingCompanyCount = await Company.countDocuments({ isVerified: false });
        const jobCount = await Job.countDocuments();

        res.status(200).json({
            students: studentCount,
            companies: companyCount,
            pendingCompanies: pendingCompanyCount,
            jobs: jobCount
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.status(200).json({ students });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all companies
export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().select('-companyPassword');
        res.status(200).json({ companies });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all jobs
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.status(200).json({ jobs });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Verify a company
export const verifyCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const company = await Company.findByIdAndUpdate(
            companyId,
            { isVerified: true },
            { new: true }
        );
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        res.status(200).json({ message: "Company verified successfully", company });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a student
export const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findByIdAndDelete(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        // You might also want to delete their applications
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a company
export const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const company = await Company.findByIdAndDelete(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        // You might also want to delete their jobs, applications, interviews
        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a job
export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findByIdAndDelete(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        // You might also want to delete applications for this job
        res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};