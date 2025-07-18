import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import { connectDb } from './db.js';
import cors from 'cors';
// import Company from './models/Company.js';
// import Student from './models/Student.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import config from './config.js';
import auth from './Routes/authRoutes.js';

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Welcome to the PlaceME API');
});
app.use('/api', auth);

app.listen(3000, () => {
    connectDb();
    console.log('Server is running on port 3000');
    console.log('Visit http://localhost:3000/api/register to test the endpoint');
});

//REDACTED_ROTATE_THIS_PASSWORD