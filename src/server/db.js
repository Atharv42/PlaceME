import mongoose from 'mongoose';
import dotenv from 'dotenv';

export const connectDb = async () => {
    try {
        // Load environment variables from .env file
        
        // Connect to MongoDB using the connection string from the environment variable
        const conn = await mongoose.connect(process.env.MongoDB_URI);
        dotenv.config();
        // console.log(process.env.MongoDB_URI);

        console.log(`Database connected successfully ${conn.connection.host}` );
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process with failure
    }
}