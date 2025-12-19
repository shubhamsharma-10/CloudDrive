import express from 'express';
import authRouter from './routes/auth.route.js';
import fileRouter from './routes/file.route.js';
import connectDB from './config/db.js';
import cors from 'cors';

const app = express();
connectDB()

app.use(cors());

app.use(express.json());
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello, world!'
    });
});

export default app;