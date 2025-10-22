// src/server/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

export const connectDb = async () => {
    try {
        // Connect to MongoDB using the connection string from the environment variable
        // This will now work because server.js loaded the variables.
        const conn = await mongoose.connect(process.env.MongoDB_URI);
        
        // dotenv.config(); // <-- REMOVED FROM HERE. It was in the wrong place.

        console.log(`Database connected successfully ${conn.connection.host}` );
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process with failure
    }
}