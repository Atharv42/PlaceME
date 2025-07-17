import Routes from 'express';
const routes = Routes.Router();
import { StudentSignup, CompanySignup, LoginValidation } from '../Middleware/authValidation.js';
import { Login, StudentSignUp, CompanySignUp } from '../Controllers/authController.js';
// import express from 'express';
// import cors from 'cors';


routes.post('/Studentregister', StudentSignup, StudentSignUp);

routes.post('/companyRegister', CompanySignup, CompanySignUp);

routes.post('/login', LoginValidation, Login);

export default routes;