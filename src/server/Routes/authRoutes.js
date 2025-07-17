import Routes from 'express';
const routes = Routes.Router();
import config from '../config.js'; 
import Student from '../Models/Student.js';
import Company from '../Models/Company.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import express from 'express';
// import cors from 'cors';


routes.post('/Studentregister', (req, res) => {
    Student.create(req.body)
        .then((data) => {
            console.log('User registered:', data);
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            data.password = hashedPassword;
            data.save();
            console.log('User registered with hashed password:', data);
            res.status(201).json({ message: "User registered successfully", data });
        })
        .catch((error) => {
            console.error('Error registering user:', error);
            res.status(500).json({ message: "Error registering user", error: error.message });
        });
});

routes.post('/companyRegister', async (req, res) => {
    const { companyName, companyEmail, companyPassword } = req.body;

    if (companyName && companyEmail && companyPassword) {
        try {
            const user = await Company.create({ companyName, companyEmail, companyPassword, createdAt: new Date(), updatedAt: new Date() });
            console.log(user);
            const hashedPassword = bcrypt.hashSync(companyPassword, 10);
            user.companyPassword = hashedPassword;
            await user.save();
            res.status(201).json({ message: "Company registered successfully", user });
        } catch (error) {
            console.error('Error registering company:', error);
            res.status(500).json({ message: "Error registering company", error: error.message });
        }
    } else {
        res.status(400).json({ message: "Invalid company details" });
    }
});

routes.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const user = await Student.findOne({ email }) || await Company.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password) || await bcrypt.compare(password, user.companyPassword);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      // If we reach this point, the password is valid, so we can generate a JWT token
      const token = jwt.sign({ userId: user._id }, config.secretKey, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});

export default routes;