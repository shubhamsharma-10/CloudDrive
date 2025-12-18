import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(config.mongodb as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

export default connectDB;
