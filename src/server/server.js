import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import { connectDb } from './db.js';
import cors from 'cors';
import Company from './models/newCompany.js';
import Student from './models/newStudent-schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from './config.js';

app.use(express.json());
app.use(cors());

app.get('/login', (req, res) => {
    res.json({ message: "Login endpoint" });
});

app.post('/api/Studentregister', (req, res) => {
        Student.create(req.body)
        .then((data) => {
            console.log('User registered:', data);
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            data.password = hashedPassword;
            data.save();
            console.log('User registered with hashed password:', data);
            console.log('User registered successfully:', data);
            res.status(201).json({ message: "User registered successfully", data });
        })
        .catch((error) => {
            console.error('Error registering user:', error);
            res.status(500).json({ message: "Error registering user", error: error.message });
        })
    });

app.post('/api/companyRegister', async (req, res) => {
    const { companyName, companyEmail, companyPassword } = req.body;

    if (companyName && companyEmail && companyPassword) {
        try {
            const user = await Company.create({ companyName, companyEmail, companyPassword, createdAt: new Date(), updatedAt: new Date() });
            console.log(user);
            // Optionally, you can hash the password here if not done in the client
            const hashedPassword = bcrypt.hashSync(companyPassword, 10);
            // Save the user with the hashed password
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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const user = await Student.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
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

app.listen(3000, () => {
    connectDb();
    console.log('Server is running on port 3000');
    console.log('Visit http://localhost:3000/api/register to test the endpoint');
});

//REDACTED_ROTATE_THIS_PASSWORD