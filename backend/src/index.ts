import express from 'express';
import connectDB from './config/db.js';

const app = express();
connectDB()


app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello, world!'
    });
});

export default app;