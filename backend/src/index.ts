import express from 'express';
import authRouter from './routes/auth.route.js';
import fileRouter from './routes/file.route.js';
import connectDB from './config/db.js';
import session from 'express-session';
import passport from './config/passport.js';
import config from './config/config.js';
import cors from 'cors';

const app = express();
connectDB()

app.use(cors());

app.use(express.json());
app.use(session({
    secret: config.google.clientSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello, world!'
    });
});

export default app;