import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from './db.js';
import authRoutes from './Routes/authRoutes.js';
import jobRoutes from './Routes/jobRoutes.js';
import applicationRoutes from './Routes/applicationRoutes.js';
import interviewRoutes from './Routes/interviewRoutes.js';
import studentRoutes from './Routes/studentRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import companyRoutes from './Routes/companyRoutes.js'; 
import path from 'path';
import { fileURLToPath } from 'url';

// --- Define __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load .env file ---
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS — allow the Vite dev server locally and the deployed Vercel frontend in production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the PlaceME API');
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: 'connected', routes: 'loaded' });
});
app.use('/api', authRoutes);
app.use('/api', jobRoutes);
app.use('/api', applicationRoutes);
app.use('/api', interviewRoutes);
app.use('/api', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', companyRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    connectDb();
    console.log(`Server started on http://localhost:${PORT}`);
});