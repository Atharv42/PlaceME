// src/server/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from './db.js';
import authRoutes from './Routes/authRoutes.js';
import jobRoutes from './Routes/jobRoutes.js';
import applicationRoutes from './Routes/applicationRoutes.js'; // Import the new application routes

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the PlaceME API');
});
app.use('/api', authRoutes);
app.use('/api', jobRoutes);
app.use('/api', applicationRoutes); // Use the new application routes

// Start server
app.listen(3000, () => {
    connectDb();
    console.log('Server started on http://localhost:3000');
});