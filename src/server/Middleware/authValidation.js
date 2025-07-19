// src/server/Middleware/authValidation.js

import joi from 'joi';

const StudentSignup = (req, res, next) => {
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
        resumeUrl: joi.string().uri().required()
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const CompanySignup = (req, res, next) => {
    const Schema = joi.object({
        companyName: joi.string().min(2).max(50).required(),
        companyEmail: joi.string().email().required(),
        companyPassword: joi.string().min(6).max(30).required(),
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const LoginValidation = (req, res, next) => {
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

// --- NEW CODE FOR STUDENT PROFILE UPDATE VALIDATION ---
const StudentProfileUpdateValidation = (req, res, next) => {
    const Schema = joi.object({
        firstName: joi.string().min(2).max(30).optional(), // Optional for update
        lastName: joi.string().min(2).max(30).optional(),
        email: joi.string().email().optional(), // Email might be unique, so careful with updates
        contact: joi.string().length(10).optional(),
        address: joi.string().min(2).max(100).optional(),
        education: joi.string().min(2).max(100).optional(),
        skills: joi.string().min(2).max(100).optional(),
        experience: joi.string().min(1).max(100).optional(),
        resumeUrl: joi.string().uri().optional()
        // password update would be a separate, more secure process
    }).min(1); // At least one field must be present for update

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
// --- END NEW CODE ---

export { StudentSignup, CompanySignup, LoginValidation, JobPostingValidation, ApplyJobValidation, StudentProfileUpdateValidation }; // Export new validation