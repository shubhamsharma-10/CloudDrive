import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import authMiddleware from '../middlewares/auth.middleware.js';
import authController from '../controllers/auth.controller.js';
import config from '../config/config.js';

const authRouter = Router();

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.get('/me', authMiddleware, authController.getMe)

if (config.google.clientId && config.google.clientSecret) {
    authRouter.get('/google', passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    }));

    authRouter.get('/google/callback',
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${config.clientUrl}/login?error=auth_failed`
        }),
        (req, res) => {
            const user = req.user as any;
            // Use {id: user._id} to match your existing JWT format
            const token = jwt.sign({ id: user._id }, config.jwtSecret);
            res.redirect(`${config.clientUrl}?token=${token}`);
        }
    );
}

export default authRouter;