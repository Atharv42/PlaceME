
import mongoose from 'mongoose';
import dotenv from 'dotenv';

export const connectDb = async () => {
    try {
        
        const conn = await mongoose.connect(process.env.MongoDB_URI);
      

        console.log(`Database connected successfully ${conn.connection.host}` );
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); 
    }
}