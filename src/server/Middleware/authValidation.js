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
        resumeUrl: joi.string().uri().required() // Corrected field name
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
        skillsRequired: joi.array().items(joi.string()).min(1).required(), // Expect an array of strings
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
        // status is typically 'Pending' or 'Applied' and set by default on backend
        // appliedDate is typically set by default on backend
    });

    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};


export { StudentSignup, CompanySignup, LoginValidation, JobPostingValidation, ApplyJobValidation }; 