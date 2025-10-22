// src/server/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from './db.js';
import authRoutes from './Routes/authRoutes.js';
import jobRoutes from './Routes/jobRoutes.js';
import applicationRoutes from './Routes/applicationRoutes.js';
import interviewRoutes from './Routes/interviewRoutes.js';
import studentRoutes from './Routes/studentRoutes.js'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 

// --- THIS IS THE FIX ---
// Define __dirname (the path to your /server folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env file from the /server folder
dotenv.config({ path: path.join(__dirname, '.env') }); 
// --- END FIX ---

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the PlaceME API');
});
app.use('/api', authRoutes);
app.use('/api', jobRoutes);
app.use('/api', applicationRoutes);
app.use('/api', interviewRoutes);
app.use('/api', studentRoutes); 

// Start server
app.listen(3000, () => {
    connectDb();
    console.log('Server started on http://localhost:3000');
});