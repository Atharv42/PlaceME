import joi from 'joi';

const StudentSignup = (req,res,next) => {
const Schema = joi.object({
  firstName: joi.string().min(2).max(30).required(),
  lastName: joi.string().min(2).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).max(30).required(),
  contact: joi.string().min(10).max(10).required(),
  address: joi.string().min(2).max(30).required(),
  education: joi.string().min(2).max(30).required(),
  skills: joi.string().min(2).max(30).required(),
  experience: joi.string().min(2).max(30).required(),
  resume: joi.string().min(2).max(30).required(),
});
    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

const CompanySignup = (req,res,next) => { 
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
}

const LoginValidation = (req,res,next) => { 
const Schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).max(30).required(),
});
    const { error } = Schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}


export { StudentSignup, CompanySignup, LoginValidation };