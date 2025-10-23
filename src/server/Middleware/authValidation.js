// src/server/Middleware/authValidation.js

import joi from 'joi';

const StudentSignup = (req, res, next) => {
    // ... (existing StudentSignup code... no changes)
    // console.log("Attempting registration for:", email);
    const Schema = joi.object({
        firstName: joi.string().min(2).max(30).required(),
        lastName: joi.string().min(2).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required(),
        contact: joi.string().length(10).required(),
        address: joi.string().min(2).max(100).required(),
        education: joi.string().min(2).max(100).required(),
        skills: joi.string().min(2).max(100).required(),
        experience: joi.string().min(1).max(100).required(),
        resumeUrl: joi.string().uri().optional() 
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        console.error("Student Signup Error:", error); // Log the actual error
        res.status(500).json({ message: "Internal server error" });
    }
    next();
};

const CompanySignup = (req, res, next) => {
    // ... (existing CompanySignup code... no changes)
    const Schema = joi.object({
        companyName: joi.string().min(2).max(50).required(),
        companyEmail: joi.string().email().required(),
        companyPassword: joi.string().min(6).max(30).required(),
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        console.error("Company Signup Error:", error); // Log the actual error
    res.status(500).json({ message: "Internal server error" });
    }
    next();
};

// --- NEW VALIDATION ---
const AdminSignup = (req, res, next) => {
    const Schema = joi.object({
        adminName: joi.string().min(2).max(50).required(),
        adminEmail: joi.string().email().required(),
        adminPassword: joi.string().min(6).max(30).required(),
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
// --- END NEW VALIDATION ---

const LoginValidation = (req, res, next) => {
    // ... (existing LoginValidation code... no changes)
    const Schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).max(30).required(),
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const JobPostingValidation = (req, res, next) => {
    // ... (existing JobPostingValidation code... no changes)
    const Schema = joi.object({
        companyId: joi.string().required(),
        title: joi.string().min(3).max(100).required(),
        description: joi.string().min(10).required(),
        location: joi.string().min(2).max(100).required(),
        skillsRequired: joi.array().items(joi.string()).min(1).required(),
        deadline: joi.date().iso().greater('now').required(),
        postedDate: joi.date().iso().required(),
        company: joi.string().required()
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const ApplyJobValidation = (req, res, next) => {
    // ... (existing ApplyJobValidation code... no changes)
    const Schema = joi.object({
        jobId: joi.string().required(),
        studentId: joi.string().required(),
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const InterviewSchedulingValidation = (req, res, next) => {
    // ... (existing InterviewSchedulingValidation code... no changes)
    const Schema = joi.object({
        applicationId: joi.string().required(),
        companyId: joi.string().required(),
        studentId: joi.string().required(),
        jobTitle: joi.string().required(), 
        companyName: joi.string().required(), 
        date: joi.date().iso().greater('now').required(),
        time: joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), 
        type: joi.string().valid('Virtual', 'On-site', 'Phone').required(),
        link: joi.string().uri().when('type', { is: 'Virtual', then: joi.required(), otherwise: joi.optional().allow('') })
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const StudentProfileUpdateValidation = (req, res, next) => {
    // ... (existing StudentProfileUpdateValidation code... no changes)
    const Schema = joi.object({
        firstName: joi.string().min(2).max(30).optional(), 
        lastName: joi.string().min(2).max(30).optional(),
        email: joi.string().email().optional(), 
        contact: joi.string().length(10).optional(),
        address: joi.string().min(2).max(100).optional(),
        education: joi.string().min(2).max(100).optional(),
        skills: joi.string().min(2).max(100).optional(),
        experience: joi.string().min(1).max(100).optional(),
        resumeUrl: joi.string().uri().optional().allow('')
    }).min(1); 

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const UpdateStatusValidation = (req, res, next) => {
    // ... (existing UpdateStatusValidation code... no changes)
    const Schema = joi.object({
        status: joi.string().min(3).max(50).required()
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
const CompanyProfileUpdateValidation = (req, res, next) => {
    const Schema = joi.object({
        // companyName might be updatable, but needs care if used elsewhere
        // companyName: joi.string().min(2).max(50).optional(),
        website: joi.string().uri({ allowRelative: false }).allow('').optional(), // Allow empty string or valid URI
        description: joi.string().max(1000).allow('').optional(), // Max 1000 chars, allow empty
        logoUrl: joi.string().uri({ allowRelative: false }).allow('').optional(), // Allow empty string or valid URI
        // Don't allow changing email or password here
    }).min(1); // At least one field must be present for update

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
// --- END NEW VALIDATION ---

export {
    // ... (Keep ALL existing exports) ...
    StudentSignup,
    CompanySignup,
    AdminSignup,
    LoginValidation,
    JobPostingValidation,
    ApplyJobValidation,
    StudentProfileUpdateValidation,
    InterviewSchedulingValidation,
    UpdateStatusValidation,
    CompanyProfileUpdateValidation // <-- EXPORT NEW
};